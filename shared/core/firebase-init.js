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
const APP_VERSION = 'v2.15';

// グローバルに公開
window.auth = auth;
window.database = database;
window.currentUser = currentUser;
window.APP_VERSION = APP_VERSION;