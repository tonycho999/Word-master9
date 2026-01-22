import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Trophy, RotateCcw, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { wordDatabase, twoWordDatabase, threeWordDatabase } from '../data/wordDatabase';

const WordGuessGame = () => {
  const [level, setLevel] = useState(1);
  const [currentWord, setCurrentWord] = useState('');
  const [category, setCategory] = useState('');
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // 1. 랜덤 단어 선택 함수 (useCallback)
  const getRandomWord = useCallback(() => {
    if (level <= 19) {
      const index = Math.floor(Math.random() * wordDatabase.length);
      return wordDatabase[index];
    } else if (level <= 99) {
      const index = Math.floor(Math.random() * twoWordDatabase.length);
      return twoWordDatabase[index];
    } else {
      const index = Math.floor(Math.random() * threeWordDatabase.length);
      return threeWordDatabase[index];
    }
  }, [level]); // level이 바뀔 때마다 함수가 갱신됨

  // 2. 단어 섞기 함수 (useCallback)
  const shuffleWord = useCallback((word) => {
    if (!word) return [];
    const chars = word.replace(/\s/g, '').split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.map((char, index) => ({ char, id: index }));
  }, []);

  // 3. 레벨 초기화 (useEffect)
  // 의존성 배열에 함수들을 추가하여 빌드 에러 방지
  useEffect(() => {
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
  }, [level, getRandomWord, shuffleWord]); 

  // 글자 클릭 처리
  const handleLetterClick = (letter) => {
    setScrambledLetters(scrambledLetters.filter(l => l.id !== letter.id));
    setSelectedLetters([...selectedLetters, letter]);
    setMessage('');
  };

  // 선택된 글자 클릭 처리 (되돌리기)
  const handleSelectedLetterClick = (letter) => {
    setSelectedLetters(selectedLetters.filter(l => l.id !== letter.id));
    setScrambledLetters([...scrambledLetters, letter].sort((a, b) => a.id - b.id));
  };

  // 리셋
  const resetAnswer = () => {
    const allLetters = [...scrambledLetters, ...selectedLetters].sort((a, b) => a.id - b.id);
    setScrambledLetters(allLetters);
    setSelectedLetters([]);
    setMessage('');
  };

  // 글자 다시 섞기
  const shuffleLetters = () => {
    const allLetters = [...scrambledLetters, ...selectedLetters];
    const shuffled = [...allLetters];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setScrambledLetters(shuffled);
    setSelectedLetters([]);
    setMessage('');
  };

  // 정답 확인
  const checkGuess = () => {
    const userAnswer = selectedLetters.map(l => l.char).join('').toLowerCase();
    const correctAnswer = currentWord.replace(/\s/g, '').toLowerCase();

    if (userAnswer === correctAnswer) {
      setMessage('Correct! 🎉');
      setIsCorrect(true);
      setScore(prev => prev + level * 10);
      
      setTimeout(() => {
        if (level < 200) {
          setLevel(prev => prev + 1);
        } else {
          setMessage('Congratulations! You completed all levels! 🏆');
        }
      }, 1500);
    } else {
      setMessage('Incorrect. Try again!');
      setIsCorrect(false);
    }
  };

  // 힌트 보기
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* 헤더 부분 */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="text-yellow-500" size={32} />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Word Scramble
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-2xl">
              <Trophy className="text-yellow-600" size={20} />
              <span className="font-bold text-yellow-700">{score}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-2xl font-bold">
              Level {level}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {level <= 19 ? 'Phase: Beginner' : level <= 99 ? 'Phase: Intermediate' : 'Phase: Master'}
            </div>
          </div>
        </div>

        {/* 메인 게임 영역 */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="inline-block bg-purple-100 px-4 py-2 rounded-full">
              <p className="text-purple-700 font-semibold text-sm">Category: {category}</p>
            </div>
            <button
              onClick={shuffleLetters}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="mb-6 text-center">
            <button
              onClick={toggleHint}
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline font-medium"
            >
              <Lightbulb size={18} />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {showHint && currentWord && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200 text-sm">
                Starts with: <span className="font-bold">{currentWord[0].toUpperCase()}</span> | 
                Length: <span className="font-bold">{currentWord.replace(/\s/g, '').length}</span>
              </div>
            )}
          </div>

          {/* 섞인 글자들 */}
          <div className="mb-8">
            <div className="bg-indigo-50 rounded-2xl p-6 min-h-[100px] flex flex-wrap gap-3 justify-center items-center">
              {scrambledLetters.map((letter) => (
                <button
                  key={letter.id}
                  onClick={() => handleLetterClick(letter)}
                  className="bg-white text-gray-800 font-bold text-xl w-12 h-12 rounded-xl shadow-sm hover:scale-110 transition-transform border-2 border-indigo-100"
                >
                  {letter.char.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* 입력한 정답 영역 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Answer</span>
              <button onClick={resetAnswer} className="text-xs text-red-500 hover:underline">Clear All</button>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 min-h-[100px] flex flex-wrap gap-3 justify-center items-center border-2 border-dashed border-green-200">
              {selectedLetters.map((letter) => (
                <button
                  key={letter.id}
                  onClick={() => handleSelectedLetterClick(letter)}
                  className="bg-white text-green-700 font-bold text-xl w-12 h-12 rounded-xl shadow-sm border-2 border-green-400"
                >
                  {letter.char.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={checkGuess}
            disabled={selectedLetters.length === 0 || isCorrect}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-all shadow-lg"
          >
            Check Answer
          </button>

          {message && (
            <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 border ${
              isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
              <p className="font-bold">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordGuessGame;
