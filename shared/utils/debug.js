// Firebase接続デバッグ
window.debugFirebaseConnection = () => {
    log('🔍 === Firebase Debug 開始 ===');
    
    // 1. Firebase設定確認
    log(`🔥 Firebase Config確認:`);
    log(`- Project ID: ${firebaseConfig.projectId}`);
    log(`- Database URL: ${firebaseConfig.databaseURL}`);
    log(`- Auth Domain: ${firebaseConfig.authDomain}`);
    
    // 2. 認証状態確認
    if (currentUser) {
        log(`✅ 認証済みユーザー:`);
        log(`- UID: ${currentUser.uid.substring(0,8)}...`);
        log(`- Email: ${currentUser.email}`);
        log(`- 表示名: ${currentUser.displayName}`);
    } else {
        log('❌ 未認証状態');
    }
    
    // 3. 接続テスト
    const connectedRef = database.ref('.info/connected');
    connectedRef.once('value', (snapshot) => {
        const connected = snapshot.val();
        log(`🌐 Firebase接続状態: ${connected ? '接続中' : '未接続'}`);
        
        if (connected && currentUser) {
            // データベーステスト
            const testRef = database.ref(`users/${currentUser.uid}/test`);
            testRef.set({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                message: 'Connection test',
                app: 'app-template'
            }).then(() => {
                log('✅ データベース書き込みテスト成功');
            }).catch((error) => {
                log(`❌ データベース書き込みエラー: ${error.message}`);
                log(`- Error Code: ${error.code}`);
            });
        }
    });
    
    log('🔍 === Firebase Debug 完了 ===');
};

// モバイル環境診断
window.checkMobileSupport = () => {
    log('📱 === モバイル環境診断 開始 ===');
    
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    log(`🌐 ユーザーエージェント: ${userAgent}`);
    log(`📱 モバイルデバイス判定: ${isMobile ? 'モバイル' : 'デスクトップ'}`);
    
    // ブラウザ判定
    const isChrome = /Chrome/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
    const isFirefox = /Firefox/i.test(userAgent);
    
    log(`🌐 ブラウザ: ${isChrome ? 'Chrome' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : '不明'}`);
    
    // ログイン方式の推奨
    if (isMobile) {
        log('💡 モバイルの推奨設定:');
        log('- Googleログインはリダイレクト方式を使用');
        log('- ポップアップブロッカーの影響なし');
        log('- 認証後にページが再読み込みされます');
    }
    
    log('📱 === モバイル環境診断 完了 ===');
};

// Firebase設定診断
window.checkFirebaseConfig = () => {
    log('🔧 === Firebase設定診断 開始 ===');
    
    // 現在のドメイン確認
    const currentDomain = window.location.hostname;
    const currentUrl = window.location.href;
    log(`🌐 現在のドメイン: ${currentDomain}`);
    log(`🔗 現在のURL: ${currentUrl}`);
    
    // Firebase設定情報
    log(`🔥 Firebase設定:`);
    log(`- Project ID: ${firebaseConfig.projectId}`);
    log(`- Auth Domain: ${firebaseConfig.authDomain}`);
    log(`- Database URL: ${firebaseConfig.databaseURL}`);
    
    // 認証ドメイン許可状況の推測
    if (currentDomain === 'muumuu8181.github.io') {
        log('✅ GitHub Pagesドメイン検出');
        log('💡 Firebase Consoleでこのドメインが許可されているか確認が必要');
    } else if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
        log('✅ ローカルホスト検出');
        log('💡 通常は自動で許可されています');
    } else {
        log('⚠️ 不明なドメインです');
        log('💡 Firebase Consoleの認証設定で許可が必要かもしれません');
    }
    
    // モバイルブラウザでのリダイレクト制限確認
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    if (isMobile) {
        log('📱 モバイルブラウザ固有の制限:');
        log('- Safari: サードパーティCookieの制限あり');
        log('- Chrome Mobile: ポップアップの自動ブロック');
        log('- 解決策: リダイレクト方式またはポップアップ許可設定');
    }
    
    log('🔧 === Firebase設定診断 完了 ===');
};

// 認証状態の強制確認
window.forceAuthCheck = () => {
    log('🔍 === 認証状態強制確認 開始 ===');
    
    const user = auth.currentUser;
    log(`🔐 Firebase認証状態: ${user ? `ログイン済み (${user.displayName})` : '未ログイン'}`);
    
    if (user) {
        log('✅ ユーザー画面を表示します');
        showUserInterface(user);
        loadUserWeightData(user.uid);
    } else {
        log('❌ ログイン画面を表示します');
        showLoginInterface();
    }
    
    // 認証トークンの有効性確認
    if (user) {
        user.getIdToken(true).then(() => {
            log('✅ 認証トークンは有効です');
        }).catch((tokenError) => {
            log(`❌ 認証トークンエラー: ${tokenError.message}`);
            log('💡 再ログインが必要かもしれません');
        });
    }
    
    log('🔍 === 認証状態強制確認 完了 ===');
};

// ログイン問題診断
window.checkLoginIssues = () => {
    log('⚠️ === ログイン問題診断 開始 ===');
    
    // 1. プロトコルチェック
    const protocol = window.location.protocol;
    log(`🌐 現在のプロトコル: ${protocol}`);
    
    if (protocol === 'file:') {
        log('❌ 問題発見: file://プロトコルではGoogle認証が動作しません');
        log('✅ 解決方法:');
        log('  1. HTTPサーバー経由でアクセス');
        log('  2. chrome://flags で insecure origins を許可');
        log('  3. ローカルサーバー起動 (python -m http.server 8000)');
    } else if (protocol === 'https:' || protocol === 'http:') {
        log('✅ プロトコル: 問題なし');
    }
    
    // 2. Web Storage確認
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        log('✅ Web Storage: 利用可能');
    } catch (e) {
        log('❌ Web Storage: 無効');
        log('✅ 解決方法: ブラウザ設定でCookieを有効にしてください');
    }
    
    // 3. Firebaseライブラリ確認
    if (typeof firebase !== 'undefined') {
        log('✅ Firebase SDK: 読み込み済み');
        log(`- Firebase Version: ${firebase.SDK_VERSION || 'Unknown'}`);
    } else {
        log('❌ Firebase SDK: 読み込みエラー');
    }
    
    // 4. ドメイン確認
    const domain = window.location.hostname;
    log(`🏠 現在のドメイン: ${domain}`);
    
    if (domain === 'localhost' || domain === '127.0.0.1') {
        log('✅ ローカル開発: Firebase設定で許可が必要');
    }
    
    log('⚠️ === ログイン問題診断 完了 ===');
};

// データベース構造確認
window.checkDatabaseStructure = async () => {
    if (!currentUser) {
        log('❌ ログインが必要です');
        return;
    }
    
    log('🏗️ === データベース構造確認 開始 ===');
    
    try {
        // 現在のユーザーのweightsデータ構造を確認
        const userRef = database.ref(`users/${currentUser.uid}/weights`);
        const snapshot = await userRef.once('value');
        const data = snapshot.val();
        
        if (data) {
            const entries = Object.keys(data);
            log(`📊 現在のユーザー(${currentUser.email})のデータ:`);
            log(`- データ記録数: ${entries.length}件`);
            log(`- 最新記録ID: ${entries[entries.length - 1]}`);
            
            // サンプルデータ構造を表示
            const sampleEntry = data[entries[0]];
            log(`- データ構造: ${JSON.stringify(sampleEntry, null, 2)}`);
        } else {
            log('📊 現在のユーザーにはデータがありません');
        }
        
        // ルートレベルの構造確認（管理者権限が必要）
        try {
            const rootRef = database.ref('users');
            const rootSnapshot = await rootRef.once('value');
            const allUsers = rootSnapshot.val();
            
            if (allUsers) {
                const userCount = Object.keys(allUsers).length;
                log(`👥 全体統計:`);
                log(`- 登録ユーザー数: ${userCount}人`);
                
                let totalWeights = 0;
                Object.values(allUsers).forEach(user => {
                    if (user.weights) {
                        totalWeights += Object.keys(user.weights).length;
                    }
                });
                log(`- 全体の体重記録数: ${totalWeights}件`);
            }
        } catch (error) {
            log(`⚠️ 全体統計の取得に制限があります: ${error.message}`);
        }
        
    } catch (error) {
        log(`❌ 構造確認エラー: ${error.message}`);
    }
    
    log('🏗️ === データベース構造確認 完了 ===');
};