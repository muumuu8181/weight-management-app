// 万歩計管理機能のJavaScript
// 共通基盤を活用した実装

// 万歩計関連のグローバル変数
let selectedExerciseTypeValue = '';
let allPedometerData = [];

// 目標歩数（カスタマイズ可能）
const DAILY_STEP_GOAL = 10000;

// 万歩計管理初期化
function initializePedometerManagement() {
    // 現在の日付を設定
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const dateInput = document.getElementById('pedometerDateInput');
    if (dateInput) dateInput.value = todayString;
    
    // 現在時刻を設定
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    const timeInput = document.getElementById('pedometerTimeInput');
    if (timeInput) timeInput.value = timeString;
    
    // 運動種別ボタンの初期状態設定
    document.querySelectorAll('.exercise-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.opacity = '0.7';
    });
    
    // 必須・オプション項目の表示設定
    if (typeof window.markRequiredFields === 'function') {
        const pedometerFieldConfig = {
            required: ['pedometerDateInput', 'stepsInput', 'selectedExerciseType'],
            optional: ['pedometerTimeInput', 'distanceInput', 'caloriesInput', 'pedometerMemoInput']
        };
        window.markRequiredFields(pedometerFieldConfig);
    }
    
    log('🚶 万歩計管理初期化完了');
    
    // データを読み込み
    if (currentUser) {
        loadPedometerData();
    }
}

// 運動種別選択
window.selectExerciseType = (type) => {
    selectedExerciseTypeValue = type;
    document.getElementById('selectedExerciseType').value = type;
    
    // すべてのボタンから選択状態を削除
    document.querySelectorAll('.exercise-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.opacity = '0.7';
    });
    
    // 選択されたボタンに選択状態を追加
    const selectedBtn = document.querySelector(`[data-type="${type}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        selectedBtn.style.opacity = '1';
    }
    
    log(`🏃 運動種別選択: ${type}`);
};

// 万歩計データ保存
window.savePedometerData = async () => {
    if (!currentUser) {
        log('❌ ログインが必要です');
        return;
    }
    
    try {
        const pedometerData = {
            date: document.getElementById('pedometerDateInput').value,
            time: document.getElementById('pedometerTimeInput').value,
            steps: parseInt(document.getElementById('stepsInput').value) || 0,
            distance: parseFloat(document.getElementById('distanceInput').value) || 0,
            calories: parseInt(document.getElementById('caloriesInput').value) || 0,
            exerciseType: selectedExerciseTypeValue || '',
            memo: document.getElementById('pedometerMemoInput').value || '',
            timestamp: new Date().toISOString(),
            userEmail: currentUser.email
        };
        
        // 必須項目検証（共通関数使用）
        const pedometerFieldConfig = {
            required: ['pedometerDateInput', 'stepsInput', 'selectedExerciseType'],
            optional: ['pedometerTimeInput', 'distanceInput', 'caloriesInput', 'pedometerMemoInput']
        };
        
        if (typeof window.validateRequiredFields === 'function') {
            if (!window.validateRequiredFields(pedometerFieldConfig)) {
                return;
            }
        }
        
        // 追加検証（歩数の数値チェック）
        if (pedometerData.steps <= 0) {
            log('❌ 歩数は1以上の値を入力してください');
            return;
        }
        
        // Firebaseに保存
        const userRef = firebase.database().ref(`users/${currentUser.uid}/pedometerData`);
        await userRef.push(pedometerData);
        
        log(`✅ 万歩計データ保存完了: ${pedometerData.date} - ${pedometerData.steps}歩 (${pedometerData.exerciseType})`);
        
        // Smart Effects統合
        const saveButton = document.querySelector('.save-button');
        if (window.smartEffects && saveButton) {
            let actionName = 'record';
            if (pedometerData.steps >= 15000) actionName = 'excellent_walk';
            else if (pedometerData.steps >= DAILY_STEP_GOAL) actionName = 'goal_achieved';
            
            window.smartEffects.trigger('pedometer', actionName, saveButton);
            log('✨ 万歩計エフェクト実行完了');
        }
        
        // 入力フィールドをクリア
        document.getElementById('stepsInput').value = '';
        document.getElementById('distanceInput').value = '';
        document.getElementById('caloriesInput').value = '';
        document.getElementById('pedometerMemoInput').value = '';
        selectedExerciseTypeValue = '';
        
        // 運動種別ボタンをリセット
        document.querySelectorAll('.exercise-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.style.opacity = '0.7';
        });
        
        // データを再読み込み
        loadPedometerData();
        updatePedometerStats();
        
    } catch (error) {
        log(`❌ 万歩計データ保存エラー: ${error.message}`);
    }
};

// 万歩計データ読み込み
window.loadPedometerData = async () => {
    if (!currentUser) return;
    
    try {
        const userRef = firebase.database().ref(`users/${currentUser.uid}/pedometerData`);
        const snapshot = await userRef.once('value');
        
        const historyArea = document.getElementById('pedometerHistoryArea');
        if (!historyArea) return;
        
        if (!snapshot.exists()) {
            historyArea.innerHTML = '<p style="text-align: center; color: #666;">記録がありません</p>';
            allPedometerData = [];
            updatePedometerStats();
            return;
        }
        
        const data = snapshot.val();
        const entries = Object.entries(data).reverse(); // 新しい順
        allPedometerData = entries.map(([key, entry]) => ({ ...entry, key }));
        
        let html = '';
        entries.forEach(([key, entry]) => {
            const distance = entry.distance ? `${entry.distance}km` : '';
            const calories = entry.calories ? `${entry.calories}kcal` : '';
            const additionalInfo = [distance, calories].filter(Boolean).join(' / ');
            
            html += `
                <div style="border: 1px solid #ddd; padding: 15px; margin: 8px 0; border-radius: 8px; background: white;">
                    <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 8px;">
                        <strong style="color: #007bff;">📅 ${entry.date} ${entry.time || ''}</strong>
                        <button onclick="deletePedometerEntry('${key}')" 
                                style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; float: right;">削除</button>
                    </div>
                    <div style="margin-bottom: 5px;">
                        <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 14px; margin-right: 8px;">
                            👟 ${entry.steps.toLocaleString()}歩
                        </span>
                        ${entry.exerciseType ? `<span style="background: #007bff; color: white; padding: 4px 8px; border-radius: 12px; font-size: 14px; margin-right: 8px;">🏃 ${entry.exerciseType}</span>` : ''}
                    </div>
                    ${additionalInfo ? `<div style="color: #666; font-size: 14px; margin-bottom: 5px;">${additionalInfo}</div>` : ''}
                    ${entry.memo ? `<div style="background: #f8f9fa; padding: 8px; border-radius: 4px; color: #555; font-size: 14px;">📝 ${entry.memo}</div>` : ''}
                </div>
            `;
        });
        
        historyArea.innerHTML = html;
        updatePedometerStats();
        
    } catch (error) {
        log(`❌ 万歩計データ読み込みエラー: ${error.message}`);
    }
};

// 万歩計記録削除
window.deletePedometerEntry = async (entryKey) => {
    if (!currentUser) return;
    
    if (!confirm('この記録を削除しますか？')) return;
    
    try {
        const entryRef = firebase.database().ref(`users/${currentUser.uid}/pedometerData/${entryKey}`);
        await entryRef.remove();
        
        log('🗑️ 万歩計記録を削除しました');
        loadPedometerData();
        
    } catch (error) {
        log(`❌ 万歩計記録削除エラー: ${error.message}`);
    }
};

// 統計情報更新
function updatePedometerStats() {
    if (!allPedometerData || allPedometerData.length === 0) {
        document.getElementById('todaySteps').textContent = '0歩';
        document.getElementById('weeklyAverage').textContent = '0歩';
        document.getElementById('monthlyTotal').textContent = '0歩';
        document.getElementById('goalAchievement').textContent = '0%';
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // 今日の歩数
    const todayData = allPedometerData.filter(entry => entry.date === today);
    const todaySteps = todayData.reduce((sum, entry) => sum + (entry.steps || 0), 0);
    
    // 週間平均
    const weekData = allPedometerData.filter(entry => entry.date >= oneWeekAgo);
    const weeklyAverage = weekData.length > 0 ? Math.round(weekData.reduce((sum, entry) => sum + (entry.steps || 0), 0) / 7) : 0;
    
    // 月間合計
    const monthData = allPedometerData.filter(entry => entry.date >= oneMonthAgo);
    const monthlyTotal = monthData.reduce((sum, entry) => sum + (entry.steps || 0), 0);
    
    // 目標達成率
    const goalAchievement = Math.round((todaySteps / DAILY_STEP_GOAL) * 100);
    
    // 表示更新
    document.getElementById('todaySteps').textContent = `${todaySteps.toLocaleString()}歩`;
    document.getElementById('weeklyAverage').textContent = `${weeklyAverage.toLocaleString()}歩`;
    document.getElementById('monthlyTotal').textContent = `${monthlyTotal.toLocaleString()}歩`;
    document.getElementById('goalAchievement').textContent = `${goalAchievement}%`;
    
    // 目標達成時の色変更
    const goalElement = document.getElementById('goalAchievement');
    if (goalAchievement >= 100) {
        goalElement.style.color = '#28a745';
    } else if (goalAchievement >= 80) {
        goalElement.style.color = '#ffc107';
    } else {
        goalElement.style.color = '#007bff';
    }
}