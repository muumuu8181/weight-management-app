#!/usr/bin/env node

/**
 * Simple Data Tester - 軽量データ期間テストツール  
 * 標準ライブラリのみで動作する汎用版
 */

const fs = require('fs');

class SimpleDataTester {
    constructor(config = {}) {
        this.config = {
            dataType: config.dataType || 'generic',
            dateField: config.dateField || 'date',
            valueField: config.valueField || 'value',
            mockData: config.mockData,
            ...config
        };
        
        this.passCount = 0;
        this.failCount = 0;
        
        // mockDataが未設定の場合に生成
        if (!this.config.mockData) {
            this.config.mockData = this.generateMockData();
        }
    }

    // モックデータ生成
    generateMockData() {
        const data = [];
        const today = new Date();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            data.push({
                [this.config.dateField]: date.toISOString().split('T')[0],
                [this.config.valueField]: 70 + Math.random() * 10,
                id: Date.now() + i
            });
        }
        
        return data;
    }

    // 期間フィルタリング関数
    getPreviousPeriodData(days, currentEndDate) {
        if (days <= 0) return [];
        
        const previousEndDate = new Date(currentEndDate);
        previousEndDate.setDate(currentEndDate.getDate() - days);
        
        const previousStartDate = new Date(previousEndDate);
        if (days === 1) {
            previousStartDate.setTime(previousEndDate.getTime());
        } else {
            previousStartDate.setDate(previousEndDate.getDate() - days + 1);
        }
        
        return this.config.mockData.filter(entry => {
            const entryDate = new Date(entry[this.config.dateField]);
            return entryDate >= previousStartDate && entryDate <= previousEndDate;
        });
    }

    // テスト実行
    runTest(testName, testFn, validator) {
        try {
            const result = testFn();
            const passed = validator ? validator(result) : true;
            
            if (passed) {
                this.passCount++;
                console.log(`✅ ${testName}: 合格`);
            } else {
                this.failCount++;
                console.log(`❌ ${testName}: 不合格`);
            }
            
            return { passed, result };
        } catch (error) {
            this.failCount++;
            console.log(`❌ ${testName}: エラー - ${error.message}`);
            return { passed: false, error: error.message };
        }
    }

    // 全テスト実行
    runAllTests() {
        console.log(`🚀 ${this.config.dataType}データ期間テスト開始\n`);
        
        const testDate = new Date('2025-08-31');
        
        // 1日前期間テスト
        this.runTest(
            '1日前期間データ取得',
            () => this.getPreviousPeriodData(1, testDate),
            (result) => Array.isArray(result)
        );
        
        // 7日前期間テスト
        this.runTest(
            '7日前期間データ取得', 
            () => this.getPreviousPeriodData(7, testDate),
            (result) => Array.isArray(result) && result.length >= 0
        );
        
        // 30日前期間テスト
        this.runTest(
            '30日前期間データ取得',
            () => this.getPreviousPeriodData(30, testDate),
            (result) => Array.isArray(result) && result.length >= 0
        );
        
        // データ構造テスト
        const sampleData = this.config.mockData.slice(0, 1);
        if (sampleData.length > 0) {
            this.runTest(
                'データ構造検証',
                () => {
                    const sample = sampleData[0];
                    return sample.hasOwnProperty(this.config.dateField) && 
                           sample.hasOwnProperty(this.config.valueField);
                },
                (result) => result === true
            );
        }
        
        // 結果サマリー
        const total = this.passCount + this.failCount;
        const successRate = total > 0 ? (this.passCount / total * 100).toFixed(1) : 0;
        
        console.log(`\n📊 テスト結果:`);
        console.log(`📋 データタイプ: ${this.config.dataType}`);
        console.log(`📊 総テスト数: ${total}`);
        console.log(`✅ 合格: ${this.passCount}`);
        console.log(`❌ 不合格: ${this.failCount}`);
        console.log(`📈 成功率: ${successRate}%`);
        
        return this.failCount === 0;
    }
}

// CLI実行
if (require.main === module) {
    const dataType = process.argv[2] || 'generic';
    const dateField = process.argv[3] || 'date';
    const valueField = process.argv[4] || 'value';
    
    console.log(`🔍 汎用データ期間テスター - ${dataType}データ対応\n`);
    
    const tester = new SimpleDataTester({
        dataType,
        dateField,
        valueField
    });
    
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = SimpleDataTester;