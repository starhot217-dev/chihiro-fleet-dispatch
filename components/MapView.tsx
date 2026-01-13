
import React, { useState, useEffect, useRef } from 'react';
import { Vehicle, Order, OrderStatus } from '../types';
import { DataService } from '../services/dataService';

interface MapViewProps {
  vehicles: Vehicle[];
  orders: Order[];
}

const MapView: React.FC<MapViewProps> = ({ vehicles, orders }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<'loading' | 'active' | 'error' | 'setup'>('loading');
  const [googleMap, setGoogleMap] = useState<any>(null);
  const [markers, setMarkers] = useState<Record<string, any>>({});
  const config = DataService.getConfig();

  useEffect(() => {
    // 全域捕獲 Google Maps 驗證錯誤
    (window as any).gm_authFailure = () => {
      console.error("Google Maps API Key 有誤或尚未授權。");
      setMapStatus('error');
    };

    const initMap = () => {
      const win = window as any;
      if (!win.google || !win.google.maps) return;

      try {
        const mapInstance = new win.google.maps.Map(mapRef.current, {
          center: { lat: 22.6273, lng: 120.3014 },
          zoom: 14,
          styles: [
            { featureType: "all", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] }
          ]
        });
        setGoogleMap(mapInstance);
        setMapStatus('active');
      } catch (e) {
        setMapStatus('error');
      }
    };

    if (!config.googleMapsApiKey || config.googleMapsApiKey.trim() === '') {
      setMapStatus('setup');
      return;
    }

    const scriptId = 'google-maps-loader';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places&language=zh-TW`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => setMapStatus('error');
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [config.googleMapsApiKey]);

  return (
    <div className="h-full relative bg-slate-100 overflow-hidden">
      <div ref={mapRef} className={`absolute inset-0 z-0 transition-opacity duration-1000 ${mapStatus === 'active' ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* 導引介面：未設定金鑰時 */}
      {mapStatus === 'setup' && (
        <div className="absolute inset-0 z-20 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
          <div className="w-20 h-20 bg-amber-500 rounded-[2rem] flex items-center justify-center text-3xl mb-8 animate-bounce">
            <i className="fas fa-key"></i>
          </div>
          <h3 className="text-3xl font-black mb-4">需要 Google Maps API 金鑰</h3>
          <p className="text-slate-400 text-sm max-w-md mb-10 leading-relaxed font-medium">
            為了啟動即時派遣地圖，您需要一個有效的 Google Maps JavaScript API Key。請前往「系統配置」分頁進行設定。
          </p>
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-left w-full max-w-md space-y-3">
             <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">開發提示</p>
             <p className="text-xs text-slate-300">1. 到 Google Cloud Console 啟用 Maps JavaScript API</p>
             <p className="text-xs text-slate-300">2. 取得 API Key 並在系統設定中填入</p>
          </div>
        </div>
      )}

      {mapStatus === 'error' && (
        <div className="absolute inset-0 z-20 bg-rose-950 flex flex-col items-center justify-center p-8 text-center text-white">
          <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center text-3xl mb-8">
            <i className="fas fa-triangle-exclamation"></i>
          </div>
          <h3 className="text-2xl font-black mb-2">Google Maps 驗證失敗</h3>
          <p className="text-rose-200/60 text-sm max-w-sm mb-10">InvalidKeyMapError: 您的金鑰可能已過期或未開啟帳單功能。</p>
        </div>
      )}

      {mapStatus === 'loading' && (
        <div className="absolute inset-0 z-10 bg-slate-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-rose-600 rounded-full animate-spin"></div>
        </div>
      )}

      {mapStatus === 'active' && (
        <div className="absolute top-10 right-10 z-10 space-y-4">
           <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-xs font-black text-slate-800">在線: {vehicles.filter(v => v.status === 'ONLINE').length}</span>
              </div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                 <span className="text-xs font-black text-slate-800">任務: {vehicles.filter(v => v.status === 'BUSY').length}</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
