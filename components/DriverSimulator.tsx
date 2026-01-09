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

  const currentOrder = orders.find(o => o.id === finishingOrderId);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">司機端任務模擬器</h2>
          <p className="text-slate-500 font-medium text-sm">模擬司機 App 介面：接收、執行與結算行程</p>
        </div>
      </header>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-10 lg:p-20 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
             <i className="fas fa-steering-wheel text-4xl"></i>
          </div>
          <p className="font-bold text-lg">目前沒有派遣任務</p>
          <p className="text-xs mt-2 text-slate-300">請前往「立即叫車」或「派單中心」發起任務</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeOrders.map(order => {
            const driver = vehicles.find(v => v.id === order.vehicleId);
            return (
              <div key={order.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4 group transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">行程執行中</span>
                    <span className="text-[10px] font-mono font-black text-slate-400">{order.id}</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800">${order.price}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
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

                <div className="space-y-3">
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
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">下車地點</p>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">{order.destination}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleFinishClick(order.id)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                  <i className="fas fa-check-double text-xs"></i> 抵達終點 / 進行結帳
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 結案確認明細彈窗 */}
      {finishingOrderId && currentOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <i className="fas fa-receipt text-2xl"></i>
             </div>
             <h3 className="text-xl font-black text-slate-800 text-center mb-2">確認行程結帳</h3>
             <p className="text-slate-400 text-[10px] text-center mb-8 px-4 font-bold uppercase tracking-widest">行程編號：{finishingOrderId}</p>
             
             <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100 mb-8">
               <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-400 font-bold uppercase">乘客應付車資</span>
                 <span className="text-xl text-slate-800 font-black">${currentOrder.price}</span>
               </div>
               <div className="h-px bg-slate-200"></div>
               <div className="flex justify-between items-center text-rose-600">
                 <span className="text-xs font-bold uppercase">平台服務費 (15%)</span>
                 <span className="text-base font-black">-${Math.round(currentOrder.price * 0.15)}</span>
               </div>
               <div className="pt-2 flex justify-between items-center">
                 <span className="text-[10px] text-slate-400 font-black uppercase">司機帳戶淨收益</span>
                 <span className="text-emerald-600 font-black text-lg">${Math.round(currentOrder.price * 0.85)}</span>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => setFinishingOrderId(null)}
                 className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs hover:bg-slate-200 transition-colors"
               >
                 取消
               </button>
               <button 
                 onClick={confirmFinish}
                 className="py-4 bg-rose-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all"
               >
                 確認收錢結案
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverSimulator;