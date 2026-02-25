import React, { useState, useEffect } from 'react';

// Adsterra 설정 (개인용)
const AD_URL = "https://www.effectivegatecpm.com/byj6z396t?key=6e5b2c54d6a2a4f81f657dfb4060fdb4";
const MAX_DAILY_CLICKS = 10;
const COOLDOWN_MS = 10 * 60 * 1000; // 10분

const AdButton = ({ onReward }) => {
  const [loading, setLoading] = useState(false);
  
  // Adsterra용 상태 관리
  const [clickCount, setClickCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  
  // 플랫폼 감지 (Poki 또는 CrazyGames인지?)
  const isPlatformGame = window.PokiSDK || (window.CrazyGames && window.CrazyGames.SDK);

  // 1. 초기화 (Adsterra용 데이터 불러오기)
  useEffect(() => {
    // 플랫폼 게임이면 제한 로직 필요 없음
    if (isPlatformGame) return;

    const today = new Date().toLocaleDateString();
    const savedDate = localStorage.getItem('ad_click_date');
    const savedCount = localStorage.getItem('ad_click_count');
    const lastClickTime = localStorage.getItem('ad_last_click_time');

    if (savedDate !== today) {
      localStorage.setItem('ad_click_date', today);
      localStorage.setItem('ad_click_count', '0');
      setClickCount(0);
    } else {
      setClickCount(parseInt(savedCount || '0'));
    }

    if (lastClickTime) {
      const timePassed = Date.now() - parseInt(lastClickTime);
      if (timePassed < COOLDOWN_MS) {
        setRemainingTime(COOLDOWN_MS - timePassed);
      }
    }
  }, [isPlatformGame]);

  // 2. 타이머 로직 (Adsterra용)
  useEffect(() => {
    if (isPlatformGame) return; // 플랫폼이면 타이머 안 돌림

    let timer;
    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => (prev <= 1000 ? 0 : prev - 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [remainingTime, isPlatformGame]);

  // 시간 포맷팅 함수
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    return `${Math.floor(totalSeconds / 60).toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
  };

  // 3. 클릭 핸들러 (통합)
  const handleAdClick = () => {
    if (loading) return;

    // --- [A] Poki 로직 (무제한) ---
    if (window.PokiSDK) {
      setLoading(true);
      console.log("📺 Platform: Poki");
      window.PokiSDK.rewardedBreak().then((success) => {
        if (success) {
          if (onReward) onReward();
        }
        setLoading(false);
      });
    } 
    // --- [B] CrazyGames 로직 (무제한) ---
    else if (window.CrazyGames && window.CrazyGames.SDK) {
      setLoading(true);
      console.log("📺 Platform: CrazyGames");
      const sdk = window.CrazyGames.SDK;
      sdk.ad.requestAd('rewarded', {
        adFinished: () => {
          if (onReward) onReward();
          setLoading(false);
        },
        adError: (error) => {
          console.log("CrazyGames Ad Error", error);
          setLoading(false);
        },
        adStarted: () => console.log("Ad Started")
      });
    }
    // --- [C] Adsterra 로직 (제한 적용) ---
    else {
      // 제한 체크
      if (clickCount >= MAX_DAILY_CLICKS) return;
      if (remainingTime > 0) return;

      console.log("📺 Platform: Direct/Web");
      
      // 광고 열기
      window.open(AD_URL, '_blank');
      
      // 상태 업데이트 (카운트 증가, 쿨타임 시작)
      const newCount = clickCount + 1;
      setClickCount(newCount);
      const now = Date.now();

      localStorage.setItem('ad_click_count', newCount.toString());
      localStorage.setItem('ad_last_click_time', now.toString());
      setRemainingTime(COOLDOWN_MS);

      // 보상 지급 (약간 딜레이)
      setLoading(true);
      setTimeout(() => {
        if (onReward) onReward();
        setLoading(false);
      }, 1000);
    }
  };

  // ----------------------------------------------------------------
  // 4. 렌더링 (UI 분기)
  // ----------------------------------------------------------------

  // [Adsterra 전용] 일일 한도 초과 뷰
  // (플랫폼 게임이 아닐 때만 체크)
  if (!isPlatformGame && clickCount >= MAX_DAILY_CLICKS) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-xs text-white/50 bg-gray-800/50 px-4 py-2 rounded-full italic">
          ⛔ Daily Limit Reached (10/10)
        </div>
      </div>
    );
  }

  // [Adsterra 전용] 쿨타임 대기 뷰
  // (플랫폼 게임이 아닐 때만 체크)
  if (!isPlatformGame && remainingTime > 0) {
    return (
      <div className="flex justify-center my-4">
        <button disabled className="bg-gray-500 text-white font-bold py-3 px-6 rounded-full opacity-80 flex items-center gap-2">
          <span>⏳</span>
          <span>Wait {formatTime(remainingTime)}</span>
        </button>
      </div>
    );
  }

  // [공통] 광고 보기 버튼
  return (
    <div className="flex justify-center my-4">
      <button 
        onClick={handleAdClick}
        disabled={loading}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-full font-black text-white shadow-lg transform transition active:scale-95
          ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110'}
        `}
      >
        {/* 아이콘: 로딩 중이면 스피너, 아니면 TV */}
        {loading ? (
           <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        )}
        
        <span>
          {loading ? "LOADING..." : "GET 200 COINS"}
          {/* Adsterra일 때만 남은 횟수 표시 */}
          {!isPlatformGame && ` (${MAX_DAILY_CLICKS - clickCount})`}
        </span>
      </button>
    </div>
  );
};

export default AdButton;
