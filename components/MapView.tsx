
import React, { useState, useEffect, useRef } from 'react';
import { Vehicle, Order, OrderStatus } from '../types';

interface MapViewProps {
  vehicles: Vehicle[];
  orders: Order[];
}

const MapView: React.FC<MapViewProps> = ({ vehicles, orders }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const [googleMap, setGoogleMap] = useState<any>(null);
  const [markers, setMarkers] = useState<Record<string, any>>({});
  const directionsRenderer = useRef<any>(null);

  useEffect(() => {
    // 檢查 Google Maps 是否已正確加載 (包含 Key 驗證)
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        try {
          // 嘗試初始化地圖，如果 Key 有誤會觸發 onerror 或在 console 報錯
          const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: { lat: 22.6273, lng: 120.3014 },
            zoom: 13,
            disableDefaultUI: true,
            styles: [
              { featureType: "all", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#cbd5e1" }] }
            ]
          });
          
          directionsRenderer.current = new window.google.maps.DirectionsRenderer({
            map: mapInstance,
            suppressMarkers: true,
            polylineOptions: { strokeColor: "#e11d48", strokeWeight: 5 }
          });

          setGoogleMap(mapInstance);
          setMapStatus('active');
        } catch (e) {
          console.error("Map Init Failed:", e);
          setMapStatus('error');
        }
      } else {
        // 動態加載 Script
        const scriptId = 'google-maps-loader';
        if (document.getElementById(scriptId)) return;
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.API_KEY}&libraries=places,geometry&language=zh-TW`;
        script.async = true;
        script.onload = () => setTimeout(checkGoogleMaps, 1000);
        script.onerror = () => setMapStatus('error');
        document.head.appendChild(script);
      }
    };

    checkGoogleMaps();
    
    // 超時檢測：如果 5 秒內地圖沒 active，視為加載失敗 (可能是 InvalidKeyMapError)
    const timer = setTimeout(() => {
      if (mapStatus === 'loading') setMapStatus('error');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // 渲染標記邏輯
  useEffect(() => {
    if (mapStatus !== 'active' || !googleMap) return;

    vehicles.forEach(v => {
      const pos = { lat: v.location.lat, lng: v.location.lng };
      if (markers[v.id]) {
        markers[v.id].setPosition(pos);
      } else {
        const marker = new window.google.maps.Marker({
          position: pos,
          map: googleMap,
          icon: {
            path: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z",
            fillColor: v.status === 'IDLE' ? '#10b981' : '#f59e0b',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 1,
            rotation: 0
          }
        });
        markers[v.id] = marker;
      }
    });
  }, [vehicles, googleMap, mapStatus]);

  return (
    <div className="h-full relative bg-slate-100 overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 z-0"></div>
      
      {/* 錯誤回退介面 (當 API Key 無效時顯示) */}
      {mapStatus === 'error' && (
        <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-24 h-24 bg-rose-600/20 rounded-[2rem] flex items-center justify-center text-rose-500 text-4xl mb-6 animate-pulse">
            <i className="fas fa-map-location-dot"></i>
          </div>
          <h3 className="text-white text-2xl font-black mb-4 tracking-tight">地圖服務暫時離線</h3>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
            系統偵測到地圖憑證 (InvalidKeyMapError) 異常。請確保您的 Google Cloud 已啟用 Maps JS API。
            <br/><span className="text-rose-500 font-bold">目前已切換至緊急調度數據模式。</span>
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">在線車輛</p>
              <p className="text-xl font-black text-white">{vehicles.length} 輛</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">派發中訂單</p>
              <p className="text-xl font-black text-rose-500">{orders.filter(o => o.status === OrderStatus.DISPATCHING).length} 件</p>
            </div>
          </div>
        </div>
      )}

      {/* 頂部狀態浮動卡片 */}
      <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none flex justify-between items-start">
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white pointer-events-auto flex items-center gap-4">
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${mapStatus === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
             <i className={`fas ${mapStatus === 'active' ? 'fa-check-circle' : 'fa-triangle-exclamation'}`}></i>
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
               {mapStatus === 'active' ? 'Google Maps 實時串接' : '模擬數據模式'}
             </p>
             <p className="text-sm font-black text-slate-800 tracking-tight">全高雄調度節點監控中</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
