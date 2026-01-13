
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import DispatchCenter from './components/DispatchCenter';
import LoginGate from './components/LoginGate';
import DriverPortal from './components/DriverPortal';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Wallet from './components/Wallet';
import StoreManagement from './components/StoreManagement';
import DatabaseSchema from './components/DatabaseSchema';
import Blueprint from './components/Blueprint';
import LineAutomation from './components/LineAutomation';
import DriverSimulator from './components/DriverSimulator';
import ClientBooking from './components/ClientBooking';
import CustomerService from './components/CustomerService';
import { DataService } from './services/dataService';
import { Order, OrderStatus, UserRole, LineLog, Vehicle } from './types';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [lineLogs, setLineLogs] = useState<LineLog[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const [o, v] = await Promise.all([
        DataService.getOrders(),
        DataService.getVehicles()
      ]);
      setOrders(o);
      setVehicles(v);
      setLineLogs(DataService.getLineLogs());
      
      // 根據角色設定初始頁面
      if (userRole === UserRole.SYSTEM_VENDOR) setActiveTab('settings');
      else if (userRole === UserRole.CS) setActiveTab('cs-portal');
      else setActiveTab('dashboard');
      
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (userRole) loadInitialData();
  }, [userRole]);

  // 背景派遣計時器
  useEffect(() => {
    const timer = setInterval(async () => {
      const config = DataService.getConfig();
      const currentOrders = await DataService.getOrders();
      let hasChanged = false;

      const nextOrders = currentOrders.map(order => {
        if (order.status === OrderStatus.DISPATCHING) {
          hasChanged = true;
          if (order.dispatchCountdown && order.dispatchCountdown > 0) {
            return { ...order, dispatchCountdown: order.dispatchCountdown - 1 };
          } else {
            return { ...order, status: OrderStatus.PENDING, dispatchCountdown: 0 };
          }
        }
        return order;
      });

      if (hasChanged) {
        setOrders(nextOrders);
        await DataService.saveOrders(nextOrders);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartDispatch = async (orderId: string) => {
    const config = DataService.getConfig();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // 取得在線司機
    const vs = await DataService.getVehicles();
    const drivers = vs.filter(v => v.status === 'ONLINE');
    
    if (drivers.length > 0) {
      await DataService.updateOrder(orderId, {
        status: OrderStatus.DISPATCHING,
        targetDriverId: drivers[0].id,
        dispatchCountdown: config.dispatchIntervalSec
      });
      setOrders(await DataService.getOrders());
    } else {
      alert("範圍內暫無合適司機。");
    }
  };

  const handleCreateOrder = async (orderData: Partial<Order>) => {
    const newOrder = await DataService.createOrder(orderData);
    setOrders(prev => [newOrder, ...prev]);
  };

  const renderContent = () => {
    if (userRole === UserRole.DRIVER) {
      return <DriverPortal orders={orders} onRefresh={async () => setOrders(await DataService.getOrders())} />;
    }
    switch (activeTab) {
      case 'dashboard': return <Dashboard orders={orders} vehicles={vehicles} />;
      case 'dispatch': return <DispatchCenter orders={orders} onDispatch={handleStartDispatch} />;
      case 'map': return <MapView vehicles={vehicles} orders={orders} />;
      case 'client-booking': return <ClientBooking onCreateOrder={handleCreateOrder} onResetOrder={() => setActiveTab('dashboard')} pricingConfig={{baseFare: 150, perKm: 25, perMinute: 5, nightSurcharge: 0}} />;
      case 'cs-portal': return <CustomerService />;
      case 'line-monitor': return (
        <LineAutomation 
          logs={lineLogs} 
          groups={[{id: 'g1', name: '高雄核心司機大群'}, {id: 'g2', name: '高雄外派互助群'}]} 
          onSendMessage={(msg, grp) => {
             const newLog: LineLog = { id: `L-${Date.now()}`, senderName: 'Admin', timestamp: new Date().toLocaleTimeString(), message: msg, type: 'OUTGOING', groupName: grp };
             const updated = [newLog, ...lineLogs];
             setLineLogs(updated);
             DataService.saveLineLogs(updated);
          }} 
        />
      );
      case 'driver-sim': return (
        <DriverSimulator 
          orders={orders} 
          vehicles={vehicles} 
          onStartOrder={async (id, dest) => {
            await DataService.updateOrder(id, { status: OrderStatus.IN_TRANSIT, destination: dest, startTime: new Date().toISOString() });
            setOrders(await DataService.getOrders());
          }} 
          onCompleteOrder={async (id) => {
            const order = orders.find(o => o.id === id);
            if (order) {
              const final = DataService.calculateFinalFare(order);
              await DataService.updateOrder(id, { status: OrderStatus.COMPLETED, endTime: new Date().toISOString(), ...final });
              if (order.vehicleId) await DataService.updateVehicleWallet(order.vehicleId, -final.systemFee);
              setOrders(await DataService.getOrders());
            }
          }} 
        />
      );
      case 'reports': return <Reports />;
      case 'wallet': return <Wallet vehicles={vehicles} onTopUp={async (id, amt) => {
        await DataService.updateVehicleWallet(id, amt);
        setVehicles(await DataService.getVehicles());
      }} />;
      case 'store-mgmt': return <StoreManagement />;
      case 'blueprint': return <Blueprint />;
      case 'db-schema': return <DatabaseSchema />;
      case 'settings': return <Settings />;
      default: return <Dashboard orders={orders} vehicles={vehicles} />;
    }
  };

  if (!userRole) return <LoginGate onSelectRole={setUserRole} />;

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden font-sans">
      <Sidebar role={userRole} activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col lg:ml-64">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-50">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500"><i className="fas fa-bars"></i></button>
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeTab.replace('-', ' ')}</h2>
           </div>
           <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">LIVE DATA SYNC</span>
             </div>
             <button onClick={() => setUserRole(null)} className="text-[10px] font-black text-slate-400 uppercase hover:text-rose-500 px-4 py-2 bg-slate-100 rounded-xl transition-all">Sign Out</button>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
