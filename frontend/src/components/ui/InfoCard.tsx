import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
    title: string;
    value: string;
    subValue?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    delay?: number;
}

export function InfoCard({ title, value, subValue, icon: Icon, trend, delay = 0 }: InfoCardProps) {
    return (
        <div
            className="glass-card p-6 rounded-2xl relative overflow-hidden group"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-500"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all duration-300">
                    <Icon className="w-5 h-5" />
                </div>
                {subValue && (
                    <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full border",
                        trend === "up" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        trend === "down" && "bg-rose-500/10 text-rose-400 border-rose-500/20",
                        trend === "neutral" && "bg-slate-800 text-slate-400 border-slate-700"
                    )}>
                        {subValue}
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
                <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-wide">{title}</p>
            </div>
        </div>
    );
}
