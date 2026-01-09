import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuGroups = [
    {
      title: '營運核心',
      items: [
        { id: 'client', label: '立即叫車', icon: 'fa-mobile-screen' },
        { id: 'dispatch', label: '派單中心', icon: 'fa-paper-plane' },
        { id: 'map', label: '即時地圖', icon: 'fa-map-location-dot' },
      ]
    },
    {
      title: '管理與統計',
      items: [
        { id: 'dashboard', label: '營運總覽', icon: 'fa-chart-pie' },
        { id: 'reports', label: '統計報表', icon: 'fa-file-invoice-dollar' },
        { id: 'wallet', label: '財務錢包', icon: 'fa-wallet' },
      ]
    },
    {
      title: '系統整合',
      items: [
        { id: 'line', label: 'LINE 機器人', icon: 'fa-robot' },
        { id: 'driver', label: '模擬終端', icon: 'fa-steering-wheel' },
        { id: 'settings', label: '費率設定', icon: 'fa-sliders' },
      ]
    },
    {
      title: '正式上線規劃',
      items: [
        { id: 'roadmap', label: '營運藍圖', icon: 'fa-road-circle-check' },
        { id: 'database', label: '資料庫設計', icon: 'fa-database' },
      ]
    }
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Main Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-slate-900 text-slate-300 w-72 lg:w-64 z-[110] flex flex-col transition-transform duration-500 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Brand Section */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/20">
              <i className="fas fa-heart text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-white font-black text-xl tracking-tight leading-none">千尋派車</h1>
              <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase mt-1 block">Dispatch Pro</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-500">
            <i className="fas fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group ${
                      activeTab === item.id 
                        ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/20' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <i className={`fas ${item.icon} w-5 text-center text-sm ${
                      activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-rose-400'
                    }`}></i>
                    <span>{item.label}</span>
                    {activeTab === item.id && (
                      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* System Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="bg-slate-800/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">主線伺服器</span>
            </div>
            <p className="text-[11px] font-mono text-slate-500">KHH-MAIN-NODE-01</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;