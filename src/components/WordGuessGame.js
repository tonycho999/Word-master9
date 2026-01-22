import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Trophy, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { wordDatabase, twoWordDatabase, threeWordDatabase } from '../data/wordDatabase';

const WordGuessGame = () => {
  // [1] 초기화: 모든 상태를 로컬 스토리지에서 복구
  const [level, setLevel] = useState(() => Number(localStorage.getItem('word-game-level')) || 1);
  const [score, setScore] = useState(() => Number(localStorage.getItem('word-game-score')) || 0);
  const [usedWordIndices, setUsedWordIndices] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('word-game-used-indices')) || [];
    } catch { return []; }
  });

  // 현재 진행 중인 문제 정보 저장
  const [currentWord, setCurrentWord] = useState(() => localStorage.getItem('word-game-current-word') || '');
  const [category, setCategory] = useState(() => localStorage.getItem('word-game-category') || '');
  const [scrambledLetters, setScrambledLetters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('word-game-scrambled')) || [];
    } catch { return []; }
  });

  const [selectedLetters, setSelectedLetters] = useState([]);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  // [2] 상태가 변할 때마다 즉시 저장 (새로고침 완벽 대비)
  useEffect(() => {
    localStorage.setItem('word-game-level', level);
    localStorage.setItem('word-game-score', score);
    localStorage.setItem('word-game-used-indices', JSON.stringify(usedWordIndices));
    localStorage.setItem('word-game-current-word', currentWord);
    localStorage.setItem('word-game-category', category);
    localStorage.setItem('word-game-scrambled', JSON.stringify(scrambledLetters));
  }, [level, score, usedWordIndices, currentWord, category, scrambledLetters]);

  // [3] 단어 섞기 함수
  const shuffleWord = useCallback((word) => {
    if (!word) return [];
    const chars = word.replace(/\s/g, '').split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.map((char, index) => ({ char, id: Math.random() + index }));
  }, []);

  // [4] 새 단어 불러오기 (중복 방지 및 강제 저장)
  const loadNewWord = useCallback(() => {
    let db;
    let dbKey;
    if (level <= 19) { db = wordDatabase; dbKey = 's'; }
    else if (level <= 99) { db = twoWordDatabase; dbKey = 'd'; }
    else { db = threeWordDatabase; dbKey = 't'; }

    const availableIndices = db
      .map((_, index) => index)
      .filter(index => !usedWordIndices.includes(`${dbKey}-${index}`));

    let targetIndex;
    if (availableIndices.length === 0) {
      targetIndex = Math.floor(Math.random() * db.length);
      setUsedWordIndices([`${dbKey}-${targetIndex}`]);
    } else {
      targetIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setUsedWordIndices(prev => [...prev, `${dbKey}-${targetIndex}`]);
    }

    const wordObj = db[targetIndex];
    const newScrambled = shuffleWord(wordObj.word);

    // 상태 업데이트
    setCurrentWord(wordObj.word);
    setCategory(wordObj.category);
    setScrambledLetters(newScrambled);
    setSelectedLetters([]);
    setMessage('');
    setIsCorrect(false);
  }, [level, usedWordIndices, shuffleWord]);

  // [5] 첫 진입 시 단어가 없으면 생성 (새로고침 시에는 여기서 걸러짐)
  useEffect(() => {
    if (!currentWord) {
      loadNewWord();
    }
  }, [currentWord, loadNewWord]);

  // 정답 확인
  const checkGuess = () => {
    const userAnswer = selectedLetters.map(l => l.char).join('').toLowerCase();
    const correctAnswer = currentWord.replace(/\s/g, '').toLowerCase();

    if (userAnswer === correctAnswer) {
      setMessage('정답입니다! 🎉');
      setIsCorrect(true);
      const nextLevel = level + 1;
      const nextScore = score + level * 10;

      setTimeout(() => {
        // 다음 레벨로 넘어가기 전 현재 문제 정보 초기화 (그래야 새 단어를 불러옴)
        setCurrentWord(''); 
        setScore(nextScore);
        setLevel(nextLevel);
      }, 1500);
    } else {
      setMessage('틀렸습니다. 다시 시도해보세요!');
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
    const all = [...scrambledLetters, ...selectedLetters].sort((a, b) => a.id - b.id);
    setScrambledLetters(all);
    setSelectedLetters([]);
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-700 font-bold text-sm">Level {level}</div>
          <div className="text-lg font-black text-gray-800 flex items-center gap-1">
            <Trophy size={16} className="text-yellow-500" /> {score}
          </div>
        </div>
        
        <div className="text-center mb-6">
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.2em]">Category</span>
          <h2 className="text-xl font-bold text-gray-700">{category}</h2>
        </div>

        {/* 문제 글자들 */}
        <div className="flex flex-wrap gap-2 justify-center mb-6 min-h-[50px]">
          {scrambledLetters.map(l => (
            <button key={l.id} onClick={() => handleLetterClick(l)} className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg shadow-sm active:bg-indigo-100">
              {l.char.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 선택한 글자들 */}
        <div className="min-h-[70px] bg-indigo-50 rounded-2xl flex justify-center items-center gap-2 p-3 mb-6 border-2 border-dashed border-indigo-200">
          {selectedLetters.map(l => (
            <button key={l.id} onClick={() => handleSelectedLetterClick(l)} className="w-10 h-10 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-md">
              {l.char.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={resetAnswer} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">초기화</button>
          <button onClick={checkGuess} disabled={isCorrect} className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg disabled:bg-green-500">
            {isCorrect ? '정답!' : '정답 확인'}
          </button>
        </div>

        {message && <div className={`mt-4 text-center font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>{message}</div>}
      </div>
      
      {/* 데이터 강제 리셋 버튼 (테스트용) */}
      <button 
        onClick={() => { if(window.confirm('모든 기록을 삭제할까요?')) { localStorage.clear(); window.location.reload(); } }}
        className="mt-8 text-indigo-200 text-xs underline opacity-50"
      >
        게임 전체 초기화
      </button>
    </div>
  );
};

export default WordGuessGame;
