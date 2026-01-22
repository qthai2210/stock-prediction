"use client";

import { useState } from 'react';
import { api, PredictionResult } from '@/services/api';
import { InfoCard } from "@/components/ui/InfoCard";
import { PredictionChart } from "@/components/ui/PredictionChart";
import { Search, Loader2, AlertCircle, TrendingUp, DollarSign, Activity, BarChart3 } from 'lucide-react';

export default function PredictionPage() {
    const [symbol, setSymbol] = useState('');
    const [loading, setLoading] = useState(false);
    const [training, setTraining] = useState(false);
    const [data, setData] = useState<PredictionResult | null>(null);
    const [error, setError] = useState('');

    const handlePredict = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol) return;

        setLoading(true);
        setTraining(false);
        setError('');
        setData(null);

        try {
            const result = await api.getPrediction(symbol.toUpperCase());

            // Check if there was an error indicating training
            if ('error' in result && (result as any).training) {
                setTraining(true);
                setError((result as any).error);
            } else if ('error' in result) {
                setError((result as any).error);
            } else {
                setData(result);
            }
        } catch (err: any) {
            // Check if response indicates training
            if (err?.response?.data?.training) {
                setTraining(true);
                setError(err.response.data.error || 'Training model for this symbol. This may take 15-25 seconds...');
            } else {
                setError('Failed to fetch prediction. Please check the symbol and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Use real historical data + prediction point
    const chartData = data ? [
        ...(data.history || []).map(h => ({ ...h, price: h.price * 1000 })),
        { date: 'Forecast', price: (data.prediction || 0) * 1000 }
    ] : [];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">
                        Stock <span className="text-gradient-primary">Prediction</span>
                    </h2>
                    <p className="text-slate-400 mt-2 font-medium">Advanced AI forecasting for any symbol</p>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl max-w-2xl mx-auto">
                <form onSubmit={handlePredict} className="relative flex items-center">
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
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                        Analyze
                    </button>
                </form>

                {/* Loading with training status */}
                {loading && (
                    <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mt-0.5" />
                        <div className="flex-1">
                            <p className="text-indigo-400 font-medium">
                                {training ? 'Training AI Model...' : 'Analyzing...'}
                            </p>
                            {training && (
                                <p className="text-indigo-300/70 text-sm mt-1">
                                    First-time analysis for this symbol. This may take 15-25 seconds.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Error display */}
                {error && !loading && (
                    <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${training
                            ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                        }`}>
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
            </div>

            {data && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                    {/* Cached indicator */}
                    {(data as any).cached && (
                        <div className="glass-panel p-3 rounded-xl flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-slate-300">
                                Using cached data ({(data as any).cache_age_minutes || 0} min old)
                            </span>
                        </div>
                    )}

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <InfoCard
                            title="Current Price"
                            value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((data.latest_close || 0) * 1000)}
                            trend="neutral"
                            icon={DollarSign}
                            delay={0}
                        />
                        <InfoCard
                            title="Predicted Price"
                            value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((data.prediction || 0) * 1000)}
                            subValue={`${(data.change_pct || 0) > 0 ? '+' : ''}${(data.change_pct || 0).toFixed(2)}%`}
                            trend={(data.change_pct || 0) > 0 ? "up" : "down"}
                            icon={TrendingUp}
                            delay={100}
                        />
                        <InfoCard
                            title="RSI (14)"
                            value={data.indicators?.rsi?.toFixed(1) || 'N/A'}
                            subValue={data.indicators?.rsi > 70 ? "Overbought" : data.indicators?.rsi < 30 ? "Oversold" : "Neutral"}
                            trend="neutral"
                            icon={Activity}
                            delay={200}
                        />
                        <InfoCard
                            title="MACD"
                            value={data.indicators?.macd?.toFixed(2) || '0.00'}
                            trend={(data.indicators?.macd || 0) > 0 ? "up" : "down"}
                            icon={BarChart3}
                            delay={300}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <PredictionChart data={chartData} />
                        </div>
                        <div className="glass-panel p-6 rounded-3xl">
                            <h3 className="text-lg font-bold text-white mb-6">Top Factors</h3>
                            <div className="space-y-4">
                                {(data.top_features || []).slice(0, 5).map((item, i) => (
                                    <div key={item.feature} className="group">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-slate-300 text-sm font-medium capitalize">{item.feature.replace(/_/g, ' ')}</span>
                                            <span className="text-slate-500 text-xs">{(item.importance * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                                                style={{ width: `${item.importance * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
