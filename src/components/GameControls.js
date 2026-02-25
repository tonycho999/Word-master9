import React from 'react';
import { Shuffle, Delete, Lightbulb, Share2, Play } from 'lucide-react';
import AdButton from './AdButton'; 

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
  targetWords = [], // 부모에게서 받은 정답 단어 리스트
  children 
}) => {
  
  // 단어 개수 자동 계산 (2 WORDS 표시용)
  const count = targetWords.length > 0 ? targetWords.length : 1;
  const wordCountLabel = `${count} WORD${count > 1 ? 'S' : ''}`;

  const handleShare = async () => {
    const shareData = { title: 'Word Master', text: `Level: ${category}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(window.location.href);
      if (onRewardShare) onRewardShare();
    } catch (err) {}
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      
      {/* 1. 상단 정보 (글자색을 진하게 수정하여 흰 배경에서 보이도록 함) */}
      <div className="w-full flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1">
          
          {/* [수정] 배경 회색, 글자 진한 회색 (잘 보임) */}
          <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase border border-gray-300">
            {wordCountLabel}
          </span>

          <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${
            wordType === 'NORMAL' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
          }`}>
            {wordType}
          </span>
        </div>
        
        {/* [수정] 카테고리 제목: 진한 회색으로 변경 */}
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
           <span className="text-xs font-bold text-indigo-600 animate-pulse bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
             💡 {hintMessage}
           </span>
         )}
      </div>

      {/* 4. 컨트롤 버튼 */}
      {!isCorrect && (
        <div className="flex gap-2 w-full justify-center px-4">
           {/* 배경을 밝은 회색으로 변경 */}
           <button onClick={onShuffle} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl shadow-sm active:scale-95 transition-all">
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

           <button onClick={onBackspace} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl shadow-sm active:scale-95 transition-all">
             <Delete size={20} />
           </button>
        </div>
      )}

      {/* 5. 알파벳 입력 키패드 */}
      {!isCorrect && (
        <div className="w-full px-2 mt-4">
          <div className="flex flex-wrap justify-center gap-2">
            {scrambledLetters.map((item, index) => (
              <button
                key={index}
                onClick={() => onLetterClick(item.char, index)}
                disabled={item.isUsed}
                className={`
                  w-12 h-12 text-xl font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-all duration-100 flex items-center justify-center
                  ${item.isUsed 
                    ? 'bg-gray-100 text-gray-300 shadow-none scale-90 pointer-events-none' 
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
      <div className="w-full px-4 mt-2 flex flex-col gap-3">
        {isCorrect ? (
          <div className="flex flex-col gap-6 w-full animate-fade-in-up items-center pt-4">
            
            {/* 정답 단어 보여주기 */}
            <div className="flex flex-col items-center">
                <div className="text-gray-400 text-xs font-bold tracking-[0.3em] mb-2">ANSWER</div>
                <div className="flex flex-wrap justify-center gap-3">
                    {targetWords.map((word, i) => (
                        <span key={i} className="text-3xl font-black text-indigo-600 drop-shadow-sm tracking-wide border-b-4 border-indigo-100 pb-1">
                            {word}
                        </span>
                    ))}
                </div>
            </div>

            <button
              onClick={onNextLevel}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 animate-bounce hover:scale-105 transition-transform"
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
