// 体重管理タブ統合完了版 - 全機能統合完了済み
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
    editingEntryId: null,
    chartManager: null  // UniversalChartManager instance
};

// 体重管理初期化 - 共通機能最大活用版（安定化改良版）
window.initWeightTab = () => {
    log('🏋️ 体重管理タブ初期化中...');
    
    // DOM要素の存在確認（動的読み込み対応）
    const requiredElements = ['dateInput', 'timeInput', 'weightValue'];
    let allElementsReady = true;
    
    requiredElements.forEach(elementId => {
        if (!document.getElementById(elementId)) {
            log(`⚠️ 必須要素が見つかりません: ${elementId}`);
            allElementsReady = false;
        }
    });
    
    if (!allElementsReady) {
        log('⚠️ DOM要素が準備されていません。1秒後に再試行...');
        setTimeout(() => window.initWeightTab(), 1000);
        return;
    }
    
    // 日付・体重・時刻デフォルト値設定
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
    
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');
    const weightInput = document.getElementById('weightValue');
    
    if (dateInput) {
        dateInput.value = todayString;
        log(`✅ 日付設定完了: ${todayString}`);
    } else {
        log('⚠️ dateInput要素が見つかりません');
    }
    
    if (timeInput) {
        timeInput.value = currentTime;
        log(`✅ 時刻設定完了: ${currentTime}`);
    } else {
        log('⚠️ timeInput要素が見つかりません');
    }
    
    if (weightInput) {
        weightInput.value = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.defaults) ? APP_CONFIG.defaults.weight.toString() : '72.0';
        log(`✅ 体重設定完了: ${weightInput.value}kg`);
    } else {
        log('⚠️ weightInput要素が見つかりません');
    }
    
    // 🔄 統合完了済み: カスタム項目復元を共通機能に統一
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
    
    // 初期データ読み込み（ログイン状態の確認と処理分離）
    if (currentUser) {
        log('📊 ログイン状態確認済み - データ読み込み開始');
        loadAndDisplayWeightData();
    } else {
        log('⚠️ ログイン状態未確認 - データ読み込みはログイン後に実行');
        // ログイン後に自動的に呼び出されるため、ここでは何もしない
    }
    
    // Chart.js初期化の確認
    if (typeof Chart !== 'undefined') {
        log('✅ Chart.js読み込み確認済み');
    } else {
        log('⚠️ Chart.js読み込み未確認 - グラフ表示に影響する可能性');
    }
    
    log('✅ 体重管理タブ初期化完了（安定化版）');
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
        
        // 🔄 統合完了済み: 共通データ構造を活用
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
            // 編集モード - Firebase CRUD統一クラス使用
            await FirebaseCRUD.update('weights', currentUser.uid, WeightTab.editingEntryId, {
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
            // 新規保存 - Firebase CRUD統一クラス使用
            await FirebaseCRUD.save('weights', currentUser.uid, weightData);
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
    console.log('🔍 selectTiming called:', timing);  // デバッグログ
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
    console.log('🔍 selectClothingTop called:', clothing);  // デバッグログ
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
    console.log('🔍 selectClothingBottom called:', clothing);  // デバッグログ
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
        const snapshot = await FirebaseCRUD.getById('weights', currentUser.uid, entryId);
        
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
        // 削除処理 - Firebase CRUD統一クラス使用
        await FirebaseCRUD.delete('weights', currentUser.uid, entryId);
        
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

// 🔄 統合完了済み: モード制御・カスタム項目管理を共通機能に完全統一
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
    // データ読み込み - Firebase CRUD統一クラス使用
    FirebaseCRUD.load('weights', userId, (snapshot) => {
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
            
            // 🔧 統合完了済み: updateChart関数を使用
            if (typeof window.updateChart === 'function') {
                window.updateChart(30);
                log('✅ Chart.js更新完了（共通機能使用）');
            } else {
                log('⚠️ updateChart関数が見つかりません');
            }
            
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
            
            // 🔧 統合完了済み: updateChart関数を使用
            if (typeof window.updateChart === 'function') {
                window.updateChart(30);
                log('✅ Chart.js初期化完了（共通機能使用）');
            } else {
                log('⚠️ updateChart関数が見つかりません');
            }
        }
    });
    
}

// 🔄 統合完了済み: Chart.js関連も共通機能に統一
// updateChart関数等は shared/components/chart-wrapper.js を活用
// loadUserWeightData も共通のdata-loader.js パターンを適用

// 🚀 統合完了済み: 旧ファイルの完全機能を統合完了
// Chart.js完全実装版の統合済み

// REMOVED: Individual Chart.js implementation - Migrating to UniversalChartManager
// グラフ更新関数（統合完了済み）- オフセット対応強化版
function updateChart(days = 30) {
    // 事前条件
    console.assert(typeof days === 'number', 'daysは数値である必要があります');
    console.assert(days >= 0, 'daysは0以上である必要があります');
    console.assert(WeightTab.allWeightData !== undefined, 'WeightTab.allWeightDataが初期化されている必要があります');
    console.assert(typeof UniversalChartManager !== 'undefined', 'UniversalChartManagerが読み込まれている必要があります');
    
    const ctx = document.getElementById('weightChart');
    if (!ctx) {
        log('⚠️ weightChart要素が見つかりません');
        return;
    }

    // オフセットが設定されている場合は、updateChartWithOffsetを使用
    const currentOffset = window.periodOffset || 0;
    if (currentOffset > 0) {
        log(`📊 オフセット検出: updateChartWithOffsetに処理を委譲 (offset=${currentOffset})`);
        return updateChartWithOffset(days, currentOffset);
    }

    const now = new Date();
    const endDate = new Date(now); // ← 追加: endDate変数を定義
    const startDate = new Date(now);
    if (days > 0) {
        startDate.setDate(now.getDate() - days);
    } else {
        if (WeightTab.allWeightData && WeightTab.allWeightData.length > 0) {
            startDate.setTime(new Date(WeightTab.allWeightData[0].date).getTime());
        }
    }

    // 期間内のデータをフィルタリング
    const filteredData = (WeightTab.allWeightData || []).filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= now;
    });

    // UniversalChartManagerを使用した実装
    log(`📊 グラフ描画開始: データ件数=${filteredData.length}, 期間=${days}日`);
    
    try {
        // 既存のchartManagerがあれば破棄
        if (WeightTab.chartManager) {
            log('🔄 既存のchartManagerを破棄');
            WeightTab.chartManager.destroy();
        }
        
        // 既存のweightChartも念のため破棄
        if (WeightTab.weightChart) {
            log('🔄 既存のweightChartを破棄');
            WeightTab.weightChart.destroy();
            WeightTab.weightChart = null;
        }
        
        // UniversalChartManagerのインスタンスを作成
        log('🔨 UniversalChartManagerインスタンスを作成');
        WeightTab.chartManager = new UniversalChartManager('weightChart');
        
        // 体重専用メソッドを使用してグラフ作成
        log('📈 createWeightChartメソッドを呼び出し');
        const chart = WeightTab.chartManager.createWeightChart(filteredData, days);
        
        if (chart) {
            WeightTab.weightChart = chart; // 互換性のため保持
            log('✅ UniversalChartManagerでグラフ作成成功');
            
            // 事後条件
            console.assert(WeightTab.chartManager !== null, 'chartManagerが作成されている');
            console.assert(WeightTab.weightChart !== null, 'weightChartが作成されている');
        } else {
            log('❌ UniversalChartManagerでグラフ作成失敗');
        }
    } catch (error) {
        log(`❌ グラフ作成エラー: ${error.message}`);
        console.error('Chart creation error:', error);
        console.error('Stack trace:', error.stack);
    }
    
    log(`🔍 デバッグ: offset=${currentOffset}, days=${days}, startDate=${startDate.toDateString()}, endDate=${now.toDateString()}, データ件数=${filteredData.length}`);
    
    // 画面に期間表示を更新
    const periodDisplayElement = document.getElementById('currentPeriodDisplay');
    if (periodDisplayElement) {
        const periodText = days === 1 ? '1日' : days === 7 ? '1週間' : days === 28 ? '4週' : days === 30 ? '1ヶ月' : days === 84 ? '12週' : days === 90 ? '3ヶ月' : days === 365 ? '1年' : days === 0 ? '全期間' : `${days}日間`;
        periodDisplayElement.textContent = `(${periodText}: ${startDate.toLocaleDateString('ja-JP')}～${now.toLocaleDateString('ja-JP')})`;
    }

    let chartData, datasets = [];
    let timeUnit, displayFormat, axisLabel;
    let dateRangeText = '';

    if (days === 1) {
        // 1日表示：時間軸を使用（24時間表示）
        chartData = filteredData.map(entry => {
            const dateTime = entry.time ? 
                new Date(`${entry.date}T${entry.time}:00`) : 
                new Date(`${entry.date}T12:00:00`);
            
            return {
                x: dateTime,
                y: parseFloat(entry.value || entry.weight)
            };
        }).sort((a, b) => a.x - b.x);

        datasets.push({
            label: '体重',
            data: chartData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6
        });
    

        timeUnit = 'hour';
        displayFormat = 'HH:mm';
        axisLabel = '時間';
        const displayDate = new Date();
        dateRangeText = `${displayDate.getMonth() + 1}/${displayDate.getDate()} (1日表示)`;
    } else {
        // 複数日表示：日付軸を使用
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
            datasets.push({
                label: '平均値',
                data: avgData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                pointRadius: 4
            });
    

            if (maxData.length > 0) {
                datasets.push({
                    label: '最大値',
                    data: maxData,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.1,
                    borderDash: [5, 5]
                });
    

                datasets.push({
                    label: '最小値',
                    data: minData,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.1,
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
                pointRadius: 4
            });
    
        }
        
        timeUnit = 'day';
        displayFormat = 'MM/dd';
        axisLabel = '日付';
        
        // 改善された期間表示（window.updateChartWithOffset版）
        if (avgData.length > 0) {
            const dataStartStr = new Date(avgData[0].x).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            const dataEndStr = new Date(avgData[avgData.length - 1].x).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            const periodStartStr = startDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            const periodEndStr = endDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            
            if (avgData.length === 1) {
                // 1日分のデータのみ
                dateRangeText = `${periodStartStr}～${periodEndStr} (データ: ${dataStartStr}のみ)`;
            } else if (dataStartStr === periodStartStr && dataEndStr === periodEndStr) {
                // 期間全体にデータがある
                dateRangeText = `${dataStartStr}～${dataEndStr}`;
            } else {
                // 期間の一部にのみデータがある
                dateRangeText = `${periodStartStr}～${periodEndStr} (データ: ${dataStartStr}～${dataEndStr})`;
            }
        } else {
            // データなしの場合
            const periodStartStr = startDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            const periodEndStr = endDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            dateRangeText = `${periodStartStr}～${periodEndStr} (データなし)`;
        }
    }

    // Chart.js描画
    if (WeightTab.weightChart) {
        WeightTab.weightChart.destroy();
    }

    if (datasets.length === 0 || !datasets[0].data || datasets[0].data.length === 0) {
        log(`📊 表示するデータがありません - 全データ件数:${WeightTab.allWeightData?.length || 0}, フィルタ済み:${filteredData.length}, 期間:${startDate.toDateString()}～${now.toDateString()}`);
        
        // データなしメッセージを表示
        const canvas = document.getElementById('weightChart');
        const noDataMsg = document.getElementById('noDataMessage');
        const periodRangeMsg = document.getElementById('periodRangeMessage');
        
        if (canvas) canvas.style.display = 'none';
        if (noDataMsg) {
            noDataMsg.style.display = 'block';
            if (periodRangeMsg) {
                periodRangeMsg.textContent = `${startDate.toLocaleDateString('ja-JP')} ～ ${now.toLocaleDateString('ja-JP')}`;
            }
        }
        
        // チャートクリア
        if (WeightTab.weightChart) {
            WeightTab.weightChart.destroy();
            WeightTab.weightChart = null;
        }
        
        // 空のチャートを作成して期間情報を表示 - UniversalChartManager使用
        try {
            if (WeightTab.chartManager) {
                WeightTab.chartManager.destroy();
            }
            WeightTab.chartManager = new UniversalChartManager('weightChart', {
                plugins: {
                    title: {
                        display: true,
                        text: `データなし (${startDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'})}～${now.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'})})`
                    }
                }
            });
            WeightTab.weightChart = WeightTab.chartManager.createLineChart({ label: '', data: [] });
        } catch (error) {
            log(`❌ 空チャート作成エラー: ${error.message}`);
        }
    
        return;
    }

    // UniversalChartManagerを使用してチャート作成（updateChart関数内）
    try {
        if (WeightTab.chartManager) {
            WeightTab.chartManager.destroy();
        }
        
        const chartOptions = {
            plugins: {
                title: {
                    display: true,
                    text: dateRangeText || '期間表示'
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const item = tooltipItems[0];
                            if (days === 1) {
                                return new Date(item.parsed.x).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
                            } else {
                                return new Date(item.parsed.x).toLocaleDateString('ja-JP');
                            }
                        },
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}kg`;
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
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 70,
                    max: 75,
                    title: {
                        display: true,
                        text: '体重 (kg)'
                    }
                }
            }
        };
        
        WeightTab.chartManager = new UniversalChartManager('weightChart', chartOptions);
        WeightTab.weightChart = WeightTab.chartManager.createLineChart(datasets);
        
        if (!WeightTab.weightChart) {
            log('❌ UniversalChartManagerでのチャート作成失敗');
        } else {
            log('✅ UniversalChartManagerでのチャート作成成功');
        }
    } catch (error) {
        log(`❌ チャート作成エラー: ${error.message}`);
    }
    
    // データがある場合はcanvasを表示、メッセージを非表示
    const canvasEl = document.getElementById('weightChart');
    const noDataMsgEl = document.getElementById('noDataMessage');
    if (canvasEl) canvasEl.style.display = 'block';
    if (noDataMsgEl) noDataMsgEl.style.display = 'none';

    log(`📊 グラフ更新完了: ${filteredData.length}件のデータ`);
}

// グラフの表示期間を変更（UniversalChartManager使用）
window.updateChartRange = function(days) {
    log(`🔴 ボタン押下: updateChartRange(${days}) - ${new Date().toLocaleTimeString()}`);
    window.currentDisplayDays = days; // グローバル変数に統一
    
    // オフセットが設定されている場合はupdateChartWithOffsetを使用
    if (typeof window.periodOffset !== 'undefined' && window.periodOffset > 0) {
        log(`📊 オフセット適用: ${window.periodOffset}日前の${days}日間を表示`);
        updateChartWithOffset(days, window.periodOffset);
    } else {
        // オフセットなしの場合は従来通り
        updateChart(days);
    }
    
    const rangeName = days === 1 ? '1日' :
                    days === 7 ? '1週間' : 
                    days === 30 ? '1ヶ月' : 
                    days === 90 ? '3ヶ月' : 
                    days === 365 ? '1年' : '全期間';
    log(`📊 グラフ表示期間変更: ${rangeName}`);
    log(`🔵 updateChartRange完了: ${days}日表示 - ${new Date().toLocaleTimeString()}`);
};

// 前期間比較機能（統合完了済み）
let showPreviousPeriod = false;

window.togglePreviousPeriod = function() {
    showPreviousPeriod = !showPreviousPeriod;
    const btn = document.getElementById('previousPeriodBtn') || document.getElementById('togglePreviousPeriodBtn');
    
    if (showPreviousPeriod) {
        if (btn) {
            btn.style.background = '#dc3545';
            btn.textContent = '前期間OFF';
        }
        log('📊 前期間比較: ON');
    } else {
        if (btn) {
            btn.style.background = '#28a745';
            btn.textContent = '前期間の記録';
        }
        log('📊 前期間比較: OFF');
    }
    
    // グラフを再描画
    updateChart(window.currentDisplayDays || 30);
};

// 前期間データ取得関数（統合完了済み）
function getPreviousPeriodData(days) {
    if (days <= 0) return []; // 全期間表示の場合は前期間なし
    
    const now = new Date();
    let previousStartDate, previousEndDate;
    
    if (days === 1) {
        // 1日表示の場合：前日のみ
        previousEndDate = new Date(now);
        previousEndDate.setDate(now.getDate() - 1);
        previousStartDate = new Date(previousEndDate);
    } else {
        // 複数日表示の場合：前期間（同じ日数分）
        previousEndDate = new Date(now);
        previousEndDate.setDate(now.getDate() - days);
        previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousEndDate.getDate() - days);
    }
    
    return (WeightTab.allWeightData || []).filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= previousStartDate && entryDate <= previousEndDate;
    });
    
}

// updateChartWithOffset関数（簡易実装）
function updateChartWithOffset(days, offset) {
    // 事前条件
    console.assert(typeof days === 'number', 'daysは数値である必要があります');
    console.assert(typeof offset === 'number', 'offsetは数値である必要があります');
    console.assert(days > 0, 'daysは正の数である必要があります');
    console.assert(offset >= 0, 'offsetは0以上である必要があります');
    
    console.log(`📊 updateChartWithOffset: days=${days}, offset=${offset}`);
    
    const ctx = document.getElementById('weightChart');
    if (!ctx) {
        console.log('⚠️ weightChart要素が見つかりません');
        return;
    }
    
    const now = new Date();
    console.log(`🔍 現在日時: ${now.toLocaleDateString('ja-JP')}`);
    
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - offset); // オフセット分過去へ
    console.log(`🔍 終了日 (${offset}日前): ${endDate.toLocaleDateString('ja-JP')}`);
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days); // さらに表示期間分過去へ
    console.log(`🔍 開始日 (さらに${days}日前): ${startDate.toLocaleDateString('ja-JP')}`);
    console.log(`🔍 期間合計: ${startDate.toLocaleDateString('ja-JP')} ～ ${endDate.toLocaleDateString('ja-JP')} (${days}日間)`);
    
    // 期間内のデータをフィルタリング
    console.log(`🔍 全体データ件数: ${WeightTab.allWeightData?.length || 0}`);
    if (WeightTab.allWeightData && WeightTab.allWeightData.length > 0) {
        const allDates = WeightTab.allWeightData.map(entry => entry.date).sort();
        console.log(`🔍 全データ範囲: ${allDates[0]} ～ ${allDates[allDates.length-1]}`);
    }
    
    const filteredData = (WeightTab.allWeightData || []).filter(entry => {
        const entryDate = new Date(entry.date);
        const inRange = entryDate >= startDate && entryDate <= endDate;
        if (inRange) {
            console.log(`🔍 期間内データ発見: ${entry.date} (${entry.value || entry.weight}kg)`);
        }
        return inRange;
    });
    
    console.log(`📊 オフセット期間: ${startDate.toLocaleDateString('ja-JP')}～${endDate.toLocaleDateString('ja-JP')} (${filteredData.length}件)`);
    console.log(`🔍 全データ件数: ${WeightTab.allWeightData?.length || 0}, フィルタ後: ${filteredData.length}`);
    if (WeightTab.allWeightData && WeightTab.allWeightData.length > 0) {
        const firstDate = WeightTab.allWeightData[0].date;
        const lastDate = WeightTab.allWeightData[WeightTab.allWeightData.length - 1].date;
        console.log(`🔍 データ範囲: ${firstDate} ～ ${lastDate}`);
    }
    
    // UniversalChartManagerを使用
    try {
        if (WeightTab.chartManager) {
            WeightTab.chartManager.destroy();
        }
        if (WeightTab.weightChart) {
            WeightTab.weightChart.destroy();
            WeightTab.weightChart = null;
        }
        
        WeightTab.chartManager = new UniversalChartManager('weightChart');
        const chart = WeightTab.chartManager.createWeightChart(filteredData, days);
        
        if (chart) {
            WeightTab.weightChart = chart;
            log('✅ オフセット付きグラフ作成成功');
            
            // 事後条件
            console.assert(filteredData.every(d => new Date(d.date) <= endDate), 'データは終了日以前のもの');
            console.assert(filteredData.every(d => new Date(d.date) >= startDate), 'データは開始日以降のもの');
        }
    } catch (error) {
        log(`❌ グラフ作成エラー: ${error.message}`);
        console.error('Chart creation error:', error);
    }
    
    // 画面に期間表示を更新
    const periodDisplayElement = document.getElementById('currentPeriodDisplay');
    if (periodDisplayElement) {
        const periodText = days === 1 ? '1日' : days === 7 ? '1週間' : days === 30 ? '1ヶ月' : `${days}日間`;
        periodDisplayElement.textContent = `(${periodText}: ${startDate.toLocaleDateString('ja-JP')}～${endDate.toLocaleDateString('ja-JP')})`;
    }
}

// グローバルにexport
window.updateChart = updateChart;

// WeightTab名前空間終了
}

// 🔥 体重データ読み込み・表示機能（緊急実装）
async function loadAndDisplayWeightData() {
    if (!currentUser) {
        log('⚠️ データ読み込み: ログインが必要です');
        return;
    }
    
    try {
        log('📊 体重データ読み込み開始...');
        
        // Firebase multi loader を使用してデータ取得
        if (typeof window.FIREBASE_MULTI_LOADER === 'object' && window.FIREBASE_MULTI_LOADER.loadWeightData) {
            const weightData = await window.FIREBASE_MULTI_LOADER.loadWeightData(currentUser.uid);
            WeightTab.allWeightData = weightData || [];
            log(`✅ データ読み込み完了: ${WeightTab.allWeightData.length}件`);
        } else {
            // フォールバック: 直接Firebase読み込み
            const weightRef = database.ref(`users/${currentUser.uid}/weightData`);
            const snapshot = await weightRef.once('value');
            const data = snapshot.val();
            
            if (data) {
                WeightTab.allWeightData = Object.values(data).sort((a, b) => 
                    new Date(a.date + ' ' + (a.time || '00:00')) - new Date(b.date + ' ' + (b.time || '00:00'))
                );
                log(`✅ フォールバックデータ読み込み完了: ${WeightTab.allWeightData.length}件`);
            } else {
                WeightTab.allWeightData = [];
                log('📊 データなし - 新規ユーザーです');
            }
        }
        
        // データ表示更新
        displayWeightHistory(WeightTab.allWeightData);
        updateChart(30); // デフォルト30日間表示
        
    } catch (error) {
        log(`❌ データ読み込みエラー: ${error.message}`);
        WeightTab.allWeightData = [];
    }
}

// 🔥 履歴表示機能（緊急実装）
function displayWeightHistory(data) {
    const historyDiv = document.getElementById('weightHistory') || document.getElementById('historyArea');
    
    if (!historyDiv) {
        log('⚠️ データ表示要素が見つかりません (weightHistory/historyArea) - DOM読み込み待機中');
        return;
    }
    
    if (!data || data.length === 0) {
        historyDiv.innerHTML = '<p style="color: #666; text-align: center;">データなし</p>';
        return;
    }
    
    // 最新10件を表示
    const recentData = data.slice(-10).reverse();
    const historyHTML = recentData.map(entry => {
        const timing = entry.timing || '未設定';
        const clothing = entry.clothing ? `${entry.clothing.top || ''}/${entry.clothing.bottom || ''}` : '';
        const memo = entry.memo ? ` - ${entry.memo}` : '';
        
        return `
            <div style="background: #f8f9fa; padding: 8px; margin: 4px 0; border-radius: 4px; font-size: 12px;">
                <strong style="color: #007bff;">${entry.date} ${entry.time || ''}</strong> 
                <span style="color: #28a745; font-weight: bold;">${entry.value || entry.weight}kg</span>
                <br><small style="color: #666;">⏰${timing} 👕${clothing}${memo}</small>
            </div>
        `;
    }).join('');
    
    historyDiv.innerHTML = historyHTML;
    log(`✅ 履歴表示更新: ${recentData.length}件表示`);
}

// REMOVED: Individual Chart.js implementation - Migrating to UniversalChartManager
// 🔥 グラフ更新機能（緊急実装）
function updateWeightChart() {
    log('📊 updateWeightChart呼び出し - updateChart(30)に転送');
    updateChart(30);
    if (!WeightTab.allWeightData || WeightTab.allWeightData.length === 0) {
        log('⚠️ グラフ更新: データがありません');
        return;
    }
    
    // Chart.jsが利用可能かチェック
    if (typeof Chart === 'undefined') {
        log('⚠️ Chart.jsが読み込まれていません');
        return;
    }
    
    const canvas = document.getElementById('weightChart');
    if (!canvas) {
        log('⚠️ グラフキャンバスが見つかりません');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // 既存チャートを破棄 - WeightTabスコープの変数を使用
    if (WeightTab.weightChart) {
        WeightTab.weightChart.destroy();
        WeightTab.weightChart = null;
    }
    
    // データ準備（最新30日）
    const chartData = WeightTab.allWeightData.slice(-30).map(entry => ({
        x: entry.date,
        y: parseFloat(entry.value || entry.weight)
    }));
    
    // チャート作成 - UniversalChartManagerを使用
    try {
        if (WeightTab.chartManager) {
            WeightTab.chartManager.destroy();
        }
        
        const chartOptions = {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'yyyy-MM-dd',
                        displayFormats: {
                            day: 'MM/DD'
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '体重 (kg)'
                    }
                }
            }
        };
        
        const dataset = {
            label: '体重 (kg)',
            data: chartData,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.1
        };
        
        WeightTab.chartManager = new UniversalChartManager('weightChart', chartOptions);
        WeightTab.weightChart = WeightTab.chartManager.createLineChart(dataset);
        
        if (!WeightTab.weightChart) {
            log('❌ updateWeightChart: UniversalChartManagerでのチャート作成失敗');
        } else {
            log('✅ updateWeightChart: UniversalChartManagerでのチャート作成成功');
        }
    } catch (error) {
        log(`❌ updateWeightChart: チャート作成エラー: ${error.message}`);
    }
    
    
    log(`✅ グラフ更新完了: ${chartData.length}件表示`);
}

// グローバル公開
window.loadAndDisplayWeightData = loadAndDisplayWeightData;
window.displayWeightHistory = displayWeightHistory;
window.updateWeightChart = updateWeightChart;

// 体重データをCSV形式でコピーする関数（睡眠タブと統一）
window.copyWeightHistory = function() {
    if (!WeightTab.allWeightData || WeightTab.allWeightData.length === 0) {
        log('❌ コピーする体重履歴がありません');
        alert('❌ コピーするデータがありません');
        return;
    }
    
    // CSV形式でデータを出力（睡眠タブと同様）
    const csvContent = 'date,time,value,timing,clothing_top,clothing_bottom,memo\n' +
        WeightTab.allWeightData.map(entry => 
            `${entry.date},${entry.time || ''},${entry.value || entry.weight},${entry.timing || ''},${entry.clothing?.top || ''},${entry.clothing?.bottom || ''},"${entry.memo || ''}"`
        ).join('\n');
    
    navigator.clipboard.writeText(csvContent).then(() => {
        log('📋 体重履歴をクリップボードにコピーしました');
        alert('✅ 体重履歴をコピーしました');
    }).catch(err => {
        log('❌ コピーに失敗しました');
        alert('❌ コピーに失敗しました');
    });
    
};

// 時刻表示は不要なため削除（該当HTML要素が存在しない）

// グローバル変数の初期化（WeightTabスコープ内で管理）
if (typeof window.currentDisplayDays === 'undefined') {
    window.currentDisplayDays = 30;
}
if (typeof window.periodOffset === 'undefined') {
    window.periodOffset = 0;
}

// REMOVED: Individual Chart.js implementation - Migrating to UniversalChartManager
// updateChartWithOffset関数の追加（期間オフセット対応版）- 修正済み
window.updateChartWithOffset = function(days = 30, offset = 0) {
    console.log(`📊 window.updateChartWithOffset: days=${days}, offset=${offset}`);
    
    const ctx = document.getElementById('weightChart');
    if (!ctx) {
        console.log('⚠️ weightChart要素が見つかりません');
        return;
    }

    const now = new Date();
    console.log(`🔍 現在日時: ${now.toLocaleDateString('ja-JP')}`);
    
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - offset); // ← 修正：nowを破壊せずendDateのみ変更
    console.log(`🔍 終了日 (${offset}日前): ${endDate.toLocaleDateString('ja-JP')}`);
    
    const startDate = new Date(endDate);
    console.log(`🔍 endDateから計算開始: ${endDate.toLocaleDateString('ja-JP')}`);
    
    if (days > 0) {
        startDate.setDate(endDate.getDate() - days); // 修正: endDateから期間を引く
        console.log(`🔍 開始日 (さらに${days}日前): ${startDate.toLocaleDateString('ja-JP')}`);
    } else {
        if (WeightTab.allWeightData && WeightTab.allWeightData.length > 0) {
            startDate.setTime(new Date(WeightTab.allWeightData[0].date).getTime());
        }
    }
    
    console.log(`🔍 最終期間: ${startDate.toLocaleDateString('ja-JP')} ～ ${endDate.toLocaleDateString('ja-JP')} (${days}日間)`);

    // 期間内のデータをフィルタリング - デバッグ版
    console.log(`🔍 全体データ件数: ${WeightTab.allWeightData?.length || 0}`);
    if (WeightTab.allWeightData && WeightTab.allWeightData.length > 0) {
        const allDates = WeightTab.allWeightData.map(entry => entry.date).sort();
        console.log(`🔍 全データ範囲: ${allDates[0]} ～ ${allDates[allDates.length-1]}`);
    }
    
    const filteredData = (WeightTab.allWeightData || []).filter(entry => {
        const entryDate = new Date(entry.date);
        const inRange = entryDate >= startDate && entryDate <= endDate;
        if (inRange) {
            console.log(`🔍 期間内データ発見: ${entry.date} (${entry.value || entry.weight}kg)`);
        }
        return inRange;
    });
    
    
    log(`🔍 デバッグ: offset=${offset}, days=${days}, startDate=${startDate.toDateString()}, endDate=${endDate.toDateString()}, データ件数=${filteredData.length}`);
    
    // 画面に期間表示を更新
    const periodDisplay = document.getElementById('currentPeriodDisplay');
    if (periodDisplay) {
        const periodText = days === 1 ? '1日' : days === 7 ? '1週間' : days === 28 ? '4週' : days === 30 ? '1ヶ月' : days === 84 ? '12週' : days === 90 ? '3ヶ月' : days === 365 ? '1年' : days === 0 ? '全期間' : `${days}日間`;
        periodDisplay.textContent = `(${periodText}: ${startDate.toLocaleDateString('ja-JP')}～${endDate.toLocaleDateString('ja-JP')})`;
    }

    let chartData, datasets = [];
    let timeUnit, displayFormat, axisLabel;
    let dateRangeText = '';

    if (days === 1) {
        // 1日表示の場合の処理
        chartData = filteredData.map(entry => {
            const dateTime = entry.time ? 
                new Date(`${entry.date}T${entry.time}:00`) : 
                new Date(`${entry.date}T12:00:00`);
            
            return {
                x: dateTime,
                y: parseFloat(entry.value || entry.weight)
            };
        }).sort((a, b) => a.x - b.x);

        datasets.push({
            label: '体重',
            data: chartData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6
        });
    

        timeUnit = 'hour';
        displayFormat = 'HH:mm';
        axisLabel = '時間';
        const displayDateOffset = new Date();
        dateRangeText = `${displayDateOffset.getMonth() + 1}/${displayDateOffset.getDate()} (1日表示)`;
    } else {
        // 複数日表示：日付軸を使用
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
            datasets.push({
                label: '平均値',
                data: avgData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                pointRadius: 4
            });
    

            if (maxData.length > 0) {
                datasets.push({
                    label: '最大値',
                    data: maxData,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.1,
                    borderDash: [5, 5]
                });
    

                datasets.push({
                    label: '最小値',
                    data: minData,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.1,
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
                pointRadius: 4
            });
    
        }
        
        timeUnit = 'day';
        displayFormat = 'MM/dd';
        axisLabel = '日付';
        
        // 改善された期間表示（window.updateChartWithOffset版）
        if (avgData.length > 0) {
            const dataStartStr = new Date(avgData[0].x).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            const dataEndStr = new Date(avgData[avgData.length - 1].x).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            const periodStartStr = startDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            const periodEndStr = endDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            
            if (avgData.length === 1) {
                // 1日分のデータのみ
                dateRangeText = `${periodStartStr}～${periodEndStr} (データ: ${dataStartStr}のみ)`;
            } else if (dataStartStr === periodStartStr && dataEndStr === periodEndStr) {
                // 期間全体にデータがある
                dateRangeText = `${dataStartStr}～${dataEndStr}`;
            } else {
                // 期間の一部にのみデータがある
                dateRangeText = `${periodStartStr}～${periodEndStr} (データ: ${dataStartStr}～${dataEndStr})`;
            }
        } else {
            // データなしの場合
            const periodStartStr = startDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            const periodEndStr = endDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            dateRangeText = `${periodStartStr}～${periodEndStr} (データなし)`;
        }
    }

    // Chart.js描画
    if (WeightTab.weightChart) {
        WeightTab.weightChart.destroy();
    }

    if (datasets.length === 0 || !datasets[0].data || datasets[0].data.length === 0) {
        log(`📊 表示するデータがありません - 全データ件数:${WeightTab.allWeightData?.length || 0}, フィルタ済み:${filteredData.length}, 期間:${startDate.toDateString()}～${endDate.toDateString()}`);
        
        // データなしメッセージを表示
        const canvas = document.getElementById('weightChart');
        const noDataMsg = document.getElementById('noDataMessage');
        const periodRangeMsg = document.getElementById('periodRangeMessage');
        
        if (canvas) canvas.style.display = 'none';
        if (noDataMsg) {
            noDataMsg.style.display = 'block';
            if (periodRangeMsg) {
                periodRangeMsg.textContent = `${startDate.toLocaleDateString('ja-JP')} ～ ${endDate.toLocaleDateString('ja-JP')}`;
            }
        }
        
        // チャートクリア
        if (WeightTab.weightChart) {
            WeightTab.weightChart.destroy();
            WeightTab.weightChart = null;
        }
        
        // 空のチャートを作成して期間情報を表示 - UniversalChartManager使用
        try {
            if (WeightTab.chartManager) {
                WeightTab.chartManager.destroy();
            }
            WeightTab.chartManager = new UniversalChartManager('weightChart', {
                plugins: {
                    title: {
                        display: true,
                        text: `データなし (${startDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'})}～${endDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'})})`
                    }
                }
            });
            WeightTab.weightChart = WeightTab.chartManager.createLineChart({ label: '', data: [] });
        } catch (error) {
            log(`❌ updateChartWithOffset: 空チャート作成エラー: ${error.message}`);
        }
    
        return;
    }

    // UniversalChartManagerを使用してチャート作成（updateChartWithOffset関数内）
    try {
        if (WeightTab.chartManager) {
            WeightTab.chartManager.destroy();
        }
        
        const chartOptions = {
            plugins: {
                title: {
                    display: true,
                    text: dateRangeText || '期間表示'
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const item = tooltipItems[0];
                            if (days === 1) {
                                return new Date(item.parsed.x).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
                            } else {
                                return new Date(item.parsed.x).toLocaleDateString('ja-JP');
                            }
                        },
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}kg`;
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
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 70,
                    max: 75,
                    title: {
                        display: true,
                        text: '体重 (kg)'
                    }
                }
            }
        };
        
        console.log(`🔍 datasets情報: ${datasets.length}個のdataset`);
        if (datasets.length > 0 && datasets[0].data) {
            console.log(`🔍 第1dataset: ${datasets[0].data.length}個のデータポイント`);
            if (datasets[0].data.length > 0) {
                const firstPoint = datasets[0].data[0];
                const lastPoint = datasets[0].data[datasets[0].data.length - 1];
                console.log(`🔍 データ範囲: ${firstPoint.x} ～ ${lastPoint.x}`);
            }
        }
        
        WeightTab.chartManager = new UniversalChartManager('weightChart', chartOptions);
        WeightTab.weightChart = WeightTab.chartManager.createLineChart(datasets);
        
        if (!WeightTab.weightChart) {
            console.log('❌ updateChartWithOffset: UniversalChartManagerでのチャート作成失敗');
        } else {
            console.log('✅ updateChartWithOffset: UniversalChartManagerでのチャート作成成功');
        }
    } catch (error) {
        log(`❌ updateChartWithOffset: チャート作成エラー: ${error.message}`);
    }
    
    
    // データがある場合はcanvasを表示、メッセージを非表示
    const canvasEl = document.getElementById('weightChart');
    const noDataMsgEl = document.getElementById('noDataMessage');
    if (canvasEl) canvasEl.style.display = 'block';
    if (noDataMsgEl) noDataMsgEl.style.display = 'none';

    log(`📊 グラフ更新完了: ${filteredData.length}件のデータ (期間: ${dateRangeText})`);
};

// グローバルに期間移動関数を公開
window.goToPreviousWeek = function() {
    console.log(`🔴 ボタン押下: goToPreviousWeek() - ${new Date().toLocaleTimeString()}`);
    
    // 事前条件
    console.assert(typeof window.currentDisplayDays !== 'undefined', 'currentDisplayDaysが定義されている必要があります');
    console.assert(window.currentDisplayDays > 0, 'currentDisplayDaysは0より大きい必要があります');
    
    // currentDisplayDaysが未定義の場合は30日をデフォルト設定
    if (typeof window.currentDisplayDays === 'undefined' || window.currentDisplayDays === 0) {
        window.currentDisplayDays = 30;
        console.log(`⚠️ currentDisplayDays未定義のためデフォルト設定: ${window.currentDisplayDays}日`);
    }
    if (typeof window.periodOffset === 'undefined') window.periodOffset = 0;
    
    const beforeOffset = window.periodOffset;
    const displayDays = window.currentDisplayDays; // 表示期間を保持
    
    console.log(`🔍 デバッグ: beforeOffset=${beforeOffset}, displayDays=${displayDays}`);
    
    // 表示期間と同じ分だけ過去に移動（正しい期間移動）
    window.periodOffset += displayDays;
    console.log(`📊 オフセット変更: ${beforeOffset} → ${window.periodOffset} (${displayDays}日前へ)`);
    
    // 事前・事後条件のチェック（契約プログラミング）
    console.assert(window.currentDisplayDays === displayDays, '表示期間が変更されてはいけません');
    console.assert(window.periodOffset === beforeOffset + displayDays, 'オフセットが正しく計算されている必要があります');
    console.assert(window.periodOffset >= 0, 'オフセットは0以上である必要があります');
    
    if (typeof window.updateChartWithOffset === 'function') {
        console.log(`🔧 updateChartWithOffsetを呼び出し: days=${displayDays}, offset=${window.periodOffset}`);
        window.updateChartWithOffset(displayDays, window.periodOffset);
    } else {
        console.log(`❌ updateChartWithOffset関数が見つかりません`);
    }
    console.log(`🔵 goToPreviousWeek完了: ${displayDays}日前の${displayDays}日間を表示 (オフセット: ${window.periodOffset})`);
};

window.goToNextWeek = function() {
    log(`🔴 ボタン押下: goToNextWeek() - ${new Date().toLocaleTimeString()}`);
    if (typeof window.periodOffset === 'undefined' || window.periodOffset <= 0) {
        log(`❌ periodOffset条件不適合: ${window.periodOffset}`);
        return;
    }
    
    // currentDisplayDaysが未定義の場合は30日をデフォルト設定
    if (typeof window.currentDisplayDays === 'undefined' || window.currentDisplayDays === 0) {
        window.currentDisplayDays = 30;
        log(`⚠️ currentDisplayDays未定義のためデフォルト設定: ${window.currentDisplayDays}日`);
    }
    
    const beforeOffset = window.periodOffset;
    const displayDays = window.currentDisplayDays;
    
    // 事前条件（契約プログラミング）
    console.assert(beforeOffset > 0, '前の期間がある状態でなければ次の期間に移動できません');
    console.assert(displayDays > 0, '表示期間は0より大きい必要があります');
    
    window.periodOffset = Math.max(0, window.periodOffset - window.currentDisplayDays);
    log(`📊 オフセット変更: ${beforeOffset} → ${window.periodOffset}`);
    
    // 事後条件（契約プログラミング）
    console.assert(window.periodOffset >= 0, 'オフセットは0以上である必要があります');
    console.assert(window.periodOffset <= beforeOffset, 'オフセットは減少している必要があります');
    
    if (typeof window.updateChartWithOffset === 'function') {
        window.updateChartWithOffset(window.currentDisplayDays, window.periodOffset);
    } else {
        log(`❌ updateChartWithOffset関数が見つかりません`);
    }
    log(`🔵 goToNextWeek完了: ${window.currentDisplayDays}日後の期間に移動`);
};

window.goToThisWeek = function() {
    log(`🔴 ボタン押下: goToThisWeek() - ${new Date().toLocaleTimeString()}`);
    
    // currentDisplayDaysが未定義の場合は30日をデフォルト設定
    if (typeof window.currentDisplayDays === 'undefined' || window.currentDisplayDays === 0) {
        window.currentDisplayDays = 30;
        log(`⚠️ currentDisplayDays未定義のためデフォルト設定: ${window.currentDisplayDays}日`);
    }
    
    const beforeOffset = window.periodOffset;
    const displayDays = window.currentDisplayDays;
    
    // 事前条件（契約プログラミング）
    console.assert(displayDays > 0, '表示期間は0より大きい必要があります');
    
    window.periodOffset = 0;
    log(`📊 オフセットリセット: ${beforeOffset} → ${window.periodOffset}`);
    
    // 事後条件（契約プログラミング）
    console.assert(window.periodOffset === 0, 'オフセットが0にリセットされている必要があります');
    
    // オフセット0の場合は通常のupdateChartを使用
    if (typeof window.updateChart === 'function') {
        window.updateChart(window.currentDisplayDays);
    } else {
        log(`❌ updateChart関数が見つかりません`);
    }
    log(`🔵 goToThisWeek完了: 現在の期間に移動`);
};

log('🏋️ 体重管理タブ (最小化版) 読み込み完了');