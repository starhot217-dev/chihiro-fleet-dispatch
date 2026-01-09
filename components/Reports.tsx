
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { analyzeFleetPerformance } from '../services/geminiService';
import { Order } from '../types';

interface ReportsProps {
  orders: Order[];
}

const driverData = [
  { name: '王大明', trips: 145, revenue: 52000, rating: 4.8 },
  { name: '李小美', trips: 132, revenue: 48000, rating: 4.9 },
  { name: '張老五', trips: 98, revenue: 35000, rating: 4.5 },
  { name: '陳建宏', trips: 121, revenue: 42000, rating: 4.7 },
  { name: '林淑芬', trips: 88, revenue: 31000, rating: 4.6 },
];

const vehicleUsage = [
  { name: '轎車 (Sedan)', value: 45 },
  { name: '休旅車 (SUV)', value: 25 },
  { name: '廂型車 (Van)', value: 20 },
  { name: '卡車 (Truck)', value: 10 },
];

const trendData = [
  { day: 'Mon', completed: 42, cancelled: 3 },
  { day: 'Tue', completed: 55, cancelled: 5 },
  { day: 'Wed', completed: 68, cancelled: 8 },
  { day: 'Thu', completed: 62, cancelled: 4 },
  { day: 'Fri', completed: 85, cancelled: 12 },
  { day: 'Sat', completed: 110, cancelled: 15 },
  { day: 'Sun', completed: 95, cancelled: 10 },
];

const COLORS = ['#e11d48', '#10b981', '#f59e0b', '#6366f1'];

const Reports: React.FC<ReportsProps> = ({ orders }) => {
  const [insights, setInsights] = useState<{insight: string, impact: string}[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate real metrics from orders
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status === 'COMPLETED' || o.status === 'ASSIGNED' ? o.price : 0), 0);
  const totalCommission = orders.reduce((sum, o) => sum + (o.status === 'COMPLETED' || o.status === 'ASSIGNED' ? (o.commission || o.price * 0.1) : 0), 0);
  const completedTrips = orders.filter(o => o.status === 'COMPLETED').length;

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const res = await analyzeFleetPerformance({ driverData, vehicleUsage, trendData, orders });
      setInsights(res);
      setLoading(false);
    };
    fetchInsights();
  }, [orders]);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">營運報表數據庫</h2>
          <p className="text-slate-500 font-medium">數據分析範圍：即時數據與歷史趨勢</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <i className="fas fa-file-export mr-2"></i> 匯出數據
          </button>
        </div>
      </div>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">平台抽成總額 (10%)</p>
           <h4 className="text-3xl font-black text-rose-600">${totalCommission.toLocaleString()}</h4>
           <p className="text-xs text-slate-400 mt-2 font-bold">目前系統自動計算 10% 車資</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">總營業流水 (GMV)</p>
           <h4 className="text-3xl font-black text-slate-800">${totalRevenue.toLocaleString()}</h4>
           <p className="text-xs text-emerald-500 mt-2 font-bold"><i className="fas fa-arrow-up mr-1"></i> 較上週成長 12%</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">累計完成訂單</p>
           <h4 className="text-3xl font-black text-indigo-600">{completedTrips} 趟</h4>
           <p className="text-xs text-slate-400 mt-2 font-bold">不含取消之訂單</p>
        </div>
      </div>

      {/* Gemini AI Executive Insight Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
          <div className="lg:w-1/3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-500/30 px-4 py-2 rounded-full mb-6">
              <i className="fas fa-wand-magic-sparkles text-rose-400"></i>
              <span className="text-xs font-black uppercase tracking-widest text-rose-100">AI 智慧分析</span>
            </div>
            <h3 className="text-2xl font-black mb-4">千尋數據洞察</h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              Gemini 已自動對接錢包與訂單數據，分析司機留存率與抽成穩定度。
            </p>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              [1, 2].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl animate-pulse h-32"></div>
              ))
            ) : (
              insights.map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <i className="fas fa-lightbulb"></i>
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-sm mb-2">{item.insight}</p>
                      <span className="text-xs font-black text-rose-400 uppercase tracking-wider">{item.impact}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xl text-slate-800">每日趟數趨勢</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 已完成
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> 已取消
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="completed" stroke="#e11d48" strokeWidth={4} dot={{r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                <Line type="monotone" dataKey="cancelled" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Driver Performance Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-xl text-slate-800 mb-8 flex items-center gap-3">
            <i className="fas fa-crown text-amber-500"></i> 司機績效排行
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driverData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 700}} width={100} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="trips" fill="#e11d48" radius={[0, 10, 10, 0]} barSize={24}>
                  {driverData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#be123c' : '#fb7185'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
