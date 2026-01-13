
import { Vehicle, VehicleType, Order, OrderStatus, DriverPriority } from './types';

export const MOCK_VEHICLES: Vehicle[] = [
  // Changed 'IDLE' to 'ONLINE' as 'IDLE' is not a valid Vehicle status
  { id: 'V1', plateNumber: 'ABC-1234', type: VehicleType.SEDAN, color: '黑', driverName: '王大明', driverPhone: '0912-345-678', status: 'ONLINE', location: { lat: 22.6273, lng: 120.3014 }, lastUpdate: '2 mins ago', walletBalance: 1500, priority: DriverPriority.INTERNAL },
  { id: 'V2', plateNumber: 'AHX-7515', type: VehicleType.SEDAN, color: '白', driverName: '米修', driverPhone: '0922-111-222', status: 'ONLINE', location: { lat: 22.6393, lng: 120.3021 }, lastUpdate: 'Just now', walletBalance: 450, priority: DriverPriority.INTERNAL },
  { id: 'V3', plateNumber: 'MNO-9012', type: VehicleType.VAN, color: '銀', driverName: '張老五', driverPhone: '0933-444-555', status: 'ONLINE', location: { lat: 22.6133, lng: 120.3150 }, lastUpdate: '10 mins ago', walletBalance: 3200, priority: DriverPriority.INTERNAL },
  { id: 'V4', plateNumber: 'RST-0011', type: VehicleType.SUV, color: '藍', driverName: '陳雅婷', driverPhone: '0955-000-111', status: 'ONLINE', location: { lat: 22.6500, lng: 120.2800 }, lastUpdate: '5 mins ago', walletBalance: 80, priority: DriverPriority.PARTNER },
];

export const INITIAL_ORDERS: Order[] = [
  { 
    id: 'ORD-101', 
    displayId: '❤️20260112.00014❤️',
    clientName: '張教授', 
    clientPhone: '0910-123-456', 
    passengerCount: 1,
    pickup: '高雄市苓雅區中正二路22號', 
    status: OrderStatus.COMPLETED, 
    vehicleId: 'V2',
    driverName: '米修',
    acceptedGroup: '高雄核心司機大群',
    planId: 'default',
    planName: '預設方案',
    createdAt: '2026/01/12 08:30', 
    price: 450, 
    systemFee: 68,
    baseFare: 150,
    distanceFare: 200,
    timeFare: 100,
    waitingFee: 0,
    priority: DriverPriority.INTERNAL,
    currentDriverIndex: 0,
    dispatchCountdown: 0
  },
  { 
    id: 'ORD-TEST-001', 
    displayId: '❤️20260112.99001❤️',
    clientName: '漢神巨蛋訪客', 
    clientPhone: '0988-111-222', 
    passengerCount: 2,
    pickup: '漢神巨蛋購物廣場 (1F 門口)', 
    status: OrderStatus.DISPATCHING, 
    planId: 'default',
    planName: '預設方案',
    createdAt: new Date().toLocaleString('zh-TW'), 
    price: 350,
    systemFee: 52,
    baseFare: 150,
    distanceFare: 150,
    timeFare: 50,
    waitingFee: 0,
    priority: DriverPriority.INTERNAL,
    currentDriverIndex: 0,
    dispatchCountdown: 15
  }
];

export const TAIWAN_AREAS: Record<string, string[]> = {
  "高雄市": ["鳳山區", "苓雅區", "前鎮區", "三民區", "左營區", "鼓山區", "楠梓區", "小港區", "旗津區", "新興區", "前金區", "鹽埕區"],
  "台北市": ["中正區", "大安區", "信義區", "中山區", "內湖區", "士林區"],
  "台中市": ["西屯區", "北屯區", "南屯區", "太平區", "大里區", "豐原區"]
};

export const APP_PLAN = {
  title: "千尋派車系統開發計劃",
  description: "建構一個高效、穩定且智慧化的自動派車解決方案，串接 LINE 生態系與 AI 分析。",
  modules: [
    "客戶端叫車 Web App",
    "LINE 機器人自動派單系統",
    "即時調度監控中心",
    "司機終端工作台",
    "財務錢包與佣金結算",
    "AI 營運數據智慧洞察"
  ],
  techStack: [
    "React / TypeScript",
    "Tailwind CSS",
    "Gemini 3 Flash API",
    "Google Maps API",
    "Lucide / FontAwesome Icons",
    "Recharts Data Visualization"
  ]
};
