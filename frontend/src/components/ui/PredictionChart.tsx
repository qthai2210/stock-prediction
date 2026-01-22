"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PredictionChartProps {
    data: any[];
}

export function PredictionChart({ data }: PredictionChartProps) {
    return (
        <div className="glass-panel p-8 rounded-3xl h-[450px] relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white">Prediction Overview</h3>
                    <p className="text-slate-500 text-sm">AI Confidence Interval: 94.2%</p>
                </div>

                <div className="flex gap-2">
                    {['1D', '1W', '1M', '1Y'].map((period) => (
                        <button
                            key={period}
                            className="px-3 py-1 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[320px] w-full relative z-10 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.4} />
                        <XAxis
                            dataKey="date"
                            stroke="#475569"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#475569"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `${value / 1000}k`}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(2, 6, 23, 0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                padding: '12px 16px'
                            }}
                            itemStyle={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 500 }}
                            labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            activeDot={{ r: 6, stroke: '#818cf8', strokeWidth: 2, fill: '#0f172a' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
