import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { saveProgress } from '../firebase'; 
import { X, LogIn } from 'lucide-react'; 

// Hooks & Components
import { useSound } from '../hooks/useSound';
import { useAuthSystem } from '../hooks/useAuthSystem';
import { useGameLogic } from '../hooks/useGameLogic';
import { useAppVersion } from '../hooks/useAppVersion'; 
import { Helmet } from 'react-helmet-async';
import SyncConflictModal from './SyncConflictModal';
import GameHeader from './GameHeader';
import GameControls from './GameControls';
import AnswerBoard from './AnswerBoard';

const CURRENT_VERSION = '1.5.1'; 

const WordGuessGame = () => {
  const { width, height } = useWindowSize();
  const isUpdating = useAppVersion(CURRENT_VERSION);

  const [level, setLevel] = useState(() => Number(localStorage.getItem('word-game-level')) || 1);
  const [score, setScore] = useState(() => Number(localStorage.getItem('word-game-score')) || 300);
  
  const levelRef = useRef(level);
  const scoreRef = useRef(score);
  useEffect(() => { levelRef.current = level; scoreRef.current = score; }, [level, score]);

  const playSound = useSound();
  const auth = useAuthSystem(playSound, levelRef, scoreRef, setLevel, setScore);
  const game = useGameLogic(playSound, level, score, setScore, auth.setMessage);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    const handleInstall = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handleInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleInstall);
  }, []);

  const isPlatformGame = window.PokiSDK || (window.CrazyGames && window.CrazyGames.SDK);
  const showInstallButton = !!deferredPrompt && !isPlatformGame;

  // Auto Save
  useEffect(() => {
    localStorage.setItem('word-game-level', level); 
    localStorage.setItem('word-game-score', score);
    if (auth.isOnline && auth.user && !auth.conflictData) { 
        const timer = setTimeout(() => saveProgress(auth.user.uid, level, score, auth.user.email), 2000); 
        return () => clearTimeout(timer); 
    }
  }, [level, score, auth.isOnline, auth.user, auth.conflictData]);

  const handleRewardAd = async () => {
    playSound('reward'); 
    setScore(s => s + 200); 
    if (auth.isOnline && auth.user) await saveProgress(auth.user.uid, level, score + 200, auth.user.email);
  };

  const handleShareReward = async () => {
    playSound('reward');
    setScore(s => s + 100);
    if (auth.isOnline && auth.user) await saveProgress(auth.user.uid, level, score + 100, auth.user.email);
  };

  const processNextLevel = async () => {
    playSound('click');
    const nextLevel = levelRef.current + 1; const nextScore = scoreRef.current + 50;
    setScore(nextScore); setLevel(nextLevel);
    
    if (window.PokiSDK) window.PokiSDK.gameplayStart();
    if (window.CrazyGames && window.CrazyGames.SDK) window.CrazyGames.SDK.game.gameplayStart();
    if (auth.isOnline && auth.user) await saveProgress(auth.user.uid, nextLevel, nextScore, auth.user.email);
  };

  if (isUpdating) return <div className="h-screen flex items-center justify-center bg-indigo-900 text-white">Updating...</div>;

  return (
    // ▼▼▼ [레이아웃 변경] 화면 꽉 차는(h-screen) Flex 컨테이너 + 그라디언트 배경 ▼▼▼
    <div className="h-screen w-full bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 font-sans text-white select-none relative overflow-hidden flex flex-col">
      
      {game.isCorrect && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.2} />}
      <Helmet><title>{`Level ${level} - Word Master`}</title></Helmet>
      <SyncConflictModal conflictData={auth.conflictData} currentLevel={level} currentScore={score} onResolve={auth.handleResolveConflict} />

      {/* Login Modal (Overlay) */}
      {auth.showLoginModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-gray-900 shadow-2xl">
                <div className="flex justify-between mb-4">
                  <h3 className="font-black text-xl flex gap-2"><LogIn/> LOGIN</h3>
                  <button onClick={() => auth.setShowLoginModal(false)}><X/></button>
                </div>
                <button onClick={auth.handleGoogleLogin} className="w-full py-3 bg-indigo-50 border-2 border-indigo-100 rounded-xl font-bold flex items-center justify-center gap-2">Sign in with Google</button>
            </div>
        </div>
      )}

      {/* 1. Header (고정 높이) */}
      <div className="flex-none px-4 pt-4 pb-2 w-full max-w-md mx-auto">
        <GameHeader 
          level={level} score={score} user={auth.user} isOnline={auth.isOnline} 
          onLogin={() => auth.setShowLoginModal(true)} onLogout={auth.handleLogout} 
          showInstallBtn={showInstallButton} onInstall={() => deferredPrompt?.prompt()} 
        />
      </div>

      {/* 2. Main Game Area (남은 공간 모두 차지, 내부 스크롤 가능) */}
      <div className="flex-1 w-full max-w-md mx-auto overflow-hidden relative flex flex-col">
        <GameControls 
            category={game.category} 
            wordType={game.wordType} 
            targetWords={game.targetWords} 
            
            hintMessage={game.hintMessage} 
            isCorrect={game.isCorrect} 
            hintStage={game.hintStage}
            hintButtonText={game.hintStage === 0 ? '1ST LETTER (100)' : game.hintStage === 1 ? 'LAST LETTER (200)' : game.hintStage === 2 ? 'LENGTH (300)' : 'FLASH (500)'}
            
            onHint={game.handleHint} 
            onShuffle={game.handleShuffle} 
            onRewardAd={handleRewardAd} 
            onRewardShare={handleShareReward}
            scrambledLetters={game.scrambledLetters} 
            onLetterClick={game.handleLetterClick} 
            onReset={game.handleReset} 
            onBackspace={game.handleBackspace} 
            onNextLevel={processNextLevel}
        >
            <AnswerBoard 
                currentWord={game.currentWord} 
                targetWords={game.targetWords} 
                foundWords={game.foundWords} 
                isCorrect={game.isCorrect} 
                isFlashing={game.isFlashing} 
                hintStage={game.hintStage} 
            />
        </GameControls>
      </div>

    </div>
  );
};
export default WordGuessGame;
