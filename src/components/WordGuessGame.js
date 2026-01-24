import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Delete, ArrowRight, Lightbulb, RotateCcw, PlayCircle, X } from 'lucide-react';
// 외부 데이터베이스 불러오기 (데이터가 해당 경로에 있어야 합니다)
import { wordDatabase, twoWordDatabase, threeWordDatabase } from '../data/wordDatabase';

const WordGuessGame = () => {
  // 1. 모든 상태(State)를 최상단에 선언
  const [level, setLevel] = useState(() => Number(localStorage.getItem('word-game-level')) || 1);
  const [score, setScore] = useState(() => Number(localStorage.getItem('word-game-score')) || 300);
  const [usedWordIds, setUsedWordIds] = useState(() => {
    const saved = localStorage.getItem('word-game-used-ids');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentWord, setCurrentWord] = useState('');
  const [category, setCategory] = useState('');
  const [wordType, setWordType] = useState('Normal'); 
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [message, setMessage] = useState('');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);

  // 2. 로컬 스토리지 동기화
  useEffect(() => {
    localStorage.setItem('word-game-level', level);
    localStorage.setItem('word-game-score', score);
    localStorage.setItem('word-game-used-ids', JSON.stringify(usedWordIds));
  }, [level, score, usedWordIds]);

  // 3. 효과음 재생 함수
  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      if (type === 'click') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'success') {
        [600, 800, 1000].forEach((f, i) => {
          const o = ctx.createOscillator(); o.connect(ctx.destination);
          o.frequency.value = f; o.start(ctx.currentTime + i*0.1); o.stop(ctx.currentTime + 0.3);
        });
      }
    } catch (e) { console.log('Audio error'); }
  };

  // 4. 새 단어 로드 함수 (의존성 배열에 필요한 모든 상태 포함)
  const loadNewWord = useCallback(() => {
    let db = level <= 5 ? wordDatabase : (level <= 15 ? twoWordDatabase : threeWordDatabase);
    const preferPhrase = Math.random() < 0.5;
    
    let filtered = db.filter(i => 
      !usedWordIds.includes(i.word) && 
      (level <= 5 ? true : i.type === (preferPhrase ? 'Phrase' : 'Normal'))
    );
    
    if (filtered.length === 0) {
      filtered = db.filter(i => !usedWordIds.includes(i.word));
    }
    if (filtered.length === 0) filtered = db;

    const sel = filtered[Math.floor(Math.random() * filtered.length)];
    const chars = sel.word.replace(/\s/g, '').split('').map((char, i) => ({ 
      char, id: `l-${Date.now()}-${i}-${Math.random()}` 
    })).sort(() => Math.random() - 0.5);

    setCurrentWord(sel.word);
    setCategory(sel.category);
    setWordType(sel.type || 'Normal');
    setScrambledLetters(chars);
    setSelectedLetters([]);
    setIsCorrect(false);
    setHintLevel(0);
    setMessage('');
  }, [level, usedWordIds]);

  // 5. 컴포넌트 마운트 시 단어 로드
  useEffect(() => {
    if (!currentWord) loadNewWord();
  }, [currentWord, loadNewWord]);

  // 6. 정답 체크
  useEffect(() => {
    const combined = selectedLetters.map(l => l.char).join('').toUpperCase();
    const target = currentWord.replace(/\s/g, '').toUpperCase();
    if (combined === target && target.length > 0 && !isCorrect) {
      setIsCorrect(true);
      playSound('success');
      setMessage('GREAT JOB! 🎉');
    }
  }, [selectedLetters, currentWord, isCorrect]);

  const processNextLevel = () => {
    setScore(s => s + 50);
    setLevel(l => l + 1);
    setUsedWordIds(p => [...p, currentWord]);
    setCurrentWord('');
    setShowInterstitial(false);
  };

  const wordCount = currentWord.split(' ').length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-indigo-600 p-4 font-sans relative">
      {showInterstitial && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-10 text-white text-center">
          <button onClick={processNextLevel} className="absolute top-10 right-10"><X size={40}/></button>
          <div className="text-xl font-bold mb-4 opacity-50 uppercase tracking-widest">Ad Break</div>
          <button onClick={processNextLevel} className="bg-white text-black px-10 py-4 rounded-full font-black text-xl shadow-xl">SKIP AD</button>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 w-full max-w-md shadow-2xl flex flex-col items-center border-t-8 border-indigo-500 mx-auto">
        <div className="w-full flex justify-between items-center mb-6 font-black text-indigo-600">
          <span className="text-lg">LV {level}</span>
          <span className="flex items-center gap-1 text-gray-700"><Trophy size={18} className="text-yellow-500"/> {score}</span>
        </div>

        <div className="text-center mb-8">
          <div className="flex gap-2 justify-center mb-2">
            <span className="bg-indigo-100 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
              {wordCount} {wordCount > 1 ? 'Words' : 'Word'}
            </span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${wordType === 'Phrase' ? 'bg-pink-100 text-pink-600' : 'bg-green-100 text-green-600'}`}>
              {wordType === 'Phrase' ? 'Phrase' : 'Normal'}
            </span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase leading-none">{category}</h2>
        </div>

        <div className="flex gap-2 mb-8">
          <button onClick={() => { playSound('click'); setScore(s => s - 100); setHintLevel(1); }} disabled={score < 100 || hintLevel > 0 || isCorrect} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black flex items-center gap-1 uppercase"><Lightbulb size={12}/> {hintLevel > 0 ? currentWord[0] : 'Hint'}</button>
          <button onClick={() => { playSound('click'); setScrambledLetters(p => [...p].sort(() => Math.random() - 0.5)); }} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black flex items-center gap-1 uppercase"><RotateCcw size={12}/> Shuffle</button>
          <button onClick={() => { setIsAdLoading(true); setTimeout(() => { setScore(s => s + 200); setIsAdLoading(false); playSound('success'); }, 3000); }} className="px-4 py-2 bg-amber-400 text-white rounded-full text-[10px] font-black flex items-center gap-1 active:scale-95"><PlayCircle size={12}/> {isAdLoading ? '...' : '+200P'}</button>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-10 min-h-[60px]">
          {scrambledLetters.map(l => (
            <button key={l.id} onClick={() => { playSound('click'); setSelectedLetters(p => [...p, l]); setScrambledLetters(p => p.filter(i => i.id !== l.id)); }} className="w-11 h-11 bg-white border-2 border-gray-100 rounded-xl font-black text-lg shadow-sm hover:border-indigo-400 active:scale-90 transition-all">{l.char.toUpperCase()}</button>
          ))}
        </div>

        <div className={`w-full min-h-[140px] rounded-[2rem] flex flex-col justify-center items-center p-6 mb-8 border-2 border-dashed ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedLetters.length === 0 ? <span className="text-gray-300 font-black uppercase text-[10px] tracking-widest animate-pulse">Select letters</span> : 
              selectedLetters.map(l => <span key={l.id} className={`text-3xl font-black ${isCorrect ? 'text-green-500 scale-110' : 'text-indigo-600'}`}>{l.char.toUpperCase()}</span>)
            }
          </div>
          {isCorrect && <div className="text-green-500 font-black mt-4 text-xs tracking-widest animate-bounce">{message}</div>}
        </div>

        <div className="w-full">
          {isCorrect ? (
            <button onClick={() => level % 10 === 0 ? setShowInterstitial(true) : processNextLevel()} className="w-full bg-green-500 text-white py-5 rounded-[2rem] font-black text-2xl shadow-lg flex items-center justify-center gap-2 transition-all">NEXT LEVEL <ArrowRight size={28}/></button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => { playSound('click'); setScrambledLetters(p => [...p, ...selectedLetters]); setSelectedLetters([]); }} className="flex-1 bg-gray-50 py-5 rounded-[1.5rem] font-black text-gray-400 border border-gray-100 uppercase text-[10px]">Reset</button>
              <button onClick={() => { if(selectedLetters.length > 0) { playSound('click'); const last = selectedLetters[selectedLetters.length-1]; setSelectedLetters(p => p.slice(0, -1)); setScrambledLetters(p => [...p, last]); } }} className="flex-[2] bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-2 shadow-xl active:scale-95"><Delete size={22}/> BACK</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordGuessGame;
