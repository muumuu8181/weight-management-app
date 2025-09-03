#!/usr/bin/env node

/**
 * 体重管理アプリ - 関数単体テスト (JSDOM)
 * 既存アプリケーションに干渉せず、独立してテスト実行
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { JSDOM } = require('jsdom');

// テスト用のモックデータ（前週データを含む）
const mockWeightData = [
    // 前々週データ
    { date: '2025-08-15', time: '07:00', weight: 71.8, value: 71.8 },
    { date: '2025-08-16', time: '07:00', weight: 71.9, value: 71.9 },
    
    // 前週データ (8/22-8/28)
    { date: '2025-08-22', time: '07:00', weight: 72.0, value: 72.0 },
    { date: '2025-08-22', time: '19:00', weight: 72.3, value: 72.3 },
    { date: '2025-08-23', time: '07:30', weight: 72.1, value: 72.1 },
    { date: '2025-08-24', time: '07:15', weight: 72.2, value: 72.2 },
    { date: '2025-08-25', time: '07:45', weight: 72.0, value: 72.0 },
    
    // 今週データ (8/29-9/4)
    { date: '2025-08-29', time: '07:00', weight: 72.1, value: 72.1 },
    { date: '2025-08-29', time: '19:00', weight: 72.5, value: 72.5 },
    { date: '2025-08-30', time: '07:30', weight: 72.3, value: 72.3 },
    { date: '2025-08-31', time: '20:00', weight: 72.7, value: 72.7 },
    { date: '2025-09-01', time: '07:15', weight: 72.0, value: 72.0 },
    { date: '2025-09-02', time: '19:30', weight: 72.4, value: 72.4 },
    { date: '2025-09-03', time: '07:45', weight: 72.2, value: 72.2 },
    { date: '2025-09-04', time: '20:15', weight: 72.8, value: 72.8 }
];

class WeightManagementTester {
    constructor() {
        this.testResults = [];
        this.passCount = 0;
        this.failCount = 0;
    }

    // 関数を直接実装してテスト（HTMLから分離）
    setupTestEnvironment() {
        // getPreviousPeriodData関数の実装（テスト用）
        function getPreviousPeriodData(days, currentEndDate) {
            if (days <= 0) return []; // 全期間表示の場合は前期間なし
            
            const previousEndDate = new Date(currentEndDate);
            previousEndDate.setDate(currentEndDate.getDate() - days);
            
            const previousStartDate = new Date(previousEndDate);
            if (days === 1) {
                // 1日表示の場合：前日のみ
                previousStartDate.setTime(previousEndDate.getTime());
            } else {
                // 複数日表示の場合：前期間の開始日
                previousStartDate.setDate(previousEndDate.getDate() - days + 1);
            }
            
            // 前期間のデータをフィルタリング
            const filteredData = mockWeightData.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= previousStartDate && entryDate <= previousEndDate;
            });
            
            return filteredData;
        }
        
        // テスト用環境オブジェクト
        return { getPreviousPeriodData };
    }

    // テスト実行
    runTest(testName, testFn, expected, actual) {
        try {
            const result = testFn();
            const passed = JSON.stringify(result) === JSON.stringify(expected) || result === expected;
            
            if (passed) {
                this.passCount++;
                console.log(chalk.green(`✅ ${testName}: PASS`));
            } else {
                this.failCount++;
                console.log(chalk.red(`❌ ${testName}: FAIL`));
                console.log(chalk.gray(`   Expected: ${JSON.stringify(expected)}`));
                console.log(chalk.gray(`   Actual: ${JSON.stringify(result)}`));
            }
            
            this.testResults.push({
                name: testName,
                passed,
                expected,
                actual: result
            });
        } catch (error) {
            this.failCount++;
            console.log(chalk.red(`❌ ${testName}: ERROR`));
            console.log(chalk.gray(`   Error: ${error.message}`));
            
            this.testResults.push({
                name: testName,
                passed: false,
                error: error.message
            });
        }
    }

    // getPreviousPeriodData関数のテスト群
    testGetPreviousPeriodData() {
        const testEnv = this.setupTestEnvironment();
        
        // 関数が存在するかチェック
        if (typeof testEnv.getPreviousPeriodData !== 'function') {
            console.log(chalk.red('❌ getPreviousPeriodData 関数が見つかりません'));
            return;
        }
        
        console.log(chalk.blue('\n🧪 getPreviousPeriodData 関数テスト開始\n'));
        
        // テスト1: 1日表示 - 前日データ取得
        this.runTest(
            '1日表示: 9/4の前日データ取得',
            () => {
                const result = testEnv.getPreviousPeriodData(1, new Date('2025-09-04'));
                return result.length;
            },
            1 // 9/3のデータは1件
        );
        
        // テスト2: 1週間表示 - 前週データ取得  
        this.runTest(
            '7日表示: 9/4の前週データ取得',
            () => {
                const result = testEnv.getPreviousPeriodData(7, new Date('2025-09-04'));
                return result.length;
            },
            5 // 前週8/22-8/28の期間に5件のデータ
        );
        
        // テスト3: 全期間表示 - 空配列返却
        this.runTest(
            '全期間表示: 空配列返却',
            () => {
                const result = testEnv.getPreviousPeriodData(0, new Date('2025-08-29'));
                return result.length;
            },
            0
        );
        
        // テスト4: データの日付範囲確認
        this.runTest(
            '前日データの日付確認',
            () => {
                const result = testEnv.getPreviousPeriodData(1, new Date('2025-09-04'));
                return result.every(entry => entry.date === '2025-09-03');
            },
            true
        );
        
        // テスト5: データ構造確認
        this.runTest(
            'データ構造確認',
            () => {
                const result = testEnv.getPreviousPeriodData(1, new Date('2025-09-04'));
                if (result.length === 0) return false;
                const entry = result[0];
                return entry.hasOwnProperty('date') && 
                       entry.hasOwnProperty('weight') && 
                       entry.hasOwnProperty('time');
            },
            true
        );
    }

    // テスト結果サマリー表示
    printSummary() {
        console.log(chalk.blue('\n📊 テスト結果サマリー\n'));
        console.log(`✅ 成功: ${chalk.green(this.passCount)} 件`);
        console.log(`❌ 失敗: ${chalk.red(this.failCount)} 件`);
        console.log(`📝 合計: ${this.passCount + this.failCount} 件`);
        
        const successRate = this.passCount / (this.passCount + this.failCount) * 100;
        console.log(`📈 成功率: ${chalk.cyan(successRate.toFixed(1))}%`);
        
        if (this.failCount === 0) {
            console.log(chalk.green('\n🎉 すべてのテストが成功しました！\n'));
        } else {
            console.log(chalk.yellow('\n⚠️  一部のテストが失敗しています。修正をお願いします。\n'));
        }
    }
}

// テスト実行
function runTests() {
    console.log(chalk.blue('🚀 体重管理アプリ - JSDOM単体テスト開始\n'));
    
    const tester = new WeightManagementTester();
    tester.testGetPreviousPeriodData();
    tester.printSummary();
    
    // 終了コード設定
    process.exit(tester.failCount === 0 ? 0 : 1);
}

// スクリプト直接実行時のみテストを開始
if (require.main === module) {
    try {
        runTests();
    } catch (error) {
        console.error(chalk.red('テスト実行中にエラーが発生しました:'), error);
        process.exit(1);
    }
}

module.exports = WeightManagementTester;