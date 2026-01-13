
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
        { id: 'dashboard', label: '營運總覽', icon: 'fa-chart-pie' },
        { id: 'dispatch', label: '派單中心', icon: 'fa-paper-plane' },
        { id: 'map', label: '即時地圖', icon: 'fa-map-location-dot' },
      ]
    },
    {
      title: '開發與實作 ( Master )',
      items: [
        { id: 'implementation', label: '系統實作全手冊', icon: 'fa-terminal' },
        { id: 'line-prod', label: '後端 Webhook 代碼', icon: 'fa-code' },
        { id: 'db-schema', label: 'PostGIS 資料庫', icon: 'fa-database' },
      ]
    },
    {
      title: '財務與報表',
      items: [
        { id: 'reports', label: '數據統計報表', icon: 'fa-file-invoice-dollar' },
        { id: 'wallet', label: '司機錢包儲值', icon: 'fa-wallet' },
      ]
    },
    {
      title: '系統配置',
      items: [
        { id: 'store-mgmt', label: '店家管理', icon: 'fa-users-gear' },
        { id: 'settings', label: '計費費率設定', icon: 'fa-sliders' },
      ]
    }
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />
      <aside className={`fixed left-0 top-0 h-screen bg-slate-900 text-slate-300 w-72 lg:w-64 z-[110] flex flex-col transition-transform duration-500 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/20">
              <i className="fas fa-heart text-white text-lg"></i>
            </div>
            <h1 className="text-white font-black text-xl tracking-tight">千尋派車</h1>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button key={item.id} onClick={() => handleSelect(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${activeTab === item.id ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40' : 'hover:bg-slate-800'}`}>
                    <i className={`fas ${item.icon} w-5 text-center`}></i>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
