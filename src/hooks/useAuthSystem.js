import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, logout, saveProgress, syncGameData } from '../supabase';

export const useAuthSystem = (playSound, levelRef, scoreRef, setLevel, setScore) => {
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [message, setMessage] = useState('');

  // ★ [핵심] 무한 루프 방지용 안전장치 (Ref는 값이 바뀌어도 렌더링되지 않음)
  const isCheckingRef = useRef(false); // 지금 검사 중인가?
  const hasCheckedRef = useRef(false); // 검사를 이미 마쳤는가?

  // 1. 데이터 동기화 함수
  const checkDataConflict = useCallback(async (userId) => {
    // 이미 검사 중이거나, 검사를 마쳤거나, 인터넷이 없으면 -> 중단!
    if (isCheckingRef.current || hasCheckedRef.current || !navigator.onLine) return;

    isCheckingRef.current = true; // "검사 시작!" 깃발 꽂기
    console.log("🔒 [Sync] DB 데이터 확인 시작 (1회 한정)");

    try {
        const currentLevel = Number(localStorage.getItem('word-game-level') || 1);
        const currentScore = Number(localStorage.getItem('word-game-score') || 300);
        
        const result = await syncGameData(userId, currentLevel, currentScore, user?.email);

        if (result.status === 'CONFLICT') {
            setConflictData({ ...result.serverData, type: 'level_mismatch' });
        } else if (result.status === 'UPDATE_LOCAL') {
            // 충돌 없이 서버 데이터가 최신이면 조용히 업데이트
            setLevel(result.serverData.level);
            setScore(result.serverData.score);
            localStorage.setItem('word-game-level', result.serverData.level);
            localStorage.setItem('word-game-score', result.serverData.score);
            console.log("⚡ 서버 데이터로 업데이트됨");
            hasCheckedRef.current = true; // 검사 완료 처리
        } else {
            hasCheckedRef.current = true; // 동기화 완료 or 내 데이터 저장됨 -> 검사 완료 처리
        }
    } catch (e) {
        console.error(e);
    } finally {
        isCheckingRef.current = false; // 검사 끝
    }
  }, [user, setLevel, setScore]); 

  // 2. 온라인 상태 및 초기화 감지
  useEffect(() => {
    const handleOnline = () => { 
        setIsOnline(true); 
        // 재연결 시에는 다시 한 번 체크할 기회를 줌
        hasCheckedRef.current = false; 
        if (user) checkDataConflict(user.id); 
    };
    const handleOffline = () => { setIsOnline(false); setMessage('OFFLINE MODE'); };
    
    window.addEventListener('online', handleOnline); 
    window.addEventListener('offline', handleOffline);
    
    return () => { 
        window.removeEventListener('online', handleOnline); 
        window.removeEventListener('offline', handleOffline); 
    };
  }, [user, checkDataConflict]);

  // 3. 로그인 상태 감지 (여기서 무한 루프가 발생했었음)
  useEffect(() => {
    // 세션 가져오기
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) { 
          setUser(session.user);
          // 여기서 바로 실행하지 않고, 의존성 배열에 의해 아래 로직이 실행되도록 함
      }
    };
    initSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (event === 'SIGNED_IN') {
             // 로그인 순간에는 강제로 체크 리셋 후 실행
             hasCheckedRef.current = false;
             setMessage('LOGIN SUCCESS!'); 
             setTimeout(() => setMessage(''), 2000); 
        }
      } else if (event === 'SIGNED_OUT') { 
          setUser(null); 
          hasCheckedRef.current = false; 
      }
    });
    return () => subscription.unsubscribe();
  }, []); // ★ 의존성 배열 비움! (최초 1회만 리스너 등록)

  // 4. 유저가 바뀔 때 딱 한번만 체크 실행
  useEffect(() => {
      if (user && !hasCheckedRef.current) {
          checkDataConflict(user.id);
      }
  }, [user, checkDataConflict]);


  // 5. 액션 핸들러들
  const handleResolveConflict = async (choice) => {
    playSound('click'); 
    if (!conflictData || !user) return;
    
    if (choice === 'server') {
      const newLevel = Number(conflictData.level);
      const newScore = Number(conflictData.score);

      // 1. 상태 업데이트 (게임 로직이 감지해서 단어 바꿈)
      setLevel(newLevel); 
      setScore(newScore);
      
      // 2. 로컬 저장
      localStorage.setItem('word-game-level', newLevel); 
      localStorage.setItem('word-game-score', newScore);
      
      setMessage('LOADED SERVER DATA!');
      setConflictData(null); 
      hasCheckedRef.current = true; // 해결했으니 다시 체크 안 함

      // ★ 새로고침 제거 (이제 상태가 바뀌면 useGameLogic이 알아서 단어를 바꿉니다)

    } else {
      await saveProgress(user.id, levelRef.current, scoreRef.current, user.email);
      setConflictData(null); 
      hasCheckedRef.current = true; // 해결했으니 다시 체크 안 함
      setMessage('SAVED LOCAL DATA!');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  const handleLogout = async () => {
    playSound('click');
    try { 
        await logout(); 
        setUser(null); 
        hasCheckedRef.current = false; // 로그아웃하면 체크 기록 초기화
        setMessage('LOGGED OUT'); 
        setTimeout(() => { setMessage(''); window.location.reload(); }, 1000); 
    } catch (e) { 
        window.location.reload(); 
    }
  };

  return {
    user, isOnline, showLoginModal, setShowLoginModal, conflictData, message, setMessage,
    handleResolveConflict, handleLogout
  };
};
