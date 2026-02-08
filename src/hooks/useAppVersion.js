import { useState, useEffect, useRef } from 'react';

export const useAppVersion = (currentVersion) => {
  const [isUpdating, setIsUpdating] = useState(true); // 로딩 상태로 시작
  const hasCheckedRef = useRef(false); // 중복 실행 방지 (Strict Mode 대응)

  useEffect(() => {
    if (hasCheckedRef.current) return; // 이미 체크했으면 패스
    hasCheckedRef.current = true;

    const checkVersion = async () => {
      try {
        const savedVersion = localStorage.getItem('game-version');
        
        // [1] 버전이 일치하면 바로 게임 시작
        if (savedVersion === currentVersion) {
            setIsUpdating(false);
            return;
        }

        // [2] 버전 불일치! 업데이트 진행
        console.log(`🚀 업데이트 감지: v${savedVersion || '없음'} -> v${currentVersion}`);

        // ★ [중요] 무한 루프 방지 안전장치
        // 방금 업데이트를 시도해서 리로드된 상태라면, 또 리로드하지 않고 넘어갑니다.
        if (sessionStorage.getItem('update_reload_lock')) {
            console.warn("⚠️ 업데이트 루프 감지됨: 강제 실행");
            sessionStorage.removeItem('update_reload_lock'); // 락 해제
            localStorage.setItem('game-version', currentVersion); // 버전 강제 맞춤
            setIsUpdating(false);
            return;
        }

        setIsUpdating(true); // 화면 멈춤 (로딩)

        // (1) 브라우저 캐시 삭제 (구버전 파일 제거)
        if ('caches' in window) {
            try {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
                console.log("🧹 캐시 삭제 완료");
            } catch (e) {
                console.warn("캐시 삭제 실패", e);
            }
        }

        // (2) 서비스 워커 해제 (PWA 갱신)
        if ('serviceWorker' in navigator) {
            try {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (const reg of regs) await reg.unregister();
                console.log("🛑 서비스 워커 해제 완료");
            } catch (e) {
                console.warn("SW 해제 실패", e);
            }
        }

        // (3) 버전 저장 및 리로드 준비
        localStorage.setItem('game-version', currentVersion);
        sessionStorage.setItem('update_reload_lock', 'true'); // ★ "나 업데이트 중이야" 표시

        // (4) 새로고침
        setTimeout(() => {
            window.location.reload();
        }, 100);

      } catch (error) {
        console.error("버전 체크 중 에러:", error);
        // 에러가 나도 게임은 켜지게 함 (흰 화면 방지)
        setIsUpdating(false);
      }
    };

    checkVersion();
  }, [currentVersion]);

  return isUpdating;
};
