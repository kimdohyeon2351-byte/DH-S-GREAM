"use client";

import { useEffect, useState } from "react";
import { STATUS_OPTIONS } from "@/lib/constants";
import { currentManageMonth, deriveManageMonth } from "@/lib/manageMonth";
import { resolveJurisdiction } from "@/lib/jurisdiction";
import type { Customer } from "./types";

type Props = {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

const empty: Omit<Customer, "id"> = {
  name: "",
  phone: "",
  appliedAt: "",
  manageMonth: "",
  assignee: "",
  status: "신규",
  region: "",
  jurisdiction: "",
  debtAmount: "",
  job: "",
  source: "",
  memo: "",
};

export default function CustomerEditModal({ customer, open, onClose, onSaved }: Props) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isNew = !customer;

  useEffect(() => {
    if (!open) return;
    setError("");
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone,
        appliedAt: customer.appliedAt,
        manageMonth: customer.manageMonth || "",
        assignee: customer.assignee,
        status: customer.status,
        region: customer.region,
        jurisdiction: customer.jurisdiction || "",
        debtAmount: customer.debtAmount,
        job: customer.job,
        source: customer.source,
        memo: customer.memo,
      });
    } else {
      setForm({ ...empty, manageMonth: currentManageMonth() });
    }
  }, [customer, open]);

  if (!open) return null;

  async function save() {
    if (!form.name.trim()) {
      setError("이름은 필수입니다.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        manageMonth:
          form.manageMonth.trim() ||
          deriveManageMonth(form.appliedAt) ||
          currentManageMonth(),
      };
      const url = isNew ? "/api/customers" : `/api/customers/${customer!.id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("저장 실패");
      onSaved();
      onClose();
    } catch {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      // When appliedAt changes and manageMonth empty, suggest derived month
      if (key === "appliedAt" && !f.manageMonth) {
        const derived = deriveManageMonth(String(value));
        if (derived) next.manageMonth = derived;
      }
      if (key === "region" && !String(f.jurisdiction || "").trim()) {
        next.jurisdiction = resolveJurisdiction(String(value));
      }
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">{isNew ? "고객 추가" : "고객 수정"}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-sm px-2 py-1">
            닫기
          </button>
        </div>
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="신청일">
            <input className="field" value={form.appliedAt} onChange={(e) => set("appliedAt", e.target.value)} placeholder="YYYY-MM-DD" />
          </Field>
          <Field label="관리월">
            <input
              className="field"
              type="month"
              value={form.manageMonth}
              onChange={(e) => set("manageMonth", e.target.value)}
            />
          </Field>
          <Field label="이름 *">
            <input className="field" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="연락처">
            <input className="field" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="상담단계">
            <select className="field" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              {!STATUS_OPTIONS.includes(form.status as never) && form.status && (
                <option value={form.status}>{form.status}</option>
              )}
            </select>
          </Field>
          <Field label="지역">
            <input className="field" value={form.region} onChange={(e) => set("region", e.target.value)} />
          </Field>
          <Field label="관할 (초안)">
            <input
              className="field"
              value={form.jurisdiction}
              onChange={(e) => set("jurisdiction", e.target.value)}
              title="초안(실무 확인 권장) — 지역에서 자동 채움, 수동 수정 가능"
              placeholder="지역 입력 시 자동 · 수동 수정 가능"
            />
            <span className="mt-1 block text-[11px] text-amber-700">초안(실무 확인 권장) · 수동 덮어쓰기 가능</span>
          </Field>
          <Field label="직업">
            <input className="field" value={form.job} onChange={(e) => set("job", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="메모">
              <textarea
                className="field min-h-[110px]"
                value={form.memo}
                onChange={(e) => set("memo", e.target.value)}
              />
            </Field>
          </div>
        </div>
        {error && <p className="px-5 text-sm text-rose-600">{error}</p>}
        <div className="px-5 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">취소</button>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>
      <style jsx global>{`
        .field {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          background: white;
        }
        .field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .btn-primary {
          background: #2563eb;
          color: white;
          border-radius: 0.75rem;
          padding: 0.55rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .btn-primary:disabled { opacity: 0.6; }
        .btn-secondary {
          background: #f1f5f9;
          color: #334155;
          border-radius: 0.75rem;
          padding: 0.55rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-600 font-medium">{label}</span>
      {children}
    </label>
  );
}
