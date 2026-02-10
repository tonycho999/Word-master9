// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // 인증 (로그인)
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; // DB

// 1. Firebase 설정 (제공해주신 정보 적용)
const firebaseConfig = {
  apiKey: "AIzaSyAA2_ry1326LsvnTAgGOyvrGJf4_kKYgTs",
  authDomain: "word-master99.firebaseapp.com",
  projectId: "word-master99",
  storageBucket: "word-master99.firebasestorage.app",
  messagingSenderId: "102547168102",
  appId: "1:102547168102:web:7e0ee3ed76b659336e46a7",
  measurementId: "G-2JZ2N3G9P2"
};

// 2. 앱 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. DB 저장 함수 (Supabase -> Firestore 변환)
// 사용자의 레벨과 점수를 저장하는 함수입니다.
export const saveProgress = async (userId, level, score, email) => {
  if (!userId) return;

  try {
    // 'users' 컬렉션 안에 userId를 문서 ID로 사용하여 저장
    // merge: true 옵션은 기존 데이터가 있으면 덮어쓰지 않고 업데이트만 합니다.
    await setDoc(doc(db, "users", userId), {
      level: level,
      score: score,
      email: email,
      last_updated: new Date().toISOString()
    }, { merge: true });
    
    console.log("🔥 Progress saved to Firebase!");
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

// 4. DB 불러오기 함수 (추가됨)
export const loadProgress = async (userId) => {
    if (!userId) return null;

    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
}

export { app, auth, db, analytics };
