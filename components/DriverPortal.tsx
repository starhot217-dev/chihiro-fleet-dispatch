
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Vehicle, WalletLog } from '../types';
import { DataService } from '../services/dataService';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface DriverPortalProps {
  orders: Order[];
  vehicles: Vehicle[];
  onStartOrder: (orderId: string, destination: string) => void;
  onCompleteOrder: (orderId: string) => void;
  onAcceptOrder: (orderId: string) => void;
  onResetData?: () => void;
}

const DriverPortal: React.FC<DriverPortalProps> = ({ orders, vehicles, onStartOrder, onCompleteOrder, onAcceptOrder, onResetData }) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'wallet' | 'stats'>('orders');
  const [destInput, setDestInput] = useState('');
  
  // 模擬「目前登入司機」為米修 (V2)
  const myVehicle = vehicles.find(v => v.id === 'V2') || vehicles[0];
  const myOrders = orders.filter(o => o.vehicleId === myVehicle.id);
  const myActiveOrder = orders.find(o => o.vehicleId === myVehicle.id && [OrderStatus.PICKING_UP, OrderStatus.IN_TRANSIT].includes(o.status));
  const availableOrders = orders.filter(o => o.status === OrderStatus.DISPATCHING);
  const walletHistory = DataService.getWalletLogs(myVehicle.id);

  // 計算統計
  const completedCount = myOrders.filter(o => o.status === OrderStatus.COMPLETED).length;
  const todayRevenue = myOrders.filter(o => o.status === OrderStatus.COMPLETED).reduce((sum, o) => sum + o.price, 0);

  const weeklyStats = [
    { day: '週一', income: 1200 },
    { day: '週二', income: 800 },
    { day: '週三', income: 1500 },
    { day: '週四', income: 2100 },
    { day: '週五', income: 1800 },
    { day: '週六', income: todayRevenue || 1250 },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* 司機頭部資訊 */}
      <div className="bg-white px-6 py-6 border-b border-slate-100 flex items-center justify-between shadow-sm sticky top-0 z-[60]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 p-0.5 border border-rose-100">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${myVehicle.driverName}`} className="w-full h-full rounded-xl" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">{myVehicle.driverName}</h2>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{myVehicle.plateNumber}</span>
               <div className={`w-1.5 h-1.5 rounded-full ${myVehicle.status === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">錢包餘額</p>
          <p className="text-xl font-black text-emerald-600">${myVehicle.walletBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* 導覽切換 */}
      <div className="flex bg-white px-2 py-2 gap-2 shadow-sm relative z-50">
        {[
          { id: 'orders', label: '我的任務', icon: 'fa-steering-wheel' },
          { id: 'wallet', label: '我的錢包', icon: 'fa-wallet' },
          { id: 'stats', label: '業績統計', icon: 'fa-chart-line' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeSubTab === tab.id ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <i className={`fas ${tab.icon} text-sm`}></i>
            <span className="text-[10px] font-black">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {activeSubTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 進行中任務卡片 */}
            {myActiveOrder ? (
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                      {myActiveOrder.status === OrderStatus.PICKING_UP ? '前往載客' : '行程中'}
                    </span>
                    <span className="text-[10px] font-mono opacity-40">{myActiveOrder.displayId}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">上車地址</p>
                        <p className="text-base font-bold leading-snug">{myActiveOrder.pickup}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${myActiveOrder.status === OrderStatus.IN_TRANSIT ? 'bg-emerald-500' : 'bg-white/20'}`}></div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">目的地</p>
                        {myActiveOrder.status === OrderStatus.PICKING_UP ? (
                          <div className="mt-3 space-y-4">
                            <input 
                              type="text" 
                              value={destInput}
                              onChange={e => setDestInput(e.target.value)}
                              placeholder="載到客後在此輸入目的地..."
                              className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white/10 focus:border-rose-500 transition-all placeholder:text-slate-600"
                            />
                            <button 
                              onClick={() => { onStartOrder(myActiveOrder.id, destInput); setDestInput(''); }}
                              disabled={!destInput.trim()}
                              className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl transition-all ${destInput.trim() ? 'bg-white text-slate-900 active:scale-95' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                            >
                              載到客人：開始行程
                            </button>
                          </div>
                        ) : (
                          <p className="text-base font-bold text-emerald-400">{myActiveOrder.destination}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {myActiveOrder.status === OrderStatus.IN_TRANSIT && (
                    <div className="pt-6 border-t border-white/10 flex flex-col gap-5">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">預估車資總額</p>
                          <p className="text-4xl font-black text-white">${myActiveOrder.price}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-bold text-rose-500 uppercase">預計抽成 15%</p>
                           <p className="text-sm font-black text-slate-400">-${Math.round(myActiveOrder.price * 0.15)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onCompleteOrder(myActiveOrder.id)}
                        className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-900/40 hover:bg-rose-500 active:scale-95 transition-all"
                      >
                        已抵達目的地：完成訂單
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 rounded-[2.5rem] p-10 border border-emerald-100 flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white text-3xl shadow-xl shadow-emerald-200 animate-pulse">
                   <i className="fas fa-satellite-dish"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-900 tracking-tight">您目前處於待命狀態</h3>
                  <p className="text-emerald-600/70 text-xs font-bold leading-relaxed">系統正在高雄熱區掃描新廣播任務...<br/>請留意下方列表</p>
                </div>
              </div>
            )}

            {/* 可搶單任務清單 */}
            <div className="space-y-4">
               <div className="flex justify-between items-center px-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-bullhorn text-rose-500"></i>
                    附近可用新任務
                  </h3>
                  <span className="text-[10px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{availableOrders.length} 件</span>
               </div>
               
               {availableOrders.length === 0 ? (
                 <div className="py-20 text-center space-y-4 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                       <i className="fas fa-inbox text-2xl text-slate-200"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-300">目前暫無可領取的廣播</p>
                      <button onClick={onResetData} className="mt-4 text-[10px] font-black text-rose-500 uppercase underline tracking-widest">
                        重新生成測試數據
                      </button>
                    </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {availableOrders.map(order => (
                     <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-center mb-4">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                            order.planId === 'driver_return' ? 'bg-indigo-50 text-indigo-500' : 
                            order.planId === 'store_booking' ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
                          }`}>
                            {order.planName}
                          </span>
                          <span className="text-[10px] text-slate-300 font-mono">{order.displayId}</span>
                        </div>
                        <div className="space-y-1 mb-6">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">上車地址</p>
                          <p className="text-base font-black text-slate-800 leading-snug">{order.pickup}</p>
                          {order.note && <p className="text-[10px] text-rose-500 font-bold mt-2">註：{order.note}</p>}
                        </div>
                        <button 
                          onClick={() => onAcceptOrder(order.id)}
                          className="w-full py-4 bg-[#00b900] text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/10 hover:bg-[#00a300] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-hand-pointer"></i> 立即搶單
                        </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        )}

        {activeSubTab === 'wallet' && (
          <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">司機帳戶儲值餘額</p>
              <h3 className="text-5xl font-black text-emerald-500 tracking-tighter">${myVehicle.walletBalance.toLocaleString()}</h3>
              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">本週抽成總計</p>
                  <p className="text-xl font-black text-rose-500">$1,450</p>
                </div>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">錢包健康度</p>
                  <p className="text-xl font-black text-emerald-500">優良</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[400px]">
               <h3 className="text-sm font-black text-slate-800 mb-6 px-2 uppercase tracking-widest">最近交易明細</h3>
               <div className="space-y-4">
                 {walletHistory.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-slate-300 space-y-3">
                      <i className="fas fa-file-invoice-dollar text-3xl"></i>
                      <p className="text-xs font-bold italic">尚無歷史交易紀錄</p>
                   </div>
                 ) : (
                   walletHistory.map(log => (
                     <div key={log.id} className="flex justify-between items-center p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                       <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm shadow-sm ${log.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                           <i className={`fas ${log.amount > 0 ? 'fa-plus' : 'fa-minus'}`}></i>
                         </div>
                         <div>
                           <p className="text-[12px] font-black text-slate-800">{log.type === 'TOPUP' ? '系統儲值入帳' : '平台派單抽成'}</p>
                           <p className="text-[10px] text-slate-400 font-bold">{log.timestamp}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className={`text-base font-black ${log.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                           {log.amount > 0 ? `+${log.amount}` : log.amount}
                         </p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">後餘額 ${log.balanceAfter}</p>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        )}

        {activeSubTab === 'stats' && (
          <div className="space-y-6 pb-24 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">今日跑單量</p>
                <p className="text-3xl font-black text-rose-600">{completedCount}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">今日總營收</p>
                <p className="text-3xl font-black text-slate-800">${todayRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-80">
              <h3 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-widest">本週每日收入趨勢</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                  <Bar dataKey="income" fill="#e11d48" radius={[8, 8, 0, 0]} barSize={28}>
                    {weeklyStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 5 ? '#e11d48' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="flex items-start gap-6 relative z-10">
                  <div className="w-16 h-16 bg-rose-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl shadow-xl shadow-rose-900/40">
                     <i className="fas fa-medal"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight mb-2">合作司機光榮榜</h3>
                    <p className="text-slate-400 text-sm font-bold uppercase mb-4 tracking-widest">全台排行: 第 14 名</p>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium bg-white/5 p-4 rounded-2xl border border-white/5">
                      「米修」師傅您好！您的店家方案接單率維持在 98% 以上，這讓您在離峰時段優先獲得系統推薦單。繼續保持優質服務，累積更多乘客好評！
                    </p>
                  </div>
               </div>
            </div>

            <button 
              onClick={onResetData}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
            >
              初始化所有測試數據環境
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverPortal;
