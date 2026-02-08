import React from 'react';

const AnswerBoard = ({ currentWord, solvedWordsData, selectedLetters, isCorrect, isFlashing, hintStage, message }) => {
  return (
    <div className="flex flex-col items-center gap-3 mb-6 min-h-[120px] justify-center w-full">
      {/* Toast Message (Hint, Error 등) */}
      {message && (
        <div className="absolute top-20 z-50 bg-gray-900/95 text-white px-6 py-2 rounded-full text-sm font-black animate-bounce shadow-xl border border-gray-700 backdrop-blur-sm tracking-wide">
          {message}
        </div>
      )}

      {/* 단어 표시 영역 */}
      {currentWord.split(' ').map((word, wordIndex) => {
        // 이미 맞춘 단어인지 확인
        const isWordSolved = solvedWordsData.some(d => d.word === word);
        // 현재 입력 중인 단어인지 확인 (순서대로)
        const isCurrentTarget = !isWordSolved && solvedWordsData.length === wordIndex;

        return (
          <div key={wordIndex} className="flex gap-1 flex-wrap justify-center">
            {word.split('').map((char, charIndex) => {
              // 1. 이미 해결된 글자인가?
              const isSolvedChar = solvedWordsData.some(d => d.word === word && d.letters[charIndex]?.char === char);
              
              // 2. 현재 입력된 글자인가?
              const isSelected = isCurrentTarget && selectedLetters[charIndex];

              // 3. 힌트를 보여줄 것인가? (★핵심: hintStage가 3이 아닐 때만 글자를 보여줌)
              const showHint = hintStage !== 3 && (
                (hintStage >= 1 && charIndex === 0) || 
                (hintStage >= 2 && charIndex === word.length - 1)
              );

              // 4. 실제로 화면에 표시할 글자 결정
              let displayChar = '';
              if (isSolvedChar) displayChar = char;
              else if (isSelected) displayChar = selectedLetters[charIndex].char;
              else if (showHint) displayChar = char;

              // 5. 스타일 결정 (힌트 3단계일 때 파란색 테두리 강조)
              const isHintStructure = hintStage === 3 && !isSolvedChar && !isSelected;

              return (
                <div
                  key={charIndex}
                  className={`
                    w-10 h-12 flex items-center justify-center rounded-lg text-xl font-black shadow-sm transition-all duration-300 border-2
                    ${isSolvedChar || isCorrect 
                      ? 'bg-green-500 text-white border-green-600 scale-105 shadow-green-200' // 정답
                      : isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-700 scale-110 shadow-indigo-200 animate-pulse' // 입력 중
                        : isHintStructure
                          ? 'bg-white border-blue-400 shadow-md shadow-blue-100' // ★힌트 3단계 (구조만 표시)
                          : showHint 
                            ? 'bg-gray-100 text-gray-400 border-gray-300' // 힌트 1,2단계 (연한 글자)
                            : 'bg-white text-gray-800 border-gray-200' // 기본 빈칸
                    }
                    ${isFlashing ? 'bg-yellow-300 border-yellow-500 scale-110 transition-none' : ''} // 정답 깜빡임
                  `}
                >
                  {displayChar}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default AnswerBoard;
