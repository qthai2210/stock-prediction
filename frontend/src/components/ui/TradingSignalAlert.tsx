"use client";

import { useWebSocket } from '@/hooks/useWebSocket';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export interface TradingSignal {
    symbol: string;
    signal: 'BUY' | 'SELL' | 'HOLD';
    currentPrice: number;
    predictedPrice: number;
    rsi: number;
    macd: number;
    timestamp: string;
    confidence: number;
}

export function TradingSignalAlert() {
    const { data: signal, connected } = useWebSocket<TradingSignal>('trading_signal');

    if (!connected) return null;
    if (!signal) return null;
    if (signal.signal === 'HOLD') return null; // Only show alerts for BUY/SELL

    const isBuy = signal.signal === 'BUY';

    return (
        <div className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-2xl backdrop-blur-md border ${isBuy ? 'bg-emerald-950/80 border-emerald-500/30' : 'bg-rose-950/80 border-rose-500/30'} flex flex-col gap-2 z-50 animate-in slide-in-from-bottom-5 w-80`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isBuy ? <ArrowUpCircle className="w-5 h-5 text-emerald-400" /> : <ArrowDownCircle className="w-5 h-5 text-rose-400" />}
                    <h4 className={`font-bold ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>{signal.signal} SIGNAL: {signal.symbol}</h4>
                </div>
                <span className="text-xs text-white/50">{new Date(signal.timestamp).toLocaleTimeString()}</span>
            </div>
            
            <div className="text-sm text-slate-300">
                <p>AI detected a strong <b className={isBuy ? 'text-emerald-400' : 'text-rose-400'}>{signal.signal}</b> condition.</p>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10">
                    <div>
                        <span className="text-white/50 text-xs">Current</span>
                        <p className="font-semibold">{signal.currentPrice.toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="text-white/50 text-xs">Predicted target</span>
                        <p className="font-semibold">{Math.round(signal.predictedPrice).toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="text-white/50 text-xs">RSI</span>
                        <p className="font-semibold">{signal.rsi.toFixed(1)}</p>
                    </div>
                    <div>
                        <span className="text-white/50 text-xs">Confidence</span>
                        <p className="font-semibold">{signal.confidence}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
