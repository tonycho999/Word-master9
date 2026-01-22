import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Trophy, RotateCcw, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { wordDatabase, twoWordDatabase, threeWordDatabase } from '../data/wordDatabase';

const WordGuessGame = () => {
  // [1] 초기화: localStorage에서 직접 읽어오기
  const [level, setLevel] = useState(() => Number(localStorage.getItem('word-game-level')) || 1);
  const [score, setScore] = useState(() => Number(localStorage.getItem('word-game-score')) || 0);
  const [usedWordIndices, setUsedWordIndices] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('word-game-used-indices')) || [];
    } catch { return []; }
  });

  const [currentWord, setCurrentWord] = useState('');
  const [category, setCategory] = useState('');
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // [2] 단어 섞기 함수
  const shuffleWord = useCallback((word) => {
    if (!word) return [];
    const chars = word.replace(/\s/g, '').split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.map((char, index) => ({ char, id: Math.random() + index }));
  }, []);

  // [3] 단어 선택 로직 (중복 방지 강화)
  const loadNewWord = useCallback(() => {
    let db;
    let dbKey;
    if (level <= 19) { db = wordDatabase; dbKey = 's'; }
    else if (level <= 99) { db = twoWordDatabase; dbKey = 'd'; }
    else { db = threeWordDatabase; dbKey = 't'; }

    // 현재까지 쓴 인덱스 가져오기
    const savedIndices = JSON.parse(localStorage.getItem('word-game-used-indices')) || [];
    const availableIndices = db
      .map((_, index) => index)
      .filter(index => !savedIndices.includes(`${dbKey}-${index}`));

    let targetIndex;
    let newUsedIndices;

    if (availableIndices.length === 0) {
      targetIndex = Math.floor(Math.random() * db.length);
      newUsedIndices = [`${dbKey}-${targetIndex}`];
    } else {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      targetIndex = availableIndices[randomIndex];
      newUsedIndices = [...savedIndices, `${dbKey}-${targetIndex}`];
    }

    // 상태 업데이트 전에 localStorage에 즉시 강제 저장 (새로고침 대비)
    localStorage.setItem('word-game-used-indices', JSON.stringify(newUsedIndices));
    setUsedWordIndices(newUsedIndices);

    const wordObj = db[targetIndex];
    setCurrentWord(wordObj.word);
    setCategory(wordObj.category);
    setScrambledLetters(shuffleWord(wordObj.word));
    setSelectedLetters([]);
    setMessage('');
    setIsCorrect(false);
    setShowHint(false);
  }, [level, shuffleWord]);

  // [4] 레벨이 바뀌거나 처음 시작할 때 단어 로드
  useEffect(() => {
    loadNewWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // [5] 정답 확인 및 데이터 보존
  const checkGuess = () => {
    const userAnswer = selectedLetters.map(l => l.char).join('').toLowerCase();
    const correctAnswer = currentWord.replace(/\s/g, '').toLowerCase();

    if (userAnswer === correctAnswer) {
      setMessage('Correct! 🎉');
      setIsCorrect(true);
      
      const nextLevel = level + 1;
      const nextScore = score + level * 10;

      // 중요: 상태 변경 전 localStorage에 즉시 반영
      localStorage.setItem('word-game-level', nextLevel);
      localStorage.setItem('word-game-score', nextScore);

      setTimeout(() => {
        setScore(nextScore);
        setLevel(nextLevel); // 여기서 useEffect가 트리거되어 새 단어가 로드됨
      }, 1500);
    } else {
      setMessage('Incorrect. Try again!');
      setIsCorrect(false);
    }
  };

  const handleLetterClick = (letter) => {
    setScrambledLetters(prev => prev.filter(l => l.id !== letter.id));
    setSelectedLetters(prev => [...prev, letter]);
  };

  const handleSelectedLetterClick = (letter) => {
    setSelectedLetters(prev => prev.filter(l => l.id !== letter.id));
    setScrambledLetters(prev => [...prev, letter]);
  };

  const resetAnswer = () => {
    loadNewWord(); // 아예 새 단어를 가져오거나, 기존 섞인 상태로 되돌리려면 로직 수정 가능
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-indigo-100 px-4 py-1 rounded-full text-indigo-700 font-bold">Level {level}</div>
          <div className="text-xl font-black text-gray-800">Score: {score}</div>
        </div>
        
        <div className="text-center mb-6">
          <span className="text-sm text-purple-500 font-bold uppercase tracking-widest">Category</span>
          <h2 className="text-2xl font-bold text-gray-700">{category}</h2>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8 min-h-[60px]">
          {scrambledLetters.map(l => (
            <button key={l.id} onClick={() => handleLetterClick(l)} className="w-12 h-12 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-xl hover:border-indigo-500">{l.char.toUpperCase()}</button>
          ))}
        </div>

        <div className="min-h-[80px] bg-indigo-50 rounded-2xl flex justify-center items-center gap-2 p-4 mb-8 border-2 border-dashed border-indigo-200">
          {selectedLetters.map(l => (
            <button key={l.id} onClick={() => handleSelectedLetterClick(l)} className="w-12 h-12 bg-indigo-600 text-white rounded-xl font-bold text-xl shadow-md">{l.char.toUpperCase()}</button>
          ))}
        </div>

        <button onClick={checkGuess} disabled={isCorrect} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-700 disabled:bg-green-500 transition-colors">
          {isCorrect ? 'Great!' : 'Check Answer'}
        </button>
      </div>
    </div>
  );
};

export default WordGuessGame;
