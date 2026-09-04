import { PrismaClient } from "@prisma/client";
import { fillJurisdiction } from "../src/lib/jurisdiction.ts";

const prisma = new PrismaClient();
const all = await prisma.customer.findMany({ select: { id: true, region: true, jurisdiction: true } });
let updated = 0, skipped = 0, needsReview = 0;
const samples: { region: string; jurisdiction: string }[] = [];
for (const c of all) {
  const next = fillJurisdiction(c.region, c.jurisdiction);
  if (next === (c.jurisdiction || "")) { skipped++; continue; }
  await prisma.customer.update({ where: { id: c.id }, data: { jurisdiction: next } });
  updated++;
  if (next === "확인 필요") needsReview++;
  if (samples.length < 15) samples.push({ region: c.region, jurisdiction: next });
}
console.log(JSON.stringify({ total: all.length, updated, skipped, needsReview, samples }, null, 2));
await prisma.$disconnect();
