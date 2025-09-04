// 共通・独自機能自動表示システム
// 全機能の実装状況を自動解析・視覚化

window.FunctionAnalyzer = {
    
    // 共通機能リスト（shared/ フォルダの関数）- 拡張版
    sharedFunctions: new Set([
        // Firebase・認証関連
        'handleGoogleLogin', 'handleLogout', 'showUserInterface', 'showLoginInterface',
        
        // タブ管理
        'switchTab', 'loadTabContent', 'generateTabNavigation',
        
        // データ操作
        'saveWeightData', 'editWeightEntry', 'deleteWeightEntry', 'copyLogs', 'copyDebugInfo',
        'savePedometerData', 'loadPedometerData', 'deletePedometerEntry',
        
        // 選択機能（DOMUtils）
        'selectTiming', 'selectClothingTop', 'selectClothingBottom', 'selectExerciseType',
        
        // バリデーション
        'markRequiredFields', 'validateRequiredFields', 'clearFieldBadges',
        
        // カスタム項目管理
        'loadCustomItems', 'saveCustomItems', 'addTopCustomItem', 'addBottomCustomItem',
        
        // エフェクト
        'smartEffects', 'simpleEffects',
        
        // モード制御
        'setMode', 'selectTarget', 'executeAdd', 'cancelAdd',
        
        // 時間トラッキング（TimeTracker）
        'TimeTracker', 'formatDuration',
        
        // タスク管理（UniversalTaskManager）
        'UniversalTaskManager',
        
        // データ分析
        'DataAnalytics', 'DashboardBuilder',
        
        // Firebase CRUD統一
        'FirebaseCRUD',
        
        // ユーティリティ
        'log', 'debugFirebaseConnection', 'checkLoginIssues', 'copyDebugInfo'
    ]),
    
    // 共通機能パターンも追加
    isSharedFunction(functionName, onclickCode) {
        // 直接的な共通機能チェック
        if (this.sharedFunctions.has(functionName)) return true;
        
        // パターンベースの共通機能チェック
        const sharedPatterns = [
            /window\.smartEffects/,           // window.smartEffects.trigger()
            /new (TimeTracker|UniversalTaskManager)/, // new 共通クラス()
            /FirebaseCRUD\./,                 // FirebaseCRUD.save()
            /DataAnalytics\./,                // DataAnalytics.xxx()
            /DashboardBuilder\./              // DashboardBuilder.xxx()
        ];
        
        return sharedPatterns.some(pattern => pattern.test(onclickCode));
    },
    
    // 初期化（全要素スキャン）
    initAutoAnalysis() {
        const startTime = performance.now();
        
        // CSS読み込み
        this.loadFunctionBadgeCSS();
        
        // 全機能解析実行
        this.analyzeAllFunctions();
        
        const endTime = performance.now();
        if (typeof log === 'function') {
            log(`🔍 機能解析完了: ${Math.round(endTime - startTime)}ms`);
        }
        
        // DOM変更監視開始
        this.startMutationObserver();
    },
    
    // CSS読み込み
    loadFunctionBadgeCSS() {
        const existingLink = document.querySelector('link[href*="function-badges.css"]');
        if (existingLink) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'shared/styles/function-badges.css';
        document.head.appendChild(link);
    },
    
    // 全機能解析
    analyzeAllFunctions() {
        let sharedCount = 0;
        let customCount = 0;
        let dynamicCount = 0;
        let errorCount = 0;
        
        // onclick属性を持つ要素をスキャン
        const clickableElements = document.querySelectorAll('[onclick]');
        
        clickableElements.forEach(element => {
            const onclickValue = element.getAttribute('onclick');
            if (!onclickValue) return;
            
            // 既にバッジがある場合はスキップ
            if (element.querySelector('.shared-function-badge, .custom-function-badge, .dynamic-function-badge, .error-function-badge')) {
                return;
            }
            
            const badge = this.analyzeFunctionType(onclickValue);
            if (badge) {
                element.appendChild(badge);
                
                if (badge.classList.contains('shared-function-badge')) sharedCount++;
                else if (badge.classList.contains('custom-function-badge')) customCount++;
                else if (badge.classList.contains('dynamic-function-badge')) dynamicCount++;
                else errorCount++;
            }
        });
        
        if (typeof log === 'function') {
            log(`📊 機能解析結果: 共通${sharedCount}個 / 独自${customCount}個 / 動的${dynamicCount}個 / エラー${errorCount}個`);
        }
    },
    
    // 関数種別解析（改善版: 4分類対応）
    analyzeFunctionType(onclickCode) {
        const badge = document.createElement('span');
        
        // 関数名を抽出
        const functionMatch = onclickCode.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
        if (!functionMatch) return null;
        
        const functionName = functionMatch[1];
        
        // 1. 共通機能チェック（拡張版）
        if (this.isSharedFunction(functionName, onclickCode)) {
            badge.className = 'shared-function-badge';
            badge.textContent = '共通';
            badge.title = `共通機能: ${functionName}() - shared/ で実装済み`;
            return badge;
        }
        
        // 2. 動的関数パターンチェック
        if (this.isLikelyDynamicFunction(functionName, onclickCode)) {
            badge.className = 'dynamic-function-badge';
            badge.textContent = '動的';
            badge.title = `動的機能: ${functionName}() - 動的読み込み/名前空間内関数`;
            return badge;
        }
        
        // 3. 存在確認（独自機能）
        if (typeof window[functionName] === 'function') {
            badge.className = 'custom-function-badge';
            badge.textContent = '独自';
            badge.title = `独自機能: ${functionName}() - タブ固有実装`;
            return badge;
        }
        
        // 4. 本当のエラー（最後の手段）
        badge.className = 'error-function-badge';
        badge.textContent = 'エラー';
        badge.title = `未実装: ${functionName}() - 関数が見つかりません`;
        return badge;
    },
    
    // 動的関数パターン判定（厳密化）
    isLikelyDynamicFunction(functionName, onclickCode) {
        // 明確な動的パターンのみ
        const dynamicPatterns = [
            // 名前空間付き（確実に動的）
            /\w+\./,                    // WeightTab.xxx, StretchTab.xxx
            // 引数付き関数呼び出し（動的生成される可能性高）
            /\('\w+'\)|Entry\('|Data\('/,
            // Chart.js固有
            /^(updateChart|navigateChart|getPreviousPeriod)/
        ];
        
        // onclickCode全体をチェック
        return dynamicPatterns.some(pattern => pattern.test(onclickCode));
    },
    
    // DOM変更監視（新要素への自動適用）
    startMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let hasNewElements = false;
            
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // 新要素とその子要素をチェック
                        const newClickableElements = node.querySelectorAll ? 
                            [node, ...node.querySelectorAll('[onclick]')].filter(el => el.hasAttribute && el.hasAttribute('onclick')) :
                            node.hasAttribute && node.hasAttribute('onclick') ? [node] : [];
                        
                        if (newClickableElements.length > 0) {
                            hasNewElements = true;
                        }
                    }
                });
            });
            
            // 新要素がある場合のみ再解析（パフォーマンス最適化）
            if (hasNewElements) {
                // 少し遅延させて DOM 更新完了を待つ
                setTimeout(() => {
                    this.analyzeAllFunctions();
                }, 100);
            }
        });
        
        // 監視開始
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        if (typeof log === 'function') {
            log('👁️ DOM変更監視開始 - 新要素の自動機能解析有効');
        }
    },
    
    // パフォーマンスモード切り替え
    togglePerformanceMode() {
        const body = document.body;
        if (body.classList.contains('perf-mode')) {
            body.classList.remove('perf-mode');
            if (typeof log === 'function') log('⚡ アニメーションモード: 有効');
        } else {
            body.classList.add('perf-mode');
            if (typeof log === 'function') log('🏃 パフォーマンスモード: 有効');
        }
    },
    
    // 統計情報取得（4分類対応）
    getAnalysisStats() {
        const shared = document.querySelectorAll('.shared-function-badge').length;
        const custom = document.querySelectorAll('.custom-function-badge').length;
        const dynamic = document.querySelectorAll('.dynamic-function-badge').length;
        const errors = document.querySelectorAll('.error-function-badge').length;
        const total = shared + custom + dynamic + errors;
        
        return {
            shared: shared,
            custom: custom,
            dynamic: dynamic,
            errors: errors,
            total: total,
            sharedPercentage: total > 0 ? Math.round((shared / total) * 100) : 0,
            customPercentage: total > 0 ? Math.round((custom / total) * 100) : 0,
            dynamicPercentage: total > 0 ? Math.round((dynamic / total) * 100) : 0
        };
    },
    
    // 詳細解析レポート生成
    generateDetailedReport() {
        const tabAnalysis = this.analyzeByTab();
        let report = '=== 機能解析詳細レポート ===\n\n';
        
        tabAnalysis.forEach(tab => {
            report += `📂 ${tab.name}\n`;
            report += `  HTML行数: ${tab.htmlLines}行\n`;
            report += `  関数数: ${tab.totalFunctions}個\n`;
            report += `  🔗 共通: ${tab.shared}個 (${tab.sharedPercentage}%)\n`;
            report += `  ⚙️ 独自: ${tab.custom}個 (${tab.customPercentage}%)\n`;
            report += `  ⚠️ 動的: ${tab.dynamic}個 (${tab.dynamicPercentage}%)\n`;
            report += `  ❌ エラー: ${tab.errors}個\n\n`;
        });
        
        const totalStats = this.getAnalysisStats();
        report += `📊 全体統計:\n`;
        report += `  総機能数: ${totalStats.total}個\n`;
        report += `  共通化率: ${totalStats.sharedPercentage}%\n`;
        report += `  改善候補: ${totalStats.customPercentage}% (独自機能)\n\n`;
        
        report += `生成日時: ${new Date().toLocaleString('ja-JP')}\n`;
        
        return report;
    },
    
    // タブ別解析
    analyzeByTab() {
        const tabs = ['tab1-weight', 'tab2-sleep', 'tab3-room-cleaning', 'tab4-stretch', 'tab5-dashboard', 'tab6-job-dc', 'tab7-pedometer', 'tab8-memo-list'];
        
        return tabs.map(tabName => {
            // 各タブのHTML要素から機能を抽出
            const tabContent = document.getElementById(`${tabName.replace('tab', 'tabContent').replace('-', '').replace(/\d/, '$&')}`);
            let htmlLines = 0;
            let functions = { shared: 0, custom: 0, dynamic: 0, errors: 0 };
            
            if (tabContent) {
                // HTML行数概算（innerHTML文字数 / 50）
                htmlLines = Math.round(tabContent.innerHTML.length / 50);
                
                // タブ内の機能解析
                const tabClickables = tabContent.querySelectorAll('[onclick]');
                tabClickables.forEach(element => {
                    const badge = element.querySelector('.shared-function-badge, .custom-function-badge, .dynamic-function-badge, .error-function-badge');
                    if (badge) {
                        if (badge.classList.contains('shared-function-badge')) functions.shared++;
                        else if (badge.classList.contains('custom-function-badge')) functions.custom++;
                        else if (badge.classList.contains('dynamic-function-badge')) functions.dynamic++;
                        else functions.errors++;
                    }
                });
            }
            
            const total = functions.shared + functions.custom + functions.dynamic + functions.errors;
            
            return {
                name: tabName,
                htmlLines: htmlLines,
                totalFunctions: total,
                shared: functions.shared,
                custom: functions.custom,
                dynamic: functions.dynamic,
                errors: functions.errors,
                sharedPercentage: total > 0 ? Math.round((functions.shared / total) * 100) : 0,
                customPercentage: total > 0 ? Math.round((functions.custom / total) * 100) : 0,
                dynamicPercentage: total > 0 ? Math.round((functions.dynamic / total) * 100) : 0
            };
        });
    },
    
    // 統計レポート表示
    showAnalysisReport() {
        const report = this.generateDetailedReport();
        
        if (typeof log === 'function') log(report);
        
        // クリップボードにもコピー
        navigator.clipboard.writeText(report).then(() => {
            alert('📊 詳細機能解析レポートをクリップボードにコピーしました');
        }).catch(() => {
            alert('📊 機能解析レポート:\n' + report);
        });
        
        return report;
    }
};

// 動的読み込み対応の初期化実行
function initFunctionAnalyzer() {
    if (typeof window.FunctionAnalyzer === 'object') {
        window.FunctionAnalyzer.initAutoAnalysis();
    }
}

// 即座に実行を試行
setTimeout(() => {
    initFunctionAnalyzer();
    if (typeof log === 'function') {
        log('🔍 機能解析システム初期化完了');
    }
}, 2000); // タブ読み込み完了を待つ

// DOMContentLoaded対応（既に発生済みの場合のフォールバック）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initFunctionAnalyzer, 1000);
    });
} else {
    // 既にDOMContentLoaded済みの場合
    setTimeout(initFunctionAnalyzer, 1500);
}

// タブ切り替え時にも再実行
window.addEventListener('tabSwitched', () => {
    setTimeout(initFunctionAnalyzer, 500);
});

// 手動実行関数も提供
window.runFunctionAnalysis = initFunctionAnalyzer;