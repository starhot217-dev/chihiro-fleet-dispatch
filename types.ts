
export enum OrderStatus {
  PENDING = 'PENDING',    // 等待派單
  DISPATCHING = 'DISPATCHING', // 正在 LINE 群組派發
  ASSIGNED = 'ASSIGNED',   // 司機已接單
  PICKING_UP = 'PICKING_UP', // 前往接送中
  IN_TRANSIT = 'IN_TRANSIT', // 行程中
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum VehicleType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  VAN = 'VAN',
  TRUCK = 'TRUCK'
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  driverName: string;
  driverPhone: string;
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
  location: { lat: number; lng: number };
  lastUpdate: string;
  walletBalance: number; // 司機儲值金餘額
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  pickup: string;
  destination: string;
  status: OrderStatus;
  vehicleId?: string;
  createdAt: string;
  price: number;
  commission?: number; // 平台抽成金額
  note?: string;
}

export interface LineLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'OUTGOING' | 'INCOMING';
  groupName: string;
}

export interface WalletLog {
  id: number;
  vehicleId: string;
  amount: number;
  type: 'TOPUP' | 'COMMISSION_DEDUCTION';
  orderId?: string;
  timestamp: string;
  balanceAfter: number;
}
