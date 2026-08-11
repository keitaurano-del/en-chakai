import { NextRequest, NextResponse } from "next/server";
import { listSlots, upsertSlot, updateSlot, deleteSlot } from "@/lib/db";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && auth === expected;
}

// GET — list all slots for a month range
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  return NextResponse.json(listSlots({ from, to }));
}

// POST — upsert a slot (create or toggle)
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  try {
    return NextResponse.json(upsertSlot(body));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upsert failed" }, { status: 500 });
  }
}

// PATCH — update is_open for a specific slot
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, is_open } = await req.json();
  const slot = updateSlot(id, { is_open });
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 500 });
  return NextResponse.json(slot);
}

// DELETE — remove a slot by id
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  deleteSlot(id);
  return NextResponse.json({ success: true });
}
