"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Stats = {
  total: number;
  active: number;
  completed: number;
  failed: number;
  avgDuration: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Stats API failed");

      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const t = setInterval(fetchStats, 5000);
    return () => clearInterval(t);
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return <p>Failed to load dashboard</p>;

  const chartData = [
    { name: "Active", value: stats.active },
    { name: "Completed", value: stats.completed },
    { name: "Failed", value: stats.failed },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">📊 Dashboard</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 text-black">
        <Card title="Total Calls" value={stats.total} />
        <Card title="Active" value={stats.active} color="green" />
        <Card title="Completed" value={stats.completed} color="blue" />
        <Card title="Failed" value={stats.failed} color="red" />
        <Card
          title="Avg Duration"
          value={`${stats.avgDuration}s`}
          color="purple"
        />
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded shadow text-black">
        <h2 className="text-lg font-semibold mb-4">
          📈 Call Status Overview
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  color = "gray",
}: {
  title: string;
  value: number | string;
  color?: string;
}) {
  const colors: Record<string, string> = {
    gray: "bg-gray-200",
    green: "bg-green-200",
    blue: "bg-blue-200",
    red: "bg-red-200",
    purple: "bg-purple-200",
  };

  return (
    <div className={`${colors[color]} p-4 rounded`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
