"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { InfoCard } from "@/components/ui/InfoCard";
import { Loader2, TrendingUp, TrendingDown, Minus, BarChart2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MarketPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any | null>(null);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await api.getMarketOverview();
            setData(result);
            setLastUpdated(new Date());
            setError('');
        } catch {
            setError('Failed to fetch market data.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchData();
        }, 30000); // 30s

        return () => clearInterval(interval);
    }, [autoRefresh, fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">
                        Market <span className="text-gradient-primary">Overview</span>
                    </h2>
                    <p className="text-slate-400 mt-2 font-medium">Real-time market indices and top movers</p>
                </div>

                {/* Refresh Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="glass-panel px-4 py-2 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-indigo-400", loading && "animate-spin")} />
                        <span className="text-sm text-slate-300">Refresh</span>
                    </button>

                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={cn(
                            "glass-panel px-4 py-2 rounded-xl transition-all flex items-center gap-2",
                            autoRefresh ? "bg-indigo-500/20 border-indigo-500/30" : "hover:bg-white/10"
                        )}
                    >
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            autoRefresh ? "bg-green-500 animate-pulse" : "bg-slate-500"
                        )} />
                        <span className="text-sm text-slate-300">Auto {autoRefresh ? 'ON' : 'OFF'}</span>
                    </button>
                </div>
            </div>

            {/* Indices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(data?.indices || []).map((idx: any, i: number) => (
                    <InfoCard
                        key={idx.symbol}
                        title={idx.symbol}
                        value={new Intl.NumberFormat('vi-VN').format(idx.price || 0)}
                        subValue={`${(idx.change_pct || 0) > 0 ? '+' : ''}${(idx.change_pct || 0).toFixed(2)}%`}
                        trend={(idx.change_pct || 0) > 0 ? "up" : (idx.change_pct || 0) < 0 ? "down" : "neutral"}
                        icon={BarChart2}
                        delay={i * 100}
                    />
                ))}
            </div>

            {/* Top 30 Stocks */}
            <div className="glass-panel p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">Top Market Cap (VN30 Proxy)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-slate-400 text-sm">
                                <th className="pb-4 pl-4 font-medium">Symbol</th>
                                <th className="pb-4 font-medium">Price</th>
                                <th className="pb-4 font-medium">Change</th>
                                <th className="pb-4 font-medium">% Change</th>
                                <th className="pb-4 pr-4 text-right font-medium">Volume</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {(data?.top_stocks || []).map((stock: any, i: number) => (
                                <tr key={stock.symbol} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-4 font-bold text-white">{stock.symbol}</td>
                                    <td className="py-4 text-slate-200">{new Intl.NumberFormat('vi-VN').format((stock.price || 0) * 1000)}</td>
                                    <td className={cn("py-4 font-medium", (stock.change || 0) > 0 ? "text-emerald-400" : (stock.change || 0) < 0 ? "text-rose-400" : "text-slate-400")}>
                                        {(stock.change || 0) > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format((stock.change || 0) * 1000)}
                                    </td>
                                    <td className={cn("py-4 font-medium", (stock.change_pct || 0) > 0 ? "text-emerald-400" : (stock.change_pct || 0) < 0 ? "text-rose-400" : "text-slate-400")}>
                                        {(stock.change_pct || 0) > 0 ? '+' : ''}{(stock.change_pct || 0).toFixed(2)}%
                                    </td>
                                    <td className="py-4 pr-4 text-right text-slate-400">
                                        {new Intl.NumberFormat('vi-VN').format(stock.volume || 0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 flex justify-between items-center text-xs">
                <span className="text-slate-600">
                    Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Loading...'}
                </span>
                {autoRefresh && (
                    <span className="text-slate-500 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Auto-refreshing every 30s
                    </span>
                )}
            </div>
        </div>
    );
}
