// 共通データ操作関数 (data-operations.js)
// 分析レポート Step 2-1 による共通ユーティリティ外部化

// データ保存
window.saveWeightData = async () => {
    if (!currentUser) {
        log('❌ ログインが必要です');
        return;
    }

    const date = document.getElementById('dateInput').value;
    const weight = document.getElementById('weightValue').value;
    const memo = document.getElementById('memoInput').value;

    if (!date || !weight) {
        log('❌ 日付と値を入力してください');
        return;
    }

    try {
        log('💾 データを保存中...');
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('ja-JP', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const weightData = {
            date: date,
            time: timeString,
            value: parseFloat(weight),
            timing: selectedTimingValue || '',
            clothing: {
                top: selectedTopValue || '',
                bottom: selectedBottomValue || ''
            },
            memo: memo || '',
            userEmail: currentUser.email,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            createdAt: now.toISOString()
        };

        if (window.editingEntryId) {
            // 編集モード: 既存データを更新
            const entryRef = database.ref(`users/${currentUser.uid}/weights/${window.editingEntryId}`);
            await entryRef.update({
                date: date,
                time: timeString,
                weight: parseFloat(weight),
                timing: selectedTimingValue || '',
                clothing: {
                    top: selectedTopValue || '',
                    bottom: selectedBottomValue || ''
                },
                memo: memo || '',
                userEmail: currentUser.email,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            });
        } else {
            // 新規保存モード
            const userRef = database.ref(`users/${currentUser.uid}/weights`);
            await userRef.push(weightData);
        }
        
        // 保存完了ログ（服装情報も含む）
        let logMessage;
        if (window.editingEntryId) {
            logMessage = `✏️ 更新完了: ${date} ${timeString} - ${weight}kg`;
        } else {
            logMessage = `✅ 保存完了: ${date} ${timeString} - ${weight}kg`;
        }
        if (selectedTimingValue) logMessage += ` (${selectedTimingValue})`;
        if (selectedTopValue || selectedBottomValue) {
            const clothingInfo = [selectedTopValue, selectedBottomValue].filter(Boolean).join(', ');
            logMessage += ` [${clothingInfo}]`;
        }
        log(logMessage);
        
        // 入力フィールドをクリア（体重は72.0に戻す）
        document.getElementById('weightValue').value = '72.0';
        document.getElementById('memoInput').value = '';
        document.getElementById('selectedTop').value = '';
        document.getElementById('selectedBottom').value = '';
        selectedTimingValue = '';
        selectedTopValue = '';
        selectedBottomValue = '';
        
        // 編集モードをリセット
        window.editingEntryId = null;
        document.querySelector('.save-button').textContent = '💾 保存';
        document.querySelector('.save-button').style.background = '#28a745';
        
        // 編集モードインジケーターを削除
        const editModeIndicator = document.getElementById('editModeIndicator');
        if (editModeIndicator) {
            editModeIndicator.remove();
        }
        
        // キャンセルボタンを削除
        const cancelButton = document.getElementById('cancelEditButton');
        if (cancelButton) {
            cancelButton.remove();
        }
        
        // ボタンのスタイルをリセット
        document.querySelectorAll('.timing-btn').forEach(btn => {
            btn.style.opacity = '0.7';
            btn.classList.remove('selected');
        });
        document.querySelectorAll('.clothing-btn').forEach(btn => {
            btn.style.opacity = '0.7';
            btn.style.transform = 'scale(1)';
        });
        
        // データを再読み込み
        loadUserWeightData(currentUser.uid);
    } catch (error) {
        log(`❌ 保存エラー: ${error.message}`);
    }
};

// 体重データ編集機能
window.editWeightEntry = async (entryId) => {
    if (!currentUser) {
        log('❌ ログインが必要です');
        return;
    }
    
    try {
        const entryRef = database.ref(`users/${currentUser.uid}/weights/${entryId}`);
        const snapshot = await entryRef.once('value');
        const entry = snapshot.val();
        
        if (!entry) {
            log('❌ 記録が見つかりません');
            return;
        }
        
        // フォームにデータを設定
        document.getElementById('dateInput').value = entry.date;
        document.getElementById('weightValue').value = entry.value || entry.weight;
        document.getElementById('memoInput').value = entry.memo || '';
        
        // タイミングを設定
        if (entry.timing) {
            selectTiming(entry.timing);
        }
        
        // 服装を設定
        if (entry.clothing && entry.clothing.top) {
            selectClothingTop(entry.clothing.top);
        }
        if (entry.clothing && entry.clothing.bottom) {
            selectClothingBottom(entry.clothing.bottom);
        }
        
        
        // 編集モードに切り替え
        window.editingEntryId = entryId;
        document.querySelector('.save-button').textContent = '✏️ 更新';
        document.querySelector('.save-button').style.background = '#ffc107';
        
        // 編集モードであることを明確に表示
        const editModeIndicator = document.getElementById('editModeIndicator');
        if (editModeIndicator) {
            editModeIndicator.remove();
        }
        const indicator = document.createElement('div');
        indicator.id = 'editModeIndicator';
        indicator.innerHTML = '✏️ <strong>編集モード</strong> - ' + entry.date + ' ' + (entry.value || entry.weight) + 'kgのデータを修正して更新ボタンを押してください';
        indicator.style.cssText = 'background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 10px; border-radius: 5px; margin-bottom: 15px; text-align: center; animation: fadeIn 0.3s;';
        document.querySelector('.save-button').parentNode.insertBefore(indicator, document.querySelector('.save-button'));
        
        // キャンセルボタンを追加
        const existingCancelButton = document.getElementById('cancelEditButton');
        if (existingCancelButton) {
            existingCancelButton.remove();
        }
        const cancelButton = document.createElement('button');
        cancelButton.id = 'cancelEditButton';
        cancelButton.innerHTML = '❌ キャンセル';
        cancelButton.onclick = cancelEdit;
        cancelButton.style.cssText = 'background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; margin-left: 10px;';
        document.querySelector('.save-button').parentNode.insertBefore(cancelButton, document.querySelector('.save-button').nextSibling);
        
        log(`✏️ 編集モード: ${entry.date} ${entry.value || entry.weight} のデータを編集中`);
        
        // ページトップにスクロール
        window.scrollTo(0, 0);
        
    } catch (error) {
        log(`❌ 編集エラー: ${error.message}`);
    }
};

// 編集キャンセル機能
window.cancelEdit = () => {
    // フォームをクリア
    document.getElementById('dateInput').value = '';
    document.getElementById('weightValue').value = '';
    document.getElementById('memoInput').value = '';
    
    // 選択状態をリセット
    selectedTimingValue = '';
    selectedTopValue = '';
    selectedBottomValue = '';
    
    // 編集モードをリセット
    window.editingEntryId = null;
    document.querySelector('.save-button').textContent = '💾 保存';
    document.querySelector('.save-button').style.background = '#28a745';
    
    // 編集モードインジケーターを削除
    const editModeIndicator = document.getElementById('editModeIndicator');
    if (editModeIndicator) {
        editModeIndicator.remove();
    }
    
    // キャンセルボタンを削除
    const cancelButton = document.getElementById('cancelEditButton');
    if (cancelButton) {
        cancelButton.remove();
    }
    
    // ボタンのスタイルをリセット
    document.querySelectorAll('.timing-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.classList.remove('selected');
    });
    document.querySelectorAll('.clothing-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    log('❌ 編集をキャンセルしました');
};

// データ削除
window.deleteWeightEntry = async (entryId) => {
    if (!currentUser) {
        log('❌ ログインが必要です');
        return;
    }
    
    if (!confirm('この記録を削除しますか？')) {
        return;
    }
    
    try {
        log(`🗑️ データ削除中: ${entryId}`);
        const entryRef = database.ref(`users/${currentUser.uid}/weights/${entryId}`);
        await entryRef.remove();
        log(`✅ 削除完了: ${entryId}`);
    } catch (error) {
        log(`❌ 削除エラー: ${error.message}`);
    }
};

// タイミング選択機能（改良版）
window.selectTiming = (timing) => {
    selectedTimingValue = timing;
    document.getElementById('selectedTiming').value = timing;
    
    // すべてのボタンから選択状態を削除
    document.querySelectorAll('.timing-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.opacity = '0.7';
    });
    
    // 選択されたボタンに選択状態を追加
    const selectedBtn = document.querySelector(`[data-timing="${timing}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        selectedBtn.style.opacity = '1';
    }
    
    log(`⏰ 測定タイミング選択: ${timing}`);
};

// 上半身服装選択機能
window.selectClothingTop = (clothing) => {
    selectedTopValue = clothing;
    const selectedTopElement = document.getElementById('selectedTop');
    if (selectedTopElement) {
        selectedTopElement.value = clothing;
    }
    
    // すべての上半身ボタンから選択状態を削除
    document.querySelectorAll('.clothing-btn[data-clothing-top]').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 選択されたボタンに選択状態を追加
    const selectedBtn = document.querySelector(`[data-clothing-top="${clothing}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.05)';
    }
    
    log(`👕 上半身選択: ${clothing}`);
};

// 下半身服装選択機能
window.selectClothingBottom = (clothing) => {
    selectedBottomValue = clothing;
    const selectedBottomElement = document.getElementById('selectedBottom');
    if (selectedBottomElement) {
        selectedBottomElement.value = clothing;
    }
    
    // すべての下半身ボタンから選択状態を削除
    document.querySelectorAll('.clothing-btn[data-clothing-bottom]').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 選択されたボタンに選択状態を追加
    const selectedBtn = document.querySelector(`[data-clothing-bottom="${clothing}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.05)';
    }
    
    log(`🩲 下半身選択: ${clothing}`);
};

// ログコピー機能（安全アクセス対応）
window.copyLogs = () => {
    const logArea = document.getElementById('logArea');
    if (!logArea) {
        console.log('⚠️ logArea要素が見つかりません');
        return;
    }
    const logText = logArea.innerText || logArea.textContent;
    navigator.clipboard.writeText(logText).then(() => {
        alert('✅ ログをコピーしました');
    }).catch(() => {
        // fallback
        const textArea = document.createElement('textarea');
        textArea.value = logText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('✅ ログをコピーしました');
    });
};

// デバッグ情報コピー機能
window.copyDebugInfo = () => {
    const debugInfo = `
=== 体重管理アプリ デバッグ情報 ===

【現在の状態】
- ログイン状態: ${currentUser ? '✅ 認証済み' : '❌ 未認証'}
- ユーザー情報: ${currentUser ? currentUser.email : 'なし'}
- 現在のタブ: ${currentTab}
- 編集モード: ${window.editingEntryId ? '✅ ON' : '❌ OFF'}

【選択状態】
- 測定タイミング: ${selectedTimingValue || '未選択'}
- 上半身: ${selectedTopValue || '未選択'}
- 下半身: ${selectedBottomValue || '未選択'}

【ブラウザ情報】
- User Agent: ${navigator.userAgent}
- URL: ${window.location.href}
- 画面サイズ: ${window.innerWidth} x ${window.innerHeight}

【Firebase設定】
- Project ID: ${typeof firebaseConfig !== 'undefined' ? firebaseConfig.projectId : 'undefined'}
- Database URL: ${typeof firebaseConfig !== 'undefined' ? firebaseConfig.databaseURL : 'undefined'}

【ログ】
${document.getElementById('logArea') ? document.getElementById('logArea').innerText : 'ログエリアが見つかりません'}

生成日時: ${new Date().toLocaleString('ja-JP')}
    `.trim();
    
    navigator.clipboard.writeText(debugInfo).then(() => {
        alert('✅ デバッグ情報をコピーしました');
    }).catch(() => {
        // fallback
        const textArea = document.createElement('textarea');
        textArea.value = debugInfo;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('✅ デバッグ情報をコピーしました');
    });
};