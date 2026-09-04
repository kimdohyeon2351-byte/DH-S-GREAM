import { normalizeStatus } from "./constants";

export type CustomerInput = {
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

export const HEADER_MAP: Record<string, keyof CustomerInput> = {
  이름: "name",
  표시명: "name",
  name: "name",
  연락처: "phone",
  전화번호: "phone",
  전화: "phone",
  phone: "phone",
  신청일: "appliedAt",
  "상담 신청 일자": "appliedAt",
  상담신청일자: "appliedAt",
  날짜: "appliedAt",
  appliedAt: "appliedAt",
  담당자: "assignee",
  assignee: "assignee",
  상담단계: "status",
  상태: "status",
  status: "status",
  "동미, 도현\n팀장님 상태열": "status",
  "동미, 도현 팀장님 상태열": "status",
  "동미, 도현팀장님 상태열": "status",
  지역: "region",
  region: "region",
  채무액: "debtAmount",
  debtAmount: "debtAmount",
  직업: "job",
  job: "job",
  유입경로: "source",
  타이틀: "source",
  source: "source",
  메모: "memo",
  "2차상담": "memo",
  "2차 상담": "memo",
  "2차 상담 내역": "memo",
  memo: "memo",
};

export function normalizeHeader(h: string): string {
  return String(h ?? "")
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
}

/** Digits-only phone for upsert matching. */
export function normalizePhone(phone: string): string {
  return String(phone || "").replace(/\D/g, "");
}

/**
 * Map a sheet/CSV row. When the same field maps from multiple columns
 * (e.g. two 담당자 columns), the last non-empty value wins.
 */
export function mapRow(headers: string[], values: string[]): CustomerInput | null {
  const raw: Partial<CustomerInput> = {};
  headers.forEach((h, i) => {
    const key = HEADER_MAP[normalizeHeader(h)];
    if (key) {
      const v = String(values[i] ?? "").trim();
      if (v !== "") raw[key] = v;
    }
  });
  if (!raw.name) return null;
  return {
    name: raw.name,
    phone: raw.phone || "",
    appliedAt: raw.appliedAt || "",
    assignee: raw.assignee || "",
    status: normalizeStatus(raw.status || "신규"),
    region: raw.region || "",
    debtAmount: raw.debtAmount || "",
    job: raw.job || "",
    source: raw.source || "",
    memo: raw.memo || "",
  };
}

export function parseCsvText(text: string): CustomerInput[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  const rows: CustomerInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = splitCsvLine(lines[i]);
    const row = mapRow(headers, vals);
    if (row) rows.push(row);
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}
