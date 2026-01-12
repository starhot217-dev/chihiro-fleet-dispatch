
import { Order, Vehicle, OrderStatus, WalletLog, LineGroup, PricingPlan } from '../types';
import { INITIAL_ORDERS, MOCK_VEHICLES } from '../constants';

const STORAGE_KEYS = {
  ORDERS: 'chihiro_orders',
  VEHICLES: 'chihiro_vehicles',
  PRICING: 'chihiro_pricing_v2',
  WALLET_LOGS: 'chihiro_wallet_logs',
  GROUPS: 'chihiro_line_groups'
};

const DEFAULT_GROUPS: LineGroup[] = [
  { id: 'GRP_01', name: '高雄核心司機大群', region: '高雄', isActive: true },
  { id: 'GRP_02', name: '鳳山/鳥松支援群', region: '鳳山', isActive: true },
  { id: 'GRP_03', name: '左營/楠梓特約群', region: '左營', isActive: true }
];

const INITIAL_PRICING_PLANS: PricingPlan[] = [
  { id: 'default', name: '預設方案', baseFare: 100, perKm: 25, perMinute: 5, nightSurcharge: 50 },
  { id: 'driver_return', name: '司機百回', baseFare: 100, perKm: 15, perMinute: 0, nightSurcharge: 20 },
  { id: 'store_booking', name: '店家叫車', baseFare: 80, perKm: 20, perMinute: 3, nightSurcharge: 30 }
];

export const DataService = {
  resetData: () => {
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    localStorage.removeItem(STORAGE_KEYS.WALLET_LOGS);
    localStorage.removeItem(STORAGE_KEYS.PRICING);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    window.location.reload();
  },

  getGroups: (): LineGroup[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return saved ? JSON.parse(saved) : DEFAULT_GROUPS;
  },

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

  updateOrderStatus: (orderId: string, status: OrderStatus, details?: Partial<Order>) => {
    const orders = DataService.getOrders();
    const updated = orders.map(o => o.id === orderId ? { ...o, status, ...details } : o);
    DataService.saveOrders(updated);
    return updated;
  },

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
    const newBalance = vehicle.walletBalance - commission;
    
    vehicles[vIndex] = { ...vehicle, status: 'IDLE', walletBalance: newBalance };
    DataService.saveVehicles(vehicles);

    orders[orderIndex] = { ...order, status: OrderStatus.COMPLETED, commission };
    DataService.saveOrders(orders);

    DataService.addWalletLog({
      vehicleId: vehicle.id,
      amount: -commission,
      type: 'COMMISSION_DEDUCTION',
      orderId: order.id
    }, newBalance);

    return { success: true, commission, newBalance };
  },

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
    DataService.addWalletLog({ vehicleId, amount, type: 'TOPUP' }, newBalance);
    return vehicles;
  },

  updateVehicleStatus: (vehicleId: string, status: 'IDLE' | 'BUSY' | 'OFFLINE') => {
    const vehicles = DataService.getVehicles();
    const updated = vehicles.map(v => v.id === vehicleId ? { ...v, status } : v);
    DataService.saveVehicles(updated);
    return updated;
  },

  getPricingPlans: (): PricingPlan[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICING);
    return saved ? JSON.parse(saved) : INITIAL_PRICING_PLANS;
  },

  savePricingPlans: (plans: PricingPlan[]) => {
    localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(plans));
  },

  getPricing: () => {
    const plans = DataService.getPricingPlans();
    return plans.find(p => p.id === 'default') || plans[0];
  }
};
