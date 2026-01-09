
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'client', label: '客戶叫車', icon: 'fa-mobile-screen-button' },
    { id: 'dispatch', label: '派車中心', icon: 'fa-paper-plane' },
    { id: 'driver', label: '司機任務', icon: 'fa-steering-wheel' },
    { id: 'wallet', label: '司機錢包', icon: 'fa-wallet' },
    { id: 'dashboard', label: '營運概況', icon: 'fa-chart-pie' },
    { id: 'map', label: '即時地圖', icon: 'fa-map-location-dot' },
    { id: 'line', label: 'LINE 自動化', icon: 'fa-robot' },
    { id: 'reports', label: '統計報表', icon: 'fa-file-contract' },
    { id: 'settings', label: '計費設定', icon: 'fa-gear' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
          <i className="fas fa-heart text-white text-xl"></i>
        </div>
        <div>
          <h1 className="font-bold text-xl leading-tight tracking-tight">千尋派車</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Kaohsiung HUB</p>
        </div>
      </div>
      
      <nav className="flex-1 mt-8 px-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl mb-2 transition-all duration-300 ${
              activeTab === item.id 
                ? 'bg-rose-600 text-white shadow-xl shadow-rose-500/30 translate-x-1' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center text-sm`}></i>
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Cloud</span>
          </div>
          <p className="text-xs text-slate-300 font-bold opacity-80">
            Node: TAIWAN-SOUTH-1
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
