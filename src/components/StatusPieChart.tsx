"use client";

import { useMemo } from "react";
import { STATUS_OPTIONS } from "@/lib/constants";

type Props = {
  statusCounts: Record<string, number>;
};

/** Fixed hex colors matching CRM status scheme where possible. */
const STATUS_SLICE_COLORS: Record<string, string> = {
  "취소": "#ef4444",
  "진행불가": "#dc2626",
  "자격불가": "#b91c1c",
  "1차서류 안내": "#eab308",
  "수임완료": "#0ea5e9",
};

const PALETTE = [
  "#64748b", // slate
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#f97316", // orange
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#a855f7", // purple
  "#84cc16", // lime
  "#06b6d4", // cyan
  "#f43f5e", // rose
  "#78716c", // stone
  "#3b82f6", // blue
];

function colorForStatus(status: string, index: number): string {
  if (STATUS_SLICE_COLORS[status]) return STATUS_SLICE_COLORS[status];
  return PALETTE[index % PALETTE.length];
}

type Slice = {
  status: string;
  count: number;
  percent: number;
  color: string;
  /** SVG path for donut arc */
  path: string;
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  // Full circle special-case (single 100% slice)
  const sweep = endAngle - startAngle;
  if (sweep >= 359.999) {
    const o0 = polar(cx, cy, outerR, 0);
    const o1 = polar(cx, cy, outerR, 180);
    const i0 = polar(cx, cy, innerR, 0);
    const i1 = polar(cx, cy, innerR, 180);
    return [
      `M ${o0.x} ${o0.y}`,
      `A ${outerR} ${outerR} 0 1 1 ${o1.x} ${o1.y}`,
      `A ${outerR} ${outerR} 0 1 1 ${o0.x} ${o0.y}`,
      `M ${i0.x} ${i0.y}`,
      `A ${innerR} ${innerR} 0 1 0 ${i1.x} ${i1.y}`,
      `A ${innerR} ${innerR} 0 1 0 ${i0.x} ${i0.y}`,
      "Z",
    ].join(" ");
  }

  const large = sweep > 180 ? 1 : 0;
  const oStart = polar(cx, cy, outerR, startAngle);
  const oEnd = polar(cx, cy, outerR, endAngle);
  const iEnd = polar(cx, cy, innerR, endAngle);
  const iStart = polar(cx, cy, innerR, startAngle);

  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${iStart.x} ${iStart.y}`,
    "Z",
  ].join(" ");
}

export default function StatusPieChart({ statusCounts }: Props) {
  const { slices, total } = useMemo(() => {
    const entries = Object.entries(statusCounts || {}).filter(([, n]) => n > 0);
    const totalCount = entries.reduce((sum, [, n]) => sum + n, 0);

    // Prefer STATUS_OPTIONS order, then any extras alphabetically
    const orderIndex = (s: string) => {
      const i = (STATUS_OPTIONS as readonly string[]).indexOf(s);
      return i >= 0 ? i : 1000 + s.charCodeAt(0);
    };
    entries.sort((a, b) => orderIndex(a[0]) - orderIndex(b[0]));

    const CX = 100;
    const CY = 100;
    const OUTER = 90;
    const INNER = 52;
    let angle = 0;
    const built: Slice[] = entries.map(([status, count], i) => {
      const percent = totalCount > 0 ? (count / totalCount) * 100 : 0;
      const sweep = totalCount > 0 ? (count / totalCount) * 360 : 0;
      const start = angle;
      const end = angle + sweep;
      angle = end;
      return {
        status,
        count,
        percent,
        color: colorForStatus(status, i),
        path: donutArc(CX, CY, OUTER, INNER, start, end),
      };
    });

    return { slices: built, total: totalCount };
  }, [statusCounts]);

  if (total === 0) {
    return (
      <section
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        aria-label="상담단계 비율"
      >
        <h2 className="text-sm font-semibold text-slate-800 mb-2">상담단계 비율</h2>
        <p className="text-sm text-slate-500 py-6 text-center">표시할 고객이 없습니다.</p>
      </section>
    );
  }

  const title = `상담단계 비율 · 총 ${total}건`;

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-label={title}
    >
      <h2 className="text-sm font-semibold text-slate-800 mb-3">{title}</h2>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="shrink-0 w-44 h-44 sm:w-48 sm:h-48" role="img" aria-label={title}>
          <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
            {slices.map((s) => (
              <path
                key={s.status}
                d={s.path}
                fill={s.color}
                stroke="#fff"
                strokeWidth={1.5}
              >
                <title>{`${s.status}: ${s.count}건 (${s.percent.toFixed(1)}%)`}</title>
              </path>
            ))}
            <text
              x="100"
              y="96"
              textAnchor="middle"
              className="fill-slate-500"
              style={{ fontSize: 11 }}
            >
              총
            </text>
            <text
              x="100"
              y="114"
              textAnchor="middle"
              className="fill-slate-900"
              style={{ fontSize: 18, fontWeight: 700 }}
            >
              {total}
            </text>
          </svg>
        </div>
        <ul
          className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 text-sm"
          aria-label="상담단계별 건수와 비율"
        >
          {slices.map((s) => (
            <li key={s.status} className="flex items-center gap-2 min-w-0">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className="truncate text-slate-700" title={s.status}>
                {s.status}
              </span>
              <span className="ml-auto tabular-nums text-slate-500 whitespace-nowrap">
                {s.count}
                <span className="text-slate-400"> · </span>
                {s.percent.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
