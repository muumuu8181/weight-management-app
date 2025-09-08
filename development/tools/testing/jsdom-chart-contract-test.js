#!/usr/bin/env node
/**
 * Chart.js統合の契約プログラミングテスト（JSDOM環境）
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');

class ChartContractTester {
    constructor() {
        this.results = [];
        this.logs = [];
        this.errors = [];
    }

    setupVirtualBrowser() {
        console.log('🎨 Chart.js仮想ブラウザ環境を構築...');
        
        // Chart.js統合問題を再現するためのHTML
        const dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Chart.js Contract Test</title>
            </head>
            <body>
                <canvas id="weightChart" width="400" height="200"></canvas>
                <canvas id="testChart" width="300" height="150"></canvas>
                <div id="testDiv"></div>
            </body>
            </html>
        `, {
            url: 'http://localhost:3000/',
            pretendToBeVisual: true
        });

        this.window = dom.window;
        this.document = dom.window.document;
        global.window = this.window;
        global.document = this.document;
        global.location = this.window.location;

        // Chart.js モック（実際の前期間ボタン問題を再現）
        this.window.Chart = class MockChart {
            constructor(ctx, config) {
                if (!ctx) throw new Error('Canvas context is required');
                this.ctx = ctx;
                this.config = config;
                this.data = config.data || { datasets: [] };
                this.canvas = ctx.canvas || { id: 'unknown' };
                console.log(`Chart created on ${this.canvas.id}`);
            }
            
            update() {
                console.log(`Chart.update() called on ${this.canvas.id}`);
            }
            
            destroy() {
                console.log(`Chart.destroy() called on ${this.canvas.id}`);
            }
        };

        return this.window;
    }

    loadContracts() {
        console.log('📋 契約プログラミングライブラリを読み込み...');
        
        try {
            const contractPath = path.join(__dirname, '../../../shared/utils/contract.js');
            const contractCode = fs.readFileSync(contractPath, 'utf8');
            this.window.eval(contractCode);
            console.log('✅ 契約ライブラリ読み込み完了');
        } catch (error) {
            console.log('❌ 契約ライブラリ読み込み失敗:', error.message);
            throw error;
        }
    }

    createMockChartManager() {
        console.log('📊 Chart管理システムを模擬作成...');
        
        // UniversalChartManagerの模擬（契約付き）
        this.window.UniversalChartManager = {
            createChart: function(canvasId, data, options) {
                // 契約チェック
                window.Contract.require(typeof canvasId === 'string', 'canvasIdは文字列である必要があります');
                window.Contract.requireElement(canvasId, `Canvas要素 ${canvasId} が存在する必要があります`);
                window.Contract.require(typeof window.Chart !== 'undefined', 'Chart.jsライブラリが必要です');
                window.Contract.require(data && typeof data === 'object', 'データはオブジェクトである必要があります');
                
                const canvas = document.getElementById(canvasId);
                const ctx = canvas.getContext('2d');
                
                const chart = new window.Chart(ctx, {
                    type: options?.type || 'line',
                    data: data,
                    options: options || {}
                });
                
                // 事後条件
                window.Contract.ensure(chart instanceof window.Chart, 'チャートインスタンスが作成される必要があります');
                window.Contract.ensure(chart.canvas.id === canvasId, 'チャートが正しいcanvasに紐付けられる必要があります');
                
                return chart;
            },
            
            addDataset: function(chart, dataset) {
                // 契約チェック
                window.Contract.require(chart && chart.data, 'チャートインスタンスが必要です');
                window.Contract.require(dataset && typeof dataset === 'object', 'データセットはオブジェクトである必要があります');
                
                const oldCount = chart.data.datasets.length;
                
                chart.data.datasets.push(dataset);
                chart.update();
                
                // 事後条件
                window.Contract.ensure(chart.data.datasets.length === oldCount + 1, 'データセットが追加される必要があります');
            }
        };
    }

    createPreviousPeriodFunction() {
        console.log('📈 前期間ボタン機能を模擬作成...');
        
        // 前期間ボタン問題を再現する関数（契約付き）
        this.window.togglePreviousPeriod = function() {
            // 事前条件（実際のコードで不足している契約）
            window.Contract.require(typeof WeightTab !== 'undefined', 'WeightTabオブジェクトが必要です');
            window.Contract.require(WeightTab.chart, 'チャートが初期化されている必要があります');
            window.Contract.require(WeightTab.chart.data, 'チャートデータが存在する必要があります');
            window.Contract.require(Array.isArray(WeightTab.chart.data.datasets), 'datasetsは配列である必要があります');
            window.Contract.require(typeof showPreviousPeriod !== 'undefined', 'showPreviousPeriod変数が定義されている必要があります');
            
            const oldDatasetCount = WeightTab.chart.data.datasets.length;
            
            showPreviousPeriod = !showPreviousPeriod;
            
            if (showPreviousPeriod) {
                // 前期間データを追加（模擬）
                const previousData = [
                    { x: '2024-01-01', y: 70 },
                    { x: '2024-01-02', y: 69.5 }
                ];
                
                WeightTab.chart.data.datasets.push({
                    label: '前期間',
                    data: previousData,
                    borderColor: 'rgba(255, 99, 132, 0.5)'
                });
            } else {
                // 前期間データを削除
                WeightTab.chart.data.datasets = WeightTab.chart.data.datasets.filter(
                    dataset => dataset.label !== '前期間'
                );
            }
            
            // 事後条件（実際のコードで不足している契約）
            window.Contract.ensure(
                showPreviousPeriod ? 
                    WeightTab.chart.data.datasets.length === oldDatasetCount + 1 : 
                    WeightTab.chart.data.datasets.length <= oldDatasetCount,
                '前期間表示状態とデータセット数が一致する必要があります'
            );
            
            WeightTab.chart.update();
            
            // 不変条件
            window.Contract.invariant(WeightTab.chart instanceof window.Chart, 'チャートインスタンスが保持されている必要があります');
        };
        
        // WeightTabオブジェクトを模擬作成
        this.window.WeightTab = {};
        this.window.showPreviousPeriod = false;
    }

    runTest(name, testFn) {
        try {
            console.log(`\n🧪 ${name}`);
            const result = testFn();
            console.log(`✅ ${name}: 成功`);
            this.results.push({ name, status: 'success', result });
            return { success: true, result };
        } catch (error) {
            console.log(`❌ ${name}: 失敗 - ${error.message}`);
            this.results.push({ name, status: 'failed', error: error.message });
            this.errors.push({ test: name, error });
            return { success: false, error };
        }
    }

    async runAllTests() {
        console.log('🚀 Chart.js契約プログラミングテスト開始\n');
        
        this.setupVirtualBrowser();
        this.loadContracts();
        this.createMockChartManager();
        this.createPreviousPeriodFunction();
        
        // テスト1: Chart.js基本契約
        const test1 = this.runTest('Chart.js基本契約テスト', () => {
            const data = {
                labels: ['1月', '2月'],
                datasets: [{ 
                    label: '体重',
                    data: [70, 69],
                    borderColor: 'blue'
                }]
            };
            
            const chart = this.window.UniversalChartManager.createChart('testChart', data, { type: 'line' });
            return {
                chartCreated: chart instanceof this.window.Chart,
                canvasId: chart.canvas.id,
                datasetCount: chart.data.datasets.length
            };
        });

        // テスト2: Chart.js契約違反検出
        const test2 = this.runTest('Chart.js契約違反検出', () => {
            try {
                // 存在しないcanvas IDでチャート作成を試みる
                this.window.UniversalChartManager.createChart('nonExistentCanvas', {}, {});
                throw new Error('契約違反が検出されませんでした');
            } catch (e) {
                if (e.message.includes('見つかりません') || e.message.includes('契約違反')) {
                    return { contractViolationDetected: true, message: e.message };
                }
                throw e;
            }
        });

        // テスト3: 前期間ボタン問題の契約検出
        const test3 = this.runTest('前期間ボタン契約テスト - 正常系', () => {
            // 正常な状態でWeightTabを初期化
            this.window.WeightTab.chart = this.window.UniversalChartManager.createChart('weightChart', {
                labels: ['1月', '2月', '3月'],
                datasets: [{
                    label: '現在',
                    data: [70, 69, 68],
                    borderColor: 'blue'
                }]
            }, { type: 'line' });
            
            const initialCount = this.window.WeightTab.chart.data.datasets.length;
            
            // 前期間表示をトグル
            this.window.togglePreviousPeriod();
            
            return {
                initialDatasetCount: initialCount,
                afterToggleCount: this.window.WeightTab.chart.data.datasets.length,
                showPreviousPeriod: this.window.showPreviousPeriod,
                hasMetExpectedContract: this.window.WeightTab.chart.data.datasets.length === initialCount + 1
            };
        });

        // テスト4: 前期間ボタン問題の契約違反検出
        const test4 = this.runTest('前期間ボタン契約違反検出', () => {
            // WeightTabを未初期化状態にして契約違反を誘発
            delete this.window.WeightTab.chart;
            
            try {
                this.window.togglePreviousPeriod();
                throw new Error('契約違反が検出されませんでした');
            } catch (e) {
                if (e.message.includes('初期化') || e.message.includes('契約違反')) {
                    return { 
                        contractViolationDetected: true, 
                        message: e.message,
                        violationType: 'chart_not_initialized'
                    };
                }
                throw e;
            }
        });

        // テスト5: データセット整合性契約
        const test5 = this.runTest('データセット整合性契約', () => {
            // チャートを再初期化
            this.window.WeightTab.chart = this.window.UniversalChartManager.createChart('weightChart', {
                labels: ['1月'],
                datasets: [{ label: '現在', data: [70], borderColor: 'blue' }]
            }, { type: 'line' });
            
            const dataset = { 
                label: '追加データ', 
                data: [68], 
                borderColor: 'red' 
            };
            
            this.window.UniversalChartManager.addDataset(this.window.WeightTab.chart, dataset);
            
            return {
                finalDatasetCount: this.window.WeightTab.chart.data.datasets.length,
                hasAddedDataset: this.window.WeightTab.chart.data.datasets.some(d => d.label === '追加データ')
            };
        });

        // 結果のサマリー
        console.log('\n' + '='.repeat(60));
        console.log('📊 Chart.js契約プログラミングテスト結果');
        console.log('='.repeat(60));
        
        const successful = this.results.filter(r => r.status === 'success').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        
        console.log(`✅ 成功: ${successful}`);
        console.log(`❌ 失敗: ${failed}`);
        console.log(`合計: ${this.results.length}`);

        if (failed > 0) {
            console.log('\n❌ 失敗したテスト:');
            this.errors.forEach((error, i) => {
                console.log(`${i + 1}. ${error.test}: ${error.error.message}`);
            });
        }

        // 詳細なテスト結果を返す
        return {
            summary: { successful, failed, total: this.results.length },
            results: this.results,
            logs: this.logs,
            errors: this.errors
        };
    }
}

// 実行
if (require.main === module) {
    const tester = new ChartContractTester();
    tester.runAllTests()
        .then(results => {
            // 結果をJSONで出力（F12開発者ツールのようなデータ取得）
            console.log('\n📋 詳細結果（JSON形式）:');
            console.log(JSON.stringify(results, null, 2));
            
            process.exit(results.summary.failed === 0 ? 0 : 1);
        })
        .catch(error => {
            console.error('テスト実行エラー:', error);
            process.exit(1);
        });
}

module.exports = ChartContractTester;