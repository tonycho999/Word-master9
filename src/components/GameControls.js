import React from 'react';
import { Shuffle, Delete, Lightbulb, Share2, Play, Video } from 'lucide-react';

const GameControls = ({ 
  category, 
  wordType, 
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
  onBackspace, 
  onNextLevel, 
  targetWords = [], 
  children 
}) => {
  
  const count = targetWords.length > 0 ? targetWords.length : 1;
  const wordCountLabel = `${count} WORD${count > 1 ? 'S' : ''}`;

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Word Master', text: `Level: ${category}`, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); onRewardShare(); }
    } catch (err) {}
  };

  return (
    <div className="flex flex-col h-full w-full">
      
      {/* =========================================
          [SECTION A] 상단 & 중단 (유동적 공간) 
          - 카테고리 정보와 AnswerBoard가 위치함
          - 내용이 많으면 이 부분만 스크롤됨
         ========================================= */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto px-2 pb-4">
        
        {/* 정보 배지 */}
        <div className="flex items-center gap-2 mb-2 animate-fade-in">
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10 shadow-sm backdrop-blur-md">
            {wordCountLabel}
          </span>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border shadow-sm backdrop-blur-md ${
            wordType === 'NORMAL' 
              ? 'bg-blue-500/30 text-blue-50 border-blue-400/30' 
              : 'bg-rose-500/30 text-rose-50 border-rose-400/30'
          }`}>
            {wordType}
          </span>
        </div>

        {/* 카테고리 */}
        <h2 className="text-2xl font-black text-white tracking-tight uppercase text-center leading-none drop-shadow-lg mb-6">
          {category}
        </h2>

        {/* 정답판 (AnswerBoard) */}
        <div className="w-full flex justify-center">
           {children}
        </div>
      </div>


      {/* =========================================
          [SECTION B] 하단 고정 영역 (Controls)
          - 힌트 메시지, 버튼, 키패드가 위치함
          - 항상 화면 바닥에 붙어있음
         ========================================= */}
      <div className="flex-none w-full flex flex-col gap-3 pb-6 px-4 bg-gradient-to-t from-black/40 via-black/10 to-transparent pt-4">
        
        {/* 1. 힌트 메시지 (고정 높이 확보하여 덜컹거림 방지) */}
        <div className="h-6 flex items-center justify-center">
           {hintMessage && !isCorrect && (
             <div className="flex items-center gap-2 bg-black/60 text-yellow-400 px-4 py-1 rounded-full backdrop-blur-md border border-white/10 animate-fade-in-up">
               <Lightbulb size={12} fill="currentColor" />
               <span className="text-xs font-bold tracking-wide">{hintMessage}</span>
             </div>
           )}
        </div>

        {/* 2. 기능 버튼 (Shuffle / Hint / Delete) - 한 줄 배치 */}
        {!isCorrect && (
          <div className="flex gap-3 w-full max-w-sm mx-auto h-12">
             <button onClick={onShuffle} className="aspect-square h-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
               <Shuffle size={20} />
             </button>
             
             <button 
               onClick={onHint} 
               disabled={hintStage >= 4}
               className="flex-1 h-full bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm disabled:grayscale disabled:opacity-50"
             >
               <Lightbulb size={18} fill="currentColor" />
               <span>{hintButtonText}</span>
             </button>

             <button onClick={onBackspace} className="aspect-square h-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
               <Delete size={20} />
             </button>
          </div>
        )}

        {/* 3. 키패드 (Grid Layout) */}
        {!isCorrect && (
          <div className="w-full max-w-sm mx-auto">
            <div className="flex flex-wrap justify-center gap-2">
              {scrambledLetters.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onLetterClick(item.char, index)}
                  disabled={item.isUsed}
                  className={`
                    w-[13%] aspect-square text-xl font-black rounded-xl transition-all duration-150 flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.2)]
                    ${item.isUsed 
                      ? 'bg-black/20 text-transparent shadow-none scale-90 opacity-0 pointer-events-none' 
                      : 'bg-white text-indigo-900 active:translate-y-[4px] active:shadow-none hover:bg-indigo-50'
                    }
                  `}
                >
                  {item.char}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. 결과 화면 or 광고/공유 버튼 */}
        {isCorrect ? (
          <div className="w-full max-w-sm mx-auto animate-fade-in-up pt-2">
            <button
              onClick={onNextLevel}
              className="w-full h-16 bg-white text-indigo-700 text-xl font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 animate-bounce hover:scale-105 transition-transform"
            >
              NEXT LEVEL <Play size={24} fill="currentColor" />
            </button>
          </div>
        ) : (
          // 게임 중 하단 링크
          <div className="flex justify-center gap-6 mt-2 opacity-60">
             <button onClick={onRewardAd} className="flex items-center gap-1 text-[10px] font-bold text-white hover:opacity-100 transition-opacity">
                <Video size={12} /> GET 200 COINS
             </button>
             <button onClick={handleShare} className="flex items-center gap-1 text-[10px] font-bold text-white hover:opacity-100 transition-opacity">
                <Share2 size={12} /> SHARE
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default GameControls;
