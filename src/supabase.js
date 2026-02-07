import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------
// [설정] 고객님의 주소와 키 (그대로 유지)
// ----------------------------------------------------------------
const supabaseUrl = 'https://sfepjxhwlpisdpcdklwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZXBqeGh3bHBpc2RwY2RrbHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjE3NjUsImV4cCI6MjA4NTg5Nzc2NX0.murbKE8QvK9Qe2tw1BF8_XJK7bG4QWEHjmbgoACONcY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- 게임에서 사용할 기능들 ---

// 1. 로그인 (비상용 함수 - 실제로는 메인 화면의 모달창이 사용됨)
export const loginWithGoogle = async () => {
  const email = window.prompt("Enter email for Magic Link:");
  if (!email) return;
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) alert(error.message);
  else alert("Check your email inbox!");
};

// 2. 로그아웃
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout Error:', error);
};

// 3. [디버깅 모드] 데이터 저장 함수
export const saveProgress = async (userId, level, score, email) => {
  console.log("🚀 [저장 시도] 데이터:", { userId, level, score, email });

  try {
    // DB 테이블 컬럼명에 맞춰서 데이터 준비
    const updates = {
      userid: userId,    
      level: Number(level),
      score: Number(score),
      // updated_at: new Date(), // ★ DB에 'updated_at' 컬럼을 추가하기 전까지는 주석 처리합니다.
    };

    // 이메일이 있을 때만 추가 (빈 값 덮어쓰기 방지)
    if (email) {
      updates.email = email;
    }

    // DB에 저장 요청 (upsert: 없으면 생성, 있으면 수정)
    const { data, error } = await supabase
      .from('game_progress') 
      .upsert(updates, { onConflict: 'userid' }) // userid가 같으면 덮어쓰기
      .select(); 

    // 에러 발생 시 알림창 띄우기 (디버깅용)
    if (error) {
      console.error("❌ [저장 실패] DB 에러:", error); 
      alert("데이터 저장 실패!\n원인: " + error.message);
      throw error;
    }
    
    console.log("✅ [저장 성공] DB 응답:", data);

  } catch (error) {
    console.error("❌ [시스템 에러]:", error.message);
  }
};

// 4. 데이터 불러오기
export const loadProgress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('userid', userId)
      .maybeSingle(); // 데이터가 없으면 null 반환 (에러 아님)

    if (error) {
      console.error("불러오기 에러:", error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Load Error:', error.message);
    return null;
  }
};
