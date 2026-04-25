'use client';

import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { TrendingUp, Target, AlertTriangle, Clock, BarChart2 } from 'lucide-react';

interface StatsProps {
  stats: any;
}

export const PerformanceDashboard: React.FC<StatsProps> = ({ stats }) => {
  if (!stats) return null;

  const { summary, strategyStats, recentSignals } = stats;

  const strategyData = Object.entries(strategyStats).map(([key, value]: [string, any]) => ({
    name: key.replace('_', ' '),
    winRate: parseFloat(((value.success / (value.total || 1)) * 100).toFixed(1)),
    avgProfit: parseFloat((value.profit / (value.total || 1)).toFixed(2)),
    total: value.total
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border-b-4 border-b-indigo-500">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Signals</p>
          <h4 className="text-3xl font-bold text-white">{summary.total}</h4>
        </div>
        <div className="glass-panel p-6 rounded-3xl border-b-4 border-b-emerald-500">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Global Win Rate</p>
          <h4 className="text-3xl font-bold text-white">{summary.winRate}%</h4>
        </div>
        <div className="glass-panel p-6 rounded-3xl border-b-4 border-b-amber-500">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Strategies</p>
          <h4 className="text-3xl font-bold text-white">{Object.keys(strategyStats).length}</h4>
        </div>
      </div>

      {/* Strategy Comparison Chart */}
      <div className="glass-panel p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          Strategy Performance Comparison
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={strategyData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={150} />
              <Tooltip 
                cursor={{ fill: '#ffffff05' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Legend verticalAlign="top" align="right" height={36} />
              <Bar dataKey="winRate" fill="#6366f1" radius={[0, 4, 4, 0]} name="Win Rate (%)" barSize={20} />
              <Bar dataKey="avgProfit" fill="#10b981" radius={[0, 4, 4, 0]} name="Avg Profit (%)" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategyData.map((st) => (
          <div key={st.name} className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-16 h-16" />
            </div>
            <h4 className="text-indigo-400 font-bold text-sm mb-4 tracking-widest">{st.name}</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 text-xs">Win Rate</span>
                <span className="text-white font-bold">{st.winRate}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${st.winRate}%` }}></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-slate-400 text-xs">Samples</span>
                <span className="text-slate-300 text-xs font-medium">{st.total} signals</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent History Table */}
      <div className="glass-panel overflow-hidden rounded-3xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Execution Log</h3>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Cross-Strategy Feed</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Strategy</th>
                <th className="p-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Symbol</th>
                <th className="p-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Type</th>
                <th className="p-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Outcome</th>
                <th className="p-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentSignals.map((signal: any) => (
                <tr key={signal.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <span className="text-indigo-400 text-xs font-mono font-bold tracking-tighter uppercase px-2 py-1 rounded bg-indigo-500/5 border border-indigo-500/10">
                      {signal.strategy.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">{signal.symbol}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${signal.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {signal.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      signal.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' : 
                      signal.status === 'FAIL' ? 'text-red-400 bg-red-500/10' : 
                      'text-slate-400 bg-slate-500/10'
                    }`}>
                      {signal.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">
                    {signal.profitPct ? `${signal.profitPct > 0 ? '+' : ''}${signal.profitPct.toFixed(2)}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
