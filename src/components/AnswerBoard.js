import React from 'react';

const AnswerBoard = ({ 
  currentWord = '',      
  targetWords = [],       
  foundWords = [],        
  isCorrect, 
  isFlashing,
  hintStage,
}) => {

  return (
    // ▼▼▼ [핵심 수정] AnswerBoard 전체 배경을 '진한 남색'으로 변경 ▼▼▼
    <div className="flex flex-col items-center w-full mb-4 min-h-[160px] justify-center bg-indigo-900 rounded-2xl p-4 shadow-inner border-2 border-indigo-950">
      
      {/* 1. 정답 표시 영역 (Slots) */}
      <div className="flex flex-col items-center gap-3 w-full">
        {targetWords.map((word, wIdx) => {
            const isSolved = foundWords.includes(word);
            
            // 보여줄 조건
            const showPlaceholder = !isSolved && hintStage >= 3;
            const showWord = isSolved || isFlashing;

            if (!showWord && !showPlaceholder) {
                return null;
            }

            return (
                <div key={wIdx} className="flex gap-1.5 justify-center">
                    {word.split('').map((char, cIdx) => {
                        return (
                            <div key={cIdx} className={`
                                flex items-center justify-center w-10 h-12 rounded-lg transition-all duration-300
                                ${showWord 
                                    ? 'bg-indigo-800'  // [수정] 정답일 때: 약간 밝은 남색 배경
                                    : 'bg-indigo-950'  // [수정] 힌트(빈칸)일 때: 아주 어두운 남색 배경 (언더바 대신 박스)
                                }
                            `}>
                                {showWord ? (
                                    // [수정] 글자색: 흰색 (어두운 배경 위라 아주 잘 보임)
                                    <span className={`text-3xl font-black ${isSolved ? 'text-white' : 'text-yellow-400 animate-pulse'}`}>
                                        {char}
                                    </span>
                                ) : (
                                    // 힌트 3단계: 빈칸일 때 (언더바 느낌)
                                    <div className="w-6 h-1 bg-indigo-700 rounded-full"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        })}
      </div>

      {/* 2. 현재 입력 중인 단어 (Typewriter Style) */}
      {!isCorrect && (
         <div className="mt-6 h-14 flex items-end justify-center">
           {currentWord.length > 0 ? (
             <div className="flex gap-1 animate-fade-in">
               {currentWord.split('').map((char, i) => (
                 <div key={i} className="w-8 flex justify-center">
                    {/* [수정] 입력 글자: 흰색 (남색 배경 위) */}
                    <span className="text-4xl font-black text-white drop-shadow-md">
                      {char}
                    </span>
                 </div>
               ))}
               {/* 커서: 흰색 */}
               <div className="w-1 h-8 bg-white/80 animate-pulse mb-1 ml-1"></div>
             </div>
           ) : (
             // 입력 대기 안내 (흰색 투명도 조절)
             (hintStage < 3 && foundWords.length === 0) && (
                <span className="text-indigo-300 text-sm font-bold tracking-[0.3em] animate-pulse">
                  TAP LETTERS
                </span>
             )
           )}
         </div>
      )}
      
    </div>
  );
};

export default AnswerBoard;
