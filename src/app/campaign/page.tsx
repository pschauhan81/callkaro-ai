/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import CsvUpload from "@/components/CsvUpload";
import LeadsTable from "@/components/LeadsTable";
import { supabase } from "@/lib/supabase";

export default function CampaignPage() {
  const [campaignName, setCampaignName] = useState("");
  const [script, setScript] = useState(
    "Namaste {{name}} ji,\nAapne {{course}} coaching ke liye enquiry ki thi."
  );
  const [leads, setLeads] = useState<any[]>([]);
  const [savedLeads, setSavedLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const startCampaign = async () => {
    if (!campaignName || leads.length === 0) {
      alert("Campaign name aur leads required hain");
      return;
    }

    setLoading(true);

    // 1️⃣ Create campaign
    const { data: campaign, error: campErr } = await supabase
      .from("campaigns")
      .insert({ name: campaignName })
      .select()
      .single();

    if (campErr) {
      alert("Campaign create failed");
      setLoading(false);
      return;
    }

    // 2️⃣ Prepare leads
    const preparedLeads = [];

    for (const lead of leads) {
      const finalScript = script
        .replace("{{name}}", lead.Name)
        .replace("{{course}}", lead.Course);

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Is script ko polite Hindi calling tone me convert karo:\n\n${finalScript}`,
        }),
      });

      const data = await res.json();

      preparedLeads.push({
        campaign_id: campaign.id,
        name: lead.Name,
        phone: lead.Phone,
        course: lead.Course,
        status: "READY",
        script: data.text,
      });
    }

    // 3️⃣ Save leads to Supabase
    const { data: insertedLeads, error } = await supabase
      .from("leads")
      .insert(preparedLeads)
      .select();

    if (error) {
      alert("Leads save failed");
    } else {
      setSavedLeads(insertedLeads || []);
    }

    setLoading(false);
  };

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">📣 Create Campaign</h1>

      <input
        className="border p-2 w-full rounded"
        placeholder="Campaign Name"
        value={campaignName}
        onChange={(e) => setCampaignName(e.target.value)}
      />

      <textarea
        className="border p-2 w-full h-32 rounded"
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />

      <CsvUpload onUpload={setLeads} />

      <button
        onClick={startCampaign}
        disabled={loading}
        className={`px-6 py-3 rounded text-white ${
          loading ? "bg-gray-400" : "bg-black"
        }`}
      >
        {loading ? "Processing..." : "▶ Start Campaign"}
      </button>

      {savedLeads.length > 0 && (
        <div>
          <h2 className="font-semibold mt-6 mb-2">📋 Campaign Leads</h2>

          {/* 🔥 YAHI THA TUMHARA CONFUSION */}
          <LeadsTable leads={savedLeads} />
        </div>
      )}
    </main>
  );
}


