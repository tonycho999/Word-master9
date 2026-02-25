import React from 'react';

const AnswerBoard = ({ 
  currentWord = '',      
  targetWords = [],       
  foundWords = [],        
  isCorrect, 
  isFlashing, // 0.5초 깜빡임 상태
  hintStage,
}) => {
  
  // 정답을 맞췄으면 targetWords(원래 순서)를 다 보여줌.
  // 게임 중에는 아래 로직으로 그림.

  return (
    <div className="flex flex-col items-center w-full mb-4">
      
      {/* Answer Display Area 
         - 정답을 맞춘 단어는 고정됨 (순서: targetWords 기준)
         - 못 맞춘 단어는 힌트 단계에 따라 다르게 보임
      */}
      <div className="flex flex-col items-center gap-6 w-full min-h-[100px] justify-center">
        
        {/* 상단: 정답 구조 표시 영역 (힌트 3단계 이상 또는 찾은 단어 표시) */}
        {/* [수정 4] targetWords 순서대로 렌더링하여 'Spicy Pasta' 순서 보장 */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {targetWords.map((word, wIdx) => {
                // 이 단어를 찾았는지 확인 (단, 같은 단어가 여러개일 경우 갯수 체크 필요하지만 여기선 단순화)
                // foundWords에 있는 단어라면 '공개' 상태
                // 주의: foundWords는 찾은 순서대로 들어있음.
                // targetWords의 이 위치에 있는 단어가 foundWords에 포함되어 있는지 확인.
                // 정확한 매칭을 위해 foundWords 복사본에서 하나씩 지우면서 매칭해야 하나,
                // UI 표시는 "이 단어가 찾아졌냐"만 중요함.
                const isSolved = foundWords.includes(word);
                
                // 표시 조건:
                // 1. 이미 찾은 단어임 (isSolved)
                // 2. 힌트 3단계 이상 (구조 보기: _ _ _ _)
                // 3. 힌트 4단계 (플래시: 단어 잠깐 보임)
                
                // 아무것도 해당 안되면? -> 아예 안 보여줌 (숨김)
                if (!isSolved && hintStage < 3 && !isFlashing) return null;

                return (
                    <div key={wIdx} className="flex gap-1 items-end">
                        {word.split('').map((char, cIdx) => {
                            let displayChar = '';
                            let styleClass = "border-b-4 border-gray-300"; // 기본 언더바 스타일

                            if (isSolved) {
                                // 찾은 단어: 글자 보임, 초록색
                                displayChar = char;
                                styleClass = "text-green-600 font-black text-3xl border-none";
                            } else if (isFlashing) {
                                // [수정 7] 플래시: 글자 보임, 노란색
                                displayChar = char;
                                styleClass = "text-yellow-500 font-black text-3xl border-none animate-pulse";
                            } else if (hintStage >= 3) {
                                // [수정 6] 힌트 3단계: 언더바(_), 글자 숨김
                                displayChar = ""; 
                                styleClass = "border-b-4 border-gray-300 w-6 h-8 mx-0.5";
                            }

                            return (
                                <div key={cIdx} className={`flex items-end justify-center ${styleClass}`}>
                                    {displayChar}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>

        {/* 하단: 현재 입력 중인 단어 (Typewriter Style) */}
        {/* [수정 2] 박스 제거, 글자만 타이핑되듯이 나옴 */}
        {!isCorrect && (
           <div className="h-16 flex items-end justify-center">
             {currentWord.length > 0 ? (
               <div className="flex gap-1 animate-fade-in">
                 {currentWord.split('').map((char, i) => (
                   <span key={i} className="text-4xl font-black text-indigo-800 tracking-widest uppercase drop-shadow-sm">
                     {char}
                   </span>
                 ))}
                 {/* 커서 효과 (선택사항) */}
                 <span className="w-1 h-8 bg-indigo-400 animate-pulse mb-1 ml-1"></span>
               </div>
             ) : (
               // 입력 없을 때 안내
               <span className="text-gray-300 text-sm font-bold tracking-[0.3em] opacity-40 mb-2">
                 TYPE ANSWER
               </span>
             )}
           </div>
        )}
        
      </div>
    </div>
  );
};

export default AnswerBoard;
