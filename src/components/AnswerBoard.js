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
      
      {/* 1. 정답 표시 영역 */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {targetWords.map((word, wIdx) => {
            const isSolved = foundWords.includes(word);
            
            // 보여줄 조건: 찾았거나, 플래시(힌트4)거나, 힌트3(자리수 공개)일 때
            const showPlaceholder = !isSolved && hintStage >= 3;
            const showWord = isSolved || isFlashing;

            // 아직 보여줄 단계가 아니면 숨김
            if (!showWord && !showPlaceholder) {
                return null;
            }

            return (
                <div key={wIdx} className="flex gap-1.5 justify-center">
                    {word.split('').map((char, cIdx) => {
                        return (
                            <div key={cIdx} className={`
                                flex items-center justify-center w-10 h-12 rounded-lg shadow-sm border-b-4 transition-all duration-300
                                ${showWord 
                                    ? 'bg-indigo-600 border-indigo-800' // [수정] 정답일 때: 진한 남색 배경 (확실하게 보임)
                                    : 'bg-gray-300 border-gray-400'     // [수정] 힌트(언더바)일 때: 회색 배경
                                }
                            `}>
                                {showWord && (
                                    // [수정] 글자색: 무조건 흰색 (진한 배경 위라 잘 보임)
                                    <span className={`text-2xl font-black ${isSolved ? 'text-white' : 'text-yellow-300 animate-pulse'}`}>
                                        {char}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        })}
      </div>

      {/* 2. 현재 입력 중인 단어 (타자기 효과) */}
      {!isCorrect && (
         <div className="mt-6 h-12 flex items-end justify-center">
           {currentWord.length > 0 ? (
             <div className="flex gap-1 animate-fade-in">
               {currentWord.split('').map((char, i) => (
                 <div key={i} className="w-8 flex justify-center">
                    {/* [수정] 입력 글자도 진한 남색으로 변경 (흰 배경에서 잘 보이도록) */}
                    <span className="text-4xl font-black text-indigo-900 drop-shadow-sm">
                      {char}
                    </span>
                 </div>
               ))}
               {/* 커서 */}
               <div className="w-1 h-8 bg-indigo-400 animate-pulse mb-1 ml-1"></div>
             </div>
           ) : (
             // 입력 대기 안내
             (hintStage < 3 && foundWords.length === 0) && (
                <span className="text-gray-400 text-sm font-bold tracking-[0.3em] animate-pulse">
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
