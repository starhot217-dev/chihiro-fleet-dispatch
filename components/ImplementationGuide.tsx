
import React, { useState } from 'react';

const ImplementationGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Step 1: 順序派遣與逾時懲罰',
      desc: '15秒內指派單一司機。',
      content: `
/**
 * 核心派遣規則 (Sequential Dispatch):
 * 1. 系統掃描 15 分鐘路網內 IDLE 司機。
 * 2. 鎖定單一司機發出推播，啟動 15s 倒數。
 * 3. 逾時未接：記錄該司機 missed_count + 1，並遞歸尋找下一位。
 * 4. 懲罰機制：若 missed_count >= 3，設定 suspended_until 為 2 小時後。
 */

// 後端背景監控腳本
async function monitorDispatchTimeout() {
  const pendingDispatches = await db.orders.find({ status: 'DISPATCHING' });
  for (const order of pendingDispatches) {
    if (order.countdown <= 0) {
      await penalizeDriver(order.target_driver_id);
      await dispatchToNextAvailable(order.id);
    }
  }
}
      `
    },
    {
      title: 'Step 2: 等待費跳表邏輯',
      desc: '抵達 5 分鐘後自動加收。',
      content: `
/**
 * 流程：
 * 1. 司機按下「已到達」，狀態變更為 WAITING_PASSENGER。
 * 2. 啟動 300s 倒數。
 * 3. 當 countdown < 0，每過 60s 累計一次等待費 (waiting_fee += 10)。
 * 4. 結單時，總金額 = 原始價格 + 等待費。
 */

// 前端計時模擬
if (countdown < 0 && Math.abs(countdown) % 60 === 0) {
  order.waitingFee += pricing.waitingFeePerMin;
}
      `
    }
  ];

  return (
    <div className="p-4 lg:p-10 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Advanced</div>
             <h2 className="text-4xl font-black text-slate-800 tracking-tight italic">派遣與懲罰邏輯 Manifest</h2>
          </div>
          <p className="text-slate-500 font-medium text-lg">順序指派 (15s) | 等客超時跳表 | 遺漏停權機制</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-4">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-full text-left p-6 rounded-[2.5rem] transition-all duration-300 border-2 ${
                activeStep === index ? 'bg-white border-rose-600 shadow-2xl scale-[1.02]' : 'bg-slate-50 border-transparent text-slate-400'
              }`}
            >
              <h3 className={`font-black text-base ${activeStep === index ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</h3>
              <p className="text-[10px] font-bold uppercase mt-1">{step.desc}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8">
          <div className="bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col h-[550px] border border-white/5">
            <div className="flex bg-slate-800 p-5 items-center justify-between border-b border-white/5">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Technical-logic.sql</span>
            </div>
            <div className="flex-1 p-10 overflow-auto custom-scrollbar bg-[#0d1117] font-mono text-sm leading-relaxed text-emerald-400">
               <pre className="whitespace-pre-wrap">{steps[activeStep].content}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImplementationGuide;
