// 体重管理タブ個別機能
// 共通機能への依存: currentUser, database, log, firebase

// 体重管理専用変数（スコープ分離）
if (typeof window.WeightTab !== 'undefined') {
    // 既に読み込まれている場合はスキップ
    console.log('WeightTab already loaded, skipping...');
} else {
window.WeightTab = {
    selectedTimingValue: '',
    selectedTopValue: '',
    selectedBottomValue: '',
    weightChart: null,
    allWeightData: [],
    editingEntryId: null
};

// 体重管理専用のモード状態管理（グローバル変数を使用）
// 注意: currentMode と selectedTarget は index.html で既に定義済み

// カスタム項目の永続化機能
const WEIGHT_STORAGE_KEYS = {
    customTimings: 'weightApp_customTimings',
    customTops: 'weightApp_customTops',
    customBottoms: 'weightApp_customBottoms'
};

// 体重管理初期化
window.initWeightTab = () => {
    log('🏋️ 体重管理タブ初期化中...');
    
    // 既存の体重管理変数を移行
    if (typeof selectedTimingValue !== 'undefined') {
        WeightTab.selectedTimingValue = selectedTimingValue;
    }
    if (typeof selectedTopValue !== 'undefined') {
        WeightTab.selectedTopValue = selectedTopValue;
    }
    if (typeof selectedBottomValue !== 'undefined') {
        WeightTab.selectedBottomValue = selectedBottomValue;
    }
    if (typeof allWeightData !== 'undefined') {
        WeightTab.allWeightData = allWeightData;
    }
    if (typeof window.editingEntryId !== 'undefined') {
        WeightTab.editingEntryId = window.editingEntryId;
    }
    
    // カスタム項目復元
    loadCustomItems();
    
    // 初期データ読み込み
    if (currentUser) {
        loadUserWeightData(currentUser.uid);
    }
    
    log('✅ 体重管理タブ初期化完了');
};

// 体重データ保存
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
            timing: WeightTab.selectedTimingValue || '',
            clothing: {
                top: WeightTab.selectedTopValue || '',
                bottom: WeightTab.selectedBottomValue || ''
            },
            memo: memo || '',
            userEmail: currentUser.email,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            createdAt: now.toISOString()
        };

        if (WeightTab.editingEntryId) {
            // 編集モード: 既存データを更新
            const entryRef = database.ref(`users/${currentUser.uid}/weights/${WeightTab.editingEntryId}`);
            await entryRef.update({
                date: date,
                time: timeString,
                weight: parseFloat(weight),
                timing: WeightTab.selectedTimingValue || '',
                clothing: {
                    top: WeightTab.selectedTopValue || '',
                    bottom: WeightTab.selectedBottomValue || ''
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
        if (WeightTab.editingEntryId) {
            logMessage = `✏️ 更新完了: ${date} ${timeString} - ${weight}kg`;
        } else {
            logMessage = `✅ 保存完了: ${date} ${timeString} - ${weight}kg`;
        }
        if (WeightTab.selectedTimingValue) logMessage += ` (${WeightTab.selectedTimingValue})`;
        if (WeightTab.selectedTopValue || WeightTab.selectedBottomValue) {
            const clothingInfo = [WeightTab.selectedTopValue, WeightTab.selectedBottomValue].filter(Boolean).join(', ');
            logMessage += ` [${clothingInfo}]`;
        }
        log(logMessage);
        
        // 入力フィールドをクリア（体重は72.0に戻す）
        document.getElementById('weightValue').value = '72.0';
        document.getElementById('memoInput').value = '';
        document.getElementById('selectedTop').value = '';
        document.getElementById('selectedBottom').value = '';
        WeightTab.selectedTimingValue = '';
        WeightTab.selectedTopValue = '';
        WeightTab.selectedBottomValue = '';
        
        // 編集モードをリセット
        WeightTab.editingEntryId = null;
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
        
        // データ再読み込み
        if (currentUser) {
            loadUserWeightData(currentUser.uid);
        }
        
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
        WeightTab.editingEntryId = entryId;
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
    WeightTab.selectedTimingValue = '';
    WeightTab.selectedTopValue = '';
    WeightTab.selectedBottomValue = '';
    
    // 編集モードをリセット
    WeightTab.editingEntryId = null;
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

// 体重データ削除
window.deleteWeightEntry = async (entryId) => {
    if (!currentUser) {
        log('❌ ログインが必要です');
        return;
    }
    
    if (!confirm('この記録を削除しますか？')) {
        return;
    }
    
    try {
        const entryRef = database.ref(`users/${currentUser.uid}/weights/${entryId}`);
        await entryRef.remove();
        
        log('🗑️ 体重記録を削除しました');
        
        if (currentUser) {
            loadUserWeightData(currentUser.uid);
        }
        
    } catch (error) {
        log(`❌ 削除エラー: ${error.message}`);
    }
};

// タブが読み込まれた時の初期化
document.addEventListener('DOMContentLoaded', function() {
    if (window.initWeightTab) {
        window.initWeightTab();
    }
});

// 体重管理タブがアクティブになった時の処理
if (typeof window !== 'undefined') {
    window.onWeightTabActivated = () => {
        initWeightTab();
    };
}

} // WeightTab 重複チェック終了