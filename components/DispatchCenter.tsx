
import React from 'react';
import { Order, OrderStatus } from '../types';
import { DataService } from '../services/dataService';

interface DispatchCenterProps {
  orders: Order[];
  onDispatch: (id: string) => void;
}

const DispatchCenter: React.FC<DispatchCenterProps> = ({ orders, onDispatch }) => {
  const activeOrders = orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);

  const handleLineBroadcast = (order: Order) => {
    // 實作：將 Flex Message 寫入 LineLogs
    DataService.broadcastToLine(order, 'PRIMARY');
    alert(`【廣播成功】已向 LINE 群組發送訂單：${order.displayId}\n司機端模擬器可同步看到此訊息。`);
  };

  return (
    <div className="p-4 lg:p-10 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">智能調度中心</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">Simulation Mode</span>
             <p className="text-slate-500 font-medium text-xs">當前有 {activeOrders.length} 筆活躍訂單正在處理</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {activeOrders.length === 0 ? (
           <div className="bg-white rounded-[3rem] p-20 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
              <i className="fas fa-inbox text-4xl mb-4"></i>
              <p className="font-bold">目前無待處理訂單</p>
           </div>
        ) : (
          activeOrders.map(order => (
            <div key={order.id} className={`bg-white rounded-[2.5rem] p-8 border transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ${
              order.status === OrderStatus.DISPATCHING ? 'border-amber-400 shadow-xl shadow-amber-50' : 'border-slate-100 shadow-sm'
            }`}>
              <div className="flex-1 space-y-4">
                 <div className="flex items-center gap-3">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black font-mono tracking-widest">{order.displayId}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === OrderStatus.DISPATCHING ? 'bg-amber-500 text-white animate-pulse' : 
                      order.status === OrderStatus.ASSIGNED ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {order.status === OrderStatus.DISPATCHING ? `派遣中 (${order.dispatchCountdown}s)` : order.status}
                    </span>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">上車點 / 聯繫資訊</p>
                    <p className="text-xl font-black text-slate-800">{order.pickup}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <i className="fas fa-user-circle text-slate-300"></i>
                      <p className="text-xs font-bold text-slate-500">{order.clientName} • {order.clientPhone}</p>
                    </div>
                 </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {order.status === OrderStatus.PENDING && (
                  <>
                    <button 
                      onClick={() => handleLineBroadcast(order)}
                      className="px-6 py-4 bg-[#00b900] text-white rounded-2xl font-black text-sm shadow-lg hover:bg-[#00a300] active:scale-95 transition-all flex items-center gap-2"
                    >
                      <i className="fab fa-line text-lg"></i> LINE 廣播
                    </button>
                    <button 
                      onClick={() => onDispatch(order.id)}
                      className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black active:scale-95 transition-all"
                    >
                      啟動 15s 派遣
                    </button>
                  </>
                )}

                {order.status === OrderStatus.DISPATCHING && (
                  <div className="bg-amber-50 px-8 py-4 rounded-2xl border border-amber-200 flex items-center gap-6">
                     <div className="flex flex-col">
                        <p className="text-[9px] font-black text-amber-600 uppercase">等待司機接單</p>
                        <p className="text-xl font-black text-amber-800">00:{order.dispatchCountdown?.toString().padStart(2, '0')}</p>
                     </div>
                     <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                  </div>
                )}

                {(order.status === OrderStatus.ASSIGNED || order.status === OrderStatus.ARRIVED || order.status === OrderStatus.IN_TRANSIT) && (
                  <div className="bg-slate-50 px-8 py-4 rounded-2xl text-slate-600 border border-slate-200 flex items-center gap-6">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400">
                        <i className="fas fa-steering-wheel"></i>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">承接司機</p>
                        <p className="text-sm font-black text-slate-800">{order.driverName} <span className="opacity-40 ml-1">({order.plateNumber})</span></p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DispatchCenter;
