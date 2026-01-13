
import React, { useState, useRef, useEffect } from 'react';
import { startSwitchboardChat } from '../services/geminiService';
import { Order, Vehicle } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  groundingLinks?: { title: string; uri: string }[];
}

interface CentralSwitchboardProps {
  orders: Order[];
  vehicles: Vehicle[];
}

const CentralSwitchboard: React.FC<CentralSwitchboardProps> = ({ orders, vehicles }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好，我是千尋智能總機。我已連接 Google Maps 與即時調度資料庫，今天想查詢哪裡的訂單或周邊資訊？',
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  // 初始化對話，僅在重要統計數據發生較大變化時重置，而非每秒
  useEffect(() => {
    // 只有當 session 不存在，或這是一個全新的組件實例時初始化
    if (!chatSessionRef.current) {
      const context = {
        activeOrdersCount: orders.length,
        onlineVehiclesCount: vehicles.filter(v => v.status !== 'OFFLINE').length,
        recentOrders: orders.slice(0, 3).map(o => ({ id: o.displayId, pickup: o.pickup }))
      };
      chatSessionRef.current = startSwitchboardChat(context);
    }
  }, []); // 僅執行一次，保持對話連續性

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessageStream({ message: input });
      const assistantMsgId = (Date.now() + 1).toString();
      let assistantContent = '';
      let groundingChunks: any[] = [];
      
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      }]);

      for await (const chunk of result) {
        assistantContent += chunk.text || '';
        
        // 嘗試提取地圖驗證元數據 (Grounding Metadata)
        const metadata = (chunk as any).candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks) {
          groundingChunks = metadata.groundingChunks;
        }

        setMessages(prev => prev.map(m => 
          m.id === assistantMsgId ? { 
            ...m, 
            content: assistantContent,
            groundingLinks: groundingChunks.map(c => ({
              title: c.maps?.title || c.web?.title || '查看地圖位置',
              uri: c.maps?.uri || c.web?.uri || '#'
            }))
          } : m
        ));
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: '抱歉，地圖通訊似乎受到干擾 (429/Quota)。請確認 API 額度或稍後再試。',
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-xl shadow-rose-200">
            <i className="fas fa-map-location-dot"></i>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">智能地圖總機</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Google Maps Grounding
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
            <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-5 rounded-[2rem] text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
              }`}>
                {msg.content}
                
                {/* 地圖引證連結 */}
                {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">參考地圖資訊：</p>
                    {msg.groundingLinks.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-rose-300 transition-all group"
                      >
                        <i className="fas fa-location-arrow text-rose-500 group-hover:scale-110 transition-transform"></i>
                        <span className="text-xs font-bold text-slate-600 truncate">{link.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-2 px-2">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-full border border-slate-100 shadow-sm flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 md:p-10 bg-white border-t border-slate-100 shrink-0">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="relative group">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="例如：幫我找高雄鳳山區評價最好的洗車場？"
              className="w-full bg-slate-100 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-3xl pl-6 pr-20 py-5 text-sm font-bold outline-none transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                input.trim() && !isTyping ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'
              }`}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralSwitchboard;
