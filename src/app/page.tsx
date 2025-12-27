"use client";
import { useState } from "react";
import CsvUpload from "@/components/CsvUpload";

export default function Home() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [error, setError] = useState("");

  const generateScript = async () => {
    try {
      setLoading(true);
      setResult("");
      setError("");

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            "Hindi me coaching institute ke lead ke liye professional call script likho",
        }),
      });

      if (!res.ok) {
        throw new Error("AI response failed");
      }

      const data = await res.json();
      setResult(data.text);
    } catch (err: any) {
      setError("Script generate nahi ho paya");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold">📞 CallKaro AI</h1>

      <CsvUpload onUpload={setLeads} />

      {leads.length > 0 && (
        <div className="mt-4 w-full max-w-3xl">
          <h2 className="font-semibold mb-2">Uploaded Leads</h2>
          <pre className="text-sm bg-gray-100 text-black p-2 rounded overflow-auto">
            {JSON.stringify(leads, null, 2)}
          </pre>
        </div>
      )}

      <button
        onClick={generateScript}
        disabled={loading}
        className={`px-6 py-3 rounded-lg text-white ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-600"
        }`}
      >
        {loading ? "Generating..." : "Generate Call Script"}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="max-w-2xl bg-gray-100 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </main>
  );
}
