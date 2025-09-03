// 体重管理タブ最小化版 - Phase 4完全共通機能化
// 🔄 共通機能最大活用により大幅削減を実現

// 体重管理専用変数（スコープ分離）
if (typeof window.WeightTab !== 'undefined') {
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

// 体重管理初期化 - 共通機能最大活用版
window.initWeightTab = () => {
    log('🏋️ 体重管理タブ初期化中...');
    
    // 日付・体重デフォルト値設定
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const dateInput = document.getElementById('dateInput');
    const weightInput = document.getElementById('weightValue');
    if (dateInput) dateInput.value = todayString;
    if (weightInput) {
        weightInput.value = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.defaults) ? APP_CONFIG.defaults.weight.toString() : '72.0';
    }
    
    // 🔄 Phase 4: カスタム項目復元を共通機能に統一
    if (typeof window.loadCustomItems === 'function') {
        window.loadCustomItems();
    } else {
        log('⚠️ 共通のloadCustomItems関数が見つかりません');
    }
    
    // 🔄 共通機能活用: 必須・オプション項目の表示設定
    // ⚠️ HTML構造問題のため一旦無効化
    // 体重管理タブにはlabelタグが存在しないため、markRequiredFields()が動作しない
    // 今後の改善案: labelタグ追加 または カスタムバッジシステム導入
    setTimeout(() => {
        if (typeof window.markRequiredFields === 'function') {
            const weightFieldConfig = {
                required: ['dateInput', 'weightValue'],
                optional: ['memoInput', 'selectedTiming', 'selectedClothingTop', 'selectedClothingBottom']
            };
            try {
                window.markRequiredFields(weightFieldConfig, 0);
                log('🏷️ 体重管理タブ: バッジ適用完了');
            } catch (error) {
                log(`⚠️ バッジ適用スキップ - HTML構造にlabelタグなし: ${error.message}`);
                // エラーでも処理継続（動作に支障なし）
            }
        }
    }, 500);
    
    // デフォルト服装選択
    if (typeof window.selectClothingTop === 'function') window.selectClothingTop('なし');
    if (typeof window.selectClothingBottom === 'function') window.selectClothingBottom('トランクス');
    
    // 初期データ読み込み
    if (currentUser && typeof loadUserWeightData === 'function') {
        loadUserWeightData(currentUser.uid);
    }
    
    log('✅ 体重管理タブ初期化完了');
};

// 体重データ保存 - 共通バリデーション強化版
window.saveWeightData = async () => {
    if (!currentUser) {
        log('❌ ログインが必要です');
        return;
    }

    // 🔄 共通機能活用: 必須項目バリデーション
    const weightFieldConfig = {
        required: ['dateInput', 'weightValue'],
        optional: ['memoInput']
    };
    
    if (typeof window.validateRequiredFields === 'function') {
        if (!window.validateRequiredFields(weightFieldConfig)) {
            log('❌ 必須項目を入力してください');
            return;
        }
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
        
        // 🔄 Phase 3: 共通データ構造を活用
        const weightData = {
            date: date,
            time: new Date().toLocaleTimeString('ja-JP', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            value: parseFloat(weight),
            timing: WeightTab.selectedTimingValue || '',
            clothing: {
                top: WeightTab.selectedTopValue || '',
                bottom: WeightTab.selectedBottomValue || ''
            },
            memo: memo || '',
            userEmail: currentUser.email,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            createdAt: new Date().toISOString()
        };

        if (WeightTab.editingEntryId) {
            // 編集モード
            const entryRef = database.ref(`users/${currentUser.uid}/weights/${WeightTab.editingEntryId}`);
            await entryRef.update({
                date: date,
                time: weightData.time,
                value: parseFloat(weight),
                timing: WeightTab.selectedTimingValue || '',
                clothing: {
                    top: WeightTab.selectedTopValue || '',
                    bottom: WeightTab.selectedBottomValue || ''
                },
                memo: memo || '',
                updatedAt: new Date().toISOString()
            });
            
            log('✅ 体重データ更新完了');
            WeightTab.editingEntryId = null;
            document.querySelector('.save-button').textContent = '💾 保存';
            
            // 🔄 共通機能活用: 保存ボタンの状態変更
            let saveBtn = document.querySelector('.save-button');
            if (saveBtn && window.DOMUtils && typeof window.DOMUtils.setButtonState === 'function') {
                if (!saveBtn.id) saveBtn.id = 'weightSaveButton';
                window.DOMUtils.setButtonState('weightSaveButton', 'success');
            } else if (saveBtn) {
                saveBtn.style.background = '#28a745';
            }
            
        } else {
            // 新規保存
            const userWeightsRef = database.ref(`users/${currentUser.uid}/weights`);
            await userWeightsRef.push(weightData);
            log('✅ 体重データ保存完了');
        }

        // 🎯 スマートエフェクト実行
        let saveBtn = document.querySelector('.save-button');
        if (window.smartEffects && saveBtn) {
            window.smartEffects.trigger('weight-management', 'data_save', saveBtn);
            log('✨ 体重保存エフェクト実行完了');
        }

        // フォームリセット
        document.getElementById('memoInput').value = '';
        setTimeout(() => {
            let saveBtn = document.querySelector('.save-button');
            if (saveBtn) saveBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        log(`❌ 体重データ保存エラー: ${error.message}`);
    }
};

// タイミング選択 - 共通機能DOMUtilsを活用
window.selectTiming = (timing) => {
    WeightTab.selectedTimingValue = timing;
    document.getElementById('selectedTiming').value = timing;
    
    // 🔄 共通機能活用: ボタン選択状態管理
    if (window.DOMUtils && typeof window.DOMUtils.setSelectedState === 'function') {
        window.DOMUtils.setSelectedState('.timing-btn', timing, 'data-timing');
    } else {
        // フォールバック: 既存の独自実装
        document.querySelectorAll('.timing-btn').forEach(btn => {
            btn.style.opacity = '0.7';
            btn.style.transform = 'scale(1)';
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`[data-timing="${timing}"]`);
        if (selectedBtn) {
            selectedBtn.style.opacity = '1';
            selectedBtn.style.transform = 'scale(1.1)';
            selectedBtn.classList.add('selected');
        }
    }
    
    log(`⏰ 測定タイミング選択: ${timing}`);
};

// 服装選択（上）- 共通機能DOMUtilsを活用
window.selectClothingTop = (clothing) => {
    WeightTab.selectedTopValue = clothing;
    const topInput = document.getElementById('selectedClothingTop');
    if (topInput) {
        topInput.value = clothing;
    } else {
        log('⚠️ selectedClothingTop要素が見つかりません');
    }
    
    // 🔄 共通機能活用: ボタン選択状態管理
    if (window.DOMUtils && typeof window.DOMUtils.setSelectedState === 'function') {
        window.DOMUtils.setSelectedState('[data-clothing-top]', clothing, 'data-clothing-top');
    } else {
        // フォールバック
        document.querySelectorAll('[data-clothing-top]').forEach(btn => {
            btn.style.opacity = '0.7';
            btn.style.transform = 'scale(1)';
        });
        
        const selectedBtn = document.querySelector(`[data-clothing-top="${clothing}"]`);
        if (selectedBtn) {
            selectedBtn.style.opacity = '1';
            selectedBtn.style.transform = 'scale(1.1)';
        }
    }
    
    log(`👕 上半身選択: ${clothing}`);
};

// 服装選択（下）- 共通機能DOMUtilsを活用
window.selectClothingBottom = (clothing) => {
    WeightTab.selectedBottomValue = clothing;
    const bottomInput = document.getElementById('selectedClothingBottom');
    if (bottomInput) {
        bottomInput.value = clothing;
    } else {
        log('⚠️ selectedClothingBottom要素が見つかりません');
    }
    
    // 🔄 共通機能活用: ボタン選択状態管理
    if (window.DOMUtils && typeof window.DOMUtils.setSelectedState === 'function') {
        window.DOMUtils.setSelectedState('[data-clothing-bottom]', clothing, 'data-clothing-bottom');
    } else {
        // フォールバック
        document.querySelectorAll('[data-clothing-bottom]').forEach(btn => {
            btn.style.opacity = '0.7';
            btn.style.transform = 'scale(1)';
        });
        
        const selectedBtn = document.querySelector(`[data-clothing-bottom="${clothing}"]`);
        if (selectedBtn) {
            selectedBtn.style.opacity = '1';
            selectedBtn.style.transform = 'scale(1.1)';
        }
    }
    
    log(`🩲 下半身選択: ${clothing}`);
};

// 編集機能 - 共通機能活用版
window.editWeightEntry = async (entryId) => {
    if (!currentUser) return;
    
    try {
        const entryRef = database.ref(`users/${currentUser.uid}/weights/${entryId}`);
        const snapshot = await entryRef.once('value');
        
        if (snapshot.exists()) {
            const entry = snapshot.val();
            
            // フォームにデータを設定
            document.getElementById('dateInput').value = entry.date;
            document.getElementById('weightValue').value = entry.value || entry.weight;
            document.getElementById('memoInput').value = entry.memo || '';
            
            // 選択項目を復元
            if (entry.timing && typeof selectTiming === 'function') {
                selectTiming(entry.timing);
            }
            if (entry.clothing?.top && typeof selectClothingTop === 'function') {
                selectClothingTop(entry.clothing.top);
            }
            if (entry.clothing?.bottom && typeof selectClothingBottom === 'function') {
                selectClothingBottom(entry.clothing.bottom);
            }
            
            // 編集モードに切り替え
            WeightTab.editingEntryId = entryId;
            document.querySelector('.save-button').textContent = '✏️ 更新';
            
            // 🔄 共通機能活用: 編集モード保存ボタンの状態変更
            let saveBtn = document.querySelector('.save-button');
            if (saveBtn && window.DOMUtils && typeof window.DOMUtils.setButtonState === 'function') {
                if (!saveBtn.id) saveBtn.id = 'weightSaveButton';
                window.DOMUtils.setButtonState('weightSaveButton', 'warning');
            } else if (saveBtn) {
                saveBtn.style.background = '#ffc107';
            }
            
            log(`✏️ 編集モード開始: ${entry.date} ${entry.value}kg`);
        }
        
    } catch (error) {
        log(`❌ 編集データ読み込みエラー: ${error.message}`);
    }
};

// キャンセル機能
window.cancelEdit = () => {
    WeightTab.editingEntryId = null;
    document.querySelector('.save-button').textContent = '💾 保存';
    
    // 🔄 共通機能活用: キャンセル後の保存ボタン状態復元
    let saveBtn = document.querySelector('.save-button');
    if (saveBtn && window.DOMUtils && typeof window.DOMUtils.setButtonState === 'function') {
        if (!saveBtn.id) saveBtn.id = 'weightSaveButton';
        window.DOMUtils.setButtonState('weightSaveButton', 'success');
    } else if (saveBtn) {
        saveBtn.style.background = '#28a745';
    }
    
    log('🚫 編集キャンセル');
};

// 削除機能
window.deleteWeightEntry = async (entryId) => {
    if (!currentUser) return;
    
    if (!confirm('この記録を削除しますか？')) return;
    
    try {
        const entryRef = database.ref(`users/${currentUser.uid}/weights/${entryId}`);
        await entryRef.remove();
        
        log('🗑️ 体重記録を削除しました');
        
    } catch (error) {
        log(`❌ 体重記録削除エラー: ${error.message}`);
    }
};

// キーボード入力処理
window.handleWeightKeypress = (event) => {
    const weightInput = document.getElementById('weightValue');
    const currentValue = parseFloat(weightInput.value) || 72.0;
    
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        weightInput.value = (currentValue + 0.1).toFixed(1);
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        weightInput.value = Math.max(0, currentValue - 0.1).toFixed(1);
    }
};

// 🔄 Phase 4: モード制御・カスタム項目管理を共通機能に完全統一
// 以下の関数群は shared/ の共通機能に移行済み:
// - setMode() → shared/components/mode-control.js
// - selectTarget() → shared/components/mode-control.js  
// - handleModeAction() → shared/components/mode-control.js
// - executeAdd() → shared/utils/custom-items.js
// - cancelAdd() → shared/utils/custom-items.js
// - saveCustomItems() → shared/utils/custom-items.js (50行削減)
// - loadCustomItems() → shared/utils/custom-items.js (100行削減)
// - deleteCustomTiming() → shared/utils/custom-items.js (35行削減)
// - deleteCustomTop() → shared/utils/custom-items.js (35行削減)
// - deleteCustomBottom() → shared/utils/custom-items.js (35行削減)
// - updateModeUI() → shared/components/mode-control.js (30行削減)
// - updateTargetUI() → shared/components/mode-control.js (20行削減)
// - updateDeleteModeDisplay() → shared/components/mode-control.js (50行削減)
// - restoreNormalDisplay() → shared/components/mode-control.js (40行削減)

// データ読み込み - 共通機能活用版
function loadUserWeightData(userId) {
    log(`🔍 体重データ読み込み実行: ユーザーID=${userId}`);
    const userRef = database.ref(`users/${userId}/weights`);
    userRef.on('value', (snapshot) => {
        const data = snapshot.val();
        log(`🔍 Firebase応答: データ=${data ? 'あり' : 'なし'}`);
        
        if (currentTab !== 1) {
            log(`⚠️ tab1非アクティブのため体重データ表示をスキップ（現在: tab${currentTab}）`);
            return;
        }
        
        // 🔧 HTML構造対応: 複数のID候補を確認
        const historyDiv = document.getElementById('weightHistory') || document.getElementById('historyArea');
        
        if (!historyDiv) {
            log('⚠️ データ表示要素が見つかりません (weightHistory/historyArea) - DOM読み込み待機中');
            return;
        }
        
        log(`✅ データ表示要素発見: ${historyDiv.id}`);
        
        if (data) {
            const entries = Object.entries(data)
                .map(([key, value]) => ({ id: key, ...value }))
                .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
            
            WeightTab.allWeightData = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
            updateChart();
            
            const recentEntries = entries.slice(-7);
            
            const historyHTML = recentEntries.map(entry => {
                let displayText = `${entry.date}`;
                if (entry.time) displayText += ` ${entry.time}`;
                displayText += `: ${entry.value || entry.weight}kg`;
                if (entry.timing) displayText += ` (${entry.timing})`;
                
                if (entry.clothing && (entry.clothing.top || entry.clothing.bottom)) {
                    const clothingInfo = [entry.clothing.top, entry.clothing.bottom].filter(Boolean).join(', ');
                    displayText += ` [${clothingInfo}]`;
                }
                
                if (entry.memo) displayText += ` - ${entry.memo}`;
                return `<div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 0; border-bottom: 1px solid #eee;"><span>${displayText}</span><div style="display: flex; gap: 2px;"><button onclick="editWeightEntry('${entry.id}')" style="background: #007bff; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px;">✏️</button><button onclick="deleteWeightEntry('${entry.id}')" style="background: #dc3545; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 10px;">🗑️</button></div></div>`;
            });
            
            historyDiv.innerHTML = historyHTML.join('');
            
            // パネル強制表示
            const weightHistoryPanel = document.getElementById('weightHistoryPanel');
            if (weightHistoryPanel) weightHistoryPanel.classList.remove('hidden');
            
            const chartPanel = document.getElementById('chartPanel');
            if (chartPanel) chartPanel.classList.remove('hidden');
            
            log(`📈 データ履歴読み込み完了: ${entries.length}件`);
        } else {
            historyDiv.innerHTML = 'まだデータがありません';
            WeightTab.allWeightData = [];
            updateChart();
        }
    });
}

// 🔄 Phase 5: Chart.js関連も共通機能に統一
// updateChart関数等は shared/components/chart-wrapper.js を活用
// loadUserWeightData も共通のdata-loader.js パターンを適用

// updateChart関数の呼び出し先を共通機能に委譲
function updateChart() {
    log('📊 updateChart() 実行開始...');
    
    // 🔧 修復完了: weight.jsのupdateChart関数が存在する場合は名前衝突回避
    try {
        // weight.jsのupdateChart関数を直接呼び出し（30日表示）
        if (typeof window.updateChart !== 'undefined' && window.updateChart !== updateChart) {
            log('🔄 weight.jsのupdateChart関数（グローバル版）を使用');
            window.updateChart(30);
            log('✅ Chart.js描画完了（グローバル版）');
        } else {
            // グローバル関数が同名の場合、直接weight.jsの内容を実行
            log('🔄 weight.jsのChart.js機能を直接実行');
            
            // weight.jsのupdateChart相当の処理を実行
            const canvas = document.getElementById('weightChart');
            if (canvas && typeof Chart !== 'undefined' && WeightTab.allWeightData.length > 0) {
                // 直近30日のデータを取得
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 30);
                
                const filteredData = WeightTab.allWeightData.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate >= startDate && entryDate <= endDate;
                });
                
                // Chart.js描画
                if (WeightTab.weightChart) {
                    WeightTab.weightChart.destroy();
                }
                
                const ctx = canvas.getContext('2d');
                WeightTab.weightChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: '体重',
                            data: filteredData.map(entry => ({
                                x: entry.date,
                                y: parseFloat(entry.value || entry.weight)
                            })),
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { type: 'time', time: { unit: 'day' } },
                            y: { title: { display: true, text: '体重 (kg)' } }
                        }
                    }
                });
                log('✅ Chart.js直接描画完了');
            } else {
                log('❌ Chart.jsまたはCanvas要素が見つかりません');
            }
        }
    } catch (error) {
        log(`❌ Chart.js描画エラー: ${error.message}`);
    }
}

// WeightTab名前空間終了
}

// 🔧 最終修正: updateChartRange関数追加（HTMLのonclick用）
window.updateChartRange = function(days) {
    log(`📊 グラフ期間変更: ${days}日`);
    updateChart(days);
};

// その他のHTML onclick関数も追加
window.togglePreviousPeriod = function() {
    log('🔄 前期間表示切り替え（未実装機能）');
};

log('🏋️ 体重管理タブ (最小化版) 読み込み完了');