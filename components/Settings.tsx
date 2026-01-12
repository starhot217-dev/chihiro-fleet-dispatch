
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
    // 允許空字串以便用戶刪除數字重新輸入，儲存時再轉為數字
    const numValue = value === '' ? 0 : parseInt(value, 10);
    const updatedPlans = plans.map(p => p.id === activePlanId ? { ...p, [field]: numValue } : p);
    setPlans(updatedPlans);
  };

  const handleSave = () => {
    DataService.savePricingPlans(plans);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (plans.length === 0) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">系統計費管理</h2>
        <p className="text-slate-500 font-medium mt-1">針對不同客群設定專屬計費方案，支援 0 費率設定</p>
      </div>

      {/* Plan Tabs */}
      <div className="flex bg-slate-100 p-2 rounded-[2rem] gap-2">
        {plans.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePlanId(p.id)}
            className={`flex-1 py-4 rounded-[1.5rem] font-black text-sm transition-all ${
              activePlanId === p.id 
                ? 'bg-white text-rose-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-xl">
             <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">編輯方案：{activePlan.name}</h3>
            <p className="text-slate-400 text-xs font-bold">當前 ID: {activePlan.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { label: '起步價 (Base Fare)', key: 'baseFare' },
            { label: '每公里里程費 (Per KM)', key: 'perKm' },
            { label: '每分鐘等待費 (Per Minute)', key: 'perMinute' },
            { label: '夜間加成 (Night Surcharge)', key: 'nightSurcharge' }
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input 
                  type="number"
                  value={activePlan[field.key as keyof PricingPlan] || ''}
                  onChange={(e) => updateActivePlan(field.key as keyof PricingPlan, e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-10 pr-4 py-4 text-lg font-black text-slate-700 focus:border-rose-500 focus:bg-white outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSave}
          className={`w-full py-5 rounded-[2rem] font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
            saved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {saved ? (
            <><i className="fas fa-check"></i> 全部方案已儲存</>
          ) : (
            <><i className="fas fa-save"></i> 儲存所有費率變更</>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;
