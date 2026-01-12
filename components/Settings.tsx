
import React, { useState, useEffect } from 'react';
import { PricingPlan } from '../types';
import { DataService } from '../services/dataService';

const Settings: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState('default');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPlans(DataService.getPricingPlans());
  }, []);

  const activePlan = plans.find(p => p.id === activePlanId) || plans[0];

  const updateActivePlan = (field: keyof PricingPlan, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    const updatedPlans = plans.map(p => p.id === activePlanId ? { ...p, [field]: numValue } : p);
    setPlans(updatedPlans);
  };

  const handleAddNewPlan = () => {
    const newId = `plan_${Date.now()}`;
    const newPlan: PricingPlan = {
      id: newId,
      name: '新費率方案',
      baseFare: 50,
      perKm: 20,
      perMinute: 5,
      nightSurcharge: 0
    };
    const updated = [...plans, newPlan];
    setPlans(updated);
    setActivePlanId(newId);
  };

  const handleDeleteActive = () => {
    if (activePlanId === 'default') {
      alert('預設方案不可刪除');
      return;
    }
    const updated = plans.filter(p => p.id !== activePlanId);
    setPlans(updated);
    setActivePlanId('default');
  };

  const handleSave = () => {
    DataService.savePricingPlans(plans);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (plans.length === 0) return null;

  return (
    <div className="p-4 lg:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">費率方案管理</h2>
          <p className="text-slate-500 font-medium mt-1">設定不同時段與客群的計費標準</p>
        </div>
        <button 
          onClick={handleAddNewPlan}
          className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> 新增方案
        </button>
      </div>

      <div className="flex bg-slate-100 p-2 rounded-[2rem] gap-2 overflow-x-auto no-scrollbar">
        {plans.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePlanId(p.id)}
            className={`min-w-[120px] flex-1 py-4 px-4 rounded-[1.5rem] font-black text-xs lg:text-sm transition-all whitespace-nowrap ${
              activePlanId === p.id 
                ? 'bg-white text-rose-600 shadow-md scale-105' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 lg:p-12 space-y-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-[1.2rem] flex items-center justify-center text-2xl shadow-inner">
               <i className="fas fa-coins"></i>
            </div>
            <div>
              <input 
                type="text" 
                value={activePlan.name}
                onChange={(e) => {
                  const updated = plans.map(p => p.id === activePlanId ? { ...p, name: e.target.value } : p);
                  setPlans(updated);
                }}
                className="text-2xl font-black text-slate-800 bg-transparent border-b-2 border-transparent focus:border-rose-500 outline-none transition-all"
              />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">方案 ID: {activePlan.id}</p>
            </div>
          </div>
          {activePlanId !== 'default' && (
            <button onClick={handleDeleteActive} className="text-rose-500 text-xs font-black uppercase hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">
              <i className="fas fa-trash-alt mr-2"></i> 刪除方案
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {[
            { label: '起步價 (Base Fare)', key: 'baseFare', icon: 'fa-flag-checkered', desc: '行程啟動的基本固定金額' },
            { label: '每公里費 (Per KM)', key: 'perKm', icon: 'fa-route', desc: 'Google 路網計算之真實里程費' },
            { label: '每分鐘費 (Per Min)', key: 'perMinute', icon: 'fa-stopwatch', desc: '預估行車時間的時間成本費' },
            { label: '夜間/特定加成', key: 'nightSurcharge', icon: 'fa-moon', desc: '如夜間、連假等額外附加費用' }
          ].map((field) => (
            <div key={field.key} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 hover:bg-white hover:shadow-lg hover:border-rose-100 transition-all group">
              <div className="flex items-center gap-3">
                <i className={`fas ${field.icon} text-slate-400 group-hover:text-rose-500 transition-colors`}></i>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
              </div>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-hover:text-rose-500 text-xl">$</span>
                <input 
                  type="number"
                  value={activePlan[field.key as keyof PricingPlan] || 0}
                  onChange={(e) => updateActivePlan(field.key as keyof PricingPlan, e.target.value)}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-5 text-2xl font-black text-slate-700 focus:border-rose-500 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-2 italic">{field.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-6">
          <button 
            onClick={handleSave}
            className={`w-full py-6 rounded-[2.5rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 ${
              saved ? 'bg-emerald-500 text-white scale-[1.02]' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {saved ? (
              <><i className="fas fa-check-circle"></i> 全域費率已成功儲存</>
            ) : (
              <><i className="fas fa-save"></i> 儲存並發布此費率</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
