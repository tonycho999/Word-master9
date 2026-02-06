import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------
// [유지] 고객님의 주소와 키
// ----------------------------------------------------------------
const supabaseUrl = 'https://sfepjxhwlpisdpcdklwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZXBqeGh3bHBpc2RwY2RrbHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjE3NjUsImV4cCI6MjA4NTg5Nzc2NX0.murbKE8QvK9Qe2tw1BF8_XJK7bG4QWEHjmbgoACONcY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- 게임에서 사용할 기능들 ---

// 1. 로그인 (이메일 매직 링크)
export const loginWithGoogle = async () => {
  const email = window.prompt("Please enter your email to save progress:\n(A login link will be sent to your inbox)");
  if (!email) return;

  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: window.location.origin,
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

// 3. [수정됨] 데이터 저장 (안전한 수동 저장 방식)
// Upsert 대신, 있는지 확인하고 -> 없으면 만들고 -> 있으면 수정합니다.
// 이 방식은 DB에 Unique 설정이 없어도 에러가 나지 않습니다.
export const saveProgress = async (userId, level, score) => {
  try {
    // 숫자가 문자로 들어가는 것을 방지하기 위해 Number()로 감싸줍니다.
    const safeLevel = Number(level);
    const safeScore = Number(score);

    // 1. 내 데이터가 있는지 확인
    const { data: existingData, error: selectError } = await supabase
      .from('game_progress')
      .select('id')
      .eq('userid', userId)
      .maybeSingle(); // 데이터가 없어도 에러를 내지 않음

    if (selectError) throw selectError;

    if (existingData) {
      // 2. 있으면 -> 업데이트
      const { error: updateError } = await supabase
        .from('game_progress')
        .update({ level: safeLevel, score: safeScore })
        .eq('userid', userId);
      
      if (updateError) throw updateError;
    } else {
      // 3. 없으면 -> 새로 만들기
      const { error: insertError } = await supabase
        .from('game_progress')
        .insert({ userid: userId, level: safeLevel, score: safeScore });
      
      if (insertError) throw insertError;
    }
    console.log("Save Success:", safeLevel, safeScore);
  } catch (error) {
    console.error('Save Error:', error.message);
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
