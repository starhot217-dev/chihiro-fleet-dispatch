
import { Vehicle, VehicleType, Order, OrderStatus } from './types';

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'V1', plateNumber: 'ABC-1234', type: VehicleType.SEDAN, driverName: '王大明', driverPhone: '0912-345-678', status: 'IDLE', location: { lat: 25.0330, lng: 121.5654 }, lastUpdate: '2 mins ago', walletBalance: 1500 },
  { id: 'V2', plateNumber: 'XYZ-5678', type: VehicleType.VAN, driverName: '李小美', driverPhone: '0922-111-222', status: 'BUSY', location: { lat: 25.0421, lng: 121.5198 }, lastUpdate: 'Just now', walletBalance: 450 },
  { id: 'V3', plateNumber: 'MNO-9012', type: VehicleType.TRUCK, driverName: '張老五', driverPhone: '0933-444-555', status: 'IDLE', location: { lat: 25.0512, lng: 121.5432 }, lastUpdate: '10 mins ago', walletBalance: 3200 },
];

export const INITIAL_ORDERS: Order[] = [
  { id: 'ORD-101', clientName: '陳先生', clientPhone: '0900-111-000', pickup: '高雄市鳳山區中山西路374號', destination: '高雄市苓雅區五福一路67號', status: OrderStatus.PENDING, createdAt: '2023-10-27 10:00', price: 100, commission: 10, note: '攜帶大件行李' },
  { id: 'ORD-102', clientName: '林小姐', clientPhone: '0988-777-666', pickup: '高雄市三民區九如一路720號', destination: '高雄市左營區博愛二路777號', status: OrderStatus.COMPLETED, vehicleId: 'V2', createdAt: '2023-10-27 10:30', price: 450, commission: 45 },
];

export const APP_PLAN = {
  title: "千尋派車系統",
  description: "整合 LINE 自動化派單、即時監控與 AI 調度優化。",
  modules: [
    "自動化派單中心 (LINE Group Connector)",
    "管理後台 (Dispatcher Dashboard)",
    "司機儲值錢包系統 (Driver Wallet)",
    "AI 調度建議與報表 (Gemini Analytics)"
  ],
  techStack: ["React", "Tailwind CSS", "Gemini API", "Recharts", "LINE Messaging API"]
};

export const TAIWAN_AREAS: Record<string, string[]> = {
  "高雄市": ["鳳山區", "苓雅區", "前鎮區", "三民區", "左營區", "鼓山區", "楠梓區", "小港區", "旗津區", "新興區", "前金區", "鹽埕區", "大寮區", "林園區", "鳥松區", "仁武區", "大樹區", "大社區", "岡山區", "路竹區", "阿蓮區", "田寮區", "燕巢區", "橋頭區", "梓官區", "彌陀區", "永安區", "湖內區", "旗山區", "美濃區", "六龜區", "甲仙區", "杉林區", "內門區", "茂林區", "桃源區", "那瑪夏區"],
  "台北市": ["中正區", "大同區", "中山區", "松山區", "大安區", "萬華區", "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區"],
  "台中市": ["中區", "東區", "南區", "西區", "北區", "北屯區", "西屯區", "南屯區", "太平區", "大里區", "霧峰區", "烏日區", "豐原區", "后里區", "石岡區", "東勢區", "和平區", "新社區", "潭子區", "大雅區", "神岡區", "大肚區", "龍井區", "沙鹿區", "梧棲區", "清水區", "大甲區", "外埔區", "大安區"]
};
