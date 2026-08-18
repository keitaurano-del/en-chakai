import { NextRequest, NextResponse } from "next/server";
import { listInquiries } from "@/lib/db";

// EC-14: admin listing of customer inquiries (data/inquiries.json).

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && auth === expected;
}

// GET — list recent inquiries (optional ?limit=, default 100, max 1000)
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = Number(new URL(req.url).searchParams.get("limit"));
  const limit = Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), 1000) : 100;
  return NextResponse.json(listInquiries(limit));
}
