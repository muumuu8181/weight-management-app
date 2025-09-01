// タブ2: 睡眠管理JavaScript

// 睡眠管理用変数
let allSleepData = [];
let selectedSleepType = '';
let selectedSleepQuality = '';

// 睡眠管理初期化
function initializeSleepManager() {
    // 今日の日付を設定
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    document.getElementById('sleepDateInput').value = todayString;
    
    // 時間入力の監視（要素存在チェック）
    const bedTimeInput = document.getElementById('bedTimeInput');
    const wakeTimeInput = document.getElementById('wakeTimeInput');
    if (bedTimeInput) bedTimeInput.addEventListener('change', calculateSleepDuration);
    if (wakeTimeInput) wakeTimeInput.addEventListener('change', calculateSleepDuration);
    
    log('🛏️ 睡眠管理システム初期化完了');
}

// 睡眠時間計算
function calculateSleepDuration() {
    const bedTime = document.getElementById('bedTimeInput').value;
    const wakeTime = document.getElementById('wakeTimeInput').value;
    const durationSpan = document.getElementById('sleepDuration');
    
    if (bedTime && wakeTime) {
        const bedDate = new Date(`2000-01-01T${bedTime}:00`);
        let wakeDate = new Date(`2000-01-01T${wakeTime}:00`);
        
        // 起床時間が就寝時間より早い場合は翌日とみなす
        if (wakeDate <= bedDate) {
            wakeDate.setDate(wakeDate.getDate() + 1);
        }
        
        const diffMs = wakeDate - bedDate;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        durationSpan.textContent = `${hours}:${String(minutes).padStart(2, '0')}`;
        durationSpan.style.color = hours >= 7 ? '#28a745' : hours >= 6 ? '#ffc107' : '#dc3545';
    } else {
        durationSpan.textContent = '--:--';
        durationSpan.style.color = '#007bff';
    }
}

// 睡眠タイプ選択
function selectSleepType(type) {
    selectedSleepType = type;
    document.getElementById('selectedSleepType').value = type;
    
    // 全ボタンをリセット
    document.querySelectorAll('.sleep-type-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 選択されたボタンを強調
    const selectedBtn = document.querySelector(`[data-type="${type}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.1)';
    }
    
    log(`🛏️ 睡眠タイプ選択: ${type}`);
}

// 睡眠の質選択
function selectQuality(quality) {
    selectedSleepQuality = quality;
    document.getElementById('selectedQuality').value = quality;
    
    // 全ボタンをリセット
    document.querySelectorAll('.quality-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 選択されたボタンを強調
    const selectedBtn = document.querySelector(`[data-quality="${quality}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.1)';
    }
    
    log(`⭐ 睡眠の質選択: ${quality}点`);
}

// 睡眠データ保存（エフェクト付き）
async function saveSleepData() {
    const saveButton = document.querySelector('button[onclick="saveSleepData()"]');
    const originalText = saveButton.innerHTML;
    const originalStyle = saveButton.style.cssText;
    
    try {
        // 保存開始エフェクト
        saveButton.innerHTML = '💾 保存中...';
        saveButton.style.background = '#ffc107';
        saveButton.style.transform = 'scale(0.95)';
        saveButton.disabled = true;
        
        const date = document.getElementById('sleepDateInput').value;
        const sleepType = selectedSleepType;
        const bedTime = document.getElementById('bedTimeInput').value;
        const wakeTime = document.getElementById('wakeTimeInput').value;
        const quality = selectedSleepQuality;
        const memo = document.getElementById('sleepMemoInput').value || null;
        const duration = document.getElementById('sleepDuration').textContent;
        
        if (!date || !sleepType || !bedTime || !wakeTime || !quality) {
            throw new Error('すべての必須項目を入力してください');
        }
        
        if (!currentUser) {
            throw new Error('ログインが必要です');
        }
        
        // データ保存
        const dataRef = database.ref(`users/${currentUser.uid}/sleepData`).push();
        await dataRef.set({
            date: date,
            sleepType: sleepType,
            bedTime: bedTime,
            wakeTime: wakeTime,
            duration: duration,
            quality: parseInt(quality),
            memo: memo,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        // 成功エフェクト
        saveButton.innerHTML = '✅ 保存完了!';
        saveButton.style.background = '#28a745';
        saveButton.style.transform = 'scale(1.05)';
        
        log(`💾 睡眠データ保存: ${sleepType} ${duration} (質:${quality}点)`);
        
        // データ再読み込み
        loadUserSleepData(currentUser.uid);
        
        // フォームリセット
        resetSleepForm();
        
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
function resetSleepForm() {
    // 選択状態をリセット
    selectedSleepType = '';
    selectedSleepQuality = '';
    
    // 入力フィールドをリセット
    document.getElementById('bedTimeInput').value = '';
    document.getElementById('wakeTimeInput').value = '';
    document.getElementById('sleepMemoInput').value = '';
    document.getElementById('sleepDuration').textContent = '--:--';
    
    // ボタンの状態をリセット
    document.querySelectorAll('.sleep-type-btn, .quality-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
}

// 睡眠データ読み込み
function loadUserSleepData(userId) {
    const dataRef = database.ref(`users/${userId}/sleepData`);
    dataRef.on('value', (snapshot) => {
        const historyDiv = document.getElementById('sleepHistoryArea');
        if (snapshot.exists()) {
            const data = snapshot.val();
            const entries = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).sort((a, b) => new Date(b.date) - new Date(a.date));

            allSleepData = entries;
            
            // 直近7件のみ表示
            const recentEntries = entries.slice(0, 7);
            
            historyDiv.innerHTML = recentEntries.map(entry => {
                const qualityEmojis = ['', '😴', '😪', '😐', '😊', '😴'];
                let displayText = `${entry.date} ${entry.sleepType}`;
                displayText += ` ${entry.bedTime}-${entry.wakeTime}`;
                displayText += ` (${entry.duration})`;
                displayText += ` ${qualityEmojis[entry.quality]}${entry.quality}点`;
                if (entry.memo) displayText += ` - ${entry.memo}`;
                
                return `<div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 0; border-bottom: 1px solid #eee;"><span>${displayText}</span><button onclick="deleteSleepEntry('${entry.id}')" style="background: #dc3545; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px;">🗑️</button></div>`;
            }).join('');
            
            // 統計を更新
            updateSleepStats(entries);
            
            log(`📊 睡眠データ読み込み完了: ${entries.length}件`);
        } else {
            historyDiv.innerHTML = 'まだ睡眠記録がありません';
            allSleepData = [];
            updateSleepStats([]);
        }
    });
}

// 睡眠統計更新
function updateSleepStats(entries) {
    const statsArea = document.getElementById('sleepStatsArea');
    if (!entries || entries.length === 0) {
        statsArea.innerHTML = statsArea.innerHTML.replace(/[0-9.:]+/g, '--');
        return;
    }
    
    // 平均睡眠時間計算
    const totalMinutes = entries.reduce((sum, entry) => {
        const [hours, minutes] = entry.duration.split(':').map(Number);
        return sum + (hours * 60 + minutes);
    }, 0);
    const avgMinutes = Math.round(totalMinutes / entries.length);
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;
    
    // 平均睡眠の質
    const avgQuality = (entries.reduce((sum, entry) => sum + entry.quality, 0) / entries.length).toFixed(1);
    
    // 今週・今月の記録数
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const thisWeek = entries.filter(entry => new Date(entry.date) >= weekAgo).length;
    const thisMonth = entries.filter(entry => new Date(entry.date) >= monthAgo).length;
    
    // 統計表示更新
    const stats = statsArea.children;
    if (stats[0]) stats[0].querySelector('div').textContent = `${avgHours}:${String(avgMins).padStart(2, '0')}`;
    if (stats[1]) stats[1].querySelector('div').textContent = avgQuality;
    if (stats[2]) stats[2].querySelector('div').textContent = thisWeek;
    if (stats[3]) stats[3].querySelector('div').textContent = thisMonth;
}

// 睡眠履歴コピー
function copySleepHistory() {
    if (!allSleepData || allSleepData.length === 0) {
        log('❌ コピーする睡眠履歴がありません');
        return;
    }
    
    const csvContent = 'date,type,bedTime,wakeTime,duration,quality,memo\n' +
        allSleepData.map(entry => 
            `${entry.date},${entry.sleepType},${entry.bedTime},${entry.wakeTime},${entry.duration},${entry.quality},"${entry.memo || ''}"`
        ).join('\n');
    
    navigator.clipboard.writeText(csvContent).then(() => {
        log('📋 睡眠履歴をクリップボードにコピーしました');
    }).catch(err => {
        log('❌ コピーに失敗しました');
    });
}

// 睡眠記録削除
function deleteSleepEntry(entryId) {
    if (!currentUser) return;
    
    if (confirm('この睡眠記録を削除しますか？')) {
        database.ref(`users/${currentUser.uid}/sleepData/${entryId}`).remove()
            .then(() => {
                log('🗑️ 睡眠記録を削除しました');
            })
            .catch(error => {
                log(`❌ 削除エラー: ${error.message}`);
            });
    }
}

// 初期化実行
if (typeof currentUser !== 'undefined' && currentUser) {
    initializeSleepManager();
}