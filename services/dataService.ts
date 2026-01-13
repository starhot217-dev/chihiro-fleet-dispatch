
import { Order, OrderStatus, Vehicle, SystemConfig, WalletLog, LineLog, FAQItem, Store } from '../types';
import { INITIAL_ORDERS, MOCK_VEHICLES } from '../constants';

const STORAGE_KEYS = {
  ORDERS: 'chihiro_fleet_orders_v12',
  VEHICLES: 'chihiro_fleet_vehicles_v12',
  CONFIG: 'chihiro_fleet_config_v12',
  LINE_LOGS: 'chihiro_fleet_line_logs_v12',
  WALLET_LOGS: 'chihiro_fleet_wallet_logs_v12',
  FAQ_STATS: 'chihiro_fleet_faq_stats_v12',
  STORES: 'chihiro_fleet_stores_v12'
};

const DEFAULT_FAQS: FAQItem[] = [
  { id: '1', question: '司機如何儲值？', answer: '請聯繫管理員，或前往司機工作台點擊錢包圖示產出匯款虛擬帳號。', clickCount: 15, category: 'FINANCE' },
  { id: '2', question: '忘記 LINE 群組 ID 怎麼辦？', answer: '請在 LINE 群組輸入 /id 機器人會自動回覆，或在後台系統配置查看。', clickCount: 8, category: 'SYSTEM' },
  { id: '3', question: '派單倒數結束沒人接怎麼辦？', answer: '系統會自動跳轉至下一位權重最高的司機，或您可以點擊手動廣播。', clickCount: 22, category: 'DRIVER' },
  { id: '4', question: '抽成費用如何計算？', answer: '目前系統預設抽成率為 15%，計算公式：車資 x 0.15。', clickCount: 40, category: 'FINANCE' }
];

const DEFAULT_STORES: Store[] = [
  { id: 'S1', name: '好心情洗車場', contact: '07-1234567', kickbackBase: 10, unpaidKickback: 150, totalTrips: 45 },
  { id: 'S2', name: '漢神本館', contact: '07-8889999', kickbackBase: 15, unpaidKickback: 0, totalTrips: 120 }
];

export const DataService = {
  getConfig: (): SystemConfig => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const defaultConfig: SystemConfig = {
      id: 'primary',
      appName: '千尋派車系統',
      lineAccessToken: '',
      lineSecret: '',
      linePrimaryGroupId: 'G_CORE_KHH_001',
      linePartnerGroupId: 'G_PARTNER_KHH_002',
      googleMapsApiKey: '',
      dispatchIntervalSec: 15,
      freeWaitingMin: 5,
      commissionRate: 0.15,
      dbStatus: 'DISCONNECTED',
      dbHost: '',
      dbKey: ''
    };
    if (!saved) return defaultConfig;
    try {
      return { ...defaultConfig, ...JSON.parse(saved) };
    } catch (e) {
      return defaultConfig;
    }
  },

  saveConfig: async (config: SystemConfig) => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    window.dispatchEvent(new Event('systemConfigUpdated'));
  },

  getOrders: async (): Promise<Order[]> => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  },
  
  saveOrders: async (orders: Order[]) => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  updateOrder: async (id: string, updates: Partial<Order>) => {
    const orders = await DataService.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...updates };
      await DataService.saveOrders(orders);
    }
  },

  // Added createOrder to handle new order creation
  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    const orders = await DataService.getOrders();
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      displayId: `❤️${new Date().getFullYear()}.NEW.${Math.floor(Math.random() * 1000)}❤️`,
      status: OrderStatus.PENDING,
      createdAt: new Date().toLocaleString(),
      price: 0,
      systemFee: 0,
      waitingFee: 0,
      distanceFare: 0,
      timeFare: 0,
      baseFare: 150,
      clientName: '新客戶',
      clientPhone: '09xx',
      pickup: '未知地點',
      ...orderData
    };
    const updated = [newOrder, ...orders];
    await DataService.saveOrders(updated);
    return newOrder;
  },

  getVehicles: async (): Promise<Vehicle[]> => {
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return saved ? JSON.parse(saved) : MOCK_VEHICLES;
  },

  saveVehicles: async (vs: Vehicle[]) => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vs));
  },

  updateVehicleWallet: async (vId: string, amount: number) => {
    const vs = await DataService.getVehicles();
    const idx = vs.findIndex(v => v.id === vId);
    if (idx !== -1) {
      vs[idx].walletBalance += amount;
      await DataService.saveVehicles(vs);
      const logs = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.WALLET_LOGS}_${vId}`) || '[]');
      logs.unshift({
        id: `LOG-${Date.now()}`,
        amount,
        type: amount > 0 ? 'TOPUP' : 'COMMISSION',
        timestamp: new Date().toLocaleString(),
        balanceAfter: vs[idx].walletBalance
      });
      localStorage.setItem(`${STORAGE_KEYS.WALLET_LOGS}_${vId}`, JSON.stringify(logs));
    }
  },

  // Added getWalletLogs to fix type error in Wallet component
  getWalletLogs: async (vehicleId: string): Promise<WalletLog[]> => {
    return JSON.parse(localStorage.getItem(`${STORAGE_KEYS.WALLET_LOGS}_${vehicleId}`) || '[]');
  },

  getFaqs: (): FAQItem[] => {
    const saved = localStorage.getItem(STORAGE_KEYS.FAQ_STATS);
    const data: FAQItem[] = saved ? JSON.parse(saved) : DEFAULT_FAQS;
    return data.sort((a, b) => b.clickCount - a.clickCount);
  },

  recordFaqClick: (id: string) => {
    const faqs = DataService.getFaqs();
    const idx = faqs.findIndex(f => f.id === id);
    if (idx !== -1) {
      faqs[idx].clickCount += 1;
      localStorage.setItem(STORAGE_KEYS.FAQ_STATS, JSON.stringify(faqs));
    }
  },

  // Added getStores and saveStores to handle partner store data
  getStores: async (): Promise<Store[]> => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORES);
    return saved ? JSON.parse(saved) : DEFAULT_STORES;
  },

  saveStores: (stores: Store[]) => {
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
  },

  // Added updateKickbackPaid to settle payments for stores
  updateKickbackPaid: async (storeId: string) => {
    const stores = await DataService.getStores();
    const idx = stores.findIndex(s => s.id === storeId);
    if (idx !== -1) {
      stores[idx].unpaidKickback = 0;
      DataService.saveStores(stores);
    }
  },

  // Added getPricingPlans to provide billing calculation rates
  getPricingPlans: () => {
    return [{ id: 'standard', name: '標準計費', baseFare: 150, perKm: 25, perMinute: 5 }];
  },

  broadcastToLine: (order: Order, type: string) => {
    const logs = DataService.getLineLogs();
    const newLog: LineLog = {
      id: `L-${Date.now()}`,
      senderName: '系統廣播 (模擬)',
      timestamp: new Date().toLocaleTimeString(),
      message: `✨ 新訂單廣播\n上車點：${order.pickup}\n預估車資：$${order.price}\n(備註：此為生產環境模擬傳送)`,
      type: 'OUTGOING',
      isFlexMessage: true,
      groupName: '高雄核心群'
    };
    DataService.saveLineLogs([newLog, ...logs]);
  },

  getLineLogs: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.LINE_LOGS) || '[]'),
  saveLineLogs: (logs: LineLog[]) => localStorage.setItem(STORAGE_KEYS.LINE_LOGS, JSON.stringify(logs)),

  calculateFinalFare: (order: Order) => {
    const config = DataService.getConfig();
    const distFare = 5.2 * 30; // 模擬里程 5.2km
    const timeFare = 15 * 5;  // 模擬時間 15min
    const total = order.baseFare + distFare + timeFare + (order.waitingFee || 0);
    return {
      distanceFare: Math.round(distFare),
      timeFare: Math.round(timeFare),
      price: Math.round(total),
      systemFee: Math.floor(total * config.commissionRate)
    };
  }
};
