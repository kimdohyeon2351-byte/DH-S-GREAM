import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const assignee = (searchParams.get("assignee") || "").trim();
  const status = (searchParams.get("status") || "").trim();

  const where: Record<string, unknown> = {};
  if (assignee) where.assignee = assignee;
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { memo: { contains: q } },
    ];
  }

  const [customers, total, assignees, statusGroups] = await Promise.all([
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
    prisma.customer.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  return NextResponse.json({
    customers,
    total,
    assignees: assignees.map((a) => a.assignee).filter(Boolean),
    statusCounts: Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count._all])
    ),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const customer = await prisma.customer.create({
    data: {
      name: String(body.name || "").trim() || "이름없음",
      phone: String(body.phone || "").trim(),
      appliedAt: String(body.appliedAt || "").trim(),
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
