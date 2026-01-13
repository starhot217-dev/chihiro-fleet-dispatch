import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { Store, Order, OrderStatus } from '../types';
import { estimateRealMileage } from '../services/geographyService';

const StoreBooking: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [destAddr, setDestAddr] = useState('');
  const [pickupAddr, setPickupAddr] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [estimate, setEstimate] = useState<{ price: number, km: number, kickback: number } | null>(null);

  // Corrected async fetching of stores
  useEffect(() => {
    const loadStores = async () => {
      const s = await DataService.getStores();
      setStores(s);
      if (s.length > 0) setSelectedStoreId(s[0].id);
    };
    loadStores();
  }, []);

  useEffect(() => {
    const store = stores.find(s => s.id === selectedStoreId);
    if (store) setPickupAddr(store.name); // 預設上車點為店家名稱
  }, [selectedStoreId, stores]);

  useEffect(() => {
    if (pickupAddr && destAddr && destAddr.length > 2) {
      const km = estimateRealMileage(pickupAddr, destAddr);
      const pricing = DataService.getPricingPlans()[0];
      const min = Math.round(km * 2.2);
      
      // 計算原始車資
      const rawPrice = Math.round(pricing.baseFare + (km * pricing.perKm) + (min * pricing.perMinute));
      
      // 店家優惠: 原始價 - 30
      const discountedPrice = Math.max(100, rawPrice - 30);
      
      // 計算回金 (每 100 區間回基數)
      const store = stores.find(s => s.id === selectedStoreId);
      const kickback = Math.floor(discountedPrice / 100) * (store?.kickbackBase || 10);

      setEstimate({ price: discountedPrice, km, kickback });
    } else {
      setEstimate(null);
    }
  }, [pickupAddr, destAddr, selectedStoreId]);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimate) return;

    setIsBooking(true);
    const store = stores.find(s => s.id === selectedStoreId);
    
    setTimeout(() => {
      DataService.createOrder({
        displayId: `❤️ST${Date.now().toString().slice(-5)}❤️`,
        clientName: `店家單(${store?.name})`,
        clientPhone: store?.contact || '店家聯絡',
        pickup: pickupAddr,
        destination: destAddr,
        price: estimate.price,
        storeId: selectedStoreId,
        planId: 'store_special',
        planName: '店家特約單',
        note: `【特約 -30】回金預估: $${estimate.kickback}`
      });
      setIsBooking(false);
      alert('叫車成功！已進入派單中心');
      setDestAddr('');
    }, 1000);
  };

  return (
    <div className="p-4 lg:p-10 flex justify-center items-center min-h-full bg-slate-50">
      <div className="w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl p-12 border border-slate-100">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">店家快速叫車</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">特約商店專屬系統 (每單自動 -30)</p>
          </div>
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
             <i className="fas fa-shop text-2xl"></i>
          </div>
        </header>

        <form onSubmit={handleBooking} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">選擇店家身份</label>
                <select 
                  value={selectedStoreId} 
                  onChange={e => setSelectedStoreId(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-6 py-5 text-sm font-black focus:border-indigo-600 outline-none transition-all"
                >
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">上車地點 (預設店家)</label>
                <input 
                  type="text" 
                  value={pickupAddr} 
                  onChange={e => setPickupAddr(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-6 py-5 text-sm font-black focus:border-indigo-600 outline-none transition-all"
                />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">乘客目的地</label>
            <input 
              type="text" 
              placeholder="輸入目的地..." 
              value={destAddr} 
              onChange={e => setDestAddr(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl px-6 py-5 text-sm font-black focus:border-indigo-600 outline-none transition-all"
            />
          </div>

          {estimate && (
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white animate-in slide-in-from-top-4">
               <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">特約車資估價</p>
                    <h4 className="text-5xl font-black tracking-tighter text-indigo-400">${estimate.price}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">預估里程</p>
                    <p className="text-xl font-black">{estimate.km} KM</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">店家回金 (基數計算)</p>
                    <p className="text-2xl font-black text-emerald-400">+${estimate.kickback}</p>
                  </div>
                  <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">已套用優惠</p>
                    <p className="text-2xl font-black text-rose-500">-$30</p>
                  </div>
               </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isBooking || !destAddr}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            {isBooking ? (
               <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <><i className="fas fa-paper-plane"></i> 店家快速建單</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StoreBooking;