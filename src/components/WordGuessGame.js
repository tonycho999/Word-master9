새로고침 시 초기화되는 문제는 보통 두 가지 원인 중 하나입니다. 코드가 브라우저의 저장소(LocalStorage)에 접근하기 전에 초기화되거나, Vercel 배포 시 이전 캐시가 남아있어 수정된 코드가 반영되지 않은 경우입니다.

코드를 더 확실하게 보호하기 위해 localStorage 로직을 보강한 최종 버전과 확인 절차를 안내해 드릴게요.

1. 수정된 WordGuessGame.js (보강 버전)
이 버전은 useEffect의 실행 순서를 더 엄격하게 제어하여 데이터 유실을 방지합니다.

JavaScript

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Trophy, RotateCcw, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { wordDatabase, twoWordDatabase, threeWordDatabase } from '../data/wordDatabase';

const WordGuessGame = () => {
  // 1. 상태 선언 시 즉시 LocalStorage 읽기
  const [level, setLevel] = useState(() => Number(localStorage.getItem('word-game-level')) || 1);
  const [score, setScore] = useState(() => Number(localStorage.getItem('word-game-score')) || 0);
  const [usedWordIndices, setUsedWordIndices] = useState(() => {
    const saved = localStorage.getItem('word-game-used-indices');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentWord, setCurrentWord] = useState('');
  const [category, setCategory] = useState('');
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // 2. 값 변경 시 즉시 저장 (동기화)
  useEffect(() => {
    localStorage.setItem('word-game-level', level.toString());
    localStorage.setItem('word-game-score', score.toString());
    localStorage.setItem('word-game-used-indices', JSON.stringify(usedWordIndices));
  }, [level, score, usedWordIndices]);

  // 단어 섞기 (생략 방지를 위해 이전 로직 유지)
  const shuffleWord = useCallback((word) => {
    if (!word) return [];
    const chars = word.replace(/\s/g, '').split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.map((char, index) => ({ char, id: index }));
  }, []);

  const getRandomWord = useCallback(() => {
    let db = level <= 19 ? wordDatabase : level <= 99 ? twoWordDatabase : threeWordDatabase;
    const dbKey = db === wordDatabase ? 's' : db === twoWordDatabase ? 'd' : 't';
    
    const availableIndices = db
      .map((_, index) => index)
      .filter(index => !usedWordIndices.includes(`${dbKey}-${index}`));

    let targetIndex;
    if (availableIndices.length === 0) {
      setUsedWordIndices([]);
      targetIndex = Math.floor(Math.random() * db.length);
    } else {
      targetIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    const newUsed = [...usedWordIndices, `${dbKey}-${targetIndex}`];
    setUsedWordIndices(newUsed);
    return db[targetIndex];
  }, [level, usedWordIndices]);

  // 단어 로드 로직
  useEffect(() => {
    if (!currentWord) {
      const wordObj = getRandomWord();
      if (wordObj) {
        setCurrentWord(wordObj.word);
        setCategory(wordObj.category);
        setScrambledLetters(shuffleWord(wordObj.word));
        setSelectedLetters([]);
        setMessage('');
        setIsCorrect(false);
        setShowHint(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]); // level이 바뀔 때만 새 단어 로드

  // 정답 확인 및 레벨업
  const checkGuess = () => {
    const userAnswer = selectedLetters.map(l => l.char).join('').toLowerCase();
    const correctAnswer = currentWord.replace(/\s/g, '').toLowerCase();

    if (userAnswer === correctAnswer) {
      setMessage('Correct! 🎉');
      setIsCorrect(true);
      const newScore = score + level * 10;
      setScore(newScore);
      
      setTimeout(() => {
        if (level < 200) {
          setCurrentWord(''); // 단어를 비워야 다음 useEffect가 작동함
          setLevel(prev => prev + 1);
        }
      }, 1500);
    } else {
      setMessage('Incorrect. Try again!');
      setIsCorrect(false);
    }
  };

  // 나머지 핸들러(handleLetterClick, resetAnswer 등)는 이전과 동일
  const handleLetterClick = (letter) => {
    setScrambledLetters(scrambledLetters.filter(l => l.id !== letter.id));
    setSelectedLetters([...selectedLetters, letter]);
    setMessage('');
  };

  const handleSelectedLetterClick = (letter) => {
    setSelectedLetters(selectedLetters.filter(l => l.id !== letter.id));
    setScrambledLetters(prev => [...prev, letter].sort((a, b) => a.id - b.id));
  };

  const resetAnswer = () => {
    const all = [...scrambledLetters, ...selectedLetters].sort((a, b) => a.id - b.id);
    setScrambledLetters(all);
    setSelectedLetters([]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
      {/* UI 부분은 이전과 동일하되, Tailwind가 안 먹힐 경우를 대비해 인라인 스타일이나 기본 배경색 확인 */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Level {level}</h2>
            <div className="text-xl font-bold text-indigo-600">Score: {score}</div>
         </div>
         {/* ... (생략된 게임 버튼 및 로직 필드) ... */}
         <div className="text-center font-bold text-lg mb-4 text-purple-600">Category: {category}</div>
         <div className="flex flex-wrap gap-2 justify-center mb-6">
            {scrambledLetters.map(l => (
                <button key={l.id} onClick={() => handleLetterClick(l)} className="w-12 h-12 bg-gray-100 rounded-lg font-bold text-xl">{l.char.toUpperCase()}</button>
            ))}
         </div>
         <div className="min-h-[60px] bg-indigo-50 rounded-lg flex justify-center items-center gap-2 p-2 mb-6">
            {selectedLetters.map(l => (
                <button key={l.id} onClick={() => handleSelectedLetterClick(l)} className="w-12 h-12 bg-indigo-500 text-white rounded-lg font-bold text-xl">{l.char.toUpperCase()}</button>
            ))}
         </div>
         <button onClick={checkGuess} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mb-3">Check Answer</button>
         <button onClick={resetAnswer} className="w-full bg-gray-200 py-2 rounded-xl text-gray-600">Reset</button>
         {message && <div className="mt-4 text-center font-bold">{message}</div>}
      </div>
    </div>
  );
};

export default WordGuessGame;
