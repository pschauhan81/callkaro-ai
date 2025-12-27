/* eslint-disable prefer-const */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ================= TYPES ================= */

type Call = {
  _id: string;
  lead_name?: string;
  phone?: string;
  campaign?: string;
  status?: string;
  duration?: number;
  createdAt?: string;
};

type Filter = "all" | "active" | "completed" | "failed";

/* ================= CONSTANTS ================= */

const ACTIVE_STATUSES = ["initiated", "ringing", "in-progress"];

/* ================= HELPERS ================= */

const statusColor = (status?: string) => {
  switch (status) {
    case "initiated":
      return "bg-gray-200 text-gray-800";
    case "ringing":
      return "bg-yellow-100 text-yellow-800";
    case "in-progress":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "failed":
    case "busy":
    case "no-answer":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

/* ================= PAGE ================= */

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState<Filter>("all");

  /* ================= FETCH CALLS ================= */

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchCalls = async () => {
      try {
        const res = await fetch("/api/calls", { cache: "no-store" });

        if (!res.ok) throw new Error("API failed");

        const data = await res.json();

        setCalls(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data.calls || []).map((c: any) => ({
            ...c,
            _id: c.id ?? c._id,
            createdAt: c.created_at ?? c.createdAt,
          }))
        );

        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load calls");
        setCalls([]);
      } finally {
        // 🔥 CRITICAL FIX
        setLoading(false);
      }
    };

    fetchCalls();
    timer = setInterval(fetchCalls, 5000);

    return () => clearInterval(timer);
  }, []);

  /* ================= LIVE TIMER ================= */

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ================= END CALL ================= */

  const endCall = async (id: string) => {
    try {
      await fetch("/api/calls/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      setCalls((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: "completed" } : c))
      );
    } catch {
      alert("Failed to end call");
    }
  };

  /* ================= FILTERED CALLS ================= */

  const filteredCalls = calls.filter((c) => {
    if (filter === "active") return ACTIVE_STATUSES.includes(c.status ?? "");
    if (filter === "completed") return c.status === "completed";
    if (filter === "failed")
      return ["failed", "busy", "no-answer"].includes(c.status ?? "");
    return true;
  });

  /* ================= STATS ================= */

  const today = new Date().toDateString();

  const todayCalls = calls.filter(
    (c) => c.createdAt && new Date(c.createdAt).toDateString() === today
  ).length;

  const activeCalls = calls.filter((c) =>
    ACTIVE_STATUSES.includes(c.status ?? "")
  ).length;

  const completed = calls.filter((c) => c.status === "completed" && c.duration);

  const avgDuration =
    completed.length > 0
      ? Math.floor(
          completed.reduce((a, b) => a + (b.duration || 0), 0) /
            completed.length
        )
      : 0;

  /* ================= SAFE UI ================= */

  if (loading) return <p className="p-6">Loading calls...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  /* ================= UI ================= */

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex gap-2 items-center mb-6">
        <h1 className="text-2xl font-bold text-black">📞 Call Logs</h1>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-black">
        <div className="bg-gray-200 p-4 rounded">
          <p className="text-sm text-gray-600">Today Calls</p>
          <p className="text-2xl font-bold">{todayCalls}</p>
        </div>
        <div className="bg-green-200 p-4 rounded">
          <p className="text-sm text-gray-600">Active Calls</p>
          <p className="text-2xl font-bold">{activeCalls}</p>
        </div>
        <div className="bg-purple-200 p-4 rounded">
          <p className="text-sm text-gray-600">Avg Duration</p>
          <p className="text-2xl font-bold">{avgDuration}s</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(["all", "active", "completed", "failed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {filteredCalls.length === 0 && (
        <p className="text-gray-500">No calls found</p>
      )}

      {filteredCalls.length > 0 && (
        <table className="w-full border rounded overflow-hidden">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="p-3 text-left">Lead</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Campaign</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.map((call) => (
              <tr key={call._id} className="border-t text-black">
                <td className="p-3 font-semibold">{call.lead_name || "—"}</td>
                <td className="p-3">{call.phone || "—"}</td>
                <td className="p-3">{call.campaign || "—"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded font-semibold ${statusColor(
                      call.status
                    )}`}
                  >
                    {call.status || "unknown"}
                  </span>
                </td>
                <td className="p-3">
                  {call.status === "in-progress" && call.createdAt
                    ? `${Math.floor(
                        (now - new Date(call.createdAt).getTime()) / 1000
                      )}s`
                    : call.duration
                    ? `${call.duration}s`
                    : "—"}
                </td>
                <td className="p-3 text-sm text-gray-500">
                  {call.createdAt
                    ? new Date(call.createdAt).toLocaleString()
                    : "—"}
                </td>
                <td className="p-3">
                  {call.status !== "completed" ? (
                    <button
                      onClick={() => endCall(call._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      End Call
                    </button>
                  ) : (
                    <span className="text-green-600 font-semibold">Done</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}



// or ya code main kon sa raknha hai  



/*
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { generateCallSummary } from "@/lib/ai";

type Call = {
  _id: string;
  lead_name?: string;
  phone?: string;
  campaign?: string;
  status?: string;
  duration?: number;
  createdAt?: string;
  notes?: string;
  tags?: string[];
  ai_summary?: string;
};

type Filter = "all" | "active" | "completed" | "failed";

const ACTIVE_STATUSES = ["initiated", "ringing", "in-progress"];

const statusColor = (status?: string) => {
  switch (status) {
    case "initiated":
      return "bg-gray-200 text-gray-800";
    case "ringing":
      return "bg-yellow-100 text-yellow-800";
    case "in-progress":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "failed":
    case "busy":
    case "no-answer":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // Fetch calls
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const res = await fetch("/api/calls", { cache: "no-store" });
        if (!res.ok) throw new Error("API failed");
        const data = await res.json();
        setCalls(
          (data.calls || []).map((c: any) => ({
            ...c,
            _id: c.id ?? c._id,
            createdAt: c.created_at ?? c.createdAt,
          }))
        );
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load calls");
        setCalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
    const timer = setInterval(fetchCalls, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredCalls = calls.filter((c) => {
    if (filter === "active") return ACTIVE_STATUSES.includes(c.status ?? "");
    if (filter === "completed") return c.status === "completed";
    if (filter === "failed")
      return ["failed", "busy", "no-answer"].includes(c.status ?? "");
    return true;
  });

  if (loading) return <p className="p-6">Loading calls...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      //{ Header }
      <div className="flex gap-2 items-center mb-6">
        <h1 className="text-2xl font-bold text-black">📞 Call Logs</h1>
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

      { Filters }
      <div className="flex gap-2 mb-4">
        {(["all", "active", "completed", "failed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {filteredCalls.length === 0 && (
        <p className="text-gray-500">No calls found</p>
      )}

      {filteredCalls.length > 0 && (
        <table className="w-full border rounded overflow-hidden">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="p-3 text-left">Lead</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Campaign</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Notes</th>
              <th className="p-3 text-left">Tags</th>
              <th className="p-3 text-left">AI Summary</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.map((call) => (
              <tr key={call._id} className="border-t text-black">
                <td className="p-3 font-semibold">{call.lead_name || "—"}</td>
                <td className="p-3">{call.phone || "—"}</td>
                <td className="p-3">{call.campaign || "—"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded font-semibold ${statusColor(
                      call.status
                    )}`}
                  >
                    {call.status || "unknown"}
                  </span>
                </td>

                //{ Notes }
                <td className="p-3">
                  <textarea
                    className="w-full border rounded p-1"
                    value={call.notes || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCalls((prev) =>
                        prev.map((c) =>
                          c._id === call._id ? { ...c, notes: value } : c
                        )
                      );
                    }}
                    onBlur={async () => {
                      await fetch("/api/calls/update", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: call._id, notes: call.notes }),
                      });
                    }}
                  />
                </td>

                //{ Tags }
                <td className="p-3">
                  <input
                    className="w-full border rounded p-1"
                    placeholder="tag1, tag2"
                    value={call.tags?.join(", ") || ""}
                    onChange={(e) => {
                      const value = e.target.value.split(",").map((t) => t.trim());
                      setCalls((prev) =>
                        prev.map((c) =>
                          c._id === call._id ? { ...c, tags: value } : c
                        )
                      );
                    }}
                    onBlur={async () => {
                      await fetch("/api/calls/update", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: call._id, tags: call.tags }),
                      });
                    }}
                  />
                </td>

                // { AI Summary }
                <td className="p-3 text-sm text-gray-700">{call.ai_summary || "—"}</td>

                //{Generate AI Summary Button }
                <td className="p-3">
                  <button
                    onClick={async () => {
                      const summary = await generateCallSummary(call.notes || "");
                      setCalls((prev) =>
                        prev.map((c) =>
                          c._id === call._id ? { ...c, ai_summary: summary } : c
                        )
                      );

                      await fetch("/api/calls/update", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: call._id, ai_summary: summary }),
                      });
                    }}
                    className="bg-purple-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Generate AI Summary
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

*/







