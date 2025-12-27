import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false
    }),
  });

  const data = await response.json();

  return NextResponse.json({
    text: data.response,
  });
}
/*
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { name, leads } = await req.json();

  const { data: campaign } = await supabase
    .from("campaigns")
    .insert({ name })
    .select()
    .single();

  const leadsData = leads.map((l: any) => ({
    campaign_id: campaign.id,
    name: l.Name,
    phone: l.Phone,
    course: l.Course,
  }));

  await supabase.from("leads").insert(leadsData);

  return NextResponse.json({ success: true });
}

*/