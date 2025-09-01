#!/usr/bin/env node

/**
 * 日付初期化問題専用チェッカー
 * index.htmlの日付設定処理が正常に動作するかを検証
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');

async function checkDateInitialization() {
    console.log('🧪 日付初期化問題チェック開始');
    
    try {
        // index.htmlを読み込み
        const html = fs.readFileSync('index.html', 'utf8');
        console.log('✅ index.html読み込み完了');
        
        // JSDOM環境でスクリプト実行を無効化（Firebaseエラー回避）
        const dom = new JSDOM(html, {
            runScripts: 'outside-only',
            resources: 'usable'
        });
        
        const document = dom.window.document;
        global.document = document;
        
        // 日付初期化処理のシミュレーション
        console.log('\n📅 日付初期化処理テスト:');
        
        // 1. dateInput要素の存在確認
        const dateInput = document.getElementById('dateInput');
        console.log(`   - dateInput要素: ${dateInput ? '存在' : '❌ 不存在'}`);
        
        // 2. weightValue要素の存在確認  
        const weightValue = document.getElementById('weightValue');
        console.log(`   - weightValue要素: ${weightValue ? '存在' : '❌ 不存在'}`);
        
        // 3. タブコンテンツの確認
        const tabContent1 = document.getElementById('tabContent1');
        console.log(`   - tabContent1要素: ${tabContent1 ? '存在' : '❌ 不存在'}`);
        if (tabContent1) {
            console.log(`   - tabContent1内容長: ${tabContent1.innerHTML.length}文字`);
            console.log(`   - 内容プレビュー: ${tabContent1.innerHTML.substring(0, 100)}...`);
        }
        
        // 4. 動的読み込み状況の確認
        const weightTabScript = document.querySelector('script[src*="tab-weight"]');
        console.log(`   - tab-weight.js読み込み: ${weightTabScript ? '設定あり' : '❌ 設定なし'}`);
        
        // 5. 実際の日付初期化処理を実行（要素が存在しない場合のエラーチェック）
        console.log('\n🔧 日付初期化シミュレーション:');
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayString = `${year}-${month}-${day}`;
            
            console.log(`   - 生成された今日の日付: ${todayString}`);
            
            if (dateInput) {
                dateInput.value = todayString;
                console.log(`   ✅ dateInput.value設定成功: ${dateInput.value}`);
            } else {
                console.log(`   ❌ dateInput要素が不存在のため設定失敗`);
            }
            
            if (weightValue) {
                weightValue.value = '72.0';
                console.log(`   ✅ weightValue設定成功: ${weightValue.value}`);
            } else {
                console.log(`   ❌ weightValue要素が不存在のため設定失敗`);
            }
            
        } catch (error) {
            console.log(`   ❌ 日付初期化エラー: ${error.message}`);
        }
        
        // 6. 外部HTMLファイルの確認
        console.log('\n📁 外部HTMLファイル確認:');
        try {
            const tabWeightHtml = fs.readFileSync('tabs/tab1-weight/tab-weight.html', 'utf8');
            const dateInputInExternal = tabWeightHtml.includes('id="dateInput"');
            const weightValueInExternal = tabWeightHtml.includes('id="weightValue"');
            
            console.log(`   - tab-weight.htmlにdateInput: ${dateInputInExternal ? '✅ 存在' : '❌ 不存在'}`);
            console.log(`   - tab-weight.htmlにweightValue: ${weightValueInExternal ? '✅ 存在' : '❌ 不存在'}`);
            
        } catch (error) {
            console.log(`   ❌ 外部HTMLファイル読み込みエラー: ${error.message}`);
        }
        
        console.log('\n📊 結論:');
        if (!dateInput && !weightValue) {
            console.log('❌ 日付・体重入力要素が存在しないため、初期化処理が失敗します');
            console.log('💡 解決策: 外部HTMLファイル読み込み後に日付初期化を実行する必要があります');
        } else {
            console.log('✅ 要素は存在するため、別の原因を調査する必要があります');
        }
        
    } catch (error) {
        console.log(`❌ チェック実行エラー: ${error.message}`);
    }
}

// メイン実行
checkDateInitialization();