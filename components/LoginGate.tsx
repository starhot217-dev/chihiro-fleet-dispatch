
import React from 'react';
import { UserRole } from '../types';

interface LoginGateProps {
  onSelectRole: (role: UserRole) => void;
}

const LoginGate: React.FC<LoginGateProps> = ({ onSelectRole }) => {
  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-6 z-[1000] overflow-y-auto">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
        <div className="text-center md:text-left flex flex-col justify-center space-y-6 md:pr-10">
          <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl shadow-rose-200 mx-auto md:mx-0 animate-bounce">
            <i className="fas fa-heart"></i>
          </div>
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">千尋派車系統</h1>
            <p className="text-slate-500 font-medium text-lg">Chihiro Intelligent Fleet Management</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
             <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">系統聲明</p>
             <p className="text-xs text-slate-400 leading-relaxed font-bold">目前為「生產環境開發模擬 (Dev-Production)」，所有操作將即時同步於瀏覽器緩存，金鑰設置將永久儲存。</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => onSelectRole(UserRole.SYSTEM_VENDOR)}
            className="group bg-rose-600 p-6 rounded-[2.5rem] text-left hover:scale-[1.02] transition-all shadow-xl shadow-rose-100"
          >
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white text-xl"><i className="fas fa-gears"></i></div>
               <div>
                  <h3 className="text-white text-xl font-black mb-1">系統平台開發商 (Vendor)</h3>
                  <p className="text-rose-100 text-[10px] font-bold uppercase tracking-widest">全權限管理 • API 配置 • 核心架構</p>
               </div>
            </div>
          </button>

          <button 
            onClick={() => onSelectRole(UserRole.ADMIN)}
            className="group bg-slate-900 p-6 rounded-[2.5rem] text-left hover:scale-[1.02] transition-all shadow-xl"
          >
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white text-xl"><i className="fas fa-user-shield"></i></div>
               <div>
                  <h3 className="text-white text-xl font-black mb-1">車隊營運管理員 (Admin)</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">派單中心 • 財務對帳 • 地圖調度</p>
               </div>
            </div>
          </button>

          <button 
            onClick={() => onSelectRole(UserRole.CS)}
            className="group bg-white p-6 rounded-[2.5rem] text-left hover:scale-[1.02] transition-all shadow-xl border border-slate-100"
          >
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 text-xl group-hover:bg-indigo-500 group-hover:text-white transition-all"><i className="fas fa-headset"></i></div>
               <div>
                  <h3 className="text-slate-900 text-xl font-black mb-1">客服專員 (CS)</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">FAQ 管理 • 用戶支援 • 即時諮詢</p>
               </div>
            </div>
          </button>

          <button 
            onClick={() => onSelectRole(UserRole.DRIVER)}
            className="group bg-white p-6 rounded-[2.5rem] text-left hover:scale-[1.02] transition-all shadow-xl border border-slate-100"
          >
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 text-xl group-hover:bg-emerald-500 group-hover:text-white transition-all"><i className="fas fa-steering-wheel"></i></div>
               <div>
                  <h3 className="text-slate-900 text-xl font-black mb-1">合作司機 (Driver Portal)</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">即時搶單 • 個人錢包 • 行程回報</p>
               </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginGate;
