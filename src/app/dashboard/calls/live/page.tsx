/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// Call type
type Call = {
  id: string;
  lead_name?: string;
  phone?: string;
  status?: string;
  created_at: string;
  notes?: string;
  tags?: string[];
  ai_summary?: string;
};

const ACTIVE_STATUSES = ["initiated", "ringing", "in-progress"];

export default function LiveCallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial active calls
  const fetchInitial = async () => {
    const { data } = await supabase
      .from("calls")
      .select("*")
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: false });

    setCalls(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInitial();

    const channel = supabase
      .channel("live-calls")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calls" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            if (ACTIVE_STATUSES.includes(payload.new.status)) {
              setCalls((prev) => [payload.new, ...prev]);
            }
          }

          if (payload.eventType === "UPDATE") {
            setCalls((prev) => {
              const filtered = prev.filter((c) => c.id !== payload.new.id);
              if (ACTIVE_STATUSES.includes(payload.new.status)) {
                return [payload.new, ...filtered];
              }
              return filtered;
            });
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Generate AI Summary (mock function, replace with actual OpenAI call)
  const generateCallSummary = async (notes: string) => {
    return `AI Summary: ${notes || "No notes provided"}`;
  };

  const updateCall = async (call: Call) => {
    await supabase.from("calls").update(call).eq("id", call.id);
  };

  const handleAISummary = async (call: Call) => {
    const summary = await generateCallSummary(call.notes || "");
    const updatedCall = { ...call, ai_summary: summary };
    setCalls((prev) =>
      prev.map((c) => (c.id === call.id ? updatedCall : c))
    );

    await fetch("/api/calls/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: call.id, ai_summary: summary }),
    });
  };

  if (loading) return <p>Loading live calls...</p>;

  return (
    <div className="p-6 text-black">
      <div className="flex justify-between mb-6 text-black">
        <h1 className="text-2xl font-bold">📞 Live Calls</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/calls/start"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Start Call
          </Link>
          <Link
            href="/dashboard/calls/live"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Live Calls
          </Link>
        </div>
      </div>

      {calls.length === 0 && (
        <p className="text-gray-500">No active calls</p>
      )}

      {calls.map((call) => (
        <div
          key={call.id}
          className="bg-white p-4 rounded shadow mb-3 flex flex-col gap-2"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{call.lead_name || "Unknown"}</p>
              <p className="text-sm text-gray-500">{call.phone}</p>
            </div>
            <span className="px-3 py-1 text-sm rounded bg-green-200 text-green-800">
              {call.status}
            </span>
          </div>

          {/* Notes */}
          <textarea
            placeholder="Add notes..."
            className="w-full border rounded p-2 text-sm"
            value={call.notes || ""}
            onChange={(e) => {
              const updatedCall = { ...call, notes: e.target.value };
              setCalls((prev) =>
                prev.map((c) => (c.id === call.id ? updatedCall : c))
              );
            }}
            onBlur={() => updateCall(call)}
          />

          {/* Tags */}
          <input
            type="text"
            placeholder="Add comma-separated tags"
            className="w-full border rounded p-2 text-sm"
            value={call.tags?.join(",") || ""}
            onChange={(e) => {
              const tagsArray = e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
              const updatedCall = { ...call, tags: tagsArray };
              setCalls((prev) =>
                prev.map((c) => (c.id === call.id ? updatedCall : c))
              );
            }}
            onBlur={() => updateCall(call)}
          />

          {/* AI Summary */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handleAISummary(call)}
              className="bg-purple-600 text-white px-2 py-1 rounded text-sm"
            >
              Generate AI Summary
            </button>
            {call.ai_summary && (
              <p className="text-sm text-gray-700">{call.ai_summary}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
