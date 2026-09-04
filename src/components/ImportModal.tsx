"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
};

export default function ImportModal({ open, onClose, onImported }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit() {
    if (!file) {
      setError("CSV 파일을 선택해 주세요.");
      return;
    }
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "가져오기 실패");
      setMsg(`${data.imported}건을 가져왔습니다.`);
      onImported();
    } catch (e) {
      setError(e instanceof Error ? e.message : "가져오기 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-xl">
        <div className="border-b px-5 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">CSV 가져오기</h2>
          <button onClick={onClose} className="text-slate-500 text-sm px-2 py-1">닫기</button>
        </div>
        <div className="px-5 py-4 space-y-3 text-sm">
          <p className="text-slate-600">
            Google Sheet &quot;2차&quot; 스타일 CSV를 지원합니다. 헤더 예: 이름/표시명, 연락처/전화번호,
            신청일/상담 신청 일자, 담당자, 상담단계/상태, 지역, 채무액, 직업, 유입경로/타이틀, 메모/2차상담
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
          {msg && <p className="text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{msg}</p>}
          {error && <p className="text-rose-700 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
        </div>
        <div className="px-5 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium">취소</button>
          <button
            onClick={submit}
            disabled={loading}
            className="rounded-xl bg-brand-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "가져오는 중…" : "가져오기"}
          </button>
        </div>
      </div>
    </div>
  );
}
