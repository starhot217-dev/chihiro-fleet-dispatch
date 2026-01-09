
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Vehicle } from '../types';
import { TAIWAN_AREAS } from '../constants';

interface DispatchCenterProps {
  orders: Order[];
  vehicles: Vehicle[];
  onDispatch: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onAddOrder: (order: Partial<Order>) => void;
  pricingConfig: { baseFare: number; perKm: number; perMinute: number; nightSurcharge: number; };
}

const DispatchCenter: React.FC<DispatchCenterProps> = ({ orders, vehicles, onDispatch, onCancel, onAddOrder, pricingConfig }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickupAddr, setPickupAddr] = useState({ county: '高雄市', district: '鳳山區', street: '' });
  const [destAddr, setDestAddr] = useState({ county: '高雄市', district: '', street: '' });
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    price: 0,
    note: '【車上禁菸、禁檳榔】'
  });

  // Real-time calculation for the manual modal too
  useEffect(() => {
    if (pickupAddr.street && destAddr.district && destAddr.street) {
      const seed = pickupAddr.street.length + destAddr.street.length;
      const mockDistance = (seed % 15) + 5;
      const mockTime = Math.floor(mockDistance * 1.5);
      const price = pricingConfig.baseFare + (mockDistance * pricingConfig.perKm) + (mockTime * pricingConfig.perMinute);
      setFormData(prev => ({ ...prev, price }));
    }
  }, [pickupAddr, destAddr, pricingConfig]);

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.PENDING: return 'bg-rose-100 text-rose-700 border-rose-200';
      case OrderStatus.DISPATCHING: return 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse';
      case OrderStatus.ASSIGNED: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case OrderStatus.IN_TRANSIT: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.PENDING: return '待處理';
      case OrderStatus.DISPATCHING: return 'LINE 派遣中';
      case OrderStatus.ASSIGNED: return '司機已接單';
      case OrderStatus.IN_TRANSIT: return '行程中';
      case OrderStatus.COMPLETED: return '已完成';
      default: return status;
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({
      ...formData,
      pickup: `${pickupAddr.county}${pickupAddr.district}${pickupAddr.street}`,
      destination: `${destAddr.county}${destAddr.district}${destAddr.street}`
    });
    setFormData({ clientName: '', clientPhone: '', price: 0, note: '【車上禁菸、禁檳榔】' });
    setPickupAddr({ county: '高雄市', district: '鳳山區', street: '' });
    setDestAddr({ county: '高雄市', district: '', street: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 relative min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">即時調度中心</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Real-time Control Room</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-rose-100 hover:bg-rose-700 hover:scale-105 transition-all"
        >
          <i className="fas fa-plus mr-2"></i>手動新增訂單
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
            <i className="fas fa-inbox text-4xl mb-4"></i>
            <p className="font-bold">目前尚無進行中的訂單</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black text-slate-400">{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">
                    {order.clientName} 
                    <span className="text-rose-400 font-bold text-sm ml-2">{order.clientPhone}</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mt-1 shrink-0">
                        <i className="fas fa-map-pin"></i>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pickup</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{order.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 mt-1 shrink-0">
                        <i className="fas fa-flag-checkered"></i>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Destination</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{order.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-end justify-between min-h-[120px]">
                  <div className="text-right">
                    <p className="text-3xl font-black text-rose-600 tracking-tighter">${order.price}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.createdAt}</p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === OrderStatus.PENDING && (
                      <>
                        <button 
                          onClick={() => onDispatch(order.id)}
                          className="bg-[#00b900] text-white px-5 py-2.5 rounded-xl text-sm font-black hover:bg-[#009900] transition-all shadow-lg shadow-emerald-50"
                        >
                          <i className="fab fa-line mr-2"></i>派遣
                        </button>
                        <button 
                          onClick={() => onCancel(order.id)}
                          className="bg-slate-100 text-slate-400 px-5 py-2.5 rounded-xl text-sm font-black hover:bg-rose-50 hover:text-rose-500 transition-all"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Add Modal - Fixed Layout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-sm px-4 py-8">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-200 my-auto">
            <div className="bg-rose-600 p-8 text-white rounded-t-[2.5rem] flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">手動建立派遣單</h3>
                <p className="text-rose-100 text-xs font-bold uppercase mt-1">Manual Order Entry</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">客戶姓名</label>
                  <input 
                    type="text" required
                    placeholder="例如：陳先生"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-rose-500 focus:bg-white outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">客戶電話</label>
                  <input 
                    type="text" required
                    placeholder="09xx-xxx-xxx"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-rose-500 focus:bg-white outline-none transition-all" 
                  />
                </div>
              </div>

              {/* pickup addr section */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">上車地點 (Pickup)</p>
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-rose-500 outline-none"
                    value={pickupAddr.county}
                    onChange={(e) => setPickupAddr({...pickupAddr, county: e.target.value, district: TAIWAN_AREAS[e.target.value][0]})}
                  >
                    {Object.keys(TAIWAN_AREAS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select 
                    className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-rose-500 outline-none"
                    value={pickupAddr.district}
                    onChange={(e) => setPickupAddr({...pickupAddr, district: e.target.value})}
                  >
                    {TAIWAN_AREAS[pickupAddr.county].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <input 
                  type="text" required
                  placeholder="輸入路名、巷弄..."
                  value={pickupAddr.street}
                  onChange={(e) => setPickupAddr({...pickupAddr, street: e.target.value})}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-rose-500 outline-none transition-all"
                />
              </div>

              {/* destination addr section */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">目的地 (Destination)</p>
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-rose-500 outline-none"
                    value={destAddr.county}
                    onChange={(e) => setDestAddr({...destAddr, county: e.target.value, district: TAIWAN_AREAS[e.target.value][0]})}
                  >
                    {Object.keys(TAIWAN_AREAS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select 
                    className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-rose-500 outline-none"
                    value={destAddr.district}
                    onChange={(e) => setDestAddr({...destAddr, district: e.target.value})}
                  >
                    <option value="" disabled>選擇區域</option>
                    {TAIWAN_AREAS[destAddr.county].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <input 
                  type="text" required
                  placeholder="輸入終點路名..."
                  value={destAddr.street}
                  onChange={(e) => setDestAddr({...destAddr, street: e.target.value})}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-rose-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">預估車資 (TWD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 font-black">$</span>
                    <input 
                      type="number" required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-8 pr-4 py-3 text-sm font-black text-rose-600 focus:border-rose-500 focus:bg-white outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">備註 / 需求</label>
                  <input 
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-rose-500 focus:bg-white outline-none transition-all" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-rose-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-rose-100 hover:bg-rose-700 active:scale-[0.98] transition-all"
              >
                立即建立任務
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchCenter;
