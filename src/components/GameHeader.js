import React from 'react';
import { Wifi, WifiOff, LogIn, LogOut, Coins, Download } from 'lucide-react';

const GameHeader = ({ level, score, user, isOnline, onLogin, onLogout, showInstallBtn, onInstall }) => {
  
  return (
    <div className="w-full flex justify-between items-center mb-6 bg-white/90 p-3 rounded-xl shadow-sm">
      
      {/* [왼쪽] 레벨 표시 */}
      <div className="text-xl font-black text-indigo-600 tracking-widest uppercase italic">
        LEVEL {level}
      </div>

      {/* [오른쪽] 버튼 및 정보 그룹 */}
      <div className="flex flex-col items-end gap-1">
        
        {/* 1. 윗줄: 와이파이 상태 */}
        <div className="h-4">
          {isOnline ? (
            <Wifi size={16} className="text-green-500" strokeWidth={3} />
          ) : (
            <WifiOff size={16} className="text-red-400 animate-pulse" />
          )}
        </div>

        {/* 2. 아랫줄: 버튼 그룹 */}
        <div className="flex items-center gap-2">
          
          {/* ▼▼▼ [복구됨] 앱 설치 버튼 (조건부 렌더링) ▼▼▼ */}
          {showInstallBtn && (
            <button 
              onClick={onInstall}
              className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 rounded-lg text-xs font-black shadow-md transition-all active:scale-95 animate-pulse"
            >
              <Download size={14} strokeWidth={3} /> APP
            </button>
          )}
          {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}

          {/* 로그인/로그아웃 버튼 */}
          {user ? (
            <button 
              onClick={onLogout} 
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-500 px-2 py-1 rounded-lg text-xs font-black transition-colors"
            >
              <LogOut size={14} strokeWidth={3} /> OUT
            </button>
          ) : (
            <button 
              onClick={onLogin} 
              disabled={!isOnline}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <LogIn size={14} strokeWidth={3} /> LOGIN
            </button>
          )}

          {/* 코인 표시 */}
          <div className="flex items-center gap-1 ml-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
            <Coins size={20} className="text-yellow-500 fill-yellow-400" strokeWidth={2.5} />
            <span className="text-gray-800 font-black text-xl tracking-tight">
              {score}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default GameHeader;
