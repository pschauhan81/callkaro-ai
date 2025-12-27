import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACTIVE_STATUSES = ["initiated", "ringing", "in-progress"];

export async function GET() {
  try {
    const { data: calls, error } = await supabase
      .from("calls")
      .select("status, duration, created_at");

    if (error) throw error;

    const total = calls.length;

    const active = calls.filter((c) =>
      ACTIVE_STATUSES.includes(c.status)
    ).length;

    const completedCalls = calls.filter(
      (c) => c.status === "completed" && c.duration
    );

    const completed = completedCalls.length;

    const failed = calls.filter((c) =>
      ["failed", "busy", "no-answer"].includes(c.status)
    ).length;

    const avgDuration =
      completedCalls.length > 0
        ? Math.floor(
            completedCalls.reduce(
              (a, b) => a + (b.duration || 0),
              0
            ) / completedCalls.length
          )
        : 0;

    return NextResponse.json({
      total,
      active,
      completed,
      failed,
      avgDuration,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Dashboard stats failed" },
      { status: 500 }
    );
  }
}
