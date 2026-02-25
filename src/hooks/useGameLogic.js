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
  const [isFlashing, setIsFlashing] = useState(false); 

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
    setIsFlashing(false);

    // 힌트 복구
    const savedHintLevel = Number(localStorage.getItem('word-game-hint-level'));
    const savedHintStage = Number(localStorage.getItem('word-game-hint-stage'));
    const savedHintMessage = localStorage.getItem('word-game-hint-message');

    if (savedHintLevel === level) {
        setHintStage(savedHintStage);
        setHintMessage(savedHintMessage || '');
    } else {
        setHintStage(0);
        setHintMessage('');
        localStorage.setItem('word-game-hint-level', level);
        localStorage.setItem('word-game-hint-stage', 0);
        localStorage.setItem('word-game-hint-message', '');
    }

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

    const isTargetWord = targetWords.includes(newWord);
    const targetCount = targetWords.filter(t => t === newWord).length;
    const foundCount = foundWords.filter(f => f === newWord).length;

    if (isTargetWord && foundCount < targetCount) {
      playSound('success');
      
      const newFoundList = [...foundWords, newWord];
      setFoundWords(newFoundList);

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
        localStorage.setItem('word-game-hint-stage', 0);
        localStorage.setItem('word-game-hint-message', '');
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
    setScrambledLetters((prev) => {
      const newArr = [...prev];
      const availableIndices = [];
      newArr.forEach((item, idx) => {
        if (!item.isUsed && !item.isSolved) {
          availableIndices.push(idx);
        }
      });
      for (let i = availableIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const idxA = availableIndices[i];
        const idxB = availableIndices[j];
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

    // 힌트 텍스트 생성 (공통)
    const firsts = targetWords.map(w => w[0]).join(' ');
    const lasts = targetWords.map(w => w[w.length-1]).join(' ');

    switch (nextStage) {
        case 1: 
            message = `First: ${firsts}`;
            break;
        case 2: 
            message = `First: ${firsts} | Last: ${lasts}`;
            break;
        case 3: 
            // 3단계: 텍스트는 그대로 유지 (화면에 언더바만 생김)
            message = `First: ${firsts} | Last: ${lasts}`;
            break;
        case 4: 
            // ▼▼▼ [수정] "Quick Look!" 텍스트 삭제 ▼▼▼
            // 대신 기존 힌트(First/Last)를 그대로 보여줘서 덮어쓰지 않게 함
            message = `First: ${firsts} | Last: ${lasts}`;
            
            // 플래시 효과 실행
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 800); 
            break;
        default: break;
    }
    
    setHintStage(nextStage);
    setHintMessage(message);

    localStorage.setItem('word-game-hint-level', level);
    localStorage.setItem('word-game-hint-stage', nextStage);
    localStorage.setItem('word-game-hint-message', message);
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
