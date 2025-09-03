// 統合ダッシュボード - 共通コンポーネント完全活用版
// 軽量実装: 共通ユーティリティを最大限活用

// ダッシュボード状態管理
let dashboardData = {
    weight: [],
    sleep: [],
    room: [],
    memo: []
};

let currentDashboardView = 'overview';
let dashboardCharts = {};

// タブ設定（共通コンポーネント用）- エラーハンドリング追加
let DASHBOARD_TAB_CONFIGS = {};
try {
    DASHBOARD_TAB_CONFIGS = window.DASHBOARD_BUILDER?.getStandardTabConfigs() || {};
} catch (error) {
    log('⚠️ DASHBOARD_BUILDER未初期化 - フォールバック設定使用');
    DASHBOARD_TAB_CONFIGS = {
        weight: { label: '体重', icon: '⚖️' },
        sleep: { label: '睡眠', icon: '😴' },
        room: { label: '部屋', icon: '🏠' },
        memo: { label: 'メモ', icon: '📝' }
    };
}

// ダッシュボード初期化（共通コンポーネント使用）
window.initDashboard = function() {
    log('🔄 ダッシュボード初期化開始（共通コンポーネント版）');
    
    if (!currentUser) {
        log('❌ ログインが必要です - ダッシュボード初期化をスキップ');
        return;
    }
    
    log(`👤 ユーザー: ${currentUser.displayName} (${currentUser.uid})`);
    
    // 共通ダッシュボードビルダーを使用してUI構築
    const container = document.getElementById('tabContent5');
    if (container) {
        // 既存HTMLを置換
        container.innerHTML = '<div class="dashboard-container" id="dashboardContainer"></div>';
        
        window.DASHBOARD_BUILDER.buildDashboard('dashboardContainer', DASHBOARD_TAB_CONFIGS, {
            showWeeklyData: true,
            showOverallProgress: true
        });
    }
    
    // 初期ビュー設定
    switchDashboardView('overview');
    
    // Firebase接続確認
    if (typeof database === 'undefined') {
        log('❌ Firebase database未初期化');
        return;
    }
    
    // 全データの読み込み（共通ローダー使用）
    log('🔍 Firebase データ読み込み開始（共通ローダー使用）...');
    refreshDashboardData();
    
    log('✅ ダッシュボード初期化完了');
};

// ダッシュボードビュー切り替え（共通ビルダー使用）
window.switchDashboardView = function(viewType) {
    currentDashboardView = viewType;
    
    // 共通ビルダーのビュー切り替え関数を使用
    window.DASHBOARD_BUILDER.switchView(viewType, DASHBOARD_TAB_CONFIGS);
    
    // ビューごとの特別処理（チャート生成等）
    if (viewType === 'weight' && dashboardData.weight.length > 0) {
        createWeightTrendChart();
    } else if (viewType === 'sleep' && dashboardData.sleep.length > 0) {
        createSleepTrendChart();
    }
    
    log(`📑 ダッシュボードビュー切り替え: ${viewType}（共通コンポーネント使用）`);
};

// 全データ更新（共通ローダー使用）
window.refreshDashboardData = async function() {
    log('🔄 ダッシュボードデータ更新開始（共通ローダー使用）');
    
    if (!currentUser) {
        log('❌ ユーザー未ログイン - データ更新不可');
        return;
    }
    
    try {
        // 共通ローダーを使用して並行データ取得
        const userId = currentUser.uid;
        
        dashboardData.weight = await window.FIREBASE_MULTI_LOADER.loadWeightData(userId);
        dashboardData.sleep = await window.FIREBASE_MULTI_LOADER.loadSleepData(userId);
        dashboardData.room = await window.FIREBASE_MULTI_LOADER.loadRoomData(userId);
        dashboardData.memo = await window.FIREBASE_MULTI_LOADER.loadMemoData(userId);
        
        // 共通ダッシュボードビルダーでデータ更新
        window.DASHBOARD_BUILDER.updateDashboardData(DASHBOARD_TAB_CONFIGS, dashboardData);
        
        // 改善分析実行（共通アドバイザー使用）
        analyzeOverallProgressWithAdvisor();
        
        log('✅ ダッシュボードデータ更新完了（共通コンポーネント使用）');
        
    } catch (error) {
        log(`❌ データ更新エラー: ${error.message}`);
    }
};

// 総合改善分析（共通アドバイザー使用）
function analyzeOverallProgressWithAdvisor() {
    const trendResults = [];
    
    // 各タブの傾向分析（共通分析機能使用）
    if (dashboardData.weight.length > 0) {
        const weightTrend = window.DATA_ANALYTICS.analyzeNumericTrend(dashboardData.weight, 'weight', 60);
        trendResults.push({ category: 'weight', ...weightTrend });
    }
    
    if (dashboardData.sleep.length > 0) {
        const sleepTrend = window.DATA_ANALYTICS.analyzeRatingTrend(dashboardData.sleep, 'quality', 5, 14);
        trendResults.push({ category: 'sleep', ...sleepTrend });
    }
    
    if (dashboardData.room.length > 0) {
        const roomTrend = window.DATA_ANALYTICS.analyzeCompletionTrend(dashboardData.room, 'completed');
        trendResults.push({ category: 'room', ...roomTrend });
    }
    
    if (dashboardData.memo.length > 0) {
        const memoTrend = window.DATA_ANALYTICS.analyzeMonthlyComparison(dashboardData.memo);
        trendResults.push({ category: 'memo', ...memoTrend });
    }
    
    // 共通アドバイザーで総合評価
    const overallResult = window.IMPROVEMENT_ADVISOR.calculateOverallScore(trendResults);
    
    // UI更新
    const scoreElement = document.getElementById('improvementScore');
    const detailsElement = document.getElementById('improvementDetails');
    
    if (scoreElement) {
        scoreElement.innerHTML = `改善スコア: <span class="${overallResult.colorClass}">${overallResult.score}/100点</span> - ${overallResult.message}`;
    }
    
    if (detailsElement) {
        const improvements = trendResults.map(result => 
            `${result.category}: ${result.message} (${result.score}点)`
        );
        detailsElement.innerHTML = improvements.map(imp => `• ${imp}`).join('<br>');
    }
    
    log(`📊 総合改善スコア: ${overallResult.score}点（共通アドバイザー使用）`);
}

// チャート生成（タブ固有処理）
function createWeightTrendChart() {
    const canvas = document.getElementById('weightTrendChart');
    if (!canvas || dashboardData.weight.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    
    if (dashboardCharts.weight) {
        dashboardCharts.weight.destroy();
    }
    
    const weights = dashboardData.weight.slice(-30);
    
    dashboardCharts.weight = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weights.map(w => w.date),
            datasets: [{
                label: '体重 (kg)',
                data: weights.map(w => w.weight),
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
    
    // 分析テキスト更新（共通アドバイザー使用）
    const trend = window.DATA_ANALYTICS.analyzeNumericTrend(weights, 'weight', 60);
    const advice = window.IMPROVEMENT_ADVISOR.getWeightAdvice(trend, weights[weights.length - 1]?.weight);
    
    document.getElementById('weightAnalysisText').innerHTML = `
        <strong>傾向分析:</strong> ${trend.message}<br>
        <strong>データ期間:</strong> 最近${weights.length}件の記録<br>
        <strong>改善アドバイス:</strong> ${advice}
    `;
}

function createSleepTrendChart() {
    const canvas = document.getElementById('sleepTrendChart');
    if (!canvas || dashboardData.sleep.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    
    if (dashboardCharts.sleep) {
        dashboardCharts.sleep.destroy();
    }
    
    const sleeps = dashboardData.sleep.slice(-20);
    
    dashboardCharts.sleep = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sleeps.map(s => s.date),
            datasets: [{
                label: '睡眠質 (1-5)',
                data: sleeps.map(s => s.quality || 0),
                backgroundColor: '#6f42c1',
                borderColor: '#6f42c1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 5 }
            }
        }
    });
    
    // 分析テキスト更新（共通アドバイザー使用）
    const trend = window.DATA_ANALYTICS.analyzeRatingTrend(sleeps, 'quality', 5, 14);
    const avgQuality = sleeps.filter(s => s.quality).reduce((sum, s) => sum + s.quality, 0) / sleeps.filter(s => s.quality).length;
    const advice = window.IMPROVEMENT_ADVISOR.getSleepAdvice(trend, avgQuality);
    
    document.getElementById('sleepAnalysisText').innerHTML = `
        <strong>傾向分析:</strong> ${trend.message}<br>
        <strong>平均睡眠質:</strong> ${avgQuality.toFixed(1)}/5<br>
        <strong>改善アドバイス:</strong> ${advice}
    `;
}

// データコピー機能（必須機能のため保持）
window.copyDashboardData = function() {
    const summaryData = `
統合ダッシュボード サマリー
生成日時: ${new Date().toLocaleString()}

【体重管理】
・総記録数: ${document.getElementById('weightDataCount')?.textContent || '--'}件
・最新体重: ${document.getElementById('latestWeight')?.textContent || '--'}kg
・前回差: ${document.getElementById('weightDiff')?.textContent || '--'}kg
・月間変化: ${document.getElementById('monthlyChange')?.textContent || '--'}kg
・${document.getElementById('weightTrend')?.textContent || '傾向: --'}

【睡眠管理】
・総記録数: ${document.getElementById('sleepDataCount')?.textContent || '--'}件
・平均睡眠時間: ${document.getElementById('avgSleepTime')?.textContent || '--'}時間
・平均睡眠質: ${document.getElementById('avgSleepQuality')?.textContent || '--'}/5
・今月記録数: ${document.getElementById('sleepRecords')?.textContent || '--'}回
・${document.getElementById('sleepTrend')?.textContent || '傾向: --'}

【部屋片付け】
・総記録数: ${document.getElementById('roomDataCount')?.textContent || '--'}件
・完了タスク: ${document.getElementById('completedTasks')?.textContent || '--'}/${document.getElementById('totalTasks')?.textContent || '--'}
・完了率: ${document.getElementById('completionRate')?.textContent || '--'}%
・今月活動: ${document.getElementById('monthlyActivity')?.textContent || '--'}回
・${document.getElementById('roomTrend')?.textContent || '傾向: --'}

【メモリスト】
・総記録数: ${document.getElementById('memoDataCount')?.textContent || '--'}件
・総メモ数: ${document.getElementById('totalMemos')?.textContent || '--'}
・重要メモ: ${document.getElementById('importantMemos')?.textContent || '--'}
・今月追加: ${document.getElementById('monthlyMemos')?.textContent || '--'}
・${document.getElementById('memoTrend')?.textContent || '傾向: --'}

【総合評価】
${document.getElementById('improvementScore')?.textContent || '改善スコア: --'}
    `;
    
    navigator.clipboard.writeText(summaryData).then(() => {
        log('📋 ダッシュボードデータをクリップボードにコピーしました');
    });
};

// 詳細データエクスポート（必須機能のため保持）
window.exportTrendData = function() {
    const exportData = {
        exportDate: new Date().toISOString(),
        weight: dashboardData.weight,
        sleep: dashboardData.sleep,
        room: dashboardData.room,
        memo: dashboardData.memo
    };
    
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    log('📊 詳細データをJSONファイルとしてエクスポートしました');
};

log('✅ ダッシュボードJavaScript読み込み完了（共通コンポーネント版）');