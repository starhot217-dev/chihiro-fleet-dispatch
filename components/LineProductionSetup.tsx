
import React, { useState } from 'react';

const LineProductionSetup: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'server' | 'env' | 'flex'>('server');

  const serverCode = `const express = require('express');
const line = require('@line/bot-sdk');
const app = express();

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_SECRET,
};

// 處理 Webhook
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return null;

  const msg = event.message.text.trim();
  
  // 核心邏輯：司機搶單解析
  if (msg.startsWith('接')) {
    const orderId = msg.split(' ')[1];
    
    // 這裡應調用您的 API 更新資料庫
    const success = await updateOrderToDb(orderId, event.source.userId);
    
    if (success) {
      return line.client.replyMessage(event.replyToken, {
        type: 'text',
        text: \`【千尋回報】✅ 訂單 \${orderId} 已成功承接！\`
      });
    }
  }
}

app.listen(3000, () => console.log('LINE Bot 伺服器啟動中...'));`;

  const envCode = `LINE_ACCESS_TOKEN=你的通道密鑰
LINE_SECRET=你的通道密碼
DATABASE_URL=PostgreSQL_連線字串
API_KEY=Gemini_或_Google_地圖金鑰`;

  const flexCode = `{
  "type": "bubble",
  "header": {
    "type": "box",
    "layout": "vertical",
    "contents": [{ "type": "text", "text": "🔔 新派遣任務", "weight": "bold", "color": "#e11d48" }]
  },
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      { "type": "text", "text": "📍 上車：高雄市苓雅區中正二路", "size": "sm" },
      { "type": "text", "text": "💰 預估：$450", "weight": "bold", "size": "xl", "margin": "md" }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "button",
        "action": { "type": "message", "label": "立即搶單", "text": "接 ORD-101" },
        "style": "primary",
        "color": "#e11d48"
      }
    ]
  }
}`;

  return (
    <div className="p-4 lg:p-10 space-y-10 animate-in fade-in duration-700 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">生產環境部署指南</h2>
          <p className="text-slate-500 font-medium mt-1">將您的派車系統正式連接到 LINE 官方平台</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase border border-emerald-200">Production Ready</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 步驟導航 */}
        <div className="lg:col-span-4 space-y-6">
           {[
             { step: '01', title: 'LINE Developers 設定', desc: '註冊 Messaging API 並設置 Webhook URL (必須為 HTTPS)。', icon: 'fa-id-card' },
             { step: '02', title: '環境變數配置', desc: '在伺服器設置 Token 與 Secret，確保通訊安全驗證。', icon: 'fa-key' },
             { step: '03', title: '部署 Node.js 伺服器', desc: '將程式碼部署至 Heroku, AWS 或自建 VPS。', icon: 'fa-cloud-arrow-up' }
           ].map((item, i) => (
             <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-3">
                   <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-sm font-black">{item.step}</div>
                   <h3 className="font-black text-slate-800">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
             </div>
           ))}
           
           <div className="bg-rose-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-200">
              <h4 className="font-black mb-2 flex items-center gap-2">
                <i className="fas fa-shield-halved"></i> 安全警告
              </h4>
              <p className="text-xs opacity-80 leading-relaxed font-medium">
                切勿將 Channel Access Token 上傳至 Github 等公開區域。正式環境請務必使用 HTTPS 協定。
              </p>
           </div>
        </div>

        {/* 程式碼檢視器 */}
        <div className="lg:col-span-8 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-[650px]">
          <div className="flex bg-slate-800 p-2 gap-2 border-b border-white/5">
             <button onClick={() => setActiveFile('server')} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFile === 'server' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}>server.js</button>
             <button onClick={() => setActiveFile('env')} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFile === 'env' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}>.env</button>
             <button onClick={() => setActiveFile('flex')} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFile === 'flex' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}>flex-msg.json</button>
          </div>
          
          <div className="flex-1 p-8 overflow-auto custom-scrollbar">
             <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                   {activeFile === 'server' ? '後端 Webhook 邏輯實作' : activeFile === 'env' ? '安全環境配置' : 'LINE 派單卡片樣板'}
                </p>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <i className="fas fa-copy text-sm"></i>
                </button>
             </div>
             <pre className="text-sm font-mono text-emerald-400 leading-relaxed">
                {activeFile === 'server' ? serverCode : activeFile === 'env' ? envCode : flexCode}
             </pre>
          </div>
          
          <div className="bg-white/5 p-6 border-t border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <i className="fas fa-terminal text-slate-500"></i>
                <p className="text-[10px] font-bold text-slate-400">系統狀態：準備就緒，等待連線</p>
             </div>
             <button className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20">
                下載實作白皮書
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineProductionSetup;
