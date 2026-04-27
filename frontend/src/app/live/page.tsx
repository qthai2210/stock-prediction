'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  Radio, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Activity, 
  Zap,
} from 'lucide-react';

interface TradingSignal {
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  strategy: string;
  priceAtTime: number;
  targetPrice: number;
  confidence: number;
  message: string;
  timestamp: string;
}

export default function LiveSignalsPage() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const { connected } = useWebSocket<TradingSignal>('trading_signal', (payload) => {
    setSignals(prev => [payload, ...prev].slice(0, 50)); // Keep last 50 signals
  });

  // Initial fetch for recent signals
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/signals/history`);
        if (response.ok) {
          const data = await response.json();
          // Assuming the API returns a 'recentSignals' array
          if (data.recentSignals) {
            setSignals(data.recentSignals);
          }
        }
      } catch (err) {
        console.error('Failed to fetch signal history', err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-[#020617]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gradient-primary">Live AI Signals</h1>
            <p className="text-slate-400">Theo dõi các tín hiệu giao dịch được AI cập nhật liên tục mỗi 30 giây.</p>
          </div>
          <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-2xl border border-white/5">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-sm font-semibold ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
              {connected ? 'LIVE CONNECTION' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl space-y-2">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Signals</p>
            <p className="text-3xl font-bold text-slate-200">{signals.length}</p>
          </div>
          <div className="glass-card p-6 rounded-3xl space-y-2">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Avg Confidence</p>
            <p className="text-3xl font-bold text-indigo-400">
              {signals.length > 0 
                ? (signals.reduce((acc, s) => acc + s.confidence, 0) / signals.length).toFixed(1) 
                : '0'}%
            </p>
          </div>
          <div className="glass-card p-6 rounded-3xl space-y-2">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Top Strategy</p>
            <p className="text-2xl font-bold text-cyan-400 truncate">
              {signals.length > 0 ? signals[0].strategy : '---'}
            </p>
          </div>
        </div>

        {/* Signals Feed */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2 text-slate-500 font-medium">
            <Activity className="w-4 h-4" />
            <span className="text-sm uppercase tracking-widest">Feed Update Loop</span>
          </div>

          <div className="space-y-4">
            {signals.map((signal, idx) => (
              <div 
                key={`${signal.symbol}-${idx}`}
                className="glass-panel p-6 rounded-3xl hover:bg-white/5 transition-all duration-500 group animate-in slide-in-from-top-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-6">
                  {/* Left: Symbol & Signal */}
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      signal.type === 'BUY' 
                        ? 'bg-emerald-500/10 shadow-emerald-500/10' 
                        : signal.type === 'SELL' 
                        ? 'bg-rose-500/10 shadow-rose-500/10' 
                        : 'bg-slate-500/10 shadow-slate-500/10'
                    }`}>
                      {signal.type === 'BUY' ? (
                        <ArrowUpCircle className="w-8 h-8 text-emerald-500" />
                      ) : signal.type === 'SELL' ? (
                        <ArrowDownCircle className="w-8 h-8 text-rose-500" />
                      ) : (
                        <Radio className="w-8 h-8 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-100">{signal.symbol}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black tracking-widest uppercase px-2 py-0.5 rounded ${
                          signal.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {signal.type}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{signal.strategy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Prices */}
                  <div className="flex-1 flex justify-around gap-8 min-w-[300px]">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Entry Price</p>
                      <p className="text-xl font-mono font-bold text-slate-300">
                        {signal.priceAtTime.toLocaleString()} <span className="text-xs font-normal">VND</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Target</p>
                      <p className="text-xl font-mono font-bold text-indigo-400">
                        {Math.round(signal.targetPrice).toLocaleString()} <span className="text-xs font-normal">VND</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-1000" 
                            style={{ width: `${signal.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-300">{signal.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Timestamp */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-400">{new Date(signal.timestamp).toLocaleTimeString()}</p>
                      <p className="text-[10px] text-slate-500">{new Date(signal.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all">
                      <Zap className="w-5 h-5 text-indigo-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {signals.length === 0 && (
              <div className="glass-panel p-20 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-10 h-10 text-slate-700 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-400">Waiting for live signals...</h2>
                <p className="text-slate-500 max-w-md">Hệ thống AI đang phân tích dữ liệu thị trường. Tín hiệu mới nhất sẽ xuất hiện ở đây.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
