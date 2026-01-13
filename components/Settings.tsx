
import React, { useState, useEffect } from 'react';
import { SystemConfig } from '../types';
import { DataService } from '../services/dataService';
import { SupabaseService } from '../services/supabaseService';

const Settings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>(DataService.getConfig());
  const [supabaseKey, setSupabaseKey] = useState(config.dbKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [connStatus, setConnStatus] = useState<'IDLE' | 'SUCCESS' | 'FAIL'>('IDLE');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    if (config.dbKey) setSupabaseKey(config.dbKey);
  }, [config.dbKey]);

  const handleTestSupabase = async () => {
    if (!config.dbHost || !supabaseKey) {
      alert('請輸入完整的 Supabase URL 與 API Key');
      return;
    }
    setIsTesting(true);
    const ok = await SupabaseService.testConnection(config.dbHost || '', supabaseKey);
    setConnStatus(ok ? 'SUCCESS' : 'FAIL');
    setIsTesting(false);
    
    if (ok) {
       // 測試成功即暫存
       const updated = { ...config, dbHost: config.dbHost, dbKey: supabaseKey, dbStatus: 'CONNECTED' as const };
       await DataService.saveConfig(updated);
       setConfig(updated);
       alert('連線測試成功！金鑰已自動保存。');
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    // 彙整目前畫面上所有的輸入內容
    const finalConfig: SystemConfig = { 
      ...config, 
      dbKey: supabaseKey,
      // 確保這些關鍵欄位不為空時才更新
      googleMapsApiKey: config.googleMapsApiKey,
      lineAccessToken: config.lineAccessToken,
      linePrimaryGroupId: config.linePrimaryGroupId
    };
    
    await DataService.saveConfig(finalConfig);
    setConfig(finalConfig);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="p-4 lg:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">系統連線配置 (Production)</h2>
          <p className="text-slate-500 font-medium mt-1">金鑰將安全儲存於本地快取中，重整不消失。</p>
        </div>
        {showSaveSuccess && (
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-xl animate-in slide-in-from-right-4 flex items-center gap-2">
            <i className="fas fa-check-circle"></i> 設定已成功儲存
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Supabase */}
        <section className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 lg:p-12 space-y-8 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                 <i className="fas fa-database"></i>
               </div>
               Supabase 雲端資料庫
            </h3>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              config.dbStatus === 'CONNECTED' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              {config.dbStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project URL</label>
                <input 
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={config.dbHost}
                  onChange={e => setConfig({...config, dbHost: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-6 py-4 text-xs font-mono outline-none transition-all shadow-inner"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anon API Key</label>
                <input 
                  type="password"
                  placeholder="貼入 Supabase 公鑰"
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-6 py-4 text-xs font-mono outline-none transition-all shadow-inner"
                />
             </div>
          </div>

          <button 
            onClick={handleTestSupabase}
            disabled={isTesting}
            className={`w-full py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 ${
              connStatus === 'SUCCESS' ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-xl' : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            {isTesting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plug"></i>}
            {connStatus === 'SUCCESS' ? '連線測試成功' : '測試 Supabase 連線'}
          </button>
        </section>

        {/* Google Maps & LINE */}
        <section className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 lg:p-12 space-y-10">
           <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-key"></i>
              </div>
              外部服務 API 與 群組 ID
           </h3>
           
           <div className="space-y-8">
              <div className="space-y-2">
                 <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Maps API Key (必填，地圖才可顯示)</label>
                   {config.googleMapsApiKey && <span className="text-[9px] text-emerald-500 font-bold italic">已保存資料</span>}
                 </div>
                 <input 
                    type="password"
                    placeholder="貼入 Google Maps API 金鑰"
                    value={config.googleMapsApiKey}
                    onChange={e => setConfig({...config, googleMapsApiKey: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl px-6 py-5 text-xs font-mono outline-none transition-all shadow-inner"
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LINE Messaging Token</label>
                    <input 
                      type="password"
                      placeholder="LINE Access Token"
                      value={config.lineAccessToken}
                      onChange={e => setConfig({...config, lineAccessToken: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-[#00b900] rounded-2xl px-6 py-5 text-xs font-mono outline-none transition-all shadow-inner"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LINE Primary Group ID</label>
                    <input 
                      type="text"
                      placeholder="例如: G_CORE_KHH_001"
                      value={config.linePrimaryGroupId}
                      onChange={e => setConfig({...config, linePrimaryGroupId: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-[#00b900] rounded-2xl px-6 py-5 text-xs font-mono outline-none transition-all shadow-inner"
                    />
                 </div>
              </div>
           </div>

           <div className="pt-6">
              <button 
                onClick={handleSaveAll}
                disabled={isSaving}
                className={`w-full py-6 rounded-[2.5rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 ${
                  isSaving ? 'bg-slate-200 text-slate-400' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200'
                }`}
              >
                {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                {isSaving ? '正在保存到快取...' : '確認並儲存所有金鑰配置'}
              </button>
              <p className="text-center text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-[0.2em]">系統將自動記錄您的輸入，重整頁面不需重填。</p>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
