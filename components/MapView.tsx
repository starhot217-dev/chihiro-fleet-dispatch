
import React, { useState } from 'react';
import { MOCK_VEHICLES } from '../constants';
import { Vehicle } from '../types';

const MapView: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = MOCK_VEHICLES.filter(v => 
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driverName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full relative overflow-hidden flex flex-col bg-slate-100">
      <div className="flex-1 relative bg-[#e5e7eb]">
        {/* Advanced Map Background Simulation */}
        <div className="absolute inset-0 overflow-hidden">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
            <defs>
              <pattern id="gridLarge" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#64748b" strokeWidth="1"/>
              </pattern>
              <pattern id="gridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridSmall)" />
            <rect width="100%" height="100%" fill="url(#gridLarge)" />
            {/* Simulated Roads */}
            <path d="M0,200 Q400,180 800,250 T1600,200" stroke="#cbd5e1" strokeWidth="40" fill="none" strokeLinecap="round" />
            <path d="M300,0 L350,1000" stroke="#cbd5e1" strokeWidth="40" fill="none" />
            <path d="M700,0 L650,1000" stroke="#cbd5e1" strokeWidth="30" fill="none" />
          </svg>
        </div>

        {/* Floating Controls */}
        <div className="absolute top-6 left-6 z-10 space-y-3">
          <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white w-72">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200">
              <i className="fas fa-search"></i>
            </div>
            <input 
              type="text" 
              placeholder="搜尋車號或司機..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full font-medium text-slate-700"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg text-xs font-bold text-slate-700 hover:bg-white transition-all border border-slate-100">
              <i className="fas fa-layer-group mr-2 text-indigo-500"></i>圖層
            </button>
            <button className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg text-xs font-bold text-slate-700 hover:bg-white transition-all border border-slate-100">
              <i className="fas fa-traffic-light mr-2 text-rose-500"></i>路況
            </button>
          </div>
        </div>

        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
          <button className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all border border-slate-100">
            <i className="fas fa-plus"></i>
          </button>
          <button className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all border border-slate-100">
            <i className="fas fa-minus"></i>
          </button>
          <button className="w-12 h-12 bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center text-white hover:bg-indigo-700 transition-all shadow-indigo-200">
            <i className="fas fa-location-crosshairs"></i>
          </button>
        </div>

        {/* Dynamic Vehicle Markers */}
        {filteredVehicles.map((v, i) => (
          <div 
            key={v.id}
            className={`absolute cursor-pointer transition-all duration-500 hover:z-20`}
            style={{ 
              top: `${20 + (i * 15)}%`, 
              left: `${15 + (i * 20)}%`,
              transform: selectedVehicle?.id === v.id ? 'scale(1.2)' : 'scale(1)'
            }}
            onClick={() => setSelectedVehicle(v)}
          >
            <div className="relative group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white transition-all ${
                v.status === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                <i className={`fas ${v.type === 'TRUCK' ? 'fa-truck' : 'fa-car-side'} text-white`}></i>
              </div>
              
              {/* Tooltip Label */}
              <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap shadow-xl transition-all ${
                selectedVehicle?.id === v.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0'
              }`}>
                {v.plateNumber} • {v.driverName}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Status Overlay for Selection */}
        {selectedVehicle && (
          <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-80 bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white z-20 animate-in slide-in-from-bottom duration-300">
            <button 
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg ${
                selectedVehicle.status === 'IDLE' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-amber-500 shadow-amber-100'
              }`}>
                <i className="fas fa-id-card"></i>
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-lg">{selectedVehicle.plateNumber}</h4>
                <p className="text-sm text-slate-500">{selectedVehicle.driverName} • {selectedVehicle.type}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">狀態</p>
                <p className={`text-xs font-bold ${selectedVehicle.status === 'IDLE' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedVehicle.status === 'IDLE' ? '空車中' : '任務中'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">最後更新</p>
                <p className="text-xs font-bold text-slate-700">{selectedVehicle.lastUpdate}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                指派任務
              </button>
              <button className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all">
                <i className="fas fa-phone"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Footer */}
      <div className="bg-white border-t border-slate-200 p-6 flex gap-6 overflow-x-auto custom-scrollbar">
        {MOCK_VEHICLES.map((v) => (
          <div 
            key={v.id} 
            onClick={() => setSelectedVehicle(v)}
            className={`flex-shrink-0 min-w-[240px] p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              selectedVehicle?.id === v.id 
              ? 'border-indigo-600 bg-indigo-50/50 shadow-lg' 
              : 'border-slate-50 hover:border-indigo-200 bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider ${
                v.status === 'IDLE' ? 'bg-emerald-100 text-emerald-700' : 
                v.status === 'BUSY' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {v.status === 'IDLE' ? 'IDLE' : 'BUSY'}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                <i className="fas fa-clock"></i>
                {v.lastUpdate}
              </div>
            </div>
            <h4 className="font-black text-slate-800 text-base mb-1">{v.plateNumber}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <i className="fas fa-user-circle text-indigo-400"></i>
              {v.driverName}
              <span className="mx-1 opacity-30">•</span>
              {v.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;
