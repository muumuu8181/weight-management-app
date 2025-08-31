#!/usr/bin/env node

/**
 * Display State Checker - 汎用要素表示状態診断ツール
 * 任意のHTMLファイルで要素の表示状態を詳細分析
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { JSDOM } = require('jsdom');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// コマンドライン引数
const argv = yargs(hideBin(process.argv))
  .option('target', {
    alias: 't',
    type: 'string',
    default: 'index.html',
    description: 'チェック対象のHTMLファイル'
  })
  .option('elements', {
    alias: 'e',
    type: 'array',
    description: 'チェック対象の要素ID（複数指定可）'
  })
  .option('config', {
    alias: 'c',
    type: 'string',
    description: '設定ファイルのパス（JSON形式）'
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    default: false,
    description: '詳細ログを出力'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: '結果出力ファイル（JSON形式）'
  })
  .help()
  .argv;

class DisplayStateChecker {
    constructor(options = {}) {
        this.options = {
            targetFile: options.targetFile || 'index.html',
            checkElements: options.checkElements || [],
            verbose: options.verbose || false,
            autoDetect: options.autoDetect || true,
            outputFile: options.outputFile || null,
            ...options
        };
    }

    // 設定ファイル読み込み
    async loadConfig(configPath) {
        if (configPath && fs.existsSync(configPath)) {
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                this.options = { ...this.options, ...config };
                this.log('info', `設定読み込み: ${configPath}`);
            } catch (error) {
                this.log('warning', `設定読み込み失敗: ${error.message}`);
            }
        }
    }

    // 要素自動検出
    autoDetectElements(document) {
        const elements = [];
        
        // 一般的な重要要素を自動検出
        const selectors = [
            '[id$="Panel"]',     // xxxPanel
            '[id$="History"]',   // xxxHistory  
            '[id$="Chart"]',     // xxxChart
            '[id$="Input"]',     // xxxInput
            '[id$="Content"]',   // xxxContent
            '.input-card',       // input-card クラス
            '.tab-content',      // tab-content クラス
            '.hidden'            // hidden クラス
        ];
        
        selectors.forEach(selector => {
            const found = document.querySelectorAll(selector);
            found.forEach(element => {
                if (element.id) {
                    elements.push(element.id);
                }
            });
        });
        
        return [...new Set(elements)]; // 重複除去
    }

    // 要素詳細分析
    analyzeElement(document, window, elementId) {
        const element = document.getElementById(elementId);
        
        if (!element) {
            return { exists: false, elementId };
        }
        
        const computedStyle = window.getComputedStyle(element);
        const isHidden = element.classList.contains('hidden');
        const display = computedStyle.display;
        const visibility = computedStyle.visibility;
        const opacity = computedStyle.opacity;
        
        // 表示状態の判定
        const isVisible = !isHidden && 
                         display !== 'none' && 
                         visibility !== 'hidden' && 
                         parseFloat(opacity) > 0;
        
        // 親要素チェック
        const parent = element.parentElement;
        const parentInfo = parent ? {
            tagName: parent.tagName,
            id: parent.id,
            hidden: parent.classList.contains('hidden'),
            display: window.getComputedStyle(parent).display
        } : null;
        
        return {
            exists: true,
            elementId,
            tagName: element.tagName,
            className: element.className,
            isVisible,
            style: {
                hidden: isHidden,
                display,
                visibility,
                opacity: parseFloat(opacity)
            },
            content: {
                innerHTML: element.innerHTML.length,
                textContent: element.textContent.length,
                children: element.children.length
            },
            parent: parentInfo,
            position: {
                offsetTop: element.offsetTop,
                offsetLeft: element.offsetLeft,
                offsetWidth: element.offsetWidth,
                offsetHeight: element.offsetHeight
            }
        };
    }

    // メイン実行
    async checkDisplayState() {
        const targetPath = path.resolve(this.options.targetFile);
        
        if (!fs.existsSync(targetPath)) {
            throw new Error(`ファイルが見つかりません: ${targetPath}`);
        }
        
        const html = fs.readFileSync(targetPath, 'utf8');
        
        const dom = new JSDOM(html, {
            runScripts: "dangerously",
            resources: "usable", 
            pretendToBeVisual: true
        });
        
        const { window, document } = dom;
        
        // DOM読み込み完了を待つ
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // チェック対象要素の決定
        let checkElements = this.options.checkElements;
        if (this.options.autoDetect && checkElements.length === 0) {
            checkElements = this.autoDetectElements(document);
            this.log('info', `自動検出: ${checkElements.length}個の要素`);
        }
        
        // 各要素の分析
        const results = {
            targetFile: this.options.targetFile,
            timestamp: new Date(),
            totalElements: checkElements.length,
            elements: {},
            summary: {
                visible: 0,
                hidden: 0,
                missing: 0
            }
        };
        
        console.log(`\n🔍 表示状態チェック: ${path.basename(targetPath)}`);
        console.log(`📊 チェック対象: ${checkElements.length}個の要素\n`);
        
        for (const elementId of checkElements) {
            const analysis = this.analyzeElement(document, window, elementId);
            results.elements[elementId] = analysis;
            
            if (!analysis.exists) {
                results.summary.missing++;
                this.log('error', `${elementId}: 要素不存在`);
            } else if (analysis.isVisible) {
                results.summary.visible++;
                this.log('success', `${elementId}: 表示中 (${analysis.content.innerHTML}文字)`);
            } else {
                results.summary.hidden++;
                this.log('warning', `${elementId}: 非表示 (${analysis.style.display})`);
                
                if (this.options.verbose) {
                    console.log(`   📋 詳細: hidden=${analysis.style.hidden}, opacity=${analysis.style.opacity}`);
                    if (analysis.parent) {
                        console.log(`   👆 親要素: ${analysis.parent.tagName}#${analysis.parent.id} (${analysis.parent.display})`);
                    }
                }
            }
        }
        
        // 結果保存
        if (this.options.outputFile) {
            fs.writeFileSync(this.options.outputFile, JSON.stringify(results, null, 2));
            console.log(`\n💾 詳細結果保存: ${this.options.outputFile}`);
        }
        
        // サマリー表示
        console.log(`\n📊 表示状態サマリー:`);
        console.log(`✅ 表示中: ${results.summary.visible}個`);
        console.log(`⚠️  非表示: ${results.summary.hidden}個`);  
        console.log(`❌ 不存在: ${results.summary.missing}個`);
        
        return results;
    }

    // ログ出力
    log(type, message) {
        const colors = {
            info: chalk.blue,
            success: chalk.green,
            warning: chalk.yellow,
            error: chalk.red
        };
        
        const prefix = {
            info: '📋',
            success: '✅', 
            warning: '⚠️',
            error: '❌'
        }[type] || '📋';
        
        console.log(`${prefix} ${colors[type](message)}`);
    }
}

// 使用例とヘルプ
function showUsageExamples() {
    console.log(chalk.blue('\n📋 使用例:\n'));
    
    console.log('# 基本使用（自動検出）');
    console.log('node display-state-checker.js --target index.html\n');
    
    console.log('# 特定要素のみチェック');
    console.log('node display-state-checker.js -t page.html -e weightHistory chartPanel\n');
    
    console.log('# 設定ファイル使用');
    console.log('node display-state-checker.js --config check-config.json\n');
    
    console.log('# 詳細ログ + 結果保存');
    console.log('node display-state-checker.js -t index.html --verbose -o results.json');
}

// CLI実行
if (require.main === module) {
    (async () => {
        try {
            const checker = new DisplayStateChecker({
                targetFile: argv.target,
                checkElements: argv.elements || [],
                verbose: argv.verbose,
                outputFile: argv.output
            });
            
            if (argv.config) {
                await checker.loadConfig(argv.config);
            }
            
            if (argv.help || (!argv.target && !argv.config)) {
                showUsageExamples();
                return;
            }
            
            await checker.checkDisplayState();
            
        } catch (error) {
            console.error(chalk.red('❌ エラー:'), error.message);
            process.exit(1);
        }
    })();
}

module.exports = DisplayStateChecker;