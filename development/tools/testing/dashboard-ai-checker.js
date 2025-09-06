// 🤖 ダッシュボードAI機能チェッカー
// AIボタンの表示と動的要素の検証用テストツール

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// 色付きログ出力
const log = {
    success: (msg) => console.log(`✅ ${msg}`),
    error: (msg) => console.log(`❌ ${msg}`),
    info: (msg) => console.log(`📋 ${msg}`),
    warning: (msg) => console.log(`⚠️  ${msg}`)
};

// ダッシュボードAIチェック関数
async function checkDashboardAI(htmlPath = './index.html') {
    log.info('ダッシュボードAI機能チェック開始');
    
    try {
        // HTMLファイル読み込み
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        const dom = new JSDOM(htmlContent, {
            runScripts: "dangerously",
            resources: "usable",
            url: "http://localhost"
        });
        
        const window = dom.window;
        const document = window.document;
        
        log.success('HTMLファイル読み込み完了');
        
        // チェック結果格納
        const results = {
            timestamp: new Date().toISOString(),
            checks: [],
            aiFeatures: {
                buttonFound: false,
                navigationFound: false,
                dashboardTabFound: false,
                aiScriptsLoaded: false,
                dynamicButtonCheck: false
            }
        };
        
        // 1. AI関連スクリプトの読み込みチェック
        log.info('AI関連スクリプトのチェック');
        const aiScripts = [
            'shared/components/ai-weight-analyzer.js',
            'tabs/tab5-dashboard/ai-dashboard-extension.js'
        ];
        
        aiScripts.forEach(scriptPath => {
            const scriptTag = document.querySelector(`script[src="${scriptPath}"]`);
            if (scriptTag) {
                results.checks.push({
                    type: 'script',
                    path: scriptPath,
                    status: 'found'
                });
                log.success(`スクリプト発見: ${scriptPath}`);
            } else {
                results.checks.push({
                    type: 'script',
                    path: scriptPath,
                    status: 'missing'
                });
                log.error(`スクリプト不明: ${scriptPath}`);
            }
        });
        
        results.aiFeatures.aiScriptsLoaded = results.checks.filter(c => 
            c.type === 'script' && c.status === 'found'
        ).length === aiScripts.length;
        
        // 2. ダッシュボードタブの存在チェック
        log.info('ダッシュボードタブのチェック');
        const dashboardTab = document.querySelector('#tabContent5');
        if (dashboardTab) {
            results.aiFeatures.dashboardTabFound = true;
            log.success('ダッシュボードタブ (tabContent5) 発見');
        } else {
            log.error('ダッシュボードタブ (tabContent5) が見つかりません');
        }
        
        // 3. ナビゲーション要素のチェック（両方のクラス名を確認）
        log.info('ナビゲーション要素のチェック');
        const navSelectors = ['.dashboard-nav', '.dashboard-tab-switcher'];
        let navigationFound = false;
        
        navSelectors.forEach(selector => {
            const nav = document.querySelector(selector);
            if (nav) {
                navigationFound = true;
                results.checks.push({
                    type: 'navigation',
                    selector: selector,
                    status: 'found',
                    childCount: nav.children.length
                });
                log.success(`ナビゲーション要素発見: ${selector} (子要素: ${nav.children.length})`);
            }
        });
        
        results.aiFeatures.navigationFound = navigationFound;
        
        if (!navigationFound) {
            log.error('ダッシュボードナビゲーション要素が見つかりません');
        }
        
        // 4. 初期状態でのAIボタンチェック
        log.info('初期状態でのAIボタンチェック');
        const aiButtonSelectors = [
            'button[data-view="ai"]',
            '.ai-nav-button',
            'button:contains("AI分析")',
            'button:contains("🤖")'
        ];
        
        let aiButtonFound = false;
        aiButtonSelectors.forEach(selector => {
            try {
                // セレクタによってチェック方法を変更
                let button;
                if (selector.includes(':contains')) {
                    // テキスト検索
                    const searchText = selector.match(/:contains\("(.+)"\)/)[1];
                    const buttons = Array.from(document.querySelectorAll('button'));
                    button = buttons.find(b => b.textContent.includes(searchText));
                } else {
                    button = document.querySelector(selector);
                }
                
                if (button) {
                    aiButtonFound = true;
                    results.checks.push({
                        type: 'ai-button',
                        selector: selector,
                        status: 'found',
                        text: button.textContent,
                        visible: button.offsetWidth > 0 && button.offsetHeight > 0
                    });
                    log.success(`AIボタン発見: ${selector} - "${button.textContent}"`);
                }
            } catch (e) {
                // セレクタエラーは無視
            }
        });
        
        results.aiFeatures.buttonFound = aiButtonFound;
        
        // 5. 動的要素待機チェック（シミュレーション）
        log.info('動的要素の待機シミュレーション開始（5秒間）');
        
        // 動的チェック関数
        const checkDynamicElements = () => {
            return new Promise((resolve) => {
                let checkCount = 0;
                const maxChecks = 10; // 0.5秒ごとに10回 = 5秒
                
                const interval = setInterval(() => {
                    checkCount++;
                    
                    // 再度AIボタンをチェック
                    const dynamicButton = document.querySelector('button[data-view="ai"]') ||
                                        Array.from(document.querySelectorAll('button'))
                                            .find(b => b.textContent.includes('AI分析'));
                    
                    if (dynamicButton) {
                        results.aiFeatures.dynamicButtonCheck = true;
                        log.success(`動的AIボタン発見！(${checkCount * 0.5}秒後)`);
                        clearInterval(interval);
                        resolve(true);
                    } else if (checkCount >= maxChecks) {
                        log.warning('動的AIボタンは5秒以内に出現しませんでした');
                        clearInterval(interval);
                        resolve(false);
                    }
                }, 500);
            });
        };
        
        // 動的チェック実行
        await checkDynamicElements();
        
        // 6. 結果サマリー
        log.info('=== チェック結果サマリー ===');
        log.info(`AIスクリプト読み込み: ${results.aiFeatures.aiScriptsLoaded ? '✅' : '❌'}`);
        log.info(`ダッシュボードタブ: ${results.aiFeatures.dashboardTabFound ? '✅' : '❌'}`);
        log.info(`ナビゲーション要素: ${results.aiFeatures.navigationFound ? '✅' : '❌'}`);
        log.info(`AIボタン（初期）: ${results.aiFeatures.buttonFound ? '✅' : '❌'}`);
        log.info(`AIボタン（動的）: ${results.aiFeatures.dynamicButtonCheck ? '✅' : '❌'}`);
        
        // 7. 問題診断
        if (!results.aiFeatures.buttonFound && !results.aiFeatures.dynamicButtonCheck) {
            log.warning('=== 問題診断 ===');
            
            if (!results.aiFeatures.aiScriptsLoaded) {
                log.error('AI関連スクリプトが読み込まれていません');
            }
            
            if (!results.aiFeatures.navigationFound) {
                log.error('ナビゲーション要素が見つかりません - AIボタンを追加する場所がありません');
                log.info('期待されるクラス: .dashboard-nav または .dashboard-tab-switcher');
            }
            
            // addAINavigationButton関数の存在チェック
            if (typeof window.addAINavigationButton === 'function') {
                log.info('addAINavigationButton関数は定義されています');
                log.warning('しかし、正しいタイミングで呼ばれていない可能性があります');
            } else {
                log.error('addAINavigationButton関数が定義されていません');
            }
        }
        
        // 結果保存
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const outputPath = `./tools/testing/analysis-results/dashboard_ai_check_${timestamp}.json`;
        
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
        return null;
    }
}

// CLI実行
if (require.main === module) {
    const args = process.argv.slice(2);
    const htmlPath = args[0] || './index.html';
    
    checkDashboardAI(htmlPath).then(results => {
        if (!results) {
            process.exit(1);
        }
        
        // 問題があれば終了コード1
        const allChecksPass = results.aiFeatures.buttonFound || results.aiFeatures.dynamicButtonCheck;
        process.exit(allChecksPass ? 0 : 1);
    });
}

module.exports = { checkDashboardAI };