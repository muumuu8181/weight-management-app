// Firebase初期化とグローバル変数設定

// Core Firebase設定（変更禁止 - core/src/firebase-config.js参照）
const firebaseConfig = {
    apiKey: "AIzaSyA5PXKChizYDCXF_GJ4KL6Ylq9K5hCPXWE",
    authDomain: "shares-b1b97.firebaseapp.com",
    databaseURL: "https://shares-b1b97-default-rtdb.firebaseio.com",
    projectId: "shares-b1b97",
    storageBucket: "shares-b1b97.firebasestorage.app",
    messagingSenderId: "38311063248",
    appId: "1:38311063248:web:0d2d5726d12b305b24b8d5"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// グローバル変数定義
let currentUser = null;
let selectedTimingValue = '';
let selectedTopValue = '';
let selectedBottomValue = '';
let weightChart = null;
let allWeightData = [];
window.editingEntryId = null;

// アプリバージョン（一元管理）
const APP_VERSION = 'v2.53';

// グローバルに公開（安全な参照用）
window.auth = auth;
window.database = database;
window.APP_VERSION = APP_VERSION;  // バージョン一元管理

// バージョン表示の統一関数
window.updateVersionDisplay = function() {
    try {
        // ページタイトル更新
        document.title = `体重管理アプリ ${APP_VERSION}`;
        
        // メインタイトル更新
        const appTitle = document.getElementById('appTitle');
        if (appTitle) {
            appTitle.textContent = `📊 体重管理アプリ ${APP_VERSION}`;
        }
        
        console.log(`🚀 バージョン表示統一完了: ${APP_VERSION}`);
    } catch (error) {
        console.error('バージョン表示エラー:', error);
    }
};

// 🔧 緊急修正: グローバル関数のフォールバック実装
window.updateChartRange = window.updateChartRange || function(days) {
    console.log(`⏳ updateChartRange(${days}) 実行待機中 - weight.js読み込み中...`);
    
    // weight.jsが読み込まれるまで待機
    const checkInterval = setInterval(() => {
        if (window.updateChartRange !== this && typeof window.updateChartRange === 'function') {
            clearInterval(checkInterval);
            console.log(`✅ weight.js読み込み完了 - updateChartRange(${days})を再実行`);
            window.updateChartRange(days);
        }
    }, 100);
    
    // 10秒後にタイムアウト
    setTimeout(() => {
        clearInterval(checkInterval);
        console.error(`❌ updateChartRange読み込みタイムアウト - weight.jsの読み込みに失敗`);
    }, 10000);
};

window.togglePreviousPeriod = window.togglePreviousPeriod || function() {
    console.log(`⏳ togglePreviousPeriod() 実行待機中 - weight.js読み込み中...`);
    
    // weight.jsが読み込まれるまで待機
    const checkInterval = setInterval(() => {
        if (window.togglePreviousPeriod !== this && typeof window.togglePreviousPeriod === 'function') {
            clearInterval(checkInterval);
            console.log(`✅ weight.js読み込み完了 - togglePreviousPeriod()を再実行`);
            window.togglePreviousPeriod();
        }
    }, 100);
    
    // 10秒後にタイムアウト
    setTimeout(() => {
        clearInterval(checkInterval);
        console.error(`❌ togglePreviousPeriod読み込みタイムアウト - weight.jsの読み込みに失敗`);
    }, 10000);
};
window.currentUser = currentUser;