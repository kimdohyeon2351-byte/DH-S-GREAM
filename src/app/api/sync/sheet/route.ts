import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone, type CustomerInput } from "@/lib/csv";
import { parseGoogleSourceXlsx, resolveSourcePath } from "@/lib/sheetSync";

export const dynamic = "force-dynamic";

function pickPresent(sheetVal: string, existing: string): string {
  const v = (sheetVal || "").trim();
  return v !== "" ? v : existing;
}

type DbCustomer = {
  id: number;
  name: string;
  phone: string;
  appliedAt: string;
  assignee: string;
  status: string;
  region: string;
  debtAmount: string;
  job: string;
  source: string;
  memo: string;
};

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const allParam = url.searchParams.get("all") ?? body.all;
    const all =
      allParam === true || allParam === "true" || allParam === "1";

    let assigneeContains: string;
    if (all) {
      assigneeContains = "";
    } else if (url.searchParams.has("assigneeContains")) {
      assigneeContains = url.searchParams.get("assigneeContains") ?? "";
    } else if (Object.prototype.hasOwnProperty.call(body, "assigneeContains")) {
      assigneeContains = String(body.assigneeContains ?? "");
    } else {
      assigneeContains = "김도현";
    }

    const sourcePath = resolveSourcePath();
    const parsed = parseGoogleSourceXlsx(sourcePath, {
      assigneeContains,
      all,
    });

    const existingAll = await prisma.customer.findMany();
    const byPhone = new Map<string, DbCustomer>();
    const byNameDate = new Map<string, DbCustomer>();
    for (const c of existingAll) {
      const digits = normalizePhone(c.phone);
      if (digits && !byPhone.has(digits)) byPhone.set(digits, c);
      const key = `${c.name}||${c.appliedAt || ""}`;
      if (!byNameDate.has(key)) byNameDate.set(key, c);
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of parsed.rows) {
      const result = await upsertCustomer(row, byPhone, byNameDate);
      if (result === "created") created++;
      else if (result === "updated") updated++;
      else skipped++;
    }

    const filterLabel = all
      ? "all"
      : assigneeContains === ""
        ? "all(empty assigneeContains)"
        : `assigneeContains:${assigneeContains}`;

    return NextResponse.json({
      created,
      updated,
      skipped,
      total: created + updated,
      sheetRows: parsed.sheetRows,
      filter: filterLabel,
      sourceFile: parsed.sourceFile,
      sourceUpdatedAt: parsed.sourceUpdatedAt,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "시트 동기화 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function upsertCustomer(
  row: CustomerInput,
  byPhone: Map<string, DbCustomer>,
  byNameDate: Map<string, DbCustomer>
): Promise<"created" | "updated" | "skipped"> {
  const phoneDigits = normalizePhone(row.phone);
  let existing: DbCustomer | undefined;
  if (phoneDigits) existing = byPhone.get(phoneDigits);
  if (!existing) {
    existing = byNameDate.get(`${row.name}||${row.appliedAt || ""}`);
  }

  if (!existing) {
    const createdRow = await prisma.customer.create({ data: row });
    const mapped: DbCustomer = {
      id: createdRow.id,
      name: createdRow.name,
      phone: createdRow.phone,
      appliedAt: createdRow.appliedAt,
      assignee: createdRow.assignee,
      status: createdRow.status,
      region: createdRow.region,
      debtAmount: createdRow.debtAmount,
      job: createdRow.job,
      source: createdRow.source,
      memo: createdRow.memo,
    };
    if (phoneDigits) byPhone.set(phoneDigits, mapped);
    byNameDate.set(`${mapped.name}||${mapped.appliedAt}`, mapped);
    return "created";
  }

  const data = {
    name: pickPresent(row.name, existing.name),
    phone: pickPresent(row.phone, existing.phone),
    appliedAt: pickPresent(row.appliedAt, existing.appliedAt),
    assignee: pickPresent(row.assignee, existing.assignee),
    status: pickPresent(row.status, existing.status),
    region: pickPresent(row.region, existing.region),
    debtAmount: pickPresent(row.debtAmount, existing.debtAmount),
    job: pickPresent(row.job, existing.job),
    source: pickPresent(row.source, existing.source),
    memo: (row.memo || "").trim() !== "" ? row.memo : existing.memo,
  };

  const changed =
    data.name !== existing.name ||
    data.phone !== existing.phone ||
    data.appliedAt !== existing.appliedAt ||
    data.assignee !== existing.assignee ||
    data.status !== existing.status ||
    data.region !== existing.region ||
    data.debtAmount !== existing.debtAmount ||
    data.job !== existing.job ||
    data.source !== existing.source ||
    data.memo !== existing.memo;

  if (!changed) return "skipped";

  await prisma.customer.update({ where: { id: existing.id }, data });
  const next: DbCustomer = { ...existing, ...data };
  if (phoneDigits) byPhone.set(phoneDigits, next);
  byNameDate.set(`${next.name}||${next.appliedAt}`, next);
  return "updated";
}
