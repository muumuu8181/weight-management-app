// タブシステム管理（動的読み込み・切り替え）
// 全タブの統合管理とコンテンツ読み込み

// タブコンテンツ動的読み込み
async function loadTabContent(tabNumber, tabType) {
    try {
        const tabContentDiv = document.getElementById(`tabContent${tabNumber}`);
        if (!tabContentDiv) return;
        
        // HTMLコンテンツを読み込み
        const response = await fetch(`tabs/tab${tabNumber}-${tabType}/tab-${tabType}.html`);
        if (response.ok) {
            const htmlContent = await response.text();
            tabContentDiv.innerHTML = htmlContent;
            
            // JavaScriptファイルを動的読み込み
            await loadTabScript(tabNumber, tabType);
            
            // タブ固有の初期化処理（JSファイル読み込み完了後）
            if (tabNumber === 1 && currentUser) {
                log(`🔄 tab1: 体重管理タブ初期化実行`);
                
                // 外部JSファイルの初期化関数を呼び出し
                setTimeout(() => {
                    if (typeof window.initWeightTab === 'function') {
                        window.initWeightTab();
                        log('✅ 体重管理タブ初期化完了');
                    } else {
                        log('❌ initWeightTab関数が見つかりません');
                    }
                }, 200);
            } else if (tabNumber === 3 && currentUser) {
                log('🔄 部屋片付けタブ: JS読み込み完了後のデータ読み込み開始');
                setTimeout(() => {
                    if (typeof window.loadRoomData === 'function') {
                        window.loadRoomData();
                        log('✅ 部屋片付けデータ読み込み実行');
                    } else if (typeof loadRoomData === 'function') {
                        loadRoomData();
                        log('✅ 部屋片付けデータ読み込み実行（ローカル関数）');
                    } else {
                        log('❌ loadRoomData関数が見つかりません');
                    }
                }, 200); // 少し長めの待機時間
            } else if (tabNumber === 5 && currentUser) {
                log('🔄 ダッシュボードタブ: JS読み込み完了後の初期化開始');
                setTimeout(() => {
                    if (typeof window.initDashboard === 'function') {
                        window.initDashboard();
                        log('✅ ダッシュボード初期化完了');
                    } else {
                        log('❌ initDashboard関数が見つかりません');
                    }
                }, 200);
            } else if (tabNumber === 8 && currentUser) {
                log('🔄 メモリストタブ: JS読み込み完了後のデータ読み込み開始');
                setTimeout(() => {
                    loadMemoData();
                }, 100);
            }
            
            log(`✅ タブ${tabNumber}（${tabType}）コンテンツ読み込み完了`);
        } else {
            log(`⚠️ タブ${tabNumber}の分離ファイルが見つかりません - 既存コンテンツを使用`);
        }
    } catch (error) {
        log(`❌ タブ読み込みエラー: ${error.message}`);
    }
}

// タブ用JavaScriptの動的読み込み
async function loadTabScript(tabNumber, tabType) {
    try {
        // 既存のスクリプトタグを削除
        const existingScript = document.getElementById(`tab${tabNumber}Script`);
        if (existingScript) {
            existingScript.remove();
        }
        
        // 新しいスクリプトタグを作成
        const script = document.createElement('script');
        script.id = `tab${tabNumber}Script`;
        script.src = `tabs/tab${tabNumber}-${tabType}/tab-${tabType}.js`;
        document.head.appendChild(script);
        
        return new Promise((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Script load failed: ${script.src}`));
        });
    } catch (error) {
        throw error;
    }
}

// タブ切り替え機能（動的読み込み対応）
async function switchTab(tabNumber) {
    const currentTab = tabNumber;
    
    // 現在のタブを localStorage に保存
    localStorage.setItem('currentTab', tabNumber);
    
    // すべてのタブボタンを非アクティブに（16タブ対応）
    for (let i = 1; i <= 16; i++) {
        const tabBtn = document.getElementById(`tab${i}`);
        const tabContent = document.getElementById(`tabContent${i}`);
        
        log(`🔍 タブ${i}: ボタン=${tabBtn ? '存在' : 'なし'}, コンテンツ=${tabContent ? '存在' : 'なし'}`);
        
        if (tabContent) {
            if (i === tabNumber) {
                tabContent.classList.remove('hidden');
                log(`✅ タブ${i}コンテンツを表示`);
                
                // 動的読み込み（全分離タブ統一）
                if (i === 1) {
                    await loadTabContent(1, 'weight');
                } else if (i === 2) {
                    await loadTabContent(2, 'sleep');
                } else if (i === 3) {
                    await loadTabContent(3, 'room-cleaning');
                } else if (i === 4) {
                    await loadTabContent(4, 'stretch');
                } else if (i === 5) {
                    await loadTabContent(5, 'dashboard');
                } else if (i === 8) {
                    await loadTabContent(8, 'memo-list');
                }
            } else {
                tabContent.classList.add('hidden');
                log(`❌ タブ${i}コンテンツを非表示`);
            }
        }
    }
    
    // タブボタンのスタイル適用（外部設定使用）
    if (window.TAB_CONFIG) {
        window.TAB_CONFIG.applyTabStyles(tabNumber);
    }
    
    // タイトル更新（外部設定使用）
    const titleElement = document.getElementById('appTitle');
    if (titleElement && window.TAB_CONFIG) {
        const tabTitle = window.TAB_CONFIG.getTabTitle(tabNumber);
        titleElement.textContent = `${tabTitle} ${APP_VERSION}`;
    }
    
    // 体重管理要素は常に表示（tabContent1内にあるため自動制御される）
    
    // タブ固有の初期化処理
    if (tabNumber === 1) {
        // 体重管理タブの初期化（外部JSで処理）
        if (currentUser && typeof window.initWeightTab === 'function') {
            log('🔄 体重管理タブ: 外部JS初期化実行');
            window.initWeightTab();
        }
    } else if (tabNumber === 2) {
        // 睡眠管理タブの初期化（ログインに関係なく実行）
        initializeSleepManager();
        if (currentUser) {
            loadSleepData();
        }
    } else if (tabNumber === 3) {
        // 部屋片付けタブの初期化（データ読み込みはloadTabContent完了後に実行）
        log('🔄 部屋片付けタブに切り替え - 初期化のみ実行');
        initRoomManagement();
    } else if (tabNumber === 5) {
        // ダッシュボードタブの初期化（データ読み込みはloadTabContent完了後に実行）
        log('🔄 ダッシュボードタブに切り替え - 初期化のみ実行');
    } else if (tabNumber === 8) {
        // メモリストタブの初期化（データ読み込みはloadTabContent完了後に実行）
        log('🔄 メモリストタブに切り替え - 初期化のみ実行');
    }
    
    log(`📑 タブ切り替え: タブ${tabNumber}`);
}

// グローバルに公開
window.loadTabContent = loadTabContent;
window.loadTabScript = loadTabScript;
window.switchTab = switchTab;