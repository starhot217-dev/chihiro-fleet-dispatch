
import React, { useState } from 'react';
import { Vehicle } from '../types';

interface WalletProps {
  vehicles: Vehicle[];
  onTopUp: (vehicleId: string, amount: number) => void;
}

const Wallet: React.FC<WalletProps> = ({ vehicles, onTopUp }) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState(500);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // 模擬歷史紀錄
  const history = [
    { id: 1, type: 'TOPUP', amount: 1000, date: '2023-10-27 09:15', status: 'SUCCESS' },
    { id: 2, type: 'COMMISSION', amount: -45, date: '2023-10-27 10:30', note: 'ORD-102 抽成' },
    { id: 3, type: 'COMMISSION', amount: -32, date: '2023-10-27 11:10', note: 'ORD-105 抽成' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">財務管理中心</h2>
          <p className="text-slate-500 font-medium mt-1">司機儲值金與平台佣金即時對帳系統</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Driver List - Left Side */}
          <div className="lg:col-span-4 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 flex flex-col h-[600px]">
            <h3 className="text-lg font-black text-slate-800 px-2 mb-6 flex justify-between items-center">
              司機清單
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-400 font-black">Total: {vehicles.length}</span>
            </h3>
            <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {vehicles.map(v => (
                <div 
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex justify-between items-center group ${
                    selectedVehicleId === v.id ? 'border-rose-600 bg-rose-50/30' : 'border-slate-50 bg-slate-50/50 hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center transition-colors ${
                      selectedVehicleId === v.id ? 'bg-rose-600 text-white' : 'bg-white text-slate-400 group-hover:text-rose-500'
                    }`}>
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{v.driverName}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{v.plateNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black tracking-tighter ${v.walletBalance < 200 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                      ${v.walletBalance}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Balance</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Actions and History */}
          <div className="lg:col-span-8 space-y-8">
            {selectedVehicle ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Top Up Form */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl h-fit">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  
                  <div className="relative z-10 space-y-8">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        錢包加值服務
                      </div>
                      <h3 className="text-2xl font-black mb-1">為 {selectedVehicle.driverName} 儲值</h3>
                      <p className="text-slate-500 text-xs font-bold">車號：{selectedVehicle.plateNumber}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {[500, 1000, 2000, 3000, 5000, 10000].map(amt => (
                          <button 
                            key={amt}
                            onClick={() => setTopUpAmount(amt)}
                            className={`py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                              topUpAmount === amt 
                                ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20 scale-105' 
                                : 'bg-slate-800 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            ${amt.toLocaleString()}
                          </button>
                        ))}
                      </div>

                      <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-rose-500 text-xl group-focus-within:scale-125 transition-transform">$</span>
                        <input 
                          type="number"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(parseInt(e.target.value) || 0)}
                          className="w-full bg-slate-800 border-2 border-slate-700 rounded-[1.5rem] pl-12 pr-6 py-5 text-2xl font-black focus:border-rose-600 focus:bg-slate-800 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => onTopUp(selectedVehicle.id, topUpAmount)}
                      className="w-full py-6 bg-rose-600 rounded-[2rem] font-black text-xl shadow-xl shadow-rose-900/20 hover:bg-rose-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <i className="fas fa-check-circle"></i> 確認入帳
                    </button>
                  </div>
                </div>

                {/* Simulated History */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
                  <h3 className="text-xl font-black text-slate-800 mb-6">近期交易紀錄</h3>
                  <div className="space-y-4 flex-1">
                    {history.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs ${
                            item.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                            <i className={`fas ${item.amount > 0 ? 'fa-arrow-down' : 'fa-minus'}`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-700">{item.type === 'TOPUP' ? '儲值金入帳' : '平台佣金扣款'}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{item.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black ${item.amount > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {item.amount > 0 ? `+${item.amount}` : item.amount}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{item.note || '系統自動'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 border-2 border-slate-100 text-slate-400 rounded-2xl text-xs font-black hover:bg-slate-50 hover:text-slate-600 transition-all uppercase tracking-widest">
                    查看完整對帳單
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] bg-slate-100/50 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center text-3xl text-slate-300 mb-6">
                  <i className="fas fa-wallet"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-400">請從左側選擇司機</h3>
                <p className="text-slate-400 max-w-xs mt-2">選擇司機後即可進行儲值作業與查看詳細的錢包變動明細</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
