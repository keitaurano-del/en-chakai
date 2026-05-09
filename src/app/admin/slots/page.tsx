"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type Slot, type Booking } from "@/lib/supabase";
import { TIME_SLOTS, TIME_SLOT_LABELS, PLAN_LABELS, formatDateDisplay } from "@/lib/booking";
import { ChevronLeft, ChevronRight, LogOut, Calendar, Users, Plus, Trash2, Check, X } from "lucide-react";

type Tab = "slots" | "bookings";
const CLOSED_DAYS = [0, 1]; // 日・月
const ADMIN_PW = "chakai2024";
const DAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

function authHeader() {
  return { "x-admin-password": ADMIN_PW, "Content-Type": "application/json" };
}

export default function AdminSlotsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("slots");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<(Booking & { available_slots: Slot })[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") !== "1") {
      router.replace("/admin");
    }
  }, [router]);

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function padDay(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  const loadSlots = useCallback(async () => {
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    const res = await fetch(`/api/admin/slots?from=${from}&to=${to}`, { headers: authHeader() });
    if (res.ok) setSlots(await res.json());
  }, [year, month, daysInMonth]);

  const loadBookings = useCallback(async () => {
    const res = await fetch("/api/admin/bookings", { headers: authHeader() });
    if (res.ok) setBookings(await res.json());
  }, []);

  useEffect(() => { loadSlots(); }, [loadSlots]);
  useEffect(() => { if (tab === "bookings") loadBookings(); }, [tab, loadBookings]);

  function getSlot(dateStr: string, time: string) {
    return slots.find((s) => s.date === dateStr && s.time_slot === time);
  }
  function slotsForDate(dateStr: string) {
    return slots.filter((s) => s.date === dateStr);
  }

  async function toggleSlot(dateStr: string, time: string) {
    setSaving(true);
    const existing = getSlot(dateStr, time);
    if (existing) {
      await fetch("/api/admin/slots", {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ id: existing.id, is_open: !existing.is_open }),
      });
      showToast(existing.is_open ? "スロットを非公開にしました" : "スロットを公開しました");
    } else {
      await fetch("/api/admin/slots", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ date: dateStr, time_slot: time, is_open: true }),
      });
      showToast("スロットを追加しました");
    }
    await loadSlots();
    setSaving(false);
  }

  async function deleteSlot(dateStr: string, time: string) {
    if (!confirm("このスロットを削除しますか？")) return;
    setSaving(true);
    const slot = getSlot(dateStr, time);
    if (slot) {
      await fetch("/api/admin/slots", {
        method: "DELETE",
        headers: authHeader(),
        body: JSON.stringify({ id: slot.id }),
      });
      showToast("削除しました");
      await loadSlots();
    }
    setSaving(false);
  }

  async function openWeek() {
    if (!selectedDate) return;
    setSaving(true);
    const base = new Date(selectedDate + "T00:00:00");
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      if (CLOSED_DAYS.includes(d.getDay())) continue;
      const dateStr = d.toISOString().slice(0, 10);
      for (const t of TIME_SLOTS) {
        if (!getSlot(dateStr, t)) {
          await fetch("/api/admin/slots", {
            method: "POST",
            headers: authHeader(),
            body: JSON.stringify({ date: dateStr, time_slot: t, is_open: true }),
          });
        }
      }
    }
    await loadSlots();
    showToast("週のスロットを一括追加しました");
    setSaving(false);
  }

  async function updateBookingStatus(id: string, status: "confirmed" | "cancelled") {
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify({ id, status }),
    });
    showToast(status === "confirmed" ? "予約を確認済みにしました" : "予約をキャンセルしました");
    await loadBookings();
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin");
  }

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1e1e1a", color: "#f0ebe0", fontFamily: "Inter, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          backgroundColor: "#3d6b4f", color: "#f0ebe0",
          padding: "12px 20px", fontSize: 14, borderRadius: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(240,235,224,0.1)", backgroundColor: "#2a2a25", padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 18, color: "#f0ebe0" }}>円茶会 管理</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setTab("slots")}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                  fontSize: 13, border: "none", cursor: "pointer", borderRadius: 4,
                  backgroundColor: tab === "slots" ? "rgba(181,147,106,0.15)" : "transparent",
                  color: tab === "slots" ? "#b5936a" : "rgba(240,235,224,0.5)",
                }}
              >
                <Calendar size={14} /> スロット管理
              </button>
              <button
                onClick={() => setTab("bookings")}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                  fontSize: 13, border: "none", cursor: "pointer", borderRadius: 4,
                  backgroundColor: tab === "bookings" ? "rgba(181,147,106,0.15)" : "transparent",
                  color: tab === "bookings" ? "#b5936a" : "rgba(240,235,224,0.5)",
                }}
              >
                <Users size={14} />
                予約一覧
                {pendingCount > 0 && (
                  <span style={{ backgroundColor: "#b5936a", color: "#1e1e1a", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(240,235,224,0.4)", background: "none", border: "none", cursor: "pointer" }}
          >
            <LogOut size={14} /> ログアウト
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── スロット管理 ── */}
        {tab === "slots" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>

            {/* カレンダー */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <button
                  onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                  style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid rgba(240,235,224,0.1)", cursor: "pointer", color: "#f0ebe0", borderRadius: 4 }}
                >
                  <ChevronLeft size={16} />
                </button>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 20, color: "#f0ebe0", margin: 0 }}>
                  {year}年{month + 1}月
                </h2>
                <button
                  onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                  style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid rgba(240,235,224,0.1)", cursor: "pointer", color: "#f0ebe0", borderRadius: 4 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* カレンダーグリッド */}
              <div style={{ border: "1px solid rgba(240,235,224,0.1)", borderRadius: 6, overflow: "hidden" }}>
                {/* 曜日ヘッダー */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid rgba(240,235,224,0.1)", backgroundColor: "#2a2a25" }}>
                  {DAYS_JA.map((d, i) => (
                    <div key={d} style={{
                      padding: "10px 0", textAlign: "center", fontSize: 12,
                      color: i === 0 ? "#e57373" : i === 1 ? "rgba(240,235,224,0.25)" : "rgba(240,235,224,0.4)",
                      fontWeight: 500,
                    }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* 日付グリッド */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {/* 空白セル */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ minHeight: 60, borderRight: "1px solid rgba(240,235,224,0.05)", borderBottom: "1px solid rgba(240,235,224,0.05)", backgroundColor: "rgba(0,0,0,0.1)" }} />
                  ))}

                  {/* 日付セル */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                    const dateStr = padDay(d);
                    const dateObj = new Date(dateStr + "T00:00:00");
                    const isClosed = CLOSED_DAYS.includes(dateObj.getDay());
                    const isSun = dateObj.getDay() === 0;
                    const isSelected = selectedDate === dateStr;
                    const daySlots = slotsForDate(dateStr);
                    const openSlots = daySlots.filter((s) => s.is_open);

                    return (
                      <div
                        key={d}
                        onClick={() => !isClosed && setSelectedDate(isSelected ? null : dateStr)}
                        style={{
                          minHeight: 60,
                          padding: 8,
                          borderRight: "1px solid rgba(240,235,224,0.05)",
                          borderBottom: "1px solid rgba(240,235,224,0.05)",
                          cursor: isClosed ? "default" : "pointer",
                          backgroundColor: isSelected ? "rgba(61,107,79,0.25)" : isClosed ? "rgba(0,0,0,0.15)" : "transparent",
                          transition: "background-color 0.15s",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => { if (!isClosed && !isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(61,107,79,0.1)"; }}
                        onMouseLeave={(e) => { if (!isClosed && !isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent"; }}
                      >
                        <span style={{
                          fontSize: 13, fontWeight: 500,
                          color: isClosed ? "rgba(240,235,224,0.2)" : isSun ? "#e57373" : "rgba(240,235,224,0.8)",
                        }}>
                          {d}
                        </span>
                        {/* スロットインジケーター */}
                        {openSlots.length > 0 && (
                          <div style={{ display: "flex", gap: 2, marginTop: 4, flexWrap: "wrap" }}>
                            {openSlots.map((_, i) => (
                              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#b5936a" }} />
                            ))}
                          </div>
                        )}
                        {/* 非公開スロット */}
                        {daySlots.length > openSlots.length && (
                          <div style={{ display: "flex", gap: 2, marginTop: 2, flexWrap: "wrap" }}>
                            {daySlots.filter((s) => !s.is_open).map((_, i) => (
                              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "rgba(240,235,224,0.2)" }} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 凡例 */}
              <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: "rgba(240,235,224,0.4)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#b5936a", display: "inline-block" }} />
                  公開中のスロット
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "rgba(240,235,224,0.2)", display: "inline-block" }} />
                  非公開スロット
                </span>
                <span>日・月は定休日</span>
              </div>

              {/* 一括追加ボタン */}
              {selectedDate && (
                <button
                  onClick={openWeek}
                  disabled={saving}
                  style={{
                    marginTop: 16, display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 16px", fontSize: 13, cursor: saving ? "not-allowed" : "pointer",
                    border: "1px solid #3d6b4f", backgroundColor: "transparent", color: "#3d6b4f",
                    borderRadius: 4, opacity: saving ? 0.5 : 1,
                  }}
                >
                  <Plus size={14} />
                  {selectedDate} から1週間（火〜土）を一括で公開
                </button>
              )}
            </div>

            {/* 右パネル：選択した日のスロット管理 */}
            <div>
              {selectedDate ? (
                <div style={{ border: "1px solid rgba(240,235,224,0.1)", borderRadius: 6, overflow: "hidden", backgroundColor: "#2a2a25" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(240,235,224,0.1)", backgroundColor: "#333330" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "rgba(240,235,224,0.5)" }}>選択中の日付</p>
                    <p style={{ margin: "4px 0 0", fontSize: 16, fontFamily: "Cormorant Garamond, serif", color: "#f0ebe0" }}>
                      {formatDateDisplay(selectedDate)}
                    </p>
                  </div>

                  <div style={{ padding: 16 }}>
                    <p style={{ margin: "0 0 12px", fontSize: 12, color: "rgba(240,235,224,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      時間スロット
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {TIME_SLOTS.map((time) => {
                        const slot = getSlot(selectedDate, time);
                        const exists = !!slot;
                        const isOpen = slot?.is_open ?? false;

                        return (
                          <div key={time} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 14px", borderRadius: 6,
                            border: `1px solid ${isOpen ? "rgba(181,147,106,0.3)" : "rgba(240,235,224,0.08)"}`,
                            backgroundColor: isOpen ? "rgba(181,147,106,0.06)" : "transparent",
                          }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 14, color: "#f0ebe0", fontWeight: 500 }}>
                                {TIME_SLOT_LABELS[time]}
                              </p>
                              <p style={{ margin: "2px 0 0", fontSize: 12, color: isOpen ? "#b5936a" : exists ? "rgba(240,235,224,0.3)" : "rgba(240,235,224,0.2)" }}>
                                {!exists ? "未設定" : isOpen ? "● 公開中" : "○ 非公開"}
                              </p>
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button
                                onClick={() => toggleSlot(selectedDate, time)}
                                disabled={saving}
                                style={{
                                  padding: "6px 12px", fontSize: 12, cursor: saving ? "not-allowed" : "pointer",
                                  border: "1px solid", borderRadius: 4, fontWeight: 500,
                                  borderColor: isOpen ? "rgba(229,115,115,0.4)" : "#3d6b4f",
                                  backgroundColor: isOpen ? "transparent" : "rgba(61,107,79,0.3)",
                                  color: isOpen ? "#e57373" : "#f0ebe0",
                                  opacity: saving ? 0.5 : 1,
                                }}
                              >
                                {!exists ? "追加" : isOpen ? "非公開にする" : "公開する"}
                              </button>
                              {exists && (
                                <button
                                  onClick={() => deleteSlot(selectedDate, time)}
                                  disabled={saving}
                                  title="削除"
                                  style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "rgba(240,235,224,0.2)", borderRadius: 4, opacity: saving ? 0.5 : 1 }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ border: "1px solid rgba(240,235,224,0.08)", borderRadius: 6, height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(240,235,224,0.25)", fontSize: 14, gap: 8 }}>
                  <Calendar size={24} />
                  <p style={{ margin: 0 }}>左のカレンダーで日付を選択</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 予約一覧 ── */}
        {tab === "bookings" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, color: "#f0ebe0", margin: 0 }}>予約一覧</h2>
              {pendingCount > 0 && (
                <span style={{ backgroundColor: "rgba(181,147,106,0.15)", color: "#b5936a", fontSize: 13, padding: "4px 12px", borderRadius: 20 }}>
                  未確認 {pendingCount}件
                </span>
              )}
            </div>

            {bookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "rgba(240,235,224,0.3)", fontSize: 14 }}>
                まだ予約はありません
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {bookings.map((b) => (
                  <div key={b.id} style={{
                    border: `1px solid ${b.status === "pending" ? "rgba(181,147,106,0.3)" : "rgba(240,235,224,0.08)"}`,
                    borderRadius: 6, padding: "16px 20px", backgroundColor: "#2a2a25",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        {/* ステータスバッジ */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: "#f0ebe0" }}>{b.name}</span>
                          <span style={{
                            fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 500,
                            backgroundColor: b.status === "confirmed" ? "rgba(61,107,79,0.3)" : b.status === "cancelled" ? "rgba(229,115,115,0.15)" : "rgba(181,147,106,0.15)",
                            color: b.status === "confirmed" ? "#4caf82" : b.status === "cancelled" ? "#e57373" : "#b5936a",
                          }}>
                            {b.status === "confirmed" ? "✓ 確認済み" : b.status === "cancelled" ? "✕ キャンセル" : "⏳ 未確認"}
                          </span>
                        </div>
                        <p style={{ margin: "0 0 10px", fontSize: 13, color: "rgba(240,235,224,0.55)" }}>{b.email}</p>

                        {/* 予約詳細 */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", fontSize: 13, color: "rgba(240,235,224,0.75)" }}>
                          {b.available_slots && (
                            <span>📅 {formatDateDisplay(b.available_slots.date)}　{b.available_slots.time_slot}</span>
                          )}
                          <span>🎋 {PLAN_LABELS[b.plan]?.split(" — ")[0]}</span>
                          <span>👥 {b.guests}名</span>
                          <span>🪑 {b.seating === "floor" ? "畳" : "椅子"}</span>
                        </div>

                        {(b.dietary || b.notes) && (
                          <div style={{ marginTop: 10, padding: "8px 12px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 4, fontSize: 12, color: "rgba(240,235,224,0.5)" }}>
                            {b.dietary && <p style={{ margin: 0 }}>食事制限: {b.dietary}</p>}
                            {b.notes && <p style={{ margin: b.dietary ? "4px 0 0" : 0 }}>備考: {b.notes}</p>}
                          </div>
                        )}
                      </div>

                      {/* アクションボタン */}
                      {b.status === "pending" && (
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button
                            onClick={() => updateBookingStatus(b.id, "confirmed")}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", fontSize: 13, cursor: "pointer", backgroundColor: "rgba(61,107,79,0.4)", border: "1px solid #3d6b4f", color: "#f0ebe0", borderRadius: 4 }}
                          >
                            <Check size={13} /> 確認
                          </button>
                          <button
                            onClick={() => updateBookingStatus(b.id, "cancelled")}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", fontSize: 13, cursor: "pointer", backgroundColor: "transparent", border: "1px solid rgba(229,115,115,0.4)", color: "#e57373", borderRadius: 4 }}
                          >
                            <X size={13} /> キャンセル
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
