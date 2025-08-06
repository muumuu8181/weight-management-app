
// ============================================================
// 🔥 Firebase設定 - 体重管理アプリ用
// ============================================================
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, set } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  "apiKey": "AIzaSyCiFKunqIbwDajgoOu1V7JXDUw-6V_EUCo",
  "authDomain": "shares-b1b97.firebaseapp.com",
  "databaseURL": "https://shares-b1b97-default-rtdb.firebaseio.com",
  "projectId": "shares-b1b97",
  "storageBucket": "shares-b1b97.appspot.com",
  "messagingSenderId": "635567872474",
  "appId": "1:635567872474:web:c8b16aa79cb8a5b8beeca9"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Google認証関数
export const signInWithGoogle = () => {
    return signInWithPopup(auth, provider);
};

export const logOut = () => {
    return signOut(auth);
};

// 認証状態監視
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// 体重データ保存関数
export const saveWeightData = (userId, weightData) => {
    const userRef = ref(database, `users/${userId}/weights`);
    return push(userRef, {
        ...weightData,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD形式
    });
};

// 体重データ取得関数
export const loadWeightData = (userId, callback) => {
    const userRef = ref(database, `users/${userId}/weights`);
    return onValue(userRef, callback);
};

// 汎用データ操作関数
export const saveData = (collection, data) => {
    const dbRef = ref(database, collection);
    return push(dbRef, {
        ...data,
        timestamp: Date.now()
    });
};

export const loadData = (collection, callback) => {
    const dbRef = ref(database, collection);
    return onValue(dbRef, callback);
};
