"use client";

import { InfoCard } from "@/components/ui/InfoCard";
import { Settings, Server, Cpu, Database, Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
        }, 1500);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            <div>
                <h2 className="text-4xl font-bold text-white tracking-tight">
                    System <span className="text-gradient-primary">Settings</span>
                </h2>
                <p className="text-slate-400 mt-2 font-medium">Configure AI model parameters and system preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard
                    title="Model Status"
                    value="Active"
                    trend="neutral"
                    icon={Cpu}
                    delay={0}
                    subValue="v2.1.0"
                />
                <InfoCard
                    title="API Health"
                    value="Online"
                    trend="up"
                    icon={Server}
                    delay={100}
                    subValue="99.9% Uptime"
                />
                <InfoCard
                    title="Database"
                    value="Connected"
                    trend="neutral"
                    icon={Database}
                    delay={200}
                    subValue="PostgreSQL"
                />
            </div>

            <div className="glass-panel p-8 rounded-3xl max-w-3xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-400" />
                    General Configuration
                </h3>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Default Stock Symbol</label>
                        <input
                            type="text"
                            defaultValue="VCB"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Data Refresh Interval (Minutes)</label>
                        <input
                            type="number"
                            defaultValue="15"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div>
                            <p className="text-slate-200 font-medium">Auto-Retrain Model</p>
                            <p className="text-xs text-slate-500">Automatically retrain model when new data is available</p>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-all flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl max-w-3xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 text-rose-400">
                    <RefreshCw className="w-5 h-5" />
                    Danger Zone
                </h3>
                <p className="text-slate-400 mb-6 text-sm">Manually triggering a retrain will consume significant server resources.</p>
                <button className="px-6 py-2.5 rounded-xl border border-rose-500/50 text-rose-400 font-medium hover:bg-rose-500/10 transition-colors w-full sm:w-auto">
                    Retrain All Models Now
                </button>
            </div>
        </div>
    );
}
