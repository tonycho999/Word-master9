import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trophy, Lightbulb, RotateCcw, Sparkles, Download, X, Delete, ArrowRight } from 'lucide-react';
import { wordDatabase, twoWordDatabase, threeWordDatabase } from '../data/wordDatabase';

const WordGuessGame = () => {
  // --- 1. 상태 관리 ---
  const [level, setLevel] = useState(() => Number(localStorage.getItem('word-game-level')) || 1);
  const [score, setScore] = useState(() => {
    const savedScore = localStorage.getItem('word-game-score');
    return savedScore !== null ? Number(savedScore) : 300;
  });
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
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(() => !localStorage.getItem('install-guide-seen'));

  const targetWords = useMemo(() => 
    currentWord.toLowerCase().split(/\s+/).filter(w => w.length > 0)
  , [currentWord]);

  // --- 2. 로컬 스토리지 저장 ---
  useEffect(() => {
    localStorage.setItem('word-game-level', level);
    localStorage.setItem('word-game-score', score);
    localStorage.setItem('word-game-used-ids', JSON.stringify(usedWordIds));
    localStorage.setItem('word-game-current-word', currentWord);
    localStorage.setItem('word-game-category', category);
    localStorage.setItem('word-game-scrambled', JSON.stringify(scrambledLetters));
  }, [level, score, usedWordIds, currentWord, category, scrambledLetters]);

  // --- 3. 단어 로드 로직 (중복 방지 강화) ---
  const loadNewWord = useCallback(() => {
    let db = level <= 19 ? wordDatabase : level <= 99 ? twoWordDatabase : threeWordDatabase;
    const dbPrefix = level <= 19 ? 'LV1' : level <= 99 ? 'LV2' : 'LV3';

    const availableWords = db.filter(item => {
      const wordId = `${dbPrefix}-${item.word}-${item.category}`;
      return !usedWordIds.includes(wordId);
    });

    let selectedWordObj;
    if (availableWords.length > 0) {
      selectedWordObj = availableWords[Math.floor(Math.random() * availableWords.length)];
    } else {
      selectedWordObj = db[Math.floor(Math.random() * db.length)];
    }

    const wordId = `${dbPrefix}-${selectedWordObj.word}-${selectedWordObj.category}`;

    const chars = selectedWordObj.word.replace(/\s/g, '').split('').map((char, i) => ({ 
      char, 
      id: `letter-${Date.now()}-${i}-${Math.random()}` 
    }));

    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    setUsedWordIds(prev => [...prev, wordId]);
    setCurrentWord(selectedWordObj.word);
    setCategory(selectedWordObj.category);
    setScrambledLetters(chars);
    setSelectedLetters([]);
    setMessage('');
    setIsCorrect(false);
    setShowHint(false);
  }, [level, usedWordIds]);

  useEffect(() => {
    if (!currentWord) loadNewWord();
  }, [currentWord, loadNewWord]);

  // --- 4. 정답 체크 및 레벨업 ---
  useEffect(() => {
    if (selectedLetters.length === 0 || !currentWord || isCorrect) return;

    const userAll = selectedLetters.map(l => l.char).join('').toLowerCase();
    const correctAll = currentWord.replace(/\s/g, '').toLowerCase();

    // 사용자가 입력한 글자 수가 정답 길이와 같을 때 체크
    if (userAll.length === correctAll.length) {
      if (userAll === correctAll) {
        setIsCorrect(true);
        setMessage('EXCELLENT! 🎉');
      } else {
        setMessage('TRY AGAIN!');
      }
    }
  }, [selectedLetters, currentWord, isCorrect]);

  const goToNextLevel = () => {
    const earnedScore = targetWords.length * 10;
    setScore(s => s + earnedScore);
    setLevel(l => l + 1);
    setCurrentWord(''); // 이 설정이 loadNewWord를 트리거함
    setIsCorrect(false);
  };

  // --- 5. 유틸리티 함수 ---
  const handleHintClick = () => {
    if (!showHint && score >= 100) {
      setScore(prev => prev - 100);
      setShowHint(true);
    }
  };

  const removeLastLetter = () => {
    if (selectedLetters.length === 0 || isCorrect) return;
    const lastLetter = selectedLetters[selectedLetters.length - 1];
    setSelectedLetters(prev => prev.slice(0, -1));
    setScrambledLetters(prev => [...prev, lastLetter]);
    setMessage('');
  };

  const closeInstallGuide = () => {
    localStorage.setItem('install-guide-seen', 'true');
    setShowInstallGuide(false);
  };

  // --- 6. 렌더링 도우미 ---
  const renderFreeOrderWords = () => {
    let tempSelected = [...selectedLetters];
    let matchedWords = Array(targetWords.length).fill(null);
    let usedInMatch = new Set();

    targetWords.forEach((target, wordIdx) => {
      for (let i = 0; i <= tempSelected.length - target.length; i++) {
        const slice = tempSelected.slice(i, i + target.length);
        const sliceText = slice.map(l => l.char).join('').toLowerCase();
        if (sliceText === target) {
          matchedWords[wordIdx] = { letters: slice, isMatch: true };
          slice.forEach(l => usedInMatch.add(l.id));
          break;
        }
      }
    });

    let unmatchedLetters = selectedLetters.filter(l => !usedInMatch.has(l.id));
    
    return targetWords.map((target, idx) => {
      const isWordCorrect = matchedWords[idx] !== null;
      const displayLetters = isWordCorrect ? matchedWords[idx].letters : unmatchedLetters.splice(0, target.length);

      return (
        <div key={`row-${idx}`} className="flex flex-col items-center mb-6 last:mb-0 w-full">
          <div className="flex gap-2 items-center flex-wrap justify-center min-h-[48px]">
            {displayLetters.map((l) => (
              <span key={l.id} className={`font-black ${isWordCorrect ? 'text-green-500 scale-110' : 'text-indigo-600'} ${target.length > 8 ? 'text-2xl' : 'text-4xl'}`}>
                {l.char.toUpperCase()}
              </span>
            ))}
            {isWordCorrect && <span className="text-green-500 font-bold ml-2 text-2xl">✓</span>}
          </div>
          <div className={`h-1.5 rounded-full mt-2 transition-all duration-500 ${isWordCorrect ? 'bg-green-400 w-full' : 'bg-indigo-100 w-20'}`} />
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4 font-sans text-gray-800">
      
      {/* 설치 안내창 */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-indigo-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative text-center border-t-8 border-indigo-500">
            <button onClick={closeInstallGuide} className="absolute top-4 right-4 text-gray-400"><X size={24} /></button>
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Download size={32} /></div>
            <h3 className="text-xl font-black mb-2 text-indigo-900">앱 설치 방법</h3>
            <div className="space-y-4 text-left bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6 text-xs leading-relaxed">
              <p><strong>안드로이드:</strong> 브라우저 우측 상단 <strong>메뉴(⋮)</strong> 클릭 후 <strong>'홈 화면에 추가'</strong>를 누르세요.</p>
              <p><strong>아이폰:</strong> 하단 <strong>공유 아이콘(↑)</strong> 클릭 후 <strong>'홈 화면에 추가'</strong>를 누르세요.</p>
            </div>
            <button onClick={closeInstallGuide} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg">확인했습니다</button>
          </div>
        </div>
      )}

      {/* 메인 게임 카드 */}
      <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 font-bold text-indigo-600 uppercase">
            <Sparkles size={18} className="text-yellow-400" /> Level {level}
          </div>
          <div className="flex items-center gap-1 font-black text-gray-700">
            <Trophy size={18} className="text-yellow-500" /> {score}
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black uppercase mb-1">{category}</h2>
          <span className="text-[11px] font-black text-white bg-indigo-500 px-3 py-1 rounded-full mb-4 inline-block shadow-sm">
            {targetWords.length} {targetWords.length > 1 ? 'WORDS' : 'WORD'}
          </span>

          <div className="flex justify-center gap-3">
            <button onClick={handleHintClick} className="px-4 py-2 bg-gray-50 border rounded-full text-xs font-bold shadow-sm">
              <Lightbulb size={14} className={`inline mr-1 ${showHint ? 'text-yellow-500' : ''}`}/>
              {showHint ? 'HINT ON' : 'HINT (-100)'}
            </button>
            <button onClick={() => { if (!isCorrect) setScrambledLetters(prev => [...prev].sort(() => Math.random() - 0.5)) }} className="px-4 py-2 bg-gray-50 border rounded-full text-xs font-bold shadow-sm">
              <RotateCcw size={14} className="inline mr-1"/>SHUFFLE
            </button>
          </div>
          {showHint && (
            <div className="mt-3 p-2 bg-yellow-50 rounded-xl border border-yellow-100 text-xs text-indigo-600 font-bold">
              Hint: {targetWords.map(w => w[0].toUpperCase() + "...").join(", ")}
            </div>
          )}
        </div>

        {/* 알파벳 버튼 영역 */}
        <div className="flex flex-wrap gap-2 justify-center mb-8 min-h-[60px]">
          {scrambledLetters.map(l => (
            <button 
              key={l.id} 
              onClick={() => {
                if (isCorrect) return;
                setScrambledLetters(prev => prev.filter(i => i.id !== l.id));
                setSelectedLetters(prev => [...prev, l]);
                setMessage('');
              }} 
              className="w-11 h-11 bg-white border-2 border-gray-100 rounded-xl font-bold text-lg shadow-sm active:scale-95 transition-all"
            >
              {l.char.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 답변 영역 */}
        <div className="min-h-[180px] bg-indigo-50 rounded-2xl flex flex-col justify-center items-center p-6 mb-8 border-2 border-dashed border-indigo-200">
          {selectedLetters.length === 0 ? (
            <span className="text-indigo-200 text-sm font-bold uppercase tracking-widest">Touch Letters</span>
          ) : (
            <div className="w-full">{renderFreeOrderWords()}</div>
          )}
        </div>

        {/* 하단 제어 버튼 */}
        <div className="min-h-[64px]">
          {isCorrect ? (
            <button 
              onClick={goToNextLevel}
              className="w-full bg-green-500 text-white py-4 rounded-2xl font-black text-xl shadow-lg flex items-center justify-center gap-2 animate-bounce"
            >
              NEXT LEVEL <ArrowRight size={24} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setScrambledLetters(prev => [...prev, ...selectedLetters]);
                  setSelectedLetters([]);
                  setMessage('');
                }} 
                className="flex-1 bg-gray-50 py-4 rounded-2xl font-bold text-gray-400 uppercase"
              >
                Reset
              </button>
              <button 
                onClick={removeLastLetter} 
                disabled={selectedLetters.length === 0} 
                className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg active:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2"
              >
                <Delete size={20} /> Backspace
              </button>
            </div>
          )}
        </div>
        
        {message && <div className="mt-4 text-center font-black text-indigo-600 tracking-widest uppercase animate-pulse">{message}</div>}
      </div>
    </div>
  );
};

export default WordGuessGame;
