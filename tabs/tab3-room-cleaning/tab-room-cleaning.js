// 部屋片付け機能のJavaScript

// 部屋片付け関連のグローバル変数
let selectedRoomValue = '';
let selectedRoomAchievement = null;
let roomStartTime = null;
let roomEndTime = null;
let currentRoomMode = 'normal';
let allRoomData = [];

// 部屋片付け管理初期化
function initRoomManagement() {
    // 現在の日付・時刻を設定
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    document.getElementById('roomDateInput').value = today;
    document.getElementById('roomTimeInput').value = currentTime;
    
    // カスタム場所を復元
    loadCustomRooms();
    
    log('🧹 部屋片付け管理初期化完了');
}

// 場所管理モード設定
window.setRoomMode = (mode) => {
    currentRoomMode = mode;
    
    // ボタンの見た目を更新
    document.getElementById('roomNormalModeBtn').style.background = mode === 'normal' ? '#007bff' : '#6c757d';
    document.getElementById('roomAddModeBtn').style.background = mode === 'add' ? '#007bff' : '#6c757d';
    document.getElementById('roomDeleteModeBtn').style.background = mode === 'delete' ? '#007bff' : '#6c757d';
    
    // 追加入力エリアの表示切り替え
    const addInput = document.getElementById('roomUnifiedAddInput');
    if (mode === 'add') {
        addInput.style.display = 'block';
    } else {
        addInput.style.display = 'none';
    }
    
    log(`🔧 場所管理モード: ${mode}`);
};

// 片付け場所選択
window.selectRoom = (room) => {
    if (currentRoomMode === 'delete') {
        // 削除モード: カスタム場所のみ削除可能
        const isCustomRoom = !['リビング', 'キッチン', '寝室', 'お風呂', '洗面所', '玄関'].includes(room);
        if (isCustomRoom) {
            if (confirm(`「${room}」を削除しますか？`)) {
                removeCustomRoom(room);
            }
        } else {
            log('❌ デフォルト場所は削除できません');
        }
        return;
    }
    
    // 通常選択
    selectedRoomValue = room;
    const selectedRoomInput = document.getElementById('selectedRoom');
    if (selectedRoomInput) {
        selectedRoomInput.value = room;
    }
    
    // ボタンのスタイル更新
    document.querySelectorAll('.room-btn').forEach(btn => {
        if (btn.getAttribute('data-room') === room) {
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1.05)';
        } else {
            btn.style.opacity = '0.7';
            btn.style.transform = 'scale(1)';
        }
    });
    
    log(`📍 場所選択: ${room}`);
};

// 片付け開始
window.startRoomCleaning = () => {
    if (!selectedRoomValue) {
        log('❌ 片付け場所を選択してください');
        return;
    }
    
    roomStartTime = new Date();
    const timeString = roomStartTime.toTimeString().slice(0, 5);
    
    // ボタン表示切り替え
    const startBtn = document.getElementById('startRoomBtn');
    const endBtn = document.getElementById('endRoomBtn');
    if (startBtn && endBtn) {
        startBtn.style.display = 'none';
        endBtn.style.display = 'inline-block';
    }
    
    // 時刻表示を開始時刻に更新
    document.getElementById('roomTimeInput').value = timeString;
    const durationInput = document.getElementById('roomDuration');
    if (durationInput) {
        durationInput.value = '計測中...';
    }
    
    log(`▶️ 片付け開始: ${selectedRoomValue} - ${timeString}`);
};

// 片付け終了
window.endRoomCleaning = () => {
    if (!roomStartTime) {
        log('❌ 片付けが開始されていません');
        return;
    }
    
    roomEndTime = new Date();
    const duration = Math.round((roomEndTime - roomStartTime) / (1000 * 60)); // 分単位
    
    // ボタン表示を戻す
    const startBtn = document.getElementById('startRoomBtn');
    const endBtn = document.getElementById('endRoomBtn');
    if (startBtn && endBtn) {
        startBtn.style.display = 'inline-block';
        endBtn.style.display = 'none';
    }
    
    // 時間表示を更新
    const durationInput = document.getElementById('roomDuration');
    if (durationInput) {
        durationInput.value = `${duration}分`;
    }
    
    log(`⏹️ 片付け終了: ${selectedRoomValue} - ${duration}分間`);
};

// 達成度選択
window.selectAchievement = (level) => {
    selectedRoomAchievement = level;
    const achievementInput = document.getElementById('selectedAchievement');
    if (achievementInput) {
        achievementInput.value = `${level}/5`;
    }
    
    // ボタンのスタイル更新
    document.querySelectorAll('.achievement-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    const selectedBtn = document.querySelector(`[onclick="selectAchievement(${level})"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.1)';
    }
    
    log(`📊 達成度選択: ${level}/5`);
};

// カスタム場所追加実行
window.executeRoomAdd = () => {
    const roomName = document.getElementById('roomUnifiedAddText').value.trim();
    if (!roomName) {
        log('❌ 場所名を入力してください');
        return;
    }
    
    // 既存チェック
    const existing = document.querySelector(`[data-room="${roomName}"]`);
    if (existing) {
        log('❌ その場所は既に存在します');
        return;
    }
    
    addCustomRoomButton(roomName);
    saveCustomRooms();
    
    // 入力欄をクリアしてモードを戻す
    document.getElementById('roomUnifiedAddText').value = '';
    setRoomMode('normal');
    
    log(`✅ 新しい場所追加: ${roomName}`);
};

// カスタム場所追加キャンセル
window.cancelRoomAdd = () => {
    document.getElementById('roomUnifiedAddText').value = '';
    setRoomMode('normal');
    log('❌ 場所追加をキャンセル');
};

// カスタム場所削除
function removeCustomRoom(roomName) {
    const roomBtn = document.querySelector(`[data-room="${roomName}"]`);
    if (roomBtn) {
        roomBtn.remove();
        saveCustomRooms(); // 削除後に保存
        log(`🗑️ 場所削除: ${roomName}`);
    }
}

// カスタム場所ボタン作成
function addCustomRoomButton(roomName) {
    const roomButtons = document.getElementById('roomButtons');
    const newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.className = 'room-btn';
    newButton.onclick = () => selectRoom(roomName);
    newButton.setAttribute('data-room', roomName);
    newButton.style.cssText = 'background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; opacity: 0.7;';
    newButton.textContent = `🏠 ${roomName}`;
    
    roomButtons.appendChild(newButton);
}

// カスタム場所をlocalStorageに保存
function saveCustomRooms() {
    const defaultRooms = ['リビング', 'キッチン', '寝室', 'お風呂', '洗面所', '玄関'];
    const customRooms = Array.from(document.querySelectorAll('.room-btn'))
        .map(btn => btn.getAttribute('data-room'))
        .filter(room => !defaultRooms.includes(room));
    
    localStorage.setItem('roomApp_customRooms', JSON.stringify(customRooms));
    log(`💾 カスタム場所保存: ${customRooms.length}件`);
}

// カスタム場所をlocalStorageから復元
function loadCustomRooms() {
    try {
        const saved = localStorage.getItem('roomApp_customRooms');
        if (saved) {
            const customRooms = JSON.parse(saved);
            customRooms.forEach(roomName => {
                addCustomRoomButton(roomName);
            });
            log(`📂 カスタム場所復元: ${customRooms.length}件`);
        }
    } catch (error) {
        log(`❌ カスタム場所復元エラー: ${error.message}`);
    }
}

// 部屋片付けデータ保存
window.saveRoomData = async () => {
    if (!currentUser) {
        log('❌ ログインが必要です');
        return;
    }
    
    if (!selectedRoomValue) {
        log('❌ 片付け場所を選択してください');
        return;
    }
    
    try {
        log('💾 部屋片付けデータを保存中...');
        
        const roomData = {
            date: document.getElementById('roomDateInput').value,
            time: document.getElementById('roomTimeInput').value,
            room: selectedRoomValue,
            memo: document.getElementById('roomMemoText') ? document.getElementById('roomMemoText').value : '',
            timestamp: new Date().toISOString()
        };
        
        // Firebaseに保存
        const userRoomRef = firebase.database().ref(`users/${currentUser.uid}/roomData`);
        await userRoomRef.push(roomData);
        
        log('✅ 部屋片付けデータ保存完了');
        resetRoomForm();
        window.loadRoomData();
        
    } catch (error) {
        log(`❌ 部屋片付けデータ保存エラー: ${error.message}`);
    }
};

// 部屋片付けフォームリセット
function resetRoomForm() {
    selectedRoomValue = '';
    selectedRoomAchievement = null;
    roomStartTime = null;
    roomEndTime = null;
    
    const selectedRoomInput = document.getElementById('selectedRoom');
    if (selectedRoomInput) selectedRoomInput.value = '';
    
    const memoInput = document.getElementById('roomMemoText');
    if (memoInput) memoInput.value = '';
    
    // ボタンスタイルをリセット
    document.querySelectorAll('.room-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 現在時刻更新
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    document.getElementById('roomTimeInput').value = currentTime;
    
    log('🔄 部屋片付けフォームをリセット');
}

// 部屋片付けデータ読み込み
window.loadRoomData = async () => {
    if (!currentUser) return;
    
    try {
        const userRoomRef = firebase.database().ref(`users/${currentUser.uid}/roomData`);
        const snapshot = await userRoomRef.orderByChild('date').limitToLast(10).once('value');
        
        const roomDataDisplay = document.getElementById('roomHistoryArea');
        if (!roomDataDisplay) return;
        
        if (!snapshot.exists()) {
            roomDataDisplay.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">記録がありません</p>';
            return;
        }
        
        const data = snapshot.val();
        const roomEntries = Object.entries(data).reverse(); // 新しい順
        
        let html = '';
        roomEntries.forEach(([key, entry]) => {
            html += `
                <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px; background: #fefefe;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                        <div>
                            <strong>📍 ${entry.room}</strong>
                            <div style="font-size: 12px; color: #666;">
                                📅 ${entry.date} 🕐 ${entry.time}
                            </div>
                        </div>
                        <button onclick="deleteRoomEntry('${key}')" style="background: #dc3545; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px;">削除</button>
                    </div>
                    ${entry.memo ? `<div style="margin-top: 5px; font-size: 12px; color: #555; font-style: italic;">💭 ${entry.memo}</div>` : ''}
                </div>
            `;
        });
        
        roomDataDisplay.innerHTML = html;
        
        // allRoomDataも更新（統計・履歴用）
        allRoomData = roomEntries.map(([key, entry]) => ({ id: key, ...entry }));
        
    } catch (error) {
        log(`❌ 部屋片付けデータ読み込みエラー: ${error.message}`);
    }
};

// 部屋片付け記録削除
window.deleteRoomEntry = async (entryKey) => {
    if (!currentUser) return;
    
    if (!confirm('この記録を削除しますか？')) return;
    
    try {
        const entryRef = firebase.database().ref(`users/${currentUser.uid}/roomData/${entryKey}`);
        await entryRef.remove();
        
        log('🗑️ 部屋片付け記録を削除しました');
        window.loadRoomData();
        
    } catch (error) {
        log(`❌ 部屋片付け記録削除エラー: ${error.message}`);
    }
};

// 部屋片付け履歴表示更新
function updateRoomHistory() {
    log('🔍 updateRoomHistory() 開始');
    const historyArea = document.getElementById('roomHistoryArea');
    
    log(`📊 部屋データ件数: ${allRoomData.length}`);
    log('🔍 historyArea要素:', historyArea ? '存在' : '見つからない');
    
    if (!historyArea) {
        log('❌ roomHistoryArea要素が見つかりません');
        return;
    }
    
    if (allRoomData.length === 0) {
        historyArea.innerHTML = 'まだ片付け記録がありません';
        log('ℹ️ 部屋データなし - プレースホルダー表示');
        return;
    }
    
    // 直近7件表示
    const recentData = allRoomData.slice(0, 7);
    log(`📋 表示データ件数: ${recentData.length}`);
    
    historyArea.innerHTML = recentData.map(data => {
        let content = `<strong>${data.date}</strong> ${data.time} `;
        content += `📍 ${data.room} `;
        content += `⏱️ ${data.duration} `;
        content += `📊 ${data.achievement}/5`;
        if (data.memo) {
            content += `<br>📝 ${data.memo}`;
        }
        
        return `<div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
            <div>${content}</div>
            <button onclick="deleteRoomEntry('${data.id}')" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px; flex-shrink: 0;">🗑️</button>
        </div>`;
    }).join('');
    
    log('✅ updateRoomHistory() 完了');
}

// 部屋片付け統計更新
function updateRoomStats() {
    const totalSessions = allRoomData.length;
    const totalMinutes = allRoomData.reduce((sum, data) => {
        const minutes = parseInt(data.duration) || 0;
        return sum + minutes;
    }, 0);
    const avgAchievement = totalSessions > 0 ? 
        (allRoomData.reduce((sum, data) => sum + (data.achievement || 0), 0) / totalSessions).toFixed(1) : 0;
    
    // 今月の記録数
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const thisMonthCount = allRoomData.filter(data => data.date.startsWith(thisMonth)).length;
    
    const totalSessionsEl = document.getElementById('totalRoomSessions');
    const totalTimeEl = document.getElementById('totalRoomTime');
    const avgAchievementEl = document.getElementById('avgRoomAchievement');
    const thisMonthEl = document.getElementById('thisMonthRoomCount');
    
    if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
    if (totalTimeEl) totalTimeEl.textContent = `${totalMinutes}分`;
    if (avgAchievementEl) avgAchievementEl.textContent = avgAchievement;
    if (thisMonthEl) thisMonthEl.textContent = thisMonthCount;
}

// 部屋片付け履歴コピー
window.copyRoomHistory = () => {
    if (allRoomData.length === 0) {
        log('📋 コピーする片付けデータがありません');
        return;
    }
    
    const copyText = allRoomData.slice(0, 7).map(data => 
        `${data.date} ${data.time} ${data.room} ${data.duration} 達成度${data.achievement}/5${data.memo ? ` ${data.memo}` : ''}`
    ).join('\n');
    
    navigator.clipboard.writeText(copyText).then(() => {
        log('📋 片付け履歴をクリップボードにコピーしました');
    }).catch(() => {
        log('❌ クリップボードのコピーに失敗しました');
    });
};