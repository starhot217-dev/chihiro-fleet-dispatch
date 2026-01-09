
import React from 'react';
import { APP_PLAN } from '../constants';

const Blueprint: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">{APP_PLAN.title}</h2>
          <p className="text-lg text-slate-600">{APP_PLAN.description}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-layer-group text-indigo-500"></i>
              核心功能模塊
            </h3>
            <ul className="space-y-4">
              {APP_PLAN.modules.map((m, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs mt-0.5">
                    {i + 1}
                  </span>
                  {m}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-code text-indigo-500"></i>
              技術架構
            </h3>
            <div className="flex flex-wrap gap-2">
              {APP_PLAN.techStack.map((t, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h4 className="font-bold text-amber-800 mb-1 flex items-center gap-2 text-sm">
                <i className="fas fa-info-circle"></i>
                實作說明
              </h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                本系統將模擬 Google Maps 介面展示派車邏輯，並串接 Gemini 3 Flash 模型進行營運數據的自動化分析。您可以透過左側選單預覽各個模組。
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-200">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">準備好開始討論了嗎？</h3>
            <p className="opacity-90">我們可以根據您的特定業務需求調整目前的規劃架構。</p>
          </div>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg">
            確認架構並開發 <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blueprint;
