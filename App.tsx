
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Reports from './components/Reports';
import DispatchCenter from './components/DispatchCenter';
import LineAutomation from './components/LineAutomation';
import ClientBooking from './components/ClientBooking';
import Settings from './components/Settings';
import Wallet from './components/Wallet';
import DriverSimulator from './components/DriverSimulator';
import WorkflowGuide from './components/WorkflowGuide';
import OperationalRoadmap from './components/OperationalRoadmap';
import DatabaseSchema from './components/DatabaseSchema';
import CentralSwitchboard from './components/CentralSwitchboard';
import LoginGate from './components/LoginGate';
import DriverPortal from './components/DriverPortal';
import { DataService } from './services/dataService';
import { estimateRealMileage } from './services/geographyService';
import { Order, OrderStatus, LineLog, Vehicle, LineGroup, PricingPlan, UserRole } from './types';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState('guide');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [lineLogs, setLineLogs] = useState<LineLog[]>([]);
  const [lineGroups, setLineGroups] = useState<LineGroup[]>([]);
  const [currentClientOrderId, setCurrentClientOrderId] = useState<string | null>(null);

  useEffect(() => {
    setOrders(DataService.getOrders());
    setVehicles(DataService.getVehicles());
    setLineGroups(DataService.getGroups());
  }, []);

  const generateDisplayId = () => {
    const now = new Date();
    const dateStr = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0');
    return `❤️${dateStr}.${seq}❤️`;
  };

  const generateChihiroFormat = (order: Order, vehicle: Vehicle) => {
    return `千尋 ${order.displayId}-千尋(主) SUDU
車輛預估 6~10 分鐘到達
駕駛:${vehicle.driverName}
車色:${vehicle.color}
車號:${vehicle.plateNumber}
群組:${order.acceptedGroup || '未設定'}
方案:${order.planName}
--------------------------
備註:
${order.note || '【車上禁菸、禁檳榔】'}
--------------------------
上車:${order.pickup}
回傳給客戶_`;
  };

  const handleCreateClientOrder = (orderData: Partial<Order>) => {
    const newOrderId = `ORD-${Date.now()}`;
    const newOrder: Order = {
      id: newOrderId,
      displayId: generateDisplayId(),
      clientName: orderData.clientName || '乘客',
      clientPhone: orderData.clientPhone || '09xx-xxx-xxx',
      pickup: orderData.pickup || '高雄市苓雅區中正二路22號',
      destination: orderData.destination, 
      status: OrderStatus.PENDING,
      planId: orderData.planId || 'default',
      planName: orderData.planName || '一般預設',
      createdAt: new Date().toLocaleString('zh-TW'),
      price: orderData.price || 0,
      note: orderData.note || '【車上禁菸、禁檳榔】'
    };
    DataService.createOrder(newOrder);
    setOrders(DataService.getOrders());
    setCurrentClientOrderId(newOrderId);
    setActiveTab('client');
  };

  const handleDispatchToLine = (orderId: string, planId: string) => {
    const currentPlans = DataService.getPricingPlans();
    const selectedPlan = currentPlans.find(p => p.id === planId) || currentPlans[0];
    
    DataService.updateOrderStatus(orderId, OrderStatus.DISPATCHING, {
      planId: selectedPlan.id,
      planName: selectedPlan.name
    });
    
    const updatedOrders = DataService.getOrders();
    setOrders(updatedOrders);
    
    const order = updatedOrders.find(o => o.id === orderId);
    if (!order) return;

    const activeGroups = lineGroups.filter(g => g.isActive);
    const newLogs: LineLog[] = activeGroups.map(group => ({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('zh-TW'),
      groupName: group.name,
      type: 'OUTGOING',
      isFlexMessage: true,
      message: `📢 派單通知 📢\n方案：${order.planName}\n📍 上車：${order.pickup}\n🏁 目的：${order.destination || '司機接單後輸入'}\n🆔 編號：${order.id}\n\n回覆「接 ${order.id}」承接任務`
    }));
    setLineLogs(prev => [...prev, ...newLogs]);
  };

  const handleLineReply = (text: string, fromGroupName: string, isManual: boolean = false) => {
    const incomingLog: LineLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('zh-TW'),
      groupName: fromGroupName,
      senderName: isManual ? '人工調度員' : '米修',
      type: isManual ? 'OUTGOING' : 'INCOMING',
      message: text
    };
    setLineLogs(prev => [...prev, incomingLog]);

    if (!isManual) {
      const orderMatch = text.match(/ORD-\d+/i) || text.match(/ORD-TEST-\d+/i);
      if (orderMatch && text.includes('接')) {
        handleDriverAccept(orderMatch[0].toUpperCase(), fromGroupName);
      }
    }
  };

  const handleDriverAccept = (orderId: string, fromGroup: string) => {
    const currentOrders = DataService.getOrders();
    const order = currentOrders.find(o => o.id === orderId);
    const targetVehicle = vehicles.find(v => v.id === 'V2') || vehicles[1];

    if (order && order.status === OrderStatus.DISPATCHING) {
      DataService.updateOrderStatus(orderId, OrderStatus.PICKING_UP, {
        vehicleId: targetVehicle.id,
        driverName: targetVehicle.driverName,
        acceptedGroup: fromGroup
      });
      DataService.updateVehicleStatus(targetVehicle.id, 'BUSY');
      
      setOrders(DataService.getOrders());
      setVehicles(DataService.getVehicles());

      const chihiroMsg = generateChihiroFormat(DataService.getOrders().find(o => o.id === orderId)!, targetVehicle);
      setLineLogs(prev => [...prev, {
        id: 'CHIHIRO-CONFIRM-' + Date.now(),
        timestamp: new Date().toLocaleTimeString('zh-TW'),
        groupName: fromGroup,
        type: 'OUTGOING',
        message: chihiroMsg
      }]);
    }
  };

  const handleRunAutoTest = () => {
    const testOrderId = `ORD-TEST-${Date.now()}`;
    const testOrder: Order = {
      id: testOrderId,
      displayId: generateDisplayId(),
      clientName: '測試人員(系統)',
      clientPhone: '0900-000-000',
      pickup: '高雄軟體園區-服務大樓',
      status: OrderStatus.PENDING,
      planId: 'default',
      planName: '一般預設',
      createdAt: new Date().toLocaleString('zh-TW'),
      price: 0,
      note: '【系統自動化壓力測試中】'
    };
    
    DataService.createOrder(testOrder);
    setOrders(DataService.getOrders());

    setTimeout(() => {
      handleDispatchToLine(testOrderId, 'default');
    }, 800);

    setTimeout(() => {
      handleLineReply(`接 ${testOrderId}`, '高雄核心司機大群');
    }, 2500);
  };

  const handleStartOrder = async (orderId: string, destination: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const plans = DataService.getPricingPlans();
    const plan = plans.find(p => p.id === order.planId) || plans[0];
    
    // 使用地理座標引擎計算「真正大約里程」
    let realKm = estimateRealMileage(order.pickup, destination);
    let realMins = Math.round(realKm * 2.2);

    // 如果有 Google API 且運作正常才替換
    if (window.google && window.google.maps && window.google.maps.DirectionsService) {
      try {
        const directionsService = new window.google.maps.DirectionsService();
        const response = await new Promise<any>((resolve, reject) => {
          directionsService.route({
            origin: order.pickup,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING
          }, (result: any, status: any) => {
            if (status === 'OK') resolve(result);
            else reject(status);
          });
        });
        
        realKm = Number((response.routes[0].legs[0].distance.value / 1000).toFixed(1));
        realMins = Math.ceil(response.routes[0].legs[0].duration.value / 60);
      } catch (err) {
        console.warn("Google Maps Route failed, using Geo Engine.");
      }
    }

    const finalPrice = Math.round(
      plan.baseFare + 
      (realKm * plan.perKm) + 
      (realMins * plan.perMinute) + 
      (plan.nightSurcharge || 0)
    );
    
    DataService.updateOrderStatus(orderId, OrderStatus.IN_TRANSIT, {
      destination,
      price: finalPrice,
      startTime: new Date().toLocaleString('zh-TW'),
      note: `${order.note || ''} (真正約估: ${realKm}km / 15% 抽成結算中)`
    });
    setOrders(DataService.getOrders());
  };

  const handleCompleteOrder = (orderId: string) => {
    const result = DataService.completeOrderAndDeduct(orderId, 0.15);
    if (result.success) {
      setOrders(DataService.getOrders());
      setVehicles(DataService.getVehicles());
    }
  };

  const handleDownloadWhitepaper = () => {
    alert("技術白皮書產製中...");
    window.print();
  };

  const renderContent = () => {
    const currentClientOrder = orders.find(o => o.id === currentClientOrderId);
    const currentPricing = DataService.getPricing();

    if (userRole === UserRole.DRIVER) {
      return (
        <DriverPortal 
          orders={orders} 
          vehicles={vehicles} 
          onStartOrder={handleStartOrder} 
          onCompleteOrder={handleCompleteOrder}
          onAcceptOrder={(id) => handleDriverAccept(id, '手動搶單')}
          onResetData={DataService.resetData}
        />
      );
    }

    switch (activeTab) {
      case 'guide': return <WorkflowGuide setActiveTab={setActiveTab} onDownload={handleDownloadWhitepaper} />;
      case 'client': return <ClientBooking activeOrder={currentClientOrder} onCreateOrder={handleCreateClientOrder} onResetOrder={() => setCurrentClientOrderId(null)} pricingConfig={currentPricing} />;
      case 'dispatch': return <DispatchCenter orders={orders} vehicles={vehicles} onDispatch={handleDispatchToLine} onCancel={(id) => { DataService.updateOrderStatus(id, OrderStatus.CANCELLED); setOrders(DataService.getOrders()); }} onAddOrder={handleCreateClientOrder} />;
      case 'driver': return <DriverSimulator orders={orders} vehicles={vehicles} onStartOrder={handleStartOrder} onCompleteOrder={handleCompleteOrder} />;
      case 'switchboard': return <CentralSwitchboard orders={orders} vehicles={vehicles} />;
      case 'line': return (
        <div className="flex flex-col lg:flex-row h-full p-6 bg-slate-50 gap-6">
          <div className="flex-1 bg-white rounded-[3rem] p-10 overflow-y-auto border border-slate-100 shadow-sm">
             <div className="mb-8">
               <h3 className="text-2xl font-black text-slate-800">LINE 機器人派單預覽</h3>
               <p className="text-slate-500 font-medium">系統已成功對接千尋專用字串格式</p>
             </div>
             <div className="space-y-6">
                <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">當前標準輸出樣板</p>
                  <pre className="text-xs font-mono text-slate-600 bg-white p-4 rounded-xl border border-rose-100/50 leading-relaxed whitespace-pre-wrap">
{`千尋 ❤️20260112.00014❤️-千尋(主) SUDU
車輛預估 6~10 分鐘到達
駕駛:米修
車色:白
車號:AHX-7515
方案:一般預設
--------------------------
上車:高雄市苓雅區中正二路22號
回傳給客戶_`}
                  </pre>
                </div>
             </div>
          </div>
          <div className="w-full lg:w-[420px] h-full lg:h-[700px] rounded-[4rem] border-[14px] border-slate-900 bg-slate-900 overflow-hidden shadow-2xl relative">
             <LineAutomation 
               logs={lineLogs} 
               groups={lineGroups} 
               onSendMessage={handleLineReply} 
               onRunAutoTest={handleRunAutoTest}
             />
          </div>
        </div>
      );
      case 'dashboard': return <Dashboard orders={orders} vehicles={vehicles} />;
      case 'map': return <MapView vehicles={vehicles} orders={orders} />;
      case 'reports': return <Reports orders={orders} />;
      case 'wallet': return <Wallet vehicles={vehicles} onTopUp={(id, amt) => setVehicles(DataService.updateVehicleWallet(id, amt))} />;
      case 'settings': return <Settings />;
      case 'roadmap': return <OperationalRoadmap />;
      case 'database': return <DatabaseSchema />;
      default: return <WorkflowGuide setActiveTab={setActiveTab} onDownload={handleDownloadWhitepaper} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {!userRole && <LoginGate onSelectRole={setUserRole} />}
      
      {userRole === UserRole.ADMIN && (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}
      
      <main className={`flex-1 min-h-screen flex flex-col ${userRole === UserRole.ADMIN ? 'lg:ml-64' : ''}`}>
        <header className="h-20 bg-white/80 backdrop-blur-2xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-[80]">
          <div className="flex items-center gap-4 lg:gap-6">
            {userRole === UserRole.ADMIN && (
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-500">
                <i className="fas fa-bars text-xl"></i>
              </button>
            )}
            <div className="flex items-center gap-4">
              <span className="text-rose-600 font-black text-xs lg:text-sm uppercase tracking-widest hidden sm:block">Chihiro Dispatch</span>
              <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
              <h2 className="text-slate-500 font-bold text-xs uppercase">
                {userRole === UserRole.DRIVER ? '司機工作台' : activeTab}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => {setUserRole(null); setActiveTab('guide');}} className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white p-0.5 shadow-md border border-slate-100 hover:scale-110 transition-transform overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userRole === UserRole.DRIVER ? '米修' : 'Admin'}`} className="w-full h-full rounded-[0.9rem]" />
             </button>
          </div>
        </header>
        <div className="flex-1 relative z-10 overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
