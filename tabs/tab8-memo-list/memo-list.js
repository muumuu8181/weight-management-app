// メモリスト機能のJavaScript

// メモリスト関連のグローバル変数
let memoData = [];

// 重要度の色を取得
function getPriorityColor(priority) {
    switch(priority) {
        case 'S': return '#dc3545'; // 赤
        case 'A': return '#fd7e14'; // オレンジ
        case 'B': return '#ffc107'; // 黄色
        case 'C': return '#6c757d'; // グレー
        default: return '#6c757d';
    }
}

// 重要度のアイコンを取得
function getPriorityIcon(priority) {
    switch(priority) {
        case 'S': return '🔥';
        case 'A': return '⚡';
        case 'B': return '📋';
        case 'C': return '📝';
        default: return '';
    }
}

// 対応時間の色を取得
function getTimeframeColor(timeframe) {
    switch(timeframe) {
        case '短期': return '#28a745'; // 緑
        case '中長期': return '#17a2b8'; // 青
        default: return '#6c757d';
    }
}

// 対応時間のアイコンを取得
function getTimeframeIcon(timeframe) {
    switch(timeframe) {
        case '短期': return '⚡';
        case '中長期': return '📅';
        default: return '';
    }
}

// 重要度選択
window.selectPriority = (priority) => {
    // ボタンのスタイル更新
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    const selectedBtn = document.querySelector(`[data-priority="${priority}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.05)';
    }
    
    // hidden inputに値を設定
    document.getElementById('memoPriority').value = priority;
    
    log(`🎯 重要度選択: ${priority || 'なし'}`);
};

// 対応時間選択
window.selectTimeframe = (timeframe) => {
    // ボタンのスタイル更新
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    const selectedBtn = document.querySelector(`[data-timeframe="${timeframe}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.05)';
    }
    
    // hidden inputに値を設定
    document.getElementById('memoTimeframe').value = timeframe;
    
    log(`⏰ 対応時間選択: ${timeframe || 'なし'}`);
};

// メモを追加
window.addMemo = () => {
    const memoText = document.getElementById('newMemoText').value.trim();
    const category = document.getElementById('memoCategory').value;
    const priority = document.getElementById('memoPriority').value;
    const timeframe = document.getElementById('memoTimeframe').value;
    
    if (!memoText) {
        alert('メモ内容を入力してください');
        return;
    }
    
    const now = new Date();
    const memo = {
        id: Date.now(),
        text: memoText,
        category: category,
        priority: priority,
        timeframe: timeframe,
        timestamp: now.toISOString(),
        date: now.toLocaleDateString('ja-JP'),
        time: now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };
    
    memoData.unshift(memo); // 新しいメモを先頭に追加
    
    // Firebaseに保存
    if (currentUser) {
        saveMemoToFirebase(memo);
    } else {
        // ローカルストレージに保存
        localStorage.setItem('memos', JSON.stringify(memoData));
    }
    
    // 表示を更新
    updateMemoDisplay();
    updateMemoStats();
    
    // フォームをクリア
    document.getElementById('newMemoText').value = '';
    document.getElementById('memoCategory').value = '';
    document.getElementById('memoPriority').value = '';
    document.getElementById('memoTimeframe').value = '';
    
    // ボタンをリセット
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.style.opacity = btn.getAttribute('data-priority') === '' ? '1' : '0.7';
        btn.style.transform = 'scale(1)';
    });
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.style.opacity = btn.getAttribute('data-timeframe') === '' ? '1' : '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    log(`📝 メモを追加しました${category ? ` [${category}]` : ''}: ${memoText.substring(0, 30)}${memoText.length > 30 ? '...' : ''}`);
};

// Firebaseにメモを保存
function saveMemoToFirebase(memo) {
    if (!currentUser || !firebase.database) return;
    
    firebase.database().ref(`users/${currentUser.uid}/memos/${memo.id}`).set(memo)
    .then(() => {
        console.log('メモをFirebaseに保存しました');
    })
    .catch((error) => {
        console.error('Firebaseへの保存に失敗:', error);
        log('❌ メモの保存に失敗しました');
    });
}

// メモ表示を更新
function updateMemoDisplay() {
    const container = document.getElementById('memoListArea');
    
    if (memoData.length === 0) {
        container.innerHTML = 'まだメモがありません';
        return;
    }
    
    const html = memoData.map(memo => {
        const categoryBadge = memo.category ? 
            `<span style="background: #6c757d; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-right: 5px;">${memo.category}</span>` : '';
        
        // 重要度のバッジ
        const priorityBadge = memo.priority ? 
            `<span style="background: ${getPriorityColor(memo.priority)}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-right: 5px; font-weight: bold;">${getPriorityIcon(memo.priority)} ${memo.priority}</span>` : '';
        
        // 対応時間のバッジ
        const timeframeBadge = memo.timeframe ? 
            `<span style="background: ${getTimeframeColor(memo.timeframe)}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-right: 5px;">${getTimeframeIcon(memo.timeframe)} ${memo.timeframe}</span>` : '';
        
        return `
            <div class="memo-item">
                <div class="memo-header">
                    <div style="flex: 1;">
                        ${priorityBadge}${timeframeBadge}${categoryBadge}
                        <small class="memo-date">${memo.date} ${memo.time}</small>
                    </div>
                    <button onclick="deleteMemo(${memo.id})" class="memo-delete-btn">🗑️</button>
                </div>
                <div class="memo-text">
                    ${memo.text}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// メモを削除
window.deleteMemo = (memoId) => {
    if (!confirm('このメモを削除しますか？')) {
        return;
    }
    
    memoData = memoData.filter(memo => memo.id !== memoId);
    
    // Firebaseから削除
    if (currentUser) {
        firebase.database().ref(`users/${currentUser.uid}/memos/${memoId}`).remove();
    } else {
        // ローカルストレージを更新
        localStorage.setItem('memos', JSON.stringify(memoData));
    }
    
    updateMemoDisplay();
    updateMemoStats();
    log('🗑️ メモを削除しました');
};

// 全メモを削除
window.clearAllMemos = () => {
    if (!confirm('すべてのメモを削除しますか？\nこの操作は取り消せません。')) {
        return;
    }
    
    memoData = [];
    
    // Firebaseから削除
    if (currentUser) {
        firebase.database().ref(`users/${currentUser.uid}/memos`).remove();
    } else {
        // ローカルストレージを更新
        localStorage.setItem('memos', JSON.stringify(memoData));
    }
    
    updateMemoDisplay();
    updateMemoStats();
    log('🗑️ すべてのメモを削除しました');
};

// メモ統計を更新
function updateMemoStats() {
    const now = new Date();
    const today = now.toLocaleDateString('ja-JP');
    
    // 今週の開始日（月曜日）を計算
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    
    const todayCount = memoData.filter(memo => memo.date === today).length;
    const weekCount = memoData.filter(memo => new Date(memo.timestamp) >= weekStart).length;
    const priorityCount = memoData.filter(memo => memo.priority === 'S' || memo.priority === 'A').length;
    
    document.getElementById('totalMemoCount').textContent = memoData.length;
    document.getElementById('todayMemoCount').textContent = todayCount;
    document.getElementById('weekMemoCount').textContent = weekCount;
    document.getElementById('priorityMemoCount').textContent = priorityCount;
}

// 全メモをコピー
window.copyAllMemos = () => {
    if (memoData.length === 0) {
        alert('コピーするメモがありません');
        return;
    }
    
    const copyText = memoData.map(memo => {
        const categoryText = memo.category ? `[${memo.category}] ` : '';
        return `${memo.date} ${memo.time} ${categoryText}${memo.text}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(copyText).then(() => {
        log('📋 全メモをクリップボードにコピーしました');
    }).catch(() => {
        log('❌ コピーに失敗しました');
    });
};

// メモデータを読み込み
function loadMemoData() {
    if (currentUser) {
        // Firebaseから読み込み
        firebase.database().ref(`users/${currentUser.uid}/memos`).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                memoData = Object.values(data).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            } else {
                memoData = [];
            }
            updateMemoDisplay();
            updateMemoStats();
        });
    } else {
        // ローカルストレージから読み込み
        const stored = localStorage.getItem('memos');
        if (stored) {
            memoData = JSON.parse(stored);
        }
        updateMemoDisplay();
        updateMemoStats();
    }
}

// メモ機能初期化
function initMemoList() {
    // Enterキーでメモ追加（Ctrl+Enterの場合）
    const memoTextArea = document.getElementById('newMemoText');
    if (memoTextArea) {
        memoTextArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                addMemo();
            }
        });
    }
    
    // 未ログイン時のメモデータ初期化
    if (!currentUser) {
        loadMemoData();
    }
    
    log('📝 メモリスト機能初期化完了');
}