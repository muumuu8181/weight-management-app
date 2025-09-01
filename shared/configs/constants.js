/**
 * アプリケーション定数
 * アプリ全体で使用される定数値を管理
 */

// アプリケーション情報
const APP_INFO = {
    NAME: '体重管理アプリ',
    VERSION: '1.51',
    DESCRIPTION: '体重・睡眠・ストレッチ・部屋片付け管理システム',
    DEVELOPER: 'Claude Code Team'
};

// タブ定義
const TABS = {
    WEIGHT: { id: 1, name: '体重管理', icon: '⚖️' },
    SLEEP: { id: 2, name: '睡眠管理', icon: '🛏️' },
    ROOM_CLEANING: { id: 3, name: '部屋片付け', icon: '🧹' },
    STRETCH: { id: 4, name: 'ストレッチ', icon: '🧘' },
    MEMO: { id: 8, name: 'メモ', icon: '📝' }
};

// データベースパス
const DB_PATHS = {
    USERS: 'users',
    WEIGHT_DATA: 'weightData',
    SLEEP_DATA: 'sleepData',
    STRETCH_DATA: 'stretchData',
    ROOM_DATA: 'roomData',
    MEMO_DATA: 'memoData'
};

// UI設定
const UI_CONFIG = {
    // タブ関連
    MAX_TABS: 10,
    DEFAULT_TAB: 1,
    
    // データ表示
    ITEMS_PER_PAGE: 10,
    MAX_HISTORY_ITEMS: 100,
    
    // アニメーション時間
    ANIMATION_DURATION: {
        SHORT: 200,
        MEDIUM: 300,
        LONG: 500
    },
    
    // カラーテーマ
    COLORS: {
        PRIMARY: '#007bff',
        SUCCESS: '#28a745',
        WARNING: '#ffc107',
        DANGER: '#dc3545',
        INFO: '#17a2b8',
        SECONDARY: '#6c757d'
    }
};

// 入力値の制限
const INPUT_LIMITS = {
    WEIGHT: {
        MIN: 20,
        MAX: 300,
        DECIMAL_PLACES: 1
    },
    SLEEP: {
        MIN_HOURS: 1,
        MAX_HOURS: 24,
        QUALITY_MIN: 1,
        QUALITY_MAX: 5
    },
    STRETCH: {
        MIN_DURATION: 1,
        MAX_DURATION: 180,
        INTENSITY_MIN: 1,
        INTENSITY_MAX: 4
    }
};

// メッセージとテキスト
const MESSAGES = {
    // 成功メッセージ
    SUCCESS: {
        WEIGHT_SAVED: '体重データを保存しました',
        SLEEP_SAVED: '睡眠データを保存しました',
        STRETCH_SAVED: 'ストレッチデータを保存しました',
        ROOM_SAVED: '部屋片付けデータを保存しました',
        LOGIN_SUCCESS: 'ログインしました',
        LOGOUT_SUCCESS: 'ログアウトしました',
        COPIED: 'クリップボードにコピーしました'
    },
    
    // エラーメッセージ
    ERROR: {
        LOGIN_REQUIRED: 'ログインが必要です',
        INVALID_INPUT: '入力値が正しくありません',
        SAVE_FAILED: 'データの保存に失敗しました',
        LOAD_FAILED: 'データの読み込みに失敗しました',
        NETWORK_ERROR: 'ネットワークエラーが発生しました',
        COPY_FAILED: 'コピーに失敗しました'
    },
    
    // 警告メッセージ
    WARNING: {
        UNSAVED_CHANGES: '未保存の変更があります',
        DELETE_CONFIRM: 'このデータを削除しますか？',
        LOGOUT_CONFIRM: 'ログアウトしますか？'
    },
    
    // 情報メッセージ
    INFO: {
        NO_DATA: 'データがありません',
        LOADING: '読み込み中...',
        SAVING: '保存中...',
        PROCESSING: '処理中...'
    }
};

// 日付・時間フォーマット
const DATE_FORMATS = {
    INPUT: 'YYYY-MM-DD',
    DISPLAY: 'MM/DD',
    FULL: 'YYYY-MM-DD HH:mm',
    TIME_ONLY: 'HH:mm'
};

// ローカルストレージキー
const STORAGE_KEYS = {
    USER_PREFERENCES: 'userPreferences',
    THEME: 'theme',
    LANGUAGE: 'language',
    LAST_TAB: 'lastTab',
    CELEBRATION_SETTINGS: 'celebrationSettings'
};

// API設定
const API_CONFIG = {
    TIMEOUT: 10000, // 10秒
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1秒
};

// デバッグ設定
const DEBUG_CONFIG = {
    ENABLED: true,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    SHOW_PERFORMANCE: false
};

// エクスポート（グローバル変数として公開）
window.APP_INFO = APP_INFO;
window.TABS = TABS;
window.DB_PATHS = DB_PATHS;
window.UI_CONFIG = UI_CONFIG;
window.INPUT_LIMITS = INPUT_LIMITS;
window.MESSAGES = MESSAGES;
window.DATE_FORMATS = DATE_FORMATS;
window.STORAGE_KEYS = STORAGE_KEYS;
window.API_CONFIG = API_CONFIG;
window.DEBUG_CONFIG = DEBUG_CONFIG;