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
  "계약",
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
    "계약": "계약",
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
    "계약금 입금 완료": "계약",
    "착수금 입금 예정": "계약",
    "보류": "관리",
    "중복디비": "취소",
    "해피콜": "관리",
  };
  if (map[s]) return map[s];
  const compact = s.replace(/ /g, "");
  if (map[compact]) return map[compact];
  if ((STATUS_OPTIONS as readonly string[]).includes(s)) return s;
  return s;
}

export const STATUS_COLORS: Record<string, string> = {
  "신규": "bg-sky-100 text-sky-800",
  "부재": "bg-amber-100 text-amber-800",
  "통화예약": "bg-indigo-100 text-indigo-800",
  "재상담": "bg-violet-100 text-violet-800",
  "1차서류 안내": "bg-cyan-100 text-cyan-800",
  "1차 서류 도착": "bg-teal-100 text-teal-800",
  "관리": "bg-orange-100 text-orange-800",
  "내방상담": "bg-blue-100 text-blue-800",
  "출장상담": "bg-fuchsia-100 text-fuchsia-800",
  "계약": "bg-emerald-100 text-emerald-800",
  "수임완료": "bg-sky-100 text-sky-800",
  "취소": "bg-rose-100 text-rose-800",
  "자격불가": "bg-red-100 text-red-800",
  "진행불가": "bg-red-100 text-red-700",
  "종료": "bg-slate-100 text-slate-700",
};

/** Row/card background tone by status (desktop table + mobile cards). */
export function rowToneClass(status: string): string {
  const s = normalizeStatus(status);
  if (s === "취소" || s === "진행불가" || s === "자격불가") {
    return "bg-rose-50 hover:bg-rose-100/80";
  }
  if (s === "1차서류 안내") {
    return "bg-amber-50 hover:bg-amber-100/80";
  }
  if (s === "수임완료") {
    return "bg-sky-50 hover:bg-sky-100/80";
  }
  return "";
}
