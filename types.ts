
export enum UserRole {
  SYSTEM_VENDOR = 'SYSTEM_VENDOR', // 系統平台開發商
  ADMIN = 'ADMIN',               // 車隊管理員
  DRIVER = 'DRIVER',             // 司機
  CLIENT = 'CLIENT',             // 一般客戶
  STORE = 'STORE',              // 特約店家
  CS = 'CS'                      // 客服人員
}

export enum OrderStatus {
  PENDING = 'PENDING',    
  DISPATCHING = 'DISPATCHING', 
  ASSIGNED = 'ASSIGNED',   
  PICKING_UP = 'PICKING_UP', 
  ARRIVED = 'ARRIVED', 
  IN_TRANSIT = 'IN_TRANSIT', 
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DriverPriority {
  INTERNAL = 'INTERNAL',
  PARTNER = 'PARTNER',
  LINE_BROADCAST = 'LINE_BROADCAST'
}

export enum VehicleType {
  SEDAN = 'SEDAN',
  VAN = 'VAN',
  SUV = 'SUV'
}

export interface SystemConfig {
  id: string;
  appName: string;
  lineAccessToken: string;
  lineSecret: string;
  linePrimaryGroupId: string;
  linePartnerGroupId: string;
  googleMapsApiKey: string;
  dispatchIntervalSec: number;
  freeWaitingMin: number;
  commissionRate: number;
  dbStatus: 'CONNECTED' | 'DISCONNECTED' | 'INITIALIZING';
  dbHost?: string;
  dbKey?: string;
  lastMigration?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  clickCount: number;
  category: 'FINANCE' | 'SYSTEM' | 'DRIVER' | 'CLIENT';
}

export interface Profile {
  id: string; 
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  isVerified: boolean;
}

export interface Vehicle {
  id: string;
  profileId: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  priority: DriverPriority;
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
  location: { lat: number; lng: number };
  walletBalance: number;
  type: VehicleType;
  color: string;
  lastUpdate: string;
}

export interface Order {
  id: string;
  displayId: string;
  clientId?: string;
  vehicleId?: string;
  clientName: string;
  clientPhone: string;
  pickup: string;
  pickupCoords?: { lat: number; lng: number };
  destination?: string;
  status: OrderStatus;
  price: number;
  systemFee: number;
  waitingFee: number;
  distanceFare: number;
  timeFare: number;
  baseFare: number;
  createdAt: string;
  startTime?: string;
  endTime?: string;
  driverName?: string;
  driverPhone?: string;
  plateNumber?: string;
  dispatchCountdown?: number;
  targetDriverId?: string;
  waitingStartTime?: string;
  // Added missing fields to fix type errors
  priority?: DriverPriority;
  currentDriverIndex?: number;
  note?: string;
  storeId?: string;
  planId?: string;
  planName?: string;
}

export interface WalletLog {
  id: string;
  vehicleId: string;
  amount: number;
  type: 'TOPUP' | 'COMMISSION' | 'KICKBACK' | 'REFUND';
  timestamp: string;
  balanceAfter: number;
}

export interface LineLog {
  id: string;
  senderName: string;
  timestamp: string;
  message: string;
  type: 'INCOMING' | 'OUTGOING';
  isFlexMessage?: boolean;
  groupName: string;
}

// Added Store and LineGroup interfaces
export interface Store {
  id: string;
  name: string;
  contact: string;
  kickbackBase: number;
  unpaidKickback: number;
  totalTrips: number;
}

export interface LineGroup {
  id: string;
  name: string;
}
