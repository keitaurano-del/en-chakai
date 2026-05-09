"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "1") {
      router.replace("/admin/slots");
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === "chakai2024") {
      sessionStorage.setItem("admin_auth", "1");
      router.replace("/admin/slots");
    } else {
      setError("パスワードが違います");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#1e1e1a", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <p style={{ margin: "0 0 6px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b5936a" }}>
          円茶会
        </p>
        <h1 style={{ margin: "0 0 32px", fontFamily: "Cormorant Garamond, serif", fontSize: 28, fontWeight: 500, color: "#f0ebe0" }}>
          管理画面
        </h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            autoFocus
            style={{
              padding: "12px 16px", fontSize: 16, backgroundColor: "#2a2a25",
              border: "1px solid rgba(240,235,224,0.15)", color: "#f0ebe0",
              outline: "none", borderRadius: 4, width: "100%", boxSizing: "border-box",
            }}
          />
          {error && <p style={{ margin: 0, fontSize: 13, color: "#e57373" }}>{error}</p>}
          <button
            type="submit"
            style={{
              padding: "12px", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em",
              backgroundColor: "#b5936a", color: "#1e1e1a", border: "none",
              cursor: "pointer", borderRadius: 4, marginTop: 4,
            }}
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
