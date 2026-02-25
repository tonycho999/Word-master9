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
  const [currentWord, setCurrentWord] = useState('');      
  const [selectedLetters, setSelectedLetters] = useState([]); 
  const [scrambledLetters, setScrambledLetters] = useState([]); 
  
  // 정답 관리
  const [targetWords, setTargetWords] = useState([]); // ["SPICY", "PASTA"]
  const [foundWords, setFoundWords] = useState([]);   // ["PASTA"]
  
  const [category, setCategory] = useState('General');
  const [wordType, setWordType] = useState('Normal');
  
  const [hintStage, setHintStage] = useState(0);
  const [hintMessage, setHintMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false); // 힌트 4단계용

  useEffect(() => {
    const config = LEVEL_CONFIG.find(c => level <= c.maxLevel) || LEVEL_CONFIG[LEVEL_CONFIG.length - 1];
    const seed = (level * 48271) % 100; 

    let selectedWordCount = 1;
    let cumulative = 0;
    for (const [count, prob] of Object.entries(config.probs)) {
      cumulative += prob;
      if (seed < cumulative) {
        selectedWordCount = Number(count);
        break;
      }
    }

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

    const wordIndex = (level * 13 + 7) % targetDB.length;
    const selectedData = targetDB[wordIndex];

    // 공백 기준으로 단어 분리 (2단어 이상 지원)
    const splitWords = selectedData.word.split(' ').filter(w => w.length > 0);
    const combinedString = splitWords.join('');

    setTargetWords(splitWords); 
    setCategory(selectedData.category);
    setWordType(selectedData.type);
    
    // 셔플 초기화
    const chars = combinedString.split('').map((char, index) => ({
      char,
      id: index,
      isUsed: false,
      isSolved: false 
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
    setIsFlashing(false);

  }, [level]);

  const handleLetterClick = (char, index) => {
    playSound('click'); 
    const newWord = currentWord + char;
    setCurrentWord(newWord);
    setSelectedLetters((prev) => [...prev, { char, index }]);

    setScrambledLetters((prev) => {
      const newArr = [...prev];
      if (newArr[index]) newArr[index].isUsed = true;
      return newArr;
    });

    // 부분 정답 체크
    // 입력한 단어(newWord)가 정답 배열(targetWords)에 있는지 확인
    const isTargetWord = targetWords.includes(newWord);
    const isAlreadyFound = foundWords.includes(newWord);
    
    // 중복 단어 처리 (예: "GO GO" -> 첫번째 GO 맞추면 두번째 GO 남음)
    // foundWords에 있는 개수보다 targetWords에 있는 개수가 더 많아야 함
    const targetCount = targetWords.filter(t => t === newWord).length;
    const foundCount = foundWords.filter(f => f === newWord).length;

    if (isTargetWord && foundCount < targetCount) {
      // ★ 정답 발견! ★
      playSound('success');
      
      const newFoundList = [...foundWords, newWord];
      setFoundWords(newFoundList);

      // 입력창 비우기 & 백스페이스 기록 삭제
      setCurrentWord('');
      setSelectedLetters([]);

      // 사용된 버튼들을 'isSolved'로 고정 (셔플/백스페이스 영향 안 받게)
      setScrambledLetters((prev) => {
        const newArr = [...prev];
        const currentIndices = [...selectedLetters.map(s => s.index), index];
        currentIndices.forEach(idx => {
          if (newArr[idx]) {
            newArr[idx].isSolved = true; 
            newArr[idx].isUsed = true;
          }
        });
        return newArr;
      });

      // 전체 클리어 체크
      if (newFoundList.length === targetWords.length) {
        setIsCorrect(true);
      }
    }
  };

  const handleBackspace = () => {
    if (selectedLetters.length === 0) return; 
    playSound('click');
    const lastEntry = selectedLetters[selectedLetters.length - 1];
    
    setCurrentWord((prev) => prev.slice(0, -1));
    setSelectedLetters((prev) => prev.slice(0, -1));

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
    setFoundWords([]);
    setScrambledLetters((prev) => prev.map(item => ({ 
      ...item, 
      isUsed: false,
      isSolved: false 
    })));
  };

  // [수정] 셔플: 입력 중인 글자나 찾은 단어는 건드리지 않고, 남은 버튼만 섞음
  const handleShuffle = () => {
    playSound('shuffle');
    
    setScrambledLetters((prev) => {
      const newArr = [...prev];
      
      // 섞을 수 있는(아직 안 쓴) 인덱스들만 모음
      const availableIndices = [];
      newArr.forEach((item, idx) => {
        if (!item.isUsed && !item.isSolved) {
          availableIndices.push(idx);
        }
      });

      // 그 인덱스들끼리만 내용물 교환
      for (let i = availableIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const idxA = availableIndices[i];
        const idxB = availableIndices[j];
        
        // 스왑
        [newArr[idxA], newArr[idxB]] = [newArr[idxB], newArr[idxA]];
      }
      return newArr;
    });
  };

  const handleHint = () => {
    if (hintStage >= 4 || isCorrect) return;
    const costs = [100, 200, 300, 500];
    const cost = costs[hintStage];
    if (score < cost) return; 

    playSound('hint'); 
    if (setScore) setScore(prev => Math.max(0, prev - cost));
    
    const nextStage = hintStage + 1;
    let message = '';

    switch (nextStage) {
        case 1: 
            const firstLetters = targetWords.map(w => w[0]).join(' ');
            message = `First: ${firstLetters}`;
            break;
        case 2: 
            const lastLetters = targetWords.map(w => w[w.length-1]).join(' ');
            const firsts = targetWords.map(w => w[0]).join(' ');
            message = `First: ${firsts} | Last: ${lastLetters}`;
            break;
        case 3: 
            message = `Length Revealed`;
            break;
        case 4: 
            message = "Quick Look!";
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 500); // 0.5초만 보여줌
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
    targetWords,   
    foundWords,    
    category,
    wordType,
    hintStage,
    hintMessage,
    isCorrect,
    isFlashing, 
    handleLetterClick,
    handleBackspace,
    handleReset,
    handleShuffle,
    handleHint
  };
};
