
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { Store } from '../types';

const StoreManagement: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isSettling, setIsSettling] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => setStores(await DataService.getStores());
    load();
  }, []);

  const handleUpdateBase = (id: string, base: number) => {
    const updated = stores.map(s => s.id === id ? { ...s, kickbackBase: base } : s);
    setStores(updated);
    DataService.saveStores(updated);
  };

  const handleSettle = async (id: string) => {
    setIsSettling(id);
    await DataService.updateKickbackPaid(id);
    const updated = await DataService.getStores();
    setStores(updated);
    setIsSettling(null);
    alert('回扣已結清並記錄至財務報表。');
  };

  const handleAddNewStore = () => {
    const newStore: Store = {
      id: `ST${Date.now().toString().slice(-4)}`,
      name: '新特約商店',
      contact: '07-xxx',
      kickbackBase: 10,
      unpaidKickback: 0,
      totalTrips: 0
    };
    const updated = [...stores, newStore];
    setStores(updated);
    DataService.saveStores(updated);
  };

  return (
    <div className="p-4 lg:p-10 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">特約店家管理中心</h2>
          <p className="text-slate-500 font-medium mt-1">管理店家回扣規則與財務對帳狀態</p>
        </div>
        <button 
          onClick={handleAddNewStore}
          className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm shadow-xl flex items-center gap-2 hover:bg-black transition-all"
        >
          <i className="fas fa-plus"></i> 新增合作店鋪
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stores.map(store => (
          <div key={store.id} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
             <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-inner">
                   <i className="fas fa-shop text-xl"></i>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-300 font-mono tracking-tighter">ID: {store.id}</p>
                   <p className="text-[10px] font-black text-emerald-500 uppercase">Partner Verified</p>
                </div>
             </div>
             
             <div className="space-y-6 mb-10 flex-1">
                <h4 className="text-2xl font-black text-slate-800">{store.name}</h4>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">未結回扣</p>
                      <p className="text-xl font-black text-rose-600">${store.unpaidKickback}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">服務趟數</p>
                      <p className="text-xl font-black text-slate-800">{store.totalTrips}</p>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="bg-slate-900 p-6 rounded-[2rem] space-y-3 shadow-lg">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">回金基數 (每百元)</label>
                   <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-slate-600">$</span>
                      <input 
                        type="number" 
                        value={store.kickbackBase} 
                        onChange={e => handleUpdateBase(store.id, parseInt(e.target.value) || 0)}
                        className="w-full bg-white/5 border-b-2 border-white/10 px-2 py-1 font-black text-white text-2xl outline-none focus:border-rose-500 transition-all"
                      />
                   </div>
                </div>
                <button 
                  disabled={store.unpaidKickback === 0 || isSettling === store.id}
                  onClick={() => handleSettle(store.id)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg hover:bg-emerald-700 disabled:opacity-20 transition-all uppercase tracking-widest"
                >
                  {isSettling === store.id ? '結算中...' : '結清本月回扣'}
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreManagement;
