
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Vehicle, DriverPriority } from '../types';
import { DataService } from '../services/dataService';

interface DriverPortalProps {
  orders: Order[];
  onRefresh: () => void;
}

const DriverPortal: React.FC<DriverPortalProps> = ({ orders, onRefresh }) => {
  // 模擬當前登入為測試司機 V2 (米修)
  const myId = 'V2'; 
  const [myVehicle, setMyVehicle] = useState<Vehicle | undefined>(DataService.getVehicles().find(v => v.id === myId));
  const [destInput, setDestInput] = useState('');
  
  // 正在對我進行 15s 輪詢的訂單
  const dispatchOrder = orders.find(o => o.status === OrderStatus.DISPATCHING && o.targetDriverId === myId);
  
  // 已經承接且尚未完成的訂單
  const activeOrder = orders.find(o => 
    o.targetDriverId === myId && 
    [OrderStatus.ASSIGNED, OrderStatus.ARRIVED, OrderStatus.IN_TRANSIT].includes(o.status)
  );

  useEffect(() => {
    setMyVehicle(DataService.getVehicles().find(v => v.id === myId));
  }, [orders]);

  const handleAccept = () => {
    if (!dispatchOrder) return;
    DataService.updateOrder(dispatchOrder.id, {
      status: OrderStatus.ASSIGNED,
      dispatchCountdown: 0,
      driverName: myVehicle?.driverName,
      driverPhone: myVehicle?.driverPhone,
      plateNumber: myVehicle?.plateNumber,
      vehicleId: myId
    });
    onRefresh();
  };

  const handleArrived = () => {
    if (!activeOrder) return;
    DataService.updateOrder(activeOrder.id, {
      status: OrderStatus.ARRIVED,
      waitingStartTime: new Date().toISOString()
    });
    onRefresh();
  };

  const handleStartTrip = () => {
    if (!activeOrder || !destInput) return;
    // 模擬 Google Maps 地址標準化
    const standardizedDest = `📍 ${destInput.trim()} (經地圖驗證)`;
    DataService.updateOrder(activeOrder.id, {
      status: OrderStatus.IN_TRANSIT,
      destination: standardizedDest,
      startTime: new Date().toISOString()
    });
    onRefresh();
  };

  const handleComplete = () => {
    if (!activeOrder) return;
    const finalFare = DataService.calculateFinalFare(activeOrder);
    DataService.updateOrder(activeOrder.id, {
      status: OrderStatus.COMPLETED,
      endTime: new Date().toISOString(),
      ...finalFare
    });
    // 扣除錢包抽成
    DataService.updateVehicleWallet(myId, -finalFare.systemFee);
    onRefresh();
  };

  return (
    <div className="min-h-full bg-slate-50 p-6 space-y-6 max-w-lg mx-auto pb-24">
      {/* 1. 司機狀態卡片 */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-600/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start mb-8">
           <div>
              <h2 className="text-2xl font-black">{myVehicle?.driverName}</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{myVehicle?.plateNumber} • {myVehicle?.priority}</p>
           </div>
           <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 text-[10px] font-black tracking-widest uppercase">上線中</span>
           </div>
        </div>
        <div className="relative z-10 flex justify-between items-end">
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">錢包餘額</p>
              <p className="text-4xl font-black text-white">${myVehicle?.walletBalance.toLocaleString()}</p>
           </div>
           <button className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
              <i className="fas fa-wallet text-slate-400"></i>
           </button>
        </div>
      </div>

      {/* 2. 15秒任務邀約 (新單提示) */}
      {dispatchOrder && (
        <div className="bg-white rounded-[3rem] p-8 border-4 border-rose-600 shadow-2xl animate-in zoom-in duration-300 relative">
           <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
             新任務邀約: {dispatchOrder.dispatchCountdown}s
           </div>
           <div className="space-y-6 mt-4">
              <div className="flex justify-between items-center">
                 <span className="text-xs font-black text-slate-400 uppercase">預估車資</span>
                 <p className="text-3xl font-black text-slate-900">${dispatchOrder.price}</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">上車地點</p>
                 <p className="font-bold text-slate-800 leading-snug">{dispatchOrder.pickup}</p>
              </div>
              <button 
                onClick={handleAccept}
                className="w-full py-6 bg-rose-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-rose-200 active:scale-95 transition-all"
              >
                接受任務 (確認派遣)
              </button>
           </div>
        </div>
      )}

      {/* 3. 行程執行工作流 */}
      {activeOrder && (
        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl space-y-8 animate-in slide-in-from-bottom-6">
           <header className="flex justify-between items-center border-b border-slate-50 pb-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-rose-600 rounded-full animate-ping"></div>
                 <h3 className="font-black text-slate-800 uppercase tracking-tight">
                    {activeOrder.status === OrderStatus.ASSIGNED && '前往接客中'}
                    {activeOrder.status === OrderStatus.ARRIVED && '乘客上車確認'}
                    {activeOrder.status === OrderStatus.IN_TRANSIT && '正在前往目的地'}
                 </h3>
              </div>
              <p className="text-[9px] font-mono text-slate-400">{activeOrder.displayId}</p>
           </header>

           <div className="space-y-6">
              <div className="flex gap-4">
                 <div className="w-1.5 h-1.5 bg-rose-600 rounded-full mt-2 shrink-0"></div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">上車地點</p>
                    <p className="text-sm font-black text-slate-800">{activeOrder.pickup}</p>
                 </div>
              </div>

              {activeOrder.status === OrderStatus.ASSIGNED && (
                <button 
                  onClick={handleArrived}
                  className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
                >
                  回報已抵達上車地點
                </button>
              )}

              {activeOrder.status === OrderStatus.ARRIVED && (
                <div className="space-y-6 animate-in fade-in">
                   <div className="bg-slate-50 p-6 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                        等客跳表 (5分鐘免等)
                      </p>
                      <p className={`text-5xl font-black ${activeOrder.waitingFee > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        +${activeOrder.waitingFee}
                      </p>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">確認目的地 (Google Maps 校正)</label>
                      <input 
                        type="text" 
                        value={destInput}
                        onChange={e => setDestInput(e.target.value)}
                        placeholder="輸入下車點或店名..."
                        className="w-full px-6 py-5 bg-slate-100 rounded-3xl font-black text-slate-800 outline-none border-2 border-transparent focus:border-rose-500 transition-all"
                      />
                   </div>
                   <button 
                     disabled={!destInput}
                     onClick={handleStartTrip}
                     className="w-full py-6 bg-rose-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-200 disabled:opacity-30"
                   >
                     開始行程 (啟動里程計費)
                   </button>
                </div>
              )}

              {activeOrder.status === OrderStatus.IN_TRANSIT && (
                <div className="space-y-6 animate-in fade-in">
                   <div className="bg-slate-900 p-6 rounded-3xl text-white">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">導航目的地</p>
                      <p className="text-sm font-bold">{activeOrder.destination}</p>
                   </div>
                   <button 
                     onClick={handleComplete}
                     className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200"
                   >
                     抵達目的地並結算
                   </button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* 4. 無任務待機狀態 */}
      {!dispatchOrder && !activeOrder && (
        <div className="flex flex-col items-center justify-center py-20 opacity-30 grayscale text-center">
           <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-radar text-4xl animate-pulse"></i>
           </div>
           <h3 className="text-xl font-black text-slate-800">等待任務指派</h3>
           <p className="text-sm font-medium mt-2">系統正在為您搜尋附近的叫車請求...</p>
        </div>
      )}
    </div>
  );
};

export default DriverPortal;
