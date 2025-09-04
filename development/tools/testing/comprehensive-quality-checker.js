#!/usr/bin/env node

/**
 * 🔍 包括的品質チェックツール
 * 今回発生した問題を予防する統合チェックシステム
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');

class ComprehensiveQualityChecker {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.results = {
            syntax: [],
            dependencies: [],
            browser: [],
            dataflow: []
        };
    }

    // 🔍 1. 構文エラー検出
    async checkSyntax() {
        console.log(chalk.blue('🔍 構文エラーチェック開始...'));
        
        const jsFiles = this.findJavaScriptFiles();
        let syntaxErrors = 0;

        for (const file of jsFiles) {
            try {
                // Node.js構文チェック
                execSync(`node -c "${file}"`, { stdio: 'pipe' });
                
                // テンプレートリテラル問題の検出
                const content = fs.readFileSync(file, 'utf8');
                const invalidTemplates = content.match(/\\`.*\\$\\{.*\\}.*\\`/g);
                
                if (invalidTemplates) {
                    syntaxErrors++;
                    this.results.syntax.push({
                        file,
                        type: 'template-literal-escape',
                        issues: invalidTemplates,
                        severity: 'error'
                    });
                    console.log(chalk.red(`❌ ${path.relative(this.projectRoot, file)}: テンプレートリテラルエスケープ問題`));
                } else {
                    console.log(chalk.green(`✅ ${path.relative(this.projectRoot, file)}: 構文OK`));
                }
                
            } catch (error) {
                syntaxErrors++;
                this.results.syntax.push({
                    file,
                    type: 'syntax-error',
                    error: error.message,
                    severity: 'error'
                });
                console.log(chalk.red(`❌ ${path.relative(this.projectRoot, file)}: ${error.message}`));
            }
        }

        console.log(syntaxErrors === 0 ? 
            chalk.green(`✅ 構文チェック完了: ${jsFiles.length}ファイル、エラー0件`) :
            chalk.red(`❌ 構文チェック完了: ${jsFiles.length}ファイル、エラー${syntaxErrors}件`)
        );
    }

    // 🔗 2. 関数依存性チェック
    async checkFunctionDependencies() {
        console.log(chalk.blue('🔗 関数依存性チェック開始...'));
        
        const jsFiles = this.findJavaScriptFiles();
        const functionMap = new Map(); // 定義された関数
        const callMap = new Map();     // 呼び出される関数
        
        // 関数定義と呼び出しを収集
        for (const file of jsFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // 関数定義を検出
                const definitions = [
                    ...content.matchAll(/(?:window\.|global\.)?(\w+)\s*=\s*(?:async\s+)?(?:function|\(.*?\)\s*=>)/g),
                    ...content.matchAll(/function\s+(\w+)\s*\(/g),
                    ...content.matchAll(/window\.(\w+)\s*=\s*\(/g)
                ];
                
                definitions.forEach(match => {
                    const funcName = match[1];
                    if (!functionMap.has(funcName)) {
                        functionMap.set(funcName, []);
                    }
                    functionMap.get(funcName).push(file);
                });
                
                // 関数呼び出しを検出
                const calls = content.matchAll(/(\w+)\s*\(/g);
                for (const match of calls) {
                    const funcName = match[1];
                    if (!callMap.has(funcName)) {
                        callMap.set(funcName, []);
                    }
                    callMap.get(funcName).push(file);
                }
                
            } catch (error) {
                console.log(chalk.yellow(`⚠️ ${file}: 読み込みエラー - ${error.message}`));
            }
        }
        
        // 依存性問題の検出
        let dependencyIssues = 0;
        
        for (const [funcName, callingSites] of callMap) {
            if (!functionMap.has(funcName) && this.isCustomFunction(funcName)) {
                dependencyIssues++;
                this.results.dependencies.push({
                    function: funcName,
                    issue: 'undefined',
                    callingSites,
                    severity: 'error'
                });
                console.log(chalk.red(`❌ 未定義関数: ${funcName} (呼び出し箇所: ${callingSites.length}件)`));
            }
        }
        
        console.log(dependencyIssues === 0 ? 
            chalk.green(`✅ 関数依存性チェック完了: 問題なし`) :
            chalk.red(`❌ 関数依存性チェック完了: ${dependencyIssues}件の問題`)
        );
    }

    // 🌐 3. 実機ブラウザ確認（簡易版）
    async checkBrowserCompatibility() {
        console.log(chalk.blue('🌐 ブラウザ互換性チェック開始...'));
        
        try {
            // HTTPサーバー起動チェック
            const indexPath = path.join(this.projectRoot, 'index.html');
            if (!fs.existsSync(indexPath)) {
                console.log(chalk.red('❌ index.html が見つかりません'));
                return;
            }

            // 基本的なHTML解析
            const htmlContent = fs.readFileSync(indexPath, 'utf8');
            
            // スクリプトタグの読み込み順序確認
            const scriptTags = [...htmlContent.matchAll(/<script.*?src=["']([^"']+)["']/g)];
            const scriptOrder = scriptTags.map(match => match[1]);
            
            console.log(chalk.cyan('📋 スクリプト読み込み順序:'));
            scriptOrder.forEach((script, index) => {
                console.log(`  ${index + 1}. ${script}`);
            });
            
            // 重要な関数の定義順序確認
            const criticalFunctions = ['initWeightTab', 'loadAndDisplayWeightData', 'selectTiming'];
            const functionDefinitionOrder = [];
            
            for (const script of scriptOrder) {
                const scriptPath = path.join(this.projectRoot, script);
                if (fs.existsSync(scriptPath)) {
                    const content = fs.readFileSync(scriptPath, 'utf8');
                    criticalFunctions.forEach(func => {
                        if (content.includes(`${func} =`) || content.includes(`function ${func}`)) {
                            functionDefinitionOrder.push({ function: func, file: script });
                        }
                    });
                }
            }
            
            console.log(chalk.cyan('🔍 重要関数の定義順序:'));
            functionDefinitionOrder.forEach(item => {
                console.log(`  ✅ ${item.function} → ${item.file}`);
            });
            
        } catch (error) {
            console.log(chalk.red(`❌ ブラウザ互換性チェックエラー: ${error.message}`));
        }
    }

    // 📊 4. データフローチェック
    async checkDataFlow() {
        console.log(chalk.blue('📊 データフローチェック開始...'));
        
        const authFiles = this.findFiles('auth');
        const dataFiles = this.findFiles(['data', 'firebase', 'weight']);
        
        let dataFlowIssues = 0;
        
        // 認証→データ読み込みフローの確認
        for (const authFile of authFiles) {
            try {
                const content = fs.readFileSync(authFile, 'utf8');
                
                if (content.includes('onAuthStateChanged')) {
                    if (!content.includes('loadAndDisplayWeightData') && 
                        !content.includes('loadWeightData')) {
                        dataFlowIssues++;
                        this.results.dataflow.push({
                            file: authFile,
                            issue: 'missing-data-load-after-auth',
                            severity: 'warning'
                        });
                        console.log(chalk.yellow(`⚠️ ${path.relative(this.projectRoot, authFile)}: 認証後のデータ読み込み処理なし`));
                    } else {
                        console.log(chalk.green(`✅ ${path.relative(this.projectRoot, authFile)}: 認証フローOK`));
                    }
                }
            } catch (error) {
                console.log(chalk.yellow(`⚠️ ${authFile}: 読み込みエラー`));
            }
        }
        
        console.log(dataFlowIssues === 0 ? 
            chalk.green(`✅ データフローチェック完了: 問題なし`) :
            chalk.yellow(`⚠️ データフローチェック完了: ${dataFlowIssues}件の警告`)
        );
    }

    // 📊 5. 総合レポート生成
    generateReport() {
        console.log(chalk.blue('\n📊 総合品質レポート'));
        console.log('='.repeat(50));
        
        const totalIssues = 
            this.results.syntax.filter(r => r.severity === 'error').length +
            this.results.dependencies.filter(r => r.severity === 'error').length +
            this.results.browser.filter(r => r.severity === 'error').length +
            this.results.dataflow.filter(r => r.severity === 'error').length;
            
        const totalWarnings = 
            this.results.syntax.filter(r => r.severity === 'warning').length +
            this.results.dependencies.filter(r => r.severity === 'warning').length +
            this.results.browser.filter(r => r.severity === 'warning').length +
            this.results.dataflow.filter(r => r.severity === 'warning').length;

        if (totalIssues === 0) {
            console.log(chalk.green('🎉 品質チェック完了: エラーなし'));
        } else {
            console.log(chalk.red(`❌ 品質チェック完了: ${totalIssues}件のエラー`));
        }
        
        if (totalWarnings > 0) {
            console.log(chalk.yellow(`⚠️ 警告: ${totalWarnings}件`));
        }

        // 詳細レポートをJSONで保存
        const reportPath = path.join(this.projectRoot, 'quality-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(chalk.cyan(`📝 詳細レポート: ${reportPath}`));

        return totalIssues === 0;
    }

    // ユーティリティ関数
    findJavaScriptFiles() {
        const jsFiles = [];
        const searchDirs = ['tabs', 'shared', 'core'];
        
        for (const dir of searchDirs) {
            const fullPath = path.join(this.projectRoot, dir);
            if (fs.existsSync(fullPath)) {
                this.walkDir(fullPath, file => {
                    if (file.endsWith('.js')) {
                        jsFiles.push(file);
                    }
                });
            }
        }
        
        return jsFiles;
    }

    findFiles(patterns) {
        const files = [];
        const jsFiles = this.findJavaScriptFiles();
        
        for (const file of jsFiles) {
            const fileName = path.basename(file, '.js').toLowerCase();
            const filePath = file.toLowerCase();
            
            for (const pattern of Array.isArray(patterns) ? patterns : [patterns]) {
                if (fileName.includes(pattern) || filePath.includes(pattern)) {
                    files.push(file);
                    break;
                }
            }
        }
        
        return files;
    }

    walkDir(dir, callback) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                this.walkDir(filePath, callback);
            } else {
                callback(filePath);
            }
        }
    }

    isCustomFunction(funcName) {
        // ブラウザ組み込み関数やライブラリ関数を除外
        const builtInFunctions = [
            'console', 'document', 'window', 'setTimeout', 'setInterval',
            'parseInt', 'parseFloat', 'Date', 'Array', 'Object', 'String',
            'Math', 'JSON', 'Promise', 'fetch', 'alert', 'confirm',
            'addEventListener', 'removeEventListener', 'querySelector',
            'getElementById', 'createElement', 'appendChild', 'log'
        ];
        
        return !builtInFunctions.includes(funcName);
    }

    // メイン実行
    async run() {
        console.log(chalk.cyan('🚀 包括的品質チェック開始'));
        console.log(chalk.cyan(`📁 プロジェクト: ${this.projectRoot}`));
        console.log('='.repeat(50));
        
        await this.checkSyntax();
        await this.checkFunctionDependencies();
        await this.checkBrowserCompatibility();
        await this.checkDataFlow();
        
        return this.generateReport();
    }
}

// CLI実行
if (require.main === module) {
    const projectRoot = process.argv[2] || process.cwd();
    const checker = new ComprehensiveQualityChecker(projectRoot);
    
    checker.run().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error(chalk.red('❌ チェック実行エラー:'), error);
        process.exit(1);
    });
}

module.exports = ComprehensiveQualityChecker;