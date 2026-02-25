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
  
  const [targetWords, setTargetWords] = useState([]); 
  const [foundWords, setFoundWords] = useState([]);   
  
  const [category, setCategory] = useState('General');
  const [wordType, setWordType] = useState('Normal');
  
  const [hintStage, setHintStage] = useState(0);
  const [hintMessage, setHintMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false); // [추가] 0.5초 플래시용

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

    const splitWords = selectedData.word.split(' ').filter(w => w.length > 0);
    const combinedString = splitWords.join('');

    setTargetWords(splitWords); 
    setCategory(selectedData.category);
    setWordType(selectedData.type);
    
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

    // 정답 체크 (부분 정답 포함)
    const matchIndex = targetWords.findIndex(word => word === newWord);
    
    const remainingWords = targetWords.filter((w) => {
        const targetCount = targetWords.filter(t => t === w).length;
        const foundCount = foundWords.filter(f => f === w).length;
        return w === newWord && foundCount < targetCount;
    });

    if (remainingWords.length > 0) {
      // [수정 3] 부분 정답 시 간단한 메시지와 함께 입력창 비우기
      playSound('success');
      // showMessage('Good!'); // 필요하면 주석 해제 (너무 자주 뜨면 방해됨)
      
      const matchedWord = remainingWords[0];
      const newFoundList = [...foundWords, matchedWord];
      setFoundWords(newFoundList);

      // 입력 초기화
      setCurrentWord('');
      setSelectedLetters([]);

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

  const handleShuffle = () => {
    playSound('shuffle');
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
        case 3: // [수정 6] 자리수 보여주기 (AnswerBoard에서 처리)
            message = `Length Revealed`;
            break;
        case 4: // [수정 7] 0.5초 플래시
            message = "Quick Look!";
            setIsFlashing(true);
            setTimeout(() => {
              setIsFlashing(false); // 0.5초 뒤 끔
            }, 500);
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
    isFlashing, // AnswerBoard로 전달
    handleLetterClick,
    handleBackspace,
    handleReset,
    handleShuffle,
    handleHint
  };
};
