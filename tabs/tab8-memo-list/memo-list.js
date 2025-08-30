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

// フィルタークリア機能
window.clearFilter = () => {
    document.getElementById('memoFilter').value = '';
    filterMemos();
};

// メモフィルター機能
window.filterMemos = () => {
    const filterText = document.getElementById('memoFilter').value.toLowerCase();
    const filteredData = filterText === '' ? memoData : 
        memoData.filter(memo => 
            memo.text.toLowerCase().includes(filterText) ||
            (memo.category && memo.category.toLowerCase().includes(filterText)) ||
            (memo.priority && memo.priority.toLowerCase().includes(filterText)) ||
            (memo.timeframe && memo.timeframe.toLowerCase().includes(filterText))
        );
    
    displayFilteredMemos(filteredData);
    updateFilterCount(filteredData.length, memoData.length);
};

// フィルター件数表示
function updateFilterCount(filteredCount, totalCount) {
    const countDiv = document.getElementById('filterCount');
    if (countDiv) {
        const filterText = document.getElementById('memoFilter').value;
        if (filterText && filteredCount < totalCount) {
            countDiv.textContent = `${filteredCount}/${totalCount} 件`;
        } else {
            countDiv.textContent = '';
        }
    }
}

// フィルター済みメモを表示
function displayFilteredMemos(filteredData) {
    const container = document.getElementById('memoListArea');
    
    if (filteredData.length === 0) {
        const filterText = document.getElementById('memoFilter').value;
        container.innerHTML = filterText ? '検索にマッチするメモがありません' : 'まだメモがありません';
        return;
    }
    
    const html = filteredData.map(memo => {
        const categoryBadge = memo.category ? 
            `<span style="background: #6c757d; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-right: 5px;">${memo.category}</span>` : '';
        
        // 重要度のバッジ
        const priorityBadge = memo.priority ? 
            `<span style="background: ${getPriorityColor(memo.priority)}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-right: 5px; font-weight: bold;">${getPriorityIcon(memo.priority)} ${memo.priority}</span>` : '';
        
        // 対応時間のバッジ
        const timeframeBadge = memo.timeframe ? 
            `<span style="background: ${getTimeframeColor(memo.timeframe)}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-right: 5px;">${getTimeframeIcon(memo.timeframe)} ${memo.timeframe}</span>` : '';
        
        // テキストを1行に制限（モバイル対応）
        const truncatedText = memo.text.length > 50 ? memo.text.substring(0, 50) + '...' : memo.text;
        
        return `
            <div class="memo-item">
                <div class="memo-header">
                    <div style="flex: 1;">
                        ${priorityBadge}${timeframeBadge}${categoryBadge}
                        <small class="memo-date">${memo.date} ${memo.time}</small>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button onclick="editMemo(${memo.id})" style="background: #17a2b8; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px;">✏️</button>
                        <button onclick="deleteMemo(${memo.id})" class="memo-delete-btn">🗑️</button>
                    </div>
                </div>
                <div class="memo-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" onclick="toggleMemoDetail(${memo.id})">
                    <span id="memo-text-${memo.id}">${truncatedText}</span>
                    ${memo.text.length > 50 ? '<small style="color: #007bff; margin-left: 5px;">[クリックで詳細]</small>' : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// メモ詳細表示切り替え
window.toggleMemoDetail = (memoId) => {
    const memo = memoData.find(m => m.id === memoId);
    if (!memo) return;
    
    const textElement = document.getElementById(`memo-text-${memoId}`);
    const parentDiv = textElement.parentElement;
    
    if (textElement.textContent === memo.text) {
        // 詳細表示中 -> 省略表示に戻す
        const truncatedText = memo.text.length > 50 ? memo.text.substring(0, 50) + '...' : memo.text;
        textElement.textContent = truncatedText;
        parentDiv.style.whiteSpace = 'nowrap';
        parentDiv.style.overflow = 'hidden';
        parentDiv.style.textOverflow = 'ellipsis';
    } else {
        // 省略表示中 -> 詳細表示
        textElement.textContent = memo.text;
        parentDiv.style.whiteSpace = 'normal';
        parentDiv.style.overflow = 'visible';
        parentDiv.style.textOverflow = 'initial';
    }
};

// メモ表示を更新（既存関数を修正）
function updateMemoDisplay() {
    // フィルターが適用されている場合はフィルターを維持
    const filterText = document.getElementById('memoFilter') ? document.getElementById('memoFilter').value : '';
    if (filterText) {
        filterMemos();
    } else {
        displayFilteredMemos(memoData);
    }
}

// メモ編集機能
window.editMemo = (memoId) => {
    const memo = memoData.find(m => m.id === memoId);
    if (!memo) return;
    
    // 編集フォームに値を設定
    document.getElementById('newMemoText').value = memo.text;
    document.getElementById('memoCategory').value = memo.category || '';
    
    // ボタン状態を設定
    selectPriority(memo.priority || '');
    selectTimeframe(memo.timeframe || '');
    
    // 編集モードの表示
    const addButton = document.querySelector('[onclick="addMemo()"]');
    addButton.textContent = '📝 メモを更新';
    addButton.onclick = () => updateMemo(memoId);
    
    // キャンセルボタンを追加
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '❌ キャンセル';
    cancelButton.style.cssText = 'background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; margin-left: 10px;';
    cancelButton.onclick = cancelEdit;
    addButton.parentNode.appendChild(cancelButton);
    
    log(`✏️ メモ編集開始: ${memo.text.substring(0, 30)}...`);
};

// メモ更新
window.updateMemo = async (memoId) => {
    const memoText = document.getElementById('newMemoText').value.trim();
    const category = document.getElementById('memoCategory').value;
    const priority = document.getElementById('memoPriority').value;
    const timeframe = document.getElementById('memoTimeframe').value;
    
    if (!memoText) {
        alert('メモ内容を入力してください');
        return;
    }
    
    // メモデータを更新
    const memoIndex = memoData.findIndex(m => m.id === memoId);
    if (memoIndex !== -1) {
        memoData[memoIndex] = {
            ...memoData[memoIndex],
            text: memoText,
            category: category,
            priority: priority,
            timeframe: timeframe
        };
        
        // Firebaseに保存
        if (currentUser) {
            await saveMemoToFirebase(memoData[memoIndex]);
        } else {
            localStorage.setItem('memos', JSON.stringify(memoData));
        }
        
        updateMemoDisplay();
        updateMemoStats();
        cancelEdit();
        
        log(`✅ メモ更新完了: ${memoText.substring(0, 30)}...`);
    }
};

// 編集キャンセル
function cancelEdit() {
    // フォームをクリア
    document.getElementById('newMemoText').value = '';
    document.getElementById('memoCategory').value = '';
    selectPriority('');
    selectTimeframe('');
    
    // ボタンを戻す
    const addButton = document.querySelector('[onclick^="updateMemo"]') || document.querySelector('button:contains("📝 メモを更新")');
    if (addButton) {
        addButton.textContent = '➕ メモを追加';
        addButton.onclick = addMemo;
    }
    
    // キャンセルボタンを削除
    const cancelButton = document.querySelector('[onclick="cancelEdit"]');
    if (cancelButton) {
        cancelButton.remove();
    }
    
    log('❌ メモ編集をキャンセル');
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