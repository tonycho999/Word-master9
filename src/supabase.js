import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------
// [유지] 고객님의 주소와 키
// ----------------------------------------------------------------
const supabaseUrl = 'https://sfepjxhwlpisdpcdklwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZXBqeGh3bHBpc2RwY2RrbHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjE3NjUsImV4cCI6MjA4NTg5Nzc2NX0.murbKE8QvK9Qe2tw1BF8_XJK7bG4QWEHjmbgoACONcY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- 게임에서 사용할 기능들 ---

// 1. 로그인
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

// 3. [디버깅] 데이터 저장 함수 (에러를 확실히 보여줌)
export const saveProgress = async (userId, level, score, email) => {
  console.log("🚀 [저장 시도] 데이터:", { userId, level, score, email }); // 1. 시도 로그

  try {
    const updates = {
      userid: userId,    
      level: Number(level),
      score: Number(score),
      updated_at: new Date(),
    };

    if (email) {
      updates.email = email;
    }

    // DB에 저장 요청
    const { data, error } = await supabase
      .from('game_progress') 
      .upsert(updates, { onConflict: 'userid' })
      .select(); // 저장이 잘 됐는지 결과를 반환받음

    // 에러 발생 시
    if (error) {
      console.error("❌ [저장 실패] DB 에러:", error); // 2. 에러 로그 (중요!)
      alert("데이터 저장 실패: " + error.message + "\n(개발자 도구 콘솔을 확인하세요)");
      throw error;
    }
    
    console.log("✅ [저장 성공] 완료된 데이터:", data); // 3. 성공 로그

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
      .maybeSingle(); 

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
