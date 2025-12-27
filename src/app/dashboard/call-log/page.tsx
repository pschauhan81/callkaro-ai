/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createClient,
  SupabaseClient,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import toast, { Toaster } from "react-hot-toast";

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Call = {
  id: string;
  lead_name?: string;
  phone?: string;
  status?: string;
  duration?: number;
  created_at: string;
  notes?: string;
};

export default function CallLogsRealtimePage() {
  const [calls, setCalls] = useState<Call[]>([]);

  const fetchCalls = async () => {
    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setCalls(data || []);
  };

  useEffect(() => {
    fetchCalls();

    const channel = supabase
      .channel("calls-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calls" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setCalls((prev) => [payload.new, ...prev]);
            toast.success(
              `New Call: ${payload.new.lead_name || "Unknown"}`
            );
          }

          if (payload.eventType === "UPDATE") {
            setCalls((prev) =>
              prev.map((c) =>
                c.id === payload.new.id ? payload.new : c
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getAISuggestion = (call: Call) => {
    if (call.status === "in-progress") return "Keep engaging the lead";
    if (call.status === "initiated") return "Follow up soon";
    if (call.status === "completed") return "Send thank you message";
    return "Review lead details";
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">
          📋 Realtime Call Logs
        </h1>

        <Link
          href="/dashboard/calls/start"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Start Call
        </Link>
      </div>

      <table className="w-full border rounded overflow-hidden">
        <thead className="bg-gray-700 text-white">
          <tr>
            <th className="p-3 text-left">Lead</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">AI Suggestion</th>
          </tr>
        </thead>
        <tbody>
          {calls.length === 0 && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-gray-500">
                No call logs available
              </td>
            </tr>
          )}

          {calls.map((call) => (
            <tr key={call.id} className="border-t text-black">
              <td className="p-3">{call.lead_name || "—"}</td>
              <td className="p-3">{call.phone || "—"}</td>
              <td className="p-3">{call.status || "—"}</td>
              <td className="p-3 text-sm text-gray-700">
                {getAISuggestion(call)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
