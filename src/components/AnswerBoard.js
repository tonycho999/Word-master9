import React from 'react';

const AnswerBoard = ({ currentWord, solvedWords, selectedLetters, isCorrect, isFlashing, hintStage, message }) => {

  return (
    // min-h 삭제하여 불필요한 공백 제거
    <div className="flex flex-col items-center gap-2 mb-2 w-full justify-center">
      
      {/* Toast Message */}
      {message && (
        <div className="absolute top-20 z-50 bg-gray-900/95 text-white px-6 py-2 rounded-full text-sm font-black animate-bounce shadow-xl border border-gray-700 backdrop-blur-sm tracking-wide">
          {message}
        </div>
      )}

      {/* 1. 정답 단어 영역 (맞췄거나 힌트3일 때만 표시) */}
      <div className="flex flex-col gap-2 w-full items-center">
        {currentWord.split(' ').map((word, wordIndex) => {
          const isSolved = solvedWords.includes(word);
          const shouldShowStructure = isSolved || hintStage === 3;

          if (!shouldShowStructure) return null; // 안 보일 땐 아예 공간 차지 X

          return (
            <div key={wordIndex} className="flex gap-1 flex-wrap justify-center animate-fade-in">
              {word.split('').map((char, charIndex) => (
                <div
                  key={charIndex}
                  className={`
                    w-10 h-12 flex items-center justify-center rounded-lg text-xl font-black shadow-sm transition-all duration-300 border-2
                    ${isSolved 
                      ? 'bg-green-500 text-white border-green-600 shadow-green-200' 
                      : 'bg-white border-blue-400 shadow-blue-100'
                    }
                    ${isSolved && isFlashing ? 'bg-yellow-300 border-yellow-500 scale-110' : ''}
                  `}
                >
                  {isSolved ? char : ''}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 2. 입력 확인창 (Input Tray) */}
      {/* 정답 칸이 숨겨져 있을 때, 내가 뭘 눌렀는지 보여주는 곳 */}
      {!isCorrect && (
        <div className="h-14 w-full flex items-center justify-center">
          {selectedLetters.length > 0 ? (
            <div className="flex gap-1 flex-wrap justify-center p-1 bg-indigo-50 rounded-xl border-2 border-dashed border-indigo-200">
               {selectedLetters.map((item) => (
                 <div key={item.id} className="w-10 h-10 flex items-center justify-center rounded-lg text-lg font-black bg-indigo-600 text-white shadow-md animate-bounce-short">
                   {item.char}
                 </div>
               ))}
            </div>
          ) : (
             // 안내 문구
             hintStage < 3 && solvedWords.length < currentWord.split(' ').length && (
                <div className="text-gray-300 text-xs font-bold animate-pulse tracking-widest border-b-2 border-gray-100 pb-1">
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
