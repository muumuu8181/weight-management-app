#!/usr/bin/env node

/**
 * Simple Display Checker - 軽量表示状態診断ツール
 * 標準ライブラリのみで動作する汎用版
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class SimpleDisplayChecker {
    constructor(options = {}) {
        this.options = {
            targetFile: options.targetFile || 'index.html',
            checkElements: options.checkElements || [],
            verbose: options.verbose || false,
            autoDetect: options.autoDetect || true,
            ...options
        };
    }

    // 要素自動検出
    autoDetectElements(document) {
        const elements = [];
        const selectors = [
            '[id$="Panel"]', '[id$="History"]', '[id$="Chart"]', 
            '[id$="Input"]', '[id$="Content"]', '.input-card', 
            '.tab-content', '.hidden'
        ];
        
        selectors.forEach(selector => {
            const found = document.querySelectorAll(selector);
            found.forEach(element => {
                if (element.id) elements.push(element.id);
            });
        });
        
        return [...new Set(elements)];
    }

    // 要素分析
    analyzeElement(document, window, elementId) {
        const element = document.getElementById(elementId);
        
        if (!element) {
            return { exists: false, elementId };
        }
        
        const style = window.getComputedStyle(element);
        const isHidden = element.classList.contains('hidden');
        const isVisible = !isHidden && 
                         style.display !== 'none' && 
                         style.visibility !== 'hidden' && 
                         parseFloat(style.opacity) > 0;
        
        return {
            exists: true,
            elementId,
            isVisible,
            hidden: isHidden,
            display: style.display,
            visibility: style.visibility,
            opacity: parseFloat(style.opacity),
            contentLength: element.innerHTML.length,
            children: element.children.length
        };
    }

    // メイン実行
    async check() {
        console.log('🔍 Display State Checker - 表示状態診断');
        
        if (!fs.existsSync(this.options.targetFile)) {
            console.log(`❌ ファイル不存在: ${this.options.targetFile}`);
            return false;
        }
        
        const html = fs.readFileSync(this.options.targetFile, 'utf8');
        const dom = new JSDOM(html, { 
            runScripts: "dangerously",
            pretendToBeVisual: true 
        });
        
        let checkElements = this.options.checkElements;
        if (this.options.autoDetect && checkElements.length === 0) {
            checkElements = this.autoDetectElements(dom.window.document);
            console.log(`📊 自動検出: ${checkElements.length}個の要素`);
        }
        
        const results = { visible: 0, hidden: 0, missing: 0 };
        
        console.log(`\n📋 チェック結果:`);
        for (const elementId of checkElements) {
            const analysis = this.analyzeElement(dom.window.document, dom.window, elementId);
            
            if (!analysis.exists) {
                results.missing++;
                console.log(`❌ ${elementId}: 不存在`);
            } else if (analysis.isVisible) {
                results.visible++;
                console.log(`✅ ${elementId}: 表示中 (${analysis.contentLength}文字)`);
            } else {
                results.hidden++;
                console.log(`⚠️  ${elementId}: 非表示 (${analysis.display})`);
                if (this.options.verbose) {
                    console.log(`   📋 hidden=${analysis.hidden}, opacity=${analysis.opacity}`);
                }
            }
        }
        
        console.log(`\n📊 サマリー: 表示=${results.visible}, 非表示=${results.hidden}, 不存在=${results.missing}`);
        return results;
    }
}

// CLI使用
if (require.main === module) {
    const args = process.argv.slice(2);
    const targetFile = args[0] || 'index.html';
    const elements = args.slice(1);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log('使用例:');
        console.log('node simple-display-checker.js index.html weightPanel chartPanel');
        console.log('node simple-display-checker.js page.html  # 自動検出');
        return;
    }
    
    const checker = new SimpleDisplayChecker({
        targetFile,
        checkElements: elements,
        verbose: args.includes('--verbose'),
        autoDetect: elements.length === 0
    });
    
    checker.check().catch(error => {
        console.log('❌ エラー:', error.message);
        process.exit(1);
    });
}

module.exports = SimpleDisplayChecker;