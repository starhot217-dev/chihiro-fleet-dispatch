
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { DataService } from '../services/dataService';

interface DispatchCenterProps {
  orders: Order[];
  onDispatch: (id: string) => void;
}

const DispatchCenter: React.FC<DispatchCenterProps> = ({ orders, onDispatch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ clientName: '王先生', clientPhone: '0900123456', pickup: '高雄市三民區九如一路' });

  const activeOrders = orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.createOrder(formData);
    setIsModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">智能調度中心</h2>
          <p className="text-slate-500 font-medium">單人 15s 輪詢制 | 距離優先演算法</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-xl hover:scale-105 transition-all">
          <i className="fas fa-plus mr-2"></i> 建立派案
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeOrders.map(order => (
          <div key={order.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1 space-y-4">
               <div className="flex items-center gap-3">
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black font-mono text-slate-400">{order.displayId}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    order.status === OrderStatus.DISPATCHING ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {order.status}
                  </span>
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">上車點 / 乘客</p>
                  <p className="text-lg font-black text-slate-800">{order.pickup}</p>
                  <p className="text-xs font-bold text-slate-500">{order.clientName} ({order.clientPhone})</p>
               </div>
            </div>

            {order.status === OrderStatus.DISPATCHING && (
              <div className="bg-amber-50 px-6 py-4 rounded-2xl border border-amber-100 flex items-center gap-6">
                 <div>
                    <p className="text-[9px] font-black text-amber-600 uppercase mb-1">正在輪詢司機 (#{order.currentDriverIndex + 1})</p>
                    <p className="text-sm font-black text-amber-700">等待回覆 {order.dispatchCountdown}s</p>
                 </div>
                 <div className="w-10 h-10 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
              </div>
            )}

            {order.status === OrderStatus.PENDING && (
              <button onClick={() => onDispatch(order.id)} className="px-8 py-4 bg-[#00b900] text-white rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-600 transition-all">
                啟動順序派單
              </button>
            )}

            {order.driverName && (
              <div className="bg-slate-900 px-6 py-4 rounded-2xl text-white">
                 <p className="text-[9px] font-black text-slate-500 uppercase mb-1">已承接司機</p>
                 <p className="text-sm font-black">{order.driverName} ({order.plateNumber})</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
           <form onSubmit={handleCreate} className="bg-white w-full max-w-lg rounded-[3rem] p-10 space-y-6">
              <h3 className="text-2xl font-black text-slate-800">建立派遣任務</h3>
              <div className="space-y-4">
                 <input type="text" placeholder="乘客姓名" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-slate-900 outline-none font-bold" />
                 <input type="text" placeholder="聯絡電話" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-slate-900 outline-none font-bold" />
                 <input type="text" placeholder="上車地址" value={formData.pickup} onChange={e => setFormData({...formData, pickup: e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-slate-900 outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="py-4 bg-slate-100 rounded-2xl font-black text-sm">取消</button>
                 <button type="submit" className="py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl">確認建單</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default DispatchCenter;
