// 統合コード分析ツール - メトリクス系4ツールの機能統合版
// 元ファイル: code-metrics-analyzer.js + universal-app-auditor.js + function-analysis-generator.js + version-comparator.js

const fs = require('fs');
const path = require('path');

class UnifiedCodeAnalyzer {
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
    
    // メイン分析実行（統合版）
    async analyzeProject() {
        console.log('🔍 統合コード分析開始...');
        
        const metrics = {
            timestamp: new Date().toISOString(),
            tabs: await this.analyzeTabsFolder(),
            shared: await this.analyzeSharedFolder(),
            core: await this.analyzeCoreFolder(),
            other: await this.analyzeOtherFiles(),
            development: await this.analyzeDevelopmentTools(), // 追加: ツール分析
            duplicates: await this.findDuplicates(), // 追加: 重複検出
            functions: await this.analyzeFunctions(), // 追加: 関数分析
            versions: await this.compareVersions() // 追加: バージョン比較
        };
        
        // レポート生成・保存
        const textReport = this.generateReport(metrics);
        const htmlReport = this.generateHTMLReport(metrics);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const textPath = path.join(this.outputDir, `unified-analysis-${timestamp}.txt`);
        const jsonPath = path.join(this.outputDir, `unified-analysis-${timestamp}.json`);
        const htmlPath = path.join(this.outputDir, `unified-analysis-${timestamp}.html`);
        
        fs.writeFileSync(textPath, textReport);
        fs.writeFileSync(jsonPath, JSON.stringify(metrics, null, 2));
        fs.writeFileSync(htmlPath, htmlReport);
        
        console.log(`📊 テキストレポート: ${textPath}`);
        console.log(`📊 データ保存: ${jsonPath}`);
        console.log(`📊 HTMLレポート: ${htmlPath}`);
        console.log('✅ 統合コード分析完了');
        
        return metrics;
    }
    
    // タブフォルダ分析
    async analyzeTabsFolder() {
        const tabsPath = path.join(this.projectRoot, 'tabs');
        if (!fs.existsSync(tabsPath)) return {};
        
        const tabs = {};
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
        if (!fs.existsSync(sharedPath)) return {};
        
        const shared = {};
        const sharedDirs = fs.readdirSync(sharedPath);
        
        for (const dir of sharedDirs) {
            const dirPath = path.join(sharedPath, dir);
            if (fs.statSync(dirPath).isDirectory()) {
                shared[dir] = await this.analyzeDirectory(dirPath);
            } else if (fs.statSync(dirPath).isFile()) {
                if (!shared['root']) shared['root'] = { total: 0, files: {}, fileCount: 0 };
                const lineCount = this.countLines(dirPath);
                shared['root'].files[dir] = lineCount;
                shared['root'].total += lineCount;
                shared['root'].fileCount += 1;
            }
        }
        
        return shared;
    }
    
    // Coreフォルダ分析
    async analyzeCoreFolder() {
        const corePath = path.join(this.projectRoot, 'core');
        if (!fs.existsSync(corePath)) return { total: 0, files: {}, fileCount: 0 };
        return await this.analyzeDirectory(corePath);
    }
    
    // developmentツール分析（新機能）
    async analyzeDevelopmentTools() {
        const devPath = path.join(this.projectRoot, 'development', 'tools');
        if (!fs.existsSync(devPath)) return { total: 0, files: {}, subdirs: {}, fileCount: 0 };
        return await this.analyzeDirectory(devPath);
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
    
    // 重複検出（universal-app-auditor.js機能統合）
    async findDuplicates() {
        console.log('🔍 重複コード検出中...');
        const duplicates = [];
        
        // 簡易重複検出（関数名重複チェック）
        const functionNames = new Map();
        const jsFiles = await this.getAllJSFiles();
        
        for (const filePath of jsFiles) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const functions = this.extractFunctionNames(content);
                
                functions.forEach(funcName => {
                    if (functionNames.has(funcName)) {
                        functionNames.get(funcName).push(filePath);
                    } else {
                        functionNames.set(funcName, [filePath]);
                    }
                });
            } catch (error) {
                // ファイル読み込みエラーは無視
            }
        }
        
        // 重複している関数名を特定
        functionNames.forEach((files, funcName) => {
            if (files.length > 1) {
                duplicates.push({
                    type: 'function',
                    name: funcName,
                    files: files,
                    count: files.length
                });
            }
        });
        
        return duplicates;
    }
    
    // 関数分析（function-analysis-generator.js機能統合）
    async analyzeFunctions() {
        console.log('🔍 関数分析中...');
        const analysis = {
            totalFunctions: 0,
            avgLinesPerFunction: 0,
            longFunctions: [],
            complexFunctions: []
        };
        
        const jsFiles = await this.getAllJSFiles();
        let totalLines = 0;
        
        for (const filePath of jsFiles) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const functions = this.extractFunctionDetails(content);
                
                functions.forEach(func => {
                    analysis.totalFunctions++;
                    totalLines += func.lines;
                    
                    if (func.lines > 50) {
                        analysis.longFunctions.push({
                            name: func.name,
                            file: path.relative(this.projectRoot, filePath),
                            lines: func.lines
                        });
                    }
                });
            } catch (error) {
                // ファイル読み込みエラーは無視
            }
        }
        
        analysis.avgLinesPerFunction = analysis.totalFunctions > 0 ? 
            Math.round(totalLines / analysis.totalFunctions) : 0;
        
        return analysis;
    }
    
    // バージョン比較（version-comparator.js機能統合）
    async compareVersions() {
        console.log('🔍 バージョン情報確認中...');
        
        const versions = {};
        
        // package.jsonバージョン
        const packagePath = path.join(this.projectRoot, 'package.json');
        if (fs.existsSync(packagePath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                versions.package = pkg.version || 'unknown';
            } catch (error) {
                versions.package = 'error';
            }
        }
        
        // index.htmlバージョン
        const indexPath = path.join(this.projectRoot, 'index.html');
        if (fs.existsSync(indexPath)) {
            try {
                const content = fs.readFileSync(indexPath, 'utf8');
                const match = content.match(/<title>.*v(\d+\.\d+.*?)</i);
                versions.html = match ? match[1] : 'not found';
            } catch (error) {
                versions.html = 'error';
            }
        }
        
        return versions;
    }
    
    // ユーティリティ：全JSファイル取得
    async getAllJSFiles() {
        const files = [];
        
        const walkDir = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            fs.readdirSync(dir).forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isFile() && path.extname(item) === '.js') {
                    files.push(fullPath);
                } else if (stat.isDirectory()) {
                    walkDir(fullPath);
                }
            });
        };
        
        walkDir(this.projectRoot);
        return files;
    }
    
    // 関数名抽出
    extractFunctionNames(content) {
        const functions = [];
        const patterns = [
            /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
            /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function/g,
            /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*function/g,
            /static\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                functions.push(match[1]);
            }
        });
        
        return functions;
    }
    
    // 関数詳細抽出
    extractFunctionDetails(content) {
        const functions = [];
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            const match = line.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
            if (match) {
                // 簡易行数カウント（実装簡略化）
                let funcLines = 1;
                let braceCount = 0;
                let started = false;
                
                for (let i = index; i < lines.length; i++) {
                    const currentLine = lines[i];
                    if (currentLine.includes('{')) {
                        braceCount++;
                        started = true;
                    }
                    if (currentLine.includes('}')) braceCount--;
                    
                    if (started) funcLines++;
                    if (started && braceCount === 0) break;
                }
                
                functions.push({
                    name: match[1],
                    lines: funcLines,
                    startLine: index + 1
                });
            }
        });
        
        return functions;
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
    
    // レポート生成（改良版）
    generateReport(metrics) {
        const timestamp = new Date().toLocaleString('ja-JP');
        
        let report = `=== 体重管理アプリ 統合コード分析レポート ===\n`;
        report += `分析日時: ${timestamp}\n\n`;
        
        // タブ別サマリー
        report += `【タブ別詳細】\n`;
        let totalTabLines = 0;
        let totalTabFiles = 0;
        
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
            totalTabFiles += tabData.fileCount;
            
            report += `├─ ${tabName}: HTML(${htmlLines}) + CSS(${cssLines}) + JS(${jsLines}) = ${tabData.total}行 (${tabData.fileCount}ファイル)\n`;
        });
        
        report += `└─ タブ合計: ${totalTabLines}行 (${totalTabFiles}ファイル)\n\n`;
        
        // 共通機能サマリー
        report += `【共通機能詳細】\n`;
        let totalSharedLines = 0;
        let totalSharedFiles = 0;
        
        Object.entries(metrics.shared).forEach(([sharedDir, sharedData]) => {
            totalSharedLines += sharedData.total;
            totalSharedFiles += sharedData.fileCount;
            report += `├─ shared/${sharedDir}: ${sharedData.total}行 (${sharedData.fileCount}ファイル)\n`;
        });
        
        report += `└─ 共通合計: ${totalSharedLines}行 (${totalSharedFiles}ファイル)\n\n`;
        
        // 開発ツール分析（新機能）
        if (metrics.development && metrics.development.total > 0) {
            report += `【開発ツール詳細】\n`;
            report += `└─ development/tools: ${metrics.development.total}行 (${metrics.development.fileCount}ファイル)\n\n`;
        }
        
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
        const totalFiles = totalTabFiles + totalSharedFiles + metrics.core.fileCount + Object.keys(metrics.other).length;
        
        report += `【総合統計】\n`;
        report += `├─ タブ機能: ${totalTabLines}行 (${((totalTabLines/grandTotal)*100).toFixed(1)}%)\n`;
        report += `├─ 共通機能: ${totalSharedLines}行 (${((totalSharedLines/grandTotal)*100).toFixed(1)}%)\n`;
        report += `├─ Core機能: ${metrics.core.total}行 (${((metrics.core.total/grandTotal)*100).toFixed(1)}%)\n`;
        report += `├─ その他: ${totalOtherLines}行 (${((totalOtherLines/grandTotal)*100).toFixed(1)}%)\n`;
        report += `└─ 総計: ${grandTotal}行 (${totalFiles}ファイル)\n\n`;
        
        // 効率化指標
        const sharedRatio = (totalSharedLines / grandTotal) * 100;
        report += `【効率化指標】\n`;
        report += `共通化率: ${sharedRatio.toFixed(1)}% (目標: >50%)\n`;
        report += `タブ固有率: ${((totalTabLines/grandTotal)*100).toFixed(1)}%\n`;
        
        if (sharedRatio > 50) {
            report += `✅ 共通化良好 - 効率的なコード構成\n`;
        } else {
            report += `⚠️ 共通化要改善 - さらなる効率化を推奨\n`;
        }
        
        // 関数分析結果（新機能）
        if (metrics.functions) {
            report += `\n【関数分析】\n`;
            report += `├─ 総関数数: ${metrics.functions.totalFunctions}個\n`;
            report += `├─ 平均行数: ${metrics.functions.avgLinesPerFunction}行/関数\n`;
            report += `└─ 長大関数: ${metrics.functions.longFunctions.length}個 (50行超)\n`;
        }
        
        // 重複検出結果（新機能）
        if (metrics.duplicates && metrics.duplicates.length > 0) {
            report += `\n【重複検出】\n`;
            report += `⚠️ 重複関数: ${metrics.duplicates.length}個\n`;
            metrics.duplicates.slice(0, 5).forEach(dup => {
                report += `├─ ${dup.name}: ${dup.count}箇所で重複\n`;
            });
        }
        
        // バージョン情報（新機能）
        if (metrics.versions) {
            report += `\n【バージョン情報】\n`;
            report += `├─ package.json: v${metrics.versions.package}\n`;
            report += `└─ index.html: v${metrics.versions.html}\n`;
        }
        
        return report;
    }
    
    // HTMLレポート生成（簡易版）
    generateHTMLReport(metrics) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>統合コード分析レポート</title>
    <style>body { font-family: Arial, sans-serif; margin: 20px; }</style>
</head>
<body>
    <h1>統合コード分析レポート</h1>
    <pre>${this.generateReport(metrics)}</pre>
</body>
</html>`;
    }
}

// メイン実行
if (require.main === module) {
    const projectRoot = process.cwd();
    const analyzer = new UnifiedCodeAnalyzer(projectRoot);
    analyzer.analyzeProject().catch(console.error);
}

module.exports = UnifiedCodeAnalyzer;