
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { estimateRealMileage } from '../services/geographyService';

interface PricingConfig {
  baseFare: number;
  perKm: number;
  perMinute: number;
  nightSurcharge: number;
}

interface ClientBookingProps {
  activeOrder?: Order;
  onCreateOrder: (order: Partial<Order>) => void;
  onResetOrder: () => void;
  pricingConfig: PricingConfig;
}

const ClientBooking: React.FC<ClientBookingProps> = ({ activeOrder, onCreateOrder, onResetOrder, pricingConfig }) => {
  const [pickupAddr, setPickupAddr] = useState('高雄市苓雅區中正二路');
  const [destAddr, setDestAddr] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [estimatedKm, setEstimatedKm] = useState<number | null>(null);

  useEffect(() => {
    if (pickupAddr && destAddr && destAddr.length > 2) {
      const km = estimateRealMileage(pickupAddr, destAddr);
      const min = Math.round(km * 2.2); // 預估行車時間
      
      const totalPrice = Math.round(
        pricingConfig.baseFare + 
        (km * pricingConfig.perKm) + 
        (min * pricingConfig.perMinute)
      );
      
      setEstimatedKm(km);
      setEstimatedPrice(totalPrice);
    } else {
      setEstimatedPrice(0);
      setEstimatedKm(null);
    }
  }, [pickupAddr, destAddr, pricingConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destAddr) return;
    
    setIsBooking(true);
    setTimeout(() => {
      onCreateOrder({
        pickup: pickupAddr,
        destination: destAddr,
        price: estimatedPrice,
        note: `(系統地理估算: ${estimatedKm}km)`
      });
      setIsBooking(false);
    }, 1200);
  };

  const commission = Math.round(estimatedPrice * 0.15);
  const driverEarn = estimatedPrice - commission;

  if (activeOrder) {
    return (
      <div className="flex justify-center items-center min-h-full bg-slate-100 p-4">
        <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 border-b-[12px] border-rose-600">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className={`fas ${activeOrder.status === OrderStatus.DISPATCHING ? 'fa-satellite-dish animate-pulse text-rose-500' : 'fa-check text-emerald-500'} text-3xl`}></i>
              </div>
              <h2 className="text-2xl font-black text-slate-800">
                {activeOrder.status === OrderStatus.DISPATCHING ? '正在通知附近司機...' : '司機已承接您的行程'}
              </h2>
              <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">ID: {activeOrder.displayId}</p>
            </div>
            
            <div className="bg-slate-50 p-7 rounded-[2.5rem] border border-slate-100 space-y-5">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-0.5 h-6 bg-slate-200"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
                <div className="flex-1 space-y-4">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">上車點</p>
                      <p className="text-sm font-bold text-slate-700">{activeOrder.pickup}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">目的地</p>
                      <p className="text-sm font-bold text-slate-700">{activeOrder.destination}</p>
                   </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                 <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">預估車資</p>
                   <p className="text-2xl font-black text-rose-600">${activeOrder.price}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">支付方式</p>
                   <p className="text-sm font-black text-slate-800">現金支付</p>
                 </div>
              </div>
            </div>

            <button className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm shadow-xl active:scale-95 transition-all" onClick={onResetOrder}>取消訂單 / 返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-full bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-[4rem] shadow-2xl overflow-hidden border-[1px] border-slate-100 relative">
        <div className="p-10">
          <header className="mb-10 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">呼叫千尋</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">智慧座標加權估價模式</p>
            </div>
            <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-200">
              <i className="fas fa-taxi text-xl"></i>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="relative group">
                <i className="fas fa-circle-dot absolute left-6 top-1/2 -translate-y-1/2 text-rose-500 text-xs"></i>
                <input 
                  type="text" 
                  value={pickupAddr}
                  onChange={(e) => setPickupAddr(e.target.value)}
                  placeholder="輸入上車位置..."
                  className="w-full pl-14 pr-6 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] text-sm font-black outline-none focus:border-rose-500 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="relative group">
                <i className="fas fa-location-arrow absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-600 transition-colors"></i>
                <input 
                  type="text" 
                  value={destAddr}
                  onChange={(e) => setDestAddr(e.target.value)}
                  placeholder="您要去哪裡？"
                  className="w-full pl-14 pr-6 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] text-sm font-black outline-none focus:border-rose-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {estimatedPrice > 0 && (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
                 <div className="flex justify-between items-end border-b border-white/10 pb-6">
                    <div>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">預估里程 / 車資</p>
                       <h4 className="text-4xl font-black text-white tracking-tighter">
                         <span className="text-rose-500 mr-2">${estimatedPrice}</span>
                         <span className="text-sm text-slate-400">({estimatedKm} km)</span>
                       </h4>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">系統抽成 (15%)</p>
                       <p className="text-lg font-black text-rose-400">${commission}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">司機預計所得</p>
                       <p className="text-lg font-black text-emerald-400">${driverEarn}</p>
                    </div>
                 </div>
              </div>
            )}

            <button type="submit" disabled={isBooking || !destAddr} className="w-full py-6 bg-rose-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-4">
              {isBooking ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><i className="fas fa-bolt"></i> 立即發布派單</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;
