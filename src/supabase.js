import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------
// [설정] 고객님의 주소와 키
// ----------------------------------------------------------------
const supabaseUrl = 'https://sfepjxhwlpisdpcdklwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZXBqeGh3bHBpc2RwY2RrbHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjE3NjUsImV4cCI6MjA4NTg5Nzc2NX0.murbKE8QvK9Qe2tw1BF8_XJK7bG4QWEHjmbgoACONcY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- 기본 기능 ---

export const loginWithGoogle = async () => { /* ...사용 안함 (모달 사용)... */ };

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout Error:', error);
};

// 1. 단순 저장 (강제 저장)
export const saveProgress = async (userId, level, score, email) => {
  try {
    const updates = {
      userid: userId,    
      level: Number(level),
      score: Number(score),
      // updated_at: new Date(), 
    };
    if (email) updates.email = email;

    const { error } = await supabase
      .from('game_progress') 
      .upsert(updates, { onConflict: 'userid' });

    if (error) throw error;
    console.log("✅ [DB 저장 완료]");
  } catch (error) {
    console.error("❌ [저장 실패]:", error.message);
  }
};

// 2. 단순 불러오기
export const loadProgress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('userid', userId)
      .maybeSingle(); 

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Load Error:', error.message);
    return null;
  }
};

// ----------------------------------------------------------------
// ★ [NEW] 데이터 동기화 및 충돌 해결 함수 (여기로 통합됨)
// ----------------------------------------------------------------
export const syncGameData = async (userId, localLevel, localScore, email) => {
  console.log("🔄 [동기화 시작] 로컬 데이터 비교 중...");
  
  try {
    // 1. DB 데이터 가져오기
    const dbData = await loadProgress(userId);

    // 2. DB에 데이터가 없으면 -> 로컬 데이터를 저장하고 끝냄
    if (!dbData) {
      await saveProgress(userId, localLevel, localScore, email);
      return { status: 'SAVED_TO_DB', data: { level: localLevel, score: localScore } };
    }

    // 3. 비교 로직
    // [상황 A] 레벨이 다르면 -> 무조건 충돌 (사용자 선택 필요)
    if (dbData.level !== localLevel) {
      return { status: 'CONFLICT', serverData: dbData };
    }

    // [상황 B] 레벨은 같은데, DB 점수가 더 높음 -> DB 데이터로 내 폰을 업데이트
    if (dbData.score > localScore) {
      return { status: 'UPDATE_LOCAL', serverData: dbData };
    }

    // [상황 C] 레벨은 같은데, 내 점수가 더 높음 -> 내 점수를 DB에 저장
    if (localScore > dbData.score) {
      await saveProgress(userId, localLevel, localScore, email);
      return { status: 'SAVED_TO_DB', data: { level: localLevel, score: localScore } };
    }

    // [상황 D] 둘다 똑같음
    return { status: 'SYNCED', data: dbData };

  } catch (error) {
    console.error("동기화 로직 에러:", error);
    return { status: 'ERROR', error };
  }
};
