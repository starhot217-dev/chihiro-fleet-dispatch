
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Order, Vehicle, OrderStatus } from '../types';

interface DashboardProps {
  orders: Order[];
  vehicles: Vehicle[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders, vehicles }) => {
  const totalGMV = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
  const activeDrivers = vehicles.filter(v => v.status === 'ONLINE').length;
  
  // 模擬數據：時段訂單分佈
  const hourlyData = [
    { time: '08:00', total: 12, gmv: 4500 },
    { time: '10:00', total: 18, gmv: 6200 },
    { time: '12:00', total: 35, gmv: 12500 },
    { time: '14:00', total: 24, gmv: 8900 },
    { time: '16:00', total: 42, gmv: 15600 },
    { time: '18:00', total: 50, gmv: 19800 },
  ];

  return (
    <div className="p-4 lg:p-10 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <header>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">今日調度實況</h2>
        <p className="text-slate-500 font-medium">系統已就緒，等待連線測試</p>
      </header>

      {/* 核心數據指標 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-rose-500 transition-colors">今日總流水 (GMV)</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-rose-600">$</span>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">{totalGMV.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">在線服務司機</p>
          <p className="text-3xl font-black text-white">{activeDrivers} <span className="text-sm font-bold opacity-40">名</span></p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">已完工行程</p>
          <p className="text-3xl font-black text-slate-800 tracking-tighter">{completedOrders.length}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">平均客單價</p>
          <p className="text-3xl font-black text-slate-800 tracking-tighter">
            ${completedOrders.length > 0 ? Math.round(totalGMV / orders.length) : 0}
          </p>
        </div>
      </div>

      {/* 圖表展示區 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">流水走勢 (24H)</h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">實時同步中</span>
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

        <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">各區訂單熱力</h3>
          <div className="space-y-6">
            {[
              { label: '苓雅/新興', value: 45, color: 'bg-rose-500' },
              { label: '鳳山/三民', value: 32, color: 'bg-indigo-500' },
              { label: '左營/楠梓', value: 18, color: 'bg-emerald-500' },
              { label: '前鎮/小港', value: 5, color: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-800">{item.value}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">當前派遣效率</p>
             <p className="text-sm font-bold text-slate-700">98.5% <span className="text-[10px] font-medium text-emerald-500 ml-2">優於平均</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
