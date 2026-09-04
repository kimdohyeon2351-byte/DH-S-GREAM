import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DH-S-GREAM | 상담 고객 CRM",
  description: "상담 리드 고객 관리 MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-30">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-600 text-white grid place-items-center font-bold shadow-sm">
                  DH
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-semibold tracking-tight">
                    DH-S-GREAM
                  </h1>
                  <p className="text-xs text-slate-500">상담 고객 CRM (로컬 MVP)</p>
                </div>
              </div>
              <span className="hidden sm:inline text-xs text-slate-400">인증 없음 · SQLite</span>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-5">{children}</main>
        </div>
      </body>
    </html>
  );
}
