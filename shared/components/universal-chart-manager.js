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
    
    // 体重グラフ特化メソッド
    createWeightChart(weightData, days = 30) {
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
            
            // Chart.js用データ変換
            const chartData = filteredData.map(entry => ({
                x: entry.date,
                y: parseFloat(entry.value || entry.weight)
            }));
            
            const dataset = {
                label: '体重 (kg)',
                data: chartData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)'
            };
            
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
            
            return this.createLineChart(dataset);
            
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