
import React, { useState, useEffect } from 'react';
import { Vehicle, WalletLog } from '../types';
import { DataService } from '../services/dataService';

interface WalletProps {
  vehicles: Vehicle[];
  onTopUp: (vehicleId: string, amount: number) => void;
}

const Wallet: React.FC<WalletProps> = ({ vehicles: propsVehicles, onTopUp }) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState(500);
  const [vehicles, setVehicles] = useState<Vehicle[]>(propsVehicles);

  useEffect(() => {
    setVehicles(DataService.getVehicles());
  }, [propsVehicles]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const history = selectedVehicle ? DataService.getWalletLogs(selectedVehicle.id) : [];

  const handleTopUpClick = () => {
    if (selectedVehicleId) {
      onTopUp(selectedVehicleId, topUpAmount);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight">財務管理中心</h2>
        <p className="text-slate-500 font-medium mt-1 text-sm lg:text-base">司機儲值金與平台佣金即時對帳系統</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 司機清單 */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 flex flex-col h-[600px]">
          <h3 className="text-lg font-black text-slate-800 px-2 mb-6 flex justify-between items-center">
            司機帳戶
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-400 font-black">ACTIVE: {vehicles.length}</span>
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
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    selectedVehicleId === v.id ? 'bg-rose-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
                  }`}>
                    <i className="fas fa-id-card"></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{v.driverName}</p>
                    <p className="text-[10px] text-slate-400 font-black tracking-widest">{v.plateNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black tracking-tighter ${v.walletBalance < 200 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                    ${v.walletBalance}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">餘額</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 儲值與歷史 */}
        <div className="lg:col-span-8 space-y-8">
          {selectedVehicle ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl h-fit">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 space-y-8">
                  <div>
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">加值服務</span>
                    <h3 className="text-2xl font-black mb-1">為 {selectedVehicle.driverName} 儲值</h3>
                    <p className="text-slate-500 text-xs font-bold">目前餘額: ${selectedVehicle.walletBalance}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[500, 1000, 2000, 3000, 5000, 10000].map(amt => (
                        <button key={amt} onClick={() => setTopUpAmount(amt)} className={`py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${topUpAmount === amt ? 'bg-rose-600 border-rose-600 text-white' : 'bg-slate-800 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                          ${amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-rose-500 text-xl">$</span>
                      <input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(parseInt(e.target.value) || 0)} className="w-full bg-slate-800 border-2 border-slate-700 rounded-[1.5rem] pl-12 pr-6 py-5 text-2xl font-black focus:border-rose-600 outline-none transition-all" />
                    </div>
                  </div>

                  <button onClick={handleTopUpClick} className="w-full py-5 bg-rose-600 rounded-[2rem] font-black text-lg shadow-xl hover:bg-rose-700 active:scale-95 transition-all">
                    確認入帳
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col h-[500px]">
                <h3 className="text-xl font-black text-slate-800 mb-6">帳戶流水紀錄</h3>
                <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  {history.length === 0 ? (
                    <p className="text-center text-slate-300 mt-20 text-sm italic">尚無交易紀錄</p>
                  ) : (
                    history.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs ${item.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            <i className={`fas ${item.amount > 0 ? 'fa-plus' : 'fa-minus'}`}></i>
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-700 leading-none mb-1">{item.type === 'TOPUP' ? '儲值金入帳' : '平台抽成扣款'}</p>
                            <p className="text-[9px] text-slate-400 font-bold">{item.timestamp}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-sm ${item.amount > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {item.amount > 0 ? `+${item.amount}` : item.amount}
                          </p>
                          <p className="text-[8px] text-slate-400 font-bold">餘額: ${item.balanceAfter}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] bg-slate-100/50 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center text-3xl text-slate-200 mb-6">
                <i className="fas fa-wallet"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-400">請選擇司機帳戶</h3>
              <p className="text-slate-400 text-sm mt-2">選擇後即可進行儲值作業與對帳。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
