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
    <div className="flex flex-col items-center w-full gap-8">
      
      {/* 1. 정답 표시 영역 (Answer Display) 
          - flex-wrap: 단어가 많으면 자연스럽게 줄바꿈됨
          - justify-center: 항상 가운데 정렬
      */}
      <div className="flex flex-wrap justify-center content-center gap-x-6 gap-y-4 w-full px-2">
        {targetWords.map((word, wIdx) => {
            const isSolved = foundWords.includes(word);
            // 힌트 3단계 이상이거나, 이미 찾았거나, 플래시 힌트일 때만 자리 표시
            const showSlot = isSolved || hintStage >= 3 || isFlashing;
            const showText = isSolved || isFlashing;

            if (!showSlot) return null; // 아직은 숨김

            return (
                <div key={wIdx} className="flex gap-1">
                    {word.split('').map((char, cIdx) => (
                        <div key={cIdx} className={`
                            flex items-center justify-center w-8 h-10 sm:w-9 sm:h-11 rounded-md transition-all duration-300
                            ${showText 
                                ? 'bg-transparent' // 글자가 보일 땐 배경 투명 (글자만 강조)
                                : 'bg-white/20 border border-white/10' // 빈칸일 땐 반투명 박스
                            }
                        `}>
                            {showText && (
                                <span className={`text-3xl font-black drop-shadow-md ${isSolved ? 'text-white' : 'text-yellow-300 animate-pulse'}`}>
                                    {char}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            );
        })}
      </div>

      {/* 2. 현재 입력 중인 단어 (Active Input Typewriter) */}
      {!isCorrect && (
         <div className="h-16 flex items-end justify-center">
           {currentWord.length > 0 ? (
             <div className="flex gap-1 animate-fade-in items-end">
               {currentWord.split('').map((char, i) => (
                 <div key={i} className="w-9 flex justify-center pb-1 border-b-4 border-white/80 mx-0.5">
                    <span className="text-4xl font-black text-white drop-shadow-xl">
                      {char}
                    </span>
                 </div>
               ))}
               {/* 커서 깜빡임 */}
               <div className="w-1 h-8 bg-white animate-pulse mb-2 ml-1"></div>
             </div>
           ) : (
             // 입력 대기 상태 (힌트가 없어도 "입력하세요" 느낌을 줌)
             (hintStage < 3 && foundWords.length === 0) && (
                <span className="text-white/40 text-sm font-bold tracking-[0.4em] animate-pulse mb-3">
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
