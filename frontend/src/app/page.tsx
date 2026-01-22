import { InfoCard } from "@/components/ui/InfoCard";
import { PredictionChart } from "@/components/ui/PredictionChart";
import { DollarSign, TrendingUp, Activity, BarChart3, ArrowRight } from "lucide-react";

// Mock Data for initial UI
const mockData = [
  { date: 'Jan 1', price: 91000 },
  { date: 'Jan 2', price: 92500 },
  { date: 'Jan 3', price: 91800 },
  { date: 'Jan 4', price: 93200 },
  { date: 'Jan 5', price: 94100 },
  { date: 'Jan 6', price: 93800 },
  { date: 'Jan 7', price: 95000 },
  { date: 'Jan 8', price: 96200 },
];

export default function Home() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Market <span className="text-gradient-primary">Overview</span>
          </h2>
          <p className="text-slate-400 mt-2 font-medium">Real-time AI analysis & predictive modeling for VCB</p>
        </div>

        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 font-medium hover:bg-slate-800 transition-all text-sm">
            Export Report
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm group">
            New Analysis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard
          title="Current Price"
          value="95,000"
          subValue="+1.2%"
          trend="up"
          icon={DollarSign}
          delay={0}
        />
        <InfoCard
          title="Predicted (T+1)"
          value="96,200"
          subValue="+1.26%"
          trend="up"
          icon={TrendingUp}
          delay={100}
        />
        <InfoCard
          title="Market Sentiment"
          value="Positive"
          subValue="Score: 0.75"
          trend="neutral"
          icon={Activity}
          delay={200}
        />
        <InfoCard
          title="Model Confidence"
          value="94.2%"
          subValue="High Accuracy"
          trend="neutral"
          icon={BarChart3}
          delay={300}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <PredictionChart data={mockData} />
        </div>

        {/* Side Panel / Indicators */}
        <div className="space-y-6">
          {/* Technical Indicators */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Technical Signal</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-sm font-medium">RSI (14)</span>
                  <span className="text-emerald-400 font-bold text-sm">62.5</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full w-[62.5%] rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                </div>
                <p className="text-right text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Neutral-Bullish</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs border border-indigo-500/20">
                    MACD
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm font-semibold">Bullish Cross</p>
                    <p className="text-slate-500 text-xs">Signal Line Crossover</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">BUY</span>
              </div>
            </div>
          </div>

          {/* Feature Importance */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Key Drivers</h3>
            <div className="space-y-2">
              {[
                { name: 'Open Price', val: 92, color: 'bg-indigo-500' },
                { name: 'Volume', val: 78, color: 'bg-cyan-500' },
                { name: 'MA_50', val: 64, color: 'bg-sky-500' },
                { name: 'Sentiment', val: 45, color: 'bg-slate-500' }
              ].map((feature, i) => (
                <div key={feature.name} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300 text-sm font-medium">{feature.name}</span>
                      <span className="text-slate-500 text-xs">{feature.val}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${feature.color} w-[${feature.val}%] rounded-full opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
