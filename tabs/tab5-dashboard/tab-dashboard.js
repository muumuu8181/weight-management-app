// 統合ダッシュボード - 全タブデータ集計・傾向分析システム

// ダッシュボード状態管理
let dashboardData = {
    weight: [],
    sleep: [],
    room: [],
    memo: []
};

let currentDashboardView = 'overview';
let dashboardCharts = {};

// ダッシュボード初期化
window.initDashboard = function() {
    log('🔄 ダッシュボード初期化開始');
    
    if (!currentUser) {
        log('❌ ログインが必要です - ダッシュボード初期化をスキップ');
        return;
    }
    
    log(`👤 ユーザー: ${currentUser.displayName} (${currentUser.uid})`);
    
    // 初期ビュー設定
    switchDashboardView('overview');
    
    // Firebase接続確認
    if (typeof database === 'undefined') {
        log('❌ Firebase database未初期化');
        return;
    }
    
    // 全データの読み込み（詳細ログ出力）
    log('🔍 Firebase データ読み込み開始...');
    refreshDashboardData();
    
    log('✅ ダッシュボード初期化完了');
};

// ダッシュボードビュー切り替え
window.switchDashboardView = function(viewType) {
    currentDashboardView = viewType;
    
    // 全ビューを非表示
    document.querySelectorAll('.dashboard-view').forEach(view => {
        view.classList.add('hidden');
    });
    
    // ボタン状態をリセット
    document.querySelectorAll('.dashboard-tab-switcher button').forEach(btn => {
        btn.style.background = '#f8f9fa';
        btn.style.color = '#495057';
    });
    
    // 選択されたビューとボタンをアクティブに
    const targetView = document.getElementById(viewType + 'View');
    const targetBtn = document.getElementById('dash' + viewType.charAt(0).toUpperCase() + viewType.slice(1) + 'Btn');
    
    if (targetView) {
        targetView.classList.remove('hidden');
    }
    
    if (targetBtn) {
        targetBtn.style.background = '#007bff';
        targetBtn.style.color = 'white';
    }
    
    // ビューごとの特別処理
    if (viewType === 'weight' && dashboardData.weight.length > 0) {
        createWeightTrendChart();
    } else if (viewType === 'sleep' && dashboardData.sleep.length > 0) {
        createSleepTrendChart();
    }
    
    log(`📑 ダッシュボードビュー切り替え: ${viewType}`);
};

// 全データ更新
window.refreshDashboardData = async function() {
    log('🔄 ダッシュボードデータ更新開始');
    
    if (!currentUser) {
        log('❌ ユーザー未ログイン - データ更新不可');
        return;
    }
    
    try {
        // 並行してすべてのデータを取得
        await Promise.all([
            loadWeightData(),
            loadSleepData(),
            loadRoomData(),
            loadMemoData()
        ]);
        
        // サマリー更新
        updateAllSummaries();
        
        // 改善分析実行
        analyzeOverallProgress();
        
        log('✅ ダッシュボードデータ更新完了');
        
    } catch (error) {
        log(`❌ データ更新エラー: ${error.message}`);
    }
};

// 体重データ読み込み
async function loadWeightData() {
    return new Promise((resolve) => {
        // 体重データは複数のデータパスを確認
        const weightDataPaths = [
            '/users/' + currentUser.uid + '/weightData/',
            '/users/' + currentUser.uid + '/weights/',
            '/users/' + currentUser.uid + '/weightRecords/',
            '/users/' + currentUser.uid + '/bodyWeight/'
        ];
        
        let totalWeightData = [];
        let pathChecked = 0;
        
        log('🔍 体重データパス確認開始...');
        
        weightDataPaths.forEach((path, index) => {
            log(`🔍 体重データパス確認[${index + 1}/4]: ${path}`);
            
            database.ref(path).once('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const dataArray = Object.values(data);
                    totalWeightData = totalWeightData.concat(dataArray);
                    log(`📊 体重データ発見(${path}): ${dataArray.length}件`);
                    
                    // デバッグ用：最初の1件のデータ構造確認
                    if (dataArray.length > 0) {
                        log(`📊 体重データサンプル: ${JSON.stringify(dataArray[0])}`);
                    }
                } else {
                    log(`📊 体重データなし(${path}): データなし`);
                }
                
                pathChecked++;
                if (pathChecked === weightDataPaths.length) {
                    // 日付順にソート
                    dashboardData.weight = totalWeightData.sort((a, b) => 
                        new Date(a.date + ' ' + (a.time || '00:00')) - new Date(b.date + ' ' + (b.time || '00:00'))
                    );
                    
                    log(`📊 体重データ統合完了: ${totalWeightData.length}件`);
                    if (totalWeightData.length === 0) {
                        log('⚠️ 体重データが全く見つかりませんでした - Firebaseパス確認が必要です');
                    }
                    resolve();
                }
            }).catch((error) => {
                log(`❌ 体重データ読み込みエラー(${path}): ${error.message}`);
                pathChecked++;
                if (pathChecked === weightDataPaths.length) {
                    dashboardData.weight = totalWeightData;
                    resolve();
                }
            });
        });
    });
}

// 睡眠データ読み込み
async function loadSleepData() {
    return new Promise((resolve) => {
        const sleepRef = database.ref('/users/' + currentUser.uid + '/sleepData/');
        
        sleepRef.once('value', (snapshot) => {
            const data = snapshot.val();
            dashboardData.sleep = data ? Object.values(data).sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            ) : [];
            
            log(`🛏️ 睡眠データ読み込み: ${dashboardData.sleep.length}件`);
            resolve();
        });
    });
}

// 部屋片付けデータ読み込み
async function loadRoomData() {
    return new Promise((resolve) => {
        // 部屋片付けデータは複数のデータパスを確認
        const roomDataPaths = [
            '/users/' + currentUser.uid + '/roomData/',
            '/users/' + currentUser.uid + '/roomManagement/',
            '/users/' + currentUser.uid + '/cleaningTasks/'
        ];
        
        let totalRoomData = [];
        let pathChecked = 0;
        
        roomDataPaths.forEach((path, index) => {
            database.ref(path).once('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const dataArray = Object.values(data);
                    totalRoomData = totalRoomData.concat(dataArray);
                    log(`🏠 部屋片付けデータ(${path}): ${dataArray.length}件`);
                }
                
                pathChecked++;
                if (pathChecked === roomDataPaths.length) {
                    dashboardData.room = totalRoomData;
                    log(`🏠 部屋片付けデータ統合: ${totalRoomData.length}件`);
                    resolve();
                }
            });
        });
    });
}

// メモデータ読み込み
async function loadMemoData() {
    return new Promise((resolve) => {
        // メモデータは複数のデータパスを確認（タブ8とJOB_DC両方対応）
        const memoDataPaths = [
            '/users/' + currentUser.uid + '/memoData/',
            '/users/' + currentUser.uid + '/memos/',
            '/users/' + currentUser.uid + '/taskData/',
            '/users/' + currentUser.uid + '/jobdcData/'
        ];
        
        let totalMemoData = [];
        let pathChecked = 0;
        
        memoDataPaths.forEach((path, index) => {
            database.ref(path).once('value', (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const dataArray = Object.values(data);
                    totalMemoData = totalMemoData.concat(dataArray);
                    log(`📝 メモデータ(${path}): ${dataArray.length}件`);
                }
                
                pathChecked++;
                if (pathChecked === memoDataPaths.length) {
                    dashboardData.memo = totalMemoData;
                    log(`📝 メモデータ統合: ${totalMemoData.length}件`);
                    resolve();
                }
            });
        });
    });
}

// 全サマリー更新
function updateAllSummaries() {
    updateWeightSummary();
    updateSleepSummary();
    updateRoomSummary();
    updateMemoSummary();
}

// 体重サマリー更新
function updateWeightSummary() {
    const weights = dashboardData.weight;
    
    // 総記録数表示
    document.getElementById('weightDataCount').textContent = weights.length;
    
    if (weights.length === 0) {
        document.getElementById('latestWeight').textContent = '--';
        document.getElementById('weightDiff').textContent = '--';
        document.getElementById('monthlyChange').textContent = '--';
        document.getElementById('weightTrend').textContent = '傾向: データなし';
        return;
    }
    
    // 最新体重
    const latest = weights[weights.length - 1];
    document.getElementById('latestWeight').textContent = latest.weight;
    
    // 前回差
    if (weights.length > 1) {
        const previous = weights[weights.length - 2];
        const diff = (latest.weight - previous.weight).toFixed(1);
        document.getElementById('weightDiff').textContent = diff >= 0 ? `+${diff}` : diff;
    } else {
        document.getElementById('weightDiff').textContent = '--';
    }
    
    // 月間変化
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const monthlyWeights = weights.filter(w => new Date(w.date) >= oneMonthAgo);
    
    if (monthlyWeights.length > 1) {
        const monthlyChange = (monthlyWeights[monthlyWeights.length - 1].weight - monthlyWeights[0].weight).toFixed(1);
        document.getElementById('monthlyChange').textContent = monthlyChange >= 0 ? `+${monthlyChange}` : monthlyChange;
    } else {
        document.getElementById('monthlyChange').textContent = '--';
    }
    
    // 傾向分析
    const trend = analyzeWeightTrend(weights);
    const trendElement = document.getElementById('weightTrend');
    trendElement.textContent = `傾向: ${trend.message}`;
    trendElement.className = `trend-indicator ${trend.class}`;
}

// 睡眠サマリー更新
function updateSleepSummary() {
    const sleeps = dashboardData.sleep;
    
    // 総記録数表示
    document.getElementById('sleepDataCount').textContent = sleeps.length;
    
    if (sleeps.length === 0) {
        document.getElementById('avgSleepTime').textContent = '--';
        document.getElementById('avgSleepQuality').textContent = '--';
        document.getElementById('sleepRecords').textContent = '--';
        document.getElementById('sleepTrend').textContent = '傾向: データなし';
        return;
    }
    
    // 平均睡眠時間計算
    let totalHours = 0;
    let validRecords = 0;
    
    sleeps.forEach(sleep => {
        if (sleep.bedtime && sleep.wakeupTime) {
            const sleepDuration = calculateSleepDuration(sleep.bedtime, sleep.wakeupTime);
            if (sleepDuration > 0) {
                totalHours += sleepDuration;
                validRecords++;
            }
        }
    });
    
    if (validRecords > 0) {
        document.getElementById('avgSleepTime').textContent = (totalHours / validRecords).toFixed(1);
    } else {
        document.getElementById('avgSleepTime').textContent = '--';
    }
    
    // 平均睡眠質
    const qualityRecords = sleeps.filter(s => s.quality);
    if (qualityRecords.length > 0) {
        const avgQuality = qualityRecords.reduce((sum, s) => sum + s.quality, 0) / qualityRecords.length;
        document.getElementById('avgSleepQuality').textContent = avgQuality.toFixed(1);
    } else {
        document.getElementById('avgSleepQuality').textContent = '--';
    }
    
    // 今月の記録数
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyRecords = sleeps.filter(s => new Date(s.date) >= thisMonth);
    document.getElementById('sleepRecords').textContent = monthlyRecords.length;
    
    // 傾向分析
    const trend = analyzeSleepTrend(sleeps);
    const trendElement = document.getElementById('sleepTrend');
    trendElement.textContent = `傾向: ${trend.message}`;
    trendElement.className = `trend-indicator ${trend.class}`;
}

// 部屋片付けサマリー更新
function updateRoomSummary() {
    const rooms = dashboardData.room;
    
    // 総記録数表示
    document.getElementById('roomDataCount').textContent = rooms.length;
    
    if (rooms.length === 0) {
        document.getElementById('completedTasks').textContent = '--';
        document.getElementById('totalTasks').textContent = '--';
        document.getElementById('completionRate').textContent = '--';
        document.getElementById('monthlyActivity').textContent = '--';
        document.getElementById('roomTrend').textContent = '傾向: データなし';
        return;
    }
    
    // タスク完了統計
    const completedTasks = rooms.filter(r => r.completed || r.status === 'completed').length;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('totalTasks').textContent = rooms.length;
    
    const completionRate = rooms.length > 0 ? (completedTasks / rooms.length * 100).toFixed(0) : 0;
    document.getElementById('completionRate').textContent = completionRate;
    
    // 今月の活動
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyActivity = rooms.filter(r => {
        const recordDate = new Date(r.date || r.timestamp);
        return recordDate >= thisMonth;
    }).length;
    document.getElementById('monthlyActivity').textContent = monthlyActivity;
    
    // 傾向分析
    const trend = analyzeRoomTrend(rooms);
    const trendElement = document.getElementById('roomTrend');
    trendElement.textContent = `傾向: ${trend.message}`;
    trendElement.className = `trend-indicator ${trend.class}`;
}

// メモサマリー更新
function updateMemoSummary() {
    const memos = dashboardData.memo;
    
    // 総記録数表示（メモの場合は総記録数と総メモ数は同じ）
    document.getElementById('memoDataCount').textContent = memos.length;
    
    if (memos.length === 0) {
        document.getElementById('totalMemos').textContent = '--';
        document.getElementById('importantMemos').textContent = '--';
        document.getElementById('monthlyMemos').textContent = '--';
        document.getElementById('memoTrend').textContent = '傾向: データなし';
        return;
    }
    
    // 総メモ数
    document.getElementById('totalMemos').textContent = memos.length;
    
    // 重要メモ数
    const importantMemos = memos.filter(m => 
        m.priority === '高' || m.priority === '緊急' || m.category === '重要'
    ).length;
    document.getElementById('importantMemos').textContent = importantMemos;
    
    // 今月追加分
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyMemos = memos.filter(m => {
        const memoDate = new Date(m.date || m.timestamp);
        return memoDate >= thisMonth;
    }).length;
    document.getElementById('monthlyMemos').textContent = monthlyMemos;
    
    // 傾向分析
    const trend = analyzeMemoTrend(memos);
    const trendElement = document.getElementById('memoTrend');
    trendElement.textContent = `傾向: ${trend.message}`;
    trendElement.className = `trend-indicator ${trend.class}`;
}

// 体重傾向分析
function analyzeWeightTrend(weights) {
    if (weights.length < 2) {
        return { message: 'データ不足', class: 'trend-stable' };
    }
    
    // 最近2ヶ月のデータで傾向分析
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const recentWeights = weights.filter(w => new Date(w.date) >= twoMonthsAgo);
    
    if (recentWeights.length < 2) {
        return { message: '傾向分析中', class: 'trend-stable' };
    }
    
    const firstWeight = recentWeights[0].weight;
    const lastWeight = recentWeights[recentWeights.length - 1].weight;
    const change = lastWeight - firstWeight;
    
    if (Math.abs(change) < 0.5) {
        return { message: '安定維持', class: 'trend-stable' };
    } else if (change < -1.0) {
        return { message: '順調に減量', class: 'trend-up' };
    } else if (change < -0.5) {
        return { message: '緩やかに減量', class: 'trend-up' };
    } else if (change > 1.0) {
        return { message: '要注意（増加）', class: 'trend-down' };
    } else {
        return { message: '微増傾向', class: 'trend-down' };
    }
}

// 睡眠傾向分析
function analyzeSleepTrend(sleeps) {
    if (sleeps.length < 7) {
        return { message: 'データ不足', class: 'trend-stable' };
    }
    
    // 最近2週間の睡眠質平均
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const recentSleeps = sleeps.filter(s => new Date(s.date) >= twoWeeksAgo && s.quality);
    
    if (recentSleeps.length < 3) {
        return { message: '分析中', class: 'trend-stable' };
    }
    
    const avgQuality = recentSleeps.reduce((sum, s) => sum + s.quality, 0) / recentSleeps.length;
    
    if (avgQuality >= 4.0) {
        return { message: '良質な睡眠', class: 'trend-up' };
    } else if (avgQuality >= 3.0) {
        return { message: '普通', class: 'trend-stable' };
    } else {
        return { message: '改善必要', class: 'trend-down' };
    }
}

// 部屋片付け傾向分析
function analyzeRoomTrend(rooms) {
    if (rooms.length === 0) {
        return { message: 'データなし', class: 'trend-stable' };
    }
    
    const completionRate = rooms.filter(r => r.completed || r.status === 'completed').length / rooms.length;
    
    if (completionRate >= 0.8) {
        return { message: '非常に良い', class: 'trend-up' };
    } else if (completionRate >= 0.5) {
        return { message: '順調', class: 'trend-up' };
    } else if (completionRate >= 0.3) {
        return { message: '改善必要', class: 'trend-stable' };
    } else {
        return { message: '要努力', class: 'trend-down' };
    }
}

// メモ傾向分析
function analyzeMemoTrend(memos) {
    if (memos.length === 0) {
        return { message: 'データなし', class: 'trend-stable' };
    }
    
    // 今月と先月の比較
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    
    const thisMonthMemos = memos.filter(m => new Date(m.date || m.timestamp) >= thisMonth).length;
    const lastMonthMemos = memos.filter(m => {
        const memoDate = new Date(m.date || m.timestamp);
        return memoDate >= lastMonth && memoDate < thisMonth;
    }).length;
    
    if (thisMonthMemos > lastMonthMemos) {
        return { message: 'アクティブ増加', class: 'trend-up' };
    } else if (thisMonthMemos === lastMonthMemos) {
        return { message: '安定', class: 'trend-stable' };
    } else {
        return { message: '活動減少', class: 'trend-down' };
    }
}

// 総合改善分析
function analyzeOverallProgress() {
    let totalScore = 0;
    let categories = 0;
    const improvements = [];
    
    // 体重改善スコア
    if (dashboardData.weight.length > 0) {
        const weightTrend = analyzeWeightTrend(dashboardData.weight);
        let weightScore = 50; // ベーススコア
        
        if (weightTrend.class === 'trend-up') weightScore = 80;
        else if (weightTrend.class === 'trend-down') weightScore = 20;
        
        totalScore += weightScore;
        categories++;
        improvements.push(`体重管理: ${weightTrend.message} (${weightScore}点)`);
    }
    
    // 睡眠改善スコア
    if (dashboardData.sleep.length > 0) {
        const sleepTrend = analyzeSleepTrend(dashboardData.sleep);
        let sleepScore = 50;
        
        if (sleepTrend.class === 'trend-up') sleepScore = 80;
        else if (sleepTrend.class === 'trend-down') sleepScore = 20;
        
        totalScore += sleepScore;
        categories++;
        improvements.push(`睡眠管理: ${sleepTrend.message} (${sleepScore}点)`);
    }
    
    // 部屋片付け改善スコア
    if (dashboardData.room.length > 0) {
        const roomTrend = analyzeRoomTrend(dashboardData.room);
        let roomScore = 50;
        
        if (roomTrend.class === 'trend-up') roomScore = 80;
        else if (roomTrend.class === 'trend-down') roomScore = 20;
        
        totalScore += roomScore;
        categories++;
        improvements.push(`片付け: ${roomTrend.message} (${roomScore}点)`);
    }
    
    const averageScore = categories > 0 ? Math.round(totalScore / categories) : 0;
    
    // UI更新
    const scoreElement = document.getElementById('improvementScore');
    const detailsElement = document.getElementById('improvementDetails');
    
    let scoreColor = '#6c757d';
    let scoreMessage = '分析中';
    
    if (averageScore >= 70) {
        scoreColor = '#28a745';
        scoreMessage = '非常に良好！';
    } else if (averageScore >= 50) {
        scoreColor = '#ffc107';
        scoreMessage = '順調です';
    } else if (averageScore >= 30) {
        scoreColor = '#fd7e14';
        scoreMessage = '改善の余地あり';
    } else {
        scoreColor = '#dc3545';
        scoreMessage = 'より一層の努力を';
    }
    
    scoreElement.innerHTML = `改善スコア: <span style="color: ${scoreColor}">${averageScore}/100点</span> - ${scoreMessage}`;
    detailsElement.innerHTML = improvements.map(imp => `• ${imp}`).join('<br>');
    
    log(`📊 総合改善スコア: ${averageScore}点`);
}

// 睡眠時間計算
function calculateSleepDuration(bedtime, wakeupTime) {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeupTime.split(':').map(Number);
    
    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;
    
    // 翌日の場合
    if (wakeMinutes <= bedMinutes) {
        wakeMinutes += 24 * 60;
    }
    
    return (wakeMinutes - bedMinutes) / 60;
}

// 体重傾向チャート作成
function createWeightTrendChart() {
    const canvas = document.getElementById('weightTrendChart');
    if (!canvas || dashboardData.weight.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    
    // 既存チャートを破棄
    if (dashboardCharts.weight) {
        dashboardCharts.weight.destroy();
    }
    
    const weights = dashboardData.weight.slice(-30); // 最近30件
    
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
                y: {
                    beginAtZero: false
                }
            }
        }
    });
    
    // 分析テキスト更新
    const trend = analyzeWeightTrend(weights);
    document.getElementById('weightAnalysisText').innerHTML = `
        <strong>傾向分析:</strong> ${trend.message}<br>
        <strong>データ期間:</strong> 最近${weights.length}件の記録<br>
        <strong>改善アドバイス:</strong> ${getWeightAdvice(trend)}
    `;
}

// 睡眠傾向チャート作成
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
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
}

// 体重改善アドバイス
function getWeightAdvice(trend) {
    switch(trend.class) {
        case 'trend-up':
            return '素晴らしい進歩です！この調子で継続しましょう。';
        case 'trend-down':
            return '食事や運動習慣を見直してみましょう。';
        default:
            return '現状維持できています。長期的な目標を設定してみましょう。';
    }
}

// データコピー機能
window.copyDashboardData = function() {
    const summaryData = `
統合ダッシュボード サマリー
生成日時: ${new Date().toLocaleString()}

【体重管理】
・総記録数: ${document.getElementById('weightDataCount').textContent}件
・最新体重: ${document.getElementById('latestWeight').textContent}kg
・前回差: ${document.getElementById('weightDiff').textContent}kg
・月間変化: ${document.getElementById('monthlyChange').textContent}kg
・${document.getElementById('weightTrend').textContent}

【睡眠管理】
・総記録数: ${document.getElementById('sleepDataCount').textContent}件
・平均睡眠時間: ${document.getElementById('avgSleepTime').textContent}時間
・平均睡眠質: ${document.getElementById('avgSleepQuality').textContent}/5
・今月記録数: ${document.getElementById('sleepRecords').textContent}回
・${document.getElementById('sleepTrend').textContent}

【部屋片付け】
・総記録数: ${document.getElementById('roomDataCount').textContent}件
・完了タスク: ${document.getElementById('completedTasks').textContent}/${document.getElementById('totalTasks').textContent}
・完了率: ${document.getElementById('completionRate').textContent}%
・今月活動: ${document.getElementById('monthlyActivity').textContent}回
・${document.getElementById('roomTrend').textContent}

【メモリスト】
・総記録数: ${document.getElementById('memoDataCount').textContent}件
・総メモ数: ${document.getElementById('totalMemos').textContent}
・重要メモ: ${document.getElementById('importantMemos').textContent}
・今月追加: ${document.getElementById('monthlyMemos').textContent}
・${document.getElementById('memoTrend').textContent}

【総合評価】
${document.getElementById('improvementScore').textContent}
    `;
    
    navigator.clipboard.writeText(summaryData).then(() => {
        log('📋 ダッシュボードデータをクリップボードにコピーしました');
    });
};

// 詳細データエクスポート
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

log('✅ ダッシュボードJavaScript読み込み完了');