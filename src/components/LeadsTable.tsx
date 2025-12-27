"use client";

import { useState } from "react";

interface Lead {
  id: string;
  name: string;
  course: string;
  status: string;
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [localLeads, setLocalLeads] = useState(leads);

  const updateStatus = async (leadId: string, status: string) => {
    // API call
    const res = await fetch("/api/leads/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, status }),
    });

    const data = await res.json();
    if (data.success) {
      // Update frontend state
      setLocalLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status } : l))
      );
    } else {
      alert("Status update failed");
    }
  };

  return (
    <table className="w-full border mt-2 text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">Name</th>
          <th className="border p-2">Course</th>
          <th className="border p-2">Status</th>
          <th className="border p-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {localLeads.map((lead) => (
          <tr key={lead.id}>
            <td className="border p-2">{lead.name}</td>
            <td className="border p-2">{lead.course}</td>
            <td className="border p-2">{lead.status}</td>
            <td className="border p-2 space-x-2">
              <button
                className="bg-green-500 text-white px-2 py-1 rounded"
                onClick={() => updateStatus(lead.id, "INTERESTED")}
              >
                Interested
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => updateStatus(lead.id, "NOT_INTERESTED")}
              >
                Not Interested
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}






