
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

  const updateActivePlan = (field: keyof PricingPlan, value: any) => {
    const updatedPlans = plans.map(p => p.id === activePlanId ? { ...p, [field]: value } : p);
    setPlans(updatedPlans);
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
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">派遣規則與費率</h2>
          <p className="text-slate-500 font-medium mt-1">設定 15秒派遣、等客 5分鐘與司機懲罰機制</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 lg:p-12 space-y-12 relative overflow-hidden">
        
        {/* 基本資費與等待費 */}
        <section className="space-y-6">
          <h3 className="text-lg font-black text-slate-800 border-l-4 border-rose-500 pl-4 uppercase tracking-widest">計費規則</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">超時等待費 (每分鐘)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-rose-500 text-xl">$</span>
                <input 
                  type="number"
                  value={activePlan.waitingFeePerMin}
                  onChange={(e) => updateActivePlan('waitingFeePerMin', parseInt(e.target.value) || 0)}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-5 text-2xl font-black text-slate-700 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">等客超過 5 分鐘後，每分鐘累計的金額</p>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">標準車資 (每人)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-rose-500 text-xl">$</span>
                <input 
                  type="number"
                  value={activePlan.baseFare}
                  onChange={(e) => updateActivePlan('baseFare', parseInt(e.target.value) || 0)}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-5 text-2xl font-black text-slate-700 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">派單系統預設每人 400 元</p>
            </div>
          </div>
        </section>

        {/* 順序派遣與停權機制 */}
        <section className="space-y-6">
          <h3 className="text-lg font-black text-slate-800 border-l-4 border-amber-500 pl-4 uppercase tracking-widest">派遣與懲罰機制</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">未接單停權門檻 (次數)</label>
              <input 
                type="number"
                value={activePlan.maxMissesBeforeSuspension}
                onChange={(e) => updateActivePlan('maxMissesBeforeSuspension', parseInt(e.target.value) || 0)}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-5 text-2xl font-black text-slate-700 outline-none"
              />
              <p className="text-[10px] text-slate-400 font-medium italic">內群 15 秒未接單累計達此數值則暫時停權</p>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">停權時數 (小時)</label>
              <input 
                type="number"
                value={activePlan.suspensionHours}
                onChange={(e) => updateActivePlan('suspensionHours', parseInt(e.target.value) || 0)}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-5 text-2xl font-black text-slate-700 outline-none"
              />
              <p className="text-[10px] text-slate-400 font-medium italic">懲罰期間該司機將無法接收任何指派任務</p>
            </div>
          </div>
        </section>

        <div className="pt-6">
          <button 
            onClick={handleSave}
            className={`w-full py-6 rounded-[2.5rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 ${
              saved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {saved ? <><i className="fas fa-check-circle"></i> 設定已生效</> : <><i className="fas fa-save"></i> 儲存規則設定</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
