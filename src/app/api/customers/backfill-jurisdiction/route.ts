import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fillJurisdiction, resolveJurisdiction } from "@/lib/jurisdiction";

export const dynamic = "force-dynamic";

/**
 * POST /api/customers/backfill-jurisdiction
 * Body: { force?: boolean } — if force, overwrite all from region; else only empty.
 * 「관할 다시 채우기」— 초안(실무 확인 권장)
 */
export async function POST(req: NextRequest) {
  let force = false;
  try {
    const body = await req.json();
    force = body?.force === true || body?.force === "true";
  } catch {
    force = false;
  }

  const all = await prisma.customer.findMany({
    select: { id: true, region: true, jurisdiction: true },
  });

  let updated = 0;
  let skipped = 0;
  let needsReview = 0;
  const samples: { region: string; jurisdiction: string }[] = [];

  for (const c of all) {
    const next = force
      ? resolveJurisdiction(c.region)
      : fillJurisdiction(c.region, c.jurisdiction);
    if (next === (c.jurisdiction || "")) {
      skipped++;
      continue;
    }
    await prisma.customer.update({
      where: { id: c.id },
      data: { jurisdiction: next },
    });
    updated++;
    if (next === "확인 필요") needsReview++;
    if (samples.length < 12) {
      samples.push({ region: c.region || "(빈 지역)", jurisdiction: next });
    }
  }

  return NextResponse.json({
    total: all.length,
    updated,
    skipped,
    needsReview,
    force,
    samples,
  });
}
