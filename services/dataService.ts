import { Order, Vehicle, OrderStatus, LineLog } from '../types';
import { INITIAL_ORDERS, MOCK_VEHICLES } from '../constants';

const STORAGE_KEYS = {
  ORDERS: 'chihiro_orders',
  VEHICLES: 'chihiro_vehicles',
  PRICING: 'chihiro_pricing',
  WALLET_LOGS: 'chihiro_wallet_logs'
};

export const DataService = {
  // --- 訂單相關 ---
  getOrders: (): Order[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  },
  
  saveOrders: (orders: Order[]) => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  createOrder: (order: Order) => {
    const orders = DataService.getOrders();
    const updated = [order, ...orders];
    DataService.saveOrders(updated);
    return order;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus, vehicleId?: string) => {
    const orders = DataService.getOrders();
    const updated = orders.map(o => o.id === orderId ? { ...o, status, ...(vehicleId ? { vehicleId } : {}) } : o);
    DataService.saveOrders(updated);
    return updated;
  },

  // --- 財務流水紀錄 ---
  getWalletLogs: (vehicleId?: string) => {
    const saved = localStorage.getItem(STORAGE_KEYS.WALLET_LOGS);
    const logs = saved ? JSON.parse(saved) : [];
    return vehicleId ? logs.filter((l: any) => l.vehicleId === vehicleId) : logs;
  },

  addWalletLog: (log: { vehicleId: string; amount: number; type: string; orderId?: string }) => {
    const logs = DataService.getWalletLogs();
    const newLog = {
      ...log,
      id: Date.now(),
      timestamp: new Date().toLocaleString('zh-TW')
    };
    localStorage.setItem(STORAGE_KEYS.WALLET_LOGS, JSON.stringify([newLog, ...logs]));
  },

  // --- 車輛/司機相關 ---
  getVehicles: (): Vehicle[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : MOCK_VEHICLES;
  },

  saveVehicles: (vehicles: Vehicle[]) => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  },

  // 核心邏輯：結案並扣除抽成
  completeOrderAndDeduct: (orderId: string, commissionRate: number = 0.15) => {
    const orders = DataService.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.vehicleId) return { success: false, message: '找不到訂單或司機' };

    const commission = Math.round(order.price * commissionRate);
    const vehicles = DataService.getVehicles();
    const vehicle = vehicles.find(v => v.id === order.vehicleId);

    if (!vehicle) return { success: false, message: '找不到對應司機' };
    if (vehicle.walletBalance < commission) return { success: false, message: '司機錢包餘額不足，無法支付抽成' };

    // 1. 更新訂單狀態
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: OrderStatus.COMPLETED, commission } : o);
    DataService.saveOrders(updatedOrders);

    // 2. 扣除司機錢包餘額並恢復待命狀態
    // Fix: explicitly type updatedVehicles and use const assertion for 'IDLE' to ensure status type compatibility
    const updatedVehicles: Vehicle[] = vehicles.map(v => v.id === order.vehicleId 
      ? { ...v, status: 'IDLE' as const, walletBalance: v.walletBalance - commission } 
      : v
    );
    DataService.saveVehicles(updatedVehicles);

    // 3. 紀錄流水帳
    DataService.addWalletLog({
      vehicleId: order.vehicleId,
      amount: -commission,
      type: 'COMMISSION_DEDUCTION',
      orderId: order.id
    });

    return { success: true, commission, newBalance: vehicle.walletBalance - commission };
  },

  updateVehicleWallet: (vehicleId: string, amount: number) => {
    const vehicles = DataService.getVehicles();
    const updated = vehicles.map(v => v.id === vehicleId ? { ...v, walletBalance: v.walletBalance + amount } : v);
    DataService.saveVehicles(updated);
    
    DataService.addWalletLog({
      vehicleId,
      amount,
      type: 'TOPUP'
    });
    
    return updated;
  },

  updateVehicleStatus: (vehicleId: string, status: 'IDLE' | 'BUSY' | 'OFFLINE') => {
    const vehicles = DataService.getVehicles();
    const updated = vehicles.map(v => v.id === vehicleId ? { ...v, status } : v);
    DataService.saveVehicles(updated);
    return updated;
  },

  // --- 設定相關 ---
  getPricing: () => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICING);
    return saved ? JSON.parse(saved) : {
      baseFare: 100,
      perKm: 25,
      perMinute: 5,
      nightSurcharge: 50
    };
  },

  savePricing: (config: any) => {
    localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(config));
  }
};
