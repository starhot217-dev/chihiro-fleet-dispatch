import React from 'react';

const DatabaseSchema: React.FC = () => {
  const tables = [
    {
      name: 'drivers',
      description: '司機基本資料與即時狀態',
      columns: [
        { name: 'id', type: 'UUID', desc: '主鍵 (Primary Key)' },
        { name: 'name', type: 'VARCHAR(50)', desc: '司機姓名' },
        { name: 'phone', type: 'VARCHAR(20)', desc: '聯絡電話 (唯一值)' },
        { name: 'wallet_balance', type: 'DECIMAL', desc: '目前的儲值金餘額' },
        { name: 'status', type: 'ENUM', desc: 'IDLE, BUSY, OFFLINE' },
        { name: 'current_lat/lng', type: 'FLOAT8', desc: '最後回傳位置' }
      ],
      sql: `CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  wallet_balance DECIMAL(12,2) DEFAULT 0.00,
  status driver_status DEFAULT 'OFFLINE',
  last_location GEOGRAPHY(POINT)
);`
    },
    {
      name: 'orders',
      description: '所有派遣與叫車任務紀錄',
      columns: [
        { name: 'id', type: 'UUID', desc: '主鍵' },
        { name: 'driver_id', type: 'UUID', desc: '關聯 drivers.id (外鍵)' },
        { name: 'pickup_addr', type: 'TEXT', desc: '上車詳細地址' },
        { name: 'dest_addr', type: 'TEXT', desc: '下車詳細地址' },
        { name: 'fare', type: 'INTEGER', desc: '乘客支付總額' },
        { name: 'commission', type: 'INTEGER', desc: '系統抽成金額' },
        { name: 'status', type: 'ENUM', desc: '任務流程狀態' }
      ],
      sql: `CREATE TABLE orders (
  id UUID PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id),
  pickup_addr TEXT NOT NULL,
  dest_addr TEXT NOT NULL,
  fare INT NOT NULL,
  commission INT NOT NULL,
  status order_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
    },
    {
      name: 'wallet_logs',
      description: '金流流水帳 (不可修改，僅供對帳)',
      columns: [
        { name: 'id', type: 'BIGINT', desc: '流水號' },
        { name: 'driver_id', type: 'UUID', desc: '司機 ID' },
        { name: 'amount', type: 'DECIMAL', desc: '變動金額 (正值儲值, 負值抽成)' },
        { name: 'type', type: 'VARCHAR', desc: 'TOPUP, COMMISSION, REFUND' },
        { name: 'reference_id', type: 'UUID', desc: '對應的訂單 ID' }
      ],
      sql: `CREATE TABLE wallet_logs (
  id BIGSERIAL PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id),
  amount DECIMAL(12,2) NOT NULL,
  log_type VARCHAR(20),
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
    }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">資料庫 Schema 設計</h2>
            <p className="text-slate-500 font-medium mt-1">基於 PostgreSQL 的營運級數據架構</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-indigo-200">
              ACID Compliant
            </span>
            <span className="bg-rose-100 text-rose-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-rose-200">
              PostGIS Ready
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tables.map((table, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl">
                    <i className="fas fa-table"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{table.name}</h3>
                    <p className="text-slate-400 text-xs font-bold">{table.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {table.columns.map((col, ci) => (
                    <div key={ci} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <code className="text-rose-600 font-black text-xs bg-rose-50 px-2 py-0.5 rounded">{col.name}</code>
                        <span className="text-[10px] text-slate-400 font-mono">{col.type}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{col.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 p-6 flex-1">
                <div className="flex justify-between items-center mb-4">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DDL SQL 語法</p>
                   <button className="text-slate-400 hover:text-white transition-colors">
                     <i className="fas fa-copy text-xs"></i>
                   </button>
                </div>
                <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                  {table.sql}
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">
                <i className="fas fa-key"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black">為什麼選擇 PostgreSQL + PostGIS?</h3>
                <p className="text-indigo-100 text-sm mt-2 leading-relaxed max-w-2xl">
                  派車系統核心是「地理位置」。PostGIS 讓你能執行高效的經緯度查詢，例如：「尋找方圓 3 公里內在線的司機」，這在正式營運中是調度邏輯的關鍵。
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">錢包一致性</p>
                <p className="text-xs">使用資料庫事務 (Transactions) 確保扣款與訂單建立同時成功。</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">高併發處理</p>
                <p className="text-xs">針對司機搶單行為，利用 Row-Level Locking 避免重複派單。</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">索引優化</p>
                <p className="text-xs">針對 phone 與 status 建立索引，大幅提升高負載時的查詢速度。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchema;