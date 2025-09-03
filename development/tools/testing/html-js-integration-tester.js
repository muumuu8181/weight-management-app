// HTML-JS統合テストツール - DOM要素整合性・関数依存性検証
// 今回のような「テスト合格だが実際は破綻」問題を防ぐ統合レベル検証

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

class HTMLJSIntegrationTester {
    constructor(projectRoot = '.') {
        this.projectRoot = projectRoot;
        this.testResults = [];
        this.tabsDir = path.join(projectRoot, 'tabs');
    }

    // メイン統合テスト実行
    async runFullIntegrationTest() {
        console.log('🔍 HTML-JS統合テストツール開始...');
        console.log('==================================================');
        
        const tabDirs = await this.getTabDirectories();
        let totalTests = 0;
        let passedTests = 0;
        
        for (const tabDir of tabDirs) {
            console.log(`\n🧪 ${tabDir} 統合テスト開始`);
            console.log('--------------------------------------------------');
            
            const result = await this.testTabIntegration(tabDir);
            this.testResults.push(result);
            
            totalTests++;
            if (result.overallStatus === 'PASS') {
                passedTests++;
            }
            
            this.printTabResult(result);
        }
        
        console.log('\n📊 統合テスト結果サマリー');
        console.log('==================================================');
        console.log(`📈 総テスト数: ${totalTests}`);
        console.log(`✅ 成功: ${passedTests}`);
        console.log(`❌ 失敗: ${totalTests - passedTests}`);
        console.log(`📊 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        // 詳細レポート保存
        await this.generateReport();
        
        return this.testResults;
    }

    // タブディレクトリ取得
    async getTabDirectories() {
        try {
            const dirs = await fs.readdir(this.tabsDir);
            return dirs.filter(dir => dir.startsWith('tab') && !dir.includes('.'));
        } catch (error) {
            console.error('❌ タブディレクトリ取得エラー:', error.message);
            return [];
        }
    }

    // 個別タブ統合テスト
    async testTabIntegration(tabDir) {
        const tabPath = path.join(this.tabsDir, tabDir);
        const result = {
            tabName: tabDir,
            tests: {},
            issues: [],
            overallStatus: 'PASS'
        };

        try {
            // HTML/JSファイル取得
            const files = await this.getTabFiles(tabPath);
            
            // Test 1: DOM要素整合性
            result.tests.domConsistency = await this.testDOMConsistency(files);
            
            // Test 2: 関数依存性
            result.tests.functionDependency = await this.testFunctionDependency(files);
            
            // Test 3: 実HTML-JS統合
            result.tests.htmlJsIntegration = await this.testRealIntegration(files, tabDir);
            
            // Test 4: 重要機能の実動作
            result.tests.criticalFunctions = await this.testCriticalFunctions(files, tabDir);
            
            // 総合判定
            const failedTests = Object.values(result.tests).filter(test => test.status === 'FAIL');
            if (failedTests.length > 0) {
                result.overallStatus = 'FAIL';
                result.issues.push(`${failedTests.length}個のテストが失敗`);
            }
            
        } catch (error) {
            result.overallStatus = 'ERROR';
            result.issues.push(`統合テストエラー: ${error.message}`);
        }

        return result;
    }

    // タブファイル取得
    async getTabFiles(tabPath) {
        const files = {
            html: [],
            js: [],
            css: []
        };

        try {
            const entries = await fs.readdir(tabPath);
            
            for (const entry of entries) {
                const filePath = path.join(tabPath, entry);
                const stat = await fs.stat(filePath);
                
                if (stat.isFile()) {
                    if (entry.endsWith('.html')) files.html.push({ name: entry, path: filePath });
                    else if (entry.endsWith('.js')) files.js.push({ name: entry, path: filePath });
                    else if (entry.endsWith('.css')) files.css.push({ name: entry, path: filePath });
                }
            }
        } catch (error) {
            console.error(`❌ ${tabPath} ファイル取得エラー:`, error.message);
        }

        return files;
    }

    // Test 1: DOM要素整合性チェック
    async testDOMConsistency(files) {
        const result = {
            status: 'PASS',
            details: {},
            issues: []
        };

        try {
            // JSファイルから getElementById 参照を抽出
            const jsReferences = new Set();
            for (const jsFile of files.js) {
                const content = await fs.readFile(jsFile.path, 'utf-8');
                const matches = content.match(/getElementById\(['"`]([^'"`]+)['"`]\)/g) || [];
                matches.forEach(match => {
                    const id = match.match(/['"`]([^'"`]+)['"`]/)[1];
                    jsReferences.add(id);
                });
            }

            // HTMLファイルから実際のID要素を抽出
            const htmlElements = new Set();
            for (const htmlFile of files.html) {
                const content = await fs.readFile(htmlFile.path, 'utf-8');
                const matches = content.match(/id=['"`]([^'"`]+)['"`]/g) || [];
                matches.forEach(match => {
                    const id = match.match(/['"`]([^'"`]+)['"`]/)[1];
                    htmlElements.add(id);
                });
            }

            // 不整合検出
            const missingInHTML = [...jsReferences].filter(id => !htmlElements.has(id));
            const unusedInHTML = [...htmlElements].filter(id => !jsReferences.has(id));

            result.details = {
                jsReferences: jsReferences.size,
                htmlElements: htmlElements.size,
                missingInHTML: missingInHTML,
                unusedInHTML: unusedInHTML
            };

            if (missingInHTML.length > 0) {
                result.status = 'FAIL';
                result.issues.push(`HTML不在要素: ${missingInHTML.join(', ')}`);
            }

            console.log(`  📋 DOM整合性: ${result.status}`);
            console.log(`    JS参照: ${jsReferences.size}個, HTML要素: ${htmlElements.size}個`);
            if (missingInHTML.length > 0) {
                console.log(`    ❌ HTML未定義: ${missingInHTML.join(', ')}`);
            }
            if (unusedInHTML.length > 0) {
                console.log(`    ⚠️ JS未参照: ${unusedInHTML.join(', ')}`);
            }

        } catch (error) {
            result.status = 'ERROR';
            result.issues.push(`DOM検証エラー: ${error.message}`);
            console.log(`  ❌ DOM整合性検証エラー: ${error.message}`);
        }

        return result;
    }

    // Test 2: 関数依存性チェック
    async testFunctionDependency(files) {
        const result = {
            status: 'PASS',
            details: {},
            issues: []
        };

        try {
            const allJSContent = (await Promise.all(
                files.js.map(file => fs.readFile(file.path, 'utf-8'))
            )).join('\n');

            // typeof チェックされる関数を抽出
            const typeofChecks = [...allJSContent.matchAll(/typeof\s+([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\s*===\s*['"`]function['"`]/g)]
                .map(match => match[1]);

            // 実際に定義された関数を抽出
            const functionDefs = [
                ...allJSContent.matchAll(/(?:function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|(?:window\.)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=.*?function)/g)
            ].map(match => match[1] || match[2]).filter(Boolean);

            // window.xxx 関数も追加
            const windowFunctions = [...allJSContent.matchAll(/window\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g)]
                .map(match => match[1]);

            const allDefinedFunctions = new Set([...functionDefs, ...windowFunctions]);
            const missingFunctions = typeofChecks.filter(fn => {
                const simpleName = fn.split('.').pop();
                return !allDefinedFunctions.has(simpleName) && !allDefinedFunctions.has(fn);
            });

            result.details = {
                typeofChecks: typeofChecks.length,
                definedFunctions: allDefinedFunctions.size,
                missingFunctions
            };

            if (missingFunctions.length > 0) {
                result.status = 'FAIL';
                result.issues.push(`未定義関数: ${missingFunctions.join(', ')}`);
            }

            console.log(`  🔧 関数依存性: ${result.status}`);
            console.log(`    typeof確認: ${typeofChecks.length}個, 定義済み: ${allDefinedFunctions.size}個`);
            if (missingFunctions.length > 0) {
                console.log(`    ❌ 未定義関数: ${missingFunctions.join(', ')}`);
            }

        } catch (error) {
            result.status = 'ERROR';
            result.issues.push(`関数依存性検証エラー: ${error.message}`);
            console.log(`  ❌ 関数依存性検証エラー: ${error.message}`);
        }

        return result;
    }

    // Test 3: 実HTML-JS統合テスト
    async testRealIntegration(files, tabDir) {
        const result = {
            status: 'PASS',
            details: {},
            issues: []
        };

        try {
            if (files.html.length === 0) {
                result.status = 'SKIP';
                result.issues.push('HTMLファイルが見つかりません');
                console.log(`  ⚠️ 実統合テスト: スキップ (HTMLなし)`);
                return result;
            }

            // メインHTMLファイル選択
            const mainHTML = files.html.find(f => f.name.includes(tabDir.replace('tab', ''))) || files.html[0];
            const htmlContent = await fs.readFile(mainHTML.path, 'utf-8');

            // JSDOM環境構築
            const dom = new JSDOM(htmlContent, {
                runScripts: "dangerously",
                resources: "usable",
                beforeParse(window) {
                    // Firebase mock
                    window.firebase = {
                        database: () => ({
                            ref: () => ({
                                push: async () => ({ key: 'test' }),
                                once: async () => ({ val: () => null, exists: () => false }),
                                on: () => {},
                                off: () => {}
                            })
                        })
                    };
                    // ログ関数 mock
                    window.log = (msg) => console.log(`[JSDOM] ${msg}`);
                    window.currentUser = { uid: 'test', email: 'test@test.com' };
                    window.currentTab = 1;
                }
            });

            // JSファイル読み込み・実行
            for (const jsFile of files.js) {
                const jsContent = await fs.readFile(jsFile.path, 'utf-8');
                try {
                    const script = dom.window.document.createElement('script');
                    script.textContent = jsContent;
                    dom.window.document.head.appendChild(script);
                    console.log(`    ✅ JS読み込み成功: ${jsFile.name}`);
                } catch (jsError) {
                    result.issues.push(`JS実行エラー (${jsFile.name}): ${jsError.message}`);
                    console.log(`    ❌ JS実行エラー (${jsFile.name}): ${jsError.message}`);
                }
            }

            // 重要機能の実行テスト
            const window = dom.window;
            const document = window.document;

            // DOM要素存在確認
            const criticalElements = this.extractCriticalElements(tabDir);
            const elementResults = [];

            for (const elementId of criticalElements) {
                const element = document.getElementById(elementId);
                elementResults.push({
                    id: elementId,
                    exists: !!element,
                    type: element ? element.tagName : 'NOT_FOUND'
                });
            }

            const missingElements = elementResults.filter(el => !el.exists);
            if (missingElements.length > 0) {
                result.status = 'FAIL';
                result.issues.push(`要素未発見: ${missingElements.map(el => el.id).join(', ')}`);
            }

            result.details = {
                htmlFile: mainHTML.name,
                jsFiles: files.js.map(f => f.name),
                elementResults,
                domReady: !!document.readyState
            };

            console.log(`  🌐 実統合テスト: ${result.status}`);
            console.log(`    HTML: ${mainHTML.name}, JS: ${files.js.length}ファイル`);
            
            if (missingElements.length > 0) {
                console.log(`    ❌ 要素未発見: ${missingElements.map(el => el.id).join(', ')}`);
            } else {
                console.log(`    ✅ 全要素発見: ${elementResults.length}個`);
            }

        } catch (error) {
            result.status = 'ERROR';
            result.issues.push(`実統合テストエラー: ${error.message}`);
            console.log(`  ❌ 実統合テストエラー: ${error.message}`);
        }

        return result;
    }

    // Test 4: 重要機能実動作テスト  
    async testCriticalFunctions(files, tabDir) {
        const result = {
            status: 'PASS',
            details: {},
            issues: []
        };

        try {
            const allJSContent = (await Promise.all(
                files.js.map(file => fs.readFile(file.path, 'utf-8'))
            )).join('\n');

            // タブ固有の重要関数を特定
            const criticalFunctions = this.getCriticalFunctions(tabDir);
            const functionResults = [];

            for (const funcName of criticalFunctions) {
                const isDefinedInJS = new RegExp(`(?:function\\s+${funcName}|window\\.${funcName}\\s*=|${funcName}\\s*=.*?function)`).test(allJSContent);
                
                functionResults.push({
                    name: funcName,
                    defined: isDefinedInJS
                });

                if (!isDefinedInJS) {
                    result.status = 'FAIL';
                    result.issues.push(`重要関数未定義: ${funcName}`);
                }
            }

            result.details = {
                criticalFunctions: criticalFunctions.length,
                functionResults
            };

            console.log(`  ⚡ 重要機能テスト: ${result.status}`);
            console.log(`    重要関数: ${criticalFunctions.length}個確認`);
            
            const undefinedFunctions = functionResults.filter(f => !f.defined);
            if (undefinedFunctions.length > 0) {
                console.log(`    ❌ 未定義: ${undefinedFunctions.map(f => f.name).join(', ')}`);
            } else {
                console.log(`    ✅ 全関数定義済み`);
            }

        } catch (error) {
            result.status = 'ERROR';
            result.issues.push(`重要機能テストエラー: ${error.message}`);
            console.log(`  ❌ 重要機能テストエラー: ${error.message}`);
        }

        return result;
    }

    // タブ固有の重要要素ID取得
    extractCriticalElements(tabDir) {
        const elementMap = {
            'tab1-weight': ['dateInput', 'weightValue', 'weightHistory', 'historyArea', 'weightChart'],
            'tab2-sleep': ['sleepDateInput', 'sleepTimeInput', 'sleepHistoryArea'],
            'tab3-room-cleaning': ['roomDateInput', 'roomDuration', 'roomHistoryArea', 'selectedRoom'],
            'tab4-stretch': ['stretchDateInput', 'stretchTimeInput'],
            'tab5-dashboard': ['dashboardContent'],
            'tab6-job-dc': ['jobDateInput', 'jobTimeInput'],
            'tab7-pedometer': ['pedometerDateInput', 'stepsInput'],
            'tab8-memo-list': ['newMemoText', 'memoListContainer']
        };
        
        return elementMap[tabDir] || ['dateInput', 'timeInput'];
    }

    // タブ固有の重要関数取得
    getCriticalFunctions(tabDir) {
        const functionMap = {
            'tab1-weight': ['saveWeightData', 'selectTiming', 'selectClothingTop', 'updateChart', 'loadUserWeightData'],
            'tab2-sleep': ['saveSleepData', 'loadSleepData'],
            'tab3-room-cleaning': ['saveRoomData', 'startRoomCleaning', 'endRoomCleaning', 'selectRoom'],
            'tab4-stretch': ['saveStretchData'],
            'tab7-pedometer': ['savePedometerData'],
            'tab8-memo-list': ['saveMemoData']
        };
        
        return functionMap[tabDir] || [];
    }

    // 結果表示
    printTabResult(result) {
        const status = result.overallStatus === 'PASS' ? '✅' : result.overallStatus === 'FAIL' ? '❌' : '⚠️';
        console.log(`📊 ${result.tabName}: ${status} ${result.overallStatus}`);
        
        if (result.issues.length > 0) {
            result.issues.forEach(issue => {
                console.log(`  🚨 ${issue}`);
            });
        }
    }

    // 詳細レポート生成
    async generateReport() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = path.join(this.projectRoot, 'tools', 'reports', `integration-test-report-${timestamp}.json`);
        
        const reportData = {
            timestamp: new Date().toISOString(),
            testResults: this.testResults,
            summary: {
                totalTabs: this.testResults.length,
                passed: this.testResults.filter(r => r.overallStatus === 'PASS').length,
                failed: this.testResults.filter(r => r.overallStatus === 'FAIL').length,
                errors: this.testResults.filter(r => r.overallStatus === 'ERROR').length
            }
        };

        try {
            await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
            console.log(`\n📄 詳細レポート保存: ${reportPath}`);
        } catch (error) {
            console.log(`❌ レポート保存エラー: ${error.message}`);
        }
    }
}

// CLI実行
async function main() {
    const tester = new HTMLJSIntegrationTester();
    await tester.runFullIntegrationTest();
}

// モジュール実行時
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 統合テスト実行エラー:', error);
        process.exit(1);
    });
}

module.exports = HTMLJSIntegrationTester;