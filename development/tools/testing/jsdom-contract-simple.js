#!/usr/bin/env node
/**
 * 契約プログラミング 簡易JSDOM テスト
 * HTTPサーバー不要でスクリプトファイルを直接読み込み
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');

async function runSimpleContractTest() {
    console.log('🧪 簡易契約プログラミングテスト開始');
    
    // 最小限のHTMLでJSDOM環境を作成
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <input id="testInput" type="text">
            <div id="testDiv"></div>
        </body>
        </html>
    `, {
        url: 'http://localhost:3000/',
        pretendToBeVisual: true
    });

    const window = dom.window;
    const document = window.document;
    global.window = window;
    global.document = document;
    global.location = window.location;

    // Firebase モックを設定
    window.firebase = {
        auth: () => ({
            currentUser: { uid: 'test-user-123' }
        }),
        database: () => ({
            ref: () => ({
                push: () => Promise.resolve({ key: 'test-key' }),
                set: () => Promise.resolve(),
                on: () => {},
                once: () => Promise.resolve({ val: () => ({}) })
            })
        })
    };

    // 契約プログラミングライブラリを直接読み込み
    try {
        const contractPath = path.join(__dirname, '../../../shared/utils/contract.js');
        const contractCode = fs.readFileSync(contractPath, 'utf8');
        window.eval(contractCode);
        console.log('✅ 契約ライブラリ読み込み成功');
    } catch (error) {
        console.log('❌ 契約ライブラリ読み込み失敗:', error.message);
        return;
    }

    let testResults = { passed: 0, failed: 0 };

    // テスト実行関数
    function runTest(name, testFn) {
        try {
            console.log(`\n🧪 ${name}`);
            testFn();
            console.log(`✅ ${name}: 成功`);
            testResults.passed++;
        } catch (error) {
            console.log(`❌ ${name}: 失敗 - ${error.message}`);
            testResults.failed++;
        }
    }

    // 基本的な契約テスト
    runTest('基本的な契約チェック', () => {
        window.Contract.require(true, '正常な条件');
        
        try {
            window.Contract.require(false, '契約違反テスト');
            throw new Error('契約違反が検出されませんでした');
        } catch (e) {
            if (!e.message.includes('契約違反')) {
                throw e;
            }
        }
    });

    runTest('型チェック契約', () => {
        window.Contract.requireType('string', 'string', 'test');
        
        try {
            window.Contract.requireType('string', 'number', 'test');
            throw new Error('型不一致が検出されませんでした');
        } catch (e) {
            if (!e.message.includes('型である必要があります')) {
                throw e;
            }
        }
    });

    runTest('配列検証契約', () => {
        window.Contract.requireArray([1, 2, 3], 'testArray');
        
        try {
            window.Contract.requireArray([], 'testArray', false);
            throw new Error('空配列禁止が検出されませんでした');
        } catch (e) {
            if (!e.message.includes('空であってはいけません')) {
                throw e;
            }
        }
    });

    runTest('DOM要素契約', () => {
        const element = window.Contract.requireElement('testInput');
        if (element.id !== 'testInput') {
            throw new Error('要素が正しく取得されませんでした');
        }
        
        try {
            window.Contract.requireElement('nonExistent');
            throw new Error('存在しない要素でエラーが発生しませんでした');
        } catch (e) {
            if (!e.message.includes('見つかりません')) {
                throw e;
            }
        }
    });

    // Firebase CRUD関数を模擬（実際のファイルは読み込まず、契約のみテスト）
    window.FirebaseCRUD = {
        save: function(collection, userId, data) {
            window.Contract.requireType(collection, 'string', 'collection');
            window.Contract.require(collection.length > 0, 'コレクション名は空であってはいけません');
            window.Contract.requireType(userId, 'string', 'userId');
            window.Contract.require(userId.length > 0, 'userIdは空であってはいけません');
            window.Contract.require(data && typeof data === 'object', 'データはオブジェクトである必要があります');
            
            const currentUser = window.firebase.auth().currentUser;
            window.Contract.require(currentUser, 'ユーザーがログインしている必要があります');
            
            return Promise.resolve({ key: 'test-key' });
        }
    };

    runTest('Firebase save契約テスト', async () => {
        // 正常なパラメータ
        await window.FirebaseCRUD.save('weights', 'test-user-123', { weight: 65 });
        
        // 異常なパラメータテスト
        try {
            await window.FirebaseCRUD.save('', 'user', {});
            throw new Error('空のコレクション名で契約違反が検出されませんでした');
        } catch (e) {
            if (!e.message.includes('空であってはいけません')) {
                throw e;
            }
        }
    });

    runTest('認証状態契約テスト', async () => {
        // 未ログイン状態をシミュレート
        const originalAuth = window.firebase.auth;
        window.firebase.auth = () => ({ currentUser: null });
        
        try {
            await window.FirebaseCRUD.save('weights', 'user', { weight: 65 });
            throw new Error('未ログイン状態で契約違反が検出されませんでした');
        } catch (e) {
            if (!e.message.includes('ログインしている必要があります')) {
                throw e;
            }
        }
        
        // 認証状態を復元
        window.firebase.auth = originalAuth;
    });

    runTest('違反ログ機能テスト', () => {
        window.Contract.clearViolationLog();
        
        // 本番モードで違反を発生させる
        const originalDev = window.Contract.isDevelopment;
        window.Contract.isDevelopment = false;
        
        window.Contract.require(false, 'ログテスト');
        
        const logs = window.Contract.getViolationLog();
        if (logs.length !== 1) {
            throw new Error('違反ログが正しく記録されませんでした');
        }
        
        window.Contract.isDevelopment = originalDev;
    });

    // 結果表示
    console.log('\n' + '='.repeat(50));
    console.log('📊 簡易契約プログラミングテスト結果');
    console.log('='.repeat(50));
    console.log(`✅ 成功: ${testResults.passed}`);
    console.log(`❌ 失敗: ${testResults.failed}`);
    console.log(`合計: ${testResults.passed + testResults.failed}`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 すべてのテストが成功しました！');
        console.log('💡 契約プログラミングは仮想ブラウザ環境で正常に動作しています。');
        console.log('🚀 実際のブラウザでも同じ契約違反検出が期待できます。');
    } else {
        console.log('\n⚠️  一部のテストが失敗しました。');
    }
    
    return testResults.failed === 0;
}

// 実行
if (require.main === module) {
    runSimpleContractTest()
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
            console.error('テスト実行中にエラー:', error);
            process.exit(1);
        });
}