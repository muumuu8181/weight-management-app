// ビジュアルレポート生成ツール - HTML形式の詳細分析レポート
// チャート・グラフ・テーブルを含む包括的なコードメトリクス表示

const fs = require('fs');
const path = require('path');
const CodeMetricsAnalyzer = require('./code-metrics-analyzer');

class VisualReportGenerator {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.reportsDir = path.join(projectRoot, 'tools', 'reports');
        this.analyzer = new CodeMetricsAnalyzer(projectRoot);
    }
    
    // ビジュアルレポート生成
    async generateVisualReport(includeComparison = true) {
        console.log('🎨 ビジュアルレポート生成開始...');
        
        // 最新メトリクス取得
        const currentMetrics = await this.analyzer.analyzeProject();
        
        // 比較データ取得（オプション）
        let comparisonData = null;
        if (includeComparison) {
            const previousData = this.analyzer.getLatestMetrics();
            if (previousData && previousData.timestamp !== currentMetrics.timestamp) {
                comparisonData = this.generateComparisonData(previousData, currentMetrics);
            }
        }
        
        // HTMLレポート生成
        const html = this.generateHTML(currentMetrics, comparisonData);
        
        // 保存
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const htmlPath = path.join(this.reportsDir, `code-metrics-visual-${timestamp}.html`);
        
        fs.writeFileSync(htmlPath, html, 'utf8');
        
        console.log(`🎨 ビジュアルレポート保存: ${htmlPath}`);
        return htmlPath;
    }
    
    // HTML生成
    generateHTML(metrics, comparisonData) {
        const timestamp = new Date().toLocaleString('ja-JP');
        
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>コードメトリクス分析レポート</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #007bff, #0056b3); color: white; border-radius: 8px; }
        .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #007bff; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .metric { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
        .metric:last-child { border-bottom: none; }
        .chart-container { height: 400px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .increase { color: #dc3545; }
        .decrease { color: #28a745; }
        .stable { color: #6c757d; }
        .highlight { background: #fff3cd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 体重管理アプリ コードメトリクス分析レポート</h1>
            <p>生成日時: ${timestamp}</p>
        </div>
        
        ${this.generateCurrentMetricsSection(metrics)}
        
        ${comparisonData ? this.generateComparisonSection(comparisonData) : ''}
        
        ${this.generateChartsSection(metrics)}
        
        ${this.generateDetailTablesSection(metrics)}
        
        <div class="section">
            <h3>📋 分析結果サマリー</h3>
            <div class="card">
                ${this.generateSummaryHTML(metrics, comparisonData)}
            </div>
        </div>
        
        <script>
            ${this.generateChartScripts(metrics, comparisonData)}
        </script>
    </div>
</body>
</html>`;
    }
    
    // 現在メトリクスセクション
    generateCurrentMetricsSection(metrics) {
        const total = this.analyzer.calculateTotal ? this.analyzer.calculateTotal(metrics) : 0;
        
        return `
        <div class="section">
            <h3>📈 現在のコード構成</h3>
            <div class="grid">
                <div class="card">
                    <h4>🎯 総合統計</h4>
                    <div class="metric"><span>総行数</span><span><strong>${total.toLocaleString()}行</strong></span></div>
                    <div class="metric"><span>タブ数</span><span>${Object.keys(metrics.tabs).length}個</span></div>
                    <div class="metric"><span>共通機能数</span><span>${Object.keys(metrics.shared).length}個</span></div>
                </div>
                
                <div class="card">
                    <h4>📊 タブ機能</h4>
                    ${Object.entries(metrics.tabs).map(([name, data]) => 
                        `<div class="metric"><span>${name}</span><span>${data.total}行</span></div>`
                    ).join('')}
                </div>
                
                <div class="card">
                    <h4>🔗 共通機能</h4>
                    ${Object.entries(metrics.shared).map(([name, data]) => 
                        `<div class="metric"><span>shared/${name}</span><span>${data.total}行</span></div>`
                    ).join('')}
                </div>
            </div>
        </div>`;
    }
    
    // 比較セクション（ビフォーアフターテーブル）
    generateComparisonSection(comparisonData) {
        return `
        <div class="section">
            <h3>🔄 バージョン比較（ビフォーアフター）</h3>
            <div class="card">
                <h4>📊 変化サマリー</h4>
                <div class="metric highlight">
                    <span>総行数変化</span>
                    <span class="${comparisonData.summary.totalChange >= 0 ? 'increase' : 'decrease'}">
                        ${comparisonData.summary.fromTotal} → ${comparisonData.summary.toTotal} 
                        (${comparisonData.summary.totalChange >= 0 ? '+' : ''}${comparisonData.summary.totalChange}行, ${comparisonData.summary.changePercent}%)
                    </span>
                </div>
                
                <h4>📱 タブ別変化</h4>
                <table>
                    <thead>
                        <tr><th>タブ名</th><th>Before</th><th>After</th><th>変化</th><th>変化率</th><th>状態</th></tr>
                    </thead>
                    <tbody>
                        ${comparisonData.tabChanges.map(change => `
                            <tr>
                                <td>${change.name}</td>
                                <td>${change.from}行</td>
                                <td>${change.to}行</td>
                                <td class="${change.change >= 0 ? 'increase' : 'decrease'}">${change.change >= 0 ? '+' : ''}${change.change}行</td>
                                <td>${change.changePercent}%</td>
                                <td>${change.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <h4>🔗 共通機能変化</h4>
                <table>
                    <thead>
                        <tr><th>機能</th><th>Before</th><th>After</th><th>変化</th><th>変化率</th><th>状態</th></tr>
                    </thead>
                    <tbody>
                        ${comparisonData.sharedChanges.map(change => `
                            <tr>
                                <td>${change.name}</td>
                                <td>${change.from}行</td>
                                <td>${change.to}行</td>
                                <td class="${change.change >= 0 ? 'increase' : 'decrease'}">${change.change >= 0 ? '+' : ''}${change.change}行</td>
                                <td>${change.changePercent}%</td>
                                <td>${change.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    }
    
    // チャートセクション
    generateChartsSection(metrics) {
        return `
        <div class="section">
            <h3>📊 コード構成チャート</h3>
            <div class="grid">
                <div class="card">
                    <h4>タブ別行数分布</h4>
                    <div class="chart-container">
                        <canvas id="tabDistributionChart"></canvas>
                    </div>
                </div>
                
                <div class="card">
                    <h4>機能分類別構成</h4>
                    <div class="chart-container">
                        <canvas id="categoryPieChart"></canvas>
                    </div>
                </div>
            </div>
        </div>`;
    }
    
    // 詳細テーブルセクション
    generateDetailTablesSection(metrics) {
        return `
        <div class="section">
            <h3>📋 詳細ファイル一覧</h3>
            ${Object.entries(metrics.tabs).map(([tabName, tabData]) => `
                <div class="card">
                    <h4>${tabName} (${tabData.total}行)</h4>
                    <table>
                        <thead><tr><th>ファイル</th><th>行数</th><th>種類</th></tr></thead>
                        <tbody>
                            ${Object.entries(tabData.files).map(([file, lines]) => `
                                <tr>
                                    <td>${file}</td>
                                    <td>${lines}行</td>
                                    <td>${path.extname(file).substring(1).toUpperCase()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('')}
        </div>`;
    }
    
    // サマリーHTML
    generateSummaryHTML(metrics, comparisonData) {
        const tabTotal = Object.values(metrics.tabs).reduce((sum, tab) => sum + tab.total, 0);
        const sharedTotal = Object.values(metrics.shared).reduce((sum, shared) => sum + shared.total, 0);
        const grandTotal = tabTotal + sharedTotal + metrics.core.total;
        const sharedRatio = (sharedTotal / grandTotal * 100).toFixed(1);
        
        let summary = `
            <div class="metric"><span>🎯 共通化効率</span><span><strong>${sharedRatio}%</strong></span></div>
            <div class="metric"><span>📱 タブ固有率</span><span>${((tabTotal/grandTotal)*100).toFixed(1)}%</span></div>
            <div class="metric"><span>🔒 Core率</span><span>${((metrics.core.total/grandTotal)*100).toFixed(1)}%</span></div>
        `;
        
        if (comparisonData) {
            summary += `
                <div class="metric highlight">
                    <span>📈 総変化</span>
                    <span class="${comparisonData.summary.totalChange >= 0 ? 'increase' : 'decrease'}">
                        ${comparisonData.summary.totalChange >= 0 ? '+' : ''}${comparisonData.summary.totalChange}行 (${comparisonData.summary.changePercent}%)
                    </span>
                </div>
            `;
        }
        
        return summary;
    }
    
    // チャートスクリプト生成
    generateChartScripts(metrics, comparisonData) {
        const tabData = Object.entries(metrics.tabs).map(([name, data]) => ({
            label: name,
            value: data.total
        }));
        
        const categoryData = [
            { label: 'タブ機能', value: Object.values(metrics.tabs).reduce((sum, tab) => sum + tab.total, 0) },
            { label: '共通機能', value: Object.values(metrics.shared).reduce((sum, shared) => sum + shared.total, 0) },
            { label: 'Core機能', value: metrics.core.total },
            { label: 'その他', value: Object.values(metrics.other).reduce((sum, lines) => sum + lines, 0) }
        ];
        
        return `
        // タブ別分布チャート
        const tabCtx = document.getElementById('tabDistributionChart').getContext('2d');
        new Chart(tabCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(tabData.map(d => d.label))},
                datasets: [{
                    label: '行数',
                    data: ${JSON.stringify(tabData.map(d => d.value))},
                    backgroundColor: [
                        '#007bff', '#6f42c1', '#28a745', '#ffc107', 
                        '#dc3545', '#17a2b8', '#fd7e14', '#6c757d'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });
        
        // 機能分類円グラフ
        const categoryCtx = document.getElementById('categoryPieChart').getContext('2d');
        new Chart(categoryCtx, {
            type: 'pie',
            data: {
                labels: ${JSON.stringify(categoryData.map(d => d.label))},
                datasets: [{
                    data: ${JSON.stringify(categoryData.map(d => d.value))},
                    backgroundColor: ['#007bff', '#28a745', '#dc3545', '#ffc107']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
        `;
    }
    
    // 比較データ生成
    generateComparisonData(fromData, toData) {
        return {
            fromTimestamp: fromData.timestamp,
            toTimestamp: toData.timestamp,
            summary: {
                fromTotal: this.calculateTotal(fromData),
                toTotal: this.calculateTotal(toData),
                get totalChange() { return this.toTotal - this.fromTotal; },
                get changePercent() { return this.fromTotal > 0 ? ((this.totalChange / this.fromTotal) * 100).toFixed(1) : 0; }
            },
            tabChanges: this.compareCategories(fromData.tabs, toData.tabs),
            sharedChanges: this.compareCategories(fromData.shared, toData.shared)
        };
    }
    
    // カテゴリ比較
    compareCategories(fromCat, toCat) {
        const changes = [];
        const allNames = new Set([...Object.keys(fromCat), ...Object.keys(toCat)]);
        
        allNames.forEach(name => {
            const from = fromCat[name]?.total || 0;
            const to = toCat[name]?.total || 0;
            const change = to - from;
            
            changes.push({
                name: name,
                from: from,
                to: to,
                change: change,
                changePercent: from > 0 ? ((change / from) * 100).toFixed(1) : 'N/A',
                status: change > 0 ? '増加' : change < 0 ? '削減' : '変更なし'
            });
        });
        
        return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    }
    
    // 総計計算
    calculateTotal(data) {
        let total = 0;
        Object.values(data.tabs).forEach(tab => total += tab.total);
        Object.values(data.shared).forEach(shared => total += shared.total);
        total += data.core.total;
        Object.values(data.other).forEach(lines => total += lines);
        return total;
    }
}

// CLI実行
async function main() {
    const projectRoot = process.cwd();
    const generator = new VisualReportGenerator(projectRoot);
    
    try {
        const reportPath = await generator.generateVisualReport(true);
        console.log('\n🎉 ビジュアルレポート生成完了');
        console.log(`📱 ブラウザで開く: file://${reportPath}`);
    } catch (error) {
        console.error('❌ レポート生成エラー:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = VisualReportGenerator;