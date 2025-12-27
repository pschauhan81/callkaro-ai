import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-500">
      {/* SIDEBAR */}
      <aside className="w-60 bg-gradient-to-b from-indigo-600 to-blue-600 text-white p-5">
        <h2 className="text-xl font-bold mb-6 tracking-wide">
          🚀 CallKaro AI
        </h2>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/20 transition"
          >
            🏠 <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/calls"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/20 transition"
          >
            📞 <span>Live Calls</span>
          </Link>

          <Link
            href="/dashboard/call-logs"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/20 transition"
          >
            📄 <span>Call Logs</span>
          </Link>

          <Link
            href="/dashboard/calls/start"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/20 transition"
          >
            🎙 <span>Start Call</span>
          </Link>
        </nav>

        <div className="mt-10 text-xs text-white/70">
          © 2025 CallKaro AI
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow p-6 min-h-[85vh]">
          {children}
        </div>
      </main>
    </div>
  );
}
