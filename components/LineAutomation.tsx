
import React, { useState, useEffect, useRef } from 'react';
import { LineLog, LineGroup } from '../types';

interface LineAutomationProps {
  logs: LineLog[];
  groups: LineGroup[];
  onSendMessage: (msg: string, groupName: string, isManual?: boolean) => void;
}

const LineAutomation: React.FC<LineAutomationProps> = ({ logs, groups, onSendMessage }) => {
  const [activeGroup, setActiveGroup] = useState<string>(groups[0]?.name || '高雄核心司機大群');
  const [inputText, setInputText] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText, activeGroup, isManualMode);
    setInputText('');
  };

  const filteredLogs = logs.filter(l => l.groupName === activeGroup);

  return (
    <div className="flex flex-col h-full bg-[#8cabd9]/20">
      {/* LINE Header */}
      <div className="bg-[#00b900] p-4 text-white shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <i className="fab fa-line text-2xl"></i>
            <div>
              <h3 className="font-black text-sm tracking-tight">群組廣播預覽 (Dispatcher)</h3>
              <p className="text-[9px] font-bold opacity-75 uppercase">{activeGroup}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsManualMode(!isManualMode)}
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all border ${
                isManualMode ? 'bg-rose-500 border-rose-400' : 'bg-black/20 border-white/20'
              }`}
            >
              {isManualMode ? '手動干預中' : '自動機器人'}
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {groups.map(g => (
            <button 
              key={g.id}
              onClick={() => setActiveGroup(g.name)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
                activeGroup === g.name ? 'bg-white text-[#00b900]' : 'bg-black/10 text-white/60'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {filteredLogs.map((log) => (
          <div key={log.id} className={`flex flex-col ${log.type === 'OUTGOING' ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-2`}>
            <div className="flex items-center gap-2 mb-1 px-1">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{log.senderName}</span>
               <span className="text-[8px] text-slate-300 font-bold">{log.timestamp}</span>
            </div>
            
            {log.isFlexMessage ? (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden w-[85%] max-w-sm">
                <div className="bg-slate-900 p-4 flex justify-between items-center">
                  <p className="text-[10px] font-black text-rose-500 tracking-widest uppercase">✨ 系統新訂單廣播</p>
                  <i className="fas fa-taxi text-slate-700"></i>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm font-black text-slate-800 leading-relaxed whitespace-pre-wrap">{log.message.split('\n\n')[0]}</p>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <p className="text-[10px] font-black text-rose-600 uppercase mb-1">操作指令</p>
                    <p className="text-[11px] font-bold text-slate-700 italic">請回覆：接 {log.message.split('接 ')[1]}</p>
                  </div>
                  <button 
                    onClick={() => onSendMessage(`接 ${log.message.split('接 ')[1]}`, activeGroup)}
                    className="w-full py-3 bg-[#00b900] text-white rounded-2xl font-black text-xs shadow-md active:scale-95 transition-all"
                  >
                    模擬司機搶單
                  </button>
                </div>
              </div>
            ) : (
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
                log.type === 'OUTGOING' 
                ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100' 
                : 'bg-[#8de08d] text-slate-900 rounded-tr-none'
              }`}>
                <p className="font-medium whitespace-pre-wrap">{log.message}</p>
              </div>
            )}
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
             <i className="fab fa-line text-6xl mb-4"></i>
             <p className="text-[10px] font-black uppercase tracking-widest">等待訊息串接...</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={isManualMode ? "以管理員身份發言..." : "輸入文字測試 (例: 接 ORD-101)"}
            className="flex-1 bg-slate-100 border-2 border-transparent focus:border-[#00b900] rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all"
          />
          <button 
            onClick={handleSend}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg active:scale-90 ${
              isManualMode ? 'bg-rose-600 shadow-rose-200' : 'bg-[#00b900] shadow-emerald-200'
            }`}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineAutomation;
