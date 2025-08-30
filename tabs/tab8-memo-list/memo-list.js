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
        id: parseInt(Date.now().toString() + Math.floor(Math.random() * 100).toString()), // 文字列連結で確実に整数
        text: memoText,
        category: category,
        priority: priority,
        timeframe: timeframe,
        timestamp: now.toISOString(),
        date: now.toLocaleDateString('ja-JP'),
        time: now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        parentId: null, // 親タスクID（細分化用）
        level: 0, // 階層レベル（0=親、1=子、2=孫...）
        deadline: null // 締切日（YYYY-MM-DD形式）
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
    
    // 実際の値を詳細確認
    console.log('🔍 FirebaseパスのID詳細調査:');
    console.log('  - memo.id の値:', memo.id);
    console.log('  - memo.id の型:', typeof memo.id);  
    console.log('  - memo.id を文字列化:', String(memo.id));
    console.log('  - 小数点が含まれているか:', String(memo.id).includes('.'));
    console.log('  - 構築されるパス:', `users/${currentUser.uid}/memos/${memo.id}`);
    
    // IDを強制的に整数の文字列に変換してからパスを作る
    const cleanId = String(memo.id).split('.')[0]; // 小数点以下を切り捨て
    console.log('  - 清浄化後のID:', cleanId);
    console.log('  - 清浄化後のパス:', `users/${currentUser.uid}/memos/${cleanId}`);
    
    console.log('💾 Firebaseに保存するメモID:', {
        originalId: memo.id,
        cleanId: cleanId,
        type: typeof memo.id,
        isInteger: Number.isInteger(memo.id),
        path: `users/${currentUser.uid}/memos/${cleanId}`
    });
    
    // 清浄化されたIDを使用してFirebaseに保存
    firebase.database().ref(`users/${currentUser.uid}/memos/${cleanId}`).set({
        ...memo,
        id: cleanId // IDも整数文字列に更新
    })
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
        
        // 締切バッジ
        const deadlineBadge = memo.deadline ? 
            `<span style="background: ${getDeadlineColor(memo.deadline)}; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-right: 5px;">📅 ${memo.deadline}</span>` : '';
        
        // テキストを1行に制限（モバイル対応）
        const truncatedText = memo.text.length > 50 ? memo.text.substring(0, 50) + '...' : memo.text;
        
        // 階層表示用のインデントと境界線
        const indent = memo.level ? '　'.repeat(memo.level) + '└ ' : '';
        const borderLeft = memo.level > 0 ? `border-left: 3px solid ${getPriorityColor(memo.priority || 'C')}; margin-left: ${memo.level * 15}px; padding-left: 8px;` : '';
        
        return `
            <div class="memo-item" style="${borderLeft}">
                <div class="memo-header">
                    <div style="flex: 1;">
                        ${indent}${priorityBadge}${timeframeBadge}${deadlineBadge}${categoryBadge}
                        <small class="memo-date">${memo.date} ${memo.time}</small>
                    </div>
                    <div style="display: flex; gap: 2px;">
                        <button onclick="editMemo(${memo.id})" style="background: #17a2b8; color: white; border: none; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-size: 9px;">✏️</button>
                        ${(memo.level || 0) < 3 ? `<button onclick="subdivideMemo(${memo.id})" style="background: #28a745; color: white; border: none; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-size: 9px;">🔀</button>` : ''}
                        <button onclick="setDeadline(${memo.id})" style="background: #fd7e14; color: white; border: none; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-size: 9px;">📅</button>
                        <button onclick="deleteMemo(${memo.id})" class="memo-delete-btn" style="padding: 2px 5px; font-size: 9px;">🗑️</button>
                    </div>
                </div>
                <div class="memo-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; -webkit-tap-highlight-color: rgba(0,0,0,0.1); user-select: none; touch-action: manipulation;" onclick="handleMemoClick(event, ${memo.id})">
                    <span id="memo-text-${memo.id}">${indent}${truncatedText}</span>
                    ${memo.text.length > 50 ? '<small style="color: #007bff; margin-left: 5px;">[タップで詳細]</small>' : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// デバイス判定とクリックハンドラー統一
window.handleMemoClick = (event, memoId) => {
    console.log(`🖱️ handleMemoClick called for memo ${memoId}, event type: ${event?.type || 'unknown'}`);
    
    // イベント伝播停止
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }
    
    // 重複実行防止（より強力に）
    const clickKey = `memo-click-${memoId}`;
    if (window[clickKey]) {
        console.log(`⚠️ Duplicate click prevented for memo ${memoId}`);
        return;
    }
    window[clickKey] = true;
    
    setTimeout(() => {
        delete window[clickKey];
    }, 800); // より長い時間に
    
    toggleMemoDetail(memoId);
};

// メモ詳細表示切り替え
window.toggleMemoDetail = (memoId) => {
    console.log(`📝 toggleMemoDetail called for memo ${memoId}`);
    
    const memo = memoData.find(m => m.id === memoId);
    if (!memo) {
        console.log(`❌ Memo not found: ${memoId}`);
        return;
    }
    
    const textElement = document.getElementById(`memo-text-${memoId}`);
    if (!textElement) {
        console.log(`❌ Text element not found: memo-text-${memoId}`);
        return;
    }
    
    const parentDiv = textElement.parentElement;
    
    // インデント部分を取得
    const indent = memo.level ? '　'.repeat(memo.level) + '└ ' : '';
    
    // 現在の表示状態をチェック（インデント部分を除いて）
    const currentTextWithoutIndent = textElement.textContent.replace(indent, '');
    const isExpanded = currentTextWithoutIndent === memo.text;
    
    console.log(`📝 Current text: "${currentTextWithoutIndent.substring(0, 30)}..."`)
    console.log(`📝 Full text: "${memo.text.substring(0, 30)}..."`)
    console.log(`📝 Is expanded: ${isExpanded}`);
    
    if (isExpanded) {
        // 詳細表示中 -> 省略表示に戻す
        const truncatedText = memo.text.length > 50 ? memo.text.substring(0, 50) + '...' : memo.text;
        textElement.textContent = indent + truncatedText;
        parentDiv.style.whiteSpace = 'nowrap';
        parentDiv.style.overflow = 'hidden';
        parentDiv.style.textOverflow = 'ellipsis';
        console.log(`📝 Collapsed to: "${(indent + truncatedText).substring(0, 30)}..."`);
    } else {
        // 省略表示中 -> 詳細表示
        textElement.textContent = indent + memo.text;
        parentDiv.style.whiteSpace = 'normal';
        parentDiv.style.overflow = 'visible';
        parentDiv.style.textOverflow = 'initial';
        console.log(`📝 Expanded to: "${(indent + memo.text).substring(0, 30)}..."`);
    }
};

// メモ細分化機能
window.subdivideMemo = (memoId) => {
    console.log('🔀 細分化対象ID:', memoId, 'type:', typeof memoId);
    console.log('🔀 現在のmemoData IDs:', memoData.map(m => ({id: m.id, type: typeof m.id, text: m.text.substring(0, 20)})));
    
    // IDの型変換を試行（数値と文字列の両方でマッチ）
    const memo = memoData.find(m => m.id == memoId || String(m.id) === String(memoId));
    
    if (!memo) {
        console.log('❌ メモが見つからない - ID:', memoId);
        alert(`親タスクが見つかりません\nID: ${memoId}\n利用可能なID: ${memoData.map(m => m.id).join(', ')}`);
        return;
    }
    
    console.log('✅ 親タスク発見:', memo.text.substring(0, 30));
    
    // 4階層制限チェック
    const currentLevel = memo.level || 0;
    if (currentLevel >= 3) {
        alert('細分化は4階層（レベル3）まで可能です。\nこれ以上細分化できません。');
        return;
    }
    
    const subdivisionText = prompt(`【${memo.text.substring(0, 30)}...】を細分化します。\n\n現在のレベル: ${currentLevel} → ${currentLevel + 1}\n\n細分化したいタスクを入力してください：`);
    
    if (!subdivisionText || !subdivisionText.trim()) {
        return;
    }
    
    const now = new Date();
    const childMemo = {
        id: parseInt(Date.now().toString() + Math.floor(Math.random() * 1000).toString()), // 文字列連結で確実に整数
        text: subdivisionText.trim(),
        category: memo.category, // 親の属性を継承
        priority: memo.priority,
        timeframe: 'すぐ', // 細分化したタスクは基本的に短期
        timestamp: now.toISOString(),
        date: now.toLocaleDateString('ja-JP'),
        time: now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        parentId: memo.id, // 親タスクID
        level: (memo.level || 0) + 1, // 一階層下
        deadline: null // 締切は後で設定
    };
    
    console.log('🔀 細分化実行:', {
        parent: memo.text.substring(0, 20),
        child: childMemo.text,
        parentId: childMemo.parentId,
        level: childMemo.level,
        childId: childMemo.id,
        childIdType: typeof childMemo.id,
        isInteger: Number.isInteger(childMemo.id)
    });
    
    // 親タスクの直後に挿入
    const parentIndex = memoData.findIndex(m => m.id === memoId);
    if (parentIndex !== -1) {
        memoData.splice(parentIndex + 1, 0, childMemo);
        console.log('🔀 子タスク挿入位置:', parentIndex + 1);
    } else {
        memoData.unshift(childMemo);
        console.log('🔀 子タスクを先頭に追加');
    }
    
    console.log('🔀 現在のmemoData件数:', memoData.length);
    
    // Firebaseに保存
    if (currentUser) {
        saveMemoToFirebase(childMemo);
        console.log('🔀 Firebaseに保存実行 - リアルタイムリスナーが自動更新');
    } else {
        localStorage.setItem('memos', JSON.stringify(memoData));
        console.log('🔀 LocalStorageに保存実行');
        updateMemoDisplay();
        updateMemoStats();
    }
    
    log(`🔀 タスク細分化完了: ${memo.text.substring(0, 20)}... → ${subdivisionText.substring(0, 20)}...`);
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
    console.log('✏️ 編集対象ID:', memoId, 'type:', typeof memoId);
    
    // IDの型変換を試行（数値と文字列の両方でマッチ）
    const memo = memoData.find(m => m.id == memoId || String(m.id) === String(memoId));
    
    if (!memo) {
        console.log('❌ 編集対象メモが見つからない - ID:', memoId);
        alert(`編集対象が見つかりません\nID: ${memoId}`);
        return;
    }
    
    console.log('✅ 編集対象発見:', memo.text.substring(0, 30));
    
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
    console.log('🗑️ 削除対象ID:', memoId, 'type:', typeof memoId);
    
    // IDの型変換を試行（数値と文字列の両方でマッチ）
    const memo = memoData.find(m => m.id == memoId || String(m.id) === String(memoId));
    
    if (!memo) {
        console.log('❌ 削除対象メモが見つからない - ID:', memoId);
        alert(`削除対象が見つかりません\nID: ${memoId}`);
        return;
    }
    
    if (!confirm(`このメモを削除しますか？\n\n${memo.text.substring(0, 50)}...`)) {
        return;
    }
    
    console.log('✅ 削除実行:', memo.text.substring(0, 30));
    
    // IDの型を考慮してフィルタリング
    memoData = memoData.filter(m => m.id != memoId && String(m.id) !== String(memoId));
    
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

// 階層対応メモソート関数
function sortMemosWithHierarchy(memos) {
    console.log('🔄 階層ソート開始 - メモ数:', memos.length);
    
    // レベル0（親）メモを時系列順でソート
    const parentMemos = memos.filter(m => !m.parentId && (m.level === undefined || m.level === 0)).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    console.log('📊 親メモ数:', parentMemos.length);
    
    const result = [];
    
    // 再帰的に子メモを追加する関数
    function addChildrenRecursively(parentId, currentLevel) {
        // ID型変換対応（数値と文字列の両方でマッチ）
        const children = memos.filter(m => {
            const match = (m.parentId == parentId || String(m.parentId) === String(parentId)) && (m.level === currentLevel || (m.level === undefined && currentLevel === 1));
            return match;
        }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        console.log(`📝 レベル${currentLevel}の子メモ（親ID:${parentId}）: ${children.length}件`);
        
        children.forEach(child => {
            result.push(child);
            // さらに子がいる場合は再帰的に追加（最大4階層まで）
            if (currentLevel < 3) {
                addChildrenRecursively(child.id, currentLevel + 1);
            }
        });
    }
    
    // 各親メモとその子メモを順序通りに配置
    parentMemos.forEach(parent => {
        result.push(parent);
        addChildrenRecursively(parent.id, 1);
    });
    
    console.log('✅ 階層ソート完了 - 結果数:', result.length);
    return result;
}

// メモデータを読み込み
function loadMemoData() {
    if (currentUser) {
        // Firebaseから読み込み
        firebase.database().ref(`users/${currentUser.uid}/memos`).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // 階層表示対応のソート：親→子の順序を保持しつつ、時系列順
                const allMemos = Object.values(data);
                memoData = sortMemosWithHierarchy(allMemos);
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
            const allMemos = JSON.parse(stored);
            memoData = sortMemosWithHierarchy(allMemos);
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

// 締切色取得関数
function getDeadlineColor(deadline) {
    if (!deadline) return '#6c757d';
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#dc3545'; // 過ぎた（赤）
    if (diffDays === 0) return '#fd7e14'; // 今日（オレンジ）
    if (diffDays <= 3) return '#ffc107'; // 3日以内（黄）
    if (diffDays <= 7) return '#28a745'; // 1週間以内（緑）
    return '#17a2b8'; // それ以上（青）
}

// 締切設定機能
window.setDeadline = async (memoId) => {
    console.log('📅 締切設定対象ID:', memoId, 'type:', typeof memoId);
    
    // IDの型変換を試行（数値と文字列の両方でマッチ）
    const memo = memoData.find(m => m.id == memoId || String(m.id) === String(memoId));
    
    if (!memo) {
        console.log('❌ 締切設定対象メモが見つからない - ID:', memoId);
        alert(`締切設定対象が見つかりません\nID: ${memoId}`);
        return;
    }
    
    console.log('✅ 締切設定対象発見:', memo.text.substring(0, 30));
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentDeadline = memo.deadline || '';
    
    const newDeadline = prompt(
        `【${memo.text.substring(0, 30)}...】の締切を設定\n\n` +
        `現在の締切: ${currentDeadline || '未設定'}\n\n` +
        `新しい締切を入力してください（YYYY-MM-DD形式）:\n` +
        `例: ${tomorrowStr}（明日）`,
        currentDeadline || tomorrowStr  // デフォルトを明日にする
    );
    
    if (newDeadline === null) return; // キャンセル
    
    // 締切をクリア
    if (newDeadline.trim() === '') {
        memo.deadline = null;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(newDeadline.trim())) {
        // 日付形式チェック
        memo.deadline = newDeadline.trim();
    } else {
        alert('日付形式が正しくありません。YYYY-MM-DD形式で入力してください。');
        return;
    }
    
    // Firebaseに保存
    if (currentUser) {
        await saveMemoToFirebase(memo);
    } else {
        localStorage.setItem('memos', JSON.stringify(memoData));
    }
    
    updateMemoDisplay();
    
    const deadlineText = memo.deadline || '締切なし';
    log(`📅 締切設定: ${memo.text.substring(0, 20)}... → ${deadlineText}`);
};