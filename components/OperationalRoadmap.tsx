import React from 'react';

const OperationalRoadmap: React.FC = () => {
  const steps = [
    {
      title: 'DB Schema 設計',
      desc: '設計 PostgreSQL 結構，包含 Orders、Drivers、Transactions 三大核心表，確保財務追蹤。',
      icon: 'fa-database',
      color: 'bg-indigo-500'
    },
    {
      title: 'Realtime WebSocket',
      desc: '建立 Socket.io Server。當訂單狀態變更時，自動推播至司機手機 App 與調度後台。',
      icon: 'fa-bolt',
      color: 'bg-amber-500'
    },
    {
      title: 'LINE Messaging API',
      desc: '申請正式 LINE 官方帳號並綁定 Webhook，實現真正的自動派單與關鍵字回覆。',
      icon: 'fa-robot',
      color: 'bg-emerald-500'
    },
    {
      title: '身份驗證 (Auth)',
      desc: '導入 Firebase 或 Supabase Auth，區分管理員、調度員與司機權限。',
      icon: 'fa-shield-halved',
      color: 'bg-rose-500'
    }
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">正式營運技術路線圖</h2>
          <p className="text-slate-500 font-medium mt-1">從原型開發邁向生產級派車系統</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center text-white text-xl mb-6 shadow-lg shadow-current/20`}>
                <i className={`fas ${step.icon}`}></i>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Phase {i + 1}</span>
                <div className="flex-1 h-px bg-slate-100"></div>
                <i className="fas fa-chevron-right text-[8px]"></i>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black mb-2">準備好串接後端了嗎？</h3>
              <p className="text-slate-400 text-sm font-medium">我可以為您產生更詳細的 API 文件或資料庫 SQL 結構定義。</p>
            </div>
            <button className="bg-rose-600 px-8 py-4 rounded-2xl font-black shadow-xl shadow-rose-900/20 hover:scale-105 transition-transform active:scale-95">
              取得 API 開發文檔 <i className="fas fa-file-code ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalRoadmap;