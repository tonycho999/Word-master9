import { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, db, saveProgress } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useAuthSystem = (playSound, levelRef, scoreRef, setLevel, setScore) => {
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [conflictData, setConflictData] = useState(null); // 충돌 데이터 (서버 vs 로컬)
  const [message, setMessage] = useState('');

  // 1. 온라인 상태 감지
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // 2. Firebase 로그인 상태 감지 (자동 로그인)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // 로그인 성공 시 서버 데이터 확인
        await checkCloudData(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      playSound('click');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setMessage(`Welcome, ${user.displayName}!`);
      setShowLoginModal(false);
      // 로그인 후 데이터 동기화 로직은 useEffect에서 자동 처리됨
    } catch (error) {
      console.error("Login Failed:", error);
      setMessage("Login Failed. Try again.");
    }
  };

  // 4. 로그아웃
  const handleLogout = async () => {
    playSound('click');
    if (window.confirm("Log out? (Device data remains)")) {
      await signOut(auth);
      setUser(null);
      setMessage("Logged out.");
    }
  };

  // 5. 서버 데이터 확인 및 충돌 해결 로직
  const checkCloudData = async (user) => {
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        const localLevel = levelRef.current;

        // 서버 레벨이 더 높으면 -> "불러오시겠습니까?" 모달 띄움
        if (cloudData.level > localLevel) {
          setConflictData({
            cloud: { level: cloudData.level, score: cloudData.score, date: cloudData.last_updated },
            local: { level: localLevel, score: scoreRef.current }
          });
        } else {
          // 로컬이 더 높거나 같으면 -> 서버를 덮어씀 (자동 백업)
          await saveProgress(user.uid, localLevel, scoreRef.current, user.email);
        }
      } else {
        // 서버에 데이터가 없으면 -> 현재 데이터를 서버에 저장 (첫 백업)
        await saveProgress(user.uid, levelRef.current, scoreRef.current, user.email);
      }
    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  // 충돌 해결 (사용자 선택)
  const handleResolveConflict = async (choice) => {
    if (choice === 'cloud') {
        // 서버 데이터로 덮어쓰기
        setLevel(conflictData.cloud.level);
        setScore(conflictData.cloud.score);
        localStorage.setItem('word-game-level', conflictData.cloud.level);
        localStorage.setItem('word-game-score', conflictData.cloud.score);
        setMessage("Data Loaded from Cloud!");
    } else {
        // 내 폰 데이터 유지 (서버 강제 업데이트)
        if (user) {
            await saveProgress(user.uid, levelRef.current, scoreRef.current, user.email);
            setMessage("Local Data Saved to Cloud!");
        }
    }
    setConflictData(null); // 모달 닫기
  };

  return { 
    user, isOnline, showLoginModal, setShowLoginModal, 
    conflictData, handleResolveConflict, 
    message, setMessage, 
    handleGoogleLogin, handleLogout // 구글 로그인 함수 내보내기
  };
};
