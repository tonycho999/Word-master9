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
    <div className="flex flex-col items-center w-full mb-4 min-h-[140px] justify-center">
      
      {/* 1. 정답 표시 영역 (Answer Slots) */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 w-full px-2">
        {targetWords.map((word, wIdx) => {
            const isSolved = foundWords.includes(word);
            
            // 보여줄 조건
            const showPlaceholder = !isSolved && hintStage >= 3;
            const showWord = isSolved || isFlashing;

            if (!showWord && !showPlaceholder) {
                return null;
            }

            return (
                <div key={wIdx} className="flex gap-1 items-end">
                    {word.split('').map((char, cIdx) => {
                        return (
                            // ▼▼▼ [수정] 박스 스타일 변경 ▼▼▼
                            // 배경: bg-indigo-500 (진한색)
                            // 글자: text-white (흰색)
                            <div key={cIdx} className={`
                                flex items-center justify-center w-8 h-10 rounded-md shadow-sm transition-all duration-300
                                ${showWord 
                                    ? 'bg-indigo-500 text-white'  // 정답/플래시: 진한 배경 + 흰 글씨
                                    : 'bg-gray-200'               // 힌트(언더바 대신 빈 박스 느낌): 회색 배경
                                }
                            `}>
                                {showWord ? (
                                    <span className={`text-2xl font-black ${isSolved ? 'text-white' : 'text-yellow-300 animate-pulse'}`}>
                                        {char}
                                    </span>
                                ) : (
                                    // 아직 못 맞췄을 때 (힌트 3단계)
                                    // 박스 안에 작은 점이나 언더바로 표시
                                    <div className="w-4 h-1 bg-gray-400 rounded-full"></div>
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
         <div className="mt-8 h-12 flex items-end justify-center">
           {currentWord.length > 0 ? (
             <div className="flex gap-1 animate-fade-in">
               {currentWord.split('').map((char, i) => (
                 <div key={i} className="w-8 flex justify-center">
                    {/* [수정] 입력 중인 글자색을 진한 색으로 변경 (흰 배경에서 보이도록) */}
                    <span className="text-4xl font-black text-indigo-900 drop-shadow-sm">
                      {char}
                    </span>
                 </div>
               ))}
               {/* 커서 색상도 진하게 변경 */}
               <div className="w-1 h-8 bg-indigo-400 animate-pulse mb-1 ml-1"></div>
             </div>
           ) : (
             // 입력 대기 안내 문구
             (hintStage < 3 && foundWords.length === 0) && (
                <span className="text-gray-300 text-sm font-bold tracking-[0.3em] animate-pulse">
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
