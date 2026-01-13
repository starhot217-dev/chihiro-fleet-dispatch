
export enum UserRole {
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER'
}

export enum OrderStatus {
  PENDING = 'PENDING',    
  DISPATCHING = 'DISPATCHING', 
  ASSIGNED = 'ASSIGNED',   
  ARRIVED = 'ARRIVED', // 司機已抵達，啟動等待計費
  // Add PICKING_UP for simulator compatibility
  PICKING_UP = 'PICKING_UP',
  IN_TRANSIT = 'IN_TRANSIT', 
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DriverPriority {
  INTERNAL = 'INTERNAL', // 系統主司機
  PARTNER = 'PARTNER',   // 合作外群司機
  LINE_BROADCAST = 'LINE_BROADCAST' // 無系統 LINE 群
}

// Add missing VehicleType enum
export enum VehicleType {
  SEDAN = 'SEDAN',
  VAN = 'VAN',
  SUV = 'SUV'
}

export interface Order {
  id: string;
  displayId: string;
  clientName: string;
  clientPhone: string;
  passengerCount: number;
  pickup: string;
  pickupCoords?: { lat: number; lng: number };
  destination?: string;
  destCoords?: { lat: number; lng: number };
  status: OrderStatus;
  
  // 派遣邏輯相關
  currentDriverIndex: number;
  targetDriverId?: string;
  dispatchCountdown: number;
  priority: DriverPriority;
  
  // 費用明細
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  waitingFee: number;
  // Changed from totalPrice to price to maintain consistency with usage in components
  price: number; 
  systemFee: number;
  
  // 服務資訊
  vehicleId?: string;
  driverName?: string;
  driverPhone?: string;
  plateNumber?: string;
  
  waitingStartTime?: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;

  // Additional fields for dispatch and plans
  acceptedGroup?: string;
  planId?: string;
  planName?: string;
  note?: string;
  storeId?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  priority: DriverPriority;
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
  location: { lat: number; lng: number };
  walletBalance: number;
  distanceToPickup?: number; // 動態計算用
  // Add missing properties used in constants
  type: VehicleType;
  color: string;
  lastUpdate: string;
}

// Add missing Store interface
export interface Store {
  id: string;
  name: string;
  contact: string;
  kickbackBase: number;
  unpaidKickback: number;
  totalTrips: number;
}

// Add missing PricingPlan interface
export interface PricingPlan {
  id: string;
  name: string;
  baseFare: number;
  perKm: number;
  perMinute: number;
  waitingFeePerMin: number;
  maxMissesBeforeSuspension: number;
  suspensionHours: number;
}

// Add missing LineLog and LineGroup interfaces
export interface LineLog {
  id: string;
  senderName: string;
  timestamp: string;
  message: string;
  type: 'INCOMING' | 'OUTGOING';
  isFlexMessage?: boolean;
  groupName: string;
}

export interface LineGroup {
  id: string;
  name: string;
}

// Add missing WalletLog interface
export interface WalletLog {
  id: string;
  amount: number;
  type: 'TOPUP' | 'COMMISSION';
  timestamp: string;
  balanceAfter: number;
}
