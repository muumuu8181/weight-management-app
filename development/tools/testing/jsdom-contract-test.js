#!/usr/bin/env node
/**
 * JSDOM仮想ブラウザ環境での契約プログラミングテスト
 * 
 * ブラウザを開かずに実際のDOM環境での契約違反を検出
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');

class JSdomContractTester {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            errors: []
        };
    }

    async setupVirtualBrowser() {
        console.log('🌐 仮想ブラウザ環境を構築中...');
        
        // index.htmlを読み込み
        const indexPath = path.join(__dirname, '../../../index.html');
        const html = fs.readFileSync(indexPath, 'utf8');
        
        // JSDOM環境を作成
        const dom = new JSDOM(html, {
            url: 'http://localhost:3000/',
            runScripts: "dangerously",
            resources: "usable",
            pretendToBeVisual: true,
            beforeParse(window) {
                // Firebase モック
                window.firebase = {
                    auth: () => ({
                        currentUser: { uid: 'test-user-123' },
                        onAuthStateChanged: () => {},
                        signInWithPopup: () => Promise.resolve(),
                        signOut: () => Promise.resolve()
                    }),
                    database: () => ({
                        ref: (path) => ({
                            push: (data) => Promise.resolve({ key: 'test-key-123' }),
                            set: (data) => Promise.resolve(),
                            update: (data) => Promise.resolve(),
                            remove: () => Promise.resolve(),
                            on: (event, callback) => {},
                            once: (event) => Promise.resolve({
                                val: () => ({ testData: true })
                            })
                        })
                    })
                };
            }
        });
        
        this.window = dom.window;
        this.document = dom.window.document;
        
        console.log('✅ 仮想ブラウザ環境構築完了');
        return dom.window;
    }

    runTest(testName, testFn) {
        this.testResults.total++;
        try {
            console.log(`\n🧪 ${testName}`);
            testFn();
            console.log(`✅ ${testName}: 成功`);
            this.testResults.passed++;
            return true;
        } catch (error) {
            console.log(`❌ ${testName}: 失敗 - ${error.message}`);
            this.testResults.errors.push({ test: testName, error: error.message });
            this.testResults.failed++;
            return false;
        }
    }

    async testContractLibrary() {
        console.log('\n📋 契約ライブラリの基本テスト');
        
        this.runTest('契約ライブラリの存在確認', () => {
            if (typeof this.window.Contract === 'undefined') {
                throw new Error('Contract オブジェクトが見つかりません');
            }
            if (typeof this.window.Contract.require !== 'function') {
                throw new Error('Contract.require 関数が見つかりません');
            }
        });

        this.runTest('基本的な契約チェック', () => {
            this.window.Contract.require(true, '正常な条件');
            
            try {
                this.window.Contract.require(false, '契約違反テスト');
                throw new Error('契約違反が検出されませんでした');
            } catch (e) {
                if (e.message.includes('契約違反')) {
                    // 正常：契約違反が正しく検出された
                } else {
                    throw e;
                }
            }
        });
    }

    async testFirebaseCRUD() {
        console.log('\n📋 Firebase CRUD 契約テスト（仮想環境）');

        this.runTest('Firebase CRUD クラスの存在確認', () => {
            if (typeof this.window.FirebaseCRUD === 'undefined') {
                throw new Error('FirebaseCRUD クラスが見つかりません');
            }
        });

        this.runTest('Firebase save() 契約テスト - 正常系', async () => {
            // 正常なパラメータでのテスト
            const result = await this.window.FirebaseCRUD.save('weights', 'test-user-123', { weight: 65.5 });
            if (!result || !result.key) {
                throw new Error('保存結果が無効です');
            }
        });

        this.runTest('Firebase save() 契約テスト - 異常系', async () => {
            try {
                await this.window.FirebaseCRUD.save(null, null, null);
                throw new Error('null パラメータで契約違反が検出されませんでした');
            } catch (e) {
                if (e.message.includes('契約違反') || e.message.includes('型である必要があります')) {
                    // 正常：契約違反が検出された
                } else {
                    throw new Error(`予期しないエラー: ${e.message}`);
                }
            }
        });

        this.runTest('Firebase load() 契約テスト - 異常系', () => {
            try {
                this.window.FirebaseCRUD.load('weights', 'test-user', 'not-a-function');
                throw new Error('不正なcallbackで契約違反が検出されませんでした');
            } catch (e) {
                if (e.message.includes('function') || e.message.includes('契約違反')) {
                    // 正常：契約違反が検出された
                } else {
                    throw new Error(`予期しないエラー: ${e.message}`);
                }
            }
        });
    }

    async testValidationContracts() {
        console.log('\n📋 バリデーション契約テスト（仮想DOM）');

        this.runTest('UniversalValidator クラスの存在確認', () => {
            if (typeof this.window.UniversalValidator === 'undefined') {
                throw new Error('UniversalValidator クラスが見つかりません');
            }
        });

        this.runTest('validateRequired() 契約テスト - 異常系', () => {
            try {
                this.window.UniversalValidator.validateRequired(null);
                throw new Error('null配列で契約違反が検出されませんでした');
            } catch (e) {
                if (e.message.includes('配列') || e.message.includes('契約違反')) {
                    // 正常：契約違反が検出された
                } else {
                    throw new Error(`予期しないエラー: ${e.message}`);
                }
            }
        });

        this.runTest('validateNumber() 契約テスト - 異常系', () => {
            try {
                this.window.UniversalValidator.validateNumber('', 'not-a-number', 100);
                throw new Error('不正な型で契約違反が検出されませんでした');
            } catch (e) {
                if (e.message.includes('数値') || e.message.includes('契約違反')) {
                    // 正常：契約違反が検出された
                } else {
                    throw new Error(`予期しないエラー: ${e.message}`);
                }
            }
        });

        // 実際のDOM要素を作成してテスト
        this.runTest('DOM要素への契約適用テスト', () => {
            // テスト用input要素を作成
            const testInput = this.document.createElement('input');
            testInput.id = 'testInput';
            testInput.type = 'text';
            this.document.body.appendChild(testInput);

            // 親要素なしでエラー表示を試みる（契約違反になるはず）
            const orphanInput = this.document.createElement('input');
            orphanInput.id = 'orphanInput';
            // 親要素に追加しない

            try {
                this.window.UniversalValidator.showFieldError(orphanInput, 'テストエラー');
                throw new Error('親要素なしで契約違反が検出されませんでした');
            } catch (e) {
                if (e.message.includes('親要素') || e.message.includes('契約違反')) {
                    // 正常：契約違反が検出された
                } else {
                    throw new Error(`予期しないエラー: ${e.message}`);
                }
            }
        });
    }

    async testRealWorldScenarios() {
        console.log('\n📋 実際のアプリケーション使用シナリオテスト');

        this.runTest('未ログイン状態での保存試行', () => {
            // Firebase認証をnullに設定
            this.window.firebase.auth = () => ({
                currentUser: null
            });

            try {
                this.window.FirebaseCRUD.save('weights', 'user123', { weight: 65 });
                throw new Error('未ログイン状態で契約違反が検出されませんでした');
            } catch (e) {
                if (e.message.includes('ログイン') || e.message.includes('契約違反')) {
                    // 正常：契約違反が検出された
                } else {
                    throw new Error(`予期しないエラー: ${e.message}`);
                }
            }

            // 認証状態を復元
            this.window.firebase.auth = () => ({
                currentUser: { uid: 'test-user-123' }
            });
        });

        this.runTest('不正なuserIdでの操作', () => {
            try {
                this.window.FirebaseCRUD.save('weights', 'wrong-user-id', { weight: 65 });
                throw new Error('不正なuserIdで契約違反が検出されませんでした');
            } catch (e) {
                if (e.message.includes('一致') || e.message.includes('契約違反')) {
                    // 正常：契約違反が検出された
                } else {
                    throw new Error(`予期しないエラー: ${e.message}`);
                }
            }
        });
    }

    async runAllTests() {
        console.log('🚀 JSDOM契約プログラミングテスト開始\n');

        await this.setupVirtualBrowser();
        
        // 小さな遅延でスクリプトの読み込みを待つ
        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.testContractLibrary();
        await this.testFirebaseCRUD();
        await this.testValidationContracts();
        await this.testRealWorldScenarios();

        this.printResults();
        return this.testResults.failed === 0;
    }

    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 JSDOM契約プログラミングテスト結果');
        console.log('='.repeat(60));
        console.log(`✅ 成功: ${this.testResults.passed}`);
        console.log(`❌ 失敗: ${this.testResults.failed}`);
        console.log(`合計: ${this.testResults.total}`);
        
        if (this.testResults.failed > 0) {
            console.log('\n❌ 失敗したテスト:');
            this.testResults.errors.forEach((error, i) => {
                console.log(`${i + 1}. ${error.test}: ${error.error}`);
            });
        } else {
            console.log('\n🎉 すべてのテストが成功しました！');
            console.log('契約プログラミングは仮想ブラウザ環境で正常に動作しています。');
        }
    }
}

// メイン実行
async function main() {
    const tester = new JSdomContractTester();
    const success = await tester.runAllTests();
    process.exit(success ? 0 : 1);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = JSdomContractTester;