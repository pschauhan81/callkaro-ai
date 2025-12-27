"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartCallPage() {
  const router = useRouter();

  const [leadName, setLeadName] = useState("");
  const [phone, setPhone] = useState("");
  const [campaign, setCampaign] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartCall = async () => {
    if (!leadName || !phone) {
      setError("Lead name and phone are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/calls/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_name: leadName,
          phone,
          campaign,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to start call");
      }

      router.push("/dashboard/calls");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md p-6 bg-gray-500 rounded justify-center">
      <h1 className="text-2xl font-bold mb-4">📞 Start New Call</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <input
        placeholder="Lead Name"
        value={leadName}
        onChange={(e) => setLeadName(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        placeholder="Campaign (optional)"
        value={campaign}
        onChange={(e) => setCampaign(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        onClick={handleStartCall}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Starting..." : "Start Call"}
      </button>
    </div>
  );
}
