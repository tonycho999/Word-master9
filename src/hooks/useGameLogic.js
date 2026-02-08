import { useState, useEffect, useCallback } from 'react';
// ★ LEVEL_CONFIG 다시 불러옴
import { wordDatabase, twoWordDatabase, threeWordDatabase, fourWordDatabase, fiveWordDatabase, LEVEL_CONFIG } from '../data/wordDatabase';

export const useGameLogic = (playSound, level, score, setScore, setMessage) => {
  const [currentWord, setCurrentWord] = useState(() => localStorage.getItem('word-game-current-word') || '');
  const [category, setCategory] = useState(() => localStorage.getItem('word-game-category') || '');
  const [wordType, setWordType] = useState(() => localStorage.getItem('word-game-word-type') || 'Normal');
  const [scrambledLetters, setScrambledLetters] = useState(() => JSON.parse(localStorage.getItem('word-game-scrambled')) || []);
  const [selectedLetters, setSelectedLetters] = useState(() => JSON.parse(localStorage.getItem('word-game-selected')) || []);
  const [solvedWords, setSolvedWords] = useState(() => JSON.parse(localStorage.getItem('word-game-solved-words')) || []);
  
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintStage, setHintStage] = useState(() => Number(localStorage.getItem('word-game-hint-stage')) || 0);
  const [hintMessage, setHintMessage] = useState(() => localStorage.getItem('word-game-hint-message') || '');
  const [isFlashing, setIsFlashing] = useState(false);

  // [원상복구 + 고정 로직] LEVEL_CONFIG 기반으로 단어 로드
  const loadNewWord = useCallback(() => {
    // 1. 현재 레벨에 맞는 설정(확률) 가져오기
    // (데이터가 없으면 가장 마지막 설정 사용)
    const config = (LEVEL_CONFIG && LEVEL_CONFIG.find(c => level <= c.maxLevel)) || LEVEL_CONFIG[LEVEL_CONFIG.length - 1];
    
    // 2. [수정] 랜덤 대신 "레벨 기반의 고정된 확률값" 생성 (0 ~ 99)
    // 이렇게 하면 레벨 16은 항상 같은 단어 개수 규칙을 따르게 됨 (새로고침해도 동일)
    const deterministicRandom = (level * 37) % 100; 

    let cumProb = 0;
    let targetWordCount = 1;

    // 설정된 확률표(probs)를 돌면서 단어 개수(1단어? 2단어?) 결정
    if (config && config.probs) {
        for (const [count, prob] of Object.entries(config.probs)) {
            cumProb += prob;
            if (deterministicRandom < cumProb) {
                targetWordCount = Number(count);
                break;
            }
        }
    }
    
    // 3. 결정된 단어 개수에 따라 DB 선택
    let targetPool = wordDatabase;
    if (targetWordCount === 2) targetPool = twoWordDatabase;
    else if (targetWordCount === 3) targetPool = threeWordDatabase;
    else if (targetWordCount === 4) targetPool = fourWordDatabase;
    else if (targetWordCount === 5) targetPool = fiveWordDatabase;

    // 4. 해당 DB 안에서 순서대로 가져오기 (레벨 기반 인덱스)
    const fixedIndex = (level - 1) % targetPool.length;
    const selectedPick = targetPool[fixedIndex] || targetPool[0];
    
    // 상태 초기화
    setCurrentWord(selectedPick.word);
    setCategory(selectedPick.category);
    setWordType(selectedPick.type ? selectedPick.type.toUpperCase() : 'NORMAL');
    
    // 알파벳 섞기
    const chars = selectedPick.word.replace(/\s/g, '')
      .split('')
      .map((char, i) => ({ char, id: `l-${Date.now()}-${i}-${Math.random()}` }))
      .sort(() => Math.random() - 0.5);
    
    setScrambledLetters(chars);
    setSelectedLetters([]);
    setSolvedWords([]); 
    setIsCorrect(false);
    setHintStage(0);
    setHintMessage('');
    setIsFlashing(false);
    
    console.log(`🔒 [고정 단어 로드] Level: ${level}, Words: ${selectedPick.word.split(' ').length} (Config Max: ${config.maxLevel})`);
  }, [level]);

  // 새로고침 시 기존 단어 유지
  useEffect(() => {
    if (!currentWord) {
      loadNewWord();
    }
  }, [level, loadNewWord, currentWord]); 

  // 정답 체크 로직
  useEffect(() => {
    if (!currentWord) return;

    const enteredStr = selectedLetters.map(l => l.char).join('').toUpperCase();
    const targetWords = currentWord.toUpperCase().split(' ');
    const alreadySolved = solvedWords.map(w => w.toUpperCase());

    const matchedWord = targetWords.find(word => word === enteredStr && !alreadySolved.includes(word));

    if (matchedWord) {
      const newSolvedWords = [...solvedWords, matchedWord];
      setSolvedWords(newSolvedWords);
      setSelectedLetters([]);
      playSound('partialSuccess');
      
      const allCleared = targetWords.every(t => newSolvedWords.includes(t));
      if (allCleared) {
        setIsCorrect(true);
        playSound('allSuccess');
      }
    }
  }, [selectedLetters, currentWord, solvedWords, playSound]);

  // 힌트 처리 (힌트 5 깜빡임 유지)
  const handleHint = () => {
    playSound('click'); 
    if (isCorrect) return;

    const words = currentWord.split(' '); 
    let cost = 0; 
    let msg = ''; 
    let nextStage = hintStage;
    
    if (hintStage === 0) { 
        cost = 100; 
        msg = `HINT: ${words.map(w => w[0].toUpperCase() + '...').join(' / ')}`; 
        nextStage = 1; 
    }
    else if (hintStage === 1) { 
        cost = 200; 
        msg = `HINT: ${words.map(w => w.length > 1 ? w[0].toUpperCase() + '...' + w[w.length-1].toUpperCase() : w[0]).join(' / ')}`; 
        nextStage = 2; 
    }
    else if (hintStage === 2) { 
        cost = 300; 
        msg = ""; 
        nextStage = 3; 
    }
    else { 
        cost = 500; 
        setIsFlashing(true); 
        playSound('flash'); 
        setTimeout(() => setIsFlashing(false), 2000); 
        return; 
    }

    if (score >= cost) { 
        setScore(s => s - cost); 
        setHintStage(nextStage); 
        
        if (msg) {
            setHintMessage(msg); 
            if (hintStage !== 2) setMessage(msg); 
        }
    }
    else { 
        setMessage(`Need ${cost} Points!`); 
        setTimeout(() => setMessage(''), 1500); 
    }
  };

  const handleShuffle = () => { playSound('click'); setScrambledLetters(prev => [...prev].sort(() => Math.random() - 0.5)); };
  const handleLetterClick = (l) => { playSound('click'); setSelectedLetters(p => [...p, l]); setScrambledLetters(p => p.filter(i => i.id !== l.id)); };
  const handleReset = () => { playSound('click'); setScrambledLetters(p => [...p, ...selectedLetters]); setSelectedLetters([]); };
  const handleBackspace = () => { if(selectedLetters.length > 0) { playSound('click'); const last = selectedLetters[selectedLetters.length-1]; setSelectedLetters(p => p.slice(0, -1)); setScrambledLetters(p => [...p, last]); } };

  // 자동 저장
  useEffect(() => {
    localStorage.setItem('word-game-current-word', currentWord); 
    localStorage.setItem('word-game-category', category);
    localStorage.setItem('word-game-word-type', wordType); 
    localStorage.setItem('word-game-scrambled', JSON.stringify(scrambledLetters));
    localStorage.setItem('word-game-selected', JSON.stringify(selectedLetters)); 
    localStorage.setItem('word-game-solved-words', JSON.stringify(solvedWords)); 
    localStorage.setItem('word-game-hint-stage', hintStage); 
    localStorage.setItem('word-game-hint-message', hintMessage);
  }, [currentWord, category, wordType, scrambledLetters, selectedLetters, solvedWords, hintStage, hintMessage]);

  return {
    currentWord, category, wordType, scrambledLetters, selectedLetters, 
    solvedWords,
    isCorrect, hintStage, hintMessage, isFlashing,
    setScrambledLetters, setSelectedLetters, 
    setSolvedWords,
    setIsCorrect, setHintStage, setHintMessage, setCurrentWord,
    handleHint, handleShuffle, handleLetterClick, handleReset, handleBackspace, loadNewWord
  };
};
