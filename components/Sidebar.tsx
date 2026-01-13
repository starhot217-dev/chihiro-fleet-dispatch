
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const allGroups = [
    {
      title: '系統商管理 (Vendor)',
      roles: [UserRole.SYSTEM_VENDOR],
      items: [
        { id: 'settings', label: '全域系統配置', icon: 'fa-gears' },
        { id: 'db-schema', label: '資料庫架構管理', icon: 'fa-database' },
        { id: 'blueprint', label: '開發進度藍圖', icon: 'fa-map' },
      ]
    },
    {
      title: '營運核心',
      roles: [UserRole.SYSTEM_VENDOR, UserRole.ADMIN, UserRole.CS],
      items: [
        { id: 'dashboard', label: '營運總覽', icon: 'fa-chart-pie' },
        { id: 'dispatch', label: '派單中心', icon: 'fa-paper-plane', badge: true },
        { id: 'map', label: '即時地圖調度', icon: 'fa-map-location-dot' },
        { id: 'line-monitor', label: 'LINE 廣播中心', icon: 'fab fa-line' },
      ]
    },
    {
      title: '服務中心',
      roles: [UserRole.SYSTEM_VENDOR, UserRole.ADMIN, UserRole.CS],
      items: [
        { id: 'cs-portal', label: '客服與 FAQ', icon: 'fa-headset' },
        { id: 'store-mgmt', label: '特約店家管理', icon: 'fa-users-gear' },
      ]
    },
    {
      title: '模擬與測試',
      roles: [UserRole.SYSTEM_VENDOR, UserRole.ADMIN],
      items: [
        { id: 'client-booking', label: '客戶端模擬叫車', icon: 'fa-user-tag' },
        { id: 'driver-sim', label: '司機終端模擬', icon: 'fa-mobile-screen-button' },
      ]
    }
  ];

  const filteredGroups = allGroups.filter(g => g.roles.includes(role));

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
          {filteredGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button key={item.id} onClick={() => handleSelect(item.id)} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${activeTab === item.id ? 'bg-rose-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}>
                    <div className="flex items-center gap-4">
                      <i className={`fas ${item.icon} w-5 text-center`}></i>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800">
           <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-500 flex items-center justify-center text-xs">
                <i className="fas fa-shield-halved"></i>
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Current Role</p>
                <p className="text-[11px] font-black text-white truncate uppercase">{role}</p>
              </div>
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
