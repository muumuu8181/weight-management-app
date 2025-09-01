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
    
    // 今日の日付と体重デフォルト値を設定（タイムゾーン考慮）
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    const dateInput = document.getElementById('dateInput');
    const weightInput = document.getElementById('weightValue');
    if (dateInput) dateInput.value = todayString;
    if (weightInput && typeof APP_CONFIG !== 'undefined' && APP_CONFIG.defaults) {
        weightInput.value = APP_CONFIG.defaults.weight.toString();
    } else if (weightInput) {
        weightInput.value = '72.0'; // フォールバック値
    }
    
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
    if (typeof loadCustomItems === 'function') {
        loadCustomItems();
    }
    
    // デフォルト服装選択: 上=なし, 下=トランクス
    if (typeof window.selectClothingTop === 'function') {
        window.selectClothingTop('なし');
    }
    if (typeof window.selectClothingBottom === 'function') {
        window.selectClothingBottom('トランクス');
    }
    
    // 初期データ読み込み
    if (currentUser && typeof loadUserWeightData === 'function') {
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

// ========================================
// 以下、index.htmlから移動された体重管理固有の関数群
// ========================================

// カスタム項目をlocalStorageに保存
async function saveCustomItems() {
    const customTimings = Array.from(document.querySelectorAll('.timing-btn:not([data-timing="起床後"]):not([data-timing="トイレ前"]):not([data-timing="トイレ後"]):not([data-timing="風呂前"]):not([data-timing="風呂後"]):not([data-timing="食事前"]):not([data-timing="食事後"])'))
        .map(btn => ({
            text: btn.getAttribute('data-timing'),
            color: btn.style.background
        }));
    
    const customTops = Array.from(document.querySelectorAll('.clothing-btn[data-clothing-top]:not([data-clothing-top="なし"]):not([data-clothing-top="下着シャツ"]):not([data-clothing-top="ワイシャツ"])'))
        .map(btn => ({
            text: btn.getAttribute('data-clothing-top'),
            color: btn.style.background
        }));
    
    const customBottoms = Array.from(document.querySelectorAll('.clothing-btn[data-clothing-bottom]:not([data-clothing-bottom="なし"]):not([data-clothing-bottom="トランクス"]):not([data-clothing-bottom="ハーフパンツ"])'))
        .map(btn => ({
            text: btn.getAttribute('data-clothing-bottom'),
            color: btn.style.background
        }));

    log(`💾 保存対象: ${customTimings.length}個のタイミング、${customTops.length}個の上半身、${customBottoms.length}個の下半身`);

    // Firebase保存
    if (currentUser) {
        try {
            const customItemsRef = database.ref(`users/${currentUser.uid}/customItems`);
            await customItemsRef.set({
                timings: customTimings,
                tops: customTops,
                bottoms: customBottoms
            });
            log('✅ カスタム項目をFirebaseに保存完了');
        } catch (error) {
            log(`❌ Firebase保存エラー: ${error.message}`);
            // Firebase保存に失敗した場合でもlocalStorageには保存
        }
    } else {
        log('⚠️ Firebase保存スキップ: ユーザー未ログイン');
    }
    
    // localStorage にもバックアップ保存
    try {
        localStorage.setItem(WEIGHT_STORAGE_KEYS.customTimings, JSON.stringify(customTimings));
        localStorage.setItem(WEIGHT_STORAGE_KEYS.customTops, JSON.stringify(customTops));
        localStorage.setItem(WEIGHT_STORAGE_KEYS.customBottoms, JSON.stringify(customBottoms));
        log('✅ localStorage にもバックアップ保存完了');
    } catch (error) {
        log(`❌ localStorage保存エラー: ${error.message}`);
    }
}

// グローバル変数: loadCustomItems実行フラグ
let isLoadCustomItemsExecuted = false;

// 固定カスタム項目を強制設定（安定表示用）
async function setFixedCustomItems() {
    const fixedTimings = [
        {text: "帰宅後", color: "#6c757d"},
        {text: "何となく", color: "#6c757d"},
        {text: "帰宅:食事無し", color: "#6c757d"},
        {text: "ある程度飲んだ後", color: "#6c757d"},
        {text: "帰宅:食事有+半日(7時間以上)", color: "#6c757d"},
        {text: "飲んだ後", color: "#6c757d"},
        {text: "トイレ(L)後", color: "#6c757d"}
    ];
    
    if (currentUser) {
        try {
            const customItemsRef = database.ref(`users/${currentUser.uid}/customItems`);
            await customItemsRef.set({
                timings: fixedTimings,
                tops: [],
                bottoms: []
            });
            log('✅ 固定カスタム項目をFirebaseに設定完了');
            
            // 実行フラグリセットして再読み込み
            isLoadCustomItemsExecuted = false;
            location.reload(); // ページリロードで確実に反映
        } catch (error) {
            log(`❌ 固定設定エラー: ${error.message}`);
        }
    }
}

// カスタム項目リセット機能（重複解決用）
async function resetCustomItems() {
    if (currentUser) {
        try {
            // Firebaseから削除
            const customItemsRef = database.ref(`users/${currentUser.uid}/customItems`);
            await customItemsRef.remove();
            
            // localStorageからも削除
            localStorage.removeItem(WEIGHT_STORAGE_KEYS.customTimings);
            localStorage.removeItem(WEIGHT_STORAGE_KEYS.customTops);
            localStorage.removeItem(WEIGHT_STORAGE_KEYS.customBottoms);
            
            // 画面からカスタムボタン削除
            document.querySelectorAll('.timing-btn[data-original-color]').forEach(btn => btn.remove());
            document.querySelectorAll('.clothing-btn[data-original-color]').forEach(btn => btn.remove());
            
            // 実行フラグリセット
            isLoadCustomItemsExecuted = false;
            
            log('✅ カスタム項目完全リセット完了');
            alert('カスタム項目をリセットしました。追加ボタンで再作成してください。');
        } catch (error) {
            log(`❌ リセットエラー: ${error.message}`);
        }
    }
}

// カスタム項目をFirebase優先で復元（完全重複防止機能付き）
async function loadCustomItems() {
    // 実行制御: 既に実行済みの場合は即座にreturn
    if (isLoadCustomItemsExecuted) {
        log('⚠️ カスタム項目復元スキップ: 既に実行済み');
        return;
    }
    
    // 既存のカスタムボタンを完全削除（最優先実行）
    const existingTimingButtons = document.querySelectorAll('.timing-btn[data-original-color]');
    const existingClothingButtons = document.querySelectorAll('.clothing-btn[data-original-color]');
    
    existingTimingButtons.forEach(btn => btn.remove());
    existingClothingButtons.forEach(btn => btn.remove());
    
    log(`🧹 既存カスタムボタン完全削除: タイミング${existingTimingButtons.length}個、服装${existingClothingButtons.length}個`);
    
    // 実行フラグをtrueに設定
    isLoadCustomItemsExecuted = true;
    
    let timings = [];
    let tops = [];
    let bottoms = [];
    
    // まずFirebaseから取得を試行
    if (currentUser) {
        try {
            const customItemsRef = database.ref(`users/${currentUser.uid}/customItems`);
            const snapshot = await customItemsRef.once('value');
            if (snapshot.val()) {
                const data = snapshot.val();
                timings = data.timings || [];
                tops = data.tops || [];
                bottoms = data.bottoms || [];
                log(`🔍 Firebase取得成功: タイミング${timings.length}個、上半身${tops.length}個、下半身${bottoms.length}個`);
            } else {
                log('🔍 Firebase確認: customItems=なし（初回またはデータなし）');
            }
        } catch (error) {
            log(`❌ Firebase読み込みエラー: ${error.message}`);
        }
    } else {
        log('⚠️ Firebase読み込みスキップ: ユーザー未ログイン');
    }
    
    // Firebaseにデータがない場合はlocalStorageから取得（フォールバック）
    if (timings.length === 0) {
        const savedTimings = localStorage.getItem(WEIGHT_STORAGE_KEYS.customTimings);
        if (savedTimings) {
            try {
                timings = JSON.parse(savedTimings);
                log(`🔄 localStorage fallback: タイミング${timings.length}個を復元`);
            } catch (error) {
                log(`❌ localStorage解析エラー（タイミング）: ${error.message}`);
                timings = [];
            }
        }
    }
    
    if (tops.length === 0) {
        const savedTops = localStorage.getItem(WEIGHT_STORAGE_KEYS.customTops);
        if (savedTops) {
            try {
                tops = JSON.parse(savedTops);
                log(`🔄 localStorage fallback: 上半身${tops.length}個を復元`);
            } catch (error) {
                log(`❌ localStorage解析エラー（上半身）: ${error.message}`);
                tops = [];
            }
        }
    }
    
    if (bottoms.length === 0) {
        const savedBottoms = localStorage.getItem(WEIGHT_STORAGE_KEYS.customBottoms);
        if (savedBottoms) {
            try {
                bottoms = JSON.parse(savedBottoms);
                log(`🔄 localStorage fallback: 下半身${bottoms.length}個を復元`);
            } catch (error) {
                log(`❌ localStorage解析エラー（下半身）: ${error.message}`);
                bottoms = [];
            }
        }
    }

    // タイミング項目の復元（削除ボタン付き）
    if (timings.length > 0) {
        const container = document.getElementById('timingButtons');
        if (container) {
            timings.forEach(item => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'timing-btn';
                button.setAttribute('data-timing', item.text);
                button.onclick = () => selectTiming(item.text);
                // 文字数に応じてボタン幅を調整
                let buttonWidth = 'auto';
                let textAlign = 'center';
                if (item.text.length > 15) {
                    buttonWidth = '200px'; // 3ボタン分
                    textAlign = 'left';
                } else if (item.text.length > 8) {
                    buttonWidth = '140px'; // 2ボタン分
                    textAlign = 'left';
                }
                button.style.cssText = `background: ${item.color}; color: white; opacity: 0.7; position: relative; padding-right: 35px; width: ${buttonWidth}; flex-shrink: 0; text-align: ${textAlign}; padding-left: 10px;`;
                button.setAttribute('data-original-color', item.color);
                
                // innerHTML を使用して削除ボタン付きの内容を設定
                button.innerHTML = `⏰ ${item.text} <span style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.3); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; color: white;" onclick="deleteCustomTiming('${item.text}', event)">✕</span>`;
                
                container.appendChild(button);
            });
            log(`✅ タイミング項目復元完了（削除ボタン付き）: ${timings.length}個`);
        } else {
            log('❌ timingButtons要素が見つかりません');
        }
    }

    // 上半身項目の復元（削除ボタン付き）
    if (tops.length > 0) {
        const container = document.getElementById('topClothingButtons');
        if (container) {
            tops.forEach(item => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'clothing-btn';
                button.setAttribute('data-clothing-top', item.text);
                button.onclick = () => selectClothingTop(item.text);
                // 文字数に応じてボタン幅を調整
                let buttonWidth = 'auto';
                let textAlign = 'center';
                if (item.text.length > 15) {
                    buttonWidth = '200px'; // 3ボタン分
                    textAlign = 'left';
                } else if (item.text.length > 8) {
                    buttonWidth = '140px'; // 2ボタン分
                    textAlign = 'left';
                }
                button.style.cssText = `background: ${item.color}; color: white; opacity: 0.7; position: relative; padding-right: 35px; width: ${buttonWidth}; flex-shrink: 0; text-align: ${textAlign}; padding-left: 10px;`;
                button.setAttribute('data-original-color', item.color);
                
                // innerHTML を使用して削除ボタン付きの内容を設定
                button.innerHTML = `👔 ${item.text} <span style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.3); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; color: white;" onclick="deleteCustomTop('${item.text}', event)">✕</span>`;
                
                container.appendChild(button);
            });
            log(`✅ 上半身項目復元完了（削除ボタン付き）: ${tops.length}個`);
        } else {
            log('❌ topClothingButtons要素が見つかりません');
        }
    }

    // 下半身項目の復元（削除ボタン付き）
    if (bottoms.length > 0) {
        const container = document.getElementById('bottomClothingButtons');
        if (container) {
            bottoms.forEach(item => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'clothing-btn';
                button.setAttribute('data-clothing-bottom', item.text);
                button.onclick = () => selectClothingBottom(item.text);
                // 文字数に応じてボタン幅を調整
                let buttonWidth = 'auto';
                let textAlign = 'center';
                if (item.text.length > 15) {
                    buttonWidth = '200px'; // 3ボタン分
                    textAlign = 'left';
                } else if (item.text.length > 8) {
                    buttonWidth = '140px'; // 2ボタン分
                    textAlign = 'left';
                }
                button.style.cssText = `background: ${item.color}; color: white; opacity: 0.7; position: relative; padding-right: 35px; width: ${buttonWidth}; flex-shrink: 0; text-align: ${textAlign}; padding-left: 10px;`;
                button.setAttribute('data-original-color', item.color);
                
                // innerHTML を使用して削除ボタン付きの内容を設定
                button.innerHTML = `👖 ${item.text} <span style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.3); width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; color: white;" onclick="deleteCustomBottom('${item.text}', event)">✕</span>`;
                
                container.appendChild(button);
            });
            log(`✅ 下半身項目復元完了（削除ボタン付き）: ${bottoms.length}個`);
        } else {
            log('❌ bottomClothingButtons要素が見つかりません');
        }
    }
    
    // iOS/iPhone向け自動移行機能
    await migrateLocalStorageToFirebase();
}

// iPhone→Firebase移行機能（初回ログイン時のデータ移行）
async function migrateLocalStorageToFirebase() {
    // ログインしていない場合はスキップ
    if (!currentUser) {
        return;
    }
    
    // 移行完了フラグをチェック（ユーザー毎）
    const migrationKey = `migration_completed_${currentUser.uid}`;
    const migrationCompleted = localStorage.getItem(migrationKey);
    
    if (migrationCompleted === 'true') {
        log('✅ 移行済み: このユーザーのlocalStorage→Firebase移行は完了済み');
        return;
    }
    
    try {
        // localStorageからデータを取得
        const localTimings = localStorage.getItem(WEIGHT_STORAGE_KEYS.customTimings);
        const localTops = localStorage.getItem(WEIGHT_STORAGE_KEYS.customTops);
        const localBottoms = localStorage.getItem(WEIGHT_STORAGE_KEYS.customBottoms);
        
        let hasLocalData = false;
        let migrationData = {
            timings: [],
            tops: [],
            bottoms: []
        };
        
        // ローカルデータの解析・準備
        if (localTimings) {
            try {
                migrationData.timings = JSON.parse(localTimings);
                hasLocalData = true;
                log(`📱 移行データ準備: タイミング${migrationData.timings.length}個`);
            } catch (error) {
                log(`❌ タイミングデータ解析エラー: ${error.message}`);
            }
        }
        
        if (localTops) {
            try {
                migrationData.tops = JSON.parse(localTops);
                hasLocalData = true;
                log(`📱 移行データ準備: 上半身${migrationData.tops.length}個`);
            } catch (error) {
                log(`❌ 上半身データ解析エラー: ${error.message}`);
            }
        }
        
        if (localBottoms) {
            try {
                migrationData.bottoms = JSON.parse(localBottoms);
                hasLocalData = true;
                log(`📱 移行データ準備: 下半身${migrationData.bottoms.length}個`);
            } catch (error) {
                log(`❌ 下半身データ解析エラー: ${error.message}`);
            }
        }
        
        // ローカルデータがあり、かつFirebaseにデータが無い場合のみ移行実行
        if (hasLocalData) {
            const customItemsRef = database.ref(`users/${currentUser.uid}/customItems`);
            const snapshot = await customItemsRef.once('value');
            
            if (!snapshot.val()) {
                // Firebaseにデータが無い場合のみ移行実行
                await customItemsRef.set(migrationData);
                log(`🚀 localStorage→Firebase移行完了: タイミング${migrationData.timings.length}個、上半身${migrationData.tops.length}個、下半身${migrationData.bottoms.length}個`);
                
                // 移行完了フラグを設定
                localStorage.setItem(migrationKey, 'true');
                log('✅ 移行完了フラグ設定済み');
            } else {
                log('ℹ️ Firebase側にデータ存在 - 移行スキップ');
                // Firebaseにデータがある場合も移行完了とマーク
                localStorage.setItem(migrationKey, 'true');
            }
        } else {
            log('ℹ️ ローカルデータなし - 移行スキップ');
            // ローカルデータが無い場合も移行完了とマーク
            localStorage.setItem(migrationKey, 'true');
        }
        
    } catch (error) {
        log(`❌ 移行処理エラー: ${error.message}`);
        // エラーが発生した場合は移行フラグを設定せず、次回再試行
    }
}

// 統一モード制御機能
window.setMode = (mode) => {
    currentMode = mode;
    updateModeUI();
    
    // モード変更時の表示更新
    if (mode === 'delete' && selectedTarget) {
        updateDeleteModeDisplay();
    } else if (mode !== 'delete') {
        restoreNormalDisplay();
    }
    
    log(`🔧 モード変更: ${mode === 'normal' ? '通常' : mode === 'add' ? '追加' : '削除'}モード`);
};

// 対象選択機能（統一版）
window.selectTarget = (target) => {
    selectedTarget = target;
    updateTargetUI();
    log(`🎯 対象選択: ${target === 'timing' ? 'タイミング' : target === 'top' ? '上半身' : '下半身'}`);
    
    // モードに応じて処理実行
    handleModeAction();
    
    // 削除モード時はガイダンス更新
    if (currentMode === 'delete') {
        updateDeleteModeGuidance();
    }
};

// モードに応じた処理実行
function handleModeAction() {
    if (currentMode === 'add' && selectedTarget) {
        // 追加モード: 統一入力フィールド表示
        showUnifiedAddInput();
    } else if (currentMode === 'delete' && selectedTarget) {
        // 削除モード: カスタム項目の表示変更
        updateDeleteModeDisplay();
    }
}

// 統一追加入力表示
function showUnifiedAddInput() {
    const inputArea = document.getElementById('unifiedAddInput');
    
    // 元の入力フォームに復元
    inputArea.innerHTML = `
        <div style="margin-bottom: 5px;">
            <span style="font-size: 11px; color: #155724; font-weight: bold;">✨ 新規項目を追加</span>
        </div>
        <div style="display: flex; gap: 3px; align-items: center;">
            <input type="text" id="unifiedAddText" placeholder="項目名を入力" style="flex: 1; padding: 4px 8px; border: 1px solid #28a745; border-radius: 3px; font-size: 11px;">
            <button onclick="executeAdd()" style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">✓ 追加</button>
            <button onclick="cancelAdd()" style="background: #6c757d; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">✗ キャンセル</button>
        </div>
    `;
    inputArea.style.background = '#e8f5e8';
    inputArea.style.borderColor = '#28a745';
    inputArea.style.display = 'block';
    
    const textField = document.getElementById('unifiedAddText');
    textField.value = '';
    textField.placeholder = `${selectedTarget === 'timing' ? 'タイミング' : selectedTarget === 'top' ? '上半身の服装' : '下半身の服装'}を入力`;
    textField.focus();
}

// 統一追加実行
window.executeAdd = () => {
    const newItem = document.getElementById('unifiedAddText').value.trim();
    if (!newItem || !selectedTarget) return;
    
    // 重複チェック
    const containers = {
        timing: document.getElementById('timingButtons'),
        top: document.getElementById('topClothingButtons'),
        bottom: document.getElementById('bottomClothingButtons')
    };
    
    const targetContainer = containers[selectedTarget];
    const existingButtons = Array.from(targetContainer.children);
    
    // 既存項目名チェック
    const isDuplicate = existingButtons.some(button => {
        const existingText = button.textContent.replace(/^(⏰|👔|👖)\s/, '').trim();
        return existingText.toLowerCase() === newItem.toLowerCase();
    });
    
    if (isDuplicate) {
        alert(`「${newItem}」は既に存在します。別の名前を入力してください。`);
        return;
    }

    // ランダムカラー生成
    const randomColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
    
    const button = document.createElement('button');
    button.type = 'button';
    
    if (selectedTarget === 'timing') {
        button.className = 'timing-btn';
        button.setAttribute('data-timing', newItem);
        button.onclick = () => selectTiming(newItem);
        button.textContent = `⏰ ${newItem}`;
    } else if (selectedTarget === 'top') {
        button.className = 'clothing-btn';
        button.setAttribute('data-clothing-top', newItem);
        button.onclick = () => selectClothingTop(newItem);
        button.textContent = `👔 ${newItem}`;
    } else if (selectedTarget === 'bottom') {
        button.className = 'clothing-btn';
        button.setAttribute('data-clothing-bottom', newItem);
        button.onclick = () => selectClothingBottom(newItem);
        button.textContent = `👖 ${newItem}`;
    }
    
    button.style.cssText = `background: ${randomColor}; color: white; opacity: 0.7;`;
    button.setAttribute('data-original-color', randomColor);
    
    containers[selectedTarget].appendChild(button);
    
    // 追加後すぐに選択
    if (selectedTarget === 'timing') selectTiming(newItem);
    else if (selectedTarget === 'top') selectClothingTop(newItem);
    else if (selectedTarget === 'bottom') selectClothingBottom(newItem);
    
    // 永続化保存
    saveCustomItems();
    
    // ログ出力
    const targetName = selectedTarget === 'timing' ? 'タイミング' : selectedTarget === 'top' ? '上半身' : '下半身';
    log(`✅ ${targetName}項目追加: ${newItem}`);
    
    // 入力エリアを非表示
    cancelAdd();
};

// 追加キャンセル
window.cancelAdd = () => {
    document.getElementById('unifiedAddInput').style.display = 'none';
    document.getElementById('unifiedAddText').value = '';
};

// モードUI更新
function updateModeUI() {
    const buttons = {
        normal: document.getElementById('normalModeBtn'),
        add: document.getElementById('addModeBtn'),
        delete: document.getElementById('deleteModeBtn')
    };

    // すべてリセット
    Object.entries(buttons).forEach(([key, btn]) => {
        btn.style.background = '#6c757d';
    });

    // 選択されたモードを強調
    if (buttons[currentMode]) {
        const colors = { normal: '#007bff', add: '#28a745', delete: '#dc3545' };
        buttons[currentMode].style.background = colors[currentMode];
    }

    // モード別の表示制御
    if (currentMode === 'add') {
        // 追加モード時のガイダンス表示
        updateAddModeGuidance();
    } else if (currentMode === 'delete') {
        // 削除モード時のガイダンス表示
        updateDeleteModeGuidance();
    } else {
        // 通常モード時は統一入力を非表示
        document.getElementById('unifiedAddInput').style.display = 'none';
    }
}

// 追加モードガイダンス更新
function updateAddModeGuidance() {
    const inputArea = document.getElementById('unifiedAddInput');
    
    if (!selectedTarget) {
        // 対象未選択時はガイダンス表示
        inputArea.style.display = 'block';
        inputArea.innerHTML = `
            <div style="margin-bottom: 5px;">
                <span style="font-size: 11px; color: #856404; font-weight: bold;">👆 追加したい項目の対象を選択してください</span>
            </div>
        `;
        inputArea.style.background = '#fff3cd';
        inputArea.style.borderColor = '#ffc107';
    }
}

// 削除モードガイダンス更新
function updateDeleteModeGuidance() {
    const inputArea = document.getElementById('unifiedAddInput');
    
    if (!selectedTarget) {
        // 対象未選択時はガイダンス表示
        inputArea.style.display = 'block';
        inputArea.innerHTML = `
            <div style="margin-bottom: 5px;">
                <span style="font-size: 11px; color: #721c24; font-weight: bold;">👆 削除したい項目の対象を選択してください</span>
            </div>
        `;
        inputArea.style.background = '#f8d7da';
        inputArea.style.borderColor = '#dc3545';
    } else {
        // 対象選択済み時は削除方法の案内
        inputArea.style.display = 'block';
        inputArea.innerHTML = `
            <div style="margin-bottom: 5px;">
                <span style="font-size: 11px; color: #721c24; font-weight: bold;">❌ 赤色のカスタム項目をクリックして削除</span>
            </div>
        `;
        inputArea.style.background = '#f8d7da';
        inputArea.style.borderColor = '#dc3545';
    }
}

// 対象UI更新
function updateTargetUI() {
    const buttons = {
        timing: document.getElementById('timingTargetBtn'),
        top: document.getElementById('topTargetBtn'),
        bottom: document.getElementById('bottomTargetBtn')
    };

    // すべてリセット
    Object.entries(buttons).forEach(([key, btn]) => {
        btn.style.background = '#6c757d';
    });

    // 選択された対象を強調
    if (selectedTarget && buttons[selectedTarget]) {
        buttons[selectedTarget].style.background = '#007bff';
    }
}

// 削除モード表示更新
function updateDeleteModeDisplay() {
    if (currentMode !== 'delete' || !selectedTarget) {
        // 削除モード以外では元の表示に戻す
        restoreNormalDisplay();
        return;
    }

    const selectors = {
        timing: '.timing-btn',
        top: '.clothing-btn[data-clothing-top]',
        bottom: '.clothing-btn[data-clothing-bottom]'
    };

    const buttons = document.querySelectorAll(selectors[selectedTarget]);
    
    buttons.forEach(btn => {
        const item = btn.getAttribute(`data-${selectedTarget === 'timing' ? 'timing' : selectedTarget === 'top' ? 'clothing-top' : 'clothing-bottom'}`);
        if (isCustomItem(item, selectedTarget)) {
            // カスタム項目を削除モード表示に
            btn.style.background = '#dc3545';
            btn.style.transform = 'scale(0.9)';
            btn.innerHTML = `❌ ${item}`;
            
            // 既存のイベントリスナーを削除してから新しいものを追加
            btn.replaceWith(btn.cloneNode(true));
            const newBtn = document.querySelector(`[data-${selectedTarget === 'timing' ? 'timing' : selectedTarget === 'top' ? 'clothing-top' : 'clothing-bottom'}="${item}"]`);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteCustomItem(item, selectedTarget);
                // 削除後にモードを通常に戻す
                setMode('normal');
            });
        } else {
            // デフォルト項目は無効化（削除不可の表示）
            btn.style.opacity = '0.5';
            btn.style.transform = 'scale(0.95)';
        }
    });

    log(`🗑️ 削除モード: ${selectedTarget === 'timing' ? 'タイミング' : selectedTarget === 'top' ? '上半身' : '下半身'}のカスタム項目をクリックして削除`);
}

// 通常表示に復旧
function restoreNormalDisplay() {
    const allButtons = document.querySelectorAll('.timing-btn, .clothing-btn');
    
    allButtons.forEach(btn => {
        const item = btn.getAttribute('data-timing') || btn.getAttribute('data-clothing-top') || btn.getAttribute('data-clothing-bottom');
        const originalColor = btn.getAttribute('data-original-color');
        
        // 通常の表示に復旧
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
        
        if (originalColor) {
            // カスタム項目
            btn.style.background = originalColor;
            if (btn.classList.contains('timing-btn')) {
                btn.innerHTML = `⏰ ${item}`;
                btn.onclick = () => selectTiming(item);
            } else if (btn.hasAttribute('data-clothing-top')) {
                btn.innerHTML = `👔 ${item}`;
                btn.onclick = () => selectClothingTop(item);
            } else if (btn.hasAttribute('data-clothing-bottom')) {
                btn.innerHTML = `👖 ${item}`;
                btn.onclick = () => selectClothingBottom(item);
            }
        }
        // デフォルト項目は元から正しい表示なので何もしない
    });
}

// 個別削除機能（確認ダイアログ付き）
async function deleteCustomTiming(itemText, event) {
    // イベント伝播を停止（ボタンクリックの阻止）
    event.stopPropagation();
    
    // 確認ダイアログ表示
    const confirmDelete = confirm(`カスタムタイミング「${itemText}」を削除しますか？\n\n削除すると元に戻せません。`);
    if (!confirmDelete) {
        log(`🚫 削除キャンセル: ${itemText}`);
        return;
    }
    
    try {
        // DOMから削除
        const button = document.querySelector(`[data-timing="${itemText}"]`);
        if (button && button.hasAttribute('data-original-color')) {
            button.remove();
            log(`✅ DOM削除成功: ${itemText}`);
        } else {
            log(`⚠️ 削除対象なし（デフォルト項目？）: ${itemText}`);
            return;
        }
        
        // Firebaseから削除
        if (currentUser) {
            const customItemsRef = database.ref(`users/${currentUser.uid}/customItems/timings`);
            const snapshot = await customItemsRef.once('value');
            if (snapshot.val()) {
                const timings = snapshot.val();
                const updatedTimings = timings.filter(item => item.text !== itemText);
                await customItemsRef.set(updatedTimings);
                log(`🔥 Firebase削除完了: ${itemText}`);
            }
        }
        
        // データ保存
        await saveCustomItems();
        log(`🗑️ カスタムタイミング削除完了: ${itemText}`);
        
    } catch (error) {
        log(`❌ 削除エラー: ${error.message}`);
    }
}

async function deleteCustomTop(itemText, event) {
    event.stopPropagation();
    
    const confirmDelete = confirm(`カスタム上半身「${itemText}」を削除しますか？\n\n削除すると元に戻せません。`);
    if (!confirmDelete) {
        log(`🚫 削除キャンセル: ${itemText}`);
        return;
    }
    
    try {
        const button = document.querySelector(`[data-clothing-top="${itemText}"]`);
        if (button && button.hasAttribute('data-original-color')) {
            button.remove();
            log(`✅ DOM削除成功: ${itemText}`);
        } else {
            log(`⚠️ 削除対象なし（デフォルト項目？）: ${itemText}`);
            return;
        }
        
        if (currentUser) {
            const customItemsRef = database.ref(`users/${currentUser.uid}/customItems/tops`);
            const snapshot = await customItemsRef.once('value');
            if (snapshot.val()) {
                const tops = snapshot.val();
                const updatedTops = tops.filter(item => item.text !== itemText);
                await customItemsRef.set(updatedTops);
                log(`🔥 Firebase削除完了: ${itemText}`);
            }
        }
        
        await saveCustomItems();
        log(`🗑️ カスタム上半身削除完了: ${itemText}`);
        
    } catch (error) {
        log(`❌ 削除エラー: ${error.message}`);
    }
}

async function deleteCustomBottom(itemText, event) {
    event.stopPropagation();
    
    const confirmDelete = confirm(`カスタム下半身「${itemText}」を削除しますか？\n\n削除すると元に戻せません。`);
    if (!confirmDelete) {
        log(`🚫 削除キャンセル: ${itemText}`);
        return;
    }
    
    try {
        const button = document.querySelector(`[data-clothing-bottom="${itemText}"]`);
        if (button && button.hasAttribute('data-original-color')) {
            button.remove();
            log(`✅ DOM削除成功: ${itemText}`);
        } else {
            log(`⚠️ 削除対象なし（デフォルト項目？）: ${itemText}`);
            return;
        }
        
        if (currentUser) {
            const customItemsRef = database.ref(`users/${currentUser.uid}/customItems/bottoms`);
            const snapshot = await customItemsRef.once('value');
            if (snapshot.val()) {
                const bottoms = snapshot.val();
                const updatedBottoms = bottoms.filter(item => item.text !== itemText);
                await customItemsRef.set(updatedBottoms);
                log(`🔥 Firebase削除完了: ${itemText}`);
            }
        }
        
        await saveCustomItems();
        log(`🗑️ カスタム下半身削除完了: ${itemText}`);
        
    } catch (error) {
        log(`❌ 削除エラー: ${error.message}`);
    }
}

// 体重データ読み込み（長い関数のため分割可能だが、完全コピーで移動）
function loadUserWeightData(userId) {
    log(`🔍 体重データ読み込み実行: ユーザーID=${userId}`);
    const userRef = database.ref(`users/${userId}/weights`);
    userRef.on('value', (snapshot) => {
        const data = snapshot.val();
        log(`🔍 Firebase応答: データ=${data ? 'あり' : 'なし'}`);
        
        // tab1がアクティブな時のみデータ表示処理を実行
        if (currentTab !== 1) {
            log(`⚠️ tab1非アクティブのため体重データ表示をスキップ（現在: tab${currentTab}）`);
            return;
        }
        
        const historyDiv = document.getElementById('weightHistory');
        log(`🔍 weightHistory要素: ${historyDiv ? '存在' : '不存在'}`);
        
        const chartElement = document.getElementById('weightChart');
        log(`🔍 weightChart要素: ${chartElement ? '存在' : '不存在'}`);
        
        if (data) {
            const entries = Object.entries(data)
                .map(([key, value]) => ({ id: key, ...value }))
                .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
            
            // グラフ用にデータを保存
            WeightTab.allWeightData = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
            updateChart();
            
            // 直近7件のみ表示
            const recentEntries = entries.slice(-7);
            log(`🔍 表示対象: ${recentEntries.length}件`);
            log(`🔍 要素詳細: ${historyDiv.tagName}#${historyDiv.id}`);
            
            const historyHTML = recentEntries.map(entry => {
                let displayText = `${entry.date}`;
                if (entry.time) displayText += ` ${entry.time}`;
                displayText += `: ${entry.value || entry.weight}kg`;
                if (entry.timing) displayText += ` (${entry.timing})`;
                
                // 服装情報を追加
                if (entry.clothing && (entry.clothing.top || entry.clothing.bottom)) {
                    const clothingInfo = [entry.clothing.top, entry.clothing.bottom].filter(Boolean).join(', ');
                    displayText += ` [${clothingInfo}]`;
                }
                
                if (entry.memo) displayText += ` - ${entry.memo}`;
                return `<div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 0; border-bottom: 1px solid #eee;"><span>${displayText}</span><div style="display: flex; gap: 2px;"><button onclick="editWeightEntry('${entry.id}')" style="background: #007bff; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px;">✏️</button><button onclick="deleteWeightEntry('${entry.id}')" style="background: #dc3545; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px;">🗑️</button></div></div>`;
            });
            
            log(`🔍 生成HTML長: ${historyHTML.join('').length}文字`);
            historyDiv.innerHTML = historyHTML.join('');
            log(`🔍 更新後要素内容: ${historyDiv.innerHTML.substring(0,100)}...`);
            
            // 履歴パネルとチャートパネルを強制表示
            const weightHistoryPanel = document.getElementById('weightHistoryPanel');
            if (weightHistoryPanel) {
                weightHistoryPanel.classList.remove('hidden');
                log(`✅ weightHistoryPanel強制表示`);
            }
            
            const chartPanel = document.getElementById('chartPanel');
            if (chartPanel) {
                chartPanel.classList.remove('hidden');
                log(`✅ chartPanel強制表示`);
            }
            
            log(`📈 データ履歴読み込み完了: ${entries.length}件`);
        } else {
            historyDiv.innerHTML = 'まだデータがありません';
            log('📈 データ履歴: データなし');
            WeightTab.allWeightData = [];
            updateChart();
        }
    });
}

// ========================================
// Chart.js関連の変数・関数群（index.htmlから完全コピー移動）
// ========================================

// Chart.js関連のグローバル変数
let showPreviousPeriod = false; // 前期間表示のON/OFF

// チャートナビゲーション用変数
let currentChartDays = 30; // デフォルト期間
let currentChartDate = new Date(); // 基準日

// 日付指定でチャートを更新
function updateChartWithDate(days, endDate) {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;

    const end = new Date(endDate);
    const startDate = new Date(end);
    if (days > 0) {
        startDate.setDate(end.getDate() - days);
    } else {
        // 全期間の場合、最も古いデータから
        if (WeightTab.allWeightData.length > 0) {
            startDate.setTime(new Date(WeightTab.allWeightData[0].date).getTime());
        }
    }

    // 期間内のデータをフィルタリング
    const filteredData = WeightTab.allWeightData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= end;
    });

    // 既存のupdateChart関数のロジックを使用してチャートを描画
    renderChartWithData(days, filteredData, startDate, end);
}

// チャート描画の共通ロジック（安全アクセス対応）
function renderChartWithData(days, filteredData, startDate, endDate) {
    const ctx = document.getElementById('weightChart');
    if (!ctx) {
        console.log('⚠️ weightChart要素が見つかりません - チャート描画をスキップ');
        return;
    }

    let chartData, datasets = [];
    let timeUnit, displayFormat, axisLabel;
    let dateRangeText = '';

    if (days === 1) {
        // 1日表示：時間軸を使用（24時間表示）
        chartData = filteredData.map(entry => {
            const dateTime = entry.time ? 
                new Date(`${entry.date}T${entry.time}:00`) : 
                new Date(`${entry.date}T12:00:00`); // 時間なしの場合は12:00とする
            
            return {
                x: dateTime,
                y: parseFloat(entry.value || entry.weight)
            };
        }).sort((a, b) => a.x - b.x);
        
        // 対象日付を表示用に設定
        if (filteredData.length > 0) {
            const targetDate = new Date(filteredData[0].date);
            const dateStr = `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
            dateRangeText = `${dateStr}のデータ`;
        }
        
        datasets.push({
            label: '体重',
            data: chartData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6
        });

        // 前期間データを追加（1日表示用）
        if (showPreviousPeriod) {
            const previousData = getPreviousPeriodData(days, endDate);
            if (previousData.length > 0) {
                const previousChartData = previousData.map(entry => {
                    const dateTime = entry.time ? 
                        new Date(`${entry.date}T${entry.time}:00`) : 
                        new Date(`${entry.date}T12:00:00`);
                    
                    return {
                        x: dateTime,
                        y: parseFloat(entry.weight || entry.value)
                    };
                }).sort((a, b) => a.x - b.x);

                datasets.push({
                    label: '前日の記録',
                    data: previousChartData,
                    borderColor: 'rgba(128, 128, 128, 0.6)',
                    backgroundColor: 'rgba(128, 128, 128, 0.1)',
                    tension: 0.1,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    borderDash: [5, 5]
                });
            }
        }
        
        timeUnit = 'hour';
        displayFormat = 'HH:mm';
        axisLabel = '時間';
    } else {
        // 複数日表示：日付でグループ化（最大値・最小値・平均値を表示）
        const groupedData = {};
        filteredData.forEach(entry => {
            if (!groupedData[entry.date]) {
                groupedData[entry.date] = [];
            }
            groupedData[entry.date].push(parseFloat(entry.value || entry.weight));
        });

        const avgData = [], maxData = [], minData = [];
        Object.keys(groupedData).sort().forEach(date => {
            const values = groupedData[date];
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const max = Math.max(...values);
            const min = Math.min(...values);
            
            avgData.push({ x: date, y: avg });
            maxData.push({ x: date, y: max });
            minData.push({ x: date, y: min });
        });

        // 複数測定日がある場合のみ全系列を表示
        const hasMultipleMeasurements = Object.values(groupedData).some(values => values.length > 1);
        
        if (hasMultipleMeasurements) {
            const avgDataForDisplay = [];
            const maxDataForDisplay = [];
            const minDataForDisplay = [];
            
            avgData.forEach(item => {
                const date = item.x;
                if (groupedData[date] && groupedData[date].length > 1) {
                    avgDataForDisplay.push(item);
                }
            });
            
            maxData.forEach(item => {
                const date = item.x;
                if (groupedData[date] && groupedData[date].length > 1) {
                    maxDataForDisplay.push(item);
                }
            });
            
            minData.forEach(item => {
                const date = item.x;
                if (groupedData[date] && groupedData[date].length > 1) {
                    minDataForDisplay.push(item);
                }
            });

            datasets.push({
                label: '平均値',
                data: avgDataForDisplay,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
            });

            if (maxDataForDisplay.length > 0) {
                datasets.push({
                    label: '最大値',
                    data: maxDataForDisplay,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.1,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    borderDash: [5, 5]
                });

                datasets.push({
                    label: '最小値',
                    data: minDataForDisplay,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.1,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    borderDash: [5, 5]
                });
            }
        } else {
            datasets.push({
                label: '体重',
                data: avgData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
            });
        }

        // 前期間データを追加（複数日表示用）
        if (showPreviousPeriod) {
            const previousData = getPreviousPeriodData(days, endDate);
            if (previousData.length > 0) {
                const previousGroupedData = {};
                previousData.forEach(entry => {
                    if (!previousGroupedData[entry.date]) {
                        previousGroupedData[entry.date] = [];
                    }
                    previousGroupedData[entry.date].push(parseFloat(entry.weight || entry.value));
                });

                const previousAvgData = [];
                Object.keys(previousGroupedData).sort().forEach(date => {
                    const values = previousGroupedData[date];
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    previousAvgData.push({ x: date, y: avg });
                });

                const periodName = days === 7 ? '前週' : days === 30 ? '前月' : days === 90 ? '前3ヶ月' : days === 365 ? '前年' : '前期間';
                datasets.push({
                    label: `${periodName}の記録`,
                    data: previousAvgData,
                    borderColor: 'rgba(128, 128, 128, 0.6)',
                    backgroundColor: 'rgba(128, 128, 128, 0.1)',
                    tension: 0.1,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    borderDash: [5, 5]
                });
            }
        }
        
        // 期間表示テキストを設定
        if (avgData.length > 0) {
            const startStr = new Date(avgData[0].x).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            const endStr = new Date(avgData[avgData.length - 1].x).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            dateRangeText = `${startStr}～${endStr}`;
        }
        
        timeUnit = 'day';
        displayFormat = 'MM/dd';
        axisLabel = '日付';
    }

    // 期間表示を更新
    updateDateRangeDisplay(dateRangeText);

    // グラフを描画
    if (WeightTab.weightChart) {
        WeightTab.weightChart.destroy();
    }

    const chartConfig = {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}kg`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: timeUnit,
                        displayFormats: {
                            hour: displayFormat,
                            day: displayFormat
                        }
                    },
                    title: {
                        display: true,
                        text: axisLabel
                    },
                    // 1日表示の場合は24時間表示
                    ...(days === 1 && filteredData.length > 0 ? {
                        min: new Date(`${filteredData[0].date}T00:00:00`),
                        max: new Date(`${filteredData[0].date}T23:59:59`)
                    } : {})
                },
                y: {
                    min: 71.5,
                    max: 74.0,
                    title: {
                        display: true,
                        text: '体重 (kg)'
                    },
                    ticks: {
                        stepSize: 0.5,
                        callback: function(value) {
                            return value.toFixed(1) + 'kg';
                        }
                    }
                }
            }
        }
    };

    WeightTab.weightChart = new Chart(ctx, chartConfig);
    log(`📊 グラフ更新: ${filteredData.length}件のデータ表示 ${dateRangeText}`);
}

function updateChart(days = 30) {
    // 現在の日付を基準に更新
    currentChartDays = days;
    currentChartDate = new Date();
    
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;

    const now = new Date();
    const startDate = new Date(now);
    if (days > 0) {
        startDate.setDate(now.getDate() - days);
    } else {
        // 全期間の場合、最も古いデータから
        if (WeightTab.allWeightData.length > 0) {
            startDate.setTime(new Date(WeightTab.allWeightData[0].date).getTime());
        }
    }

    // 期間内のデータをフィルタリング
    const filteredData = WeightTab.allWeightData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= now;
    });

    // 共通の描画ロジックを使用
    renderChartWithData(days, filteredData, startDate, now);
    
    // 期間情報を更新
    updateChartPeriodInfo();
}

// 日付範囲表示を更新
function updateDateRangeDisplay(rangeText) {
    const chartContainer = document.querySelector('#chartPanel div[style*="position: relative"]');
    if (!chartContainer) {
        // フォールバック: chartPanelを使用
        const chartPanel = document.getElementById('chartPanel');
        if (!chartPanel) {
            console.warn('Chart panel not found for date range display');
            return;
        }
        
        let rangeDisplay = document.getElementById('chartDateRange');
        if (!rangeDisplay) {
            rangeDisplay = document.createElement('div');
            rangeDisplay.id = 'chartDateRange';
            rangeDisplay.style.cssText = 'text-align: right; font-size: 12px; color: #666; margin-bottom: 5px; padding: 2px 0;';
            const h3 = chartPanel.querySelector('h3');
            if (h3) {
                h3.insertAdjacentElement('afterend', rangeDisplay);
            }
        }
        if (rangeDisplay && rangeText) {
            rangeDisplay.textContent = rangeText;
        }
        return;
    }

    let rangeDisplay = document.getElementById('chartDateRange');
    if (!rangeDisplay) {
        // 日付範囲表示エリアが存在しない場合は作成
        rangeDisplay = document.createElement('div');
        rangeDisplay.id = 'chartDateRange';
        rangeDisplay.style.cssText = 'position: absolute; top: 5px; right: 10px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #666; border: 1px solid #ddd; z-index: 10;';
        chartContainer.appendChild(rangeDisplay);
    }
    if (rangeDisplay && rangeText) {
        rangeDisplay.textContent = rangeText;
    }
}

// グラフの表示期間を変更
window.updateChartRange = (days) => {
    updateChart(days);
    const rangeName = days === 1 ? '1日' :
                    days === 7 ? '1週間' : 
                    days === 30 ? '1ヶ月' : 
                    days === 90 ? '3ヶ月' : 
                    days === 365 ? '1年' : '全期間';
    log(`📊 グラフ表示期間変更: ${rangeName}`);
}

// チャートナビゲーション機能
window.navigateChart = (direction) => {
    if (currentChartDays === 0) {
        log('⚠️ 全期間表示中はナビゲーションできません');
        return;
    }

    const today = new Date();
    
    if (direction === 'prev') {
        // 前の期間へ
        currentChartDate.setDate(currentChartDate.getDate() - currentChartDays);
    } else if (direction === 'next') {
        // 次の期間へ
        currentChartDate.setDate(currentChartDate.getDate() + currentChartDays);
        
        // 未来に行き過ぎないよう制限
        if (currentChartDate > today) {
            currentChartDate = new Date(today);
        }
    }
    
    // チャートを更新
    updateChartWithDate(currentChartDays, currentChartDate);
    
    // 期間情報を更新
    updateChartPeriodInfo();
    
    const direction_jp = direction === 'prev' ? '前' : '次';
    log(`📊 チャート${direction_jp}へナビゲーション`);
};

// 期間情報表示を更新
function updateChartPeriodInfo() {
    const periodInfo = document.getElementById('chartPeriodInfo');
    if (!periodInfo) return;
    
    const endDate = new Date(currentChartDate);
    const startDate = new Date(currentChartDate);
    
    if (currentChartDays === 1) {
        // 1日表示
        periodInfo.textContent = `${endDate.getMonth() + 1}/${endDate.getDate()} (1日)`;
    } else if (currentChartDays === 7) {
        // 1週間表示
        startDate.setDate(endDate.getDate() - 6);
        periodInfo.textContent = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()} (1週間)`;
    } else if (currentChartDays === 30) {
        // 1ヶ月表示
        startDate.setDate(endDate.getDate() - 29);
        periodInfo.textContent = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()} (1ヶ月)`;
    } else if (currentChartDays === 90) {
        // 3ヶ月表示
        startDate.setDate(endDate.getDate() - 89);
        periodInfo.textContent = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()} (3ヶ月)`;
    } else if (currentChartDays === 365) {
        // 1年表示
        startDate.setDate(endDate.getDate() - 364);
        periodInfo.textContent = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()} (1年)`;
    } else {
        periodInfo.textContent = '全期間';
    }
}

// 前期間比較機能
window.togglePreviousPeriod = function togglePreviousPeriod() {
    showPreviousPeriod = !showPreviousPeriod;
    const btn = document.getElementById('previousPeriodBtn');
    
    if (showPreviousPeriod) {
        btn.style.background = '#dc3545';
        btn.textContent = '前期間OFF';
    } else {
        btn.style.background = '#28a745';
        btn.textContent = '前期間の記録';
    }
    
    // チャートを再描画
    updateChartWithDate(currentChartDays, currentChartDate);
    log(`📊 前期間比較: ${showPreviousPeriod ? 'ON' : 'OFF'}`);
}

// 前期間データを取得
function getPreviousPeriodData(days, currentEndDate) {
    if (days <= 0) return []; // 全期間表示の場合は前期間なし
    
    // 前期間の終了日を計算
    const previousEndDate = new Date(currentEndDate);
    if (days === 1) {
        // 1日表示の場合：前日
        previousEndDate.setDate(currentEndDate.getDate() - 1);
    } else {
        // 複数日表示の場合：前期間の終了日
        previousEndDate.setDate(currentEndDate.getDate() - days);
    }
    
    // 前期間の開始日を計算
    const previousStartDate = new Date(previousEndDate);
    if (days === 1) {
        // 1日表示：開始日=終了日（前日のみ）
        previousStartDate.setTime(previousEndDate.getTime());
    } else {
        // 複数日表示：期間の開始日を計算
        previousStartDate.setDate(previousEndDate.getDate() - days + 1);
    }
    
    // デバッグログ
    log(`🔍 前期間データ取得: ${days}日, 現在終了日: ${currentEndDate.toDateString()}`);
    log(`🔍 前期間範囲: ${previousStartDate.toDateString()} - ${previousEndDate.toDateString()}`);
    
    // 前期間のデータをフィルタリング
    const filteredData = WeightTab.allWeightData.filter(entry => {
        const entryDate = new Date(entry.date);
        const entryDateStr = entry.date; // YYYY-MM-DD形式の文字列
        const previousStartStr = previousStartDate.toISOString().split('T')[0];
        const previousEndStr = previousEndDate.toISOString().split('T')[0];
        
        // デバッグ用
        if (days === 1) {
            log(`🔍 データ確認: ${entryDateStr} vs ${previousStartStr}-${previousEndStr}`);
        }
        
        return entryDateStr >= previousStartStr && entryDateStr <= previousEndStr;
    });
    
    log(`🔍 前期間データ件数: ${filteredData.length}件`);
    return filteredData;
}

// テスト環境でのアクセス用（本番環境に影響なし）
if (typeof window !== 'undefined' && typeof module !== 'undefined') {
    window.getPreviousPeriodData = getPreviousPeriodData;
}

} // WeightTab 重複チェック終了