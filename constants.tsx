
import { Vehicle, VehicleType, Order, OrderStatus, DriverPriority } from './types';

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'V1', profileId: 'P1', plateNumber: 'ABC-1234', type: VehicleType.SEDAN, color: '黑', driverName: '王大明', driverPhone: '0912-345-678', status: 'ONLINE', location: { lat: 22.6273, lng: 120.3014 }, lastUpdate: '2 mins ago', walletBalance: 1500, priority: DriverPriority.INTERNAL },
  { id: 'V2', profileId: 'P2', plateNumber: 'AHX-7515', type: VehicleType.SEDAN, color: '白', driverName: '米修(測試)', driverPhone: '0922-111-222', status: 'ONLINE', location: { lat: 22.6393, lng: 120.3021 }, lastUpdate: 'Just now', walletBalance: 450, priority: DriverPriority.INTERNAL },
  { id: 'V3', profileId: 'P3', plateNumber: 'MNO-9012', type: VehicleType.VAN, color: '銀', driverName: '張老五', driverPhone: '0933-444-555', status: 'ONLINE', location: { lat: 22.6133, lng: 120.3150 }, lastUpdate: '10 mins ago', walletBalance: 3200, priority: DriverPriority.INTERNAL },
  { id: 'V4', profileId: 'P4', plateNumber: 'RST-0011', type: VehicleType.SUV, color: '藍', driverName: '陳雅婷', driverPhone: '0955-000-111', status: 'ONLINE', location: { lat: 22.6500, lng: 120.2800 }, lastUpdate: '5 mins ago', walletBalance: 80, priority: DriverPriority.PARTNER },
];

export const INITIAL_ORDERS: Order[] = [
  { 
    id: 'ORD-101', 
    displayId: '❤️2026.HIST.001❤️',
    clientName: '張教授', clientPhone: '0910-123-456', pickup: '高雄市苓雅區中正二路22號', 
    status: OrderStatus.COMPLETED, vehicleId: 'V2', driverName: '米修(測試)', 
    createdAt: '2026/05/20 08:30', price: 450, systemFee: 68, baseFare: 150, distanceFare: 200, timeFare: 100, waitingFee: 0,
    priority: DriverPriority.INTERNAL, currentDriverIndex: 0, dispatchCountdown: 0
  },
  { 
    id: 'ORD-102', 
    displayId: '❤️2026.HIST.002❤️',
    clientName: '林小姐', clientPhone: '0920-555-666', pickup: '高雄巨蛋 2 號出口', 
    status: OrderStatus.COMPLETED, vehicleId: 'V1', driverName: '王大明', 
    createdAt: '2026/05/20 09:15', price: 320, systemFee: 48, baseFare: 150, distanceFare: 120, timeFare: 50, waitingFee: 0,
    priority: DriverPriority.INTERNAL, currentDriverIndex: 0, dispatchCountdown: 0
  },
  { 
    id: 'ORD-PEND-001', 
    displayId: '❤️WAIT.KHH.003❤️',
    clientName: '漢神訪客', clientPhone: '0988-111-222', pickup: '漢神本館 成功路', 
    status: OrderStatus.PENDING, price: 280, baseFare: 150, createdAt: new Date().toLocaleString(),
    priority: DriverPriority.INTERNAL, currentDriverIndex: 0, dispatchCountdown: 0, systemFee: 42, distanceFare: 0, timeFare: 0, waitingFee: 0
  },
  { 
    id: 'ORD-PEND-002', 
    displayId: '❤️WAIT.KHH.004❤️',
    clientName: '代叫(洗車場)', clientPhone: '07-1234567', pickup: '好心情洗車場 (鳳山)', 
    status: OrderStatus.PENDING, price: 350, baseFare: 150, createdAt: new Date().toLocaleString(),
    priority: DriverPriority.INTERNAL, currentDriverIndex: 0, dispatchCountdown: 0, systemFee: 52, distanceFare: 0, timeFare: 0, waitingFee: 0
  }
];

export const TAIWAN_AREAS: Record<string, string[]> = {
  "高雄市": ["鳳山區", "苓雅區", "前鎮區", "三民區", "左營區", "鼓山區", "楠梓區", "小港區", "旗津區", "新興區", "前金區", "鹽埕區"]
};

export const APP_PLAN = {
  title: "千尋派車系統開發計劃",
  description: "建構一個高效、穩定且智慧化的自動派車解決方案，串接 LINE 生態系與 AI 分析。",
  modules: ["客戶端叫車 Web App", "LINE 機器人自動派單系統", "即時調度監控中心", "司機終端工作台", "財務錢包與佣金結算", "AI 營運數據智慧洞察"],
  techStack: ["React / TypeScript", "Tailwind CSS", "Gemini 3 Flash API", "Google Maps API", "PostGIS 地理引擎"]
};
