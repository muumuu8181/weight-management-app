#!/usr/bin/env node
/**
 * JSDoMで体重管理タブの表示状態を確実にチェック
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');

function checkWeightDisplay() {
    console.log('🔍 JSDoM体重表示チェック開始...');
    
    const html = fs.readFileSync('index.html', 'utf8');
    
    const dom = new JSDOM(html, {
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true
    });
    
    const window = dom.window;
    const document = window.document;
    
    // 基本要素の存在確認
    const elements = {
        weightHistory: document.getElementById('weightHistory'),
        weightHistoryPanel: document.getElementById('weightHistoryPanel'),  
        weightChart: document.getElementById('weightChart'),
        chartPanel: document.getElementById('chartPanel'),
        tabContent1: document.getElementById('tabContent1')
    };
    
    console.log('\n📋 要素存在チェック:');
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`${element ? '✅' : '❌'} ${name}: ${element ? '存在' : '不存在'}`);
        if (element) {
            const isHidden = element.classList.contains('hidden');
            const display = window.getComputedStyle(element).display;
            const visibility = window.getComputedStyle(element).visibility;
            console.log(`   📊 ${name}: hidden=${isHidden}, display=${display}, visibility=${visibility}`);
            console.log(`   📄 innerHTML長: ${element.innerHTML.length}文字`);
        }
    });
    
    // weightHistoryPanel の詳細チェック
    if (elements.weightHistoryPanel) {
        console.log('\n🔍 weightHistoryPanel詳細:');
        console.log(`   クラス: ${elements.weightHistoryPanel.className}`);
        console.log(`   スタイル: ${elements.weightHistoryPanel.style.cssText}`);
        console.log(`   子要素数: ${elements.weightHistoryPanel.children.length}`);
        
        // 親要素チェック
        const parent = elements.weightHistoryPanel.parentElement;
        if (parent) {
            console.log(`   親要素: ${parent.tagName}#${parent.id}`);
            console.log(`   親hidden: ${parent.classList.contains('hidden')}`);
        }
    }
    
    return {
        elements,
        summary: Object.fromEntries(
            Object.entries(elements).map(([name, element]) => [
                name, 
                element ? {
                    exists: true,
                    hidden: element.classList.contains('hidden'),
                    display: window.getComputedStyle(element).display,
                    contentLength: element.innerHTML.length
                } : { exists: false }
            ])
        )
    };
}

if (require.main === module) {
    try {
        const result = checkWeightDisplay();
        console.log('\n📊 チェック完了');
        
        // 出力ディレクトリ作成
        const outputDir = './tools/testing/analysis-results/';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // 結果をJSONで保存
        fs.writeFileSync(`${outputDir}weight_display_check.json`, JSON.stringify(result.summary, null, 2));
        console.log(`💾 結果保存: ${outputDir}weight_display_check.json`);
        
    } catch (error) {
        console.log('❌ JSDoMチェックエラー:', error.message);
    }
}