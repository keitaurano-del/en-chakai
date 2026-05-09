"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Already logged in?
  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "1") {
      router.replace("/admin/slots");
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "chakai2024") {
      sessionStorage.setItem("admin_auth", "1");
      router.replace("/admin/slots");
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-4">
      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-gold">En Chakai</p>
        <h1 className="mb-8 font-[family-name:var(--font-heading)] text-3xl font-medium text-cream">
          Admin
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-cream/15 bg-charcoal-light px-4 py-3 text-base text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none"
            autoFocus
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 bg-gold py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-gold-light"
          >
            <LogIn size={16} />
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
