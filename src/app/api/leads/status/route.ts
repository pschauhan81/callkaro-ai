import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Update lead status
export async function POST(req: Request) {
  try {
    const { leadId, status } = await req.json();

    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", leadId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
