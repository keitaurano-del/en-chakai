"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "1") {
      router.replace("/admin/slots");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      // Verify against the server (ADMIN_PASSWORD env) instead of a hardcoded value.
      const res = await fetch("/api/admin/slots", {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        sessionStorage.setItem("admin_auth", "1");
        sessionStorage.setItem("admin_pw", password);
        router.replace("/admin/slots");
        return;
      }
      setError("パスワードが違います");
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください");
    }
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-washi p-6">
      <div className="w-full max-w-sm">
        <div className="wa-card px-8 py-10 sm:px-10">
          {/* 紋: 朱の円相 */}
          <div className="mb-7 flex flex-col items-center text-center">
            <span
              aria-hidden
              className="mb-5 inline-block h-10 w-10 rounded-full border-[2.5px] border-shu"
              style={{ borderRightColor: "transparent", transform: "rotate(-40deg)" }}
            />
            <h1 className="wa-serif text-3xl font-medium tracking-[0.35em] text-sumi">円茶会</h1>
            <p className="wa-label mt-3 uppercase">Admin — 管理画面</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              autoFocus
              className="w-full rounded-lg border border-line bg-white/70 px-4 py-3 text-base text-sumi placeholder:text-sumi-soft focus:border-sumi/40 focus:outline-none focus:ring-2 focus:ring-sumi/10"
            />
            {error && <p className="text-[13px] text-shu-deep">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="wa-btn wa-btn-primary mt-1 w-full py-3.5 text-sm tracking-[0.2em]"
            >
              {submitting ? "確認中…" : "ログイン"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-[11px] tracking-[0.1em] text-sumi-soft">
          En Chakai — Tokyo Tea Ceremony
        </p>
      </div>
    </div>
  );
}
