import React from 'react';
import { Shuffle, Delete, Lightbulb, Share2, Play } from 'lucide-react';
import AdButton from './AdButton'; 

const GameControls = ({ 
  category, 
  wordType, 
  // wordCountDisplay, // <-- 이제 이거 안 쓰고 고정 텍스트 사용
  hintMessage, 
  isCorrect, 
  hintStage, 
  hintButtonText, 
  onHint, 
  onShuffle, 
  onRewardAd, 
  onRewardShare, 
  scrambledLetters, 
  onLetterClick, 
  onReset, 
  onBackspace, 
  onNextLevel, 
  targetWords = [], // [추가] 정답 표시용
  children 
}) => {
  
  const handleShare = async () => {
    const shareData = {
      title: 'Word Master',
      text: `Try this Word Master puzzle! Level: ${category}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        if (onRewardShare) onRewardShare(); 
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link Copied! +100 Coins added.'); 
        if (onRewardShare) onRewardShare();
      }
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      
      {/* 1. 상단 정보 (카테고리 & 타입) */}
      <div className="w-full flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1">
          {/* [수정 1] 무조건 "1 WORD"로 고정 */}
          <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
            1 WORD
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${
            wordType === 'NORMAL' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
          }`}>
            {wordType}
          </span>
        </div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase text-center leading-none">
          {category}
        </h2>
      </div>

      {/* 2. 게임판 (AnswerBoard) */}
      <div className="w-full bg-transparent p-2 min-h-[100px] flex items-center justify-center relative mb-2">
         {children}
      </div>

      {/* 3. 힌트 메시지 */}
      <div className="h-5 flex items-center justify-center w-full">
         {hintMessage && !isCorrect && (
           <span className="text-xs font-bold text-indigo-500 animate-pulse bg-indigo-50 px-2 py-1 rounded-lg">
             💡 {hintMessage}
           </span>
         )}
      </div>

      {/* 4. 컨트롤 버튼 */}
      {!isCorrect && (
        <div className="flex gap-2 w-full justify-center px-2">
           <button onClick={onShuffle} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 shadow-sm active:scale-95 transition-colors">
             <Shuffle size={20} />
           </button>
           
           <button 
             onClick={onHint} 
             disabled={hintStage >= 4}
             className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-xl shadow-[0_4px_0_rgb(217,119,6)] active:shadow-none active:translate-y-[4px] transition-all px-4 py-2 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
           >
             <Lightbulb size={18} className="text-yellow-100" fill="currentColor" />
             <span className="text-xs">{hintButtonText}</span>
           </button>

           <button onClick={onBackspace} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 shadow-sm active:scale-95 transition-colors">
             <Delete size={20} />
           </button>
        </div>
      )}

      {/* 5. 알파벳 입력 키패드 */}
      {!isCorrect && (
        <div className="w-full px-1 mt-2">
          <div className="flex flex-wrap justify-center gap-1.5">
            {scrambledLetters.map((item, index) => (
              <button
                key={index}
                onClick={() => onLetterClick(item.char, index)}
                disabled={item.isUsed} // isSolved된 것도 isUsed가 true라 비활성됨
                className={`
                  w-11 h-11 text-lg font-black rounded-lg shadow-md transition-all duration-100 flex items-center justify-center
                  ${item.isUsed 
                    ? 'bg-gray-100 text-gray-300 shadow-none scale-90 opacity-50' 
                    : 'bg-white text-indigo-600 hover:bg-indigo-50 border-b-4 border-gray-200 active:border-b-0 active:translate-y-1'
                  }
                `}
              >
                {item.char}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. 하단 액션 영역 */}
      <div className="w-full px-2 mt-4 border-t border-gray-100 pt-4 flex flex-col gap-3">
        
        {isCorrect ? (
          <div className="flex flex-col gap-4 w-full animate-fade-in-up">
            {/* [수정 5] 정답 단어 보여주기 (원래 순서대로) */}
            <div className="w-full text-center">
                <h3 className="text-gray-400 text-xs font-bold tracking-widest mb-1">ANSWER</h3>
                <div className="text-3xl font-black text-indigo-600 tracking-wider">
                  {targetWords.join(' ')}
                </div>
            </div>

            <button
              onClick={onNextLevel}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-black rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 animate-bounce hover:scale-105 transition-transform"
            >
              NEXT LEVEL <Play size={24} fill="currentColor" />
            </button>
          </div>
        ) : (
          <>
            <AdButton onReward={onRewardAd} />
            <button 
                onClick={handleShare}
                className="w-full py-2 text-gray-400 font-bold text-xs flex items-center justify-center gap-1 hover:text-indigo-500 transition-colors"
            >
                <Share2 size={14} /> Share Game (+100 Coins)
            </button>
          </>
        )}
      </div>

    </div>
  );
};

export default GameControls;
