import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzeFleetPerformance } from '../services/geminiService';
import { Order, OrderStatus } from '../types';
import { DataService } from '../services/dataService';

const Reports: React.FC<{ orders?: Order[] }> = () => {
  const [insights, setInsights] = useState<{insight: string, impact: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbOrders, setDbOrders] = useState<Order[]>([]);

  useEffect(() => {
    const allOrders = DataService.getOrders();
    setDbOrders(allOrders);
  }, []);

  // 計算指標
  const completedOrders = dbOrders.filter(o => o.status === OrderStatus.COMPLETED);
  const totalGMV = completedOrders.reduce((sum, o) => sum + o.price, 0);
  const totalCommission = completedOrders.reduce((sum, o) => sum + (o.commission || 0), 0);
  
  // 司機表現排行
  const driverPerformance = DataService.getVehicles().map(v => {
    const vOrders = completedOrders.filter(o => o.vehicleId === v.id);
    return {
      name: v.driverName,
      revenue: vOrders.reduce((sum, o) => sum + o.price, 0),
      count: vOrders.length
    };
  }).sort((a, b) => b.revenue - a.revenue);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const res = await analyzeFleetPerformance({ orders: dbOrders, metrics: { totalGMV, totalCommission } });
      setInsights(res);
      setLoading(false);
    };
    if (dbOrders.length > 0) fetchInsights();
  }, [dbOrders]);

  return (
    <div className="p-4 lg:p-8 space-y-8 bg-slate-50 min-h-full animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">財務統計報表</h2>
          <p className="text-slate-500 font-medium text-sm">數據讀取自：核心運作資料庫</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
          <i className="fas fa-file-invoice-dollar text-xs"></i> 產出對帳明細
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">平台總收益</p>
           <h4 className="text-2xl lg:text-3xl font-black text-rose-600">${totalCommission.toLocaleString()}</h4>
           <p className="text-[10px] text-slate-400 mt-2 font-bold">已從司機儲值金中實時扣除</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">總成交總額 (GMV)</p>
           <h4 className="text-2xl lg:text-3xl font-black text-slate-800">${totalGMV.toLocaleString()}</h4>
           <p className="text-[10px] text-emerald-500 mt-2 font-bold"><i className="fas fa-trending-up mr-1"></i> 平均客單價: ${Math.round(totalGMV / (completedOrders.length || 1))}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">任務達成數</p>
           <h4 className="text-2xl lg:text-3xl font-black text-indigo-600">{completedOrders.length} 趟</h4>
           <p className="text-[10px] text-slate-400 mt-2 font-bold">成功派發且無退單紀錄</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-3">
            <i className="fas fa-chart-simple text-rose-600"></i> 司機營收排行
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driverPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 700}} width={80} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="revenue" fill="#e11d48" radius={[0, 8, 8, 0]} barSize={20}>
                  {driverPerformance.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#be123c' : '#fb7185'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-6 lg:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-wand-magic-sparkles"></i>
              </div>
              <h3 className="text-xl font-black">AI 數據庫分析建議</h3>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                [1, 2].map(i => <div key={i} className="bg-white/5 h-24 rounded-2xl animate-pulse"></div>)
              ) : (
                insights.map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all group">
                    <p className="font-bold text-slate-100 text-sm mb-2 group-hover:text-rose-400 transition-colors">{item.insight}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest bg-rose-400/10 px-2 py-0.5 rounded">建議影響</span>
                      <p className="text-[11px] text-rose-300 font-medium">{item.impact}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;