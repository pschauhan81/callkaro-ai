"use client";

import { useState } from "react";

export default function CsvUpload({ onUpload }: { onUpload: (rows: any[]) => void }) {
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",");

      const data = lines.slice(1).map((line) => {
        const values = line.split(",");
        const row: any = {};
        headers.forEach((h, i) => (row[h.trim()] = values[i]?.trim()));
        return row;
      });

      onUpload(data);
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="border p-4 rounded-lg">
      <input type="file" accept=".csv" onChange={handleFile} />
      {loading && <p className="text-sm mt-2">Uploading...</p>}
    </div>
  );
}
