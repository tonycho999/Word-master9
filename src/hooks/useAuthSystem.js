import { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, db, saveProgress } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useAuthSystem = (playSound, levelRef, scoreRef, setLevel, setScore) => {
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [conflictData, setConflictData] = useState(null); // 충돌 데이터
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

  // 2. Firebase 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await checkCloudData(currentUser); // 로그인 시 데이터 확인
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. 구글 로그인
  const handleGoogleLogin = async () => {
    try {
      playSound('click');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setMessage(`Welcome, ${user.displayName}!`);
      setShowLoginModal(false);
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

  // ★ 5. [수정됨] 서버 데이터 확인 (값이 다르면 무조건 팝업)
  const checkCloudData = async (user) => {
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        const localLevel = levelRef.current;
        const localScore = scoreRef.current;

        // ★ 조건 변경: 레벨이나 점수 중 하나라도 다르면 무조건 충돌 처리!
        if (cloudData.level !== localLevel || cloudData.score !== localScore) {
          console.log("⚠️ Data Mismatch! Cloud:", cloudData.level, "Local:", localLevel);
          
          setConflictData({
            cloud: { 
                level: cloudData.level, 
                score: cloudData.score, 
                date: cloudData.last_updated 
            },
            local: { 
                level: localLevel, 
                score: localScore 
            }
          });
        } else {
          // 데이터가 완전히 똑같으면 아무것도 안 함 (동기화 완료)
          console.log("✅ Data is perfectly synced.");
        }
      } else {
        // 서버에 데이터가 아예 없으면 -> 현재 데이터를 서버에 저장 (첫 가입)
        await saveProgress(user.uid, levelRef.current, scoreRef.current, user.email);
      }
    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  // 6. 충돌 해결 (사용자 선택)
  const handleResolveConflict = async (choice) => {
    if (choice === 'cloud') {
        // [서버 데이터 선택] -> 내 폰을 덮어씀
        playSound('click');
        setLevel(conflictData.cloud.level);
        setScore(conflictData.cloud.score);
        localStorage.setItem('word-game-level', conflictData.cloud.level);
        localStorage.setItem('word-game-score', conflictData.cloud.score);
        setMessage("Data Loaded from Cloud!");
    } else {
        // [내 폰 데이터 선택] -> 서버를 덮어씀
        playSound('click');
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
    handleGoogleLogin, handleLogout 
  };
};
