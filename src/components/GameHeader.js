import React from 'react';
// Download 아이콘 추가
import { Coins, LogIn, LogOut, Wifi, WifiOff, User, Download } from 'lucide-react';

const GameHeader = ({ 
  level, 
  score, 
  user, 
  isOnline, 
  onLogin, 
  onLogout,
  // 추가된 Props
  showInstallBtn, 
  onInstall 
}) => {
  return (
    <>
      <div className="w-full flex justify-between items-center mb-2 font-black text-indigo-600">
        <span className="text-lg">LEVEL {level}</span>
        
        <div className="flex items-center gap-2">
          
          {/* 1. 온라인/오프라인 상태 아이콘 */}
          {isOnline ? (
            <Wifi size={16} className="text-green-500" />
          ) : (
            <WifiOff size={16} className="text-red-500 animate-pulse" />
          )}

          {/* 2. [NEW] 설치 버튼 (설치 안 한 사람만 보임) */}
          {showInstallBtn && (
            <button 
              onClick={onInstall} 
              className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-green-200 animate-pulse border border-green-200"
            >
              <Download size={10} /> APP
            </button>
          )}
          
          {/* 3. 로그인 상태 */}
          {user ? (
            <div className="flex items-center gap-2 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-1 text-indigo-400">
                 <User size={10} />
                 <span className="text-[9px] font-bold max-w-[80px] sm:max-w-none truncate">
                   {user.email}
                 </span>
              </div>
              <button 
                onClick={onLogout} 
                className="text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-red-200"
              >
                <LogOut size={10}/> OUT
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin} 
              disabled={!isOnline} 
              className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-200 animate-pulse disabled:opacity-50 font-bold"
            >
              <LogIn size={12}/> LOGIN SAVE
            </button>
          )}
          
          {/* 4. 점수 (금화) */}
          <div className="flex items-center gap-1 ml-1">
            <Coins size={18} className="text-yellow-500"/> 
            <span>{score}</span>
          </div>
        </div>
      </div>

      {!isOnline && (
        <div className="w-full bg-red-50 text-red-500 text-[10px] font-bold text-center py-1 mb-2 rounded">
          OFFLINE MODE (Data saved locally)
        </div>
      )}
    </>
  );
};

export default GameHeader;
