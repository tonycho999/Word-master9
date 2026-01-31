import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Trophy, Delete, ArrowRight, Lightbulb, RotateCcw, PlayCircle } from 'lucide-react';
import { wordDatabase, twoWordDatabase, threeWordDatabase } from '../data/wordDatabase';

const fourWordDatabase = [
  { word: 'BIG RED FIRE TRUCK', category: 'VEHICLES', type: 'Phrase' },
  { word: 'DEEP BLUE OCEAN WATER', category: 'NATURE', type: 'Phrase' },
  { word: 'SPRING SUMMER FALL WINTER', category: 'SEASON', type: 'Normal' }
];

const WordGuessGame = () => {
  // --- 기존 State 유지 ---
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
  const [wordType, setWordType] = useState(() => localStorage.getItem('word-game-word-type') || 'Normal');
  const [scrambledLetters, setScrambledLetters] = useState(() => {
    try {
      const saved = localStorage.getItem('word-game-scrambled');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedLetters, setSelectedLetters] = useState(() => {
    try {
      const saved = localStorage.getItem('word-game-selected');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [isCorrect, setIsCorrect] = useState(false);
  const [hintLevel, setHintLevel] = useState(() => Number(localStorage.getItem('word-game-hint-level')) || 0);
  const [message, setMessage] = useState('');

  // --- 광고 버튼 제어용 새로운 State ---
  const [isAdVisible, setIsAdVisible] = useState(true);
  const [adClickCount, setAdClickCount] = useState(0);
  const [isAdLoading, setIsAdLoading] = useState(false);

  const matchedWordsRef = useRef(new Set());
  const audioCtxRef = useRef(null);

  // --- 광고 로직: 초기 데이터 로드 및 쿨타임 확인 ---
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const savedDate = localStorage.getItem('ad-click-date');
    const savedCount = Number(localStorage.getItem('ad-click-count')) || 0;
    const lastClickTime = Number(localStorage.getItem('ad-last-click-time')) || 0;

    // 날짜가 바뀌었으면 초기화
    if (savedDate !== today) {
      localStorage.setItem('ad-click-date', today);
      localStorage.setItem('ad-click-count', '0');
      setAdClickCount(0);
    } else {
      setAdClickCount(savedCount);
    }

    // 마지막 클릭 후 5분이 지났는지 확인
    const checkCooldown = () => {
      const now = Date.now();
      const diff = now - lastClickTime;
      const cooldownMs = 5 * 60 * 1000; // 5분

      if (diff < cooldownMs) {
        setIsAdVisible(false);
        // 남은 시간만큼 대기 후 다시 표시
        setTimeout(() => setIsAdVisible(true), cooldownMs - diff);
      } else {
        setIsAdVisible(true);
      }
    };

    checkCooldown();
  }, []);

  // --- 기존 localStorage 저장 로직 유지 ---
  useEffect(() => {
    localStorage.setItem('word-game-level', level);
    localStorage.setItem('word-game-score', score);
    localStorage.setItem('word-game-used-ids', JSON.stringify(usedWordIds));
    localStorage.setItem('word-game-current-word', currentWord);
    localStorage.setItem('word-game-category', category);
    localStorage.setItem('word-game-word-type', wordType);
    localStorage.setItem('word-game-scrambled', JSON.stringify(scrambledLetters));
    localStorage.setItem('word-game-selected', JSON.stringify(selectedLetters));
    localStorage.setItem('word-game-hint-level', hintLevel);
  }, [level, score, usedWordIds, currentWord, category, wordType, scrambledLetters, selectedLetters, hintLevel]);

  // --- 사운드 및 단어 로드 로직 (기존과 동일) ---
  const playSound = useCallback(async (type) => { /* 생략 - 기존 코드와 동일 */ }, []);
  const loadNewWord = useCallback(() => { /* 생략 - 기존 코드와 동일 */ }, [level, usedWordIds]);
  useEffect(() => { if (!currentWord) loadNewWord(); }, [currentWord, loadNewWord]);

  const handleHint = () => { /* 생략 - 기존 코드와 동일 */ };

  // --- 수정된 광고 클릭 핸들러 ---
  const handleRewardAd = () => {
    playSound('click');
    
    // 하루 20회 제한 체크
    if (adClickCount >= 20) {
      setMessage("Daily Limit Reached (20/20)");
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setIsAdLoading(true);
    setIsAdVisible(false); // 즉시 버튼 숨김

    // 광고 시뮬레이션 (2.5초)
    setTimeout(() => {
      const newCount = adClickCount + 1;
      setAdClickCount(newCount);
      setScore(s => s + 200);
      setIsAdLoading(false);
      
      // 기록 업데이트
      localStorage.setItem('ad-click-count', newCount.toString());
      localStorage.setItem('ad-last-click-time', Date.now().toString());

      playSound('reward'); 
      setMessage('+200P Reward!');
      setTimeout(() => setMessage(''), 2000);

      // 5분 후 다시 버튼 표시 (하루 제한 안 넘었을 때만)
      if (newCount < 20) {
        setTimeout(() => setIsAdVisible(true), 5 * 60 * 1000);
      }
    }, 2500);
  };

  // --- 게임 로직 및 렌더링 (기존 코드 유지 및 광고 UI 수정) ---
  const targetWords = useMemo(() => currentWord.toLowerCase().split(/\s+/).filter(w => w.length > 0), [currentWord]);
  const wordCount = targetWords.length;

  const { renderedComponents, allMatched } = useMemo(() => {
    // ... 기존 렌더링 로직 동일 ...
    return { renderedComponents: [], allMatched: false }; // 실제 코드는 기존 것 사용
  }, [selectedLetters, targetWords, currentWord, playSound]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-indigo-600 p-4 font-sans relative text-gray-900">
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-md shadow-2xl flex flex-col items-center border-t-8 border-indigo-500 mx-auto">
        
        {/* 상단바 (Level, Trophy) */}
        <div className="w-full flex justify-between items-center mb-4 font-black text-indigo-600">
          <span className="text-lg uppercase">LEVEL {level}</span>
          <span className="flex items-center gap-1 text-gray-700"><Trophy size={18} className="text-yellow-500"/> {score}</span>
        </div>

        {/* 광고 및 힌트 도구 섹션 */}
        <div className="w-full space-y-2 mb-6">
          <div className="flex gap-2 w-full">
            <button onClick={handleHint} disabled={isCorrect || hintLevel >= 2} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 uppercase active:scale-95 shadow-sm disabled:opacity-40">
              <Lightbulb size={12}/> {hintLevel === 0 ? 'Hint 1' : hintLevel === 1 ? 'Hint 2' : 'No More'}
            </button>
            <button onClick={() => { playSound('click'); setScrambledLetters(p => [...p].sort(() => Math.random() - 0.5)); }} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 uppercase active:scale-95 shadow-sm">
              <RotateCcw size={12}/> Shuffle
            </button>
          </div>

          {/* 수정된 광고 버튼 조건부 렌더링 */}
          {isAdVisible && adClickCount < 20 ? (
            <button onClick={handleRewardAd} className="w-full px-4 py-2.5 bg-amber-400 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 active:scale-95 shadow-md">
              <PlayCircle size={14}/> {isAdLoading ? 'WATCHING...' : `GET FREE +200P (${adClickCount}/20)`}
            </button>
          ) : (
            <div className="w-full py-2 text-center text-[9px] text-gray-400 font-bold italic bg-gray-50 rounded-lg">
              {adClickCount >= 20 ? "Daily limit reached" : "Next reward available in 5 mins"}
            </div>
          )}
        </div>

        {/* ... 나머지 게임판 및 로직 (기본 코드와 동일) ... */}
        
      </div>
    </div>
  );
};

export default WordGuessGame;
