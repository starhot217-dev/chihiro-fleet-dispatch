
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { Store } from '../types';

const StoreManagement: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);

  useEffect(() => {
    setStores(DataService.getStores());
  }, []);

  const handleUpdateBase = (id: string, base: number) => {
    const updated = stores.map(s => s.id === id ? { ...s, kickbackBase: base } : s);
    setStores(updated);
    DataService.saveStores(updated);
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
    <div className="p-4 lg:p-10 max-w-6xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">特約店家管理</h2>
          <p className="text-slate-500 font-medium mt-1">設定回金基數並管理合作店鋪</p>
        </div>
        <button 
          onClick={handleAddNewStore}
          className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> 新增合作店
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map(store => (
          <div key={store.id} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                   <i className="fas fa-shop"></i>
                </div>
                <span className="text-[10px] font-black text-slate-300 font-mono tracking-tighter">ID: {store.id}</span>
             </div>
             
             <div className="space-y-4 mb-8">
                <h4 className="text-xl font-black text-slate-800">{store.name}</h4>
                <div className="flex justify-between text-xs font-bold">
                   <span className="text-slate-400">當前累積回金</span>
                   <span className="text-indigo-600">${store.unpaidKickback}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                   <span className="text-slate-400">總服務趟數</span>
                   <span className="text-slate-800">{store.totalTrips} 趟</span>
                </div>
             </div>

             <div className="bg-slate-50 p-5 rounded-2xl space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">回金基數設定 (每百元)</label>
                <div className="flex items-center gap-3">
                   <span className="text-lg font-black text-slate-400">$</span>
                   <input 
                     type="number" 
                     value={store.kickbackBase} 
                     onChange={e => handleUpdateBase(store.id, parseInt(e.target.value) || 0)}
                     className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-2 font-black text-indigo-600 outline-none focus:border-indigo-600"
                   />
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 p-8 rounded-[3rem] border border-indigo-100 flex items-start gap-6">
         <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0">
            <i className="fas fa-info-circle"></i>
         </div>
         <div>
            <h4 className="font-black text-indigo-900 mb-1">關於回金基數</h4>
            <p className="text-sm text-indigo-700/70 leading-relaxed font-medium">
               店家叫車系統會根據此基數進行計算。例如基數設定為 10，則一趟 $450 的店家特約單，店家將獲得 $40 的回饋金（4個百元區間）。
            </p>
         </div>
      </div>
    </div>
  );
};

export default StoreManagement;
