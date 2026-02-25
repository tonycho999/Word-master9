import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { saveProgress } from '../firebase'; 
import { X, LogIn } from 'lucide-react'; 

// Hooks
import { useSound } from '../hooks/useSound';
import { useAuthSystem } from '../hooks/useAuthSystem';
import { useGameLogic } from '../hooks/useGameLogic';
import { useAppVersion } from '../hooks/useAppVersion'; 

// SEO
import { Helmet } from 'react-helmet-async';

// Components
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

  // 플랫폼 감지 (Poki, CrazyGames 등)
  const isPlatformGame = window.PokiSDK || (window.CrazyGames && window.CrazyGames.SDK);
  const showInstallButton = !!deferredPrompt && !isPlatformGame;

  // 자동 저장
  useEffect(() => {
    localStorage.setItem('word-game-level', level); 
    localStorage.setItem('word-game-score', score);
    if (auth.isOnline && auth.user && !auth.conflictData) { 
        const timer = setTimeout(() => saveProgress(auth.user.uid, level, score, auth.user.email), 2000); 
        return () => clearTimeout(timer); 
    }
  }, [level, score, auth.isOnline, auth.user, auth.conflictData]);

  // 광고 보상 핸들러
  const handleRewardAd = async () => {
    playSound('reward'); 
    const newScore = scoreRef.current + 200; 
    setScore(newScore); 
    // auth.setMessage('+200P Ad Reward!'); // 팝업 제거를 위해 주석
    // setTimeout(() => auth.setMessage(''), 2000);

    if (auth.isOnline && auth.user) {
        await saveProgress(auth.user.uid, levelRef.current, newScore, auth.user.email);
    }
  };

  // 공유 보상 핸들러
  const handleShareReward = async () => {
    playSound('reward');
    const newScore = scoreRef.current + 100;
    setScore(newScore);
    // auth.setMessage('+100P Share Bonus!'); // 팝업 제거
    // setTimeout(() => auth.setMessage(''), 2000);

    if (auth.isOnline && auth.user) {
        await saveProgress(auth.user.uid, levelRef.current, newScore, auth.user.email);
    }
  };

  const processNextLevel = async () => {
    playSound('click');
    const nextLevel = levelRef.current + 1; const nextScore = scoreRef.current + 50;
    setScore(nextScore); setLevel(nextLevel);
    // game.setCurrentWord(''); // useGameLogic 내부에서 자동 초기화됨
    
    // 플랫폼 게임 플레이 시작 이벤트
    if (window.PokiSDK) window.PokiSDK.gameplayStart();
    if (window.CrazyGames && window.CrazyGames.SDK) window.CrazyGames.SDK.game.gameplayStart();

    if (auth.isOnline && auth.user) await saveProgress(auth.user.uid, nextLevel, nextScore, auth.user.email);
  };

  if (isUpdating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-600 text-white">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-black">UPDATING GAME...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-indigo-600 p-4 font-sans text-gray-900 select-none relative overflow-hidden">
      
      {game.isCorrect && (
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.2} />
      )}

      <Helmet>
        <title>{`Word Master - Level ${level}`}</title>
        <meta name="description" content={`Word Master Level ${level} 도전 중!`} />
      </Helmet>

      <SyncConflictModal conflictData={auth.conflictData} currentLevel={level} currentScore={score} onResolve={auth.handleResolveConflict} />

      {auth.showLoginModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-indigo-600 flex items-center gap-2"><LogIn size={24}/> LOGIN</h3>
                  <button onClick={() => auth.setShowLoginModal(false)}><X size={24}/></button>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl mb-6 border border-indigo-100 text-center">
                    <p className="text-sm text-gray-600 font-bold mb-1">Save your progress ☁️</p>
                    <p className="text-xs text-gray-500">Log in to sync across devices.</p>
                </div>
                <button onClick={auth.handleGoogleLogin} className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-sm active:scale-95">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                  Sign in with Google
                </button>
            </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] p-4 w-full max-w-md shadow-2xl flex flex-col items-center border-t-8 border-indigo-500">
        
        <GameHeader 
          level={level} 
          score={score} 
          user={auth.user} 
          isOnline={auth.isOnline} 
          onLogin={() => auth.setShowLoginModal(true)} 
          onLogout={auth.handleLogout} 
          showInstallBtn={showInstallButton} 
          onInstall={() => deferredPrompt?.prompt()} 
        />

        <GameControls 
            category={game.category} 
            wordType={game.wordType} 
            
            // ▼▼▼ [필수 추가] 2단어 감지용 정답 데이터 전달 ▼▼▼
            targetWords={game.targetWords} 
            // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

            hintMessage={game.hintMessage} 
            isCorrect={game.isCorrect} 
            hintStage={game.hintStage}
            hintButtonText={game.hintStage === 0 ? '1ST LETTER (100P)' : game.hintStage === 1 ? 'LAST LETTER (200P)' : game.hintStage === 2 ? 'SHOW LENGTH (300P)' : 'QUICK LOOK (500P)'}
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
                
                // ▼▼▼ [필수 추가] AnswerBoard에도 정답 구조와 찾은 단어 전달 ▼▼▼
                targetWords={game.targetWords} 
                foundWords={game.foundWords}
                // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

                isCorrect={game.isCorrect} 
                isFlashing={game.isFlashing} 
                hintStage={game.hintStage} 
                hintMessage={game.hintMessage}
            />
        </GameControls>
      </div>

      {level === 1 && (
        <footer className="mt-8 text-center max-w-md mx-auto opacity-20 text-indigo-100 selection:bg-transparent pointer-events-none">
          <h1 className="text-[10px] font-bold mb-1">Word Master</h1>
          <p className="text-[8px] px-4 mb-2">Improve your English vocabulary with 1000+ levels.</p>
          <div className="flex justify-center gap-3 text-[8px] pointer-events-auto">
             <a href="/privacy.html" target="_blank" rel="noreferrer" className="hover:text-white underline">Privacy Policy</a>
             <span>•</span>
             <a href="/terms.html" target="_blank" rel="noreferrer" className="hover:text-white underline">Terms of Service</a>
          </div>
        </footer>
      )}
    </div>
  );
};
export default WordGuessGame;
