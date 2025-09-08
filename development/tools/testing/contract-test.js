/**
 * 契約プログラミングライブラリのテスト
 * 
 * 使用方法:
 * node development/tools/testing/contract-test.js
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// テスト環境の構築
async function setupTestEnvironment() {
    console.log('🧪 契約プログラミングのテストを開始します...\n');
    
    // HTMLを読み込み
    const html = fs.readFileSync(path.join(__dirname, '../../../index.html'), 'utf8');
    
    // JSDOM環境を作成
    const dom = new JSDOM(html, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        resources: 'usable',
        beforeParse(window) {
            // グローバルオブジェクトの設定
            global.window = window;
            global.document = window.document;
            global.location = window.location;
        }
    });
    
    // contract.jsを読み込み
    const contractScript = fs.readFileSync(
        path.join(__dirname, '../../../shared/utils/contract.js'), 
        'utf8'
    );
    dom.window.eval(contractScript);
    
    return dom.window;
}

// テストの実行
async function runTests(window) {
    const Contract = window.Contract;
    let passedTests = 0;
    let failedTests = 0;
    
    // テスト1: 基本的な事前条件
    console.log('📋 テスト1: 基本的な事前条件チェック');
    try {
        Contract.require(true, 'これは成功するはず');
        console.log('✅ 正常な条件で例外が発生しない');
        passedTests++;
    } catch (e) {
        console.log('❌ 正常な条件で例外が発生した:', e.message);
        failedTests++;
    }
    
    try {
        Contract.require(false, 'これは失敗するはず');
        console.log('❌ 異常な条件で例外が発生しなかった');
        failedTests++;
    } catch (e) {
        console.log('✅ 異常な条件で例外が発生した:', e.message);
        passedTests++;
    }
    
    // テスト2: 型チェックヘルパー
    console.log('\n📋 テスト2: 型チェックヘルパー');
    try {
        Contract.requireType('string', 'string', 'testVar');
        console.log('✅ 正しい型でパス');
        passedTests++;
        
        Contract.requireType(123, 'number', 'testVar');
        console.log('✅ 正しい型でパス（数値）');
        passedTests++;
    } catch (e) {
        console.log('❌ 正しい型で失敗:', e.message);
        failedTests++;
    }
    
    try {
        Contract.requireType('string', 'number', 'testVar');
        console.log('❌ 間違った型で例外が発生しなかった');
        failedTests++;
    } catch (e) {
        console.log('✅ 間違った型で例外が発生:', e.message);
        passedTests++;
    }
    
    // テスト3: 配列検証ヘルパー
    console.log('\n📋 テスト3: 配列検証ヘルパー');
    try {
        Contract.requireArray([1, 2, 3], 'testArray', false);
        console.log('✅ 有効な配列でパス');
        passedTests++;
        
        Contract.requireArray([], 'testArray', true);
        console.log('✅ 空配列許可でパス');
        passedTests++;
    } catch (e) {
        console.log('❌ 有効な配列で失敗:', e.message);
        failedTests++;
    }
    
    try {
        Contract.requireArray([], 'testArray', false);
        console.log('❌ 空配列禁止で例外が発生しなかった');
        failedTests++;
    } catch (e) {
        console.log('✅ 空配列禁止で例外が発生:', e.message);
        passedTests++;
    }
    
    // テスト4: DOM要素チェック
    console.log('\n📋 テスト4: DOM要素存在チェック');
    
    // テスト用のDOM要素を作成
    const testDiv = window.document.createElement('div');
    testDiv.id = 'testElement';
    window.document.body.appendChild(testDiv);
    
    try {
        const element = Contract.requireElement('testElement');
        console.log('✅ 存在する要素を正しく取得');
        passedTests++;
    } catch (e) {
        console.log('❌ 存在する要素で失敗:', e.message);
        failedTests++;
    }
    
    try {
        Contract.requireElement('nonExistentElement');
        console.log('❌ 存在しない要素で例外が発生しなかった');
        failedTests++;
    } catch (e) {
        console.log('✅ 存在しない要素で例外が発生:', e.message);
        passedTests++;
    }
    
    // テスト5: 違反ログ機能
    console.log('\n📋 テスト5: 違反ログ機能');
    Contract.clearViolationLog();
    
    // 開発モードを一時的に無効化してログだけ記録
    const originalDev = Contract.isDevelopment;
    Contract.isDevelopment = false;
    
    Contract.require(false, 'ログテスト1');
    Contract.ensure(false, 'ログテスト2');
    Contract.invariant(false, 'ログテスト3');
    
    const logs = Contract.getViolationLog();
    if (logs.length === 3) {
        console.log('✅ 3つの違反が正しく記録された');
        passedTests++;
    } else {
        console.log(`❌ 違反ログ数が不正: ${logs.length}`);
        failedTests++;
    }
    
    Contract.isDevelopment = originalDev;
    
    // テスト6: withoutChecksメソッド
    console.log('\n📋 テスト6: 一時的な無効化機能');
    let checkExecuted = false;
    
    try {
        Contract.withoutChecks(() => {
            Contract.require(false, 'この契約違反は無視されるはず');
            checkExecuted = true;
        });
        
        if (checkExecuted) {
            console.log('✅ 契約チェックが一時的に無効化された');
            passedTests++;
        }
    } catch (e) {
        console.log('❌ 無効化中に例外が発生:', e.message);
        failedTests++;
    }
    
    // 結果サマリー
    console.log('\n' + '='.repeat(50));
    console.log(`📊 テスト結果サマリー`);
    console.log(`✅ 成功: ${passedTests}`);
    console.log(`❌ 失敗: ${failedTests}`);
    console.log(`合計: ${passedTests + failedTests}`);
    
    if (failedTests === 0) {
        console.log('\n🎉 すべてのテストが成功しました！');
    } else {
        console.log('\n⚠️  いくつかのテストが失敗しました。');
    }
    
    return {
        passed: passedTests,
        failed: failedTests,
        total: passedTests + failedTests
    };
}

// 実使用例のデモ
async function demonstrateUsage(window) {
    console.log('\n' + '='.repeat(50));
    console.log('💡 実使用例のデモンストレーション\n');
    
    const Contract = window.Contract;
    
    // 例1: Firebase操作の模擬
    console.log('📌 例1: Firebase操作の契約');
    function mockSaveData(userId, collection, data) {
        // 事前条件
        Contract.require(userId && typeof userId === 'string', 'userIdが必要です');
        Contract.require(collection && typeof collection === 'string', 'collectionが必要です');
        Contract.require(data && typeof data === 'object', 'データはオブジェクトである必要があります');
        
        console.log(`  → データ保存をシミュレート: ${userId}/${collection}`);
        
        // 模擬的な結果
        const result = { key: 'mock-key-12345' };
        
        // 事後条件
        Contract.ensure(result.key, '保存結果にキーが必要です');
        
        return result;
    }
    
    try {
        const result = mockSaveData('user123', 'weights', { weight: 65.5, date: '2024-01-20' });
        console.log('  ✅ 正常に保存されました:', result.key);
    } catch (e) {
        console.log('  ❌ エラー:', e.message);
    }
    
    // 例2: Chart.js操作の模擬
    console.log('\n📌 例2: Chart.js操作の契約');
    const mockChart = {
        data: {
            datasets: [{ label: '現在', data: [] }]
        }
    };
    
    function togglePreviousPeriod(chart, showPrevious) {
        // 事前条件
        Contract.require(chart && chart.data, 'チャートオブジェクトが必要です');
        Contract.require(typeof showPrevious === 'boolean', 'showPreviousはboolean型である必要があります');
        
        const oldCount = chart.data.datasets.length;
        console.log(`  → 現在のデータセット数: ${oldCount}`);
        
        if (showPrevious) {
            chart.data.datasets.push({ label: '前期間', data: [] });
        } else {
            chart.data.datasets = chart.data.datasets.filter(d => d.label !== '前期間');
        }
        
        // 事後条件
        const expectedCount = showPrevious ? oldCount + 1 : Math.max(1, oldCount - 1);
        Contract.ensure(
            chart.data.datasets.length === expectedCount,
            `データセット数が期待値と一致しません。期待値: ${expectedCount}, 実際: ${chart.data.datasets.length}`
        );
        
        console.log(`  → 更新後のデータセット数: ${chart.data.datasets.length}`);
    }
    
    try {
        togglePreviousPeriod(mockChart, true);
        console.log('  ✅ 前期間データが追加されました');
        
        togglePreviousPeriod(mockChart, false);
        console.log('  ✅ 前期間データが削除されました');
    } catch (e) {
        console.log('  ❌ エラー:', e.message);
    }
}

// メイン実行
async function main() {
    try {
        const window = await setupTestEnvironment();
        const results = await runTests(window);
        await demonstrateUsage(window);
        
        // 終了コード
        process.exit(results.failed > 0 ? 1 : 0);
    } catch (error) {
        console.error('テストの実行中にエラーが発生しました:', error);
        process.exit(1);
    }
}

main();