import React from 'react';
import { Cloud, Smartphone, AlertTriangle } from 'lucide-react';

const SyncConflictModal = ({ conflictData, currentLevel, currentScore, onResolve }) => {
  // 충돌 데이터가 없으면 렌더링 안 함
  if (!conflictData) return null;

  // ★ [수정됨] 데이터 구조가 { cloud: ... } 형태일 경우와 아닐 경우를 모두 안전하게 처리
  // (Hook에서 넘어오는 데이터가 conflictData.cloud 안에 있을 수 있음)
  const serverData = conflictData.cloud || conflictData;
  const serverLevel = serverData.level || 1;
  const serverScore = serverData.score || 0;

  // ★ [수정됨] 로컬 데이터가 props로 안 넘어왔을 경우, conflictData.local에서 찾음 (안전장치)
  const localLevel = currentLevel || conflictData.local?.level || 1;
  const localScore = currentScore || conflictData.local?.score || 0;

  return (
    // 배경: 검은색 반투명, 화면 전체 덮음 (고정)
    <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4">
      
      {/* 모달창: 흰색 박스 (애니메이션 제거됨!) */}
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-4 border-indigo-100">
        
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-6 text-amber-600 font-black text-xl justify-center">
          <AlertTriangle size={28} className="animate-none" /> {/* 아이콘 흔들림도 제거 */}
          <span>DATA CONFLICT</span>
        </div>

        <p className="text-sm text-gray-500 text-center mb-6 font-bold">
          Different data found on server. <br/>Which one do you want to keep?
        </p>

        {/* 데이터 비교 섹션 */}
        <div className="flex gap-3 mb-6">
          {/* 1. 서버 데이터 (Cloud) */}
          <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 flex flex-col items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <Cloud size={24} />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-gray-400">SERVER</div>
              {/* ★ 값 안전하게 출력 */}
              <div className="font-black text-gray-800 text-lg">Lv.{serverLevel}</div>
              <div className="text-xs font-bold text-indigo-600">
                {serverScore?.toLocaleString() || 0} P
              </div>
            </div>
            <button 
              // ★ Hook에서 'cloud'를 기대하므로 인자값 맞춤 (server -> cloud)
              onClick={() => onResolve('cloud')}
              className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg transition-colors"
            >
              LOAD
            </button>
          </div>

          {/* 2. 내 기기 데이터 (Local) */}
          <div className="flex-1 bg-indigo-50 border-2 border-indigo-200 rounded-xl p-3 flex flex-col items-center gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] px-2 py-0.5 font-bold rounded-bl-lg">
              CURRENT
            </div>
            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
              <Smartphone size={24} />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-gray-400">MY PHONE</div>
              {/* ★ 값 안전하게 출력 */}
              <div className="font-black text-gray-800 text-lg">Lv.{localLevel}</div>
              <div className="text-xs font-bold text-indigo-600">
                {localScore?.toLocaleString() || 0} P
              </div>
            </div>
            <button 
              onClick={() => onResolve('local')}
              className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-colors"
            >
              KEEP
            </button>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          * Caution: The unselected data will be lost.
        </p>
      </div>
    </div>
  );
};

export default SyncConflictModal;
