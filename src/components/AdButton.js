import React, { useState, useEffect } from 'react';

// 광고 주소
const AD_URL = "https://www.effectivegatecpm.com/byj6z396t?key=6e5b2c54d6a2a4f81f657dfb4060fdb4";

// 설정값 상수
const MAX_DAILY_CLICKS = 10; // 하루 최대 10회
const COOLDOWN_MS = 10 * 60 * 1000; // 10분 (밀리초 단위)

const AdButtonComponent = ({ onReward }) => {
  const [clickCount, setClickCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0); // 쿨타임 남은 시간 (ms)

  // 1. 초기 데이터 로드 & 쿨타임 계산
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const savedDate = localStorage.getItem('ad_click_date');
    const savedCount = localStorage.getItem('ad_click_count');
    const lastClickTime = localStorage.getItem('ad_last_click_time');

    // 날짜 변경 체크 (자정 지났으면 초기화)
    if (savedDate !== today) {
      localStorage.setItem('ad_click_date', today);
      localStorage.setItem('ad_click_count', '0');
      setClickCount(0);
    } else {
      setClickCount(parseInt(savedCount || '0'));
    }

    // 쿨타임 체크
    if (lastClickTime) {
      const timePassed = Date.now() - parseInt(lastClickTime);
      if (timePassed < COOLDOWN_MS) {
        // 아직 10분이 안 지났으면 남은 시간 설정
        setRemainingTime(COOLDOWN_MS - timePassed);
      } else {
        setRemainingTime(0);
      }
    }
  }, []);

  // 2. 타이머 작동 (1초마다 감소)
  useEffect(() => {
    let timer;
    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1000) return 0; // 시간 다 되면 0
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [remainingTime]);

  // 3. 광고 클릭 핸들러
  const handleAdClick = () => {
    // 10회 제한 체크
    if (clickCount >= MAX_DAILY_CLICKS) {
      alert("Daily ad limit reached. Please come back tomorrow!");
      return;
    }

    // ★ 실제 광고 띄우기
    window.open(AD_URL, '_blank');

    // ★ 보상 지급
    if (onReward) {
      onReward();
    }

    // 데이터 업데이트
    const newCount = clickCount + 1;
    setClickCount(newCount);
    const now = Date.now();

    // 저장
    localStorage.setItem('ad_click_count', newCount.toString());
    localStorage.setItem('ad_last_click_time', now.toString());

    // 쿨타임 시작 (10분)
    setRemainingTime(COOLDOWN_MS);
  };

  // 시간 포맷 변환 함수 (ms -> MM:SS)
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 렌더링 로직
  // 1. 하루 제한 도달 시
  if (clickCount >= MAX_DAILY_CLICKS) {
    return (
      <div className="flex justify-center my-4">
         <div className="text-xs text-white/50 bg-gray-800/50 px-4 py-2 rounded-full italic">
            ⛔ Daily Limit Reached (10/10)
        </div>
      </div>
    );
  }

  // 2. 쿨타임 중일 때 (카운트다운 표시)
  if (remainingTime > 0) {
    return (
        <div className="flex justify-center my-4">
            <button 
                disabled 
                className="bg-gray-500 text-white font-bold py-3 px-6 rounded-full shadow-inner cursor-not-allowed opacity-80 flex items-center gap-2"
            >
                <span>⏳</span>
                <span>Wait {formatTime(remainingTime)}</span>
            </button>
        </div>
    );
  }

  // 3. 광고 시청 가능 상태
  return (
    <div className="flex justify-center my-4">
      <button 
        onClick={handleAdClick}
        className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-black py-3 px-6 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2 animate-pulse"
      >
        <span>📺</span>
        <span>GET HINT ({MAX_DAILY_CLICKS - clickCount} left)</span>
      </button>
    </div>
  );
};

export default AdButtonComponent;
