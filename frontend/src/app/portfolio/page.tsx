'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Briefcase, 
  TrendingUp, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  History
} from 'lucide-react';

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  totalCost: number;
}

interface PortfolioData {
  balance: number;
  positions: Position[];
}

interface Order {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  status: string;
  quantity: number;
  price: number;
  createdAt: string;
}

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [portfolioRes, ordersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/orders/portfolio`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/orders/my`, { headers })
        ]);

        if (portfolioRes.ok) setData(await portfolioRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
      } catch (err) {
        console.error('Failed to fetch portfolio', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  const totalPositionsValue = data?.positions.reduce((acc: number, p) => acc + p.totalCost, 0) || 0;
  const totalValue = (data?.balance || 0) + totalPositionsValue;

  return (
    <div className="min-h-screen p-8 bg-[#020617]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient-primary">My Portfolio</h1>
          <p className="text-slate-400">Quản lý tài sản và theo dõi hiệu suất đầu tư giả lập.</p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="w-20 h-20 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Available Balance</p>
              <p className="text-4xl font-black text-slate-100">
                {data?.balance.toLocaleString()} <span className="text-lg font-normal text-slate-500">VND</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full">
              <ArrowUpRight className="w-4 h-4" />
              <span>Ready to trade</span>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <PieChart className="w-20 h-20 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Total Assets Value</p>
              <p className="text-4xl font-black text-slate-100">
                {totalValue.toLocaleString()} <span className="text-lg font-normal text-slate-500">VND</span>
              </p>
            </div>
            <p className="text-slate-500 text-sm">Including {data?.positions.length} active positions</p>
          </div>

          <div className="glass-card p-8 rounded-3xl space-y-4 bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 border-indigo-500/30">
            <div className="space-y-1">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total P/L</p>
              <p className="text-4xl font-black text-emerald-400">+0.00%</p>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Dựa trên giá khớp lệnh trung bình</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Positions Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-slate-200 flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-indigo-400" />
                Active Positions
              </h2>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Symbol</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Avg Price</th>
                    <th className="px-6 py-4">Total Cost</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.positions.map((pos) => (
                    <tr key={pos.symbol} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400">
                            {pos.symbol[0]}
                          </div>
                          <span className="font-bold text-slate-200">{pos.symbol}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">{pos.quantity}</td>
                      <td className="px-6 py-4 font-mono text-slate-300">{pos.avgPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-100">{pos.totalCost.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <button className="text-xs font-bold text-rose-400 hover:text-rose-300 uppercase tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all">
                          Sell All
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!data?.positions || data.positions.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">
                        No active positions. Start trading to see your portfolio grow!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-slate-200 flex items-center gap-3">
                <History className="w-6 h-6 text-cyan-400" />
                Recent Orders
              </h2>
            </div>
            
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      order.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {order.type === 'BUY' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{order.symbol}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black">{order.type} • {order.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-slate-300">{order.quantity} x {order.price.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-slate-600 text-sm py-10 italic">No order history found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
