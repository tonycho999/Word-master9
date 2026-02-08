import React from 'react';

const AnswerBoard = ({ currentWord, solvedWords, selectedLetters, isCorrect, isFlashing, hintStage, message }) => {

  return (
    <div className="flex flex-col items-center gap-2 mb-2 w-full justify-center">
      
      {/* Toast Message */}
      {message && (
        <div className="absolute top-20 z-50 bg-gray-900/95 text-white px-6 py-2 rounded-full text-sm font-black animate-bounce shadow-xl border border-gray-700 backdrop-blur-sm tracking-wide">
          {message}
        </div>
      )}

      {/* 1. 정답 단어 영역 */}
      <div className="flex flex-col gap-2 w-full items-center">
        {currentWord.split(' ').map((word, wordIndex) => {
          const isSolved = solvedWords.includes(word);
          // 힌트 3단계(구조 보기) 이상이거나, 이미 맞췄으면 박스를 보여줌
          const shouldShowStructure = isSolved || hintStage === 3;

          if (!shouldShowStructure) return null; 

          return (
            <div key={wordIndex} className="flex gap-1 flex-wrap justify-center animate-fade-in">
              {word.split('').map((char, charIndex) => {
                
                // ★ [핵심 수정] 정답을 보여주는 조건 추가
                // 1. 이미 맞춘 단어이거나
                // 2. "힌트 5(Flash)"가 발동해서 깜빡이는 중일 때 (isFlashing)
                const showChar = isSolved || isFlashing;

                return (
                  <div
                    key={charIndex}
                    className={`
                      /* ★ [수정] w-9 -> w-12 (너비 확대) */
                      w-12 h-11 flex items-center justify-center rounded-lg text-lg font-black shadow-sm transition-all duration-300 border-2
                      ${isSolved 
                        ? 'bg-green-500 text-white border-green-600 shadow-green-200' 
                        : isFlashing 
                          ? 'bg-yellow-300 text-gray-800 border-yellow-500 scale-105' // ★ 힌트 5 발동 시 노란색 + 글자 보임
                          : 'bg-white border-blue-400 shadow-blue-100' // 평소 힌트 3단계 (구조만)
                      }
                    `}
                  >
                    {/* 조건에 맞을 때만 글자 표시 */}
                    {showChar ? char : ''}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* 2. 입력 확인창 (Input Tray) */}
      {!isCorrect && (
        <div className="w-full flex items-center justify-center min-h-[40px]">
          {selectedLetters.length > 0 ? (
            <div className="flex gap-1 flex-wrap justify-center p-1 bg-indigo-50 rounded-xl border-2 border-dashed border-indigo-200">
               {selectedLetters.map((item) => (
                 <div key={item.id} className="w-8 h-8 flex items-center justify-center rounded-md text-base font-black bg-indigo-600 text-white shadow-md animate-bounce-short">
                   {item.char}
                 </div>
               ))}
            </div>
          ) : (
             hintStage < 3 && solvedWords.length < currentWord.split(' ').length && (
                <div className="text-gray-300 text-[10px] font-bold animate-pulse tracking-widest border-b border-gray-100 pb-0.5">
                  TAP LETTERS
                </div>
             )
          )}
        </div>
      )}

    </div>
  );
};

export default AnswerBoard;
