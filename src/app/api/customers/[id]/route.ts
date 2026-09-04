import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeStatus } from "@/lib/constants";
import { normalizeManageMonth, resolveManageMonth } from "@/lib/manageMonth";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = await req.json();
  const data: Record<string, string> = {};
  for (const key of [
    "name",
    "phone",
    "appliedAt",
    "manageMonth",
    "assignee",
    "status",
    "region",
    "debtAmount",
    "job",
    "source",
    "memo",
  ] as const) {
    if (body[key] !== undefined) {
      if (key === "status") {
        data[key] = normalizeStatus(String(body[key]));
      } else if (key === "manageMonth") {
        data[key] = normalizeManageMonth(String(body[key]));
      } else {
        data[key] = String(body[key]).trim();
      }
    }
  }

  // If appliedAt changed and manageMonth not explicitly set, auto-fill only when empty
  if (data.appliedAt !== undefined && data.manageMonth === undefined) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (existing && !existing.manageMonth) {
      data.manageMonth = resolveManageMonth("", data.appliedAt);
    }
  }

  const customer = await prisma.customer.update({ where: { id }, data });
  return NextResponse.json(customer);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
