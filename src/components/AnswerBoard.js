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
      
      {/* 1. 정답 표시 영역 (고정된 위치) */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 w-full px-2">
        {targetWords.map((word, wIdx) => {
            // 이 단어를 이미 찾았는지 확인
            // (동일 단어 중복 처리를 위해 필터링 필요하지만, 시각적으로 foundWords에 포함되면 킴)
            const isSolved = foundWords.includes(word);
            
            // 보여줄지 말지 결정
            // 조건: 찾았거나, 플래시(힌트4)거나, 힌트3(언더바)일 때
            const showPlaceholder = !isSolved && hintStage >= 3;
            const showWord = isSolved || isFlashing;

            // 아직 못 찾았고 힌트도 없으면 -> 공간은 차지하되 안 보임 (투명 처리 대신 아예 렌더링 안함? 
            // 아니면 입력 중인 단어가 들어갈 자리를 비워둠? 
            // 요청하신 대로 "정답이 나오면 원래 순서대로 배열"하려면 자리를 잡아두는 게 좋음.
            
            if (!showWord && !showPlaceholder) {
                // 힌트 1,2단계에서는 아직 단어의 존재(자리)를 모름. 숨김.
                // 하지만 "2words이상에서... 정답이 나오면 사라지지 않고..." 조건 만족 위해
                // 찾은 단어는 보이고 못 찾은 단어는 안 보여야 함.
                return null;
            }

            return (
                <div key={wIdx} className="flex gap-1 items-end">
                    {word.split('').map((char, cIdx) => {
                        return (
                            <div key={cIdx} className="flex items-end justify-center w-6 sm:w-8 h-10">
                                {showWord ? (
                                    // 정답/플래시: 흰색 글자 (박스 없음)
                                    <span className={`text-2xl sm:text-3xl font-black ${isSolved ? 'text-green-400' : 'text-yellow-300 animate-pulse'}`}>
                                        {char}
                                    </span>
                                ) : (
                                    // 힌트 3단계: 언더바 (글자 없음)
                                    <div className="w-full h-1 bg-white/50 rounded-full mb-2"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        })}
      </div>

      {/* 2. 현재 입력 중인 단어 (Typewriter Style) */}
      {/* 정답을 다 맞추지 않았을 때만 입력창 표시 */}
      {!isCorrect && (
         <div className="mt-8 h-12 flex items-end justify-center">
           {currentWord.length > 0 ? (
             <div className="flex gap-1 animate-fade-in">
               {currentWord.split('').map((char, i) => (
                 <div key={i} className="w-8 flex justify-center">
                    <span className="text-4xl font-black text-white drop-shadow-md">
                      {char}
                    </span>
                 </div>
               ))}
               {/* 커서 효과 */}
               <div className="w-1 h-8 bg-white/70 animate-pulse mb-1 ml-1"></div>
             </div>
           ) : (
             // 입력 대기 중일 때 (힌트 3단계 미만이면 여기가 메인 화면처럼 보임)
             // 힌트 3단계 미만이고 아직 찾은 단어가 하나도 없으면 "Type Answer" 표시
             (hintStage < 3 && foundWords.length === 0) && (
                <span className="text-white/40 text-sm font-bold tracking-[0.3em] animate-pulse">
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
