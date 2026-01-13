
import React from 'react';

const DatabaseSchema: React.FC = () => {
  const tables = [
    {
      name: 'drivers (司機主表)',
      description: '儲存司機基本資料與實時地理位置',
      columns: [
        { name: 'id', type: 'UUID', desc: '主鍵' },
        { name: 'wallet_balance', type: 'INT', desc: '電子錢包餘額 (百回扣款用)' },
        { name: 'current_location', type: 'GEOGRAPHY', desc: 'PostGIS 地理位置點' },
        { name: 'status', type: 'VARCHAR', desc: 'IDLE, BUSY, OFFLINE' }
      ],
      sql: `-- 啟用 PostGIS 擴充
CREATE EXTENSION postgis;

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  wallet_balance INT DEFAULT 0,
  current_location GEOGRAPHY(POINT, 4326),
  last_online TIMESTAMPTZ
);

-- 建立地理空間索引 (提升搜尋附近司機的速度)
CREATE INDEX idx_drivers_location ON drivers USING GIST(current_location);`
    },
    {
      name: 'orders (訂單交易表)',
      description: '完整的行程紀錄與財務數據',
      columns: [
        { name: 'id', type: 'UUID', desc: '主鍵' },
        { name: 'pickup_addr', type: 'TEXT', desc: '上車文字地址' },
        { name: 'system_fee', type: 'INT', desc: '百回抽成 (15%)' },
        { name: 'store_kickback', type: 'INT', desc: '店家回扣金額' }
      ],
      sql: `CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_id VARCHAR(20),
  driver_id UUID REFERENCES drivers(id),
  pickup_addr TEXT,
  dest_addr TEXT,
  total_price INT,
  system_fee INT,
  store_id UUID REFERENCES stores(id),
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
    }
  ];

  return (
    <div className="p-4 lg:p-10 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="mb-10 text-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">後端資料庫實作架構</h2>
        <p className="text-slate-500 font-medium text-lg">PostgreSQL + PostGIS 專業調度引擎</p>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {tables.map((table, i) => (
          <div key={i} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:flex-row h-full">
            <div className="lg:w-1/3 p-10 bg-slate-50 border-r border-slate-100">
               <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center text-2xl mb-6 shadow-xl">
                 <i className="fas fa-database"></i>
               </div>
               <h3 className="text-2xl font-black text-slate-800 mb-4">{table.name}</h3>
               <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">{table.description}</p>
               <div className="space-y-4">
                  {table.columns.map((col, ci) => (
                    <div key={ci} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                       <code className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded">{col.name}</code>
                       <span className="text-[10px] text-slate-400 font-bold uppercase">{col.type}</span>
                    </div>
                  ))}
               </div>
            </div>
            <div className="lg:w-2/3 bg-slate-900 p-10 flex flex-col">
               <div className="flex justify-between items-center mb-6">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PostgreSQL DDL Code</span>
                 <button className="text-slate-500 hover:text-white transition-colors">
                   <i className="fas fa-copy"></i>
                 </button>
               </div>
               <pre className="text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto flex-1 custom-scrollbar">
                 {table.sql}
               </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatabaseSchema;
