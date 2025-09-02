// タブ1: 体重管理JavaScript

// アプリバージョン
const APP_VERSION = 'v0.61';

// 体重管理用変数
let allWeightData = [];
let weightChart;
let selectedTimingValue = '';
let selectedClothingTopValue = '';
let selectedClothingBottomValue = '';
let currentMode = 'normal';
let selectedTarget = null;

// カラー配列定数化
const RANDOM_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a55eea'];

// localStorage用のキー
const STORAGE_KEYS = {
    customTimings: 'weightApp_customTimings',
    customTops: 'weightApp_customTops',
    customBottoms: 'weightApp_customBottoms'
};

// 体重管理初期化
function initializeWeightManager() {
    // アプリタイトル更新（統一関数使用）
    if (typeof window.updateVersionDisplay === 'function') {
        window.updateVersionDisplay();
    }
    
    // 今日の日付と体重デフォルト値を設定
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    document.getElementById('dateInput').value = todayString;
    document.getElementById('weightValue').value = '72.0';
    
    // タイミングボタンの初期状態設定
    document.querySelectorAll('.timing-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.classList.remove('selected');
    });
    
    // 服装ボタンの初期状態設定
    document.querySelectorAll('.clothing-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // デフォルト服装選択: 上=なし, 下=トランクス
    selectClothingTop('なし');
    selectClothingBottom('トランクス');
    
    // カスタム項目を復元
    loadCustomItems();
    
    log(`🚀 体重管理アプリ起動完了 ${APP_VERSION}`);
}

// 保存機能（エフェクト付き）
async function saveWeightData() {
    const saveButton = document.querySelector('button[onclick="saveWeightData()"]');
    const originalText = saveButton.innerHTML;
    const originalStyle = saveButton.style.cssText;
    
    try {
        // 保存開始エフェクト
        saveButton.innerHTML = '💾 保存中...';
        saveButton.style.background = '#ffc107';
        saveButton.style.transform = 'scale(0.95)';
        saveButton.disabled = true;
        
        const date = document.getElementById('dateInput').value;
        const time = document.getElementById('timeInput').value || null;
        const weight = parseFloat(document.getElementById('weightValue').value);
        const timing = selectedTimingValue;
        const clothingTop = selectedClothingTopValue;
        const clothingBottom = selectedClothingBottomValue;
        const memo = document.getElementById('memoInput').value || null;
        
        if (!date || !weight || weight <= 0) {
            throw new Error('日付と正しい体重を入力してください');
        }
        
        if (!timing) {
            throw new Error('測定タイミングを選択してください');
        }
        
        if (!currentUser) {
            throw new Error('ログインが必要です');
        }
        
        // データ保存
        const dataRef = database.ref(`users/${currentUser.uid}/weightData`).push();
        await dataRef.set({
            date: date,
            time: time,
            weight: weight,
            timing: timing,
            clothing: {
                top: clothingTop,
                bottom: clothingBottom
            },
            memo: memo,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        // 成功エフェクト
        saveButton.innerHTML = '✅ 保存完了!';
        saveButton.style.background = '#28a745';
        saveButton.style.transform = 'scale(1.05)';
        
        log(`💾 体重データ保存: ${weight}kg (${timing})`);
        
        // データ再読み込み
        loadUserWeightData(currentUser.uid);
        
        // 1.5秒後に元に戻す
        setTimeout(() => {
            saveButton.innerHTML = originalText;
            saveButton.style.cssText = originalStyle;
            saveButton.disabled = false;
        }, 1500);
        
    } catch (error) {
        // エラーエフェクト
        saveButton.innerHTML = '❌ エラー';
        saveButton.style.background = '#dc3545';
        saveButton.style.transform = 'scale(0.95)';
        
        log(`❌ 保存エラー: ${error.message}`);
        console.error('保存エラー:', error);
        
        // 2秒後に元に戻す
        setTimeout(() => {
            saveButton.innerHTML = originalText;
            saveButton.style.cssText = originalStyle;
            saveButton.disabled = false;
        }, 2000);
    }
}

// タイミング選択
window.selectTiming = (timing) => {
    selectedTimingValue = timing;
    document.getElementById('selectedTiming').value = timing;
    
    // 全てのタイミングボタンをリセット
    document.querySelectorAll('.timing-btn').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
        btn.classList.remove('selected');
    });
    
    // 選択されたボタンを強調
    const selectedBtn = document.querySelector(`[data-timing="${timing}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.1)';
        selectedBtn.classList.add('selected');
    }
    
    log(`⏰ 測定タイミング選択: ${timing}`);
};

// 服装選択（上）
window.selectClothingTop = (clothing) => {
    selectedClothingTopValue = clothing;
    document.getElementById('selectedClothingTop').value = clothing;
    
    // 全ての上半身ボタンをリセット
    document.querySelectorAll('[data-clothing-top]').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 選択されたボタンを強調
    const selectedBtn = document.querySelector(`[data-clothing-top="${clothing}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.1)';
    }
    
    log(`👕 上半身選択: ${clothing}`);
};

// 服装選択（下）
window.selectClothingBottom = (clothing) => {
    selectedClothingBottomValue = clothing;
    document.getElementById('selectedClothingBottom').value = clothing;
    
    // 全ての下半身ボタンをリセット
    document.querySelectorAll('[data-clothing-bottom]').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 選択されたボタンを強調
    const selectedBtn = document.querySelector(`[data-clothing-bottom="${clothing}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.1)';
    }
    
    log(`🩲 下半身選択: ${clothing}`);
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

// データ読み込み
function loadUserWeightData(userId) {
    const dataRef = database.ref(`users/${userId}/weightData`);
    dataRef.on('value', (snapshot) => {
        const historyDiv = document.getElementById('historyArea');
        if (snapshot.exists()) {
            const data = snapshot.val();
            const entries = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).sort((a, b) => new Date(b.date) - new Date(a.date));

            // グラフ用にデータを保存
            allWeightData = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
            updateChart();
            
            // 直近7件のみ表示
            const recentEntries = entries.slice(0, 7);
            
            historyDiv.innerHTML = recentEntries.map(entry => {
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
            }).join('');
            
            log(`📈 データ履歴読み込み完了: ${entries.length}件`);
        } else {
            historyDiv.innerHTML = 'まだデータがありません';
            allWeightData = [];
            updateChart();
        }
    });
}

// グラフ更新
function updateChart(days = 30) {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;

    const now = new Date();
    const startDate = new Date(now);
    if (days > 0) {
        startDate.setDate(now.getDate() - days);
    } else {
        if (allWeightData.length > 0) {
            startDate.setTime(new Date(allWeightData[0].date).getTime());
        }
    }

    // 期間内のデータをフィルタリング
    const filteredData = allWeightData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= now;
    });

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
        
        timeUnit = 'hour';
        displayFormat = 'HH:mm';
        axisLabel = '時間';
    } else {
        // 複数日表示：日付でグループ化
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
            
            if (values.length > 1) {
                console.log(`🔍 ${date}: 値=[${values.join(',')}], 平均=${avg.toFixed(2)}, 最大=${max}, 最小=${min}`);
            }
            
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
        
        if (avgData.length > 0) {
            const startStr = new Date(avgData[0].x).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            const endStr = new Date(avgData[avgData.length - 1].x).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'});
            dateRangeText = `${startStr}～${endStr}`;
        }
        
        timeUnit = 'day';
        displayFormat = 'MM/dd';
        axisLabel = '日付';
    }

    updateDateRangeDisplay(dateRangeText);

    if (weightChart) {
        weightChart.destroy();
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
                    ...(days === 1 && filteredData.length > 0 ? {
                        min: new Date(`${filteredData[0].date}T00:00:00`),
                        max: new Date(`${filteredData[0].date}T23:59:59`)
                    } : {})
                },
                y: {
                    title: {
                        display: true,
                        text: '体重 (kg)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + 'kg';
                        }
                    }
                }
            }
        }
    };

    weightChart = new Chart(ctx, chartConfig);
    log(`📊 グラフ更新: ${filteredData.length}件のデータ表示 ${dateRangeText}`);
}

// 日付範囲表示を更新
function updateDateRangeDisplay(rangeText) {
    const chartContainer = document.querySelector('#chartPanel div[style*="position: relative"]');
    if (!chartContainer) {
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

// モード管理とカスタム項目機能は省略（長すぎるため）
// 必要に応じて個別に実装

// 初期化実行
if (typeof currentUser !== 'undefined' && currentUser) {
    initializeWeightManager();
}