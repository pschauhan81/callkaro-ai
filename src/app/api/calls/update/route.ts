import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { id, notes, tags, ai_summary } = await req.json();

  const { error } = await supabase
    .from("calls")
    .update({ notes, tags, ai_summary })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
