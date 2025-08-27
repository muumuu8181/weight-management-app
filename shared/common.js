// 共通JavaScript機能
// Firebase設定とユーティリティ関数

// Core Firebase設定
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

// 共通変数
let currentUser = null;
let currentTab = 1;

// 共通ユーティリティ関数
function log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.innerHTML += `${message}<br>`;
        logArea.scrollTop = logArea.scrollHeight;
    }
}

// 認証関連
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

async function handleLogout() {
    try {
        await auth.signOut();
        log('👋 ログアウト完了');
    } catch (error) {
        console.error('ログアウトエラー:', error);
        log(`❌ ログアウトエラー: ${error.message}`);
    }
}

// タブ管理
function switchTab(tabNumber) {
    currentTab = tabNumber;
    
    // すべてのタブボタンを非アクティブに
    for (let i = 1; i <= 10; i++) { // 将来の拡張を考慮して10まで対応
        const tabBtn = document.getElementById(`tab${i}`);
        const tabContent = document.getElementById(`tabContent${i}`);
        
        if (tabBtn && tabContent) {
            if (i === tabNumber) {
                // アクティブタブ
                tabBtn.style.background = '#007bff';
                tabBtn.style.color = 'white';
                tabContent.classList.remove('hidden');
            } else {
                // 非アクティブタブ
                tabBtn.style.background = '#f8f9fa';
                tabBtn.style.color = '#495057';
                tabContent.classList.add('hidden');
            }
        }
    }
    
    log(`📑 タブ切り替え: タブ${tabNumber}`);
}

// UI制御
function showUserInterface(user) {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('tabNavigation').classList.remove('hidden');
    document.getElementById('appHeader').classList.remove('hidden');
    document.getElementById('userName').textContent = user.displayName;
    
    // デフォルトでタブ1を表示
    switchTab(1);
}

function showLoginInterface() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('tabNavigation').classList.add('hidden');
    document.getElementById('appHeader').classList.add('hidden');
}

// 認証状態監視
auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        log(`✅ 認証状態確認: ${user.displayName} でログイン中`);
        log(`📧 メール: ${user.email}`);
        showUserInterface(user);
    } else {
        log('🔒 認証状態: 未ログイン');
        showLoginInterface();
    }
});

log('🔄 Firebase認証システム初期化完了 - 認証状態を確認中...');