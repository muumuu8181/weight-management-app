#!/usr/bin/env node

/**
 * Data Period Tester - 汎用時系列データ期間処理テストツール
 * 任意のデータ形式で期間フィルタリング・集計機能をテスト
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { JSDOM } = require('jsdom');

class DataPeriodTester {
    constructor(config = {}) {
        this.config = {
            dataType: config.dataType || 'generic',
            dateField: config.dateField || 'date',
            valueField: config.valueField || 'value',
            timeField: config.timeField || 'time',
            mockDataPath: config.mockDataPath || null,
            mockData: config.mockData || this.generateDefaultMockData(),
            verbose: config.verbose || false,
            ...config
        };
        
        this.testResults = [];
        this.passCount = 0;
        this.failCount = 0;
    }

    // デフォルトモックデータ生成
    generateDefaultMockData() {
        const data = [];
        const today = new Date();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            data.push({
                [this.config.dateField]: date.toISOString().split('T')[0],
                [this.config.timeField]: '07:00',
                [this.config.valueField]: 70 + Math.random() * 10,
                id: Date.now() + i
            });
        }
        
        return data;
    }

    // 外部ファイルからモックデータ読み込み
    async loadMockData() {
        if (this.config.mockDataPath && await fs.pathExists(this.config.mockDataPath)) {
            try {
                const data = await fs.readJson(this.config.mockDataPath);
                this.config.mockData = data;
                this.log('info', `モックデータ読み込み: ${data.length}件`);
            } catch (error) {
                this.log('warning', `モックデータ読み込み失敗: ${error.message}`);
            }
        }
    }

    // 期間フィルタリング関数（汎用版）
    setupTestEnvironment() {
        const dateField = this.config.dateField;
        const mockData = this.config.mockData;
        
        function getPreviousPeriodData(days, currentEndDate) {
            if (days <= 0) return [];
            
            const previousEndDate = new Date(currentEndDate);
            previousEndDate.setDate(currentEndDate.getDate() - days);
            
            const previousStartDate = new Date(previousEndDate);
            if (days === 1) {
                previousStartDate.setTime(previousEndDate.getTime());
            } else {
                previousStartDate.setDate(previousEndDate.getDate() - days + 1);
            }
            
            return mockData.filter(entry => {
                const entryDate = new Date(entry[dateField]);
                return entryDate >= previousStartDate && entryDate <= previousEndDate;
            });
        }
        
        function getCurrentPeriodData(days, currentEndDate) {
            const currentStartDate = new Date(currentEndDate);
            if (days === 1) {
                currentStartDate.setTime(currentEndDate.getTime());
            } else {
                currentStartDate.setDate(currentEndDate.getDate() - days + 1);
            }
            
            return mockData.filter(entry => {
                const entryDate = new Date(entry[dateField]);
                return entryDate >= currentStartDate && entryDate <= currentEndDate;
            });
        }
        
        return { getPreviousPeriodData, getCurrentPeriodData, mockData };
    }

    // 汎用テスト実行
    runTest(testName, testFn, expected, actual) {
        try {
            const result = testFn();
            const passed = JSON.stringify(result) === JSON.stringify(expected) || result === expected;
            
            if (passed) {
                this.passCount++;
                this.log('success', `${testName}: 合格`);
            } else {
                this.failCount++;
                this.log('error', `${testName}: 不合格`);
                if (this.config.verbose) {
                    console.log(`   期待値: ${JSON.stringify(expected)}`);
                    console.log(`   実際値: ${JSON.stringify(result)}`);
                }
            }
            
            this.testResults.push({
                name: testName,
                passed,
                expected,
                actual: result,
                timestamp: new Date()
            });
            
        } catch (error) {
            this.failCount++;
            this.log('error', `${testName}: エラー - ${error.message}`);
        }
    }

    // 期間データフィルタリングテスト
    testPeriodFiltering() {
        const testEnv = this.setupTestEnvironment();
        const testDate = new Date('2025-08-31');
        
        this.log('info', `${this.config.dataType}データ期間フィルタリングテスト開始`);
        
        // テスト1: 1日前期間
        this.runTest(
            '1日前期間データ取得',
            () => testEnv.getPreviousPeriodData(1, testDate),
            (result) => result.length >= 0 && Array.isArray(result)
        );
        
        // テスト2: 7日前期間  
        this.runTest(
            '7日前期間データ取得',
            () => testEnv.getPreviousPeriodData(7, testDate),
            (result) => result.length >= 0 && Array.isArray(result)
        );
        
        // テスト3: 現在期間
        this.runTest(
            '現在期間データ取得',
            () => testEnv.getCurrentPeriodData(7, testDate),
            (result) => result.length >= 0 && Array.isArray(result)
        );
        
        // テスト4: データ構造検証
        const sampleData = testEnv.getCurrentPeriodData(1, testDate);
        if (sampleData.length > 0) {
            this.runTest(
                'データ構造検証',
                () => {
                    const sample = sampleData[0];
                    return sample.hasOwnProperty(this.config.dateField) && 
                           sample.hasOwnProperty(this.config.valueField);
                },
                true
            );
        }
    }

    // ログ出力
    log(type, message) {
        const colors = {
            info: chalk.blue,
            success: chalk.green,
            warning: chalk.yellow,
            error: chalk.red
        };
        
        const prefix = {
            info: '📋',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        }[type] || '📋';
        
        console.log(`${prefix} ${colors[type] || chalk.white}(message)`);
    }

    // 結果サマリー
    printSummary() {
        const total = this.passCount + this.failCount;
        const successRate = total > 0 ? (this.passCount / total * 100).toFixed(1) : 0;
        
        console.log(`\n📊 ${chalk.bold('テスト結果サマリー')}`);
        console.log(`📋 データタイプ: ${this.config.dataType}`);
        console.log(`📊 総テスト数: ${total}`);
        console.log(`✅ 合格: ${chalk.green(this.passCount)}`);
        console.log(`❌ 不合格: ${chalk.red(this.failCount)}`);
        console.log(`📈 成功率: ${successRate}%`);
        
        // 結果をファイルに保存
        const reportPath = `test-results-period-${this.config.dataType}-${Date.now()}.json`;
        fs.writeJsonSync(reportPath, {
            config: this.config,
            results: this.testResults,
            summary: {
                total,
                passed: this.passCount,
                failed: this.failCount,
                successRate: parseFloat(successRate)
            }
        });
        
        console.log(`💾 詳細結果: ${reportPath}`);
    }

    // 外部から設定可能なテスト実行
    async runAllTests() {
        await this.loadMockData();
        this.testPeriodFiltering();
        this.printSummary();
        return this.failCount === 0;
    }
}

// CLI実行時
if (require.main === module) {
    const config = {
        dataType: process.argv[2] || 'weight',
        dateField: process.argv[3] || 'date',
        valueField: process.argv[4] || 'value'
    };
    
    console.log(chalk.blue(`🚀 データ期間テスター - ${config.dataType}データ対応版\n`));
    
    const tester = new DataPeriodTester(config);
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error(chalk.red('テスト実行エラー:'), error);
        process.exit(1);
    });
}

module.exports = DataPeriodTester;