
import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, Vehicle, WalletLog } from '../types';
import { DataService } from '../services/dataService';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface DriverPortalProps {
  orders: Order[];
  vehicles: Vehicle[];
  onStartOrder: (orderId: string, destination: string) => Promise<void> | void;
  onCompleteOrder: (orderId: string) => void;
  onAcceptOrder: (orderId: string) => void;
  onResetData?: () => void;
}

const DriverPortal: React.FC<DriverPortalProps> = ({ orders, vehicles, onStartOrder, onCompleteOrder, onAcceptOrder, onResetData }) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'wallet' | 'stats'>('orders');
  const [destInput, setDestInput] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [lastFinishedOrder, setLastFinishedOrder] = useState<Order | null>(null);

  // 模擬「目前登入司機」為米修 (V2)
  const myVehicle = vehicles.find(v => v.id === 'V2') || vehicles[0];
  const myOrders = orders.filter(o => o.vehicleId === myVehicle.id);
  const myActiveOrder = orders.find(o => o.vehicleId === myVehicle.id && [OrderStatus.PICKING_UP, OrderStatus.IN_TRANSIT].includes(o.status));
  const availableOrders = orders.filter(o => o.status === OrderStatus.DISPATCHING);
  const walletHistory = DataService.getWalletLogs(myVehicle.id);

  // 計算統計
  const completedCount = myOrders.filter(o => o.status === OrderStatus.COMPLETED).length;
  const todayRevenue = myOrders.filter(o => o.status === OrderStatus.COMPLETED).reduce((sum, o) => sum + o.price, 0);
  const dailyGoal = 3000;
  const progress = Math.min(100, (todayRevenue / dailyGoal) * 100);

  const weeklyStats = [
    { day: '週一', income: 1200 },
    { day: '週二', income: 800 },
    { day: '週三', income: 1500 },
    { day: '週四', income: 2100 },
    { day: '週五', income: 1800 },
    { day: '週六', income: todayRevenue || 1250 },
  ];

  const handleSelfTopUp = () => {
    DataService.updateVehicleWallet(myVehicle.id, topUpAmount);
    setShowTopUpModal(false);
    alert(`儲值成功！已存入 $${topUpAmount}`);
  };

  const handleStartWithLoading = async (orderId: string) => {
    if (!destInput.trim()) return;
    setIsCalculating(true);
    try {
      await onStartOrder(orderId, destInput);
      setDestInput('');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCompleteWithFeedback = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setLastFinishedOrder(order);
      onCompleteOrder(orderId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-200">
      {/* 司機頭部 */}
      <div className="bg-[#1e293b] px-6 py-6 border-b border-slate-800 flex items-center justify-between shadow-xl sticky top-0 z-[60]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 p-0.5 border-2 border-rose-500 shadow-lg shadow-rose-500/20">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${myVehicle.driverName}`} className="w-full h-full rounded-xl" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-[#1e293b] rounded-full"></div>
          </div>
          <div>
            <h2 className="text-lg font-black text-white">{myVehicle.driverName}</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{myVehicle.plateNumber} • 線上服務中</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">可用餘額</p>
          <p className={`text-2xl font-black tracking-tighter ${myVehicle.walletBalance < 200 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
            ${myVehicle.walletBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 下方導航 */}
      <div className="flex bg-[#1e293b] px-3 py-3 gap-3 shadow-2xl relative z-50">
        {[
          { id: 'orders', label: '接單/任務', icon: 'fa-steering-wheel' },
          { id: 'wallet', label: '我的錢包', icon: 'fa-wallet' },
          { id: 'stats', label: '業績統計', icon: 'fa-chart-mixed' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all duration-300 ${
              activeSubTab === tab.id ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/30 scale-105' : 'text-slate-500 hover:bg-slate-800'
            }`}
          >
            <i className={`fas ${tab.icon} text-sm`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar pb-24">
        {activeSubTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">
            {myActiveOrder ? (
              <div className="bg-[#1e293b] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-slate-700/50">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-600/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                        {myActiveOrder.status === OrderStatus.PICKING_UP ? '正在前往上車地點' : '行程載客中 (座標即時結算)'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{myActiveOrder.displayId}</span>
                  </div>

                  <div className="bg-slate-900/50 p-6 rounded-3xl space-y-6 border border-slate-800">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1 mt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]"></div>
                        <div className="w-0.5 flex-1 bg-slate-700 border-dashed border-l"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                      </div>
                      <div className="flex-1 space-y-5">
                        <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">乘客上車點</p>
                          <p className="text-base font-bold text-slate-200 leading-tight">{myActiveOrder.pickup}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">目的地</p>
                          {myActiveOrder.status === OrderStatus.PICKING_UP ? (
                            <div className="mt-4 space-y-4">
                              <div className="relative">
                                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"></i>
                                <input 
                                  type="text" 
                                  value={destInput}
                                  onChange={e => setDestInput(e.target.value)}
                                  placeholder="輸入目的地以啟動約估計費..."
                                  className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl pl-11 pr-5 py-4 text-sm font-bold text-white outline-none focus:border-rose-500 transition-all placeholder:text-slate-600"
                                  disabled={isCalculating}
                                />
                              </div>
                              <button 
                                onClick={() => handleStartWithLoading(myActiveOrder.id)}
                                disabled={!destInput.trim() || isCalculating}
                                className={`w-full py-5 rounded-2xl font-black text-sm shadow-2xl transition-all flex items-center justify-center gap-3 ${
                                  destInput.trim() && !isCalculating ? 'bg-white text-slate-900 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                              >
                                {isCalculating ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-slate-600 border-t-rose-500 rounded-full animate-spin"></div>
                                    地理引擎計算中...
                                  </>
                                ) : (
                                  "接到乘客：啟動行程"
                                )}
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-base font-bold text-emerald-400 leading-tight">{myActiveOrder.destination}</p>
                              <div className="mt-3 flex gap-2">
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 font-mono">
                                  {myActiveOrder.note?.split(' (')[1]?.replace(')', '') || '精準座標運算中'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {myActiveOrder.status === OrderStatus.IN_TRANSIT && (
                    <div className="pt-2 flex flex-col gap-5 animate-in slide-in-from-top-4">
                      <div className="bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">總估車資</p>
                          <p className="text-4xl font-black text-emerald-400 tracking-tighter">${myActiveOrder.price}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                           <div className="text-left">
                              <p className="text-[9px] font-bold text-slate-500 uppercase">預扣佣金 (15%)</p>
                              <p className="text-sm font-black text-rose-500">-${Math.round(myActiveOrder.price * 0.15)}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-bold text-slate-500 uppercase">本趟淨利</p>
                              <p className="text-xl font-black text-white">${Math.round(myActiveOrder.price * 0.85)}</p>
                           </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCompleteWithFeedback(myActiveOrder.id)}
                        className="w-full py-6 bg-rose-600 text-white rounded-[2.2rem] font-black text-xl shadow-2xl shadow-rose-900/40 hover:bg-rose-500 active:scale-95 transition-all"
                      >
                        抵達下車點：確認收現
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#1e293b] rounded-[3.5rem] p-12 border border-slate-800 flex flex-col items-center text-center space-y-6 shadow-2xl">
                <div className="w-24 h-24 bg-rose-600/10 rounded-[2.5rem] flex items-center justify-center text-rose-500 text-4xl shadow-inner border border-rose-500/20 animate-pulse">
                   <i className="fas fa-broadcast-tower"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">掃描全高雄即時單...</h3>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed mt-2 uppercase tracking-widest">IDLE • 服務等待中</p>
                </div>
              </div>
            )}

            {/* 廣播大廳 */}
            <div className="space-y-5">
               <div className="flex justify-between items-center px-4">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    即時派遣池
                  </h3>
                  <span className="text-[10px] font-black bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full border border-rose-500/20">{availableOrders.length} 件</span>
               </div>
               
               {availableOrders.length === 0 ? (
                 <div className="py-20 text-center space-y-4 bg-[#1e293b]/30 rounded-[3rem] border border-dashed border-slate-800">
                    <i className="fas fa-inbox text-3xl text-slate-700"></i>
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">目前沒有可用任務</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-4">
                   {availableOrders.map(order => (
                     <div key={order.id} className="bg-[#1e293b] p-7 rounded-[2.5rem] border border-slate-800 shadow-xl hover:bg-slate-800 transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-5">
                          <span className="px-3 py-1 bg-rose-600/10 border border-rose-600/20 rounded-full text-[9px] font-black text-rose-500 uppercase tracking-widest">
                            {order.planName}
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono">{order.displayId}</p>
                        </div>
                        <div className="space-y-4 mb-6">
                           <div>
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">上車地</p>
                             <p className="text-lg font-black text-white leading-tight">{order.pickup}</p>
                           </div>
                           <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] font-bold text-slate-500">預估單價</span>
                              <span className="text-xl font-black text-emerald-400">${order.price > 0 ? order.price : '載客後結算'}</span>
                           </div>
                        </div>
                        <button 
                          onClick={() => onAcceptOrder(order.id)}
                          className="w-full py-4.5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                          <i className="fas fa-check-double"></i> 承接此行程
                        </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        )}

        {activeSubTab === 'wallet' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-slate-700/50">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">司機電子錢包</p>
                <h3 className="text-6xl font-black text-white tracking-tighter mb-10">
                  <span className="text-emerald-500 text-3xl mr-1">$</span>
                  {myVehicle.walletBalance.toLocaleString()}
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-5 rounded-3xl border border-white/5 backdrop-blur-md text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">今日總抽成</p>
                    <p className="text-xl font-black text-rose-500">
                      -${myOrders.filter(o => o.status === OrderStatus.COMPLETED).reduce((sum, o) => sum + (o.commission || 0), 0)}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowTopUpModal(true)}
                    className="bg-emerald-600 p-5 rounded-3xl border border-emerald-500 shadow-xl shadow-emerald-900/40 flex flex-col items-center justify-center hover:bg-emerald-500 transition-all group"
                  >
                    <i className="fas fa-plus-circle text-xl mb-1 group-hover:scale-110 transition-transform"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest">快速加值</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b] rounded-[3rem] p-8 shadow-sm border border-slate-800 min-h-[400px]">
               <h3 className="text-xs font-black text-slate-500 mb-8 uppercase tracking-[0.3em]">交易流水 (含 15% 抽成紀錄)</h3>
               <div className="space-y-4">
                 {walletHistory.length === 0 ? (
                   <div className="py-20 text-center text-slate-700">
                      <p className="text-xs font-bold italic">尚無歷史紀錄</p>
                   </div>
                 ) : (
                   walletHistory.map(log => (
                     <div key={log.id} className="flex justify-between items-center p-5 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
                       <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm ${log.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                           <i className={`fas ${log.amount > 0 ? 'fa-piggy-bank' : 'fa-receipt'}`}></i>
                         </div>
                         <div>
                           <p className="text-sm font-black text-slate-200">{log.type === 'TOPUP' ? '系統儲值' : '行程抽成 (15%)'}</p>
                           <p className="text-[10px] text-slate-500 font-bold">{log.timestamp}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className={`text-base font-black ${log.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {log.amount > 0 ? `+${log.amount}` : log.amount}
                         </p>
                         <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">餘額 ${log.balanceAfter}</p>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        )}

        {activeSubTab === 'stats' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-6">
            <div className="bg-[#1e293b] p-8 rounded-[3.5rem] border border-slate-800 shadow-2xl">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">今日毛利進度</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">目標收入: ${dailyGoal}</p>
                </div>
                <p className="text-3xl font-black text-emerald-400">{Math.round(progress)}%</p>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-8">
                <div className="text-center bg-slate-900/30 p-8 rounded-3xl border border-slate-800 shadow-inner">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">累計行程</p>
                  <p className="text-4xl font-black text-white">{completedCount}</p>
                </div>
                <div className="text-center bg-slate-900/30 p-8 rounded-3xl border border-slate-800 shadow-inner">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">今日淨利 (抽後)</p>
                  <p className="text-4xl font-black text-emerald-400">${Math.round(todayRevenue * 0.85)}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b] p-8 rounded-[3rem] border border-slate-800 h-[320px]">
              <h3 className="text-xs font-black text-slate-500 mb-8 uppercase tracking-[0.3em]">本週淨收入趨勢 (扣抽後)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#475569'}} />
                  <Bar dataKey="income" fill="#e11d48" radius={[8, 8, 0, 0]} barSize={28}>
                    {weeklyStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 5 ? '#e11d48' : '#334155'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 儲值 Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f172a]/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-[3.5rem] p-10 border border-slate-700 shadow-2xl space-y-8 animate-in zoom-in-95">
             <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                  <i className="fas fa-piggy-bank"></i>
                </div>
                <h3 className="text-2xl font-black text-white">點數儲值</h3>
                <p className="text-slate-500 text-xs font-bold mt-2">儲值將用於自動扣除 15% 系統佣金</p>
             </div>
             <div className="grid grid-cols-2 gap-3">
               {[500, 1000, 2000, 5000].map(amt => (
                 <button 
                  key={amt} 
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${topUpAmount === amt ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-slate-800 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                 >
                   ${amt}
                 </button>
               ))}
             </div>
             <div className="flex gap-3">
                <button onClick={() => setShowTopUpModal(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-sm hover:text-white transition-colors">返回</button>
                <button onClick={handleSelfTopUp} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/40 active:scale-95 transition-all">確認儲值</button>
             </div>
          </div>
        </div>
      )}

      {/* 結算總結 Modal */}
      {lastFinishedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-rose-600/95 backdrop-blur-3xl animate-in zoom-in-110 duration-500">
           <div className="w-full max-w-sm text-center text-white space-y-8">
              <div className="w-24 h-24 bg-white text-rose-600 rounded-[2.5rem] flex items-center justify-center mx-auto text-4xl shadow-2xl animate-bounce">
                <i className="fas fa-hand-holding-dollar"></i>
              </div>
              <div>
                <h2 className="text-4xl font-black mb-2 tracking-tighter">本趟行程已結案</h2>
                <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px]">訂單流水: {lastFinishedOrder.displayId}</p>
              </div>
              
              <div className="bg-black/20 p-8 rounded-[3rem] border border-white/10 space-y-6 text-left">
                <div className="flex justify-between items-center">
                   <span className="text-white/60 text-sm font-bold uppercase tracking-widest">總計車資</span>
                   <span className="text-2xl font-black">${lastFinishedOrder.price}</span>
                </div>
                <div className="flex justify-between items-center text-rose-200">
                   <span className="text-sm font-bold uppercase tracking-widest">系統抽成 (15%)</span>
                   <span className="text-xl font-black">-${lastFinishedOrder.commission}</span>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                   <span className="text-xl font-black">您的實際收入</span>
                   <span className="text-5xl font-black text-emerald-400 tracking-tighter">${lastFinishedOrder.price - (lastFinishedOrder.commission || 0)}</span>
                </div>
              </div>

              <button 
                onClick={() => setLastFinishedOrder(null)} 
                className="w-full py-6 bg-white text-rose-600 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all"
              >
                好的，準備接下一單
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default DriverPortal;
