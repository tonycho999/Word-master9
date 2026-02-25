import { useState, useEffect } from 'react';
import { 
  wordDatabase, 
  twoWordDatabase, 
  threeWordDatabase, 
  fourWordDatabase, 
  fiveWordDatabase,
  LEVEL_CONFIG 
} from '../data/wordDatabase';

export const useGameLogic = (playSound, level, score, setScore, showMessage) => {
  // 입력 중인 단어 (한 덩어리)
  const [currentWord, setCurrentWord] = useState('');      
  // Backspace용 기록
  const [selectedLetters, setSelectedLetters] = useState([]); 
  // 전체 버튼 상태 (isUsed: 입력중, isSolved: 정답확정)
  const [scrambledLetters, setScrambledLetters] = useState([]); 
  
  // ▼▼▼ [핵심] 다중 단어 관리 상태 ▼▼▼
  const [targetWords, setTargetWords] = useState([]); // ["SPICY", "PASTA"]
  const [foundWords, setFoundWords] = useState([]);   // 맞춘 단어들 저장 ["PASTA"]
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  
  const [category, setCategory] = useState('General');
  const [wordType, setWordType] = useState('Normal');
  
  const [hintStage, setHintStage] = useState(0);
  const [hintMessage, setHintMessage] = useState(''); // 힌트 텍스트 (UI 표시용)
  const [isCorrect, setIsCorrect] = useState(false);

  // 레벨 초기화 로직
  useEffect(() => {
    // 1. 레벨 설정 가져오기
    const config = LEVEL_CONFIG.find(c => level <= c.maxLevel) || LEVEL_CONFIG[LEVEL_CONFIG.length - 1];
    const seed = (level * 48271) % 100; 

    // 2. 단어 개수 결정
    let selectedWordCount = 1;
    let cumulative = 0;
    for (const [count, prob] of Object.entries(config.probs)) {
      cumulative += prob;
      if (seed < cumulative) {
        selectedWordCount = Number(count);
        break;
      }
    }

    // 3. DB 선택
    let targetDB = [];
    switch (selectedWordCount) {
      case 1: targetDB = wordDatabase; break;
      case 2: targetDB = twoWordDatabase; break;
      case 3: targetDB = threeWordDatabase; break;
      case 4: targetDB = fourWordDatabase; break;
      case 5: targetDB = fiveWordDatabase; break;
      default: targetDB = wordDatabase;
    }
    if (!targetDB || targetDB.length === 0) targetDB = wordDatabase;

    // 4. 단어 선택
    const wordIndex = (level * 13 + 7) % targetDB.length;
    const selectedData = targetDB[wordIndex];

    // 5. 단어 분리 ("SPICY PASTA" -> ["SPICY", "PASTA"])
    // 공백을 기준으로 나눠서 배열로 저장
    const splitWords = selectedData.word.split(' ').filter(w => w.length > 0);
    const combinedString = splitWords.join(''); // "SPICYPASTA" (셔플용)

    setTargetWords(splitWords); // 정답 배열 저장
    setCategory(selectedData.category);
    setWordType(selectedData.type);
    
    // 6. 셔플
    const chars = combinedString.split('').map((char, index) => ({
      char,
      id: index,
      isUsed: false,
      isSolved: false // [추가] 이미 정답으로 확정된 글자
    }));
    
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    
    setScrambledLetters(chars);
    setCurrentWord('');
    setSelectedLetters([]);
    setFoundWords([]);
    setIsCorrect(false);
    setHintStage(0);
    setHintMessage('');

  }, [level]);


  // ▼▼▼ [수정] 글자 클릭 핸들러 (다중 단어 매칭) ▼▼▼
  const handleLetterClick = (char, index) => {
    playSound('click'); 
    const newWord = currentWord + char;
    setCurrentWord(newWord);
    setSelectedLetters((prev) => [...prev, { char, index }]);

    // 버튼을 '사용중'으로 변경
    setScrambledLetters((prev) => {
      const newArr = [...prev];
      if (newArr[index]) newArr[index].isUsed = true;
      return newArr;
    });

    // --- 정답 체크 로직 ---
    // 현재 입력한 단어가 타겟 단어들 중에 있는지 확인 (이미 찾은건 제외)
    // 순서 상관없이 매칭
    const matchIndex = targetWords.findIndex(word => 
      word === newWord && !foundWords.includes(word) // 똑같은 단어가 2개 있을 수 있으므로 로직 주의
      // (만약 같은 단어가 2개면 하나만 매칭. 여기선 간단히 includes 체크하지만
      // 엄밀히는 count 체크가 필요할 수 있음. 하지만 보통 다른 단어임)
    );
    
    // 만약 foundWords에 이미 있는 단어라도, targetWords에 그 단어가 여러개면 또 맞출 수 있어야 함.
    // 여기서는 간단하게 "아직 못 찾은 단어들" 중에서 검색
    const remainingWords = targetWords.filter((w, i) => {
        // foundWords에 있는 갯수만큼 targetWords에서 제외하고 남은 것들... 
        // 로직이 복잡해지니 간단히: 입력된 단어가 targetWords에 포함되면 정답 처리
        // 단, 이미 찾은 횟수보다 targetWords에 있는 횟수가 더 많아야 함.
        const targetCount = targetWords.filter(t => t === w).length;
        const foundCount = foundWords.filter(f => f === w).length;
        return w === newWord && foundCount < targetCount;
    });

    if (remainingWords.length > 0) {
      // ★ 단어 하나를 맞춤! ★
      playSound('success');
      
      // 1. 찾은 단어 목록에 추가
      const matchedWord = remainingWords[0];
      const newFoundList = [...foundWords, matchedWord];
      setFoundWords(newFoundList);

      // 2. 현재 입력 초기화 (다음 단어 입력을 위해)
      setCurrentWord('');
      setSelectedLetters([]); // 백스페이스 기록 날림 (확정되었으므로)

      // 3. 사용된 버튼들을 'isSolved'(완전 확정) 상태로 변경
      setScrambledLetters((prev) => {
        const newArr = [...prev];
        // 현재 selectedLetters에 있는 인덱스들을 모두 solved 처리
        // 주의: setSelectedLetters가 비동기라 위에서 초기화했지만 여기선 prev값 안씀.
        // 방금 클릭한 index까지 포함해야 함.
        const currentIndices = [...selectedLetters.map(s => s.index), index];
        
        currentIndices.forEach(idx => {
          if (newArr[idx]) {
            newArr[idx].isSolved = true; // 이제 백스페이스로 못 살림
            newArr[idx].isUsed = true;
          }
        });
        return newArr;
      });

      // 4. 모든 단어를 다 찾았는지 확인 (레벨 클리어)
      if (newFoundList.length === targetWords.length) {
        setIsCorrect(true);
        // showMessage('PERFECT!'); // 팝업 제거됨
      }
    }
  };

  const handleBackspace = () => {
    if (selectedLetters.length === 0) return; 
    playSound('click');
    const lastEntry = selectedLetters[selectedLetters.length - 1];
    
    setCurrentWord((prev) => prev.slice(0, -1));
    setSelectedLetters((prev) => prev.slice(0, -1));

    // 버튼 다시 활성화 (solved가 아닌 경우만)
    setScrambledLetters((prev) => {
      const newArr = [...prev];
      if (newArr[lastEntry.index] && !newArr[lastEntry.index].isSolved) {
        newArr[lastEntry.index].isUsed = false;
      }
      return newArr;
    });
  };

  const handleReset = () => {
    playSound('click');
    setCurrentWord('');
    setSelectedLetters([]);
    setFoundWords([]); // 찾은 단어도 초기화
    setScrambledLetters((prev) => prev.map(item => ({ 
      ...item, 
      isUsed: false,
      isSolved: false 
    })));
  };

  const handleShuffle = () => {
    playSound('shuffle');
    // 입력 중이거나 찾은 단어가 있으면 셔플 시 곤란할 수 있음.
    // 여기서는 "입력 중인 것만" 초기화하고, "이미 찾은 단어"의 글자들은 고정해야 함.
    // 하지만 구현이 복잡하므로 간단히: 전체 리셋 후 셔플 (가장 깔끔)
    handleReset();
    
    setTimeout(() => {
        setScrambledLetters((prev) => {
          const newArr = [...prev];
          for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
          }
          return newArr;
        });
    }, 10);
  };

  // ▼▼▼ [수정] 힌트 로직 (다중 단어 대응) ▼▼▼
  const handleHint = () => {
    if (hintStage >= 4 || isCorrect) return;
    const costs = [100, 200, 300, 500];
    const cost = costs[hintStage];
    if (score < cost) return; 

    playSound('hint'); 
    if (setScore) setScore(prev => Math.max(0, prev - cost));
    
    const nextStage = hintStage + 1;
    let message = '';

    // targetWords = ["SPICY", "PASTA"]
    switch (nextStage) {
        case 1: // 첫 글자들 (S, P)
            const firstLetters = targetWords.map(w => w[0]).join(', ');
            message = `First: ${firstLetters}`;
            break;
        case 2: // 마지막 글자들 (Y, A)
            const lastLetters = targetWords.map(w => w[w.length-1]).join(', ');
            // 1단계 힌트도 같이 보여줌
            const firsts = targetWords.map(w => w[0]).join(', ');
            message = `First: ${firsts} | Last: ${lastLetters}`;
            break;
        case 3: // 자리수 (UI에서 처리하므로 메시지는 간단히)
            message = `Length Revealed`;
            break;
        case 4: // 정답 플래시
            message = targetWords.join(' '); 
            break;
        default: break;
    }
    setHintStage(nextStage);
    setHintMessage(message);
  };

  return {
    currentWord,
    selectedLetters, 
    scrambledLetters,
    // 다중 단어 처리를 위한 새로운 리턴값들
    targetWords,   // ["SPICY", "PASTA"]
    foundWords,    // ["PASTA"] (현재 찾은 것들)
    
    category,
    wordType,
    hintStage,
    hintMessage,
    isCorrect,
    handleLetterClick,
    handleBackspace,
    handleReset,
    handleShuffle,
    handleHint
  };
};
