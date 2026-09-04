import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeStatus } from "@/lib/constants";
import {
  appliedMonthFromDate,
  resolveManageMonth,
} from "@/lib/manageMonth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const assignee = (searchParams.get("assignee") || "").trim();
  const status = (searchParams.get("status") || "").trim();
  const appliedMonth = (searchParams.get("appliedMonth") || "").trim();
  const manageMonth = (searchParams.get("manageMonth") || "").trim();

  const where: Record<string, unknown> = {};
  if (assignee) where.assignee = assignee;
  if (status) where.status = status;
  if (manageMonth) where.manageMonth = manageMonth;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { memo: { contains: q } },
    ];
  }

  // appliedMonth filters on appliedAt string prefix (YYYY-MM / YYYY.MM / etc.)
  // Fetch candidates then filter in JS when appliedMonth set, OR use OR contains patterns.
  const [allForMonths, customersRaw, totalRaw, assignees] =
    await Promise.all([
      prisma.customer.findMany({
        select: { appliedAt: true, manageMonth: true },
      }),
      prisma.customer.findMany({
        where,
        orderBy: [{ appliedAt: "desc" }, { id: "desc" }],
      }),
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        select: { assignee: true },
        distinct: ["assignee"],
        orderBy: { assignee: "asc" },
      }),
    ]);

  let customers = customersRaw;
  let total = totalRaw;

  if (appliedMonth) {
    customers = customersRaw.filter((c) => {
      const m = appliedMonthFromDate(c.appliedAt);
      return m === appliedMonth;
    });
    total = customers.length;
  }

  // statusCounts for the same filtered set as the list (q/assignee/status/appliedMonth/manageMonth)
  const statusCounts: Record<string, number> = {};
  for (const c of customers) {
    const key = c.status || "신규";
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  }

  const appliedMonthsSet = new Set<string>();
  const manageMonthsSet = new Set<string>();
  for (const row of allForMonths) {
    const am = appliedMonthFromDate(row.appliedAt);
    if (am) appliedMonthsSet.add(am);
    if (row.manageMonth) manageMonthsSet.add(row.manageMonth);
  }

  const sortDesc = (a: string, b: string) => (a < b ? 1 : a > b ? -1 : 0);

  return NextResponse.json({
    customers,
    total,
    assignees: assignees.map((a) => a.assignee).filter(Boolean),
    statusCounts,
    appliedMonths: Array.from(appliedMonthsSet).sort(sortDesc),
    manageMonths: Array.from(manageMonthsSet).sort(sortDesc),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const appliedAt = String(body.appliedAt || "").trim();
  const manageMonth = resolveManageMonth(
    body.manageMonth != null ? String(body.manageMonth) : "",
    appliedAt
  );
  const customer = await prisma.customer.create({
    data: {
      name: String(body.name || "").trim() || "이름없음",
      phone: String(body.phone || "").trim(),
      appliedAt,
      manageMonth,
      assignee: String(body.assignee || "").trim(),
      status: normalizeStatus(String(body.status || "신규")),
      region: String(body.region || "").trim(),
      debtAmount: String(body.debtAmount || "").trim(),
      job: String(body.job || "").trim(),
      source: String(body.source || "").trim(),
      memo: String(body.memo || "").trim(),
    },
  });
  return NextResponse.json(customer, { status: 201 });
}
