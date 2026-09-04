/**
 * 개인회생 관할 법원 매핑 — 초안(실무 확인 권장)
 *
 * Draft region → court mapper for 개인회생 jurisdiction auto-fill.
 * NOT official legal advice. Always verify against current court practice
 * before filing. Mappings last reviewed as draft for 2026-03+ 대구회생 등.
 */

export const JURISDICTION_NEEDS_REVIEW = "확인 필요";

/** Normalize for keyword contains matching: trim, remove spaces, lowercase. */
export function normalizeRegionKey(region: string): string {
  return String(region || "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

type Rule = { keywords: string[]; court: string };

/**
 * Keyword rules — longest / most-specific keywords should be listed first
 * within and across groups. Matched via normalized contains.
 */
const CITY_RULES: Rule[] = [
  // —— 수원회생법원 (경기 남부; 경기광주는 특수 처리) ——
  {
    keywords: [
      "경기광주",
      "광주시경기",
      "수원",
      "오산",
      "용인",
      "화성",
      "성남",
      "하남",
      "평택",
      "이천",
      "안산",
      "광명",
      "시흥",
      "안성",
      "안양",
      "과천",
      "의왕",
      "군포",
      "여주",
      "양평",
    ],
    court: "수원회생법원",
  },
  // —— 인천지방법원 ——
  {
    keywords: ["인천", "부천", "김포", "강화"],
    court: "인천지방법원",
  },
  // —— 의정부지방법원 ——
  {
    keywords: [
      "의정부",
      "남양주",
      "구리",
      "가평",
      "고양",
      "파주",
      "양주",
      "동두천",
      "포천",
      "연천",
      "교하",
    ],
    court: "의정부지방법원",
  },
  // —— 부산회생법원 (부산 + 울산/경남 초안) ——
  {
    keywords: [
      "부산",
      "울산",
      "창원",
      "김해",
      "양산",
      "진주",
      "거제",
      "통영",
      "사천",
      "밀양",
      "거창",
      "함안",
      "창녕",
      "남해",
      "하동",
      "산청",
      "함양",
      "합천",
      "의령",
    ],
    court: "부산회생법원",
  },
  // —— 대구회생법원 (대구 + 경북; 2026-03+ 초안) ——
  {
    keywords: [
      "대구",
      "포항",
      "구미",
      "경주",
      "안동",
      "김천",
      "영주",
      "상주",
      "문경",
      "경산",
      "영천",
      "칠곡",
      "의성",
      "청도",
      "고령",
      "성주",
      "예천",
      "봉화",
      "울진",
      "울릉",
      "청송",
      "영덕",
      "영양",
    ],
    court: "대구회생법원",
  },
  // —— 대전회생법원 (대전/세종/충남/충북) ——
  {
    keywords: [
      "대전",
      "세종",
      "천안",
      "아산",
      "공주",
      "보령",
      "서산",
      "논산",
      "계룡",
      "당진",
      "금산",
      "부여",
      "서천",
      "청양",
      "홍성",
      "예산",
      "태안",
      "청주",
      "충주",
      "제천",
      "보은",
      "옥천",
      "영동",
      "증평",
      "진천",
      "괴산",
      "음성",
      "단양",
    ],
    court: "대전회생법원",
  },
  // —— 광주회생법원 (광주광역시·전남·전북·제주) ——
  {
    keywords: [
      "광주광역시",
      "광주광",
      "목포",
      "여수",
      "순천",
      "나주",
      "광양",
      "담양",
      "곡성",
      "구례",
      "고흥",
      "보성",
      "화순",
      "장흥",
      "강진",
      "해남",
      "영암",
      "무안",
      "함평",
      "영광",
      "장성",
      "완도",
      "진도",
      "신안",
      "전주",
      "익산",
      "군산",
      "정읍",
      "남원",
      "김제",
      "완주",
      "진안",
      "무주",
      "장수",
      "임실",
      "순창",
      "고창",
      "부안",
      "제주",
      "서귀포",
    ],
    court: "광주회생법원",
  },
  // —— 춘천지방법원 강릉지원 (강릉권 6곳) ——
  {
    keywords: ["강릉", "동해", "삼척", "속초", "양양"],
    court: "춘천지방법원 강릉지원",
  },
  // —— 춘천지방법원 (그 외 강원) ——
  {
    keywords: [
      "춘천",
      "원주",
      "태백",
      "홍천",
      "횡성",
      "영월",
      "평창",
      "정선",
      "철원",
      "화천",
      "양구",
      "인제",
    ],
    court: "춘천지방법원",
  },
  // —— 서울회생법원 (서울 키워드는 짧게 마지막에 가깝게 — 특수 처리에서 먼저) ——
  {
    keywords: ["서울"],
    court: "서울회생법원",
  },
];

/** Flat list sorted by keyword length desc for longest-first match. */
const FLAT_KEYWORDS: { keyword: string; court: string }[] = (() => {
  const items: { keyword: string; court: string }[] = [];
  for (const rule of CITY_RULES) {
    for (const kw of rule.keywords) {
      items.push({ keyword: normalizeRegionKey(kw), court: rule.court });
    }
  }
  items.sort((a, b) => b.keyword.length - a.keyword.length);
  return items;
})();

const PROVINCE_ONLY: Record<string, string> = {
  경남: "부산회생법원",
  경상남도: "부산회생법원",
  경북: "대구회생법원",
  경상북도: "대구회생법원",
  충남: "대전회생법원",
  충청남도: "대전회생법원",
  충북: "대전회생법원",
  충청북도: "대전회생법원",
  전남: "광주회생법원",
  전라남도: "광주회생법원",
  전북: "광주회생법원",
  전라북도: "광주회생법원",
  강원: "춘천지방법원",
  강원도: "춘천지방법원",
  제주도: "광주회생법원",
  제주특별자치도: "광주회생법원",
};

function isProvinceOnly(norm: string): string | null {
  for (const [prov, court] of Object.entries(PROVINCE_ONLY)) {
    const p = normalizeRegionKey(prov);
    if (norm === p) return court;
  }
  // "경기도" / "경기" alone → needs review
  if (norm === "경기" || norm === "경기도") return JURISDICTION_NEEDS_REVIEW;
  return null;
}

/** 광주 모호성: 광역시 vs 경기광주 vs plain 광주 */
function resolveGwangju(norm: string, raw: string): string | null {
  const hasGwangju = norm.includes("광주") || raw.includes("광주");
  if (!hasGwangju) return null;

  // 경기광주 / 광주+경기 → 수원
  if (
    norm.includes("경기광주") ||
    (norm.includes("광주") && norm.includes("경기")) ||
    /광주시에\s*경기/.test(raw)
  ) {
    return "수원회생법원";
  }

  // 광주광역시 / 광주광 / 광주시+구 → 광주회생
  if (
    norm.includes("광주광역시") ||
    norm.includes("광주광") ||
    /광주시(남|북|동|서|광산)?구/.test(norm) ||
    norm.includes("광역시") && norm.includes("광주")
  ) {
    return "광주회생법원";
  }

  // plain 광주 / 광주시 alone → ambiguous
  if (norm === "광주" || norm === "광주시" || /^광주시?$/.test(norm)) {
    return JURISDICTION_NEEDS_REVIEW;
  }

  // 광주가 포함되지만 다른 도시 키워드가 더 길 수 있음 → null로 넘겨 일반 매칭
  return null;
}

/** 고성: 강원 vs 경남 모호 */
function resolveGoseong(norm: string): string | null {
  if (!norm.includes("고성")) return null;
  if (norm.includes("강원")) return "춘천지방법원 강릉지원";
  if (norm.includes("경남") || norm.includes("경상남")) return "부산회생법원";
  // plain 고성 → 확인 필요
  if (norm === "고성" || norm === "고성군") return JURISDICTION_NEEDS_REVIEW;
  // 다른 텍스트와 함께면 일반 규칙에 맡김 (경남 목록에 고성은 일부러 제외)
  if (norm.includes("고성") && !norm.includes("강원") && !norm.includes("경남")) {
    return JURISDICTION_NEEDS_REVIEW;
  }
  return null;
}

/**
 * Resolve 관할 court label from a free-text region.
 * Returns court name, `확인 필요` if unmatched/ambiguous, or "" if region empty.
 */
export function resolveJurisdiction(region: string): string {
  const raw = String(region || "").trim();
  if (!raw) return "";

  const norm = normalizeRegionKey(raw);

  // Province-only strings
  const prov = isProvinceOnly(norm);
  if (prov) return prov;

  // Special: 광주 ambiguity
  const gj = resolveGwangju(norm, raw);
  if (gj) return gj;

  // Special: 고성 ambiguity
  const gs = resolveGoseong(norm);
  if (gs) return gs;

  // Longest-keyword-first contains match
  for (const { keyword, court } of FLAT_KEYWORDS) {
    if (!keyword) continue;
    if (norm.includes(keyword)) return court;
  }

  // Also try raw Korean contains without lowercasing (Korean unaffected, but keep)
  for (const { keyword, court } of FLAT_KEYWORDS) {
    if (!keyword) continue;
    if (raw.replace(/\s+/g, "").includes(keyword)) return court;
  }

  return JURISDICTION_NEEDS_REVIEW;
}

/**
 * If jurisdiction is empty, fill from region via resolveJurisdiction.
 * Manual non-empty jurisdiction is preserved.
 */
export function fillJurisdiction(
  region: string,
  jurisdiction?: string | null
): string {
  const existing = String(jurisdiction ?? "").trim();
  if (existing) return existing;
  return resolveJurisdiction(region);
}

export function isJurisdictionNeedsReview(jurisdiction: string): boolean {
  return String(jurisdiction || "").trim() === JURISDICTION_NEEDS_REVIEW;
}
