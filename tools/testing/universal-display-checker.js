#!/usr/bin/env node

/**
 * 汎用画面表示チェッカー
 * 任意のHTMLファイルで指定された要素の表示状態を検証
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');

class UniversalDisplayChecker {
    constructor() {
        this.results = [];
    }

    async checkElements(htmlFile, elementsToCheck) {
        console.log(`🧪 画面表示チェック開始: ${htmlFile}`);
        
        try {
            // HTMLファイルを読み込み
            const html = fs.readFileSync(htmlFile, 'utf8');
            const dom = new JSDOM(html, { runScripts: 'outside-only' });
            const document = dom.window.document;
            
            console.log(`✅ ${path.basename(htmlFile)} 読み込み完了`);
            
            // 各要素をチェック
            console.log('\n📋 要素存在チェック:');
            
            const results = {};
            
            for (const elementId of elementsToCheck) {
                const element = document.getElementById(elementId);
                const exists = element !== null;
                
                results[elementId] = {
                    exists: exists,
                    visible: exists ? this.isVisible(element) : false,
                    content: exists ? this.getElementInfo(element) : null
                };
                
                const status = exists ? '✅ 存在' : '❌ 不存在';
                const visibility = exists ? (this.isVisible(element) ? '表示' : '非表示') : '';
                console.log(`   - ${elementId}: ${status} ${visibility}`);
                
                if (exists) {
                    const info = this.getElementInfo(element);
                    if (info.content) {
                        console.log(`     📄 内容: ${info.content.substring(0, 50)}${info.content.length > 50 ? '...' : ''}`);
                    }
                    if (info.style) {
                        console.log(`     🎨 スタイル: ${info.style}`);
                    }
                }
            }
            
            // 結果保存
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const resultFile = `./tools/testing/analysis-results/display_check_${timestamp}.json`;
            
            // ディレクトリが存在しない場合は作成
            const dir = path.dirname(resultFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(resultFile, JSON.stringify({
                file: htmlFile,
                timestamp: new Date().toISOString(),
                results: results
            }, null, 2));
            
            console.log(`\n💾 結果保存: ${resultFile}`);
            
            return results;
            
        } catch (error) {
            console.log(`❌ チェック実行エラー: ${error.message}`);
            return null;
        }
    }
    
    isVisible(element) {
        if (!element) return false;
        
        const style = element.style;
        const computedStyle = element.ownerDocument.defaultView?.getComputedStyle?.(element);
        
        // display: none チェック
        if (style.display === 'none' || computedStyle?.display === 'none') {
            return false;
        }
        
        // visibility: hidden チェック
        if (style.visibility === 'hidden' || computedStyle?.visibility === 'hidden') {
            return false;
        }
        
        // opacity: 0 チェック
        if (style.opacity === '0' || computedStyle?.opacity === '0') {
            return false;
        }
        
        return true;
    }
    
    getElementInfo(element) {
        if (!element) return null;
        
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            content: element.innerHTML || element.textContent || '',
            style: element.style.cssText,
            attributes: Array.from(element.attributes).map(attr => ({
                name: attr.name,
                value: attr.value
            }))
        };
    }
}

// コマンドライン使用例
if (require.main === module) {
    const checker = new UniversalDisplayChecker();
    
    // 使用例1: 体重管理タブのグラフ要素チェック
    const weightElements = [
        'dateInput', 'weightValue', 'weightChart', 'chartPanel', 
        'weightHistory', 'weightHistoryPanel'
    ];
    
    // 使用例2: 汎用要素チェック（他のタブでも使用可能）
    const commonElements = [
        'tabContent1', 'tabContent2', 'tabContent3', 'tabContent8'
    ];
    
    console.log('🔧 使用例:');
    console.log('   node tools/testing/universal-display-checker.js weight');
    console.log('   node tools/testing/universal-display-checker.js room');
    console.log('   node tools/testing/universal-display-checker.js memo');
    console.log('   node tools/testing/universal-display-checker.js common');
    
    const mode = process.argv[2];
    
    if (mode === 'weight') {
        checker.checkElements('tabs/tab1-weight/tab-weight.html', weightElements);
    } else if (mode === 'room') {
        const roomElements = ['roomDataDisplay', 'roomHistoryArea', 'roomButtons'];
        checker.checkElements('tabs/tab3-room-cleaning/tab-room-cleaning.html', roomElements);
    } else if (mode === 'memo') {
        const memoElements = ['memoListArea', 'newMemoText', 'memoCategory'];
        checker.checkElements('tabs/tab8-memo-list/tab-memo-list.html', memoElements);
    } else if (mode === 'common') {
        checker.checkElements('index.html', commonElements);
    } else {
        console.log('❌ 使用方法: node tools/testing/universal-display-checker.js [weight|room|memo|common]');
    }
}

module.exports = UniversalDisplayChecker;