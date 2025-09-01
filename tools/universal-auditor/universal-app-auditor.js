#!/usr/bin/env node

/**
 * Universal App Auditor - 汎用アプリ監査ツール
 * 任意のWebアプリケーションに対して包括的な問題点検出を行う
 * 
 * Features:
 * - ゼロ設定での自動実行
 * - プロジェクト構造自動検出
 * - フレームワーク自動判定
 * - 重複・性能・A11y・SEO・セキュリティ検出
 * - 問題分類とインテリジェント提案
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class UniversalAppAuditor {
    constructor(options = {}) {
        this.options = {
            verbose: false,
            outputFormat: 'both', // 'json', 'html', 'both'
            excludePatterns: ['node_modules', '.git', 'dist', 'build'],
            ...options
        };
        
        this.results = {
            projectInfo: {},
            duplicates: [],
            performance: [],
            accessibility: [],
            seo: [],
            security: [],
            maintainability: [],
            summary: {}
        };
        
        this.projectStructure = null;
    }

    async audit(projectPath = '.') {
        console.log('🔍 Universal App Auditor 開始');
        console.log(`📁 対象: ${path.resolve(projectPath)}`);
        
        try {
            // Step 1: プロジェクト構造自動検出
            await this.discoverProject(projectPath);
            
            // Step 2: 包括的問題検出
            await this.runAllChecks(projectPath);
            
            // Step 3: 結果集計・分類
            await this.analyzeResults();
            
            // Step 4: レポート生成
            await this.generateReports();
            
            console.log('\n✅ 監査完了');
            this.printSummary();
            
            return this.results;
            
        } catch (error) {
            console.error(`❌ 監査エラー: ${error.message}`);
            throw error;
        }
    }

    async discoverProject(projectPath) {
        console.log('\n🔍 プロジェクト構造検出中...');
        
        const structure = {
            framework: 'unknown',
            type: 'web',
            entryPoints: [],
            directories: [],
            technologies: new Set(),
            packageInfo: null
        };

        // package.json検出
        const packagePath = path.join(projectPath, 'package.json');
        if (fs.existsSync(packagePath)) {
            try {
                structure.packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                console.log(`📦 package.json発見: ${structure.packageInfo.name}`);
                
                // フレームワーク判定
                const deps = {
                    ...structure.packageInfo.dependencies || {},
                    ...structure.packageInfo.devDependencies || {}
                };
                
                if (deps.react) {
                    structure.framework = 'react';
                    structure.technologies.add('React');
                }
                if (deps.vue) {
                    structure.framework = 'vue';
                    structure.technologies.add('Vue.js');
                }
                if (deps.angular) {
                    structure.framework = 'angular';
                    structure.technologies.add('Angular');
                }
                if (deps.firebase) {
                    structure.technologies.add('Firebase');
                }
                if (deps['chart.js']) {
                    structure.technologies.add('Chart.js');
                }
                
            } catch (error) {
                console.log(`⚠️ package.json解析エラー: ${error.message}`);
            }
        }

        // エントリーポイント検出
        const commonEntries = ['index.html', 'index.js', 'main.js', 'app.js', 'src/index.js'];
        for (const entry of commonEntries) {
            const entryPath = path.join(projectPath, entry);
            if (fs.existsSync(entryPath)) {
                structure.entryPoints.push(entry);
                console.log(`🎯 エントリーポイント発見: ${entry}`);
            }
        }

        // ディレクトリ構造解析
        const dirs = fs.readdirSync(projectPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .filter(dirent => !this.options.excludePatterns.includes(dirent.name))
            .map(dirent => dirent.name);
        
        structure.directories = dirs;
        
        // フレームワーク推定（ディレクトリ構造から）
        if (structure.framework === 'unknown') {
            if (dirs.includes('src') && dirs.includes('public')) {
                structure.framework = 'react-like';
            } else if (dirs.includes('components')) {
                structure.framework = 'component-based';
            } else if (structure.entryPoints.includes('index.html')) {
                structure.framework = 'vanilla';
            }
        }

        this.projectStructure = structure;
        this.results.projectInfo = structure;
        
        console.log(`📊 検出結果:`);
        console.log(`  フレームワーク: ${structure.framework}`);
        console.log(`  技術: ${Array.from(structure.technologies).join(', ') || '不明'}`);
        console.log(`  エントリーポイント: ${structure.entryPoints.join(', ') || 'なし'}`);
    }

    async runAllChecks(projectPath) {
        console.log('\n🔍 包括的問題検出中...');
        
        // 並行実行でパフォーマンス向上
        await Promise.all([
            this.checkDuplicates(projectPath),
            this.checkPerformance(projectPath),
            this.checkAccessibility(projectPath),
            this.checkSEO(projectPath),
            this.checkSecurity(projectPath),
            this.checkMaintainability(projectPath)
        ]);
    }

    async checkDuplicates(projectPath) {
        console.log('  🔄 重複検出中...');
        
        const duplicates = {
            css: [],
            js: [],
            html: [],
            strings: [],
            dependencies: []
        };

        // ファイル走査
        await this.walkDirectory(projectPath, async (filePath, fileName) => {
            if (fileName.endsWith('.html')) {
                const htmlDuplicates = await this.analyzeHTMLDuplicates(filePath);
                duplicates.html.push(...htmlDuplicates);
                duplicates.css.push(...await this.analyzeCSSInHTML(filePath));
            }
            
            if (fileName.endsWith('.js')) {
                const jsDuplicates = await this.analyzeJSDuplicates(filePath);
                duplicates.js.push(...jsDuplicates);
            }
            
            if (fileName.endsWith('.css')) {
                const cssDuplicates = await this.analyzeCSSDuplicates(filePath);
                duplicates.css.push(...cssDuplicates);
            }
        });

        this.results.duplicates = duplicates;
        console.log(`    CSS重複: ${duplicates.css.length}件`);
        console.log(`    JS重複: ${duplicates.js.length}件`);
        console.log(`    HTML重複: ${duplicates.html.length}件`);
    }

    async checkPerformance(projectPath) {
        console.log('  ⚡ 性能問題検出中...');
        
        const issues = [];
        
        // 大きなファイル検出
        await this.walkDirectory(projectPath, async (filePath, fileName) => {
            const stats = fs.statSync(filePath);
            const sizeMB = stats.size / (1024 * 1024);
            
            if (fileName.endsWith('.js') && sizeMB > 1) {
                issues.push({
                    type: 'large-js-file',
                    file: filePath,
                    size: sizeMB.toFixed(2) + 'MB',
                    severity: sizeMB > 5 ? 'high' : 'medium',
                    suggestion: 'コード分割やTree Shakingを検討してください'
                });
            }
            
            if (fileName.endsWith('.css') && sizeMB > 0.5) {
                issues.push({
                    type: 'large-css-file',
                    file: filePath,
                    size: sizeMB.toFixed(2) + 'MB',
                    severity: 'medium',
                    suggestion: 'CSS分割やクリティカルCSSを検討してください'
                });
            }
        });

        // 未使用ライブラリ検出
        if (this.projectStructure.packageInfo) {
            const deps = this.projectStructure.packageInfo.dependencies || {};
            for (const dep of Object.keys(deps)) {
                const isUsed = await this.checkDependencyUsage(projectPath, dep);
                if (!isUsed) {
                    issues.push({
                        type: 'unused-dependency',
                        dependency: dep,
                        severity: 'low',
                        suggestion: `未使用の依存関係 ${dep} を削除してください`
                    });
                }
            }
        }

        this.results.performance = issues;
        console.log(`    性能問題: ${issues.length}件`);
    }

    async checkAccessibility(projectPath) {
        console.log('  ♿ アクセシビリティ検出中...');
        
        const issues = [];
        
        await this.walkDirectory(projectPath, async (filePath, fileName) => {
            if (fileName.endsWith('.html')) {
                const htmlContent = fs.readFileSync(filePath, 'utf8');
                const dom = new JSDOM(htmlContent);
                const document = dom.window.document;
                
                // alt属性なしのimg検出
                const imgsWithoutAlt = document.querySelectorAll('img:not([alt])');
                imgsWithoutAlt.forEach(img => {
                    issues.push({
                        type: 'missing-alt-text',
                        file: filePath,
                        element: img.outerHTML.substring(0, 100),
                        severity: 'high',
                        suggestion: 'img要素にalt属性を追加してください'
                    });
                });
                
                // ラベルなしのinput検出
                const inputsWithoutLabel = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
                inputsWithoutLabel.forEach(input => {
                    const hasLabel = document.querySelector(`label[for="${input.id}"]`);
                    if (!hasLabel && input.type !== 'hidden') {
                        issues.push({
                            type: 'missing-label',
                            file: filePath,
                            element: input.outerHTML.substring(0, 100),
                            severity: 'high',
                            suggestion: 'input要素にラベルまたはaria-label属性を追加してください'
                        });
                    }
                });
                
                // 見出し構造チェック
                const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                if (headings.length > 0) {
                    const levels = headings.map(h => parseInt(h.tagName.substring(1)));
                    let prevLevel = 0;
                    
                    levels.forEach((level, index) => {
                        if (prevLevel > 0 && level - prevLevel > 1) {
                            issues.push({
                                type: 'heading-skip',
                                file: filePath,
                                element: headings[index].outerHTML.substring(0, 100),
                                severity: 'medium',
                                suggestion: `見出しレベルをスキップしています (h${prevLevel} → h${level})`
                            });
                        }
                        prevLevel = level;
                    });
                }
            }
        });

        this.results.accessibility = issues;
        console.log(`    A11y問題: ${issues.length}件`);
    }

    async checkSEO(projectPath) {
        console.log('  🔍 SEO問題検出中...');
        
        const issues = [];
        
        await this.walkDirectory(projectPath, async (filePath, fileName) => {
            if (fileName.endsWith('.html')) {
                const htmlContent = fs.readFileSync(filePath, 'utf8');
                const dom = new JSDOM(htmlContent);
                const document = dom.window.document;
                
                // title要素チェック
                const title = document.querySelector('title');
                if (!title) {
                    issues.push({
                        type: 'missing-title',
                        file: filePath,
                        severity: 'high',
                        suggestion: 'title要素を追加してください'
                    });
                } else if (title.textContent.length < 10 || title.textContent.length > 60) {
                    issues.push({
                        type: 'poor-title-length',
                        file: filePath,
                        title: title.textContent,
                        severity: 'medium',
                        suggestion: 'titleは10-60文字が推奨です'
                    });
                }
                
                // meta description チェック
                const metaDesc = document.querySelector('meta[name="description"]');
                if (!metaDesc) {
                    issues.push({
                        type: 'missing-meta-description',
                        file: filePath,
                        severity: 'medium',
                        suggestion: 'meta descriptionを追加してください'
                    });
                }
                
                // h1要素チェック
                const h1s = document.querySelectorAll('h1');
                if (h1s.length === 0) {
                    issues.push({
                        type: 'missing-h1',
                        file: filePath,
                        severity: 'medium',
                        suggestion: 'h1要素を追加してください'
                    });
                } else if (h1s.length > 1) {
                    issues.push({
                        type: 'multiple-h1',
                        file: filePath,
                        count: h1s.length,
                        severity: 'low',
                        suggestion: 'h1要素は1つに限定することを推奨します'
                    });
                }
            }
        });

        this.results.seo = issues;
        console.log(`    SEO問題: ${issues.length}件`);
    }

    async checkSecurity(projectPath) {
        console.log('  🔒 セキュリティ問題検出中...');
        
        const issues = [];
        
        await this.walkDirectory(projectPath, async (filePath, fileName) => {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // API キー検出
            const apiKeyPatterns = [
                /AIzaSy[0-9A-Za-z_-]{33}/g, // Google API Key
                /sk-[0-9A-Za-z]{48}/g,      // OpenAI API Key
                /xoxb-[0-9]+-.+/g,          // Slack Bot Token
            ];
            
            apiKeyPatterns.forEach(pattern => {
                const matches = content.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        issues.push({
                            type: 'exposed-api-key',
                            file: filePath,
                            pattern: match.substring(0, 10) + '...',
                            severity: 'critical',
                            suggestion: 'APIキーを環境変数に移動してください'
                        });
                    });
                }
            });
            
            // HTMLでのセキュリティ問題
            if (fileName.endsWith('.html')) {
                const dom = new JSDOM(content);
                const document = dom.window.document;
                
                // インラインスクリプト検出
                const inlineScripts = document.querySelectorAll('script:not([src])');
                if (inlineScripts.length > 5) {
                    issues.push({
                        type: 'excessive-inline-scripts',
                        file: filePath,
                        count: inlineScripts.length,
                        severity: 'medium',
                        suggestion: 'インラインスクリプトを外部ファイルに分離してください'
                    });
                }
                
                // Content Security Policy チェック
                const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                if (!cspMeta) {
                    issues.push({
                        type: 'missing-csp',
                        file: filePath,
                        severity: 'medium',
                        suggestion: 'Content Security Policyを設定してください'
                    });
                }
            }
        });

        this.results.security = issues;
        console.log(`    セキュリティ問題: ${issues.length}件`);
    }

    async checkMaintainability(projectPath) {
        console.log('  🔧 保守性問題検出中...');
        
        const issues = [];
        
        // ファイル数・行数統計
        let totalFiles = 0;
        let totalLines = 0;
        let longFunctions = 0;
        
        await this.walkDirectory(projectPath, async (filePath, fileName) => {
            totalFiles++;
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            totalLines += lines.length;
            
            // 巨大ファイル検出
            if (lines.length > 1000) {
                issues.push({
                    type: 'large-file',
                    file: filePath,
                    lines: lines.length,
                    severity: lines.length > 2000 ? 'high' : 'medium',
                    suggestion: 'ファイルを分割することを検討してください'
                });
            }
            
            // JavaScriptの関数解析
            if (fileName.endsWith('.js')) {
                const functions = content.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g) || [];
                functions.forEach(func => {
                    const funcLines = func.split('\n').length;
                    if (funcLines > 50) {
                        longFunctions++;
                        issues.push({
                            type: 'long-function',
                            file: filePath,
                            function: func.match(/function\s+(\w+)/)?.[1] || 'anonymous',
                            lines: funcLines,
                            severity: funcLines > 100 ? 'high' : 'medium',
                            suggestion: '関数を小さな単位に分割してください'
                        });
                    }
                });
            }
            
            // TODO/FIXMEコメント検出
            const todoMatches = content.match(/(TODO|FIXME|HACK|XXX).*$/gm) || [];
            if (todoMatches.length > 0) {
                issues.push({
                    type: 'todo-comments',
                    file: filePath,
                    count: todoMatches.length,
                    items: todoMatches.slice(0, 5), // 最初の5件のみ表示
                    severity: 'low',
                    suggestion: 'TODOコメントを解決してください'
                });
            }
        });

        // プロジェクト規模統計
        issues.unshift({
            type: 'project-statistics',
            totalFiles,
            totalLines,
            longFunctions,
            severity: 'info',
            suggestion: `プロジェクト規模: ${totalFiles}ファイル, ${totalLines.toLocaleString()}行`
        });

        this.results.maintainability = issues;
        console.log(`    保守性問題: ${issues.length}件`);
    }

    async analyzeResults() {
        console.log('\n📊 結果分析中...');
        
        const summary = {
            totalIssues: 0,
            criticalIssues: 0,
            highIssues: 0,
            mediumIssues: 0,
            lowIssues: 0,
            categories: {}
        };
        
        // カテゴリごとに問題を集計
        Object.entries(this.results).forEach(([category, issues]) => {
            if (Array.isArray(issues)) {
                summary.categories[category] = issues.length;
                summary.totalIssues += issues.length;
                
                issues.forEach(issue => {
                    switch (issue.severity) {
                        case 'critical':
                            summary.criticalIssues++;
                            break;
                        case 'high':
                            summary.highIssues++;
                            break;
                        case 'medium':
                            summary.mediumIssues++;
                            break;
                        case 'low':
                            summary.lowIssues++;
                            break;
                    }
                });
            } else if (typeof issues === 'object' && issues !== null) {
                // duplicatesのような入れ子構造
                let categoryTotal = 0;
                Object.values(issues).forEach(subIssues => {
                    if (Array.isArray(subIssues)) {
                        categoryTotal += subIssues.length;
                    }
                });
                summary.categories[category] = categoryTotal;
                summary.totalIssues += categoryTotal;
            }
        });
        
        this.results.summary = summary;
    }

    async generateReports() {
        console.log('\n📋 レポート生成中...');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        if (this.options.outputFormat === 'json' || this.options.outputFormat === 'both') {
            const jsonPath = `audit-report-${timestamp}.json`;
            fs.writeFileSync(jsonPath, JSON.stringify(this.results, null, 2));
            console.log(`📄 JSONレポート: ${jsonPath}`);
        }
        
        if (this.options.outputFormat === 'html' || this.options.outputFormat === 'both') {
            const htmlPath = `audit-report-${timestamp}.html`;
            const htmlContent = this.generateHTMLReport();
            fs.writeFileSync(htmlPath, htmlContent);
            console.log(`🌐 HTMLレポート: ${htmlPath}`);
        }
    }

    generateHTMLReport() {
        const { summary } = this.results;
        
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal App Auditor Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .critical { border-left: 5px solid #dc3545; }
        .high { border-left: 5px solid #fd7e14; }
        .medium { border-left: 5px solid #ffc107; }
        .low { border-left: 5px solid #28a745; }
        .category { margin-bottom: 30px; }
        .category h3 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .issue { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; }
        .issue-title { font-weight: bold; }
        .issue-suggestion { color: #666; font-style: italic; margin-top: 5px; }
        .severity-critical { border-left-color: #dc3545; }
        .severity-high { border-left-color: #fd7e14; }
        .severity-medium { border-left-color: #ffc107; }
        .severity-low { border-left-color: #28a745; }
        .project-info { background: #e7f3ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .tech-badges { margin-top: 10px; }
        .tech-badge { background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; margin: 2px; display: inline-block; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Universal App Auditor Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="project-info">
            <h2>📋 プロジェクト情報</h2>
            <p><strong>フレームワーク:</strong> ${this.results.projectInfo.framework}</p>
            <p><strong>エントリーポイント:</strong> ${this.results.projectInfo.entryPoints.join(', ') || 'なし'}</p>
            <div class="tech-badges">
                ${Array.from(this.results.projectInfo.technologies || []).map(tech => 
                    `<span class="tech-badge">${tech}</span>`
                ).join('')}
            </div>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>総問題数</h3>
                <div style="font-size: 2em; font-weight: bold;">${summary.totalIssues}</div>
            </div>
            <div class="summary-card critical">
                <h3>Critical</h3>
                <div style="font-size: 2em; font-weight: bold;">${summary.criticalIssues}</div>
            </div>
            <div class="summary-card high">
                <h3>High</h3>
                <div style="font-size: 2em; font-weight: bold;">${summary.highIssues}</div>
            </div>
            <div class="summary-card medium">
                <h3>Medium</h3>
                <div style="font-size: 2em; font-weight: bold;">${summary.mediumIssues}</div>
            </div>
            <div class="summary-card low">
                <h3>Low</h3>
                <div style="font-size: 2em; font-weight: bold;">${summary.lowIssues}</div>
            </div>
        </div>
        
        ${this.generateCategoryReports()}
    </div>
</body>
</html>`;
    }

    generateCategoryReports() {
        let html = '';
        
        const categoryNames = {
            duplicates: '🔄 重複問題',
            performance: '⚡ 性能問題',
            accessibility: '♿ アクセシビリティ問題',
            seo: '🔍 SEO問題',
            security: '🔒 セキュリティ問題',
            maintainability: '🔧 保守性問題'
        };
        
        Object.entries(categoryNames).forEach(([category, title]) => {
            const issues = this.results[category];
            if (!issues) return;
            
            html += `<div class="category">`;
            html += `<h3>${title}</h3>`;
            
            if (Array.isArray(issues)) {
                issues.forEach(issue => {
                    html += `<div class="issue severity-${issue.severity}">`;
                    html += `<div class="issue-title">${issue.type}: ${issue.file || issue.dependency || ''}</div>`;
                    if (issue.suggestion) {
                        html += `<div class="issue-suggestion">💡 ${issue.suggestion}</div>`;
                    }
                    html += `</div>`;
                });
            } else if (typeof issues === 'object') {
                // duplicatesの場合
                Object.entries(issues).forEach(([subCategory, subIssues]) => {
                    if (Array.isArray(subIssues) && subIssues.length > 0) {
                        html += `<h4>${subCategory.toUpperCase()}重複 (${subIssues.length}件)</h4>`;
                        subIssues.slice(0, 10).forEach(issue => { // 最初の10件のみ表示
                            html += `<div class="issue">`;
                            html += `<div class="issue-title">${issue.name || issue.file}</div>`;
                            html += `</div>`;
                        });
                    }
                });
            }
            
            html += `</div>`;
        });
        
        return html;
    }

    printSummary() {
        const { summary } = this.results;
        
        console.log('\n📊 監査結果サマリー:');
        console.log('─'.repeat(50));
        console.log(`🎯 総問題数: ${summary.totalIssues}`);
        console.log(`🚨 Critical: ${summary.criticalIssues}`);
        console.log(`⚠️  High: ${summary.highIssues}`);
        console.log(`💛 Medium: ${summary.mediumIssues}`);
        console.log(`💚 Low: ${summary.lowIssues}`);
        console.log('─'.repeat(50));
        
        console.log('\nカテゴリ別:');
        Object.entries(summary.categories).forEach(([category, count]) => {
            if (count > 0) {
                console.log(`  ${category}: ${count}件`);
            }
        });
        
        // スコア計算
        const maxScore = 100;
        const penalties = {
            critical: 10,
            high: 5,
            medium: 2,
            low: 1
        };
        
        const totalPenalty = 
            summary.criticalIssues * penalties.critical +
            summary.highIssues * penalties.high +
            summary.mediumIssues * penalties.medium +
            summary.lowIssues * penalties.low;
            
        const score = Math.max(0, maxScore - totalPenalty);
        
        console.log('\n🏆 品質スコア:');
        console.log(`   ${score}/${maxScore}点`);
        
        if (score >= 90) {
            console.log('   🎉 優秀！問題はほとんどありません');
        } else if (score >= 70) {
            console.log('   ✅ 良好。いくつかの改善点があります');
        } else if (score >= 50) {
            console.log('   ⚠️  要改善。重要な問題があります');
        } else {
            console.log('   🚨 緊急改善が必要です');
        }
    }

    // ユーティリティメソッド
    async walkDirectory(dirPath, callback) {
        const walk = async (currentPath) => {
            const items = fs.readdirSync(currentPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(currentPath, item.name);
                
                if (item.isDirectory()) {
                    if (!this.options.excludePatterns.includes(item.name)) {
                        await walk(fullPath);
                    }
                } else {
                    await callback(fullPath, item.name);
                }
            }
        };
        
        await walk(dirPath);
    }

    async analyzeHTMLDuplicates(filePath) {
        // 実装予定
        return [];
    }

    async analyzeCSSInHTML(filePath) {
        // 実装予定  
        return [];
    }

    async analyzeJSDuplicates(filePath) {
        // 実装予定
        return [];
    }

    async analyzeCSSDuplicates(filePath) {
        // 実装予定
        return [];
    }

    async checkDependencyUsage(projectPath, dependency) {
        // 実装予定: 文字列検索でインポートされているかチェック
        return true;
    }
}

// CLI実行
if (require.main === module) {
    const auditor = new UniversalAppAuditor({
        verbose: process.argv.includes('--verbose'),
        outputFormat: 'both'
    });
    
    const targetPath = process.argv[2] || '.';
    auditor.audit(targetPath).catch(console.error);
}

module.exports = UniversalAppAuditor;