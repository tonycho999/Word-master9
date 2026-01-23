import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trophy, Sparkles, Delete, ArrowRight } from 'lucide-react';
import { wordDatabase, twoWordDatabase, threeWordDatabase } from '../data/wordDatabase';

const WordGuessGame = () => {
  // --- 상태 관리 ---
  const [level, setLevel] = useState(() => Number(localStorage.getItem('word-game-level')) || 1);
  const [score, setScore] = useState(() => Number(localStorage.getItem('word-game-score')) || 300);
  const [usedWordIds, setUsedWordIds] = useState(() => {
    try {
      const saved = localStorage.getItem('word-game-used-ids');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [currentWord, setCurrentWord] = useState(() => localStorage.getItem('word-game-current-word') || '');
  const [category, setCategory] = useState(() => localStorage.getItem('word-game-category') || '');
  const [scrambledLetters, setScrambledLetters] = useState(() => {
    try {
      const saved = localStorage.getItem('word-game-scrambled');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [selectedLetters, setSelectedLetters] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const targetWords = useMemo(() => currentWord.toLowerCase().split(/\s+/).filter(w => w.length > 0), [currentWord]);

  // --- 로컬 스토리지 동기화 ---
  useEffect(() => {
    localStorage.setItem('word-game-level', level);
    localStorage.setItem('word-game-score', score);
    localStorage.setItem('word-game-used-ids', JSON.stringify(usedWordIds));
    localStorage.setItem('word-game-current-word', currentWord);
    localStorage.setItem('word-game-category', category);
    localStorage.setItem('word-game-scrambled', JSON.stringify(scrambledLetters));
  }, [level, score, usedWordIds, currentWord, category, scrambledLetters]);

  // --- 레벨별 단어 수(난이도) 결정 로직 ---
  const getWordTypeByLevel = useCallback((currentLevel) => {
    const rand = Math.random() * 100;
    if (currentLevel >= 1 && currentLevel <= 5) return 1;
    if (currentLevel >= 6 && currentLevel <= 10) return currentLevel % 2 === 0 ? 2 : 1;
    if (currentLevel >= 11 && currentLevel <= 20) return 2;
    if (currentLevel >= 21 && currentLevel < 100) {
      if (currentLevel >= 30) return rand < 30 ? 1 : 2; // 30레벨 이상 1단어 확률 30%
      return 2;
    }
    if (currentLevel >= 100 && currentLevel <= 105) return 3;
    if (currentLevel > 105) {
      if (rand < 60) return 3; // 60% 확률 3단어
      if (rand < 90) return 2; // 30% 확률 2단어
      return 1;                // 10% 확률 1단어
    }
    return 1;
  }, []);

  // --- 새 단어 불러오기 (중복 방지) ---
  const loadNewWord = useCallback(() => {
    const wordType = getWordTypeByLevel(level);
    let db = wordType === 1 ? wordDatabase : wordType === 2 ? twoWordDatabase : threeWordDatabase;
    const dbPrefix = `DB${wordType}`;

    // 아직 사용하지 않은 단어만 필터링
    let availableWords = db.filter(item => !usedWordIds.includes(`${dbPrefix}-${item.word}`));
    
    // 데이터 소진 시 초기화
    if (availableWords.length === 0) availableWords = db;

    const selected = availableWords[Math.floor(Math.random() * availableWords.length)];
    const wordId = `${dbPrefix}-${selected.word}`;

    const chars = selected.word.replace(/\s/g, '').split('').map((char, i) => ({ 
      char, id: `letter-${Date.now()}-${i}-${Math.random()}` 
    })).sort(() => Math.random() - 0.5);

    setUsedWordIds(prev => [...prev, wordId]);
    setCurrentWord(selected.word);
    setCategory(selected.category);
    setScrambledLetters(chars);
    setSelectedLetters([]);
    setIsCorrect(false);
  }, [level, usedWordIds, getWordTypeByLevel]);

  useEffect(() => { if (!currentWord) loadNewWord(); }, [currentWord, loadNewWord]);

  // --- 정답 체크 ---
  useEffect(() => {
    if (selectedLetters.length === 0 || !currentWord || isCorrect) return;
    const userAll = selectedLetters.map(l => l.char).join('').toLowerCase();
    const correctAll = currentWord.replace(/\s/g, '').toLowerCase();
    if (userAll.length === correctAll.length && userAll === correctAll) setIsCorrect(true);
  }, [selectedLetters, currentWord, isCorrect]);

  const removeLastLetter = () => {
    if (selectedLetters.length === 0 || isCorrect) return;
    const last = selectedLetters[selectedLetters.length - 1];
    setSelectedLetters(prev => prev.slice(0, -1));
    setScrambledLetters(prev => [...prev, last]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-indigo-600 p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 w-full max-w-md shadow-2xl flex flex-col items-center border-t-8 border-indigo-500 mx-auto">
        <div className="w-full flex justify-between items-center mb-8 font-black text-indigo-600">
          <span className="flex items-center gap-1"><Sparkles size={18}/> LV {level}</span>
          <span className="flex items-center gap-1 text-gray-700"><Trophy size={18} className="text-yellow-500"/> {score}</span>
        </div>

        <h2 className="text-3xl font-black text-gray-900 uppercase mb-2 tracking-tighter">{category}</h2>
        <div className="bg-indigo-100 text-indigo-700 text-[10px] px-3 py-1 rounded-full font-bold mb-8 uppercase">
          {targetWords.length} Words Mode
        </div>

        {/* 글자 선택 영역 */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 min-h-[64px]">
          {scrambledLetters.map(l => (
            <button key={l.id} onClick={() => { setSelectedLetters(p => [...p, l]); setScrambledLetters(p => p.filter(i => i.id !== l.id)); }} 
              className="w-12 h-12 bg-white border-2 border-gray-100 rounded-2xl font-black text-xl shadow-sm hover:border-indigo-400 active:scale-90 transition-all">
              {l.char.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 답변 입력창 */}
        <div className="w-full min-h-[160px] bg-gray-50 rounded-3xl flex flex-wrap justify-center items-center p-6 mb-8 border-2 border-dashed border-gray-200 shadow-inner">
          {selectedLetters.length === 0 ? <span className="text-gray-300 font-bold uppercase tracking-widest text-sm">Tap Letters</span> : 
            selectedLetters.map(l => <span key={l.id} className="text-4xl font-black text-indigo-600 mx-1">{l.char.toUpperCase()}</span>)
          }
        </div>

        {/* 제어 버튼 */}
        <div className="w-full">
          {isCorrect ? (
            <button onClick={() => { setScore(s => s + (targetWords.length * 10)); setLevel(l => l + 1); setCurrentWord(''); }} 
              className="w-full bg-green-500 text-white py-5 rounded-[2rem] font-black text-2xl shadow-lg animate-bounce flex items-center justify-center gap-2">
              NEXT LEVEL <ArrowRight size={28}/>
            </button>
          ) : (
            <div className="flex gap-3 w-full">
              <button onClick={() => { setScrambledLetters(p => [...p, ...selectedLetters]); setSelectedLetters([]); }} 
                className="flex-1 bg-gray-50 py-5 rounded-[1.5rem] font-black text-gray-400 text-sm border-2 border-gray-100 hover:bg-gray-100 transition-colors">
                RESET
              </button>
              <button onClick={removeLastLetter} disabled={selectedLetters.length === 0} 
                className="flex-[2] bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-2 shadow-xl active:bg-indigo-700 disabled:bg-indigo-300 transition-all">
                <Delete size={22}/> BACKSPACE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordGuessGame;
