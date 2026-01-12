
import React, { useState } from 'react';
import { Order, OrderStatus, Vehicle } from '../types';

interface DriverSimulatorProps {
  orders: Order[];
  vehicles: Vehicle[];
  onStartOrder: (orderId: string, destination: string) => void;
  onCompleteOrder: (orderId: string) => void;
}

const DriverSimulator: React.FC<DriverSimulatorProps> = ({ orders, vehicles, onStartOrder, onCompleteOrder }) => {
  const activeOrders = orders.filter(o => [OrderStatus.PICKING_UP, OrderStatus.IN_TRANSIT].includes(o.status));
  const [destInput, setDestInput] = useState('');

  return (
    <div className="p-4 lg:p-10 max-w-4xl mx-auto space-y-10">
      <header>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">司機終端機模擬</h2>
        <p className="text-slate-500 font-medium">執行派遣任務並補錄目的地計費</p>
      </header>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-24 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
            <i className="fas fa-car-side text-4xl"></i>
          </div>
          <p className="font-black text-xl">目前沒有進行中的任務</p>
          <p className="text-sm font-medium mt-2">請先前往調度中心啟動機器人廣播</p>
        </div>
      ) : (
        <div className="space-y-8">
          {activeOrders.map(order => (
            <div key={order.id} className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  order.status === OrderStatus.PICKING_UP ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600 animate-pulse'
                }`}>
                  {order.status === OrderStatus.PICKING_UP ? '前往載客中' : '行程中 • 計費啟動'}
                </span>
                <span className="text-xs font-mono font-black text-slate-300">{order.displayId}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">上車地點</p>
                      <p className="text-base font-black text-slate-800 leading-relaxed">{order.pickup}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">目的地</p>
                      <p className="text-base font-black text-slate-800 leading-relaxed">{order.destination || '待輸入...'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end gap-4">
                  {order.status === OrderStatus.PICKING_UP ? (
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                      <p className="text-center text-xs font-bold text-slate-500">接到乘客後請補錄目的地</p>
                      <input 
                        type="text" 
                        value={destInput}
                        onChange={e => setDestInput(e.target.value)}
                        placeholder="輸入目的地以啟動計費..."
                        className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-rose-500 transition-all"
                      />
                      <button 
                        onClick={() => { onStartOrder(order.id, destInput); setDestInput(''); }}
                        className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-rose-700 transition-all"
                      >
                        開始行程 / 計算車資
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold opacity-60">當前車資估計</span>
                        <span className="text-3xl font-black">${order.price}</span>
                      </div>
                      <button 
                        onClick={() => onCompleteOrder(order.id)}
                        className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-50 transition-all"
                      >
                        抵達目的地並結帳
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverSimulator;
