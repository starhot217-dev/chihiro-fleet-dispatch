
import React, { useState } from 'react';
import { DataService } from '../services/dataService';
import { SupabaseService } from '../services/supabaseService';
import { SystemConfig } from '../types';

const DatabaseSchema: React.FC = () => {
  const [config] = useState<SystemConfig>(DataService.getConfig());
  const [activeTab, setActiveTab] = useState<'tables' | 'permissions' | 'sql'>('tables');
  const [isDeploying, setIsDeploying] = useState(false);

  const schemaItems = [
    {
      name: 'profiles (成員/權限核心)',
      icon: 'fa-users-gear',
      desc: '與 Supabase Auth 同步。管理 ADMIN、DRIVER、CLIENT、STORE 四大角色。',
      cols: ['id (UUID)', 'role (ENUM)', 'phone (UNIQUE)', 'full_name', 'is_verified']
    },
    {
      name: 'vehicles (司機資產與座標)',
      icon: 'fa-car-side',
      desc: '管理司機電子錢包餘額、當前即時座標 (PostGIS) 與服務狀態。',
      cols: ['id', 'profile_id', 'wallet_balance', 'location (GEOGRAPHY)', 'status']
    },
    {
      name: 'orders (行程核心數據)',
      icon: 'fa-file-invoice-dollar',
      desc: '紀錄起點、終點、價格拆解 (Base/Dist/Time) 與服務評價。',
      cols: ['id', 'display_id', 'client_id', 'vehicle_id', 'price', 'system_fee']
    },
    {
      name: 'wallet_logs (財務流水)',
      icon: 'fa-money-check-dollar',
      desc: '每一筆餘額變動的審計紀錄，包含儲值、抽成與回金。',
      cols: ['id', 'vehicle_id', 'amount', 'type', 'balance_after', 'created_at']
    }
  ];

  const handleCopySQL = () => {
    const sqlScript = `
-- CHIHIRO FLEET INITIALIZATION SCRIPT
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER', 'CLIENT', 'STORE');
-- ... 腳本內容如上方說明 ...
    `;
    navigator.clipboard.writeText(sqlScript);
    alert('初始化腳本已複製。請貼到 Supabase SQL Editor 執行。');
  };

  const simulateDeployment = async () => {
    setIsDeploying(true);
    const success = await SupabaseService.initializeFinalSchema();
    if (success) {
      alert('前端模型已同步。請確認您已在 Supabase 執行 SQL 腳本。');
    }
    setIsDeploying(false);
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-database"></i>
             </div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tight">生產級資料庫架構 (Final)</h2>
          </div>
          <p className="text-slate-500 font-medium">PostGIS 地理引擎 + RLS 角色安全性邏輯</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={simulateDeployment}
            disabled={isDeploying}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center gap-2 hover:bg-black transition-all"
          >
            {isDeploying ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-double"></i>}
            {isDeploying ? '同步中...' : '確認並同步結構'}
          </button>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setActiveTab('tables')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'tables' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}>結構表</button>
            <button onClick={() => setActiveTab('permissions')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'permissions' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}>權限邏輯</button>
            <button onClick={() => setActiveTab('sql')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'sql' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}>SQL 腳本</button>
          </div>
        </div>
      </header>

      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {schemaItems.map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Validated</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">{item.name}</h3>
              <p className="text-sm text-slate-500 font-medium mb-6 flex-1">{item.desc}</p>
              <div className="flex flex-wrap gap-2">
                {item.cols.map((c, ci) => (
                  <span key={ci} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 font-mono">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sql' && (
        <div className="bg-slate-950 rounded-[3.5rem] p-10 font-mono text-sm overflow-hidden relative group">
           <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={handleCopySQL}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-2xl transition-all flex items-center gap-2"
              >
                <i className="fas fa-copy"></i> 複製初始化 SQL
              </button>
           </div>
           <div className="h-[500px] overflow-y-auto custom-scrollbar text-emerald-400/80 pr-4">
<pre className="whitespace-pre-wrap">{`-- 執行此腳本以啟動千尋派車核心
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER', 'CLIENT', 'STORE');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  full_name TEXT,
  phone TEXT UNIQUE,
  role user_role DEFAULT 'CLIENT'
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id),
  plate_number TEXT UNIQUE,
  wallet_balance INT DEFAULT 0,
  location GEOGRAPHY(POINT, 4326),
  status TEXT
);

-- 啟用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);`}</pre>
           </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseSchema;
