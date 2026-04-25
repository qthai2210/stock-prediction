import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import { api } from "@/services/api";
import { BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PerformancePage() {
  const stats = await api.getSignalStats().catch(e => {
    console.error(e);
    return null;
  });

  if (!stats) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
        <p className="text-white text-lg">Waiting for AI to close its first signals...</p>
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-4xl font-bold text-white tracking-tight">
              AI <span className="text-gradient-primary">Performance</span>
            </h2>
          </div>
          <p className="text-slate-400 font-medium">Historical accuracy and win rate analysis of market signals</p>
        </div>

        <div className="px-6 py-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-indigo-400" />
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Global Analytics</p>
            <p className="text-white font-bold">Accuracy: {stats.summary.winRate}%</p>
          </div>
        </div>
      </div>

      <PerformanceDashboard stats={stats} />
    </div>
  );
}
