import { InfoCard } from "@/components/ui/InfoCard";
import { PredictionChart } from "@/components/ui/PredictionChart";
import { DollarSign, TrendingUp, Activity, BarChart3, ArrowRight } from "lucide-react";
import { api } from "@/services/api";

export default async function Home() {
  const predictionResult = await api.getPrediction('VCB').catch(e => {
    console.error(e);
    return null;
  });

  if (!predictionResult) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white">Failed to load prediction data. Are the backend services running?</p>
      </div>
    );
  }

  // Determine trend
  const isUp = predictionResult.change_pct > 0;
  
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
          value={predictionResult.latest_close.toLocaleString()}
          subValue="Latest Close"
          trend="neutral"
          icon={DollarSign}
          delay={0}
        />
        <InfoCard
          title="Predicted (T+1)"
          value={Math.round(predictionResult.prediction).toLocaleString()}
          subValue={`${isUp ? '+' : ''}${predictionResult.change_pct.toFixed(2)}%`}
          trend={isUp ? "up" : "down"}
          icon={TrendingUp}
          delay={100}
        />
        <InfoCard
          title="Market Sentiment"
          value={predictionResult.indicators.rsi > 70 ? "Overbought" : predictionResult.indicators.rsi < 30 ? "Oversold" : "Neutral"}
          subValue={`RSI: ${predictionResult.indicators.rsi.toFixed(1)}`}
          trend="neutral"
          icon={Activity}
          delay={200}
        />
        <InfoCard
          title="Model Confidence"
          value="High"
          subValue="AI Based"
          trend="neutral"
          icon={BarChart3}
          delay={300}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <PredictionChart data={predictionResult.history} />
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
                  <span className="text-emerald-400 font-bold text-sm">{predictionResult.indicators.rsi.toFixed(1)}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]`} style={{ width: `${Math.min(Math.max(predictionResult.indicators.rsi, 0), 100)}%` }}></div>
                </div>
                <p className="text-right text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                  {predictionResult.indicators.rsi > 70 ? "Overbought" : predictionResult.indicators.rsi < 30 ? "Oversold" : "Neutral"}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs border border-indigo-500/20">
                    MACD
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm font-semibold">{predictionResult.indicators.macd >= 0 ? 'Bullish' : 'Bearish'}</p>
                    <p className="text-slate-500 text-xs">Value: {predictionResult.indicators.macd.toFixed(2)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${predictionResult.indicators.macd >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border`}>
                  {predictionResult.indicators.macd >= 0 ? 'BUY' : 'SELL'}
                </span>
              </div>
            </div>
          </div>

          {/* Feature Importance */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Key Drivers</h3>
            <div className="space-y-2">
              {predictionResult.top_features?.map((feature, i) => {
                const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-sky-500', 'bg-slate-500'];
                return (
                  <div key={feature.feature} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-300 text-sm font-medium">{feature.feature}</span>
                        <span className="text-slate-500 text-xs">{(feature.importance * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[i % colors.length]} rounded-full opacity-80 group-hover:opacity-100 transition-opacity`} style={{ width: `${feature.importance * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
