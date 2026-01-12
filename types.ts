
// Add global type definitions for external APIs (Google Maps, etc.)
declare global {
  interface Window {
    google: any;
  }
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER'
}

export enum OrderStatus {
  PENDING = 'PENDING',    
  DISPATCHING = 'DISPATCHING', 
  ASSIGNED = 'ASSIGNED',   
  PICKING_UP = 'PICKING_UP', 
  IN_TRANSIT = 'IN_TRANSIT', 
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum VehicleType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  VAN = 'VAN',
  TRUCK = 'TRUCK'
}

export interface PricingPlan {
  id: string;
  name: string;
  baseFare: number;
  perKm: number;
  perMinute: number;
  nightSurcharge: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  color: string;
  driverName: string;
  driverPhone: string;
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
  location: { lat: number; lng: number };
  lastUpdate: string;
  walletBalance: number;
}

export interface Order {
  id: string;
  displayId: string;
  clientName: string;
  clientPhone: string;
  pickup: string;
  destination?: string;
  status: OrderStatus;
  vehicleId?: string;
  driverName?: string;
  acceptedGroup?: string;
  planId: string;
  planName: string;
  createdAt: string;
  startTime?: string;
  endTime?: string;
  price: number;
  commission?: number;
  note?: string;
}

export interface LineLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'OUTGOING' | 'INCOMING';
  groupName: string;
  senderName?: string;
  isFlexMessage?: boolean;
}

export interface LineGroup {
  id: string;
  name: string;
  region: string;
  isActive: boolean;
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
