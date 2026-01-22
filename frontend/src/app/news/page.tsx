"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { InfoCard } from "@/components/ui/InfoCard";
import { Search, Loader2, AlertCircle, Newspaper, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NewsPage() {
    const [symbol, setSymbol] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any | null>(null);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchNews = useCallback(async (sym: string) => {
        if (!sym) return;

        setLoading(true);
        setError('');

        try {
            const result = await api.getNews(sym.toUpperCase());
            setData(result);
            setLastUpdated(new Date());
        } catch {
            setError('Failed to fetch news. Please check the symbol and try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol) return;
        await fetchNews(symbol);
    };

    const handleRefresh = () => {
        if (symbol) {
            fetchNews(symbol);
        }
    };

    // Auto-refresh every 60 seconds
    useEffect(() => {
        if (!autoRefresh || !symbol || !data) return;

        const interval = setInterval(() => {
            fetchNews(symbol);
        }, 60000); // 60s

        return () => clearInterval(interval);
    }, [autoRefresh, symbol, data, fetchNews]);

    const getSentimentColor = (score: number) => {
        if (score >= 0.6) return 'text-emerald-400';
        if (score <= 0.4) return 'text-rose-400';
        return 'text-amber-400';
    };

    const getSentimentLabel = (score: number) => {
        if (score >= 0.6) return 'Positive';
        if (score <= 0.4) return 'Negative';
        return 'Neutral';
    };

    const getSentimentIcon = (score: number) => {
        if (score >= 0.6) return TrendingUp;
        if (score <= 0.4) return TrendingDown;
        return Minus;
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">
                        News <span className="text-gradient-primary">Sentiment</span>
                    </h2>
                    <p className="text-slate-400 mt-2 font-medium">AI-powered news analysis and sentiment scoring</p>
                </div>

                {/* Refresh Controls */}
                {data && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
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
                )}
            </div>

            <div className="glass-panel p-8 rounded-3xl max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative flex items-center">
                    <Search className="absolute left-4 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        placeholder="Enter Stock Symbol (e.g., VCB, FPT)..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-32 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Newspaper className="w-4 h-4" />}
                        Analyze
                    </button>
                </form>
                {error && (
                    <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
            </div>

            {data && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoCard
                            title="Sentiment Score"
                            value={((data.sentiment || 0) * 100).toFixed(0)}
                            subValue="/ 100"
                            trend="neutral"
                            icon={getSentimentIcon(data.sentiment || 0.5)}
                            delay={0}
                        />
                        <div className="md:col-span-2 glass-panel p-6 rounded-3xl flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-slate-400">Overall Mood</h3>
                                <p className={cn("text-3xl font-bold mt-1", getSentimentColor(data.sentiment || 0.5))}>
                                    {getSentimentLabel(data.sentiment || 0.5)}
                                </p>
                            </div>
                            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                                {/* Simple emoji based on sentiment */}
                                <span className="text-3xl">
                                    {(data.sentiment || 0.5) >= 0.6 ? '🚀' : (data.sentiment || 0.5) <= 0.4 ? '🐻' : '⚖️'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Newspaper className="w-5 h-5 text-indigo-400" />
                            Latest Headlines
                        </h3>
                        <div className="space-y-4">
                            {(data.headlines || []).map((headline: string, index: number) => (
                                <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <p className="text-slate-200 font-medium">{headline}</p>
                                </div>
                            ))}
                            {(!data.headlines || data.headlines.length === 0) && (
                                <p className="text-slate-500 italic">No recent news found.</p>
                            )}
                        </div>
                        <div className="mt-6 flex justify-between items-center text-xs">
                            <span className="text-slate-600">
                                Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
                            </span>
                            {autoRefresh && (
                                <span className="text-slate-500 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Auto-refreshing every 60s
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
