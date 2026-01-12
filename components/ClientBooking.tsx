
import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus } from '../types';

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
  const [pickupAddr, setPickupAddr] = useState('高雄市苓雅區中正二路22號');
  const [destAddr, setDestAddr] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const pickupRef = useRef<HTMLInputElement>(null);
  const destRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.google && window.google.maps && pickupRef.current && destRef.current) {
      const options = {
        componentRestrictions: { country: "tw" },
        fields: ["formatted_address", "geometry"],
        types: ["address"],
      };

      const autocompleteP = new window.google.maps.places.Autocomplete(pickupRef.current, options);
      const autocompleteD = new window.google.maps.places.Autocomplete(destRef.current, options);

      autocompleteP.addListener("place_changed", () => {
        const place = autocompleteP.getPlace();
        setPickupAddr(place.formatted_address || '');
      });

      autocompleteD.addListener("place_changed", () => {
        const place = autocompleteD.getPlace();
        setDestAddr(place.formatted_address || '');
        
        // 模擬里程計算 (未來可進一步呼叫 Distance Matrix)
        const mockKm = Math.floor(Math.random() * 15) + 5;
        setEstimatedPrice(pricingConfig.baseFare + (mockKm * pricingConfig.perKm));
      });
    }
  }, [pricingConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    setTimeout(() => {
      onCreateOrder({
        pickup: pickupAddr,
        destination: destAddr || undefined,
        price: estimatedPrice,
      });
      setIsBooking(false);
    }, 1000);
  };

  if (activeOrder) {
    return (
      <div className="flex justify-center items-center min-h-full bg-slate-100 p-4">
        <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className={`fas ${activeOrder.status === OrderStatus.DISPATCHING ? 'fa-satellite-dish animate-pulse text-rose-500' : 'fa-check text-emerald-500'} text-3xl`}></i>
              </div>
              <h2 className="text-2xl font-black text-slate-800">
                {activeOrder.status === OrderStatus.DISPATCHING ? '廣播派遣中...' : '已完成指派'}
              </h2>
              <p className="text-slate-400 text-xs font-bold mt-2">訂單編號: {activeOrder.displayId}</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">上車地點</p>
                <p className="text-sm font-bold text-slate-700">{activeOrder.pickup}</p>
              </div>
              {activeOrder.driverName && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">指派司機</p>
                  <p className="text-sm font-black text-slate-800">{activeOrder.driverName} (米修)</p>
                </div>
              )}
            </div>

            <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl" onClick={onResetOrder}>回到叫車首頁</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-full bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-slate-900 relative">
        <div className="p-8 pb-12">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-slate-800">千尋派車</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">智慧地圖叫車系統</p>
            </div>
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white">
              <i className="fas fa-map-marked-alt"></i>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">上車地點</label>
              <div className="relative group">
                <i className="fas fa-location-dot absolute left-5 top-1/2 -translate-y-1/2 text-rose-500 group-focus-within:scale-110 transition-transform"></i>
                <input 
                  ref={pickupRef}
                  type="text" 
                  value={pickupAddr}
                  onChange={(e) => setPickupAddr(e.target.value)}
                  placeholder="輸入上車地址..."
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-rose-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">目的地 (可不填)</label>
              <div className="relative group">
                <i className="fas fa-flag-checkered absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-800 transition-colors"></i>
                <input 
                  ref={destRef}
                  type="text" 
                  value={destAddr}
                  onChange={(e) => setDestAddr(e.target.value)}
                  placeholder="要去哪裡？"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-slate-800 focus:bg-white transition-all"
                />
              </div>
            </div>

            {estimatedPrice > 0 && (
              <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 text-center animate-in slide-in-from-top-2">
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">精確路徑預估車資</p>
                 <p className="text-3xl font-black text-rose-600 tracking-tighter">${estimatedPrice}</p>
                 <p className="text-[9px] text-rose-400 font-bold mt-1">最終車資以司機結單為準</p>
              </div>
            )}

            <button type="submit" disabled={isBooking} className="w-full py-5 bg-rose-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-3">
              {isBooking ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><i className="fas fa-paper-plane"></i> 立即呼叫千尋司機</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;
