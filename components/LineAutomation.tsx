
import React, { useState } from 'react';
import { LineLog } from '../types';

interface LineAutomationProps {
  logs: LineLog[];
  onSendMessage: (msg: string) => void;
}

const LineAutomation: React.FC<LineAutomationProps> = ({ logs, onSendMessage }) => {
  const [inputText, setInputText] = useState('');

  return (
    <div className="flex flex-col h-full bg-[#f4f7f6]">
      <div className="bg-[#00b900] p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <i className="fab fa-line text-2xl"></i>
          <h3 className="font-bold">LINE 派遣機器人 (模擬器)</h3>
        </div>
        <div className="text-xs bg-black/20 px-2 py-1 rounded">Webhook: Active</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className={`flex ${log.type === 'OUTGOING' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
              log.type === 'OUTGOING' 
                ? 'bg-[#8de08d] text-slate-800 rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none'
            }`}>
              <div className="text-[10px] opacity-50 mb-1 flex justify-between gap-4">
                <span className="font-bold">{log.groupName}</span>
                <span>{log.timestamp}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{log.message}</p>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center text-slate-400 mt-20 italic">
            目前尚無自動化通訊紀錄
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (onSendMessage(inputText), setInputText(''))}
            placeholder="模擬司機回覆或輸入關鍵字..."
            className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 ring-indigo-500"
          />
          <button 
            onClick={() => { onSendMessage(inputText); setInputText(''); }}
            className="w-10 h-10 bg-[#00b900] text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineAutomation;
