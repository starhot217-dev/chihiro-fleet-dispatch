
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Blueprint from './components/Blueprint';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Reports from './components/Reports';
import DispatchCenter from './components/DispatchCenter';
import LineAutomation from './components/LineAutomation';
import ClientBooking from './components/ClientBooking';
import Settings from './components/Settings';
import Wallet from './components/Wallet';
import { INITIAL_ORDERS, MOCK_VEHICLES } from './constants';
import { Order, OrderStatus, LineLog, Vehicle } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('client');
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('chihiro_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('chihiro_vehicles');
    return saved ? JSON.parse(saved) : MOCK_VEHICLES;
  });
  const [lineLogs, setLineLogs] = useState<LineLog[]>([]);
  const [currentClientOrderId, setCurrentClientOrderId] = useState<string | null>(null);

  const [pricingConfig, setPricingConfig] = useState(() => {
    const saved = localStorage.getItem('chihiro_pricing');
    return saved ? JSON.parse(saved) : {
      baseFare: 100,
      perKm: 25,
      perMinute: 5,
      nightSurcharge: 50
    };
  });

  useEffect(() => {
    localStorage.setItem('chihiro_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('chihiro_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('chihiro_pricing', JSON.stringify(pricingConfig));
  }, [pricingConfig]);

  const handleCreateClientOrder = (orderData: Partial<Order>) => {
    const newOrderId = `ORD-${Math.floor(Math.random() * 900) + 200}`;
    const newOrder: Order = {
      id: newOrderId,
      clientName: orderData.clientName || '匿名客戶',
      clientPhone: orderData.clientPhone || '0900-000-000',
      pickup: orderData.pickup || '高雄市鳳山區中山西路374號',
      destination: orderData.destination || '目的地資訊',
      status: OrderStatus.PENDING,
      createdAt: new Date().toLocaleString('zh-TW'),
      price: orderData.price || 300,
      commission: Math.round((orderData.price || 300) * 0.1),
      note: '【車上禁菸、禁檳榔】'
    };

    setOrders(prev => [newOrder, ...prev]);
    setCurrentClientOrderId(newOrderId);
  };

  const handleManualAddOrder = (orderData: Partial<Order>) => {
    const newOrderId = `ORD-${Math.floor(Math.random() * 900) + 200}`;
    const newOrder: Order = {
      id: newOrderId,
      clientName: orderData.clientName || '手動建立',
      clientPhone: orderData.clientPhone || '0000-000-000',
      pickup: orderData.pickup || '未知起點',
      destination: orderData.destination || '未知終點',
      status: OrderStatus.PENDING,
      createdAt: new Date().toLocaleString('zh-TW'),
      price: orderData.price || 300,
      commission: Math.round((orderData.price || 300) * 0.1),
      note: orderData.note || '【車上禁菸、禁檳榔】'
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleResetClientOrder = () => {
    setCurrentClientOrderId(null);
  };

  const handleTopUp = (vehicleId: string, amount: number) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, walletBalance: v.walletBalance + amount } : v));
  };

  const handleDispatchToLine = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.DISPATCHING } : o));

    const newLog: LineLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('zh-TW'),
      groupName: '高雄司機大群組',
      type: 'OUTGOING',
      message: `📢 新任務通知！\n📍 上車：${order.pickup}\n🏁 下車：${order.destination}\n💰 金額：$${order.price}\n📝 備註：${order.note || '無'}\n\n請輸入「${order.id}」以接案。`
    };

    setLineLogs(prev => [...prev, newLog]);
  };

  const handleLineReply = (text: string) => {
    const userLog: LineLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('zh-TW'),
      groupName: '高雄司機大群組',
      type: 'INCOMING',
      message: text
    };
    setLineLogs(prev => [...prev, userLog]);

    const match = text.match(/ORD-\d+/);
    if (match) {
      const orderId = match[0];
      const order = orders.find(o => o.id === orderId);

      if (order && order.status === OrderStatus.DISPATCHING) {
        // 優先找餘額足夠且空閒的司機
        const availableVehicles = vehicles.filter(v => v.status === 'IDLE');
        const commission = order.commission || Math.round(order.price * 0.1);
        
        const targetVehicle = availableVehicles.find(v => v.walletBalance >= commission) || availableVehicles[0] || vehicles[0];

        if (targetVehicle.walletBalance < commission) {
          const failLog: LineLog = {
             id: Math.random().toString(36).substr(2, 9),
             timestamp: new Date().toLocaleTimeString('zh-TW'),
             groupName: '高雄司機大群組',
             type: 'OUTGOING',
             message: `⚠️ 系統提示：司機 ${targetVehicle.driverName} 儲值餘額不足 ($${targetVehicle.walletBalance})，無法承接此單 ($${commission})。`
          };
          setLineLogs(prev => [...prev, failLog]);
          return;
        }

        setTimeout(() => {
          const replyLog: LineLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString('zh-TW'),
            groupName: '高雄司機大群組',
            type: 'OUTGOING',
            message: `千尋 ❤️${orderId}❤️-安心搭(主)\n車輛預估 8~12 分鐘到達\n駕駛:${targetVehicle.driverName}\n車色:銀\n車號:${targetVehicle.plateNumber}\n群組: 高雄司機大群組\n--------------------------\n已成功扣除儲值金：$${commission}`
          };
          setLineLogs(prev => [...prev, replyLog]);
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.ASSIGNED, vehicleId: targetVehicle.id } : o));
          
          setVehicles(prev => prev.map(v => v.id === targetVehicle.id ? { 
            ...v, 
            status: 'BUSY',
            walletBalance: v.walletBalance - commission 
          } : v));
        }, 1200);
      } else {
        const errorLog: LineLog = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString('zh-TW'),
          groupName: '高雄司機大群組',
          type: 'OUTGOING',
          message: `⚠️ 系統提示：訂單 ${orderId} 已由他人承接或不存在。`
        };
        setLineLogs(prev => [...prev, errorLog]);
      }
    }
  };

  const renderContent = () => {
    const currentClientOrder = orders.find(o => o.id === currentClientOrderId);

    switch (activeTab) {
      case 'client': return (
        <ClientBooking 
          activeOrder={currentClientOrder} 
          onCreateOrder={handleCreateClientOrder} 
          onResetOrder={handleResetClientOrder}
          pricingConfig={pricingConfig}
        />
      );
      case 'wallet': return (
        <Wallet 
          vehicles={vehicles} 
          onTopUp={handleTopUp} 
        />
      );
      case 'settings': return (
        <Settings 
          config={pricingConfig} 
          onSave={(newConfig) => setPricingConfig(newConfig)} 
        />
      );
      case 'blueprint': return <Blueprint />;
      case 'dashboard': return <Dashboard orders={orders} vehicles={vehicles} />;
      case 'dispatch': return (
        <DispatchCenter 
          orders={orders} 
          vehicles={vehicles} 
          onDispatch={handleDispatchToLine}
          onCancel={(id) => setOrders(prev => prev.filter(o => o.id !== id))}
          onAddOrder={handleManualAddOrder}
          pricingConfig={pricingConfig}
        />
      );
      case 'map': return <MapView />;
      case 'reports': return <Reports orders={orders} />;
      case 'line': return (
        <div className="flex h-full p-8 bg-slate-50">
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 mr-8 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">LINE 自動化整合引擎</h3>
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-emerald-700 text-[10px] font-black uppercase tracking-widest">Active Connection</span>
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-rose-200 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#00b900] rounded-2xl shadow-lg shadow-emerald-50 flex items-center justify-center text-white">
                      <i className="fab fa-line text-3xl"></i>
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-800">高雄司機大群組</p>
                      <p className="text-xs text-slate-400 font-mono tracking-widest mt-1">G_KHH_PRO_FLEET</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase">今日派遣</p>
                    <p className="text-lg font-black text-slate-800">42</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase">平均搶單</p>
                    <p className="text-lg font-black text-rose-600">1.2s</p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase">在線成員</p>
                    <p className="text-lg font-black text-emerald-600">125</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[420px] h-full rounded-[4rem] overflow-hidden shadow-2xl border-[14px] border-slate-900 bg-slate-900 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-slate-900 rounded-b-3xl z-20"></div>
            <div className="h-full pt-6">
              <LineAutomation logs={lineLogs} onSendMessage={handleLineReply} />
            </div>
          </div>
        </div>
      );
      default: return <Dashboard orders={orders} vehicles={vehicles} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 selection:bg-rose-100 selection:text-rose-700">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-50/40 rounded-full blur-[140px] -mr-80 -mt-80 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-50/20 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none"></div>
        
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-rose-600 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
              <span className="text-slate-800 text-xs font-black uppercase tracking-[0.2em]">
                千尋派車系統 v2.6
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <h2 className="text-slate-800 font-black text-sm tracking-tight">
              {
                activeTab === 'client' ? '客戶端實體 (MOBILE APP)' : 
                activeTab === 'dispatch' ? '調度任務監控 (OPERATIONS)' : 
                activeTab === 'line' ? 'LINE BOT 管理 (AUTOMATION)' : 
                activeTab === 'settings' ? '計費設定中心 (SETTINGS)' :
                activeTab === 'wallet' ? '錢包與儲值系統 (WALLET)' :
                activeTab.toUpperCase()
              }
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-black text-slate-800 tracking-tight leading-none">Dispatcher CHIHIRO</p>
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mt-1">Kaohsiung HUB</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-xl shadow-rose-100/50 border border-slate-100 group cursor-pointer hover:scale-110 transition-transform">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Chihiro&backgroundColor=ffdfbf" alt="avatar" className="w-full h-full rounded-[0.8rem] bg-rose-50" />
              </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto custom-scrollbar relative z-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
