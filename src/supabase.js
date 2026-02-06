import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------
// [유지] 고객님의 주소와 키 (그대로 두시면 됩니다)
// ----------------------------------------------------------------
const supabaseUrl = 'https://sfepjxhwlpisdpcdklwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZXBqeGh3bHBpc2RwY2RrbHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjE3NjUsImV4cCI6MjA4NTg5Nzc2NX0.murbKE8QvK9Qe2tw1BF8_XJK7bG4QWEHjmbgoACONcY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- 게임에서 사용할 기능들 ---

// 1. 로그인 (이메일 매직 링크 방식)
// *주의: 함수 이름은 다른 파일 수정을 줄이기 위해 loginWithGoogle로 유지합니다.
export const loginWithGoogle = async () => {
  // 1. 이메일 입력받기
  const email = window.prompt("Please enter your email to save progress:\n(A login link will be sent to your inbox)");
  
  if (!email) return; // 취소하면 중단

  // 2. 이메일 보내기
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: window.location.origin, // 현재 게임 주소로 다시 돌아오기
    }
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("📩 Check your inbox!\nClick the link in the email to log in and save your game.");
  }
};

// 2. 로그아웃
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout Error:', error);
  else alert("Logged out successfully.");
};

// 3. 데이터 저장 (Upsert 방식: 없으면 만들고, 있으면 덮어쓰기)
export const saveProgress = async (userId, level, score) => {
  // upsert는 Supabase에서 'userid'가 Unique(유일)로 설정되어 있어야 작동합니다.
  const { error } = await supabase
    .from('game_progress')
    .upsert(
      { userid: userId, level: level, score: score },
      { onConflict: 'userid' } // userid가 겹치면 업데이트해라!
    );

  if (error) console.error('Save Error:', error);
};

// 4. 데이터 불러오기
export const loadProgress = async (userId) => {
  const { data, error } = await supabase
    .from('game_progress')
    .select('*')
    .eq('userid', userId)
    .single();

  if (error) return null;
  return data;
};
