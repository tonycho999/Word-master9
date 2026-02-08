import React from 'react';

const AnswerBoard = ({ currentWord, solvedWords, selectedLetters, isCorrect, isFlashing, hintStage, message }) => {

  return (
    <div className="flex flex-col items-center gap-4 mb-4 w-full justify-center min-h-[100px]">
      
      {/* 알림 메시지 */}
      {message && (
        <div className="absolute top-20 z-50 bg-gray-900/95 text-white px-6 py-2 rounded-full text-sm font-black animate-bounce shadow-xl border border-gray-700 backdrop-blur-sm tracking-wide">
          {message}
        </div>
      )}

      {/* 1. 정답 단어 영역 (텍스트 전용 스타일) */}
      <div className="flex flex-col gap-4 w-full items-center">
        {currentWord.split(' ').map((word, wordIndex) => {
          const isSolved = solvedWords.includes(word);
          // 힌트 3단계(구조 보기) 이상이거나, 이미 맞췄으면 표시
          const shouldShowStructure = isSolved || hintStage === 3;

          // 안 보일 때는 공간만 차지 (투명)
          if (!shouldShowStructure) return <div key={wordIndex} className="h-10"></div>;

          return (
            <div key={wordIndex} className="flex gap-3 flex-wrap justify-center">
              {word.split('').map((char, charIndex) => {
                const showChar = isSolved || isFlashing;

                return (
                  <div
                    key={charIndex}
                    className={`
                      flex items-end justify-center w-8 h-10
                      text-4xl font-black transition-all duration-300
                      ${isSolved 
                        ? 'text-green-600' // 정답: 초록 글자 (밑줄 없음)
                        : isFlashing 
                          ? 'text-yellow-500' // 깜빡임: 노란 글자
                          : 'text-gray-300'   // 빈칸: 연한 회색 ( _ 표시용)
                      }
                    `}
                  >
                    {/* 맞췄으면 글자, 아니면 언더바(_) 텍스트 표시 */}
                    {showChar ? char : '_'}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* 2. 내가 입력한 글자 (Input Tray) */}
      {!isCorrect && (
        <div className="h-12 w-full flex items-center justify-center mt-2">
          {selectedLetters.length > 0 ? (
            <div className="flex gap-2 justify-center">
               {selectedLetters.map((item) => (
                 <span key={item.id} className="text-2xl font-black text-indigo-600 animate-bounce-short px-1">
                   {item.char}
                 </span>
               ))}
            </div>
          ) : (
             // 입력 대기 중일 때 안내
             hintStage < 3 && solvedWords.length < currentWord.split(' ').length && (
                <div className="text-gray-300 text-xs font-bold tracking-[0.2em] opacity-50">
                  TYPE ANSWER
                </div>
             )
          )}
        </div>
      )}

    </div>
  );
};

export default AnswerBoard;
