#!/usr/bin/env node

// 非同期処理対応エラー検出ツール

const { JSDOM } = require('jsdom');
const fs = require('fs');

console.log('🔍 非同期処理対応エラー検出ツール');

class AsyncErrorDetector {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.asyncOperations = [];
    }

    async checkFile(htmlPath, jsPath) {
        console.log(`📄 テスト対象: ${htmlPath}, ${jsPath}`);
        
        // JSDOM環境構築
        const htmlContent = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '<html></html>';
        const dom = new JSDOM(htmlContent, {
            url: 'http://localhost:8000',
            runScripts: 'dangerously'
        });

        const window = dom.window;
        const document = window.document;

        // エラーキャッチシステム
        window.addEventListener('error', (event) => {
            this.errors.push({
                type: 'runtime_error',
                message: event.error.message,
                filename: event.filename,
                line: event.lineno
            });
        });

        // 未定義関数呼び出し検出
        const originalError = window.console.error;
        window.console.error = (...args) => {
            if (args[0].includes('is not defined')) {
                this.errors.push({
                    type: 'undefined_function',
                    message: args.join(' ')
                });
            }
            originalError.apply(window.console, args);
        };

        // Firebase モック（非同期処理対応）
        window.firebase = {
            database: () => ({
                ref: () => ({
                    on: (event, callback) => {
                        this.asyncOperations.push('firebase_data_load');
                        // 非同期でコールバック実行をシミュレート
                        setTimeout(() => {
                            try {
                                callback({ val: () => ({ test: 'data' }) });
                            } catch (error) {
                                this.errors.push({
                                    type: 'firebase_callback_error',
                                    message: error.message,
                                    source: 'firebase_on_callback'
                                });
                            }
                        }, 100);
                    }
                })
            })
        };

        // JavaScript読み込み
        if (fs.existsSync(jsPath)) {
            const jsContent = fs.readFileSync(jsPath, 'utf8');
            try {
                // グローバルスコープで実行
                const script = new window.Function(jsContent);
                script();
            } catch (error) {
                this.errors.push({
                    type: 'js_syntax_error',
                    message: error.message
                });
            }
        }

        // 非同期操作完了まで待機
        if (this.asyncOperations.length > 0) {
            console.log(`⏳ 非同期操作待機: ${this.asyncOperations.length}件`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 関数存在チェック
        const expectedFunctions = ['updateChart', 'updateChartRange', 'togglePreviousPeriod'];
        expectedFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'undefined') {
                this.warnings.push({
                    type: 'missing_function',
                    message: `関数 ${funcName} が未定義`,
                    function: funcName
                });
            }
        });

        return {
            errors: this.errors,
            warnings: this.warnings,
            asyncOperations: this.asyncOperations
        };
    }

    generateReport() {
        console.log('\n📊 検出結果サマリー');
        console.log('================');
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ エラー・警告なし');
            return;
        }

        if (this.errors.length > 0) {
            console.log(`❌ エラー: ${this.errors.length}件`);
            this.errors.forEach((error, i) => {
                console.log(`  ${i+1}. [${error.type}] ${error.message}`);
            });
        }

        if (this.warnings.length > 0) {
            console.log(`⚠️  警告: ${this.warnings.length}件`);
            this.warnings.forEach((warning, i) => {
                console.log(`  ${i+1}. [${warning.type}] ${warning.message}`);
            });
        }

        if (this.asyncOperations.length > 0) {
            console.log(`🔄 非同期処理: ${this.asyncOperations.length}件検出・処理済み`);
        }
    }
}

// 使用例
async function main() {
    const detector = new AsyncErrorDetector();
    
    const testCases = [
        {
            html: './tabs/tab1-weight/tab-weight.html',
            js: './tabs/tab1-weight/tab-weight.js'
        },
        {
            html: './tabs/tab1-weight/weight.html', 
            js: './tabs/tab1-weight/weight.js'
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n🧪 テストケース: ${testCase.js}`);
        await detector.checkFile(testCase.html, testCase.js);
    }

    detector.generateReport();
}

// スタンドアロンで実行された場合
if (require.main === module) {
    main().catch(console.error);
}

module.exports = AsyncErrorDetector;