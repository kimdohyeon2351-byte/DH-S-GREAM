"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { STATUS_COLORS, STATUS_OPTIONS } from "@/lib/constants";
import type { Customer, ListResponse } from "./types";
import CustomerEditModal from "./CustomerEditModal";
import ImportModal from "./ImportModal";

export default function CrmBoard() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [editTarget, setEditTarget] = useState<Customer | null | undefined>(undefined);
  const [importOpen, setImportOpen] = useState(false);
  const [sheetSyncing, setSheetSyncing] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [quickSavingId, setQuickSavingId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQ) params.set("q", debouncedQ);
      if (status) params.set("status", status);
      const res = await fetch(`/api/customers?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as ListResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, status]);

  useEffect(() => {
    load();
  }, [load]);

  const statusFilterOptions = useMemo(() => {
    const fromData = Object.keys(data?.statusCounts || {});
    return Array.from(new Set([...STATUS_OPTIONS, ...fromData]));
  }, [data]);

  async function quickUpdate(id: number, patch: Partial<Customer>) {
    setQuickSavingId(id);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("fail");
      await load();
    } finally {
      setQuickSavingId(null);
    }
  }

  async function remove(id: number) {
    if (!confirm("이 고객을 삭제할까요?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    await load();
  }


  async function syncSheet() {
    if (sheetSyncing) return;
    if (!confirm("구글 시트 미러(data/google-source.xlsx)의 「2차」 탭에서 김도현 담당 행을 가져올까요?")) return;
    setSheetSyncing(true);
    setToast(null);
    try {
      const res = await fetch("/api/sync/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "시트 동기화 실패");
      const msg = `시트 동기화 완료: 신규 ${data.created}건 · 갱신 ${data.updated}건 · 변경없음 ${data.skipped}건 (시트 ${data.sheetRows}행 중)`;
      setToast({ type: "ok", text: msg });
      alert(msg);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "시트 동기화 실패";
      setToast({ type: "err", text: msg });
      alert(`동기화 실패\n${msg}`);
    } finally {
      setSheetSyncing(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600 font-medium">검색 (이름/연락처/메모)</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="검색어 입력"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600 font-medium">상담단계</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
              >
                <option value="">전체</option>
                {statusFilterOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                    {data?.statusCounts?.[s] != null ? ` (${data.statusCounts[s]})` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setImportOpen(true)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              CSV 가져오기
            </button>
            <button
              onClick={syncSheet}
              disabled={sheetSyncing}
              className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-2 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-60"
            >
              {sheetSyncing ? "시트 가져오는 중…" : "구글 시트에서 가져오기"}
            </button>
            <button
              onClick={() => setEditTarget(null)}
              className="rounded-xl bg-brand-600 text-white px-3 py-2 text-sm font-semibold hover:bg-brand-700"
            >
              + 고객 추가
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <p>
            검색 결과 <span className="font-semibold text-slate-900">{data?.total ?? 0}</span>건
            {loading ? " · 불러오는 중…" : ""}
          </p>
          <button onClick={load} className="text-brand-700 hover:underline text-xs">새로고침</button>
        </div>
      </section>

      {/* Desktop table */}
      <section className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="w-full">
          <table className="table-fixed w-full text-sm">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "36%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="px-1.5 py-2 font-medium whitespace-nowrap">번호</th>
                <th className="px-1.5 py-2 font-medium whitespace-nowrap">신청일</th>
                <th className="px-1.5 py-2 font-medium whitespace-nowrap">이름</th>
                <th className="px-1.5 py-2 font-medium whitespace-nowrap">연락처</th>
                <th className="px-1.5 py-2 font-medium whitespace-nowrap">상담단계</th>
                <th className="px-1.5 py-2 font-medium whitespace-nowrap">지역</th>
                <th className="px-1.5 py-2 font-medium whitespace-nowrap">직업</th>
                <th className="px-1.5 py-2 font-medium">메모</th>
                <th className="px-1.5 py-2 font-medium whitespace-nowrap">작업</th>
              </tr>
            </thead>
            <tbody>
              {(data?.customers || []).map((c, i) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/70 align-top">
                  <td className="px-1.5 py-2 whitespace-nowrap tabular-nums text-slate-500">{i + 1}</td>
                  <td className="px-1.5 py-2 whitespace-nowrap">{c.appliedAt}</td>
                  <td className="px-1.5 py-2 font-medium truncate" title={c.name}>{c.name}</td>
                  <td className="px-1.5 py-2 whitespace-nowrap tabular-nums">{c.phone}</td>
                  <td className="px-1.5 py-2">
                    <select
                      value={c.status}
                      disabled={quickSavingId === c.id}
                      onChange={(e) => quickUpdate(c.id, { status: e.target.value })}
                      className={`max-w-full rounded-full px-2 py-1 text-xs font-medium border-0 ${STATUS_COLORS[c.status] || "bg-slate-100 text-slate-700"}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      {!STATUS_OPTIONS.includes(c.status as never) && (
                        <option value={c.status}>{c.status}</option>
                      )}
                    </select>
                  </td>
                  <td className="px-1.5 py-2 truncate" title={c.region || ""}>{c.region}</td>
                  <td className="px-1.5 py-2 truncate" title={c.job || ""}>{c.job}</td>
                  <td className="px-1.5 py-2">
                    <textarea
                      defaultValue={c.memo}
                      key={`${c.id}-${c.updatedAt || c.memo}`}
                      rows={3}
                      className="w-full resize-y rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      onBlur={(e) => {
                        if (e.target.value !== c.memo) quickUpdate(c.id, { memo: e.target.value });
                      }}
                    />
                  </td>
                  <td className="px-1.5 py-2">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setEditTarget(c)} className="text-brand-700 hover:underline text-xs">수정</button>
                      <button onClick={() => remove(c.id)} className="text-rose-600 hover:underline text-xs">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && (data?.customers.length || 0) === 0 && (
                <tr>
                  <td colSpan={9} className="px-1.5 py-10 text-center text-slate-500">
                    조건에 맞는 고객이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile cards */}
      <section className="md:hidden space-y-3">
        {(data?.customers || []).map((c, i) => (
          <article key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">
                  #{i + 1}
                  {c.appliedAt ? ` · ${c.appliedAt}` : ""}
                </p>
                <h3 className="font-semibold text-base">{c.name}</h3>
                <p className="text-sm text-slate-600 tabular-nums">{c.phone}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[c.status] || "bg-slate-100"}`}>
                {c.status}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600">
              <div><dt className="inline text-slate-400">지역 </dt><dd className="inline">{c.region || "-"}</dd></div>
              <div><dt className="inline text-slate-400">직업 </dt><dd className="inline">{c.job || "-"}</dd></div>
            </dl>
            {c.memo && <p className="text-xs text-slate-700 bg-slate-50 rounded-lg p-2 whitespace-pre-wrap">{c.memo}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditTarget(c)} className="flex-1 rounded-xl bg-brand-600 text-white py-2 text-sm font-medium">수정</button>
              <button onClick={() => remove(c.id)} className="rounded-xl bg-rose-50 text-rose-700 px-3 py-2 text-sm">삭제</button>
            </div>
          </article>
        ))}
        {!loading && (data?.customers.length || 0) === 0 && (
          <p className="text-center text-slate-500 py-8">조건에 맞는 고객이 없습니다.</p>
        )}
      </section>


      {toast && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            toast.type === "ok"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {toast.text}
          <button
            className="ml-3 text-xs underline"
            onClick={() => setToast(null)}
          >
            닫기
          </button>
        </div>
      )}
      <CustomerEditModal
        open={editTarget !== undefined}
        customer={editTarget ?? null}
        onClose={() => setEditTarget(undefined)}
        onSaved={load}
      />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onImported={load} />
    </div>
  );
}
