import { useState, useEffect } from 'react';
// ▼▼▼ 방금 만든 데이터 파일에서 가져옵니다 ▼▼▼
import { 
  wordDatabase, 
  twoWordDatabase, 
  threeWordDatabase, 
  fourWordDatabase, 
  fiveWordDatabase,
  LEVEL_CONFIG 
} from '../data/wordDatabase';

export const useGameLogic = (playSound, level, score, setScore, showMessage) => {
  // 상태 변수들
  const [currentWord, setCurrentWord] = useState('');      
  const [selectedLetters, setSelectedLetters] = useState([]); // {char, index} 저장 (Back 버튼용)
  const [scrambledLetters, setScrambledLetters] = useState([]); 
  const [solvedWords, setSolvedWords] = useState([]); // (확장성을 위해 유지)
  
  const [category, setCategory] = useState('General');
  const [wordType, setWordType] = useState('Normal');
  const [targetWord, setTargetWord] = useState(''); // 공백이 제거된 정답 단어
  
  const [hintStage, setHintStage] = useState(0);
  const [hintMessage, setHintMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  // ▼▼▼ [핵심] 레벨에 따른 결정론적 단어 선택 로직 ▼▼▼
  useEffect(() => {
    // 1. 현재 레벨에 맞는 설정(Config) 찾기
    const config = LEVEL_CONFIG.find(c => level <= c.maxLevel) || LEVEL_CONFIG[LEVEL_CONFIG.length - 1];

    // 2. 결정론적 난수 생성 (Math.random() 대신 레벨을 기반으로 계산)
    // 이 방식은 같은 레벨에서는 항상 같은 값을 반환합니다. (모든 유저 동일)
    const seed = level * 1234567; // 시드값
    const probValue = seed % 100; // 0 ~ 99 사이의 숫자

    // 3. 확률에 따라 단어 개수(1~5단어) 선택
    let selectedWordCount = 1;
    let cumulative = 0;
    
    // probs 객체를 순회하며 확률 계산
    for (const [count, prob] of Object.entries(config.probs)) {
      cumulative += prob;
      if (probValue < cumulative) {
        selectedWordCount = Number(count);
        break;
      }
    }

    // 4. 선택된 단어 수에 맞는 데이터베이스 매핑
    let targetDB = [];
    switch (selectedWordCount) {
      case 1: targetDB = wordDatabase; break;
      case 2: targetDB = twoWordDatabase; break;
      case 3: targetDB = threeWordDatabase; break;
      case 4: targetDB = fourWordDatabase; break;
      case 5: targetDB = fiveWordDatabase; break;
      default: targetDB = wordDatabase;
    }

    // 5. DB에서 단어 하나를 '고정적으로' 선택 (레벨 기반 인덱스)
    // (level * 777)을 사용하여 랜덤해 보이지만 고정된 순서로 가져옴
    const wordIndex = (level * 777) % targetDB.length;
    const selectedData = targetDB[wordIndex];

    // 6. 데이터 설정
    // 게임 로직을 위해 정답에서 공백(띄어쓰기)은 제거 (예: "ICE CREAM" -> "ICECREAM")
    const cleanTargetWord = selectedData.word.replace(/\s/g, ''); 
    
    setTargetWord(cleanTargetWord);
    setCategory(selectedData.category); // DB 카테고리
    setWordType(selectedData.type);     // DB 타입 (Normal/Phrase)
    
    // 7. 단어 섞기 (셔플)
    // 섞인 모양은 랜덤이어도 상관없으므로 여기는 Math.random 사용
    const chars = cleanTargetWord.split('').map((char, index) => ({
      char,
      id: index,
      isUsed: false 
    }));
    
    // 피셔-예이츠 셔플
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    
    setScrambledLetters(chars);
    setCurrentWord('');
    setSelectedLetters([]);
    setSolvedWords([]);
    setIsCorrect(false);
    setHintStage(0);
    setHintMessage('');

  }, [level]); // 레벨이 바뀔 때마다 재실행

  // ▼▼▼ 사용자 인터랙션 핸들러 ▼▼▼

  // 1. 글자 클릭
  const handleLetterClick = (char, index) => {
    playSound('click'); 

    const newWord = currentWord + char;
    setCurrentWord(newWord);
    
    // [중요] 글자와 '원래 위치(index)'를 함께 저장 (Back 기능용)
    setSelectedLetters((prev) => [...prev, { char, index }]);

    // 버튼 비활성화 (회색 처리)
    setScrambledLetters((prev) => {
      const newArr = [...prev];
      if (newArr[index]) {
        newArr[index].isUsed = true;
      }
      return newArr;
    });

    // 정답 체크
    if (newWord.length === targetWord.length) {
      if (newWord === targetWord) {
        setIsCorrect(true);
        playSound('success');
        // 메시지 팝업 제거됨 (요청사항 반영)
      } else {
        playSound('error');
      }
    }
  };

  // 2. 뒤로가기 (Backspace)
  const handleBackspace = () => {
    if (selectedLetters.length === 0) return; 

    playSound('click');
    const lastEntry = selectedLetters[selectedLetters.length - 1];

    setCurrentWord((prev) => prev.slice(0, -1));
    setSelectedLetters((prev) => prev.slice(0, -1));

    // [중요] 원래 위치의 버튼을 다시 활성화
    setScrambledLetters((prev) => {
      const newArr = [...prev];
      if (newArr[lastEntry.index]) {
        newArr[lastEntry.index].isUsed = false;
      }
      return newArr;
    });
  };

  // 3. 초기화 (Reset)
  const handleReset = () => {
    playSound('click');
    setCurrentWord('');
    setSelectedLetters([]);
    setScrambledLetters((prev) => prev.map(item => ({ ...item, isUsed: false })));
  };

  // 4. 섞기 (Shuffle)
  const handleShuffle = () => {
    playSound('shuffle');
    // 셔플 시 입력 중이던 것은 초기화하는 것이 안전
    setCurrentWord('');
    setSelectedLetters([]);
    
    setScrambledLetters((prev) => {
      const newArr = [...prev].map(item => ({ ...item, isUsed: false }));
      // 다시 섞기
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    });
  };

  // 5. 힌트 (Hint)
  const handleHint = () => {
    if (hintStage >= 4 || isCorrect) return;
    
    // 점수가 부족하면 실행 안 함 (옵션)
    const costs = [100, 200, 300, 500];
    const cost = costs[hintStage];
    if (score < cost) {
       showMessage('Not enough coins!');
       return;
    }

    playSound('hint'); // 힌트 소리 (있다면)
    
    // 점수 차감
    if (setScore) setScore(prev => Math.max(0, prev - cost));
    
    const nextStage = hintStage + 1;
    let message = '';

    switch (nextStage) {
        case 1: // 첫 글자
            message = `Starts with "${targetWord[0]}"`;
            break;
        case 2: // 마지막 글자
            message = `Ends with "${targetWord[targetWord.length - 1]}"`;
            break;
        case 3: // 길이 정보
            message = `${targetWord.length} Letters long`;
            break;
        case 4: // 정답 공개
            message = targetWord; 
            break;
        default: break;
    }

    setHintStage(nextStage);
    setHintMessage(message);
    showMessage(`-${cost} Coins: ${message}`);
  };

  // [필수] 반환 값 (AnswerBoard.js 오류 방지를 위해 selectedLetters 포함)
  return {
    currentWord,
    selectedLetters, 
    scrambledLetters,
    solvedWords,
    setSolvedWords,
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
