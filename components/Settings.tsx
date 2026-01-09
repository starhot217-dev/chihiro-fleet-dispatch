
import React, { useState } from 'react';

interface PricingConfig {
  baseFare: number;
  perKm: number;
  perMinute: number;
  nightSurcharge: number;
}

interface SettingsProps {
  config: PricingConfig;
  onSave: (config: PricingConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">系統計費設定</h2>
        <p className="text-slate-500 font-medium mt-1">調整派車系統的全球計費標準</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">起步價 (Base Fare)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input 
                type="number"
                value={localConfig.baseFare}
                onChange={(e) => setLocalConfig({...localConfig, baseFare: parseInt(e.target.value)})}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-10 pr-4 py-4 text-lg font-black text-slate-700 focus:border-indigo-600 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">每公里里程費 (Per KM)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input 
                type="number"
                value={localConfig.perKm}
                onChange={(e) => setLocalConfig({...localConfig, perKm: parseInt(e.target.value)})}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-10 pr-4 py-4 text-lg font-black text-slate-700 focus:border-indigo-600 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">每分鐘等待費 (Per Minute)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input 
                type="number"
                value={localConfig.perMinute}
                onChange={(e) => setLocalConfig({...localConfig, perMinute: parseInt(e.target.value)})}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-10 pr-4 py-4 text-lg font-black text-slate-700 focus:border-indigo-600 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">夜間加成 (Night Surcharge)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input 
                type="number"
                value={localConfig.nightSurcharge}
                onChange={(e) => setLocalConfig({...localConfig, nightSurcharge: parseInt(e.target.value)})}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-10 pr-4 py-4 text-lg font-black text-slate-700 focus:border-indigo-600 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <i className="fas fa-info-circle"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-900">計費公式說明</p>
            <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
              預估總金額 = 起步價 + (預估公里數 × 里程費) + (預估時間 × 等待費) + 夜間加成(如適用)。
              系統會根據 Google Maps 偵測的即時路徑進行自動計算。
            </p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className={`w-full py-5 rounded-[2rem] font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
            saved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {saved ? (
            <><i className="fas fa-check"></i> 設定已儲存</>
          ) : (
            <><i className="fas fa-save"></i> 儲存計費設定</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-clock"></i>
          </div>
          <h4 className="font-bold text-slate-800">夜間時段</h4>
          <p className="text-xs text-slate-400 mt-1">23:00 - 06:00</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-percent"></i>
          </div>
          <h4 className="font-bold text-slate-800">平台服務費</h4>
          <p className="text-xs text-slate-400 mt-1">固定 15%</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
            <i className="fas fa-gas-pump"></i>
          </div>
          <h4 className="font-bold text-slate-800">燃油附加費</h4>
          <p className="text-xs text-slate-400 mt-1">當前暫不收費</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
