// UI制御・初期化ユーティリティ関数

// UI表示制御（ログイン成功時）
function showUserInterface(user) {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('tabNavigation').classList.remove('hidden');
    document.getElementById('appHeader').classList.remove('hidden');
    // 体重管理関連要素は存在チェック後に表示
    const modeControl = document.getElementById('modeControl');
    if (modeControl) modeControl.classList.remove('hidden');
    
    const weightInput = document.getElementById('weightInput');
    if (weightInput) weightInput.classList.remove('hidden');
    
    const chartPanel = document.getElementById('chartPanel');
    if (chartPanel) chartPanel.classList.remove('hidden');
    
    const weightHistoryPanel = document.getElementById('weightHistoryPanel');
    if (weightHistoryPanel) weightHistoryPanel.classList.remove('hidden');
    document.getElementById('userName').textContent = user.displayName;
    
    // タブナビゲーション動的生成（外部設定使用）
    if (window.TAB_CONFIG) {
        window.TAB_CONFIG.generateTabNavigation();
    }
    
    // 保存されたタブまたはデフォルトでタブ1を表示
    const savedTab = localStorage.getItem('currentTab');
    const tabToShow = savedTab ? parseInt(savedTab) : 1;
    switchTab(tabToShow);
    
    // 日付初期化は各タブの外部JSファイルで実行
    
    // メモデータを読み込み（ログイン時、存在チェック付き）
    if (typeof loadMemoData === 'function') {
        loadMemoData();
        log('✅ メモデータ読み込み実行');
    } else {
        log('⚠️ loadMemoData関数未定義 - 初期化時スキップ');
    }
    
    // タイミングボタンの初期状態設定
    document.querySelectorAll('.timing-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.classList.remove('selected');
    });
    
    // 服装ボタンの初期状態設定
    document.querySelectorAll('.clothing-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // デフォルト服装選択（外部JSファイルで実行）
}

// UI表示制御（未ログイン時）
function showLoginInterface() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('tabNavigation').classList.add('hidden');
    document.getElementById('appHeader').classList.add('hidden');
    document.getElementById('modeControl').classList.add('hidden');
    document.getElementById('weightInput').classList.add('hidden');
    document.getElementById('chartPanel').classList.add('hidden');
}

// アプリ初期化
function initializeApp() {
    // バージョン表示の動的設定
    document.title = `体重管理アプリ ${APP_VERSION}`;
    document.getElementById('appTitle').textContent = `📊 体重管理アプリ ${APP_VERSION}`;
    
    log(`🚀 体重管理アプリ起動完了 ${APP_VERSION}`);
    log('🔐 認証システム準備完了');
}

// グローバルに公開
window.showUserInterface = showUserInterface;
window.showLoginInterface = showLoginInterface;
window.initializeApp = initializeApp;