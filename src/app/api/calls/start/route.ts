import { NextResponse } from "next/server";

export type Call = {
  id: string;
  lead_name: string;
  phone: string;
  campaign?: string;
  status: "initiated" | "completed";
  created_at: string;
  duration?: number;
};

const calls: Call[] = []; // 🔴 in-memory (Day 23 → DB)

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.leadName || !body.phone) {
    return NextResponse.json(
      { success: false, error: "Missing fields" },
      { status: 400 }
    );
  }

  const newCall: Call = {
    id: Date.now().toString(),
    lead_name: body.leadName,
    phone: body.phone,
    campaign: body.campaign,
    status: "initiated",
    created_at: new Date().toISOString(),
  };

  calls.unshift(newCall);

  return NextResponse.json({ success: true, call: newCall });
}

// 🔴 IMPORTANT: shared memory
export function getCalls() {
  return calls;
}
