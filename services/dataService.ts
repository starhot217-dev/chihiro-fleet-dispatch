import { Order, Vehicle, OrderStatus, WalletLog } from '../types';
import { INITIAL_ORDERS, MOCK_VEHICLES } from '../constants';

const STORAGE_KEYS = {
  ORDERS: 'chihiro_orders',
  VEHICLES: 'chihiro_vehicles',
  PRICING: 'chihiro_pricing',
  WALLET_LOGS: 'chihiro_wallet_logs'
};

export const DataService = {
  // --- 訂單資料庫 ---
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

  // --- 財務流水資料庫 ---
  getWalletLogs: (vehicleId?: string): WalletLog[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.WALLET_LOGS);
    const logs = saved ? JSON.parse(saved) : [];
    return vehicleId ? logs.filter((l: WalletLog) => l.vehicleId === vehicleId) : logs;
  },

  addWalletLog: (logData: Omit<WalletLog, 'id' | 'timestamp' | 'balanceAfter'>, balanceAfter: number) => {
    const logs = DataService.getWalletLogs();
    const newLog: WalletLog = {
      ...logData,
      id: Date.now(),
      timestamp: new Date().toLocaleString('zh-TW'),
      balanceAfter
    };
    localStorage.setItem(STORAGE_KEYS.WALLET_LOGS, JSON.stringify([newLog, ...logs]));
  },

  // --- 核心業務邏輯：結案扣款 ---
  completeOrderAndDeduct: (orderId: string, commissionRate: number = 0.15) => {
    const orders = DataService.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: '找不到此訂單' };
    
    const order = orders[orderIndex];
    if (!order.vehicleId) return { success: false, message: '此單尚未指派司機' };

    const commission = Math.round(order.price * commissionRate);
    const vehicles = DataService.getVehicles();
    const vIndex = vehicles.findIndex(v => v.id === order.vehicleId);
    
    if (vIndex === -1) return { success: false, message: '找不到執行司機' };
    
    const vehicle = vehicles[vIndex];
    if (vehicle.walletBalance < commission) {
      return { success: false, message: `司機 ${vehicle.driverName} 儲值金不足 ($${vehicle.walletBalance})，無法支付服務費 $${commission}` };
    }

    // 1. 執行扣款
    const newBalance = vehicle.walletBalance - commission;
    vehicles[vIndex] = { ...vehicle, status: 'IDLE', walletBalance: newBalance };
    DataService.saveVehicles(vehicles);

    // 2. 更新訂單
    orders[orderIndex] = { ...order, status: OrderStatus.COMPLETED, commission };
    DataService.saveOrders(orders);

    // 3. 紀錄流水
    DataService.addWalletLog({
      vehicleId: vehicle.id,
      amount: -commission,
      type: 'COMMISSION_DEDUCTION',
      orderId: order.id
    }, newBalance);

    return { success: true, commission, newBalance };
  },

  // --- 車輛與錢包管理 ---
  getVehicles: (): Vehicle[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : MOCK_VEHICLES;
  },

  saveVehicles: (vehicles: Vehicle[]) => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  },

  updateVehicleWallet: (vehicleId: string, amount: number) => {
    const vehicles = DataService.getVehicles();
    const idx = vehicles.findIndex(v => v.id === vehicleId);
    if (idx === -1) return vehicles;
    
    const newBalance = vehicles[idx].walletBalance + amount;
    vehicles[idx].walletBalance = newBalance;
    DataService.saveVehicles(vehicles);
    
    DataService.addWalletLog({
      vehicleId,
      amount,
      type: 'TOPUP'
    }, newBalance);
    
    return vehicles;
  },

  updateVehicleStatus: (vehicleId: string, status: 'IDLE' | 'BUSY' | 'OFFLINE') => {
    const vehicles = DataService.getVehicles();
    const updated = vehicles.map(v => v.id === vehicleId ? { ...v, status } : v);
    DataService.saveVehicles(updated);
    return updated;
  },

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