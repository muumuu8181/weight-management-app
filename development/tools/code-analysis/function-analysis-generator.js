// 機能解析レポート生成ツール - Node.js実行版
// コマンドライン実行でHTMLファイル解析・レポート自動生成

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

class FunctionAnalysisGenerator {
    constructor(projectRoot = '.') {
        this.projectRoot = projectRoot;
        this.tabsDir = path.join(projectRoot, 'tabs');
        
        // 共通機能リスト
        this.sharedFunctions = new Set([
            'handleGoogleLogin', 'handleLogout', 'showUserInterface', 'showLoginInterface',
            'switchTab', 'loadTabContent', 'generateTabNavigation',
            'saveWeightData', 'editWeightEntry', 'deleteWeightEntry', 'copyLogs', 'copyDebugInfo',
            'savePedometerData', 'loadPedometerData', 'deletePedometerEntry',
            'selectTiming', 'selectClothingTop', 'selectClothingBottom', 'selectExerciseType',
            'markRequiredFields', 'validateRequiredFields', 'clearFieldBadges',
            'loadCustomItems', 'saveCustomItems', 'addTopCustomItem', 'addBottomCustomItem',
            'smartEffects', 'simpleEffects', 'setMode', 'selectTarget', 'executeAdd', 'cancelAdd',
            'TimeTracker', 'formatDuration', 'UniversalTaskManager', 'DataAnalytics', 'DashboardBuilder',
            'FirebaseCRUD', 'log', 'debugFirebaseConnection', 'checkLoginIssues'
        ]);
    }
    
    // メイン実行
    async runAnalysis() {
        console.log('🔍 機能解析レポート生成開始...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        try {
            const analysisResults = [];
            
            // タブ解析
            const tabDirs = await this.getTabDirectories();
            for (const tabDir of tabDirs) {
                console.log(`🧪 ${tabDir} 解析中...`);
                const result = await this.analyzeTab(tabDir);
                analysisResults.push(result);
            }
            
            // 共通ファイル解析
            console.log('🧪 shared 解析中...');
            const sharedResult = await this.analyzeSharedFiles();
            analysisResults.push(sharedResult);
            
            // レポート生成
            const report = this.generateReport(analysisResults);
            
            // ファイル出力
            await this.saveReport(report, timestamp);
            
            // サマリー表示
            this.printSummary(analysisResults);
            
            return analysisResults;
            
        } catch (error) {
            console.error('❌ 機能解析エラー:', error);
            throw error;
        }
    }
    
    // タブディレクトリ取得
    async getTabDirectories() {
        try {
            const entries = await fs.readdir(this.tabsDir);
            return entries.filter(entry => entry.startsWith('tab'));
        } catch (error) {
            console.error('❌ タブディレクトリ読み込みエラー:', error);
            return [];
        }
    }
    
    // 個別タブ解析
    async analyzeTab(tabDir) {
        const tabPath = path.join(this.tabsDir, tabDir);
        const result = {
            name: tabDir,
            htmlFiles: [],
            totalHtmlLines: 0,
            functions: { shared: 0, custom: 0, dynamic: 0, errors: 0 },
            functionDetails: []
        };
        
        try {
            // HTMLファイルを検索
            const files = await fs.readdir(tabPath);
            const htmlFiles = files.filter(file => file.endsWith('.html'));
            
            for (const htmlFile of htmlFiles) {
                const htmlPath = path.join(tabPath, htmlFile);
                const htmlContent = await fs.readFile(htmlPath, 'utf8');
                
                // 行数カウント
                const lines = htmlContent.split('\n').length;
                result.totalHtmlLines += lines;
                result.htmlFiles.push({ file: htmlFile, lines: lines });
                
                // 機能解析
                const functionAnalysis = this.analyzeHtmlFunctions(htmlContent);
                
                // 結果マージ
                result.functions.shared += functionAnalysis.shared;
                result.functions.custom += functionAnalysis.custom;
                result.functions.dynamic += functionAnalysis.dynamic;
                result.functions.errors += functionAnalysis.errors;
                result.functionDetails.push(...functionAnalysis.details);
            }
            
        } catch (error) {
            console.error(`❌ ${tabDir} 解析エラー:`, error);
            result.error = error.message;
        }
        
        return result;
    }
    
    // 共通ファイル解析
    async analyzeSharedFiles() {
        const sharedPath = path.join(this.projectRoot, 'shared');
        const result = {
            name: 'shared',
            htmlFiles: [],
            totalHtmlLines: 0,
            jsFiles: [],
            totalJsLines: 0,
            functions: { shared: 0, custom: 0, dynamic: 0, errors: 0 },
            functionDetails: []
        };
        
        try {
            const sharedSubdirs = ['components', 'utils', 'core', 'effects', 'styles'];
            
            for (const subdir of sharedSubdirs) {
                const subdirPath = path.join(sharedPath, subdir);
                try {
                    const files = await fs.readdir(subdirPath);
                    
                    for (const file of files) {
                        const filePath = path.join(subdirPath, file);
                        const content = await fs.readFile(filePath, 'utf8');
                        const lines = content.split('\n').length;
                        
                        if (file.endsWith('.js')) {
                            result.jsFiles.push({ file: `${subdir}/${file}`, lines: lines });
                            result.totalJsLines += lines;
                        } else if (file.endsWith('.html')) {
                            result.htmlFiles.push({ file: `${subdir}/${file}`, lines: lines });
                            result.totalHtmlLines += lines;
                            
                            // HTML内の機能解析
                            const functionAnalysis = this.analyzeHtmlFunctions(content);
                            result.functions.shared += functionAnalysis.shared;
                            result.functions.custom += functionAnalysis.custom;
                            result.functions.dynamic += functionAnalysis.dynamic;
                            result.functions.errors += functionAnalysis.errors;
                            result.functionDetails.push(...functionAnalysis.details);
                        }
                    }
                } catch (subdirError) {
                    // サブディレクトリが存在しない場合はスキップ
                }
            }
            
        } catch (error) {
            console.error('❌ shared解析エラー:', error);
            result.error = error.message;
        }
        
        return result;
    }
    
    // HTML内の関数解析
    analyzeHtmlFunctions(htmlContent) {
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;
        
        const result = { shared: 0, custom: 0, dynamic: 0, errors: 0, details: [] };
        
        // onclick属性を持つ要素を取得
        const clickableElements = document.querySelectorAll('[onclick]');
        
        clickableElements.forEach(element => {
            const onclickValue = element.getAttribute('onclick');
            if (!onclickValue) return;
            
            const analysis = this.analyzeFunctionType(onclickValue);
            result[analysis.type]++;
            
            result.details.push({
                element: element.tagName.toLowerCase(),
                onclick: onclickValue,
                function: analysis.functionName,
                type: analysis.type,
                reason: analysis.reason
            });
        });
        
        return result;
    }
    
    // 関数種別解析
    analyzeFunctionType(onclickCode) {
        // 関数名を抽出
        const functionMatch = onclickCode.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
        if (!functionMatch) {
            return { type: 'errors', functionName: '不明', reason: '関数名抽出失敗' };
        }
        
        const functionName = functionMatch[1];
        
        // 1. 共通機能チェック
        if (this.isSharedFunction(functionName, onclickCode)) {
            return { type: 'shared', functionName, reason: 'shared/で実装済み' };
        }
        
        // 2. 動的関数パターンチェック  
        if (this.isLikelyDynamicFunction(functionName, onclickCode)) {
            return { type: 'dynamic', functionName, reason: '動的読み込み/名前空間' };
        }
        
        // 3. 独自機能（推定）
        return { type: 'custom', functionName, reason: 'タブ固有実装' };
    }
    
    // 共通機能判定
    isSharedFunction(functionName, onclickCode) {
        // 直接チェック
        if (this.sharedFunctions.has(functionName)) return true;
        
        // パターンチェック
        const sharedPatterns = [
            /window\.smartEffects/,
            /new (TimeTracker|UniversalTaskManager)/,
            /FirebaseCRUD\./,
            /DataAnalytics\./,
            /DashboardBuilder\./
        ];
        
        return sharedPatterns.some(pattern => pattern.test(onclickCode));
    }
    
    // 動的関数判定
    isLikelyDynamicFunction(functionName, onclickCode) {
        const dynamicPatterns = [
            /\w+\./,                    // WeightTab.xxx
            /\('\w+'\)|Entry\('|Data\('/,
            /^(updateChart|navigateChart|getPreviousPeriod)/
        ];
        
        return dynamicPatterns.some(pattern => pattern.test(onclickCode));
    }
    
    // レポート生成
    generateReport(results) {
        let report = '=== 機能解析詳細レポート ===\n';
        report += `生成日時: ${new Date().toLocaleString('ja-JP')}\n\n`;
        
        let totalFunctions = { shared: 0, custom: 0, dynamic: 0, errors: 0 };
        let totalHtmlLines = 0;
        
        results.forEach(tab => {
            report += `📂 ${tab.name}\n`;
            
            if (tab.name === 'shared') {
                report += `  JS行数: ${tab.totalJsLines}行\n`;
                report += `  HTML行数: ${tab.totalHtmlLines}行\n`;
                
                if (tab.jsFiles.length > 0) {
                    report += `  JSファイル: ${tab.jsFiles.length}個\n`;
                    tab.jsFiles.slice(0, 5).forEach(file => {
                        report += `    - ${file.file}: ${file.lines}行\n`;
                    });
                    if (tab.jsFiles.length > 5) {
                        report += `    - (他${tab.jsFiles.length - 5}ファイル)\n`;
                    }
                }
            } else {
                report += `  HTML行数: ${tab.totalHtmlLines}行\n`;
            }
            
            const total = tab.functions.shared + tab.functions.custom + tab.functions.dynamic + tab.functions.errors;
            report += `  関数数: ${total}個\n`;
            
            if (total > 0) {
                const sharedPerc = Math.round((tab.functions.shared / total) * 100);
                const customPerc = Math.round((tab.functions.custom / total) * 100);
                const dynamicPerc = Math.round((tab.functions.dynamic / total) * 100);
                
                report += `  🔗 共通: ${tab.functions.shared}個 (${sharedPerc}%)\n`;
                report += `  ⚙️ 独自: ${tab.functions.custom}個 (${customPerc}%)\n`;
                report += `  ⚠️ 動的: ${tab.functions.dynamic}個 (${dynamicPerc}%)\n`;
                report += `  ❌ エラー: ${tab.functions.errors}個\n`;
            }
            
            report += '\n';
            
            // 集計
            totalFunctions.shared += tab.functions.shared;
            totalFunctions.custom += tab.functions.custom;
            totalFunctions.dynamic += tab.functions.dynamic;
            totalFunctions.errors += tab.functions.errors;
            totalHtmlLines += tab.totalHtmlLines;
        });
        
        // 全体統計
        const grandTotal = totalFunctions.shared + totalFunctions.custom + totalFunctions.dynamic + totalFunctions.errors;
        const sharedRate = grandTotal > 0 ? Math.round((totalFunctions.shared / grandTotal) * 100) : 0;
        const customRate = grandTotal > 0 ? Math.round((totalFunctions.custom / grandTotal) * 100) : 0;
        
        report += '📊 全体統計:\n';
        report += `  総HTML行数: ${totalHtmlLines}行\n`;
        report += `  総機能数: ${grandTotal}個\n`;
        report += `  共通化率: ${sharedRate}%\n`;
        report += `  改善候補: ${customRate}% (独自機能)\n`;
        
        return report;
    }
    
    // レポート保存
    async saveReport(report, timestamp) {
        const reportsDir = path.join(this.projectRoot, 'tools', 'reports');
        
        // ディレクトリ作成
        try {
            await fs.mkdir(reportsDir, { recursive: true });
        } catch (error) {
            // ディレクトリが既に存在する場合は無視
        }
        
        // テキストファイル保存
        const txtPath = path.join(reportsDir, `function-analysis-${timestamp}.txt`);
        await fs.writeFile(txtPath, report, 'utf8');
        
        console.log(`📄 レポート保存: ${txtPath}`);
        return txtPath;
    }
    
    // サマリー表示
    printSummary(results) {
        console.log('\n📊 機能解析サマリー');
        console.log('='.repeat(50));
        
        results.forEach(tab => {
            const total = tab.functions.shared + tab.functions.custom + tab.functions.dynamic + tab.functions.errors;
            const sharedPerc = total > 0 ? Math.round((tab.functions.shared / total) * 100) : 0;
            
            console.log(`${tab.name}: ${tab.totalHtmlLines}行, 関数${total}個, 共通${tab.functions.shared}個(${sharedPerc}%)`);
        });
        
        console.log('='.repeat(50));
    }
}

// 実行
async function main() {
    try {
        const analyzer = new FunctionAnalysisGenerator();
        await analyzer.runAnalysis();
        console.log('✅ 機能解析完了');
    } catch (error) {
        console.error('❌ 実行エラー:', error);
        process.exit(1);
    }
}

// スクリプト直接実行時
if (require.main === module) {
    main();
}