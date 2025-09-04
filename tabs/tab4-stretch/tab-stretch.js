// タブ4: ストレッチ管理JavaScript

// ストレッチ管理用変数
if (typeof window.allStretchData === 'undefined') {
    window.allStretchData = [];
}
let allStretchData = window.allStretchData;
let selectedStretchType = '';
let selectedIntensity = '';
let selectedBodyParts = [];
let stretchStartTime = null;
let stretchEndTime = null;
let stretchTimerInterval = null;

// ストレッチ管理初期化
function initializeStretchManager() {
    // 今日の日付を設定
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    document.getElementById('stretchDateInput').value = todayString;
    
    // 現在時刻を設定
    const currentTime = today.toTimeString().slice(0, 5);
    document.getElementById('stretchTimeInput').value = currentTime;
    
    // 必須・オプション項目の表示設定
    if (typeof window.markRequiredFields === 'function') {
        const stretchFieldConfig = {
            required: ['stretchDateInput', 'selectedStretchType'],
            optional: ['stretchTimeInput', 'selectedIntensity', 'selectedBodyParts', 'stretchMemoInput']
        };
        window.markRequiredFields(stretchFieldConfig);
    }
    
    log('🧘 ストレッチ管理システム初期化完了');
}

// ストレッチタイプ選択
function selectStretchType(type) {
    selectedStretchType = type;
    document.getElementById('selectedStretchType').value = type;
    
    // 全ボタンをリセット
    document.querySelectorAll('.stretch-type-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 選択されたボタンを強調
    const selectedBtn = document.querySelector(`[data-type="${type}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.1)';
    }
    
    log(`🧘 ストレッチタイプ選択: ${type}`);
}

// 強度選択
function selectIntensity(intensity) {
    selectedIntensity = intensity;
    document.getElementById('selectedIntensity').value = intensity;
    
    // 全ボタンをリセット
    document.querySelectorAll('.intensity-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 選択されたボタンを強調
    const selectedBtn = document.querySelector(`[data-intensity="${intensity}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.1)';
    }
    
    log(`💪 強度選択: ${intensity}`);
}

// 部位選択トグル
function toggleBodyPart(part) {
    const index = selectedBodyParts.indexOf(part);
    const btn = document.querySelector(`[data-part="${part}"]`);
    
    if (index === -1) {
        // 追加
        selectedBodyParts.push(part);
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1.1)';
        btn.style.background = '#007bff';
    } else {
        // 削除
        selectedBodyParts.splice(index, 1);
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
        btn.style.background = '#6c757d';
    }
    
    document.getElementById('selectedBodyParts').value = selectedBodyParts.join(',');
    log(`🎯 対象部位: ${selectedBodyParts.join(', ')}`);
}

// ストレッチ開始
function startStretching() {
    if (!selectedStretchType) {
        log('❌ ストレッチタイプを選択してください');
        return;
    }
    
    stretchStartTime = new Date();
    const timeString = stretchStartTime.toTimeString().slice(0, 5);
    
    // ボタン表示切り替え
    const startBtn = document.getElementById('startStretchBtn');
    const endBtn = document.getElementById('endStretchBtn');
    const timer = document.getElementById('stretchTimer');
    
    if (startBtn && endBtn && timer) {
        startBtn.style.display = 'none';
        endBtn.style.display = 'inline-block';
        timer.style.display = 'block';
    }
    
    // 時刻表示を開始時刻に更新
    document.getElementById('stretchTimeInput').value = timeString;
    
    // タイマー開始
    startStretchTimer();
    
    log(`▶️ ストレッチ開始: ${selectedStretchType} (${timeString})`);
}

// ストレッチ終了
function endStretching() {
    if (!stretchStartTime) {
        log('❌ ストレッチが開始されていません');
        return;
    }
    
    stretchEndTime = new Date();
    const duration = Math.round((stretchEndTime - stretchStartTime) / (1000 * 60)); // 分
    
    // タイマー停止
    if (stretchTimerInterval) {
        clearInterval(stretchTimerInterval);
        stretchTimerInterval = null;
    }
    
    // ボタン表示切り替え
    const startBtn = document.getElementById('startStretchBtn');
    const endBtn = document.getElementById('endStretchBtn');
    const timer = document.getElementById('stretchTimer');
    
    if (startBtn && endBtn && timer) {
        startBtn.style.display = 'inline-block';
        endBtn.style.display = 'none';
        timer.style.display = 'none';
    }
    
    log(`⏹️ ストレッチ終了: ${duration}分間`);
    
    // 自動的に継続時間を設定
    const durationInput = document.getElementById('stretchDuration');
    if (durationInput) {
        durationInput.value = duration;
    }
}

// ストレッチタイマー
function startStretchTimer() {
    const timer = document.getElementById('stretchTimer');
    stretchTimerInterval = setInterval(() => {
        if (stretchStartTime) {
            const elapsed = Math.floor((new Date() - stretchStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }, 1000);
}

// ストレッチデータ保存（エフェクト付き）
async function saveStretchData() {
    const saveButton = document.querySelector('button[onclick="saveStretchData()"]');
    const originalText = saveButton.innerHTML;
    const originalStyle = saveButton.style.cssText;
    
    try {
        // 保存開始エフェクト
        saveButton.innerHTML = '💾 保存中...';
        saveButton.style.background = '#ffc107';
        saveButton.style.transform = 'scale(0.95)';
        saveButton.disabled = true;
        
        const date = document.getElementById('stretchDateInput').value;
        const stretchType = selectedStretchType;
        const startTime = stretchStartTime ? stretchStartTime.toTimeString().slice(0, 5) : '';
        const duration = document.getElementById('stretchDuration') ? document.getElementById('stretchDuration').value : 
                        (stretchStartTime && stretchEndTime ? Math.round((stretchEndTime - stretchStartTime) / (1000 * 60)) : '');
        const intensity = selectedIntensity;
        const bodyParts = selectedBodyParts;
        const memo = document.getElementById('stretchMemoInput').value || null;
        
        if (!date || !stretchType || !duration || !intensity || bodyParts.length === 0) {
            throw new Error('すべての必須項目を入力してください');
        }
        
        if (!currentUser) {
            throw new Error('ログインが必要です');
        }
        
        // データ保存 - Firebase CRUD統一クラス使用
        await FirebaseCRUD.save('stretchData', currentUser.uid, {
            date: date,
            stretchType: stretchType,
            startTime: startTime,
            duration: parseInt(duration),
            intensity: parseInt(intensity),
            bodyParts: bodyParts,
            memo: memo,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        // 成功エフェクト
        saveButton.innerHTML = '✅ 保存完了!';
        saveButton.style.background = '#28a745';
        saveButton.style.transform = 'scale(1.05)';
        
        log(`💾 ストレッチデータ保存: ${stretchType} ${duration}分 (強度:${intensity}, 部位:${bodyParts.join(',')})`);
        
        // 🎯 スマートエフェクト実行
        if (window.smartEffects) {
            window.smartEffects.trigger('stretch', 'exercise_complete', saveButton);
            log('✨ ストレッチエフェクト実行完了');
        }
        
        // データ再読み込み
        loadUserStretchData(currentUser.uid);
        
        // フォームリセット
        resetStretchForm();
        
        // 1.5秒後に元に戻す
        setTimeout(() => {
            saveButton.innerHTML = originalText;
            saveButton.style.cssText = originalStyle;
            saveButton.disabled = false;
        }, 1500);
        
    } catch (error) {
        // エラーエフェクト
        saveButton.innerHTML = '❌ エラー';
        saveButton.style.background = '#dc3545';
        saveButton.style.transform = 'scale(0.95)';
        
        log(`❌ 保存エラー: ${error.message}`);
        console.error('保存エラー:', error);
        
        // 2秒後に元に戻す
        setTimeout(() => {
            saveButton.innerHTML = originalText;
            saveButton.style.cssText = originalStyle;
            saveButton.disabled = false;
        }, 2000);
    }
}

// フォームリセット
function resetStretchForm() {
    // 選択状態をリセット
    selectedStretchType = '';
    selectedIntensity = '';
    selectedBodyParts = [];
    stretchStartTime = null;
    stretchEndTime = null;
    
    // 入力フィールドをリセット  
    const durationInput = document.getElementById('stretchDuration');
    if (durationInput) durationInput.value = '';
    document.getElementById('stretchMemoInput').value = '';
    
    // ボタンの状態をリセット
    document.querySelectorAll('.stretch-type-btn, .intensity-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 部位ボタンをリセット
    document.querySelectorAll('.body-part-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
        btn.style.background = '#6c757d';
    });
    
    // タイマーをリセット
    if (stretchTimerInterval) {
        clearInterval(stretchTimerInterval);
        stretchTimerInterval = null;
    }
    
    // 現在時刻を再設定
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    document.getElementById('stretchTimeInput').value = currentTime;
}

// ストレッチデータ読み込み
function loadUserStretchData(userId) {
    // データ読み込み - Firebase CRUD統一クラス使用
    FirebaseCRUD.load('stretchData', userId, (snapshot) => {
        const historyDiv = document.getElementById('stretchHistoryArea');
        if (snapshot.exists()) {
            const data = snapshot.val();
            const entries = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).sort((a, b) => new Date(b.date) - new Date(a.date));

            allStretchData = entries;
            
            // 直近7件のみ表示
            const recentEntries = entries.slice(0, 7);
            
            historyDiv.innerHTML = recentEntries.map(entry => {
                const intensityEmojis = ['', '😌', '🙂', '😤', '😵'];
                let displayText = `${entry.date} ${entry.stretchType}`;
                displayText += ` ${entry.startTime} (${entry.duration}分)`;
                displayText += ` ${intensityEmojis[entry.intensity]}強度${entry.intensity}`;
                displayText += ` [${entry.bodyParts.join(',')}]`;
                if (entry.memo) displayText += ` - ${entry.memo}`;
                
                return `<div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 0; border-bottom: 1px solid #eee;"><span>${displayText}</span><button onclick="deleteStretchEntry('${entry.id}')" style="background: #dc3545; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px;">🗑️</button></div>`;
            }).join('');
            
            // 統計を更新
            updateStretchStats(entries);
            
            log(`📊 ストレッチデータ読み込み完了: ${entries.length}件`);
        } else {
            historyDiv.innerHTML = 'まだストレッチ記録がありません';
            allStretchData = [];
            updateStretchStats([]);
        }
    });
}

// ストレッチ統計更新
function updateStretchStats(entries) {
    const statsArea = document.getElementById('stretchStatsArea');
    if (!entries || entries.length === 0) {
        statsArea.innerHTML = statsArea.innerHTML.replace(/[0-9.]+/g, '--');
        return;
    }
    
    // 今週の回数
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = entries.filter(entry => new Date(entry.date) >= weekAgo).length;
    
    // 平均時間
    const avgDuration = Math.round(entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length);
    
    // 最頻部位
    const partCounts = {};
    entries.forEach(entry => {
        entry.bodyParts.forEach(part => {
            partCounts[part] = (partCounts[part] || 0) + 1;
        });
    });
    const mostFrequentPart = Object.keys(partCounts).reduce((a, b) => 
        partCounts[a] > partCounts[b] ? a : b, '');
    
    // 継続日数（過去30日で記録のある日数）
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const uniqueDates = [...new Set(entries
        .filter(entry => new Date(entry.date) >= monthAgo)
        .map(entry => entry.date))];
    const continuousDays = uniqueDates.length;
    
    // 統計表示更新
    const stats = statsArea.children;
    if (stats[0]) stats[0].querySelector('div').textContent = thisWeek;
    if (stats[1]) stats[1].querySelector('div').textContent = `${avgDuration}分`;
    if (stats[2]) stats[2].querySelector('div').textContent = mostFrequentPart || '--';
    if (stats[3]) stats[3].querySelector('div').textContent = continuousDays;
}

// ストレッチ履歴コピー
function copyStretchHistory() {
    if (!allStretchData || allStretchData.length === 0) {
        log('❌ コピーするストレッチ履歴がありません');
        return;
    }
    
    const csvContent = 'date,type,startTime,duration,intensity,bodyParts,memo\n' +
        allStretchData.map(entry => 
            `${entry.date},${entry.stretchType},${entry.startTime},${entry.duration},${entry.intensity},"${entry.bodyParts.join(',')}","${entry.memo || ''}"`
        ).join('\n');
    
    navigator.clipboard.writeText(csvContent).then(() => {
        log('📋 ストレッチ履歴をクリップボードにコピーしました');
    }).catch(err => {
        log('❌ コピーに失敗しました');
    });
}

// ストレッチ記録削除
function deleteStretchEntry(entryId) {
    if (!currentUser) return;
    
    if (confirm('このストレッチ記録を削除しますか？')) {
        database.ref(`users/${currentUser.uid}/stretchData/${entryId}`).remove()
            .then(() => {
                log('🗑️ ストレッチ記録を削除しました');
            })
            .catch(error => {
                log(`❌ 削除エラー: ${error.message}`);
            });
    }
}

// 初期化実行
if (typeof currentUser !== 'undefined' && currentUser) {
    initializeStretchManager();
}