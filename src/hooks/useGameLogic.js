import { useState, useEffect, useCallback } from 'react';
import { wordDatabase, twoWordDatabase, threeWordDatabase, fourWordDatabase, fiveWordDatabase } from '../data/wordDatabase';

export const useGameLogic = (playSound, level, score, setScore, setMessage) => {
  const [currentWord, setCurrentWord] = useState(() => localStorage.getItem('word-game-current-word') || '');
  const [category, setCategory] = useState(() => localStorage.getItem('word-game-category') || '');
  const [wordType, setWordType] = useState(() => localStorage.getItem('word-game-word-type') || 'Normal');
  const [scrambledLetters, setScrambledLetters] = useState(() => JSON.parse(localStorage.getItem('word-game-scrambled')) || []);
  const [selectedLetters, setSelectedLetters] = useState(() => JSON.parse(localStorage.getItem('word-game-selected')) || []);
  
  // [변경] 복잡한 객체 대신 단순 문자열 배열로 관리 (예: ["APPLE", "RED"])
  const [solvedWords, setSolvedWords] = useState(() => JSON.parse(localStorage.getItem('word-game-solved-words')) || []);
  
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintStage, setHintStage] = useState(() => Number(localStorage.getItem('word-game-hint-stage')) || 0);
  const [hintMessage, setHintMessage] = useState(() => localStorage.getItem('word-game-hint-message') || '');
  const [isFlashing, setIsFlashing] = useState(false);

  // [핵심 1] 레벨에 맞는 단어를 "고정적"으로 불러오는 함수 (랜덤 X)
  const loadNewWord = useCallback(() => {
    // 1. 모든 단어 DB를 순서대로 합칩니다.
    const allWords = [
      ...wordDatabase,
      ...twoWordDatabase,
      ...threeWordDatabase,
      ...fourWordDatabase,
      ...fiveWordDatabase
    ];

    // 2. 레벨에 따라 고정 인덱스 계산 (레벨 1 = 인덱스 0)
    // 데이터보다 레벨이 높아지면 다시 처음부터 순환 (%)
    const fixedIndex = (level - 1) % allWords.length;
    const selectedPick = allWords[fixedIndex];
    
    // 3. 상태 설정
    setCurrentWord(selectedPick.word);
    setCategory(selectedPick.category);
    setWordType(selectedPick.type ? selectedPick.type.toUpperCase() : 'NORMAL');
    
    // 4. 알파벳 섞기 (게임 플레이를 위한 유일한 랜덤 요소)
    const chars = selectedPick.word.replace(/\s/g, '')
      .split('')
      .map((char, i) => ({ char, id: `l-${Date.now()}-${i}-${Math.random()}` }))
      .sort(() => Math.random() - 0.5);
    
    setScrambledLetters(chars);
    setSelectedLetters([]);
    setSolvedWords([]); // 맞춘 단어 초기화
    setIsCorrect(false);
    setHintStage(0);
    setHintMessage('');
    setIsFlashing(false);
    
    console.log(`🔒 [고정 단어 로드] Level: ${level}, Word: ${selectedPick.word}`);
  }, [level]);

  // 초기 실행 및 레벨 변경 시 로드
  useEffect(() => {
    loadNewWord();
  }, [level, loadNewWord]); 

  // [핵심 2] 정답 체크 로직 (순서 무관)
  useEffect(() => {
    if (!currentWord) return;

    // 1. 사용자가 입력한 문자열
    const enteredStr = selectedLetters.map(l => l.char).join('').toUpperCase();
    
    // 2. 정답 단어들을 배열로 분리 (예: "RED APPLE" -> ["RED", "APPLE"])
    const targetWords = currentWord.toUpperCase().split(' ');
    
    // 3. 이미 맞춘 단어 목록
    const alreadySolved = solvedWords.map(w => w.toUpperCase());

    // 4. 입력한 단어가 정답 목록에 있고, 아직 안 맞춘 단어인지 확인
    const matchedWord = targetWords.find(word => word === enteredStr && !alreadySolved.includes(word));

    if (matchedWord) {
      // 정답 발견!
      const newSolvedWords = [...solvedWords, matchedWord];
      setSolvedWords(newSolvedWords);
      setSelectedLetters([]); // 입력창 비우기
      playSound('partialSuccess');
      
      // 5. 승리 조건: 모든 단어를 다 맞췄는지 확인
      // targetWords의 모든 단어가 newSolvedWords에 포함되어야 함
      // (중복 단어가 있을 경우를 대비해 개수 비교가 더 정확하지만, 현재 DB상 중복 단어 문장은 없다고 가정)
      const allCleared = targetWords.every(t => newSolvedWords.includes(t));
      
      if (allCleared) {
        setIsCorrect(true);
        playSound('allSuccess');
      }
    }
  }, [selectedLetters, currentWord, solvedWords, playSound]);

  // 힌트 처리 함수
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
        msg = ""; // 3단계: 메시지 없음 (조용히 구조만 변경)
        nextStage = 3; 
    }
    else { 
        cost = 500; 
        setIsFlashing(true); 
        playSound('flash'); 
        setTimeout(() => setIsFlashing(false), 500); 
        return; 
    }

    if (score >= cost) { 
        setScore(s => s - cost); 
        setHintStage(nextStage); 
        
        // 메시지가 있을 때만 표시 (3단계는 표시 안 함)
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

  // 자동 저장 (solvedWordsData -> solvedWords 키 변경 주의)
  useEffect(() => {
    localStorage.setItem('word-game-current-word', currentWord); 
    localStorage.setItem('word-game-category', category);
    localStorage.setItem('word-game-word-type', wordType); 
    localStorage.setItem('word-game-scrambled', JSON.stringify(scrambledLetters));
    localStorage.setItem('word-game-selected', JSON.stringify(selectedLetters)); 
    localStorage.setItem('word-game-solved-words', JSON.stringify(solvedWords)); // [변경]
    localStorage.setItem('word-game-hint-stage', hintStage); 
    localStorage.setItem('word-game-hint-message', hintMessage);
  }, [currentWord, category, wordType, scrambledLetters, selectedLetters, solvedWords, hintStage, hintMessage]);

  return {
    currentWord, category, wordType, scrambledLetters, selectedLetters, 
    solvedWords, // [변경] solvedWordsData 대신 solvedWords 반환
    isCorrect, hintStage, hintMessage, isFlashing,
    setScrambledLetters, setSelectedLetters, 
    setSolvedWords, // [변경]
    setIsCorrect, setHintStage, setHintMessage, setCurrentWord,
    handleHint, handleShuffle, handleLetterClick, handleReset, handleBackspace, loadNewWord
  };
};
