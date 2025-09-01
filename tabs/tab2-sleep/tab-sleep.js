// ========== 睡眠管理機能 ==========

// 睡眠管理用変数
let allSleepData = [];
let selectedSleepType = '';
let selectedSleepQuality = '';
let selectedSleepTags = [];

// 睡眠管理初期化
function initializeSleepManager() {
    // 今日の日付を設定
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    if (document.getElementById('sleepDateInput')) {
        document.getElementById('sleepDateInput').value = todayString;
        
        // 現在時刻を設定
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const currentTimeString = `${currentHour}:${currentMinute}`;
        
        const sleepTimeInput = document.getElementById('sleepTimeInput');
        if (sleepTimeInput) {
            sleepTimeInput.value = currentTimeString;
        }
    }
    
    log('🛏️ 睡眠管理システム初期化完了');
}


// 睡眠タイプ選択
function selectSleepType(type) {
    selectedSleepType = type;
    document.getElementById('selectedSleepType').value = type;
    
    // ボタンのスタイル更新
    document.querySelectorAll('.sleep-type-btn').forEach(btn => {
        if (btn.dataset.type === type) {
            btn.style.opacity = '1';
            btn.style.fontWeight = 'bold';
        } else {
            btn.style.opacity = '0.7';
            btn.style.fontWeight = 'normal';
        }
    });
    
    log(`🛏️ 睡眠タイプ選択: ${type}`);
}

// 睡眠の質選択
function selectQuality(quality) {
    selectedSleepQuality = quality;
    document.getElementById('selectedQuality').value = quality;
    
    // ボタンのスタイル更新
    document.querySelectorAll('.quality-btn').forEach(btn => {
        if (parseInt(btn.dataset.quality) === quality) {
            btn.style.opacity = '1';
            btn.style.fontWeight = 'bold';
        } else {
            btn.style.opacity = '0.7';
            btn.style.fontWeight = 'normal';
        }
    });
    
    log(`⭐ 睡眠の質選択: ${quality}点`);
}

// 睡眠タグ切り替え
function toggleSleepTag(tag) {
    const index = selectedSleepTags.indexOf(tag);
    const button = document.querySelector(`[data-tag="${tag}"]`);
    
    if (index === -1) {
        // タグ追加
        selectedSleepTags.push(tag);
        button.style.opacity = '1';
        button.style.fontWeight = 'bold';
        button.style.transform = 'scale(1.05)';
    } else {
        // タグ削除
        selectedSleepTags.splice(index, 1);
        button.style.opacity = '0.7';
        button.style.fontWeight = 'normal';
        button.style.transform = 'scale(1)';
    }
    
    // hidden fieldに保存
    document.getElementById('selectedSleepTags').value = selectedSleepTags.join(',');
    
    // 表示テキスト更新
    const displayElement = document.getElementById('selectedTagsDisplay');
    if (displayElement) {
        displayElement.textContent = selectedSleepTags.length > 0 ? selectedSleepTags.join(', ') : 'なし';
    }
    
    log(`🏷️ 睡眠タグ更新: [${selectedSleepTags.join(', ')}]`);
}


// 睡眠データ保存
async function saveSleepData() {
    if (!currentUser) {
        log('❌ ログインが必要です');
        return;
    }

    // 入力値取得
    const sleepDate = document.getElementById('sleepDateInput').value;
    const sleepTime = document.getElementById('sleepTimeInput').value;
    const sleepMemo = document.getElementById('sleepMemoInput').value;

    // 必須項目チェック
    if (!sleepDate) {
        log('❌ 記録日を入力してください');
        return;
    }

    if (!sleepTime) {
        log('❌ 記録時間を入力してください');
        return;
    }

    // データ構造
    const sleepData = {
        date: sleepDate,
        time: sleepTime,
        sleepType: selectedSleepType || null,
        quality: selectedSleepQuality || null,
        tags: selectedSleepTags.slice(), // 配列のコピー
        memo: sleepMemo || null,
        recordType: 'simple',
        timestamp: new Date().toISOString()
    };

    try {
        // Firebase保存
        const sleepRef = database.ref(`users/${currentUser.uid}/sleepData/${sleepDate}_${Date.now()}`);
        await sleepRef.set(sleepData);
        
        log(`💾 睡眠記録保存完了: ${sleepDate} ${sleepTime}`);
        
        // 入力フィールドリセット
        document.getElementById('sleepMemoInput').value = '';
        selectedSleepType = '';
        selectedSleepQuality = '';
        selectedSleepTags = [];
        document.getElementById('selectedSleepType').value = '';
        document.getElementById('selectedQuality').value = '';
        document.getElementById('selectedSleepTags').value = '';
        
        // ボタンスタイルリセット
        document.querySelectorAll('.sleep-type-btn, .quality-btn, .sleep-tag-btn').forEach(btn => {
            btn.style.opacity = '0.7';
            btn.style.fontWeight = 'normal';
            btn.style.transform = 'scale(1)';
        });
        
        // データ再読み込み
        await loadSleepData();
        
    } catch (error) {
        log(`❌ 保存エラー: ${error.message}`);
    }
}

// 睡眠データ読み込み
async function loadSleepData() {
    if (!currentUser) return;

    try {
        log('🔄 睡眠データ読み込み開始...');
        const sleepRef = database.ref(`users/${currentUser.uid}/sleepData`);
        const snapshot = await sleepRef.once('value');
        
        allSleepData = [];
        if (snapshot.val()) {
            Object.entries(snapshot.val()).forEach(([key, data]) => {
                allSleepData.push({id: key, ...data});
            });
            log(`📊 睡眠データ読み込み完了: ${allSleepData.length}件`);
        } else {
            log('📊 睡眠データなし');
        }
        
        // 日付順でソート
        allSleepData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        updateSleepHistory();
        updateSleepStats();
        
    } catch (error) {
        log(`❌ 睡眠データ読み込みエラー: ${error.message}`);
    }
}

// 睡眠履歴表示更新
function updateSleepHistory() {
    const historyArea = document.getElementById('sleepHistoryArea');
    
    if (allSleepData.length === 0) {
        historyArea.innerHTML = 'まだ睡眠記録がありません';
        return;
    }

    // 直近7件表示
    const recentData = allSleepData.slice(0, 7);
    
    historyArea.innerHTML = recentData.map(data => {
        let content = `<strong>${data.date}</strong> `;
        
        // 記録表示
        content += `<span style="color: #666;">${data.sleepType || '記録'}</span><br>`;
        content += `⏰ ${data.time || data.bedTime || data.wakeTime || '--'}`;
        if (data.quality) content += `<br>⭐ ${data.quality}/5点`;
        
        if (data.tags && data.tags.length > 0) {
            content += `<br>🏷️ ${data.tags.join(', ')}`;
        }
        if (data.memo) {
            content += `<br>📝 ${data.memo}`;
        }
        
        return `<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
            <div>${content}</div>
            <button onclick="deleteSleepEntry('${data.id}')" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px; flex-shrink: 0;">🗑️</button>
        </div>`;
    }).join('');
}

// 睡眠統計更新
function updateSleepStats() {
    if (allSleepData.length === 0) {
        document.getElementById('sleepStatsArea').innerHTML = `
            <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <div style="font-size: 24px; font-weight: bold; color: #007bff;">--</div>
                <div style="font-size: 12px; color: #6c757d;">平均睡眠時間</div>
            </div>
            <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <div style="font-size: 24px; font-weight: bold; color: #28a745;">--</div>
                <div style="font-size: 12px; color: #6c757d;">平均睡眠の質</div>
            </div>
            <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <div style="font-size: 24px; font-weight: bold; color: #ffc107;">--</div>
                <div style="font-size: 12px; color: #6c757d;">今週の記録数</div>
            </div>
            <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <div style="font-size: 24px; font-weight: bold; color: #17a2b8;">--</div>
                <div style="font-size: 12px; color: #6c757d;">今月の記録数</div>
            </div>
        `;
        return;
    }

    // 統計計算
    const avgDuration = allSleepData.reduce((sum, data) => sum + data.duration, 0) / allSleepData.length;
    const avgQuality = allSleepData.reduce((sum, data) => sum + parseInt(data.quality), 0) / allSleepData.length;
    
    // 今週・今月の記録数
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const weekCount = allSleepData.filter(data => new Date(data.date) >= weekAgo).length;
    const monthCount = allSleepData.filter(data => new Date(data.date) >= monthAgo).length;

    document.getElementById('sleepStatsArea').innerHTML = `
        <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <div style="font-size: 24px; font-weight: bold; color: #007bff;">${avgDuration.toFixed(1)}h</div>
            <div style="font-size: 12px; color: #6c757d;">平均睡眠時間</div>
        </div>
        <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <div style="font-size: 24px; font-weight: bold; color: #28a745;">${avgQuality.toFixed(1)}</div>
            <div style="font-size: 12px; color: #6c757d;">平均睡眠の質</div>
        </div>
        <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <div style="font-size: 24px; font-weight: bold; color: #ffc107;">${weekCount}</div>
            <div style="font-size: 12px; color: #6c757d;">今週の記録数</div>
        </div>
        <div style="text-align: center; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <div style="font-size: 24px; font-weight: bold; color: #17a2b8;">${monthCount}</div>
            <div style="font-size: 12px; color: #6c757d;">今月の記録数</div>
        </div>
    `;
}

// 睡眠履歴コピー
function copySleepHistory() {
    if (allSleepData.length === 0) {
        log('📋 コピーする睡眠データがありません');
        return;
    }

    const copyText = allSleepData.slice(0, 7).map(data => 
        `${data.date} ${data.sleepType} ${data.bedTime}-${data.wakeTime} (${data.duration.toFixed(1)}h) ⭐${data.quality}/5${data.memo ? ` ${data.memo}` : ''}`
    ).join('\n');

    navigator.clipboard.writeText(copyText).then(() => {
        log('📋 睡眠履歴をクリップボードにコピーしました');
    }).catch(() => {
        log('❌ コピーに失敗しました');
    });
}

// 睡眠データ削除
window.deleteSleepEntry = async (entryId) => {
    if (!currentUser) {
        log('❌ ログインが必要です');
        return;
    }
    
    if (!confirm('この睡眠記録を削除しますか？')) {
        return;
    }
    
    try {
        const entryRef = database.ref(`users/${currentUser.uid}/sleepData/${entryId}`);
        await entryRef.remove();
        
        log('🗑️ 睡眠記録を削除しました');
        await loadSleepData(); // データ再読み込み
        
    } catch (error) {
        log(`❌ 削除エラー: ${error.message}`);
    }
};