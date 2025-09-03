// 共通・独自機能自動表示システム
// 全機能の実装状況を自動解析・視覚化

window.FunctionAnalyzer = {
    
    // 共通機能リスト（shared/ フォルダの関数）
    sharedFunctions: new Set([
        // Firebase・認証関連
        'handleGoogleLogin', 'handleLogout', 'showUserInterface', 'showLoginInterface',
        
        // タブ管理
        'switchTab', 'loadTabContent', 'generateTabNavigation',
        
        // データ操作
        'saveWeightData', 'editWeightEntry', 'deleteWeightEntry', 'copyLogs', 'copyDebugInfo',
        
        // 選択機能（DOMUtils）
        'selectTiming', 'selectClothingTop', 'selectClothingBottom',
        
        // バリデーション
        'markRequiredFields', 'validateRequiredFields', 'clearFieldBadges',
        
        // カスタム項目管理
        'loadCustomItems', 'saveCustomItems', 'addTopCustomItem', 'addBottomCustomItem',
        
        // エフェクト
        'smartEffects.trigger', 'simpleEffects.celebrate',
        
        // モード制御
        'setMode', 'selectTarget', 'executeAdd', 'cancelAdd',
        
        // 時間トラッキング（TimeTracker）
        'TimeTracker', 'start', 'stop', 'formatDuration',
        
        // データ分析
        'DataAnalytics.calculateWeeklyStats', 'DataAnalytics.analyzeValueTrend',
        
        // ダッシュボード
        'DashboardBuilder.buildDashboard', 'DashboardBuilder.generateSummaryCard',
        
        // ユーティリティ
        'log', 'debugFirebaseConnection', 'checkLoginIssues'
    ]),
    
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
        
        // 1. 共通機能チェック
        if (this.sharedFunctions.has(functionName)) {
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
    
    // 統計レポート表示
    showAnalysisReport() {
        const stats = this.getAnalysisStats();
        
        const report = `
=== 機能実装状況レポート（4分類版） ===

📊 統計:
- 🔗 共通機能: ${stats.shared}個 (${stats.sharedPercentage}%)
- ⚙️ 独自機能: ${stats.custom}個 (${stats.customPercentage}%)
- ⚠️ 動的機能: ${stats.dynamic}個 (${stats.dynamicPercentage}%)
- ❌ エラー機能: ${stats.errors}個
- 📋 総機能数: ${stats.total}個

🎯 共通化率: ${stats.sharedPercentage}%
🔧 改善候補: ${stats.customPercentage}% (独自機能)

💡 改善提案:
${stats.errors > 0 ? `🚨 ${stats.errors}個の未実装機能があります` : '✅ 全機能が正常に実装されています'}
${stats.customPercentage > 30 ? '⚠️ 独自機能が多めです - 共通化を検討してください' : ''}
${stats.sharedPercentage > 50 ? '✅ 良好な共通化率です' : '📈 共通化率向上の余地があります'}

生成日時: ${new Date().toLocaleString('ja-JP')}
        `.trim();
        
        if (typeof log === 'function') log(report);
        
        // クリップボードにもコピー
        navigator.clipboard.writeText(report).then(() => {
            alert('📊 機能解析レポートをクリップボードにコピーしました');
        }).catch(() => {
            alert('📊 機能解析レポート:\n' + report);
        });
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