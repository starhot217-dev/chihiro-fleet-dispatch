import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types';

interface MapViewProps {
  vehicles: Vehicle[];
}

declare global {
  interface Window {
    google: any;
  }
}

const MapView: React.FC<MapViewProps> = ({ vehicles }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<Record<string, any>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // 動態載入 Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-loader';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.API_KEY}&libraries=places,geometry&language=zh-TW&v=weekly`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setMapError('無法載入 Google Maps SDK。請檢查您的 API Key 設定與網路連線。');

    document.head.appendChild(script);
  }, []);

  // 初始化地圖實例
  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      try {
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 22.6273, lng: 120.3014 }, // 高雄
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          styles: [
            { featureType: "all", elementType: "geometry", stylers: [{ color: "#f1f5f9" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#cbd5e1" }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] }
          ]
        });
        setMap(newMap);
      } catch (err) {
        console.error(err);
        setMapError('地圖初始化異常 (ApiProjectMapError)。請確認 Cloud Console 已啟用 Maps JavaScript API。');
      }
    }
  }, [isLoaded, map]);

  // 更新車輛標記
  useEffect(() => {
    if (!map || !window.google) return;

    // 清理標記
    const currentIds = new Set(vehicles.map(v => v.id));
    Object.keys(markers).forEach(id => {
      if (!currentIds.has(id)) {
        markers[id].setMap(null);
        delete markers[id];
      }
    });

    // 新增或更新標記
    vehicles.forEach(v => {
      const position = { lat: v.location.lat, lng: v.location.lng };
      const color = v.status === 'IDLE' ? '#10b981' : '#f59e0b';

      if (markers[v.id]) {
        markers[v.id].setPosition(position);
        const icon = markers[v.id].getIcon();
        icon.fillColor = color;
        markers[v.id].setIcon(icon);
      } else {
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: v.plateNumber,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: color,
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#ffffff'
          }
        });

        marker.addListener('click', () => {
          setSelectedVehicle(v);
          map.panTo(position);
        });

        markers[v.id] = marker;
      }
    });

    setMarkers({ ...markers });
  }, [map, vehicles]);

  if (mapError) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-rose-100 text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-triangle-exclamation text-3xl"></i>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Google Maps 載入失敗</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{mapError}</p>
          <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">營運建議事項：</p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>檢查 API Key 是否已啟用 <b>Maps JavaScript API</b>。</li>
              <li>確認帳戶已綁定 <b>Billing Account</b>。</li>
              <li>地圖載入前請確保 process.env.API_KEY 已正確傳遞。</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden bg-slate-100">
      <div ref={mapRef} className="absolute inset-0 z-0"></div>
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold animate-pulse-soft">正在初始化調度地圖...</p>
        </div>
      )}

      {/* Floating Controls */}
      <div className="absolute top-6 left-6 right-6 md:right-auto md:w-80 z-10 space-y-4">
        <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-search"></i>
          </div>
          <input 
            type="text" 
            placeholder="搜尋高雄區車輛..." 
            className="bg-transparent outline-none font-bold text-sm w-full text-slate-700"
          />
        </div>
      </div>

      {/* Selected Driver Info */}
      {selectedVehicle && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white/95 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-2xl border border-white z-20 animate-in slide-in-from-bottom duration-500">
          <button 
            onClick={() => setSelectedVehicle(null)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
          >
            <i className="fas fa-xmark"></i>
          </button>
          <div className="flex items-center gap-5 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg ${selectedVehicle.status === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              <i className="fas fa-car-side"></i>
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-lg">{selectedVehicle.plateNumber}</h4>
              <p className="text-xs font-bold text-slate-500">{selectedVehicle.driverName} • {selectedVehicle.type}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">餘額</p>
              <p className="text-sm font-black text-slate-800">${selectedVehicle.walletBalance}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">目前狀態</p>
              <p className={`text-xs font-black ${selectedVehicle.status === 'IDLE' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {selectedVehicle.status === 'IDLE' ? '待命中' : '任務中'}
              </p>
            </div>
          </div>
          <button className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-200">
            發送調度指令
          </button>
        </div>
      )}
    </div>
  );
};

export default MapView;