
import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';

interface MapViewProps {
  vehicles: Vehicle[];
}

const MapView: React.FC<MapViewProps> = ({ vehicles }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredVehicles = vehicles.filter(v => 
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driverName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full relative overflow-hidden flex flex-col bg-slate-100 font-sans">
      <div className="flex-1 relative bg-[#f8fafc] overflow-hidden">
        {/* Advanced Map Simulation Background */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-[#e5e7eb]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="roadPattern" width="200" height="200" patternUnits="userSpaceOnUse">
                  <rect width="200" height="200" fill="#f1f5f9" />
                  <path d="M0 100 H200 M100 0 V200" stroke="#cbd5e1" strokeWidth="20" />
                  <path d="M0 100 H200 M100 0 V200" stroke="#94a3b8" strokeWidth="1" strokeDasharray="10 10" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#roadPattern)" />
              {/* Simulated Large Arteries */}
              <path d="M -50,300 L 2000,600" stroke="#cbd5e1" strokeWidth="60" fill="none" opacity="0.5" />
              <path d="M 400,-50 L 600,1200" stroke="#cbd5e1" strokeWidth="50" fill="none" opacity="0.5" />
              {/* Green Areas Simulation */}
              <circle cx="200" cy="200" r="150" fill="#dcfce7" opacity="0.4" />
              <circle cx="800" cy="700" r="200" fill="#dcfce7" opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Search & Controls */}
        <div className="absolute top-6 left-6 z-10 space-y-4 w-80">
          <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white flex items-center gap-3 group">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200 group-focus-within:scale-110 transition-transform">
              <i className="fas fa-search text-sm"></i>
            </div>
            <input 
              type="text" 
              placeholder="搜尋車號、姓名..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
          
          <div className="flex gap-2">
            <button className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg text-[10px] font-black text-slate-600 hover:bg-white transition-all border border-slate-100 uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-layer-group text-rose-500"></i>衛星圖層
            </button>
            <button className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg text-[10px] font-black text-slate-600 hover:bg-white transition-all border border-slate-100 uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-traffic-light text-amber-500"></i>即時路況
            </button>
          </div>
        </div>

        {/* Map UI Elements */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <button className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all border-b border-slate-50">
              <i className="fas fa-plus"></i>
            </button>
            <button className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all">
              <i className="fas fa-minus"></i>
            </button>
          </div>
          <button className="w-12 h-12 bg-rose-600 rounded-2xl shadow-xl flex items-center justify-center text-white hover:bg-rose-700 transition-all shadow-rose-200 active:scale-90">
            <i className="fas fa-location-crosshairs"></i>
          </button>
        </div>

        {/* Dynamic Vehicle Markers */}
        <div className="absolute inset-0 pointer-events-none">
          {filteredVehicles.map((v, i) => {
            const isSelected = selectedVehicle?.id === v.id;
            return (
              <div 
                key={v.id}
                className="absolute pointer-events-auto cursor-pointer transition-all duration-700 ease-out"
                style={{ 
                  top: `${25 + (i * 12)}%`, 
                  left: `${20 + (i * 18)}%`,
                  transform: isSelected ? 'scale(1.2) translate(-50%, -50%)' : 'scale(1) translate(-50%, -50%)',
                  zIndex: isSelected ? 50 : 10
                }}
                onClick={() => setSelectedVehicle(v)}
              >
                <div className="relative group flex flex-col items-center">
                  {/* Driver Label (Desktop) */}
                  <div className={`mb-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap shadow-2xl transition-all ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {v.plateNumber} | {v.driverName}
                  </div>
                  
                  {/* The Marker */}
                  <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white transition-all ${
                    v.status === 'IDLE' ? 'bg-emerald-500' : v.status === 'BUSY' ? 'bg-amber-500' : 'bg-slate-400'
                  }`}>
                    <i className={`fas ${v.type === 'TRUCK' ? 'fa-truck' : 'fa-car-side'} text-white text-lg`}></i>
                    {/* Pulsing Status Dot */}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      v.status === 'IDLE' ? 'bg-emerald-400' : 'bg-amber-400'
                    } animate-pulse`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Vehicle Detail Card */}
        {selectedVehicle && (
          <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-96 bg-white/95 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-white z-[60] animate-in slide-in-from-bottom duration-500">
            <button 
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
            
            <div className="flex items-center gap-5 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg ${
                selectedVehicle.status === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                <i className="fas fa-id-card-clip"></i>
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xl tracking-tight">{selectedVehicle.plateNumber}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedVehicle.type}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-sm font-bold text-slate-600">{selectedVehicle.driverName}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">錢包餘額</p>
                <p className="text-lg font-black text-slate-800">${selectedVehicle.walletBalance}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">當前狀態</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedVehicle.status === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <p className={`text-sm font-black ${selectedVehicle.status === 'IDLE' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedVehicle.status === 'IDLE' ? '待命中' : '任務中'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 active:scale-95">
                立即指派單次任務
              </button>
              <button className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                <i className="fas fa-phone-volume"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Fleet Footer List */}
      <div className="bg-white border-t border-slate-100 p-6 flex gap-6 overflow-x-auto custom-scrollbar">
        {vehicles.map((v) => (
          <div 
            key={v.id} 
            onClick={() => setSelectedVehicle(v)}
            className={`flex-shrink-0 w-64 p-5 rounded-3xl border-2 transition-all cursor-pointer group ${
              selectedVehicle?.id === v.id 
              ? 'border-rose-600 bg-rose-50/30 shadow-xl scale-105' 
              : 'border-slate-50 hover:border-rose-200 bg-white hover:shadow-lg'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase ${
                v.status === 'IDLE' ? 'bg-emerald-100 text-emerald-700' : 
                v.status === 'BUSY' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {v.status}
              </span>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-black">
                <i className="fas fa-signal"></i>
                CONNECTED
              </div>
            </div>
            <h4 className="font-black text-slate-900 text-lg mb-1 group-hover:text-rose-600 transition-colors">{v.plateNumber}</h4>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <i className="fas fa-user-circle text-rose-400"></i>
              {v.driverName}
              <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
              <span className="text-[10px] opacity-60 uppercase">{v.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;
