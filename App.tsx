
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import DispatchCenter from './components/DispatchCenter';
import LoginGate from './components/LoginGate';
import DriverPortal from './components/DriverPortal';
import Reports from './components/Reports';
import { DataService } from './services/dataService';
import { Order, OrderStatus, UserRole } from './types';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    setOrders(DataService.getOrders());
    setVehicles(DataService.getVehicles());
  }, [userRole]);

  // 業務核心心跳：每秒觸發
  useEffect(() => {
    const timer = setInterval(() => {
      const currentOrders = DataService.getOrders();
      let hasChanged = false;

      const nextOrders = currentOrders.map(order => {
        // A. 15秒單人輪詢派遣
        if (order.status === OrderStatus.DISPATCHING) {
          hasChanged = true;
          if (order.dispatchCountdown > 0) {
            return { ...order, dispatchCountdown: order.dispatchCountdown - 1 };
          } else {
            const drivers = DataService.getEligibleDrivers(order.pickupCoords || {lat: 22.6273, lng: 120.3014});
            const nextIdx = order.currentDriverIndex + 1;
            if (nextIdx < drivers.length) {
              return { 
                ...order, 
                currentDriverIndex: nextIdx, 
                dispatchCountdown: 15, 
                targetDriverId: drivers[nextIdx].id 
              };
            } else {
              return { ...order, status: OrderStatus.PENDING, targetDriverId: undefined, currentDriverIndex: 0 };
            }
          }
        }

        // B. 5分鐘免等跳表
        if (order.status === OrderStatus.ARRIVED && order.waitingStartTime) {
          const waitSecs = Math.floor((Date.now() - new Date(order.waitingStartTime).getTime()) / 1000);
          const FREE_SECONDS = 300; 
          if (waitSecs > FREE_SECONDS) {
            hasChanged = true;
            const overtimeMin = Math.floor((waitSecs - FREE_SECONDS) / 60);
            const newFee = overtimeMin * 10;
            if (newFee !== order.waitingFee) return { ...order, waitingFee: newFee };
          }
        }
        return order;
      });

      if (hasChanged) {
        setOrders(nextOrders);
        DataService.saveOrders(nextOrders);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartDispatch = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const drivers = DataService.getEligibleDrivers(order.pickupCoords || {lat: 22.6273, lng: 120.3014});
    if (drivers.length > 0) {
      DataService.updateOrder(orderId, {
        status: OrderStatus.DISPATCHING,
        targetDriverId: drivers[0].id,
        currentDriverIndex: 0,
        dispatchCountdown: 15
      });
      setOrders(DataService.getOrders());
    } else {
      alert("範圍內暫無合適司機。");
    }
  };

  const renderContent = () => {
    if (userRole === UserRole.DRIVER) {
      return <DriverPortal orders={orders} onRefresh={() => setOrders(DataService.getOrders())} />;
    }
    switch (activeTab) {
      case 'dashboard': return <Dashboard orders={orders} vehicles={vehicles} />;
      case 'dispatch': return <DispatchCenter orders={orders} onDispatch={handleStartDispatch} />;
      case 'map': return <MapView vehicles={vehicles} orders={orders} />;
      case 'reports': return <Reports />;
      default: return <Dashboard orders={orders} vehicles={vehicles} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden font-sans">
      {!userRole && <LoginGate onSelectRole={setUserRole} />}
      {userRole === UserRole.ADMIN && (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}
      <main className={`flex-1 flex flex-col ${userRole === UserRole.ADMIN ? 'lg:ml-64' : ''}`}>
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-50">
           <div className="flex items-center gap-4">
              {userRole === UserRole.ADMIN && (
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500">
                  <i className="fas fa-bars"></i>
                </button>
              )}
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeTab}</h2>
           </div>
           <div className="flex items-center gap-4">
             <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">Live Server</span>
             <button onClick={() => setUserRole(null)} className="text-[10px] font-black text-slate-400 uppercase hover:text-rose-500 px-4 py-2 bg-slate-100 rounded-xl transition-all">登出</button>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
