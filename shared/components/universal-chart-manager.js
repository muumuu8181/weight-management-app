// 統一Chart.js管理システム
// 全タブのグラフ描画を標準化

class UniversalChartManager {
    
    constructor(canvasId, options = {}) {
        this.canvasId = canvasId;
        this.chart = null;
        this.defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const item = tooltipItems[0];
                            return new Date(item.parsed.x).toLocaleDateString('ja-JP');
                        },
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MM/dd'
                        }
                    },
                    title: {
                        display: true,
                        text: '日付'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '値'
                    }
                }
            }
        };
        
        // カスタムオプションをマージ
        this.chartOptions = this.mergeOptions(this.defaultOptions, options);
    }
    
    // オプションマージ
    mergeOptions(defaults, custom) {
        const result = JSON.parse(JSON.stringify(defaults));
        
        Object.keys(custom).forEach(key => {
            if (typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
                result[key] = { ...result[key], ...custom[key] };
            } else {
                result[key] = custom[key];
            }
        });
        
        return result;
    }
    
    // 線グラフ作成
    createLineChart(data, datasetOptions = {}) {
        return this.createChart('line', data, datasetOptions);
    }
    
    // 棒グラフ作成
    createBarChart(data, datasetOptions = {}) {
        return this.createChart('bar', data, datasetOptions);
    }
    
    // 基本グラフ作成
    createChart(type, data, datasetOptions = {}) {
        try {
            const canvas = document.getElementById(this.canvasId);
            if (!canvas) {
                throw new Error(`Canvas element not found: ${this.canvasId}`);
            }
            
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js library not loaded');
            }
            
            // 既存チャートを破棄
            this.destroy();
            
            const ctx = canvas.getContext('2d');
            
            // データセット準備
            const datasets = Array.isArray(data) ? data : [data];
            const processedDatasets = datasets.map((dataset, index) => ({
                label: dataset.label || `データセット${index + 1}`,
                data: dataset.data || [],
                borderColor: dataset.borderColor || this.getDefaultColor(index),
                backgroundColor: dataset.backgroundColor || this.getDefaultBackgroundColor(index),
                tension: dataset.tension || 0.1,
                pointRadius: dataset.pointRadius || 4,
                pointHoverRadius: dataset.pointHoverRadius || 6,
                ...datasetOptions
            }));
            
            // チャート作成
            this.chart = new Chart(ctx, {
                type: type,
                data: {
                    datasets: processedDatasets
                },
                options: this.chartOptions
            });
            
            console.log(`📊 ${type}チャート作成完了: ${this.canvasId}`);
            return this.chart;
            
        } catch (error) {
            UniversalErrorHandler.logError(error, `Chart作成 (${this.canvasId})`);
            return null;
        }
    }
    
    // 体重グラフ特化メソッド（最大値・最小値対応版）
    createWeightChart(weightData, days = 30) {
        console.log('🟢🟢🟢 UniversalChartManager.createWeightChart呼び出し!!! days=' + days);
        console.log('🟢🟢🟢 この関数が呼ばれていたら古いバージョン!!!');
        
        try {
            const now = new Date();
            const startDate = new Date(now);
            
            if (days > 0) {
                startDate.setDate(now.getDate() - days);
            }
            
            // データフィルタリング
            const filteredData = weightData.filter(entry => {
                const entryDate = new Date(entry.date);
                return days <= 0 || (entryDate >= startDate && entryDate <= now);
            });
            
            let datasets = [];
            
            if (days === 1) {
                // 1日表示：時刻別データ
                const chartData = filteredData.map(entry => {
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
                
                // 1日表示用のオプション設定
                this.chartOptions.scales.x = {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'HH:mm'
                        }
                    },
                    title: {
                        display: true,
                        text: '時間'
                    }
                };
            } else {
                // 複数日表示：日付ごとにグループ化
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
                    if (values.length > 1) {
                        maxData.push({ x: date, y: max });
                        minData.push({ x: date, y: min });
                    }
                });
                
                // 平均値データセット
                datasets.push({
                    label: '平均値',
                    data: avgData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    pointRadius: 4
                });
                
                // 複数測定がある日が存在する場合のみ最大値・最小値を表示
                if (maxData.length > 0) {
                    datasets.push({
                        label: '最大値',
                        data: maxData,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        tension: 0.1,
                        borderDash: [5, 5],
                        pointRadius: 3
                    });
                    
                    datasets.push({
                        label: '最小値',
                        data: minData,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        tension: 0.1,
                        borderDash: [5, 5],
                        pointRadius: 3
                    });
                }
            }
            
            // y軸設定を体重用に調整
            const weightOptions = {
                scales: {
                    ...this.chartOptions.scales,
                    y: {
                        ...this.chartOptions.scales.y,
                        title: {
                            display: true,
                            text: '体重 (kg)'
                        }
                    }
                }
            };
            
            this.chartOptions = { ...this.chartOptions, ...weightOptions };
            
            return this.createLineChart(datasets);
            
        } catch (error) {
            UniversalErrorHandler.logError(error, '体重グラフ作成');
            return null;
        }
    }
    
    // データ更新
    updateData(newData) {
        if (!this.chart) return false;
        
        try {
            if (Array.isArray(newData)) {
                this.chart.data.datasets = newData;
            } else {
                this.chart.data.datasets[0].data = newData;
            }
            
            this.chart.update();
            console.log(`📊 チャートデータ更新完了: ${this.canvasId}`);
            return true;
            
        } catch (error) {
            UniversalErrorHandler.logError(error, `チャートデータ更新 (${this.canvasId})`);
            return false;
        }
    }
    
    // チャート破棄
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
    
    // デフォルトカラー取得
    getDefaultColor(index) {
        const colors = [
            '#007bff', '#28a745', '#dc3545', '#ffc107',
            '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'
        ];
        return colors[index % colors.length];
    }
    
    // デフォルト背景色取得
    getDefaultBackgroundColor(index) {
        const colors = [
            'rgba(0, 123, 255, 0.2)', 'rgba(40, 167, 69, 0.2)', 
            'rgba(220, 53, 69, 0.2)', 'rgba(255, 193, 7, 0.2)',
            'rgba(23, 162, 184, 0.2)', 'rgba(111, 66, 193, 0.2)',
            'rgba(253, 126, 20, 0.2)', 'rgba(32, 201, 151, 0.2)'
        ];
        return colors[index % colors.length];
    }
}

// 静的メソッド（クイックアクセス）
UniversalChartManager.create = (canvasId, type, data, options = {}) => {
    const manager = new UniversalChartManager(canvasId, options);
    return manager.createChart(type, data);
};

UniversalChartManager.createWeight = (canvasId, weightData, days = 30) => {
    const manager = new UniversalChartManager(canvasId);
    return manager.createWeightChart(weightData, days);
};

// グローバルに公開
window.UniversalChartManager = UniversalChartManager;

console.log('📊 統一Chart.js管理システム読み込み完了');