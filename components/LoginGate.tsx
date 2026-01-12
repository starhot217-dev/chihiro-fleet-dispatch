
import React from 'react';
import { UserRole } from '../types';

interface LoginGateProps {
  onSelectRole: (role: UserRole) => void;
}

const LoginGate: React.FC<LoginGateProps> = ({ onSelectRole }) => {
  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-6 z-[1000]">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-center md:text-left flex flex-col justify-center space-y-4 md:pr-10">
          <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-2xl shadow-rose-200 mx-auto md:mx-0">
            <i className="fas fa-heart"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">千尋派車系統</h1>
          <p className="text-slate-500 font-medium">請選擇您的身份進入調度中心或司機工作台</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => onSelectRole(UserRole.ADMIN)}
            className="group bg-slate-900 p-8 rounded-[2.5rem] text-left hover:scale-[1.02] transition-all shadow-xl hover:shadow-2xl border border-white/10"
          >
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:bg-rose-600 transition-colors">
              <i className="fas fa-user-shield"></i>
            </div>
            <h3 className="text-white text-xl font-black mb-2">系統管理員</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">管理全局派單、費率設定、財務結算與營運大數據分析。</p>
          </button>

          <button 
            onClick={() => onSelectRole(UserRole.DRIVER)}
            className="group bg-white p-8 rounded-[2.5rem] text-left hover:scale-[1.02] transition-all shadow-xl hover:shadow-2xl border border-slate-100"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:bg-[#00b900] group-hover:text-white transition-colors">
              <i className="fas fa-steering-wheel"></i>
            </div>
            <h3 className="text-slate-900 text-xl font-black mb-2">合作司機</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">即時接單、查看個人錢包、計算單趟里程與個人業績統計。</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginGate;
