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
  const [solvedWords, setSolvedWords] = useState([]);      
  
  const [category, setCategory] = useState('General');
  const [wordType, setWordType] = useState('Normal');
  const [targetWord, setTargetWord] = useState(''); 
  const [hintStage, setHintStage] = useState(0);
  const [hintMessage, setHintMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  // 레벨별 단어 선택 로직 (확률 개선판)
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
    const cleanTargetWord = selectedData.word.replace(/\s/g, ''); // 공백 제거
    
    setTargetWord(cleanTargetWord);
    setCategory(selectedData.category);
    setWordType(selectedData.type);
    
    // 셔플
    const chars = cleanTargetWord.split('').map((char, index) => ({
      char,
      id: index,
      isUsed: false 
    }));
    
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

    if (newWord.length === targetWord.length) {
      if (newWord === targetWord) {
        setIsCorrect(true);
        playSound('success');
      } else {
        playSound('error');
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
      if (newArr[lastEntry.index]) newArr[lastEntry.index].isUsed = false;
      return newArr;
    });
  };

  const handleReset = () => {
    playSound('click');
    setCurrentWord('');
    setSelectedLetters([]);
    setScrambledLetters((prev) => prev.map(item => ({ ...item, isUsed: false })));
  };

  const handleShuffle = () => {
    playSound('shuffle');
    setCurrentWord('');
    setSelectedLetters([]);
    setScrambledLetters((prev) => {
      const newArr = [...prev].map(item => ({ ...item, isUsed: false }));
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
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
        case 1: message = `Starts with "${targetWord[0]}"`; break;
        case 2: message = `Ends with "${targetWord[targetWord.length - 1]}"`; break;
        case 3: message = `${targetWord.length} Letters`; break;
        case 4: message = targetWord; break;
        default: break;
    }
    setHintStage(nextStage);
    setHintMessage(message);
    // showMessage 제거 (팝업 안 띄움)
  };

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
    targetWord, // [필수] AnswerBoard에 정답 길이 전달용
    handleLetterClick,
    handleBackspace,
    handleReset,
    handleShuffle,
    handleHint
  };
};
