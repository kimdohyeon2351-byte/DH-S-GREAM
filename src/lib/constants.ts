export const STATUS_OPTIONS = [
  "신규",
  "부재",
  "통화예약",
  "재상담",
  "1차서류 안내",
  "1차 서류 도착",
  "관리",
  "내방상담",
  "출장상담",
  "수임완료",
  "취소",
  "자격불가",
  "진행불가",
  "종료",
] as const;

export type StatusOption = (typeof STATUS_OPTIONS)[number];

export function normalizeStatus(raw: string): string {
  const s = (raw || "").trim().replace(/\s+/g, " ");
  if (!s) return "신규";
  const map: Record<string, string> = {
    "진행 불가": "진행불가",
    "진행불가": "진행불가",
    "자격 불가": "자격불가",
    "자격불가": "자격불가",
    "1차 서류 안내": "1차서류 안내",
    "1차서류 안내": "1차서류 안내",
    "1차서류안내": "1차서류 안내",
    "1차 서류 도착": "1차 서류 도착",
    "관리건": "관리",
    "관리": "관리",
    "공유건": "관리",
    "2차 통화 전": "신규",
    "2차통화전": "신규",
    "부재": "부재",
    "취소": "취소",
    "신규": "신규",
    "통화예약": "통화예약",
    "재상담": "재상담",
    "내방상담": "내방상담",
    "출장상담": "출장상담",
    "계약": "수임완료",
    "종료": "종료",
    "수임완료": "수임완료",
    "수임 완료": "수임완료",

    "통화 예약": "통화예약",
    "내방 상담 예약": "내방상담",
    "내방상담 예약": "내방상담",
    "출장 상담 예약": "출장상담",
    "출상 상담 예약": "출장상담",
    "1차서류도착": "1차 서류 도착",
    "장기부재": "부재",
    "관리 중 부재": "관리",
    "계약금 입금 완료": "수임완료",
    "착수금 입금 예정": "수임완료",
    "계약금입금완료": "수임완료",
    "착수금입금예정": "수임완료",
    "계약완료": "수임완료",
    "계약 완료": "수임완료",
    "보류": "관리",
    "중복디비": "취소",
    "해피콜": "관리",
  };
  if (map[s]) return map[s];
  const compact = s.replace(/ /g, "");
  if (map[compact]) return map[compact];
  // Any remaining 계약 variants → 수임완료
  if (s.includes("계약") || compact.includes("계약")) return "수임완료";
  if ((STATUS_OPTIONS as readonly string[]).includes(s)) return s;
  return s;
}

export const STATUS_COLORS: Record<string, string> = {
  "신규": "bg-transparent text-slate-700",
  "부재": "bg-transparent text-slate-700",
  "통화예약": "bg-transparent text-slate-700",
  "재상담": "bg-transparent text-slate-700",
  "1차서류 안내": "bg-yellow-100 text-yellow-800",
  "1차 서류 도착": "bg-transparent text-slate-700",
  "관리": "bg-transparent text-slate-700",
  "내방상담": "bg-transparent text-slate-700",
  "출장상담": "bg-transparent text-slate-700",
  "수임완료": "bg-sky-100 text-sky-800",
  "취소": "bg-red-100 text-red-800",
  "자격불가": "bg-red-100 text-red-800",
  "진행불가": "bg-red-100 text-red-800",
  "종료": "bg-transparent text-slate-700",
};

/** Row/card background tone by status (desktop table + mobile cards). */
export function rowToneClass(status: string): string {
  const s = normalizeStatus(status);
  if (s === "취소" || s === "진행불가" || s === "자격불가") {
    return "bg-red-100 hover:bg-red-200/80";
  }
  if (s === "1차서류 안내") {
    return "bg-yellow-100 hover:bg-yellow-200/80";
  }
  if (s === "수임완료") {
    return "bg-sky-100 hover:bg-sky-200/80";
  }
  return "";
}

/** Memo field/box background tone by status (no hover; keeps light borders intact). */
export function memoToneClass(status: string): string {
  const s = normalizeStatus(status);
  if (s === "취소" || s === "진행불가" || s === "자격불가") {
    return "bg-red-100";
  }
  if (s === "1차서류 안내") {
    return "bg-yellow-100";
  }
  if (s === "수임완료") {
    return "bg-sky-100";
  }
  return "bg-transparent";
}
