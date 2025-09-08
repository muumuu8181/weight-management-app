#!/usr/bin/env node
/**
 * 契約プログラミングテストのデータ取得方法デモ
 * F12開発者ツールのように詳細な情報を取得
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');

class ContractDataExtractor {
    constructor() {
        this.contractLogs = [];
        this.testResults = [];
        this.performanceMetrics = [];
        this.originalConsoleLog = console.log;
        this.originalConsoleError = console.error;
    }

    setupLoggingInterceptor() {
        // コンソールログを横取りしてデータを収集
        const self = this;
        
        console.log = (...args) => {
            self.contractLogs.push({
                level: 'info',
                timestamp: new Date().toISOString(),
                message: args.join(' '),
                stack: new Error().stack
            });
            self.originalConsoleLog.apply(console, args);
        };

        console.error = (...args) => {
            self.contractLogs.push({
                level: 'error',
                timestamp: new Date().toISOString(),
                message: args.join(' '),
                stack: new Error().stack
            });
            self.originalConsoleError.apply(console, args);
        };
    }

    async setupVirtualEnvironment() {
        console.log('🔧 データ取得用仮想環境構築中...');

        const dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <input id="testInput" type="text">
                <canvas id="testCanvas"></canvas>
                <div id="testDiv"></div>
            </body>
            </html>
        `, {
            url: 'http://localhost:3000/',
            pretendToBeVisual: true
        });

        global.window = dom.window;
        global.document = dom.window.document;
        global.location = dom.window.location;

        // 契約ライブラリを読み込み
        const contractPath = path.join(__dirname, '../../../shared/utils/contract.js');
        const contractCode = fs.readFileSync(contractPath, 'utf8');
        dom.window.eval(contractCode);

        // カスタムログ収集を設定
        const originalRequire = dom.window.Contract.require;
        const originalEnsure = dom.window.Contract.ensure;
        
        const self = this;
        dom.window.Contract.require = function(condition, message, context = {}) {
            const startTime = performance.now();
            let result, error;
            
            try {
                result = originalRequire.call(this, condition, message, context);
                self.contractLogs.push({
                    type: 'contract_check',
                    checkType: 'precondition',
                    condition: condition,
                    message: message,
                    context: context,
                    result: 'passed',
                    timestamp: new Date().toISOString(),
                    executionTime: performance.now() - startTime
                });
            } catch (e) {
                error = e;
                self.contractLogs.push({
                    type: 'contract_violation',
                    checkType: 'precondition',
                    condition: condition,
                    message: message,
                    context: context,
                    error: e.message,
                    stack: e.stack,
                    timestamp: new Date().toISOString(),
                    executionTime: performance.now() - startTime
                });
                throw e;
            }
            
            return result;
        };

        return dom.window;
    }

    runContractTest(testName, testFn) {
        const testStartTime = performance.now();
        const initialLogCount = this.contractLogs.length;
        
        console.log(`\n🧪 テスト実行: ${testName}`);
        
        try {
            const result = testFn();
            const endTime = performance.now();
            
            const testResult = {
                name: testName,
                status: 'success',
                result: result,
                duration: endTime - testStartTime,
                contractChecks: this.contractLogs.length - initialLogCount,
                timestamp: new Date().toISOString()
            };
            
            this.testResults.push(testResult);
            console.log(`✅ ${testName}: 成功`);
            return testResult;
            
        } catch (error) {
            const endTime = performance.now();
            
            const testResult = {
                name: testName,
                status: 'failed',
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                },
                duration: endTime - testStartTime,
                contractChecks: this.contractLogs.length - initialLogCount,
                timestamp: new Date().toISOString()
            };
            
            this.testResults.push(testResult);
            console.log(`❌ ${testName}: 失敗 - ${error.message}`);
            return testResult;
        }
    }

    async runDemonstrationTests(window) {
        console.log('📊 契約プログラミングデータ抽出デモ開始\n');

        // テスト1: 正常な契約チェック
        this.runContractTest('正常な型チェック', () => {
            window.Contract.requireType('test', 'string', 'testVar');
            window.Contract.requireType(123, 'number', 'numberVar');
            return { 
                stringCheck: 'passed',
                numberCheck: 'passed',
                returnedData: 'all_validations_successful'
            };
        });

        // テスト2: 契約違反の検出
        this.runContractTest('型不一致による契約違反', () => {
            try {
                window.Contract.requireType('string', 'number', 'testVar');
                return { unexpectedSuccess: true };
            } catch (e) {
                return { 
                    expectedViolation: true,
                    violationMessage: e.message,
                    violationType: 'type_mismatch'
                };
            }
        });

        // テスト3: DOM要素の存在チェック
        this.runContractTest('DOM要素存在チェック', () => {
            const existingElement = window.Contract.requireElement('testInput');
            
            let nonExistentResult;
            try {
                window.Contract.requireElement('nonExistentElement');
            } catch (e) {
                nonExistentResult = {
                    violationDetected: true,
                    message: e.message
                };
            }
            
            return {
                existingElement: {
                    found: true,
                    id: existingElement.id,
                    tagName: existingElement.tagName
                },
                nonExistentElement: nonExistentResult
            };
        });

        // テスト4: 複合的な検証
        this.runContractTest('複合検証シナリオ', () => {
            // Firebase模擬オブジェクト
            window.firebase = {
                auth: () => ({ currentUser: { uid: 'test-user-123' } }),
                database: () => ({
                    ref: () => ({
                        push: () => Promise.resolve({ key: 'generated-key' })
                    })
                })
            };
            
            // 模擬Firebase保存関数（契約付き）
            function mockSaveData(collection, userId, data) {
                window.Contract.requireType(collection, 'string', 'collection');
                window.Contract.require(collection.length > 0, 'コレクション名は必須です');
                window.Contract.requireType(userId, 'string', 'userId');
                window.Contract.require(data !== null, 'データはnullであってはいけません');
                
                const currentUser = window.firebase.auth().currentUser;
                window.Contract.require(currentUser, 'ユーザーがログインしている必要があります');
                
                return {
                    saved: true,
                    collection: collection,
                    userId: userId,
                    dataType: typeof data
                };
            }
            
            // 正常系テスト
            const validResult = mockSaveData('weights', 'test-user-123', { weight: 65.5 });
            
            // 異常系テスト
            let invalidResult;
            try {
                mockSaveData('', 'test-user-123', { weight: 65.5 });
            } catch (e) {
                invalidResult = {
                    violationDetected: true,
                    violationType: 'empty_collection_name',
                    message: e.message
                };
            }
            
            return {
                validSave: validResult,
                invalidSave: invalidResult,
                totalContractChecks: 8  // この関数内で実行される契約チェック数
            };
        });
    }

    generateDetailedReport() {
        const report = {
            summary: {
                totalTests: this.testResults.length,
                passedTests: this.testResults.filter(t => t.status === 'success').length,
                failedTests: this.testResults.filter(t => t.status === 'failed').length,
                totalContractChecks: this.contractLogs.filter(log => log.type === 'contract_check' || log.type === 'contract_violation').length,
                totalContractViolations: this.contractLogs.filter(log => log.type === 'contract_violation').length
            },
            testResults: this.testResults,
            contractLogs: this.contractLogs,
            performance: {
                averageTestDuration: this.testResults.reduce((sum, t) => sum + (t.duration || 0), 0) / this.testResults.length,
                totalExecutionTime: this.testResults.reduce((sum, t) => sum + (t.duration || 0), 0)
            },
            violations: this.contractLogs.filter(log => log.type === 'contract_violation'),
            timeline: this.contractLogs.map(log => ({
                timestamp: log.timestamp,
                type: log.type || log.level,
                message: log.message || log.error,
                context: log.context
            }))
        };
        
        return report;
    }

    async run() {
        this.setupLoggingInterceptor();
        const window = await this.setupVirtualEnvironment();
        await this.runDemonstrationTests(window);
        
        const report = this.generateDetailedReport();
        
        // F12開発者ツール風の出力
        console.log('\n' + '='.repeat(80));
        console.log('🔍 F12開発者ツール風 詳細データレポート');
        console.log('='.repeat(80));
        
        // サマリー情報
        console.log('\n📊 サマリー:');
        console.log(`  テスト実行: ${report.summary.totalTests}件`);
        console.log(`  成功: ${report.summary.passedTests}件`);
        console.log(`  失敗: ${report.summary.failedTests}件`);
        console.log(`  契約チェック: ${report.summary.totalContractChecks}回`);
        console.log(`  契約違反: ${report.summary.totalContractViolations}件`);
        console.log(`  平均実行時間: ${report.performance.averageTestDuration.toFixed(2)}ms`);

        // 違反詳細
        if (report.violations.length > 0) {
            console.log('\n🚨 検出された契約違反:');
            report.violations.forEach((violation, i) => {
                console.log(`  ${i + 1}. ${violation.message}`);
                console.log(`     タイプ: ${violation.checkType}`);
                console.log(`     実行時間: ${violation.executionTime.toFixed(2)}ms`);
                if (violation.context && Object.keys(violation.context).length > 0) {
                    console.log(`     コンテキスト: ${JSON.stringify(violation.context)}`);
                }
            });
        }

        // 完全なJSONレポート
        console.log('\n📋 完全なデータ（JSON形式）:');
        console.log(JSON.stringify(report, null, 2));
        
        return report;
    }
}

// 実行
if (require.main === module) {
    const extractor = new ContractDataExtractor();
    extractor.run()
        .then(report => {
            console.log('\n✅ データ抽出完了');
        })
        .catch(error => {
            console.error('❌ データ抽出エラー:', error);
            process.exit(1);
        });
}

module.exports = ContractDataExtractor;