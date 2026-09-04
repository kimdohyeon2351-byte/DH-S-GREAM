import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { normalizeStatus } from "../src/lib/constants";
import { deriveManageMonth } from "../src/lib/manageMonth";

const prisma = new PrismaClient();

type SeedRow = {
  날짜?: string;
  이름?: string;
  연락처?: string;
  채무액?: string;
  지역?: string;
  직업?: string;
  상태?: string;
  "2차상담"?: string;
  담당자?: string;
  타이틀?: string;
};

async function main() {
  const dataPath = path.join(__dirname, "data", "dohyun_2cha_sep.json");
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as SeedRow[];

  await prisma.customer.deleteMany();

  const mapped = raw
    .filter((r) => r.이름)
    .map((r) => {
      const appliedAt = (r.날짜 || "").trim();
      return {
        name: (r.이름 || "").trim(),
        phone: (r.연락처 || "").trim(),
        appliedAt,
        manageMonth: deriveManageMonth(appliedAt),
        assignee: (r.담당자 || "").trim(),
        status: normalizeStatus(r.상태 || "신규"),
        region: (r.지역 || "").trim(),
        debtAmount: String(r.채무액 ?? "").trim(),
        job: (r.직업 || "").trim(),
        source: (r.타이틀 || "").trim(),
        memo: (r["2차상담"] || "").trim(),
      };
    });

  const result = await prisma.customer.createMany({ data: mapped });
  console.log(`Seeded ${result.count} customers from dohyun_2cha_sep.json`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
