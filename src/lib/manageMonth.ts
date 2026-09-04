/**
 * Derive YYYY-MM manage month from appliedAt-like date strings.
 * Supports: 2026-09-02, 2026.09.02, 2026/09/02, 09.02, 9/2, etc.
 * If only M.D (no year), assume 2026 (seed-data era).
 * If unparseable, return "" (UI can set).
 */

const DEFAULT_YEAR = 2026;

/** Current calendar month YYYY-MM in Asia/Seoul. */
export function currentManageMonth(now = new Date()): string {
  // Asia/Seoul = UTC+9
  const seoul = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = seoul.getUTCFullYear();
  const m = String(seoul.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Parse appliedAt / date string → YYYY-MM, or "" if cannot parse.
 */
export function deriveManageMonth(appliedAt: string, fallbackYear = DEFAULT_YEAR): string {
  const s = String(appliedAt || "").trim();
  if (!s) return "";

  // YYYY-MM or YYYY-MM-DD (or with . /)
  let m = s.match(/^(\d{4})[.\-\/](\d{1,2})(?:[.\-\/]\d{1,2})?/);
  if (m) {
    const month = Number(m[2]);
    if (month >= 1 && month <= 12) {
      return `${m[1]}-${String(month).padStart(2, "0")}`;
    }
  }

  // M.D or M/D or M-D (no year) — assume fallbackYear
  m = s.match(/^(\d{1,2})[.\-\/](\d{1,2})(?:[.\-\/]\d{1,4})?$/);
  if (m) {
    const month = Number(m[1]);
    const day = Number(m[2]);
    // Prefer month-first (Korean style); if first > 12 treat as day.month (unlikely)
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${fallbackYear}-${String(month).padStart(2, "0")}`;
    }
  }

  // YYYYMMDD
  m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m) {
    const month = Number(m[2]);
    if (month >= 1 && month <= 12) {
      return `${m[1]}-${m[2]}`;
    }
  }

  return "";
}

/** Normalize a manageMonth value to YYYY-MM or "". */
export function normalizeManageMonth(raw: string): string {
  const s = String(raw || "").trim();
  if (!s) return "";
  const m = s.match(/^(\d{4})[.\-\/]?(\d{1,2})$/);
  if (m) {
    const month = Number(m[2]);
    if (month >= 1 && month <= 12) {
      return `${m[1]}-${String(month).padStart(2, "0")}`;
    }
  }
  return deriveManageMonth(s) || s;
}

/** Extract YYYY-MM from appliedAt for 신청월 filter (same parser). */
export function appliedMonthFromDate(appliedAt: string): string {
  return deriveManageMonth(appliedAt);
}

/**
 * Ensure manageMonth is set: use provided value, else derive from appliedAt.
 * Leaves "" if neither works (no forced calendar fallback).
 */
export function resolveManageMonth(manageMonth: string | undefined | null, appliedAt: string): string {
  const normalized = normalizeManageMonth(String(manageMonth || ""));
  if (normalized) return normalized;
  return deriveManageMonth(appliedAt);
}
