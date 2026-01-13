
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Order, Vehicle, OrderStatus } from '../types';

interface DashboardProps {
  orders: Order[];
  vehicles: Vehicle[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders, vehicles }) => {
  const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
  const totalGMV = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const activeDrivers = vehicles.filter(v => v.status === 'ONLINE').length;
  const dispatchingCount = orders.filter(o => o.status === OrderStatus.DISPATCHING).length;
  
  // 基於測試訂單動態產生的時間分佈數據
  const hourlyData = [
    { time: '08:00', gmv: 4500 },
    { time: '10:00', gmv: 6200 },
    { time: '12:00', gmv: totalGMV > 0 ? totalGMV : 12500 },
    { time: '14:00', gmv: 8900 },
    { time: '16:00', gmv: 15600 },
    { time: '現在', gmv: totalGMV },
  ];

  return (
    <div className="p-4 lg:p-10 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">今日調度實況 (模擬模式)</h2>
          <p className="text-slate-500 font-medium">系統正在監控高雄全區域之派遣節點</p>
        </div>
        <div className="bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 flex items-center gap-3">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
           </span>
           <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">模擬環境測試中</span>
        </div>
      </header>

      {/* 核心數據指標 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-rose-500 transition-colors">今日總流水 (模擬)</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-rose-600">$</span>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">{totalGMV.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">在線模擬司機</p>
          <p className="text-3xl font-black text-white">{activeDrivers} <span className="text-sm font-bold opacity-40">名</span></p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">待指派訂單</p>
          <p className={`text-3xl font-black tracking-tighter ${dispatchingCount > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-800'}`}>
            {dispatchingCount}
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">已完工模擬行程</p>
          <p className="text-3xl font-black text-slate-800 tracking-tighter">{completedOrders.length}</p>
        </div>
      </div>

      {/* 圖表展示區 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">流水走勢 (模擬數據)</h3>
            <div className="flex gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">隨訂單自動跳動</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="gmv" stroke="#e11d48" strokeWidth={4} fillOpacity={1} fill="url(#colorGmv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">派遣效率評分</h3>
          <div className="flex-1 flex flex-col justify-center items-center text-center">
             <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90">
                   <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                   <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502} strokeDashoffset={502 * (1 - 0.985)} className="text-rose-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-black text-slate-800">98.5</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase">Score</span>
                </div>
             </div>
             <p className="text-sm font-bold text-slate-700">派遣平均延遲 1.2s</p>
             <p className="text-[10px] text-emerald-500 font-black uppercase mt-1 tracking-widest">Excellent Status</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
