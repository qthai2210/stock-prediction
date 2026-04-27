'use client';

import React, { useState } from 'react';
import { Search, TrendingUp, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StrategyResult {
  avg_profit: number;
  win_rate: number;
  trades: number;
}

interface BacktestResults {
  strategies: Record<string, StrategyResult>;
}

export default function BacktestPage() {
  const [symbol, setSymbol] = useState('VCB');
  const [days, setDays] = useState(100);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runBacktest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/prediction/${symbol}/backtest?days=${days}`);
      if (!response.ok) throw new Error('Failed to run backtest');
      const data = await response.json();
      setResults(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const chartData = results ? Object.entries(results.strategies).map(([name, data]) => ({
    name: name.replace(/_/g, ' '),
    profit: data.avg_profit,
    winRate: data.win_rate,
    trades: data.trades
  })) : [];

  return (
    <div className="min-h-screen p-8 bg-[#020617]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient-primary">AI Strategy Backtesting</h1>
          <p className="text-slate-400">Kiểm chứng hiệu quả của các chiến lược AI dựa trên dữ liệu lịch sử thị trường.</p>
        </div>

        {/* Controls */}
        <div className="glass-panel p-6 rounded-3xl flex flex-wrap gap-6 items-end">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-slate-300 ml-1">Mã cổ phiếu</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ví dụ: VCB, FPT..."
              />
            </div>
          </div>
          <div className="space-y-2 w-40">
            <label className="text-sm font-medium text-slate-300 ml-1">Số ngày</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          <button
            onClick={runBacktest}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-2xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
            Run Backtest
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Overview */}
            <div className="lg:col-span-1 space-y-6">
              {Object.entries(results.strategies).map(([name, data]) => (
                <div key={name} className="glass-card p-6 rounded-3xl hover:scale-[1.02] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-200">{name.replace(/_/g, ' ')}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${data.win_rate > 50 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {data.win_rate}% Win
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Lợi nhuận TB</p>
                      <p className={`text-xl font-bold ${data.avg_profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {data.avg_profit > 0 ? '+' : ''}{data.avg_profit}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Số lệnh</p>
                      <p className="text-xl font-bold text-slate-300">{data.trades}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Chart */}
            <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-xl font-bold text-slate-200">Hiệu suất So sánh</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span>Lợi nhuận (%)</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #1e293b',
                        borderRadius: '16px',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="profit" radius={[8, 8, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.profit > 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {!results && !loading && (
          <div className="glass-panel p-20 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-10 h-10 text-slate-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-400">Sẵn sàng để kiểm chứng</h2>
            <p className="text-slate-500 max-w-md">Nhập mã cổ phiếu và số ngày để bắt đầu chạy mô phỏng hiệu suất chiến lược.</p>
          </div>
        )}
      </div>
    </div>
  );
}
