import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"; // ★ 추가됨
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAA2_ry1326LsvnTAgGOyvrGJf4_kKYgTs",
  authDomain: "word-master99.firebaseapp.com",
  projectId: "word-master99",
  storageBucket: "word-master99.firebasestorage.app",
  messagingSenderId: "102547168102",
  appId: "1:102547168102:web:7e0ee3ed76b659336e46a7",
  measurementId: "G-2JZ2N3G9P2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider(); // ★ 구글 로그인 공급자 생성

// 데이터 저장 함수
export const saveProgress = async (userId, level, score, email) => {
  if (!userId) return;
  try {
    await setDoc(doc(db, "users", userId), {
      level, score, email, last_updated: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error("Save Error:", error);
  }
};

// ★ 중요: 4가지 핵심 모듈 export
export { auth, googleProvider, signInWithPopup, signOut, db, analytics };
