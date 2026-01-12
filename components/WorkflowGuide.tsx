
import React from 'react';

interface WorkflowGuideProps {
  setActiveTab: (tab: string) => void;
  onDownload: () => void;
}

const WorkflowGuide: React.FC<WorkflowGuideProps> = ({ setActiveTab, onDownload }) => {
  const steps = [
    {
      title: '1. 客戶發起請求',
      desc: '客戶透過 Web App 或 LINE 傳送叫車需求。目的地可選填，系統會產生唯一的日期流水序號。',
      icon: 'fa-mobile-screen-button',
      tag: 'ENTRY'
    },
    {
      title: '2. 機器人自動派單',
      desc: '調度中心啟動機器人廣播。系統將訂單詳情推送到指定的司機 LINE 群組，等待司機承接。',
      icon: 'fa-robot',
      tag: 'DISPATCH'
    },
    {
      title: '3. 司機搶單確認',
      desc: '司機回覆「接」關鍵字。系統鎖單後，自動產生包含「駕駛、車色、車號」的千尋標準格式回報。',
      icon: 'fa-lock',
      tag: 'LOCKING'
    },
    {
      title: '4. 行程啟動計費',
      desc: '司機抵達乘客點，於模擬終端輸入目的地。系統串接 Google Maps 路由並動態計算最終車資。',
      icon: 'fa-steering-wheel',
      tag: 'EXECUTION'
    },
    {
      title: '5. 完成任務結帳',
      desc: '行程結束，系統自動從司機錢包扣除 15% 佣金，並即時產出報表供後台對帳。',
      icon: 'fa-file-invoice-dollar',
      tag: 'FINANCE'
    }
  ];

  return (
    <div className="p-4 lg:p-10 space-y-8 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">Chihiro 派車系統全自動化流程</h2>
          <p className="text-slate-500 font-medium mt-2">理解數據如何從叫車端流向財務結算</p>
        </div>

        <div className="relative">
          {/* Vertical line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-slate-100 -translate-x-1/2"></div>
          
          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 w-full">
                  <div className={`bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl group ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full mb-4 inline-block">Step 0{i+1} • {step.tag}</span>
                    <h3 className="text-xl font-black text-slate-800 mb-3">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center text-xl shadow-2xl shadow-slate-200 transform transition-transform group-hover:scale-110">
                    <i className={`fas ${step.icon}`}></i>
                  </div>
                </div>
                
                <div className="flex-1 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 p-10 bg-emerald-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-emerald-100">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black mb-2">準備好體驗完整流程了嗎？</h3>
            <p className="text-emerald-100 text-sm font-medium">您可以直接進入叫車模擬，或下載我們的技術規格說明。</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={onDownload}
              className="bg-white/20 hover:bg-white/30 px-6 py-4 rounded-2xl font-bold transition-all border border-white/20 text-xs text-center"
            >
              下載流程白皮書
            </button>
            <button 
              onClick={() => setActiveTab('client')}
              className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all text-xs text-center"
            >
              立即開始叫車
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowGuide;
