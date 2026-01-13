
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DataService } from '../services/dataService';
import { Order, OrderStatus, Store } from '../types';

const Reports: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [viewDetail, setViewDetail] = useState(false);

  useEffect(() => {
    setOrders(DataService.getOrders());
    setStores(DataService.getStores());
  }, []);

  const completed = orders.filter(o => o.status === OrderStatus.COMPLETED);
  const cancelledCount = orders.filter(o => o.status === OrderStatus.CANCELLED).length;
  const totalSystemFee = completed.reduce((sum, o) => sum + (o.systemFee || 0), 0);
  const totalKickbackUnpaid = stores.reduce((sum, s) => sum + s.unpaidKickback, 0);

  const storeData = stores.map(s => ({
    name: s.name,
    trips: s.totalTrips,
    kickback: s.totalTrips * s.kickbackBase
  }));

  return (
    <div className="p-4 lg:p-10 space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">財務統計報表</h2>
          <p className="text-slate-500 font-medium mt-1">百回收益與店家回金透明化對帳</p>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl">匯出本月對帳單</button>
      </div>

      {/* 頂部數據卡 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">百回總收益 (平台)</p>
           <h4 className="text-4xl font-black text-rose-600 tracking-tighter">${totalSystemFee}</h4>
           <button onClick={() => setViewDetail(!viewDetail)} className="text-[10px] text-rose-500 font-black mt-3 uppercase hover:underline">
             {viewDetail ? '收起明細' : '點擊展開每筆細節'}
           </button>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">待付店家回金</p>
           <h4 className="text-4xl font-black text-indigo-600 tracking-tighter">${totalKickbackUnpaid}</h4>
           <p className="text-[10px] text-slate-400 mt-3 font-bold">目前共 {stores.length} 間特約店</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">總叫車趟數</p>
           <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{orders.length} <span className="text-lg">趟</span></h4>
           <p className="text-[10px] text-emerald-500 mt-3 font-bold">實時更新中</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">取消/無效訂單</p>
           <h4 className="text-4xl font-black text-slate-400 tracking-tighter">{cancelledCount} <span className="text-lg">趟</span></h4>
           <p className="text-[10px] text-rose-400 mt-3 font-bold">取消率: {Math.round((cancelledCount / (orders.length || 1)) * 100)}%</p>
        </div>
      </div>

      {/* 百回收益細節穿透 */}
      {viewDetail && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-in slide-in-from-top-4">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
             <h3 className="font-black text-slate-800 text-xl">百回收益流水詳情</h3>
             <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-[10px] font-black">AUDIT READY</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">結算時間</th>
                  <th className="px-8 py-5">訂單序號</th>
                  <th className="px-8 py-5 text-right">行程總價</th>
                  <th className="px-8 py-5 text-right">百回抽成</th>
                  <th className="px-8 py-5">司機</th>
                  <th className="px-8 py-5">備註</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {completed.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-4 text-xs text-slate-500">{o.createdAt}</td>
                    <td className="px-8 py-4 text-xs font-black text-slate-800 font-mono tracking-tighter">{o.displayId}</td>
                    <td className="px-8 py-4 text-xs font-black text-right">${o.price}</td>
                    <td className="px-8 py-4 text-xs font-black text-rose-600 text-right">+${o.systemFee}</td>
                    <td className="px-8 py-4 text-xs font-bold text-slate-600">{o.driverName}</td>
                    <td className="px-8 py-4 text-[10px] text-slate-400 italic">{o.note || '一般單'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 圖表與店家回帳統計 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">各特約店回金統計</h3>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400">本月趨勢</span>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'}} />
                <Bar dataKey="kickback" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={45}>
                   {storeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
           <h3 className="text-xl font-black relative z-10">各店回帳清單</h3>
           <div className="space-y-4 relative z-10 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {stores.map(store => (
                <div key={store.id} className="p-5 bg-white/5 rounded-3xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-sm font-black text-white">{store.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                      {store.totalTrips} 趟 × ${store.kickbackBase}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-400">${store.totalTrips * store.kickbackBase}</p>
                    <button 
                      onClick={() => {
                         if(confirm(`確認已支付 ${store.name} 的回金？`)) {
                           DataService.updateKickbackPaid(store.id);
                           alert('已核銷完畢');
                           window.location.reload();
                         }
                      }}
                      className="text-[9px] font-black text-slate-500 uppercase mt-1 hover:text-white transition-colors"
                    >
                      確認支付
                    </button>
                  </div>
                </div>
              ))}
           </div>
           <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">統計公式說明</p>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                回金總額 = 該店家本月有效趟數 × 該店回金基數。
                <br/>(百回收益已自動扣除司機錢包)
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
