import React from 'react';

const AnswerBoard = ({ 
  currentWord = '',      
  targetWords = [],       // ["SPICY", "PASTA"]
  foundWords = [],        // ["PASTA"]
  isCorrect, 
  isFlashing,
  hintStage,
  hintMessage // 힌트 메시지 (힌트 1, 2단계 텍스트 표시용)
}) => {
  
  // 최종 결과 정렬: 찾은 단어들을 원래 순서(targetWords 순서)대로 배치
  // isCorrect일 때만 이렇게 보여주고, 게임 중에는 찾은 순서대로 보여줌
  const displayedFoundWords = isCorrect 
    ? targetWords 
    : foundWords;

  return (
    <div className="flex flex-col items-center w-full mb-4">
      
      {/* 1. 힌트 메시지 영역 (1, 2단계용 텍스트) */}
      <div className="h-6 mb-2 flex items-center justify-center">
        {!isCorrect && hintStage > 0 && hintStage < 3 && (
            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
              💡 {hintMessage}
            </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 w-full min-h-[120px] justify-center">
        
        {/* CASE A: 정답을 맞췄을 때 (성공 화면) */}
        {isCorrect && (
           <div className="flex flex-wrap justify-center gap-3 animate-bounce-short">
             {targetWords.map((word, i) => (
               <div key={i} className="flex bg-green-500 text-white px-4 py-3 rounded-xl shadow-md border-b-4 border-green-700">
                 <span className="text-2xl font-black tracking-widest">{word}</span>
               </div>
             ))}
           </div>
        )}

        {/* CASE B: 게임 진행 중 */}
        {!isCorrect && (
          <>
            {/* B-1. 이미 찾은 단어들 (고정됨) */}
            {foundWords.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-2">
                {foundWords.map((word, i) => (
                  <div key={i} className="bg-indigo-600 text-white px-3 py-2 rounded-lg shadow-sm font-bold text-lg opacity-90">
                    {word}
                  </div>
                ))}
              </div>
            )}

            {/* B-2. 현재 입력 중인 단어 or 힌트 3단계 빈칸 */}
            
            {/* [핵심] 힌트 3단계 미만일 때: 그냥 입력한 글자만 보여줌 (칸 수 모름) */}
            {hintStage < 3 && (
               <div className="flex justify-center h-14 items-center">
                 {currentWord.length > 0 ? (
                   <div className="flex gap-1">
                     {currentWord.split('').map((char, i) => (
                       <div key={i} className="w-10 h-12 flex items-center justify-center bg-white border-2 border-indigo-200 rounded-lg text-2xl font-black text-indigo-700 shadow-sm">
                         {char}
                       </div>
                     ))}
                   </div>
                 ) : (
                   // 입력 없을 때 안내 문구
                   <span className="text-gray-300 text-sm font-black tracking-widest animate-pulse">
                     TYPE ANSWER...
                   </span>
                 )}
               </div>
            )}

            {/* [핵심] 힌트 3단계 이상일 때: 모든 구조(_ _ _ _)를 보여줌 */}
            {hintStage >= 3 && (
              <div className="flex flex-col gap-2 items-center w-full">
                 {targetWords.map((word, wIdx) => {
                    // 이 단어가 이미 찾은 단어인지 확인
                    const isSolved = foundWords.includes(word);
                    // 현재 입력 중인 단어가 이 단어의 길이와 맞는지 유추하진 않음. 
                    // 그냥 입력 중인 글자는 별도로 보여주거나, 
                    // 여기서는 '구조'만 보여주는게 맞음.
                    // 하지만 사용자 편의를 위해, 아직 못 찾은 단어 자리에 현재 입력을 매핑해서 보여줄 수 있음.
                    
                    // 로직 단순화: 
                    // 이미 찾은 단어 -> 그대로 보여줌
                    // 못 찾은 단어 -> 빈칸(_ _ _ _)으로 보여줌 (힌트 4단계면 플래시)
                    
                    if (isSolved) return null; // 이미 찾은건 위(B-1)에 표시했으므로 생략하거나, 구조 유지 원하면 표시.
                    // 위 B-1과 중복을 피하기 위해, 여기서는 "아직 못 찾은 단어"의 빈칸만 표시
                    // 단, 현재 입력중인(currentWord) 내용이 어디 들어갈지 모르므로 
                    // 힌트 3단계에서는 "입력창"과 "남은 빈칸"을 분리하는게 깔끔함.
                    
                    return (
                      <div key={wIdx} className="flex gap-1">
                        {word.split('').map((char, cIdx) => (
                           <div key={cIdx} className={`
                              w-10 h-12 flex items-center justify-center rounded-lg border-b-4 text-2xl font-black
                              ${isFlashing 
                                ? 'bg-yellow-400 border-yellow-600 text-white' 
                                : 'bg-gray-200 border-gray-300 text-gray-400'}
                           `}>
                             {isFlashing ? char : ''} {/* 플래시 때만 글자 보임 */}
                           </div>
                        ))}
                      </div>
                    );
                 })}
                 
                 {/* 입력 중인 글자 (힌트 3단계에서도 입력은 보여야 함) */}
                 <div className="mt-2 flex gap-1 h-14 items-center">
                    {currentWord.split('').map((char, i) => (
                       <div key={i} className="w-10 h-12 flex items-center justify-center bg-white border-2 border-indigo-400 rounded-lg text-2xl font-black text-indigo-700">
                         {char}
                       </div>
                    ))}
                 </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
};

export default AnswerBoard;
