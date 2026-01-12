
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Vehicle, PricingPlan } from '../types';
import { TAIWAN_AREAS } from '../constants';
import { DataService } from '../services/dataService';

interface DispatchCenterProps {
  orders: Order[];
  vehicles: Vehicle[];
  onDispatch: (orderId: string, planId: string) => void;
  onCancel: (orderId: string) => void;
  onAddOrder: (order: Partial<Order>) => void;
}

const DispatchCenter: React.FC<DispatchCenterProps> = ({ orders, vehicles, onDispatch, onCancel, onAddOrder }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dispatchConfirmId, setDispatchConfirmId] = useState<string | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('default');
  
  const [pickupAddr, setPickupAddr] = useState({ county: '高雄市', district: '苓雅區', street: '中正二路22號' });
  const [formData, setFormData] = useState({ 
    clientName: '李先生', 
    clientPhone: '0910-123-456', 
    note: '【車上禁菸、禁檳榔】',
    planId: 'default'
  });

  useEffect(() => {
    setPlans(DataService.getPricingPlans());
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPlan = plans.find(p => p.id === formData.planId) || plans[0];
    onAddOrder({
      ...formData,
      planName: selectedPlan.name,
      pickup: `${pickupAddr.county}${pickupAddr.district}${pickupAddr.street}`,
    });
    setIsModalOpen(false);
  };

  const handleDispatchConfirm = () => {
    if (dispatchConfirmId) {
      onDispatch(dispatchConfirmId, selectedPlanId);
      setDispatchConfirmId(null);
    }
  };

  return (
    <div className="p-4 lg:p-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">中央調度控制台</h2>
          <p className="text-slate-500 text-sm font-medium">管理進件訂單並啟動機器人廣播</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> 手動建單
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono font-black text-slate-300">{order.displayId}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    order.status === OrderStatus.DISPATCHING ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {order.status}
                  </span>
                  <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                    方案：{order.planName || '預設'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-rose-500 uppercase mb-2">上車地點</p>
                    <p className="text-sm font-black text-slate-700 leading-relaxed">{order.pickup}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">預約客戶</p>
                    <p className="text-sm font-black text-slate-700">{order.clientName}</p>
                    <p className="text-xs font-bold text-rose-500">{order.clientPhone}</p>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-48 flex flex-col gap-3 justify-center">
                {order.status === OrderStatus.PENDING && (
                  <button 
                    onClick={() => {
                      setDispatchConfirmId(order.id);
                      setSelectedPlanId(order.planId || 'default');
                    }}
                    className="w-full py-5 bg-[#00b900] text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all"
                  >
                    <i className="fab fa-line text-lg"></i> 機器人廣播
                  </button>
                )}
                <button 
                  onClick={() => onCancel(order.id)}
                  className="w-full py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs hover:text-rose-500 transition-all"
                >
                  取消訂單
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 派單確認 Modal */}
      {dispatchConfirmId && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <i className="fab fa-line"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-800">確認派單費率</h3>
              <p className="text-slate-500 text-sm font-medium">請在發送到 LINE 前確認此單採用的方案</p>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">選擇方案</label>
                <div className="grid grid-cols-1 gap-2">
                  {plans.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`px-4 py-4 rounded-2xl text-left transition-all flex justify-between items-center ${
                        selectedPlanId === p.id 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-white text-slate-600 border border-slate-100'
                      }`}
                    >
                      <span className="font-black text-sm">{p.name}</span>
                      <span className="text-[10px] opacity-70">起步 ${p.baseFare}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setDispatchConfirmId(null)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">取消</button>
               <button onClick={handleDispatchConfirm} className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20">啟動廣播</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleAddSubmit} className="bg-white w-full max-w-lg rounded-[3rem] p-10 space-y-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-800 mb-8">手動新增訂單</h3>
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">計費方案</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-rose-500"
                  value={formData.planId}
                  onChange={e => setFormData({...formData, planId: e.target.value})}
                >
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <input type="text" placeholder="客戶姓名" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" required />
              <input type="text" placeholder="聯絡電話" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" required />
              <div className="grid grid-cols-2 gap-3">
                <select className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={pickupAddr.county} onChange={e => setPickupAddr({...pickupAddr, county: e.target.value})}>
                  {Object.keys(TAIWAN_AREAS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" value={pickupAddr.district} onChange={e => setPickupAddr({...pickupAddr, district: e.target.value})}>
                  {TAIWAN_AREAS[pickupAddr.county].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <input type="text" placeholder="詳細上車地址" value={pickupAddr.street} onChange={e => setPickupAddr({...pickupAddr, street: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none" required />
              <textarea placeholder="備註資訊..." value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none h-24" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
               <button type="button" onClick={() => setIsModalOpen(false)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">取消</button>
               <button type="submit" className="py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl">建立並關閉</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DispatchCenter;
