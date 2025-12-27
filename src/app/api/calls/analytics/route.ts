import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Call = {
  id: string;
  status?: string;
  duration?: number;
  created_at: string;
};

export async function GET() {
  try {
    const { data, error } = await supabase.from<Call>("calls").select("*");
    if (error) throw error;

    const calls = data || [];
    const today = new Date().toDateString();

    const todayCalls = calls.filter(
      (c) => new Date(c.created_at).toDateString() === today
    ).length;

    const activeCalls = calls.filter(
      (c) => !["completed", "failed", "busy", "no-answer"].includes(c.status ?? "")
    ).length;

    const completedCalls = calls.filter((c) => c.status === "completed").length;

    const failedCalls = calls.filter((c) =>
      ["failed", "busy", "no-answer"].includes(c.status ?? "")
    ).length;

    const completedDurations = calls
      .filter((c) => c.status === "completed" && c.duration)
      .map((c) => c.duration as number);

    const avgDuration =
      completedDurations.length > 0
        ? Math.floor(
            completedDurations.reduce((a, b) => a + b, 0) /
              completedDurations.length
          )
        : 0;

    return NextResponse.json({
      todayCalls,
      activeCalls,
      completedCalls,
      failedCalls,
      avgDuration,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Analytics error" },
      { status: 500 }
    );
  }
}
