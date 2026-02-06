import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------
// [유지] 고객님의 주소와 키 (그대로 두시면 됩니다)
// ----------------------------------------------------------------
const supabaseUrl = 'https://sfepjxhwlpisdpcdklwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZXBqeGh3bHBpc2RwY2RrbHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjE3NjUsImV4cCI6MjA4NTg5Nzc2NX0.murbKE8QvK9Qe2tw1BF8_XJK7bG4QWEHjmbgoACONcY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- 게임에서 사용할 기능들 ---

// 1. [변경] 구글 대신 '이메일 로그인'으로 변경
// (다른 파일을 안 고치기 위해 이름은 loginWithGoogle로 둡니다)
export const loginWithGoogle = async () => {
  // 1. 이메일 입력받기
  const email = window.prompt("게임을 저장할 이메일 주소를 입력해주세요:\n(로그인 링크가 전송됩니다)");
  
  if (!email) return; // 취소하면 중단

  // 2. 이메일 보내기
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: window.location.origin, // 현재 게임 주소로 다시 돌아오기
    }
  });

  if (error) {
    alert("에러가 발생했습니다: " + error.message);
  } else {
    alert("📩 메일함을 확인해주세요!\n보내드린 링크를 클릭하면 게임이 저장되고 이어집니다.");
  }
};

// 2. 로그아웃
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout Error:', error);
  else alert("로그아웃 되었습니다.");
};

// 3. 데이터 저장 (내 레벨, 점수 저장)
export const saveProgress = async (userId, level, score) => {
  const { data: existingData } = await supabase
    .from('game_progress')
    .select('id')
    .eq('userid', userId)
    .single();

  if (existingData) {
    await supabase
      .from('game_progress')
      .update({ level: level, score: score })
      .eq('userid', userId);
  } else {
    await supabase
      .from('game_progress')
      .insert({ userid: userId, level: level, score: score });
  }
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
