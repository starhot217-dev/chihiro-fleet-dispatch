
import { Order, OrderStatus, Vehicle, DriverPriority, Store, PricingPlan, WalletLog } from '../types';
import { INITIAL_ORDERS, MOCK_VEHICLES } from '../constants';

const STORAGE_KEYS = {
  ORDERS: 'chihiro_fleet_orders_v8',
  VEHICLES: 'chihiro_fleet_vehicles_v8',
  STORES: 'chihiro_fleet_stores_v8',
  PLANS: 'chihiro_fleet_plans_v8',
  WALLET_LOGS: 'chihiro_fleet_wallet_logs_v8'
};

export const DataService = {
  getOrders: (): Order[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  },

  getVehicles: (): Vehicle[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : MOCK_VEHICLES.map(v => ({ 
      ...v, 
      priority: v.id === 'V4' ? DriverPriority.PARTNER : DriverPriority.INTERNAL, 
      status: 'ONLINE' 
    }));
  },

  saveOrders: (orders: Order[]) => localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)),
  saveVehicles: (vs: Vehicle[]) => localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vs)),

  getStores: (): Store[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORES);
    return saved ? JSON.parse(saved) : [
      { id: 'ST-001', name: '漢神巨蛋百貨', contact: '07-111222', kickbackBase: 15, unpaidKickback: 450, totalTrips: 30 },
      { id: 'ST-002', name: '義大世界大飯店', contact: '07-333444', kickbackBase: 20, unpaidKickback: 1200, totalTrips: 60 },
    ];
  },

  saveStores: (stores: Store[]) => localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores)),

  updateKickbackPaid: (id: string) => {
    const stores = DataService.getStores();
    const idx = stores.findIndex(s => s.id === id);
    if (idx !== -1) {
      stores[idx].unpaidKickback = 0;
      DataService.saveStores(stores);
    }
  },

  getPricingPlans: (): PricingPlan[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
    return saved ? JSON.parse(saved) : [
      { 
        id: 'default', 
        name: '預設方案', 
        baseFare: 150, 
        perKm: 30, 
        perMinute: 5, 
        waitingFeePerMin: 10,
        maxMissesBeforeSuspension: 3,
        suspensionHours: 2
      }
    ];
  },

  savePricingPlans: (plans: PricingPlan[]) => localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans)),

  getWalletLogs: (vehicleId: string): WalletLog[] => {
    const saved = localStorage.getItem(`${STORAGE_KEYS.WALLET_LOGS}_${vehicleId}`);
    return saved ? JSON.parse(saved) : [];
  },

  saveWalletLogs: (vehicleId: string, logs: WalletLog[]) => {
    localStorage.setItem(`${STORAGE_KEYS.WALLET_LOGS}_${vehicleId}`, JSON.stringify(logs));
  },

  getEligibleDrivers: (pickupCoords: {lat: number, lng: number}) => {
    const vehicles = DataService.getVehicles();
    return vehicles
      .filter(v => v.status === 'ONLINE')
      .map(v => {
        const dist = Math.sqrt(
          Math.pow(v.location.lat - pickupCoords.lat, 2) + 
          Math.pow(v.location.lng - pickupCoords.lng, 2)
        ) * 111; 
        return { ...v, distanceToPickup: dist };
      })
      .filter(v => (v.distanceToPickup || 0) < 10) // 擴大範圍至 10km
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority === DriverPriority.INTERNAL ? -1 : 1;
        }
        return (a.distanceToPickup || 0) - (b.distanceToPickup || 0);
      });
  },

  createOrder: (data: Partial<Order>) => {
    const orders = DataService.getOrders();
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      displayId: `❤️${new Date().toISOString().slice(0,10).replace(/-/g,'')}.${Math.floor(Math.random()*999)}❤️`,
      status: OrderStatus.PENDING,
      currentDriverIndex: 0,
      dispatchCountdown: 15,
      priority: DriverPriority.INTERNAL,
      baseFare: 150,
      distanceFare: 0,
      timeFare: 0,
      waitingFee: 0,
      price: 150,
      systemFee: 0,
      createdAt: new Date().toISOString(),
      passengerCount: 1,
      clientName: '匿名客戶',
      clientPhone: '09xx',
      pickup: '未知地點',
      ...data
    } as Order;
    const updated = [newOrder, ...orders];
    DataService.saveOrders(updated);
    return newOrder;
  },

  updateOrder: (id: string, updates: Partial<Order>) => {
    const orders = DataService.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...updates };
      DataService.saveOrders(orders);
    }
  },

  updateVehicleWallet: (vId: string, amount: number) => {
    const vs = DataService.getVehicles();
    const idx = vs.findIndex(v => v.id === vId);
    if (idx !== -1) {
      vs[idx].walletBalance += amount;
      DataService.saveVehicles(vs);
      
      const logs = DataService.getWalletLogs(vId);
      logs.unshift({
        id: `LOG-${Date.now()}`,
        amount,
        type: amount > 0 ? 'TOPUP' : 'COMMISSION',
        timestamp: new Date().toLocaleString(),
        balanceAfter: vs[idx].walletBalance
      });
      DataService.saveWalletLogs(vId, logs);
    }
  },

  calculateFinalFare: (order: Order) => {
    const distanceKm = 4.8; // 模擬
    const durationMin = 12;
    const distFare = distanceKm * 30;
    const timeFare = durationMin * 5;
    const total = order.baseFare + distFare + timeFare + (order.waitingFee || 0);
    const sysFee = Math.floor(total * 0.15);
    
    return {
      distanceFare: Math.round(distFare),
      timeFare: Math.round(timeFare),
      price: Math.round(total),
      systemFee: sysFee
    };
  }
};
