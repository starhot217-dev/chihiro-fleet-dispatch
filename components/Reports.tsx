
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { DataService } from '../services/dataService';
import { analyzeFleetPerformance } from '../services/geminiService';
import { Order, OrderStatus, Store, Vehicle } from '../types';

const Reports: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [o, s, v] = await Promise.all([
        DataService.getOrders(),
        DataService.getStores(),
        DataService.getVehicles()
      ]);
      setOrders(o);
      setStores(s);
      setVehicles(v);
    };
    loadData();
  }, []);

  const completed = orders.filter(o => o.status === OrderStatus.COMPLETED);
  const totalSystemFee = completed.reduce((sum, o) => sum + (o.systemFee || 0), 0);
  
  // 計算司機業績排行
  const driverPerformance = vehicles.map(v => {
    const vOrders = completed.filter(o => o.vehicleId === v.id);
    return {
      name: v.driverName,
      count: vOrders.length,
      revenue: vOrders.reduce((sum, o) => sum + o.price, 0),
      systemFee: vOrders.reduce((sum, o) => sum + o.systemFee, 0)
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const stats = {
      totalOrders: orders.length,
      completedRate: (completed.length / (orders.length || 1) * 100).toFixed(1) + '%',
      topStore: stores.sort((a, b) => b.totalTrips - a.totalTrips)[0]?.name,
      activeDrivers: vehicles.filter(v => v.status === 'ONLINE').length
    };
    const insight = await analyzeFleetPerformance(stats);
    setAiInsight(insight || "分析完成，數據表現穩定。");
    setIsAnalyzing(false);
  };

  const exportCSV = () => {
    alert("正在生成本月對帳 CSV 檔案... (模擬下載)");
  };

  return (
    <div className="p-4 lg:p-10 space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">財務統計與 AI 洞察</h2>
          <p className="text-slate-500 font-medium mt-1 italic">數據驅動決策：高雄 HUB 營運報表系統</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleAiAnalysis} disabled={isAnalyzing} className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
            <i className={`fas ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
            {isAnalyzing ? 'AI 分析中...' : 'AI 營運建議'}
          </button>
          <button onClick={exportCSV} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all">
            <i className="fas fa-file-csv mr-2"></i> 匯出本月對帳單
          </button>
        </div>
      </header>

      {/* AI Insight Section */}
      {aiInsight && (
        <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[3rem] animate-in slide-in-from-top-4">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
               <i className="fas fa-robot"></i>
             </div>
             <h3 className="text-lg font-black text-indigo-900 uppercase tracking-widest">千尋營運導師建議</h3>
           </div>
           <p className="text-indigo-800 leading-relaxed font-medium whitespace-pre-wrap">{aiInsight}</p>
        </div>
      )}

      {/* 關鍵財務指標 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: '平台總抽成 (淨利)', val: `$${totalSystemFee}`, color: 'text-rose-600', sub: '本月累積' },
          { label: '營運成交率', val: `${(completed.length / (orders.length || 1) * 100).toFixed(1)}%`, color: 'text-emerald-600', sub: '目標 95%' },
          { label: '待付店家回金', val: `$${stores.reduce((sum, s) => sum + s.unpaidKickback, 0)}`, color: 'text-indigo-600', sub: '待核銷' },
          { label: '平均客單價', val: `$${completed.length > 0 ? Math.round(completed.reduce((s, o) => s + o.price, 0) / completed.length) : 0}`, color: 'text-slate-800', sub: '全區域統計' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
             <h4 className={`text-3xl font-black ${card.color} tracking-tighter`}>{card.val}</h4>
             <p className="text-[10px] text-slate-400 mt-3 font-bold">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 司機業績榜 */}
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
             <h3 className="font-black text-slate-800 text-xl">司機業績排行榜 (月度)</h3>
             <i className="fas fa-trophy text-amber-500 text-2xl"></i>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-10 py-6">排名 / 司機名稱</th>
                  <th className="px-10 py-6 text-center">趟數</th>
                  <th className="px-10 py-6 text-right">流水總額 (GMV)</th>
                  <th className="px-10 py-6 text-right">貢獻佣金</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {driverPerformance.map((d, i) => (
                  <tr key={i} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-4">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] ${
                          i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-black text-slate-800">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-5 text-center font-bold text-slate-600">{d.count}</td>
                    <td className="px-10 py-5 text-right font-black text-slate-900">${d.revenue}</td>
                    <td className="px-10 py-5 text-right font-black text-rose-500">+${d.systemFee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 店家回金佔比 */}
        <div className="lg:col-span-4 bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
           <h3 className="text-xl font-black mb-8 relative z-10">店家貢獻分析</h3>
           <div className="h-64 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={stores}
                      dataKey="totalTrips"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                       {stores.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#e11d48', '#6366f1', '#10b981', '#f59e0b'][index % 4]} />
                       ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-4 mt-8 relative z-10">
              {stores.map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${['bg-rose-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500'][i % 4]}`}></div>
                      <span className="text-xs font-bold text-slate-400">{s.name}</span>
                   </div>
                   <span className="text-sm font-black">{s.totalTrips} 趟</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
