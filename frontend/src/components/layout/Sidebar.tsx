"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Settings,
    Newspaper,
    TrendingUp,
    LineChart,
    Activity
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: TrendingUp, label: 'Prediction', href: '/prediction' },
    { icon: Newspaper, label: 'Sentiment', href: '/news' },
    { icon: LineChart, label: 'Market', href: '/market' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950/30 backdrop-blur-xl border-r border-white/5 hidden md:flex flex-col z-50">
            <div className="p-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-white">
                    Stock.AI
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-2">
                    Menu
                </p>

                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "text-white"
                                    : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-white/5 border border-white/5 rounded-lg" />
                            )}

                            <Icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                            )} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="p-4 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-emerald-400">System Nominal</span>
                    </div>
                    <p className="text-[10px] text-slate-500">v2.4.0-beta</p>
                </div>
            </div>
        </aside>
    );
}
