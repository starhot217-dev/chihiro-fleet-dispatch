
import React, { useState } from 'react';
import { LineLog, LineGroup } from '../types';

interface LineAutomationProps {
  logs: LineLog[];
  groups: LineGroup[];
  onSendMessage: (msg: string, groupName: string, isManual?: boolean) => void;
  onRunAutoTest?: () => void;
}

const LineAutomation: React.FC<LineAutomationProps> = ({ logs, groups, onSendMessage, onRunAutoTest }) => {
  const [activeGroup, setActiveGroup] = useState<string>(groups[0]?.name || '高雄核心司機大群');
  const [inputText, setInputText] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);

  const filteredLogs = logs.filter(log => log.groupName === activeGroup || log.groupName === 'SYSTEM');

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText, activeGroup, isManualMode);
    setInputText('');
  };

  const extractOrderId = (message: string) => {
    const match = message.match(/ORD-(?:TEST-)?\d+/i);
    return match ? match[0] : null;
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 ${isManualMode ? 'bg-[#1a2b3c]' : 'bg-[#f4f7f6]'}`}>
      {/* LINE Header */}
      <div className={`p-4 text-white shadow-md relative z-20 transition-colors duration-500 ${isManualMode ? 'bg-slate-800 border-b border-white/10' : 'bg-[#00b900]'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <i className={`fab fa-line text-2xl ${isManualMode ? 'text-rose-400' : 'text-white'}`}></i>
            <div>
              <h3 className="font-black text-sm tracking-tight">{isManualMode ? '人工對接模式' : 'LINE Dispatcher Bot'}</h3>
              <p className="text-[8px] font-bold opacity-60 uppercase">{activeGroup}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsManualMode(!isManualMode)}
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all flex items-center gap-1 border ${
                isManualMode 
                ? 'bg-rose-500 border-rose-400 text-white animate-pulse' 
                : 'bg-black/20 border-white/20 text-white hover:bg-black/30'
              }`}
            >
              <i className={`fas ${isManualMode ? 'fa-user-tie' : 'fa-headset'}`}></i>
              {isManualMode ? '手動干預中' : '機器人自動'}
            </button>
            <button 
              onClick={onRunAutoTest}
              className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-white/10 transition-all flex items-center gap-1"
            >
              <i className="fas fa-play text-[7px]"></i>
            </button>
          </div>
        </div>
        
        {/* Group Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {groups.map(g => (
            <button 
              key={g.id}
              onClick={() => setActiveGroup(g.name)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${
                activeGroup === g.name 
                  ? (isManualMode ? 'bg-rose-500 text-white' : 'bg-white text-[#00b900]') 
                  : 'bg-black/10 text-white/50 hover:text-white'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar transition-colors ${isManualMode ? 'bg-slate-900/40' : 'bg-[#8cabd9]/10'}`}>
        {filteredLogs.map((log) => (
          <div key={log.id} className={`flex flex-col ${log.type === 'OUTGOING' ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-2 duration-300`}>
            <span className={`text-[9px] font-bold mb-1 px-1 ${isManualMode ? 'text-slate-400' : 'text-slate-500/60'}`}>
              {log.senderName || (log.type === 'OUTGOING' ? '系統機器人' : '匿名司機')} • {log.timestamp}
            </span>
            
            {log.isFlexMessage ? (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden w-[88%] transform transition-transform hover:scale-[1.02]">
                <div className="bg-slate-900 p-3 flex justify-between items-center">
                  <p className="text-[10px] font-black tracking-widest text-rose-500 uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                    系統新訂單 (長途)
                  </p>
                  <i className="fas fa-chevron-right text-slate-600 text-[10px]"></i>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[13px] font-black text-slate-800 leading-snug">{log.message.split('\n\n')[0]}</p>
                    <p className="text-[11px] font-bold text-rose-600">{log.message.split('\n\n')[1]?.replace('請回覆', '📝 請回覆')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    <button className="py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black text-center border border-slate-100 hover:bg-slate-100 transition-colors">
                      查看詳細
                    </button>
                    <button 
                      onClick={() => {
                        const oid = extractOrderId(log.message);
                        if (oid) onSendMessage(`接 ${oid}`, activeGroup);
                      }}
                      className="py-2.5 bg-[#00b900] text-white rounded-xl text-[10px] font-black text-center shadow-md shadow-emerald-100 hover:bg-[#009e00] active:scale-95 transition-all"
                    >
                      我要接單
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                log.type === 'OUTGOING' 
                  ? (log.senderName === '人工調度員' 
                      ? 'bg-rose-600 text-white rounded-tl-none border border-rose-500' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-100') 
                  : (isManualMode ? 'bg-slate-700 text-white rounded-tr-none' : 'bg-[#8de08d] text-slate-800 rounded-tr-none')
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{log.message}</p>
              </div>
            )}
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 opacity-40">
            <i className="fab fa-line text-5xl"></i>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for Messaging...</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t transition-colors ${isManualMode ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isManualMode ? "以管理員身份輸入訊息..." : "模擬司機回覆: 接 ORD-XXX"}
              className={`w-full rounded-full px-5 py-3 text-xs outline-none transition-all ${
                isManualMode 
                ? 'bg-slate-700 text-white placeholder-slate-500 ring-rose-500 ring-1' 
                : 'bg-slate-100 text-slate-800 focus:ring-2 ring-[#00b900]'
              }`}
            />
          </div>
          <button 
            onClick={handleSend}
            className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg ${
              isManualMode ? 'bg-rose-600 text-white' : 'bg-[#00b900] text-white'
            }`}
          >
            <i className={`fas ${isManualMode ? 'fa-paper-plane' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
        {isManualMode && (
          <p className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest text-center mt-2 animate-pulse">
            MANUAL OVERRIDE ACTIVE
          </p>
        )}
      </div>
    </div>
  );
};

export default LineAutomation;
