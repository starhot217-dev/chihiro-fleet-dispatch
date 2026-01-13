
import React from 'react';

const OperationalRoadmap: React.FC = () => {
  const steps = [
    {
      title: 'Phase 1: LINE Channel 建立',
      desc: '在 LINE Developers 註冊 Messaging API 通道，並取得 Channel Access Token 與 Secret。',
      icon: 'fa-id-card',
      color: 'bg-emerald-500'
    },
    {
      title: 'Phase 2: Webhook 與後端對接',
      desc: '使用 Node.js (Express) 建立 Endpoint。當司機在群組發言，LINE 會將 JSON 推送到此 URL。',
      icon: 'fa-link',
      color: 'bg-indigo-500'
    },
    {
      title: 'Phase 3: Flex Message 樣板設計',
      desc: '利用 LINE Flex Message Simulator 設計美觀的派單卡片，包含按鈕、地址連結與地圖截圖。',
      icon: 'fa-palette',
      color: 'bg-rose-500'
    },
    {
      title: 'Phase 4: 智慧指令解析引擎',
      desc: '開發 Regex 引擎解析司機回覆。如偵測到「接 + ID」，自動調用資料庫 Transaction 鎖單。',
      icon: 'fa-brain',
      color: 'bg-amber-500'
    },
    {
      title: 'Phase 5: 全域狀態推播',
      desc: '使用 WebSocket 將接單結果同步到所有管理員的 Dashboard，實現零延遲的地圖跳動。',
      icon: 'fa-bolt',
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="p-4 lg:p-10 max-w-5xl mx-auto space-y-12">
      <header className="text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">千尋 LINE 機器人實作藍圖</h2>
        <p className="text-slate-500 font-medium mt-2">如何將模擬器轉化為生產級自動化系統</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className={`w-14 h-14 ${step.color} text-white rounded-2xl flex items-center justify-center text-xl mb-6 shadow-lg shadow-current/20`}>
               <i className={`fas ${step.icon}`}></i>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">{step.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div>
              <h3 className="text-2xl font-black mb-2">準備好進入下一步了嗎？</h3>
              <p className="text-slate-400 text-sm font-medium">我們可以根據這套邏輯，為您產出完整的後端 Node.js API 實作範例。</p>
           </div>
           <button className="bg-[#00b900] px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-900/40 hover:scale-105 transition-transform active:scale-95">
              取得實作代碼 (Backend) <i className="fas fa-code ml-2"></i>
           </button>
        </div>
      </div>
    </div>
  );
};

export default OperationalRoadmap;
