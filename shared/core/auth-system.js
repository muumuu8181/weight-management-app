// Firebase認証システム管理
// 認証状態監視とログイン・ログアウト処理

// 認証状態の監視とメイン処理
function initializeAuthStateListener() {
    auth.onAuthStateChanged(async (user) => {
        currentUser = user;
        if (user) {
            log(`✅ 認証状態確認: ${user.displayName} でログイン中`);
            log(`📧 メール: ${user.email}`);
            showUserInterface(user);
            
            // 🔥 体重データ読み込み実行（緊急修正）
            if (typeof window.loadAndDisplayWeightData === 'function') {
                setTimeout(() => window.loadAndDisplayWeightData(), 1000);
                log('🔄 体重データ読み込み開始');
            } else {
                log('⚠️ loadAndDisplayWeightData関数が見つかりません - タブ切り替え後に実行');
            }
        } else {
            // リダイレクト結果をチェック（iPhone対応）
            try {
                const result = await auth.getRedirectResult();
                if (result.user) {
                    log(`✅ リダイレクトログイン成功: ${result.user.displayName}`);
                }
            } catch (error) {
                // リダイレクトエラーは無視（初回アクセス時など）
            }
            log('🔒 認証状態: 未ログイン');
            showLoginInterface();
        }
    });
}

// プロトコルチェック（自動診断）
function checkProtocolCompatibility() {
    if (window.location.protocol === 'file:') {
        log('⚠️ file://プロトコル検出 - Googleログインには HTTPサーバーが必要です');
        log('💡 解決方法: python -m http.server 8000 または chrome://flags設定');
    }
}

// 認証システム初期化（起動時に実行）
function initializeAuthSystem() {
    log('🔄 Firebase認証システム初期化完了 - 認証状態を確認中...');
    
    // 認証状態監視開始
    initializeAuthStateListener();
    
    // プロトコル互換性チェック
    checkProtocolCompatibility();
}

// グローバルに公開
window.initializeAuthSystem = initializeAuthSystem;