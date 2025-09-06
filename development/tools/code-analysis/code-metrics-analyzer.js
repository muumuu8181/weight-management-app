// コードメトリクス分析ツール - 定期メンテナンス用
// 全ファイルの行数追跡・共通化効率分析

const fs = require('fs');
const path = require('path');

class CodeMetricsAnalyzer {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.outputDir = path.join(projectRoot, 'tools', 'reports');
        this.ensureOutputDir();
    }
    
    // 出力ディレクトリ確保
    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    
    // メイン分析実行
    async analyzeProject() {
        console.log('🔍 コードメトリクス分析開始...');
        
        const metrics = {
            timestamp: new Date().toISOString(),
            tabs: await this.analyzeTabsFolder(),
            shared: await this.analyzeSharedFolder(),
            core: await this.analyzeCoreFolder(),
            other: await this.analyzeOtherFiles()
        };
        
        const report = this.generateReport(metrics);
        await this.saveReport(metrics, report);
        
        console.log('✅ コードメトリクス分析完了');
        return metrics;
    }
    
    // タブフォルダ分析
    async analyzeTabsFolder() {
        const tabsPath = path.join(this.projectRoot, 'tabs');
        const tabs = {};
        
        if (!fs.existsSync(tabsPath)) return tabs;
        
        const tabDirs = fs.readdirSync(tabsPath);
        
        for (const tabDir of tabDirs) {
            const tabPath = path.join(tabsPath, tabDir);
            if (fs.statSync(tabPath).isDirectory()) {
                tabs[tabDir] = await this.analyzeDirectory(tabPath);
            }
        }
        
        return tabs;
    }
    
    // 共通フォルダ分析
    async analyzeSharedFolder() {
        const sharedPath = path.join(this.projectRoot, 'shared');
        const shared = {};
        
        if (!fs.existsSync(sharedPath)) return shared;
        
        const subDirs = fs.readdirSync(sharedPath);
        
        for (const subDir of subDirs) {
            const subPath = path.join(sharedPath, subDir);
            if (fs.statSync(subPath).isDirectory()) {
                shared[subDir] = await this.analyzeDirectory(subPath);
            }
        }
        
        return shared;
    }
    
    // コアフォルダ分析
    async analyzeCoreFolder() {
        const corePath = path.join(this.projectRoot, 'core');
        
        if (!fs.existsSync(corePath)) return { total: 0, files: {} };
        
        return await this.analyzeDirectory(corePath);
    }
    
    // その他ファイル分析
    async analyzeOtherFiles() {
        const others = {};
        const mainFiles = ['index.html', 'package.json', 'README.md'];
        
        for (const file of mainFiles) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                others[file] = this.countLines(filePath);
            }
        }
        
        return others;
    }
    
    // ディレクトリ内分析
    async analyzeDirectory(dirPath) {
        const result = { total: 0, files: {}, subdirs: {}, fileCount: 0 };
        
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();
                if (['.js', '.html', '.css', '.json', '.md'].includes(ext)) {
                    const lineCount = this.countLines(itemPath);
                    result.files[item] = lineCount;
                    result.total += lineCount;
                    result.fileCount += 1;
                }
            } else if (stat.isDirectory()) {
                result.subdirs[item] = await this.analyzeDirectory(itemPath);
                result.total += result.subdirs[item].total;
                result.fileCount += result.subdirs[item].fileCount;
            }
        }
        
        return result;
    }
    
    // ファイル行数カウント
    countLines(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return content.split('\n').length;
        } catch (error) {
            console.warn(`⚠️ ファイル読み込みエラー: ${filePath}`);
            return 0;
        }
    }
    
    // レポート生成
    generateReport(metrics) {
        const timestamp = new Date().toLocaleString('ja-JP');
        
        let report = `=== 体重管理アプリ コードメトリクス ===\n`;
        report += `分析日時: ${timestamp}\n\n`;
        
        // タブ別サマリー
        report += `【タブ別詳細】\n`;
        let totalTabLines = 0;
        
        Object.entries(metrics.tabs).forEach(([tabName, tabData]) => {
            const htmlLines = Object.entries(tabData.files)
                .filter(([file]) => file.endsWith('.html'))
                .reduce((sum, [, lines]) => sum + lines, 0);
            
            const cssLines = Object.entries(tabData.files)
                .filter(([file]) => file.endsWith('.css'))
                .reduce((sum, [, lines]) => sum + lines, 0);
            
            const jsLines = Object.entries(tabData.files)
                .filter(([file]) => file.endsWith('.js'))
                .reduce((sum, [, lines]) => sum + lines, 0);
            
            totalTabLines += tabData.total;
            
            report += `├─ ${tabName}: HTML(${htmlLines}) + CSS(${cssLines}) + JS(${jsLines}) = ${tabData.total}行 (${tabData.fileCount}ファイル)\n`;
        });
        
        report += `└─ タブ合計: ${totalTabLines}行\n\n`;
        
        // 共通機能サマリー
        report += `【共通機能詳細】\n`;
        let totalSharedLines = 0;
        
        Object.entries(metrics.shared).forEach(([sharedDir, sharedData]) => {
            totalSharedLines += sharedData.total;
            report += `├─ shared/${sharedDir}: ${sharedData.total}行 (${sharedData.fileCount}ファイル)\n`;
        });
        
        report += `└─ 共通合計: ${totalSharedLines}行\n\n`;
        
        // その他ファイル
        report += `【その他ファイル】\n`;
        let totalOtherLines = 0;
        
        Object.entries(metrics.other).forEach(([file, lines]) => {
            totalOtherLines += lines;
            report += `├─ ${file}: ${lines}行\n`;
        });
        
        report += `└─ その他合計: ${totalOtherLines}行\n\n`;
        
        // 総合統計
        const grandTotal = totalTabLines + totalSharedLines + totalOtherLines + metrics.core.total;
        
        report += `【総合統計】\n`;
        report += `├─ タブ機能: ${totalTabLines}行 (${((totalTabLines/grandTotal)*100).toFixed(1)}%)\n`;
        report += `├─ 共通機能: ${totalSharedLines}行 (${((totalSharedLines/grandTotal)*100).toFixed(1)}%)\n`;
        report += `├─ Core機能: ${metrics.core.total}行 (${((metrics.core.total/grandTotal)*100).toFixed(1)}%)\n`;
        report += `├─ その他: ${totalOtherLines}行 (${((totalOtherLines/grandTotal)*100).toFixed(1)}%)\n`;
        report += `└─ 総計: ${grandTotal}行\n\n`;
        
        // 効率化指標
        const sharedRatio = (totalSharedLines / grandTotal) * 100;
        report += `【効率化指標】\n`;
        report += `共通化率: ${sharedRatio.toFixed(1)}% (目標: >50%)\n`;
        report += `タブ固有率: ${((totalTabLines/grandTotal)*100).toFixed(1)}%\n`;
        
        if (sharedRatio > 50) {
            report += `✅ 共通化良好 - 効率的なコード構成\n`;
        } else {
            report += `⚠️ 共通化改善余地あり\n`;
        }
        
        return report;
    }
    
    // レポート保存
    async saveReport(metrics, report) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // テキストレポート
        const txtPath = path.join(this.outputDir, `code-metrics-${timestamp}.txt`);
        fs.writeFileSync(txtPath, report, 'utf8');
        
        // JSONデータ（比較用）
        const jsonPath = path.join(this.outputDir, `code-metrics-${timestamp}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2), 'utf8');
        
        console.log(`📊 レポート保存: ${txtPath}`);
        console.log(`📊 データ保存: ${jsonPath}`);
    }
    
    // 最新メトリクス取得（比較用）
    getLatestMetrics() {
        const reports = fs.readdirSync(this.outputDir)
            .filter(file => file.startsWith('code-metrics-') && file.endsWith('.json'))
            .sort()
            .reverse();
        
        if (reports.length === 0) return null;
        
        const latestPath = path.join(this.outputDir, reports[0]);
        return JSON.parse(fs.readFileSync(latestPath, 'utf8'));
    }
}

// メイン実行
async function main() {
    const projectRoot = process.cwd();
    const analyzer = new CodeMetricsAnalyzer(projectRoot);
    
    try {
        const metrics = await analyzer.analyzeProject();
        console.log('\n🎉 分析完了 - tools/reports/ フォルダを確認してください');
    } catch (error) {
        console.error('❌ 分析エラー:', error.message);
        process.exit(1);
    }
}

// CLI実行時
if (require.main === module) {
    main();
}

module.exports = CodeMetricsAnalyzer;