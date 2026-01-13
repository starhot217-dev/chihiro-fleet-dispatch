
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
    // 定義全域授權失敗處理器 (Google Maps API 規範)
    (window as any).gm_authFailure = () => {
      console.error("Google Maps Authentication Failed: InvalidKeyMapError");
      setMapStatus('error');
    };

    const checkGoogleMaps = () => {
      const win = window as any;
      
      // 如果已經加載過且有錯誤標記，直接返回
      if (mapStatus === 'error') return;

      if (win.google && win.google.maps) {
        try {
          const mapInstance = new win.google.maps.Map(mapRef.current, {
            center: { lat: 22.6273, lng: 120.3014 },
            zoom: 13,
            disableDefaultUI: true,
            styles: [
              { featureType: "all", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#cbd5e1" }] }
            ]
          });
          
          directionsRenderer.current = new win.google.maps.DirectionsRenderer({
            map: mapInstance,
            suppressMarkers: true,
            polylineOptions: { strokeColor: "#e11d48", strokeWeight: 5 }
          });

          setGoogleMap(mapInstance);
          setMapStatus('active');
        } catch (e) {
          console.error("Map Initialization Error:", e);
          setMapStatus('error');
        }
      } else {
        const scriptId = 'google-maps-loader';
        if (document.getElementById(scriptId)) return;
        
        const script = document.createElement('script');
        script.id = scriptId;
        // 確保傳入正確的 API KEY
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.API_KEY}&libraries=places,geometry&language=zh-TW`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          // 稍微延遲以確保 google.maps 命名空間已填充
          setTimeout(checkGoogleMaps, 500);
        };
        script.onerror = () => setMapStatus('error');
        document.head.appendChild(script);
      }
    };

    checkGoogleMaps();
    
    // 安全超時：如果 4 秒內地圖沒 active，通常代表 API 加載出問題
    const timer = setTimeout(() => {
      if (mapStatus === 'loading') setMapStatus('error');
    }, 4000);

    return () => {
      clearTimeout(timer);
      (window as any).gm_authFailure = null;
    };
  }, []);

  // 渲染車輛標記
  useEffect(() => {
    if (mapStatus !== 'active' || !googleMap) return;

    const win = window as any;
    vehicles.forEach(v => {
      const pos = { lat: v.location.lat, lng: v.location.lng };
      if (markers[v.id]) {
        markers[v.id].setPosition(pos);
      } else {
        const marker = new win.google.maps.Marker({
          position: pos,
          map: googleMap,
          title: v.driverName,
          icon: {
            path: win.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: v.status === 'IDLE' ? '#10b981' : '#f59e0b',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 5,
            rotation: 0
          }
        });
        markers[v.id] = marker;
      }
    });
  }, [vehicles, googleMap, mapStatus]);

  return (
    <div className="h-full relative bg-slate-100 overflow-hidden">
      {/* 地圖容器 */}
      <div 
        ref={mapRef} 
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ${mapStatus === 'active' ? 'opacity-100' : 'opacity-0'}`}
      ></div>
      
      {/* 載入中狀態 */}
      {mapStatus === 'loading' && (
        <div className="absolute inset-0 z-10 bg-slate-50 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-rose-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">地圖引擎初始化中...</p>
        </div>
      )}

      {/* 錯誤回退介面 (專門處理 InvalidKeyMapError) */}
      {mapStatus === 'error' && (
        <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-rose-600/20 rounded-[2rem] flex items-center justify-center text-rose-500 text-3xl mb-8 border border-rose-500/20 animate-pulse">
            <i className="fas fa-triangle-exclamation"></i>
          </div>
          <h3 className="text-white text-2xl font-black mb-2 tracking-tight">地圖認證失效 (InvalidKeyMapError)</h3>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-10">
            當前的 API Key 可能未啟用「Maps JavaScript API」權限或帳單設定有誤。系統已自動切換至 <span className="text-rose-500 font-bold">緊急數位監控模式</span>。
          </p>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">在線司機</p>
              <p className="text-2xl font-black text-white">{vehicles.length}</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">派發訂單</p>
              <p className="text-2xl font-black text-rose-500">{orders.filter(o => o.status === OrderStatus.DISPATCHING).length}</p>
            </div>
            <div className="col-span-2 bg-slate-800/50 p-5 rounded-3xl border border-white/5 text-left">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">區域節點狀態</p>
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-bold">苓雅/新興區</span>
                    <span className="text-emerald-500">正常</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-bold">鳳山/三民區</span>
                    <span className="text-amber-500">熱點擁擠</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 頂部狀態浮動卡片 (僅在成功時顯示) */}
      {mapStatus === 'active' && (
        <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none flex justify-between items-start">
          <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white pointer-events-auto flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
               <i className="fas fa-check-circle"></i>
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Google Maps 實時連線</p>
               <p className="text-sm font-black text-slate-800 tracking-tight">高雄 HUB 調度節點監控中</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
