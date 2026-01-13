
import React, { useState, useEffect } from 'react';
import { FAQItem } from '../types';
import { DataService } from '../services/dataService';

const CustomerService: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [selectedFaq, setSelectedFaq] = useState<FAQItem | null>(null);

  useEffect(() => {
    setFaqs(DataService.getFaqs());
  }, []);

  const handleFaqClick = (faq: FAQItem) => {
    DataService.recordFaqClick(faq.id);
    setSelectedFaq(faq);
    setFaqs(DataService.getFaqs()); // 重新排序
  };

  return (
    <div className="p-4 lg:p-10 space-y-10 animate-in fade-in duration-700 max-w-6xl mx-auto">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">智能客服中心</h2>
          <p className="text-slate-500 font-medium mt-1 italic">點擊率最高的問題將自動排在第一位</p>
        </div>
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-rose-50">
           <i className="fas fa-headset"></i>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 常見問題列表 */}
        <div className="lg:col-span-5 space-y-4">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">熱門 FAQ 快速鏈結</h3>
           <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <button 
                  key={faq.id}
                  onClick={() => handleFaqClick(faq)}
                  className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${
                    selectedFaq?.id === faq.id ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-50 hover:border-rose-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                     {idx === 0 && <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter animate-pulse">Hot</span>}
                     <span className="font-bold text-sm truncate">{faq.question}</span>
                  </div>
                  <i className={`fas fa-chevron-right text-xs transition-transform ${selectedFaq?.id === faq.id ? 'translate-x-1 text-rose-500' : 'text-slate-200'}`}></i>
                </button>
              ))}
           </div>
        </div>

        {/* 答案展示區 */}
        <div className="lg:col-span-7">
           {selectedFaq ? (
              <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-slate-100 min-h-[400px] flex flex-col animate-in zoom-in-95">
                 <div className="flex-1 space-y-8">
                    <div className="space-y-2">
                       <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Question</span>
                       <h4 className="text-3xl font-black text-slate-800 leading-tight">{selectedFaq.question}</h4>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="space-y-4">
                       <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Answer</span>
                       <p className="text-slate-600 text-lg leading-relaxed font-medium">{selectedFaq.answer}</p>
                    </div>
                 </div>
                 <div className="mt-12 p-6 bg-slate-50 rounded-3xl flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400">此問題已協助過 {selectedFaq.clickCount} 位用戶</p>
                    <div className="flex gap-2">
                       <button className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors"><i className="fas fa-thumbs-up"></i></button>
                       <button className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><i className="fas fa-thumbs-down"></i></button>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="bg-slate-100/50 rounded-[3.5rem] border-4 border-dashed border-slate-200 h-[400px] flex flex-col items-center justify-center text-center p-12 grayscale opacity-40">
                 <i className="fas fa-comment-dots text-5xl mb-6"></i>
                 <h4 className="text-xl font-black text-slate-400">點擊左側問題查看解答</h4>
                 <p className="text-sm font-medium mt-2">系統會根據您的操作習慣優化介面</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CustomerService;
