// 🧪 タブナビゲーションテスター
// タブ切り替え後の動的要素検証用テストツール

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// 色付きログ出力
const log = {
    success: (msg) => console.log(`✅ ${msg}`),
    error: (msg) => console.log(`❌ ${msg}`),
    info: (msg) => console.log(`📋 ${msg}`),
    warning: (msg) => console.log(`⚠️  ${msg}`),
    tab: (msg) => console.log(`📑 ${msg}`)
};

// タブナビゲーションテスト
async function testTabNavigation(htmlPath = './index.html') {
    log.info('タブナビゲーションテスト開始');
    
    try {
        // HTMLファイル読み込み
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        const dom = new JSDOM(htmlContent, {
            runScripts: "dangerously",
            resources: "usable",
            url: "http://localhost",
            pretendToBeVisual: true,
            beforeParse(window) {
                // Firebase モック
                window.firebase = {
                    auth: () => ({ currentUser: { uid: 'test-user' } }),
                    database: () => ({})
                };
                window.currentUser = { uid: 'test-user' };
            }
        });
        
        const window = dom.window;
        const document = window.document;
        
        log.success('HTMLファイル読み込み完了');
        
        // テスト結果格納
        const results = {
            timestamp: new Date().toISOString(),
            tabs: [],
            dynamicElements: {},
            navigation: {
                tabButtons: 0,
                activeTab: null
            }
        };
        
        // 1. タブボタンの検出
        log.info('タブボタンの検出');
        const tabButtons = document.querySelectorAll('.tab-button');
        results.navigation.tabButtons = tabButtons.length;
        log.info(`タブボタン数: ${tabButtons.length}`);
        
        // 各タブボタンの情報収集
        tabButtons.forEach((button, index) => {
            const tabInfo = {
                index: index,
                text: button.textContent.trim(),
                onclick: button.onclick ? 'defined' : 'undefined',
                active: button.classList.contains('active')
            };
            results.tabs.push(tabInfo);
            log.tab(`タブ${index + 1}: ${tabInfo.text} (onclick: ${tabInfo.onclick})`);
        });
        
        // 2. タブ5（ダッシュボード）のシミュレーション
        log.info('タブ5（ダッシュボード）クリックシミュレーション');
        
        // showTab関数の存在確認
        if (typeof window.showTab === 'function') {
            log.success('showTab関数が定義されています');
            
            // タブ5をアクティブ化
            try {
                window.showTab(5);
                log.success('showTab(5)実行完了');
                
                // タブコンテンツの確認
                const tabContent5 = document.getElementById('tabContent5');
                if (tabContent5) {
                    const isHidden = tabContent5.classList.contains('hidden');
                    log.info(`tabContent5表示状態: ${isHidden ? '非表示' : '表示'}`);
                    
                    // コンテンツの中身を確認
                    const contentLength = tabContent5.innerHTML.length;
                    log.info(`tabContent5コンテンツ長: ${contentLength}文字`);
                    
                    if (contentLength > 100) {
                        log.success('ダッシュボードコンテンツが読み込まれています');
                    }
                }
                
            } catch (error) {
                log.error(`showTab実行エラー: ${error.message}`);
            }
        } else {
            log.error('showTab関数が定義されていません');
        }
        
        // 3. ダッシュボード初期化関数の確認
        log.info('ダッシュボード初期化関数の確認');
        const dashboardFunctions = [
            'initDashboard',
            'switchDashboardView',
            'refreshDashboardData',
            'addAINavigationButton',
            'initAIAnalysis',
            'initAIAnalysisAsync'
        ];
        
        dashboardFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                log.success(`${funcName}関数: 定義済み`);
                results.dynamicElements[funcName] = 'defined';
            } else {
                log.warning(`${funcName}関数: 未定義`);
                results.dynamicElements[funcName] = 'undefined';
            }
        });
        
        // 4. 動的要素の待機と検証
        log.info('動的要素の待機開始（最大10秒）');
        
        const waitForElements = () => {
            return new Promise((resolve) => {
                let checkCount = 0;
                const maxChecks = 20; // 0.5秒ごとに20回 = 10秒
                const foundElements = [];
                
                const interval = setInterval(() => {
                    checkCount++;
                    
                    // ダッシュボードナビゲーション要素
                    const dashNav = document.querySelector('.dashboard-tab-switcher') || 
                                  document.querySelector('.dashboard-nav');
                    
                    if (dashNav && !foundElements.includes('dashboard-nav')) {
                        foundElements.push('dashboard-nav');
                        log.success(`ダッシュボードナビゲーション発見（${checkCount * 0.5}秒後）`);
                        
                        // ナビゲーション内のボタンを確認
                        const navButtons = dashNav.querySelectorAll('button');
                        log.info(`ナビゲーションボタン数: ${navButtons.length}`);
                        
                        navButtons.forEach(btn => {
                            log.tab(`- ${btn.textContent.trim()}`);
                            if (btn.textContent.includes('AI') || btn.textContent.includes('🤖')) {
                                foundElements.push('ai-button');
                                log.success('AIボタン発見！');
                            }
                        });
                    }
                    
                    // ダッシュボードコンテナ
                    const dashContainer = document.querySelector('.dashboard-container');
                    if (dashContainer && !foundElements.includes('dashboard-container')) {
                        foundElements.push('dashboard-container');
                        log.success(`ダッシュボードコンテナ発見（${checkCount * 0.5}秒後）`);
                    }
                    
                    // 終了条件
                    if (checkCount >= maxChecks) {
                        log.info('動的要素待機終了');
                        clearInterval(interval);
                        resolve(foundElements);
                    }
                }, 500);
            });
        };
        
        const foundElements = await waitForElements();
        results.dynamicElements.foundElements = foundElements;
        
        // 5. 結果サマリー
        log.info('=== テスト結果サマリー ===');
        log.info(`検出タブ数: ${results.navigation.tabButtons}`);
        log.info(`ダッシュボード関数: ${Object.values(results.dynamicElements).filter(v => v === 'defined').length}/${dashboardFunctions.length}`);
        log.info(`動的要素発見: ${foundElements.length}個`);
        
        // 問題診断
        if (!foundElements.includes('ai-button')) {
            log.warning('=== AI ボタン未検出の原因分析 ===');
            
            if (!foundElements.includes('dashboard-nav')) {
                log.error('ダッシュボードナビゲーション要素が生成されていません');
            }
            
            if (results.dynamicElements.addAINavigationButton === 'undefined') {
                log.error('addAINavigationButton関数が定義されていません');
            }
            
            if (results.dynamicElements.initAIAnalysis === 'undefined' && 
                results.dynamicElements.initAIAnalysisAsync === 'undefined') {
                log.error('AI初期化関数が定義されていません');
            }
        }
        
        // 結果保存
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const outputPath = `./tools/testing/analysis-results/tab_navigation_test_${timestamp}.json`;
        
        // ディレクトリ作成
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        log.success(`結果保存完了: ${outputPath}`);
        
        // DOM クリーンアップ
        dom.window.close();
        
        return results;
        
    } catch (error) {
        log.error(`エラー発生: ${error.message}`);
        console.error(error);
        return null;
    }
}

// CLI実行
if (require.main === module) {
    const args = process.argv.slice(2);
    const htmlPath = args[0] || './index.html';
    
    log.info(`使用方法: node ${path.basename(__filename)} [HTMLファイルパス]`);
    log.info(`対象ファイル: ${htmlPath}\n`);
    
    testTabNavigation(htmlPath).then(results => {
        if (!results) {
            process.exit(1);
        }
        
        // AIボタンが見つからなければ終了コード1
        const aiButtonFound = results.dynamicElements.foundElements && 
                            results.dynamicElements.foundElements.includes('ai-button');
        process.exit(aiButtonFound ? 0 : 1);
    });
}

module.exports = { testTabNavigation };