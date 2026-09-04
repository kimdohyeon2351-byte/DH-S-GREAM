import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeStatus } from "@/lib/constants";

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
    "assignee",
    "status",
    "region",
    "debtAmount",
    "job",
    "source",
    "memo",
  ] as const) {
    if (body[key] !== undefined) {
      data[key] =
        key === "status"
          ? normalizeStatus(String(body[key]))
          : String(body[key]).trim();
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
