import React from 'react';

const AnswerBoard = ({ 
  currentWord = '',      
  solvedWords = [],      
  selectedLetters = [], // 사용하지 않더라도 받아둠 (에러 방지)
  isCorrect, 
  isFlashing,
  hintStage,
  // message,  <-- 팝업 메시지 prop은 이제 무시합니다.
  targetWord = '' // [추가] 정답 단어 (길이 계산용) - 부모에서 넘겨줘야 함
}) => {
  
  // 정답 길이 (없으면 현재 입력된 길이로 대체 - 에러 방지)
  const totalLength = targetWord ? targetWord.length : currentWord.length;
  
  // 현재 보여줄 글자들 배열 만들기
  // 예: 정답이 APPLE(5)이고 입력이 AP(2)라면 -> ['A', 'P', '', '', '']
  const displayChars = Array(totalLength).fill('').map((_, i) => {
    return currentWord[i] || ''; // 입력된 글자가 있으면 넣고, 없으면 빈칸
  });

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      
      {/* 1. 상태 텍스트 (고정) */}
      <div className="h-8 flex items-center justify-center">
        <div className={`text-xs font-bold tracking-widest ${isCorrect ? 'text-green-600 animate-bounce' : 'text-gray-400 opacity-50'}`}>
          {isCorrect ? 'COMPLETE!' : 'MAKE A WORD'}
        </div>
      </div>

      {/* 2. 메인 단어 입력칸 */}
      <div className="flex flex-wrap justify-center gap-2 mb-2 px-2">
        {displayChars.map((char, index) => {
          // 정답 상태거나, 힌트로 보여주는 상태인지 체크
          const isRevealed = isCorrect || isFlashing;
          
          return (
            <div 
              key={index}
              className={`
                w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl font-black rounded-xl shadow-sm border-b-4 transition-all duration-200
                ${isCorrect 
                  ? 'bg-green-500 border-green-700 text-white' // 정답: 초록색
                  : char 
                    ? 'bg-white border-indigo-200 text-indigo-700' // 입력됨: 흰색+남색
                    : 'bg-gray-100 border-gray-200 text-transparent' // 빈칸: 회색
                }
                ${isFlashing && !isCorrect ? 'bg-yellow-400 border-yellow-600 text-white' : ''} 
              `}
            >
              {/* 글자가 있으면 보여주고, 없으면 빈칸 */}
              {char}
            </div>
          );
        })}
      </div>

      {/* 3. (옵션) 이미 맞춘 단어 목록 - 필요 없으면 삭제 가능 */}
      {solvedWords.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-2 opacity-60 scale-90">
          {solvedWords.map((word, idx) => (
            <span key={idx} className="bg-indigo-100 text-indigo-400 px-2 py-1 rounded text-xs font-bold">
              {word}
            </span>
          ))}
        </div>
      )}

    </div>
  );
};

export default AnswerBoard;
