/**
 * Firebase設定と認証管理
 * アプリケーションのFirebase接続、認証機能を担当
 */

// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyA5PXKChizYDCXF_GJ4KL6Ylq9K5hCPXWE",
    authDomain: "shares-b1b97.firebaseapp.com",
    databaseURL: "https://shares-b1b97-default-rtdb.firebaseio.com",
    projectId: "shares-b1b97",
    storageBucket: "shares-b1b97.appspot.com",
    messagingSenderId: "1042718243134",
    appId: "1:1042718243134:web:4bb5c2557ec53fb8cb1e48"
};

// Firebase初期化
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();

// 現在のユーザー状態
let currentUser = null;

/**
 * Googleログイン処理
 */
async function handleGoogleLogin() {
    try {
        log('🔐 Googleログイン開始...');
        const provider = new firebase.auth.GoogleAuthProvider();
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            log('📱 モバイルデバイス検出 - ポップアップ方式でログイン');
        }
        
        const result = await auth.signInWithPopup(provider);
        log(`✅ ログイン成功: ${result.user.displayName}`);
        
    } catch (error) {
        console.error('ログインエラー:', error);
        log(`❌ ログインエラー: ${error.message}`);
    }
}

/**
 * ログアウト処理
 */
async function handleLogout() {
    try {
        await auth.signOut();
        log('👋 ログアウト完了');
    } catch (error) {
        console.error('ログアウトエラー:', error);
        log(`❌ ログアウトエラー: ${error.message}`);
    }
}

/**
 * 認証状態の監視
 */
function initializeAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            log(`🔒 認証状態: ログイン済み (${user.displayName})`);
            showUserInterface(user);
        } else {
            currentUser = null;
            log('🔒 認証状態: 未ログイン');
            hideUserInterface();
        }
    });
}

/**
 * UI表示制御 - ログイン時
 */
function showUserInterface(user) {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('tabNavigation').classList.remove('hidden');
    document.getElementById('appHeader').classList.remove('hidden');

    // ユーザー情報表示
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.displayName;
    }
    
    // プロファイル画像設定
    const userPhotoElement = document.getElementById('userPhoto');
    if (userPhotoElement && user.photoURL) {
        userPhotoElement.src = user.photoURL;
    }
    
    log(`👤 ユーザー情報表示: ${user.displayName}`);
}

/**
 * UI表示制御 - ログアウト時
 */
function hideUserInterface() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('tabNavigation').classList.add('hidden');
    document.getElementById('appHeader').classList.add('hidden');
    
    log('👻 ユーザー情報非表示');
}

// 初期化時に認証状態監視を開始
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    log('🔥 Firebase認証システム初期化完了 - 認証状態を確認中...');
});

// グローバルエクスポート（他のファイルから使用可能）
window.auth = auth;
window.database = database;
window.currentUser = currentUser;
window.handleGoogleLogin = handleGoogleLogin;
window.handleLogout = handleLogout;