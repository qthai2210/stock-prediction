"use client";

import { useState, useEffect, useCallback } from 'react';
import { api, PredictionResult } from '@/services/api';
import { InfoCard } from "@/components/ui/InfoCard";
import { PredictionChart } from "@/components/ui/PredictionChart";
import { 
    Search, 
    Loader2, 
    AlertCircle, 
    TrendingUp, 
    DollarSign, 
    Activity, 
    BarChart3, 
    ArrowRight,
    Zap
} from 'lucide-react';

export default function Dashboard() {
    const [symbol, setSymbol] = useState('VCB');
    const [loading, setLoading] = useState(false);
    const [training, setTraining] = useState(false);
    const [data, setData] = useState<PredictionResult | null>(null);
    const [error, setError] = useState('');

    const handlePredict = useCallback(async (searchSymbol: string = symbol) => {
        if (!searchSymbol) return;

        setLoading(true);
        setTraining(false);
        setError('');

        try {
            const result = await api.getPrediction(searchSymbol.toUpperCase());

            if (result.status === 'processing') {
                setTraining(true);
                setData(null);
                setTimeout(() => {
                    handlePredict(searchSymbol);
                }, 5000);
                return;
            }

            setData(result);
            setTraining(false);
        } catch {
            setError('Failed to fetch prediction. Please check the symbol and try again.');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    // Initial load
    useEffect(() => {
        handlePredict('VCB');
    }, [handlePredict]);

    const chartData = data ? [
        ...(data.history || []).map(h => ({ ...h, price: h.price * 1000 })),
        { date: 'Forecast', price: (data.prediction || 0) * 1000 }
    ] : [];

    const isUp = (data?.change_pct ?? 0) > 0;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            {/* Header with Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-white tracking-tight">
                        AI <span className="text-gradient-primary">Dashboard</span>
                    </h2>
                    <p className="text-slate-400 font-medium">Real-time predictive analytics for the Vietnam Stock Market</p>
                </div>

                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handlePredict(); }}
                        className="relative flex-1 sm:w-80 group"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            placeholder="Search symbol (e.g. FPT)..."
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium backdrop-blur-md"
                        />
                        <button type="submit" className="hidden">Search</button>
                    </form>
                    
                    <button className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group">
                        <Zap className="w-4 h-4 fill-white" />
                        Fast Analysis
                    </button>
                </div>
            </div>

            {/* Error or Training Status */}
            {error && !loading && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 animate-in fade-in zoom-in duration-300">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {training && (
                <div className="glass-panel p-12 rounded-[40px] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-8">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                        <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">Training Model for {symbol}</h3>
                        <p className="text-slate-400 max-w-md mx-auto">This is a first-time analysis for this symbol. Our AI is currently learning from historical patterns. This usually takes 15-25 seconds.</p>
                    </div>
                </div>
            )}

            {!training && !data && loading && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
            )}

            {data && !training && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <InfoCard
                            title="Current Price"
                            value={((data.latest_close || 0) * 1000).toLocaleString()}
                            subValue="VND"
                            trend="neutral"
                            icon={DollarSign}
                            delay={0}
                        />
                        <InfoCard
                            title="AI Forecast (T+1)"
                            value={Math.round((data.prediction || 0) * 1000).toLocaleString()}
                            subValue={`${isUp ? '+' : ''}${(data.change_pct || 0).toFixed(2)}%`}
                            trend={isUp ? "up" : "down"}
                            icon={TrendingUp}
                            delay={100}
                        />
                        <InfoCard
                            title="RSI (14)"
                            value={(data.indicators?.rsi ?? 50).toFixed(1)}
                            subValue={(data.indicators?.rsi ?? 50) > 70 ? "Overbought" : (data.indicators?.rsi ?? 50) < 30 ? "Oversold" : "Neutral"}
                            trend="neutral"
                            icon={Activity}
                            delay={200}
                        />
                        <InfoCard
                            title="Model Confidence"
                            value="High"
                            subValue="Based on Gradient Boosting"
                            trend="neutral"
                            icon={BarChart3}
                            delay={300}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <PredictionChart data={chartData} />
                        </div>

                        <div className="space-y-6">
                            {/* Indicators Panel */}
                            <div className="glass-panel p-8 rounded-[32px] space-y-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-indigo-400" />
                                    Technical Analysis
                                </h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-slate-400 text-sm font-bold tracking-wider uppercase">Relative Strength</span>
                                            <span className="text-indigo-400 font-mono font-bold">{(data.indicators?.rsi ?? 50).toFixed(1)}</span>
                                        </div>
                                        <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden p-0.5">
                                            <div 
                                                className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 rounded-full transition-all duration-1000" 
                                                style={{ width: `${data.indicators?.rsi ?? 50}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center font-black text-indigo-400 text-xs">MACD</div>
                                            <div>
                                                <p className="text-slate-200 font-bold">{(data.indicators?.macd ?? 0) >= 0 ? 'Bullish' : 'Bearish'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Signal Line Cross</p>
                                            </div>
                                        </div>
                                        <ArrowRight className={`w-5 h-5 ${(data.indicators?.macd ?? 0) >= 0 ? 'text-emerald-500 -rotate-45' : 'text-rose-500 rotate-45'} transition-all`} />
                                    </div>
                                </div>
                            </div>

                            {/* Top Features */}
                            <div className="glass-panel p-8 rounded-[32px]">
                                <h3 className="text-lg font-bold text-white mb-6">Price Drivers</h3>
                                <div className="space-y-5">
                                    {(data.top_features || []).slice(0, 4).map((feature) => (
                                        <div key={feature.feature} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300 text-xs font-bold capitalize">{feature.feature.replace(/_/g, ' ')}</span>
                                                <span className="text-slate-500 text-[10px] font-mono">{(feature.importance * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-800/50 h-1 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-500/50 rounded-full" 
                                                    style={{ width: `${feature.importance * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
