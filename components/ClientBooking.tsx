
import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, Vehicle } from '../types';
import { MOCK_VEHICLES, TAIWAN_AREAS } from '../constants';

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
  const [pickup, setPickup] = useState({ county: '高雄市', district: '鳳山區', street: '' });
  const [destination, setDestination] = useState({ county: '高雄市', district: '', street: '' });
  
  const [isBooking, setIsBooking] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);

  const fullPickup = useMemo(() => `${pickup.county}${pickup.district}${pickup.street}`, [pickup]);
  const fullDest = useMemo(() => `${destination.county}${destination.district}${destination.street}`, [destination]);

  const showMap = useMemo(() => {
    return pickup.street.length > 0 && destination.district.length > 0 && destination.street.length > 0;
  }, [pickup.street, destination.district, destination.street]);

  // Real-time calculation when destination is typed
  useEffect(() => {
    if (showMap) {
      // Logic for mock calculation
      const seed = fullPickup.length + fullDest.length;
      const mockDistance = (seed % 20) + 3; // 3-23 km
      const mockTime = Math.floor(mockDistance * 1.8); 
      const price = pricingConfig.baseFare + (mockDistance * pricingConfig.perKm) + (mockTime * pricingConfig.perMinute);
      
      setEstimatedPrice(price);
      setEstimatedMinutes(mockTime);
    }
  }, [fullPickup, fullDest, showMap, pricingConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    
    setTimeout(() => {
      onCreateOrder({
        clientName: '李先生',
        clientPhone: '0910-000-888',
        pickup: fullPickup,
        destination: fullDest,
        price: estimatedPrice,
      });
      setIsBooking(false);
    }, 1500);
  };

  if (activeOrder) {
    const assignedVehicle = activeOrder.vehicleId ? MOCK_VEHICLES.find(v => v.id === activeOrder.vehicleId) : null;

    return (
      <div className="flex justify-center items-center min-h-full p-4 bg-slate-100">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-slate-800 relative">
          <div className="h-6 bg-slate-800 w-1/3 mx-auto rounded-b-2xl mb-4 relative z-20"></div>
          
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">訂單追蹤</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Order ID: {activeOrder.id}</p>
            </div>

            <div className="relative h-48 rounded-[2rem] bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
               <div className="absolute inset-0 opacity-40">
                <svg width="100%" height="100%" className="text-slate-400">
                  <defs>
                    <pattern id="gridClient" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#gridClient)" />
                </svg>
               </div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="relative w-full px-12">
                   <div className="h-1 bg-rose-100 w-full rounded-full overflow-hidden">
                     <div className="h-full bg-rose-600 animate-[progress_3s_ease-in-out_infinite]" style={{width: '60%'}}></div>
                   </div>
                   <div className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 bg-rose-600 rounded-full ring-4 ring-rose-100"></div>
                   <div className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-500 rounded-full ring-4 ring-slate-100"></div>
                   <div className="absolute left-[30%] top-1/2 -translate-y-full -translate-x-1/2 animate-bounce">
                     <i className="fas fa-car-side text-rose-600 text-xl drop-shadow-lg"></i>
                   </div>
                 </div>
               </div>
            </div>

            <div className="relative flex flex-col items-center">
              {activeOrder.status === OrderStatus.PENDING || activeOrder.status === OrderStatus.DISPATCHING ? (
                <>
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-rose-400/20 rounded-full animate-ping"></div>
                    <i className="fas fa-satellite-dish text-2xl text-rose-600"></i>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-lg font-black text-slate-800">正在為您尋找最合適的司機...</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">系統派遣廣播中</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-50 relative">
                     <i className="fas fa-user-check text-2xl text-emerald-600"></i>
                     <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100">
                       <i className="fab fa-line text-[#00b900]"></i>
                     </div>
                  </div>
                  <div className="mt-6 text-center w-full">
                    <p className="text-lg font-black text-emerald-600">司機已承接任務！</p>
                    <div className="mt-4 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 w-full text-left">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                            <i className="fas fa-id-card text-rose-500"></i>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase">駕駛資訊</p>
                            <p className="font-black text-slate-800 text-base">{assignedVehicle?.driverName || '精神小伙'}</p>
                            <p className="text-xs font-bold text-rose-500">{assignedVehicle?.plateNumber || '1932'} • 銀色</p>
                          </div>
                        </div>
                        <button className="w-10 h-10 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors">
                          <i className="fas fa-phone text-rose-500"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <i className="fas fa-circle text-[8px] text-rose-500 mt-2"></i>
                  <div className="w-px h-6 border-l-2 border-dashed border-slate-300 my-1"></div>
                  <i className="fas fa-square text-[8px] text-slate-500"></i>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Pickup</p>
                    <p className="text-sm font-bold text-slate-700 leading-tight">{activeOrder.pickup}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Destination</p>
                    <p className="text-sm font-bold text-slate-700 leading-tight">{activeOrder.destination}</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95"
              onClick={onResetOrder}
            >
              返回主畫面
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-full p-4 bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-slate-800 relative transition-all duration-500">
        <div className="h-6 bg-slate-800 w-1/3 mx-auto rounded-b-2xl mb-4 relative z-20"></div>
        
        <div className="p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-none">Chihiro Dispatch</p>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter mt-1">千尋派車系統</h2>
            </div>
            <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100 rotate-3">
              <i className="fas fa-heart"></i>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3 bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">上車地點 (Pickup)</p>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  className="bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-rose-500 outline-none"
                  value={pickup.county}
                  onChange={(e) => setPickup({...pickup, county: e.target.value, district: TAIWAN_AREAS[e.target.value][0]})}
                >
                  {Object.keys(TAIWAN_AREAS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  className="bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-rose-500 outline-none"
                  value={pickup.district}
                  onChange={(e) => setPickup({...pickup, district: e.target.value})}
                >
                  {TAIWAN_AREAS[pickup.county].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <input 
                type="text" 
                placeholder="輸入路名、巷弄..."
                required
                value={pickup.street}
                onChange={(e) => setPickup({...pickup, street: e.target.value})}
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-black text-slate-700 placeholder:text-slate-300 focus:border-rose-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">目的地 (Destination)</p>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  className="bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-rose-500 outline-none"
                  value={destination.county}
                  onChange={(e) => setDestination({...destination, county: e.target.value, district: TAIWAN_AREAS[e.target.value][0]})}
                >
                  {Object.keys(TAIWAN_AREAS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  className="bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-bold focus:border-rose-500 outline-none"
                  value={destination.district}
                  onChange={(e) => setDestination({...destination, district: e.target.value})}
                >
                  <option value="" disabled>選擇區域</option>
                  {TAIWAN_AREAS[destination.county].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <input 
                type="text" 
                placeholder="輸入終點路名..."
                required
                value={destination.street}
                onChange={(e) => setDestination({...destination, street: e.target.value})}
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-black text-slate-700 placeholder:text-slate-300 focus:border-rose-500 outline-none transition-all"
              />
            </div>

            <div className={`transition-all duration-700 ease-in-out overflow-hidden relative ${showMap ? 'h-64 opacity-100 mb-6' : 'h-0 opacity-0'}`}>
              <div className="w-full h-full bg-[#fff5f5] rounded-[2rem] border-2 border-rose-100 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg width="100%" height="100%">
                    <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f43f5e" strokeWidth="1"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#mapGrid)" />
                  </svg>
                </div>

                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-rose-50 animate-in slide-in-from-left duration-500">
                        <p className="text-[10px] font-black text-rose-500 uppercase">起點</p>
                        <p className="text-xs font-bold text-slate-700 max-w-[120px] truncate">{fullPickup}</p>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-50 animate-in slide-in-from-right duration-500">
                        <p className="text-[10px] font-black text-slate-500 uppercase">終點</p>
                        <p className="text-xs font-bold text-slate-700 max-w-[120px] truncate">{fullDest}</p>
                      </div>
                   </div>

                   <div className="absolute inset-0 flex items-center justify-center px-12 pointer-events-none">
                      <svg width="100%" height="100%" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d="M40,75 C80,20 220,130 260,75" 
                          stroke="#fee2e2" 
                          strokeWidth="6" 
                          strokeLinecap="round" 
                        />
                        <path 
                          d="M40,75 C80,20 220,130 260,75" 
                          stroke="#f43f5e" 
                          strokeWidth="4" 
                          strokeLinecap="round" 
                          strokeDasharray="400"
                          strokeDashoffset="400"
                          className="animate-[drawPath_2s_ease-out_forwards]"
                        />
                        <circle cx="40" cy="75" r="5" fill="#f43f5e" className="animate-pulse" />
                        <circle cx="260" cy="75" r="5" fill="#64748b" className="animate-pulse" />
                      </svg>
                      <style>{`
                        @keyframes drawPath {
                          to { stroke-dashoffset: 0; }
                        }
                      `}</style>
                   </div>

                   <div className="flex justify-center">
                     <div className="bg-slate-900/90 backdrop-blur-md px-5 py-2 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom duration-500">
                        <div className="text-center border-r border-slate-700 pr-4">
                           <p className="text-[8px] font-black text-rose-400 uppercase">即時估價</p>
                           <p className="text-sm font-black text-white">${estimatedPrice}</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[8px] font-black text-emerald-400 uppercase">預計時間</p>
                           <p className="text-sm font-black text-white">{estimatedMinutes} 分鐘</p>
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-3xl border-2 border-rose-600 shadow-lg shadow-rose-50 cursor-pointer transition-all">
                <div className="flex justify-between items-start mb-2">
                  <i className="fas fa-car-side text-rose-600 text-lg"></i>
                  <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">首選</span>
                </div>
                <p className="text-xs font-black text-slate-800">安心搭 (主)</p>
                <p className="text-[9px] text-slate-400 font-bold leading-none mt-1">專業認證駕駛</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-3xl border-2 border-transparent opacity-40 grayscale cursor-not-allowed transition-all">
                <i className="fas fa-couch text-slate-400 text-lg mb-2"></i>
                <p className="text-xs font-black text-slate-400">奢華商務</p>
                <p className="text-[9px] text-slate-400 font-bold leading-none mt-1">暫無服務</p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isBooking}
              className={`w-full py-5 rounded-[2rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 ${
                isBooking 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200'
              }`}
            >
              {isBooking ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  正在規劃最佳路徑...
                </>
              ) : (
                <>
                  立即叫車 <i className="fas fa-chevron-right text-sm"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
               <i className="fas fa-shield-halved text-rose-500 text-[10px]"></i>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Safe & Secured by 千尋派車</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;
