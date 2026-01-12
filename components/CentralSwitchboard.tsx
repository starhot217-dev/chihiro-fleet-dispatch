
import React, { useState, useRef, useEffect } from 'react';
import { startSwitchboardChat } from '../services/geminiService';
import { Order, Vehicle } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
      content: '你好，我是千尋智能總機。我已載入目前的營運數據，今天有什麼可以協助你的嗎？',
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  // 初始化聊天 Session
  useEffect(() => {
    const context = {
      activeOrdersCount: orders.length,
      onlineVehiclesCount: vehicles.filter(v => v.status !== 'OFFLINE').length,
      pendingOrdersCount: orders.filter(o => o.status === 'PENDING').length,
    };
    chatSessionRef.current = startSwitchboardChat(context);
  }, [orders, vehicles]);

  // 自動捲動
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
      
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      }]);

      for await (const chunk of result) {
        assistantContent += chunk.text;
        setMessages(prev => prev.map(m => 
          m.id === assistantMsgId ? { ...m, content: assistantContent } : m
        ));
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: '抱歉，我的連結似乎出現了一點問題。請稍後再試。',
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    "目前營運壓力如何？",
    "建議調整高雄地區費率嗎？",
    "幫我總結目前的司機狀態",
    "如何提升長途單接單率？"
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl shadow-xl shadow-slate-200">
            <i className="fas fa-headset"></i>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">中央智能總機</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              AI Core Online
            </p>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase">
            Model: Gemini 3 Flash
          </div>
        </div>
      </div>

      {/* Chat Space */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
          >
            <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`
                p-5 rounded-[2rem] text-sm md:text-base leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none shadow-2xl shadow-slate-200' 
                  : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'}
              `}>
                {msg.content || <div className="flex gap-1.5 py-1"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div></div>}
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-2 px-2">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length-1].role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 md:p-10 bg-white border-t border-slate-100 shrink-0">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {quickActions.map((action, i) => (
              <button 
                key={i}
                onClick={() => setInput(action)}
                className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 rounded-full text-xs font-bold text-slate-500 transition-all active:scale-95"
              >
                {action}
              </button>
            ))}
          </div>

          <div className="relative group">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="請輸入調度問題或指令..."
              className="w-full bg-slate-100 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-3xl pl-6 pr-20 py-5 text-sm md:text-base font-bold outline-none transition-all shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`
                absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all
                ${input.trim() && !isTyping ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
              `}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Chihiro AI Hub v4.0 • Secure Communication Link
          </p>
        </div>
      </div>
    </div>
  );
};

export default CentralSwitchboard;
