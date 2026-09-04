import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { mapRow, type CustomerInput } from "./csv";

export const SHEET_TAB = "2차";
export const SOURCE_RELATIVE = path.join("data", "google-source.xlsx");

export function resolveSourcePath(cwd = process.cwd()): string {
  return path.resolve(cwd, SOURCE_RELATIVE);
}

function cellToString(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  }
  if (typeof v === "number") {
    // Excel serial date heuristic
    if (v > 20000 && v < 80000) {
      const epoch = new Date(Date.UTC(1899, 11, 30));
      const dt = new Date(epoch.getTime() + v * 86400000);
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
      const d = String(dt.getUTCDate()).padStart(2, "0");
      return `${y}.${m}.${d}`;
    }
    return String(v);
  }
  return String(v).trim();
}

export type ParsedSheet = {
  rows: CustomerInput[];
  sheetRows: number;
  sourceFile: string;
  sourceUpdatedAt: string | null;
};

export function parseGoogleSourceXlsx(
  filePath: string,
  options?: { assigneeContains?: string; all?: boolean }
): ParsedSheet {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `미러 파일이 없습니다: ${filePath}\n실장님에게 「시트 동기화」를 요청해 data/google-source.xlsx 를 갱신해 주세요.`
    );
  }

  const stat = fs.statSync(filePath);
  const wb = XLSX.readFile(filePath, { cellDates: true });
  const sheetName =
    wb.SheetNames.find((n) => n.trim() === SHEET_TAB) ||
    wb.SheetNames.find((n) => n.includes(SHEET_TAB));
  if (!sheetName) {
    throw new Error(`시트 탭「${SHEET_TAB}」을 찾을 수 없습니다. 있는 탭: ${wb.SheetNames.join(", ")}`);
  }

  const sheet = wb.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | Date | null)[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  if (!matrix.length) {
    return {
      rows: [],
      sheetRows: 0,
      sourceFile: filePath,
      sourceUpdatedAt: stat.mtime.toISOString(),
    };
  }

  const headers = (matrix[0] || []).map((h) => cellToString(h));
  const all = options?.all === true;
  const filter = all ? "" : (options?.assigneeContains ?? "김도현");

  const rows: CustomerInput[] = [];
  let sheetRows = 0;
  for (let i = 1; i < matrix.length; i++) {
    const values = (matrix[i] || []).map((c) => cellToString(c));
    if (!values.some((v) => v.trim())) continue;
    sheetRows++;
    const row = mapRow(headers, values);
    if (!row) continue;
    if (filter && !row.assignee.includes(filter)) continue;
    rows.push(row);
  }

  return {
    rows,
    sheetRows,
    sourceFile: filePath,
    sourceUpdatedAt: stat.mtime.toISOString(),
  };
}
