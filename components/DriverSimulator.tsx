
import React from 'react';
import { Order, OrderStatus, Vehicle } from '../types';

interface DriverSimulatorProps {
  orders: Order[];
  vehicles: Vehicle[];
  onCompleteOrder: (orderId: string) => void;
}

const DriverSimulator: React.FC<DriverSimulatorProps> = ({ orders, vehicles, onCompleteOrder }) => {
  const activeOrders = orders.filter(o => o.status === OrderStatus.ASSIGNED || o.status === OrderStatus.IN_TRANSIT);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">司機端模擬任務</h2>
          <p className="text-slate-500 font-medium">模擬司機接單後的行程狀態切換</p>
        </div>
        <div className="flex -space-x-3">
          {vehicles.map(v => (
            <div key={v.id} title={v.driverName} className="w-10 h-10 rounded-full border-2 border-white bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
              {v.driverName[0]}
            </div>
          ))}
        </div>
      </header>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
          <i className="fas fa-steering-wheel text-4xl mb-4"></i>
          <p className="font-bold">目前沒有正在進行的任務</p>
          <p className="text-xs mt-2 text-slate-300">請從「派車中心」派發任務至司機端</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeOrders.map(order => {
            const driver = vehicles.find(v => v.id === order.vehicleId);
            return (
              <div key={order.id} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">任務中</span>
                    <span className="text-xs font-mono font-black text-slate-400">{order.id}</span>
                  </div>
                  <p className="text-2xl font-black text-rose-600">${order.price}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-black uppercase mb-2">接單駕駛</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-rose-500 shadow-sm border border-slate-100">
                      <i className="fas fa-id-card-clip"></i>
                    </div>
                    <p className="text-sm font-black text-slate-700">{driver?.driverName} ({driver?.plateNumber})</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <i className="fas fa-map-pin text-rose-500 mt-1"></i>
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase">客戶地點</p>
                      <p className="text-sm font-bold text-slate-700">{order.pickup}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <i className="fas fa-flag-checkered text-slate-400 mt-1"></i>
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase">目的地</p>
                      <p className="text-sm font-bold text-slate-700">{order.destination}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onCompleteOrder(order.id)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-check-double"></i> 抵達目的地 / 結案
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DriverSimulator;
