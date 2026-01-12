
import React, { useState, useEffect, useRef } from 'react';
import { Vehicle, Order, OrderStatus } from '../types';

interface MapViewProps {
  vehicles: Vehicle[];
  orders: Order[];
}

declare global {
  interface Window {
    google: any;
  }
}

const MapView: React.FC<MapViewProps> = ({ vehicles, orders }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<Record<string, any>>({});
  const [orderMarkers, setOrderMarkers] = useState<Record<string, any>>({});
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

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
    script.onerror = () => setMapError('無法載入 Google Maps SDK。');
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 22.6273, lng: 120.3014 },
        zoom: 13,
        disableDefaultUI: true,
        styles: [
          { featureType: "all", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#e2e8f0" }] }
        ]
      });
      const renderer = new window.google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: true,
        polylineOptions: { strokeColor: "#e11d48", strokeOpacity: 0.6, strokeWeight: 5 }
      });
      setMap(newMap);
      setDirectionsRenderer(renderer);
    }
  }, [isLoaded, map]);

  // 更新車輛
  useEffect(() => {
    if (!map) return;
    vehicles.forEach(v => {
      const position = { lat: v.location.lat, lng: v.location.lng };
      if (markers[v.id]) {
        markers[v.id].setPosition(position);
      } else {
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: v.driverName,
          icon: {
            path: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
            fillColor: v.status === 'IDLE' ? '#10b981' : '#f59e0b',
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#ffffff',
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 12)
          }
        });
        marker.addListener('click', () => setSelectedVehicle(v));
        markers[v.id] = marker;
      }
    });
    setMarkers({ ...markers });
  }, [map, vehicles]);

  // 更新訂單 (只顯示待處理與廣播中的訂單)
  useEffect(() => {
    if (!map) return;
    const activeOrders = orders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.DISPATCHING);
    
    // 清理舊標記
    // Fix: Explicitly cast to any[] to ensure m.setMap is accessible and avoid TS inferring it as unknown
    (Object.values(orderMarkers) as any[]).forEach(m => m.setMap(null));
    const newOrderMarkers: any = {};

    activeOrders.forEach(o => {
      // 這裡假設我們有經緯度，實務上需透過 Geocoding。此處模擬隨機偏移
      const marker = new window.google.maps.Marker({
        position: { lat: 22.62 + (Math.random() * 0.05), lng: 120.30 + (Math.random() * 0.05) },
        map,
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: '#e11d48',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          scale: 1.5
        }
      });
      newOrderMarkers[o.id] = marker;
    });
    setOrderMarkers(newOrderMarkers);
  }, [map, orders]);

  return (
    <div className="h-full relative overflow-hidden bg-slate-100">
      <div ref={mapRef} className="absolute inset-0 z-0"></div>
      
      {/* 浮動狀態列 */}
      <div className="absolute top-6 left-6 right-6 flex flex-col md:flex-row gap-4 z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white pointer-events-auto flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center text-white">
            <i className="fas fa-satellite"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">地圖動態</p>
            <p className="text-sm font-black text-slate-800">{vehicles.length} 輛車 • {orders.filter(o => o.status === OrderStatus.DISPATCHING).length} 張廣播單</p>
          </div>
        </div>
      </div>

      {selectedVehicle && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white p-6 rounded-[2.5rem] shadow-2xl z-20 animate-in slide-in-from-bottom duration-300">
          <h4 className="font-black text-slate-800 mb-1">{selectedVehicle.driverName}</h4>
          <p className="text-xs font-bold text-slate-400 uppercase mb-4">{selectedVehicle.plateNumber}</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
             <div className="bg-slate-50 p-3 rounded-2xl text-center">
                <p className="text-[9px] font-black text-slate-400">錢包</p>
                <p className="text-sm font-black text-slate-700">${selectedVehicle.walletBalance}</p>
             </div>
             <div className="bg-slate-50 p-3 rounded-2xl text-center">
                <p className="text-[9px] font-black text-slate-400">狀態</p>
                <p className="text-sm font-black text-emerald-600">{selectedVehicle.status}</p>
             </div>
          </div>
          <button onClick={() => setSelectedVehicle(null)} className="w-full py-3 bg-slate-100 rounded-xl font-black text-xs text-slate-500">關閉細節</button>
        </div>
      )}
    </div>
  );
};

export default MapView;
