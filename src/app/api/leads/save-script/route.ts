import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { leadId, script } = await req.json();

  const { error } = await supabase
    .from("leads")
    .update({ script })
    .eq("id", leadId);

  if (error) {
    return new Response("Error saving script", { status: 500 });
  }

  return new Response("Saved", { status: 200 });
}
