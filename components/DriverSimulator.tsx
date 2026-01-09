import React, { useState } from 'react';
import { Order, OrderStatus, Vehicle } from '../types';

interface DriverSimulatorProps {
  orders: Order[];
  vehicles: Vehicle[];
  onCompleteOrder: (orderId: string) => void;
}

const DriverSimulator: React.FC<DriverSimulatorProps> = ({ orders, vehicles, onCompleteOrder }) => {
  const activeOrders = orders.filter(o => o.status === OrderStatus.ASSIGNED || o.status === OrderStatus.IN_TRANSIT);
  const [finishingOrderId, setFinishingOrderId] = useState<string | null>(null);

  const handleFinishClick = (orderId: string) => {
    setFinishingOrderId(orderId);
  };

  const confirmFinish = () => {
    if (finishingOrderId) {
      onCompleteOrder(finishingOrderId);
      setFinishingOrderId(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">司機端模擬任務</h2>
          <p className="text-slate-500 font-medium text-sm">模擬司機接單後的行程狀態切換與結費</p>
        </div>
        <div className="flex -space-x-3">
          {vehicles.map(v => (
            <div key={v.id} title={v.driverName} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-[10px] lg:text-xs">
              {v.driverName[0]}
            </div>
          ))}
        </div>
      </header>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-10 lg:p-20 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <i className="fas fa-steering-wheel text-3xl lg:text-4xl"></i>
          </div>
          <p className="font-bold text-sm lg:text-base">目前沒有正在進行的任務</p>
          <p className="text-[10px] lg:text-xs mt-2 text-slate-300">請從「派車中心」派發任務至司機端</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {activeOrders.map(order => {
            const driver = vehicles.find(v => v.id === order.vehicleId);
            return (
              <div key={order.id} className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-5 lg:p-6 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">任務執行中</span>
                    <span className="text-[10px] font-mono font-black text-slate-400">{order.id}</span>
                  </div>
                  <p className="text-xl lg:text-2xl font-black text-slate-800">${order.price}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-black uppercase mb-2 tracking-widest">負責駕駛</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm border border-slate-100">
                      <i className="fas fa-id-card-clip"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">{driver?.driverName}</p>
                      <p className="text-[10px] font-bold text-slate-400">{driver?.plateNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">上車地點</p>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">{order.pickup}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">目的地</p>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">{order.destination}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleFinishClick(order.id)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-200 flex items-center justify-center gap-2 relative z-10"
                >
                  <i className="fas fa-check-double text-xs"></i> 抵達目的地 / 結案
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 結案確認視窗 */}
      {finishingOrderId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <i className="fas fa-receipt text-2xl"></i>
             </div>
             <h3 className="text-xl font-black text-slate-800 text-center mb-2">確認訂單結案</h3>
             <p className="text-slate-400 text-xs text-center mb-8 px-4">請確認已成功向乘客收取車資，系統將自動從司機錢包扣除平台服務費。</p>
             
             <div className="bg-slate-50 p-6 rounded-3xl space-y-3 border border-slate-100 mb-8">
               <div className="flex justify-between text-xs">
                 <span className="text-slate-400 font-bold uppercase">行程總資</span>
                 <span className="text-slate-800 font-black">${orders.find(o => o.id === finishingOrderId)?.price}</span>
               </div>
               <div className="flex justify-between text-xs">
                 <span className="text-slate-400 font-bold uppercase">平台抽成 (15%)</span>
                 <span className="text-rose-600 font-black">-${Math.round((orders.find(o => o.id === finishingOrderId)?.price || 0) * 0.15)}</span>
               </div>
               <div className="pt-3 border-t border-slate-200 flex justify-between">
                 <span className="text-[10px] text-slate-400 font-black uppercase">司機淨收益</span>
                 <span className="text-emerald-600 font-black">${Math.round((orders.find(o => o.id === finishingOrderId)?.price || 0) * 0.85)}</span>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => setFinishingOrderId(null)}
                 className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs hover:bg-slate-200 transition-colors"
               >
                 返回
               </button>
               <button 
                 onClick={confirmFinish}
                 className="py-4 bg-rose-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all"
               >
                 確認結案
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverSimulator;