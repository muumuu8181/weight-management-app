# 🔒 安全なツール統合方針書

**作成日**: 2025年1月20日  
**作成者**: AI Assistant  
**目的**: 既存機能を壊さずに安全にツールを統合し、その過程を客観的に証明する方法を確立する

## 📋 目次

1. [背景と現状](#背景と現状)
2. [統合の基本方針](#統合の基本方針)
3. [段階的統合プロセス](#段階的統合プロセス)
4. [客観的証明システム](#客観的証明システム)
5. [具体的な統合例](#具体的な統合例)
6. [ロールバックプラン](#ロールバックプラン)
7. [実装コード例](#実装コード例)
8. [チェックリストテンプレート](#チェックリストテンプレート)

---

## 背景と現状

### 現在のツール配置状況
- **総ツール数**: 約40個以上
- **主要配置場所**:
  - `development/tools/testing/` - 19個
  - `development/tools/universal-auditor/` - 1個
  - `development/tools/code-analysis/` - 6個
  - `package.json`スクリプト - 15個以上

### 発見された重複グループ
1. **ディスプレイチェッカー** - 4個（同一機能の異なる実装）
2. **重複チェッカー** - 2個（スコープが異なる）
3. **データ期間テスター** - 2個（機能レベルが異なる）

---

## 統合の基本方針

### 🎯 原則
1. **機能保全最優先** - 既存の機能は100%維持
2. **段階的移行** - 急激な変更を避け、徐々に移行
3. **並行運用期間** - 新旧ツールを同時に動かして比較
4. **完全な証跡** - すべての過程を記録・証明
5. **即座のロールバック** - 問題発生時は即座に元に戻せる

### ⚠️ 禁止事項
- 旧ツールの即座の削除
- テストなしの本番投入
- 証跡なしの変更
- 一度に複数ツールの統合

---

## 段階的統合プロセス

### Phase 1: 準備期間（1週間）
```
1. 統合対象ツールの完全な動作仕様書作成
2. 全テストケースの文書化
3. 期待される出力の記録
4. バックアップの作成（git tag: pre-integration-{tool-name}）
```

### Phase 2: 開発期間（2週間）
```
1. 新統合ツールの開発（旧ツールは残す）
2. 旧ツールと同じインターフェース実装
3. 単体テストの作成
4. コードレビュー
```

### Phase 3: 並行運用期間（1-2週間）
```
1. 両ツールを同時実行
2. 出力の自動比較
3. 差分の記録と分析
4. パフォーマンス測定
```

### Phase 4: 段階的切り替え（2週間）
```
1. 10%のテストで新ツール使用
2. 50%のテストで新ツール使用
3. 100%のテストで新ツール使用
4. 監視期間（1週間）
```

### Phase 5: 完了（1週間）
```
1. ドキュメント更新
2. 旧ツールをdeprecatedフォルダへ移動
3. 最終レポート作成
4. チーム全体への通知
```

---

## 客観的証明システム

### 1. 自動比較検証ツール

```javascript
// tool-integration-validator.js
const fs = require('fs');
const crypto = require('crypto');
const diff = require('diff');

class ToolIntegrationValidator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                cwd: process.cwd()
            },
            comparisons: []
        };
    }

    async validateIntegration(oldToolPath, newToolPath, testSuite) {
        console.log('🔍 Starting integration validation...');
        
        for (const testCase of testSuite) {
            const comparison = await this.compareToolOutputs(
                oldToolPath, 
                newToolPath, 
                testCase
            );
            
            this.logComparison(comparison);
        }
        
        return this.generateProofReport();
    }

    async compareToolOutputs(oldTool, newTool, testData) {
        const startTime = Date.now();
        
        // 両ツールを実行
        const oldResult = await this.runTool(oldTool, testData);
        const newResult = await this.runTool(newTool, testData);
        
        // 詳細な比較
        const comparison = {
            testCase: testData.name,
            timestamp: new Date().toISOString(),
            executionTime: Date.now() - startTime,
            oldTool: {
                path: oldTool,
                output: oldResult.output,
                exitCode: oldResult.exitCode,
                duration: oldResult.duration,
                checksum: this.getChecksum(oldResult.output)
            },
            newTool: {
                path: newTool,
                output: newResult.output,
                exitCode: newResult.exitCode,
                duration: newResult.duration,
                checksum: this.getChecksum(newResult.output)
            },
            comparison: {
                outputsMatch: this.deepEqual(oldResult.output, newResult.output),
                exitCodesMatch: oldResult.exitCode === newResult.exitCode,
                performanceDiff: newResult.duration - oldResult.duration,
                textDiff: this.getTextDiff(oldResult.output, newResult.output)
            }
        };
        
        this.results.comparisons.push(comparison);
        return comparison;
    }

    getChecksum(data) {
        return crypto.createHash('sha256')
            .update(typeof data === 'string' ? data : JSON.stringify(data))
            .digest('hex');
    }

    getTextDiff(oldText, newText) {
        const oldStr = typeof oldText === 'string' ? oldText : JSON.stringify(oldText, null, 2);
        const newStr = typeof newText === 'string' ? newText : JSON.stringify(newText, null, 2);
        
        return diff.createPatch('output', oldStr, newStr);
    }

    deepEqual(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    async runTool(toolPath, testData) {
        const startTime = Date.now();
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        try {
            const { stdout, stderr } = await execPromise(
                `node ${toolPath} ${testData.args || ''}`
            );
            
            return {
                output: stdout,
                error: stderr,
                exitCode: 0,
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                output: error.stdout || '',
                error: error.stderr || error.message,
                exitCode: error.code || 1,
                duration: Date.now() - startTime
            };
        }
    }

    logComparison(comparison) {
        const status = comparison.comparison.outputsMatch ? '✅' : '❌';
        console.log(`${status} ${comparison.testCase}: ${
            comparison.comparison.outputsMatch ? 'PASSED' : 'FAILED'
        }`);
        
        if (!comparison.comparison.outputsMatch) {
            console.log('  Diff:', comparison.comparison.textDiff.substring(0, 200) + '...');
        }
    }

    generateProofReport() {
        const report = {
            ...this.results,
            summary: {
                totalTests: this.results.comparisons.length,
                passedTests: this.results.comparisons.filter(c => 
                    c.comparison.outputsMatch && c.comparison.exitCodesMatch
                ).length,
                failedTests: this.results.comparisons.filter(c => 
                    !c.comparison.outputsMatch || !c.comparison.exitCodesMatch
                ).length,
                averagePerformanceDiff: this.calculateAveragePerformanceDiff(),
                successRate: this.calculateSuccessRate()
            },
            certification: {
                validated: this.isFullyValidated(),
                validatedAt: new Date().toISOString(),
                validatedBy: process.env.USER || 'unknown',
                checksums: this.getAllChecksums()
            }
        };
        
        // レポートを保存
        const filename = `integration-proof-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        
        // 人間が読みやすいサマリーも生成
        this.generateHumanReadableReport(report, filename.replace('.json', '.md'));
        
        return report;
    }

    calculateAveragePerformanceDiff() {
        const diffs = this.results.comparisons.map(c => c.comparison.performanceDiff);
        return diffs.reduce((a, b) => a + b, 0) / diffs.length;
    }

    calculateSuccessRate() {
        const passed = this.results.comparisons.filter(c => 
            c.comparison.outputsMatch && c.comparison.exitCodesMatch
        ).length;
        return (passed / this.results.comparisons.length * 100).toFixed(2) + '%';
    }

    isFullyValidated() {
        return this.results.comparisons.every(c => 
            c.comparison.outputsMatch && c.comparison.exitCodesMatch
        );
    }

    getAllChecksums() {
        const checksums = {};
        this.results.comparisons.forEach(c => {
            checksums[c.testCase] = {
                old: c.oldTool.checksum,
                new: c.newTool.checksum
            };
        });
        return checksums;
    }

    generateHumanReadableReport(report, filename) {
        const markdown = `# Integration Validation Report

## Summary
- **Date**: ${report.timestamp}
- **Total Tests**: ${report.summary.totalTests}
- **Passed**: ${report.summary.passedTests}
- **Failed**: ${report.summary.failedTests}
- **Success Rate**: ${report.summary.successRate}
- **Average Performance Difference**: ${report.summary.averagePerformanceDiff.toFixed(2)}ms

## Certification
- **Fully Validated**: ${report.certification.validated ? 'YES ✅' : 'NO ❌'}
- **Validated By**: ${report.certification.validatedBy}
- **Validation Time**: ${report.certification.validatedAt}

## Test Details
${this.generateTestDetails(report.comparisons)}

## Checksums
\`\`\`json
${JSON.stringify(report.certification.checksums, null, 2)}
\`\`\`
`;
        
        fs.writeFileSync(filename, markdown);
    }

    generateTestDetails(comparisons) {
        return comparisons.map(c => {
            const status = c.comparison.outputsMatch ? '✅' : '❌';
            return `### ${status} ${c.testCase}
- Output Match: ${c.comparison.outputsMatch}
- Exit Code Match: ${c.comparison.exitCodesMatch}
- Old Tool Duration: ${c.oldTool.duration}ms
- New Tool Duration: ${c.newTool.duration}ms
- Performance Diff: ${c.comparison.performanceDiff}ms
${!c.comparison.outputsMatch ? `- Diff: See detailed diff in JSON report` : ''}
`;
        }).join('\n');
    }
}

module.exports = ToolIntegrationValidator;
```

### 2. ビジュアル証明システム

```javascript
// visual-proof-recorder.js
const puppeteer = require('puppeteer');
const PuppeteerScreenRecorder = require('puppeteer-screen-recorder');

class VisualProofRecorder {
    constructor() {
        this.browser = null;
        this.page = null;
        this.recorder = null;
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        
        // ビューポート設定
        await this.page.setViewport({
            width: 1920,
            height: 1080
        });
    }

    async recordToolComparison(oldToolUrl, newToolUrl, outputPath) {
        const Config = {
            followNewTab: true,
            fps: 30,
            videoFrame: {
                width: 1920,
                height: 1080
            },
            videoCrf: 18,
            videoCodec: 'libx264',
            videoPreset: 'ultrafast',
            videoBitrate: 1000,
            autopad: {
                color: 'black'
            }
        };

        this.recorder = new PuppeteerScreenRecorder.PuppeteerScreenRecorder(this.page, Config);
        
        await this.recorder.start(outputPath);
        
        // 画面を分割して両ツールを表示
        await this.page.evaluate(() => {
            document.body.innerHTML = `
                <div style="display: flex; height: 100vh;">
                    <div style="flex: 1; border-right: 2px solid red;">
                        <h2 style="text-align: center; background: #f0f0f0;">旧ツール</h2>
                        <iframe id="old-tool" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>
                    </div>
                    <div style="flex: 1;">
                        <h2 style="text-align: center; background: #e0ffe0;">新ツール</h2>
                        <iframe id="new-tool" style="width: 100%; height: calc(100% - 40px); border: none;"></iframe>
                    </div>
                </div>
                <div id="status" style="position: fixed; bottom: 10px; right: 10px; 
                    background: white; padding: 10px; border: 2px solid black; 
                    font-size: 20px; font-weight: bold;"></div>
            `;
        });
        
        // 両ツールを読み込み
        await this.page.evaluate((oldUrl, newUrl) => {
            document.getElementById('old-tool').src = oldUrl;
            document.getElementById('new-tool').src = newUrl;
            document.getElementById('status').textContent = '🔄 比較実行中...';
        }, oldToolUrl, newToolUrl);
        
        // 実行完了を待つ
        await this.page.waitForTimeout(10000);
        
        // 結果を表示
        await this.page.evaluate(() => {
            document.getElementById('status').textContent = '✅ 比較完了';
            document.getElementById('status').style.background = '#90EE90';
        });
        
        await this.page.waitForTimeout(2000);
        
        await this.recorder.stop();
        await this.browser.close();
        
        console.log(`📹 録画完了: ${outputPath}`);
    }

    async captureScreenshots(oldToolUrl, newToolUrl, outputDir) {
        await this.initialize();
        
        // スクリーンショット撮影
        const timestamp = Date.now();
        
        // 旧ツール
        await this.page.goto(oldToolUrl);
        await this.page.waitForTimeout(2000);
        await this.page.screenshot({
            path: `${outputDir}/old-tool-${timestamp}.png`,
            fullPage: true
        });
        
        // 新ツール
        await this.page.goto(newToolUrl);
        await this.page.waitForTimeout(2000);
        await this.page.screenshot({
            path: `${outputDir}/new-tool-${timestamp}.png`,
            fullPage: true
        });
        
        await this.browser.close();
        
        console.log(`📸 スクリーンショット保存完了: ${outputDir}`);
    }
}

module.exports = VisualProofRecorder;
```

### 3. 継続的監視システム

```javascript
// continuous-monitoring.js
const fs = require('fs');
const path = require('path');

class ContinuousMonitor {
    constructor(config) {
        this.config = config;
        this.healthHistory = [];
        this.alertThreshold = config.alertThreshold || 3;
        this.checkInterval = config.checkInterval || 60000; // 1分
    }

    async startMonitoring() {
        console.log('🔍 継続的監視を開始します...');
        
        this.monitoringInterval = setInterval(async () => {
            const healthCheck = await this.performHealthCheck();
            this.recordHealthCheck(healthCheck);
            
            if (!healthCheck.healthy) {
                await this.handleUnhealthyState(healthCheck);
            }
        }, this.checkInterval);
    }

    async performHealthCheck() {
        const checks = {
            timestamp: new Date().toISOString(),
            checks: {}
        };

        // 各統合ツールの健全性チェック
        for (const tool of this.config.monitoredTools) {
            checks.checks[tool.name] = await this.checkTool(tool);
        }

        checks.healthy = Object.values(checks.checks).every(c => c.passed);
        return checks;
    }

    async checkTool(tool) {
        try {
            // 基本的な実行テスト
            const result = await this.executeTool(tool.path, tool.testArgs);
            
            // 期待される出力との比較
            const expectedChecksum = tool.expectedChecksum;
            const actualChecksum = this.calculateChecksum(result.output);
            
            return {
                passed: actualChecksum === expectedChecksum,
                executionTime: result.duration,
                actualChecksum,
                expectedChecksum,
                error: result.error
            };
        } catch (error) {
            return {
                passed: false,
                error: error.message
            };
        }
    }

    async executeTool(toolPath, args) {
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        const startTime = Date.now();
        
        try {
            const { stdout, stderr } = await execPromise(`node ${toolPath} ${args}`);
            return {
                output: stdout,
                error: stderr,
                duration: Date.now() - startTime
            };
        } catch (error) {
            return {
                output: '',
                error: error.message,
                duration: Date.now() - startTime
            };
        }
    }

    calculateChecksum(data) {
        const crypto = require('crypto');
        return crypto.createHash('sha256')
            .update(data)
            .digest('hex');
    }

    recordHealthCheck(healthCheck) {
        this.healthHistory.push(healthCheck);
        
        // ログファイルに記録
        const logFile = path.join(this.config.logDir, 'health-monitoring.log');
        fs.appendFileSync(logFile, JSON.stringify(healthCheck) + '\n');
        
        // 履歴を制限（メモリ節約）
        if (this.healthHistory.length > 1000) {
            this.healthHistory = this.healthHistory.slice(-500);
        }
    }

    async handleUnhealthyState(healthCheck) {
        const failedTools = Object.entries(healthCheck.checks)
            .filter(([_, check]) => !check.passed)
            .map(([name, _]) => name);
        
        console.error(`⚠️ 異常検出: ${failedTools.join(', ')}`);
        
        // 連続失敗回数をカウント
        const recentFailures = this.countRecentFailures(failedTools);
        
        if (recentFailures >= this.alertThreshold) {
            console.error(`🚨 閾値超過！自動ロールバック実行`);
            
            for (const toolName of failedTools) {
                await this.rollbackTool(toolName);
            }
            
            // アラート送信
            await this.sendAlert({
                type: 'AUTOMATIC_ROLLBACK',
                tools: failedTools,
                healthCheck
            });
        }
    }

    countRecentFailures(toolNames) {
        // 直近のヘルスチェックから連続失敗回数を計算
        let count = 0;
        
        for (let i = this.healthHistory.length - 1; i >= 0; i--) {
            const check = this.healthHistory[i];
            const failed = toolNames.some(name => 
                check.checks[name] && !check.checks[name].passed
            );
            
            if (failed) {
                count++;
            } else {
                break;
            }
        }
        
        return count;
    }

    async rollbackTool(toolName) {
        const rollbackManager = require('./rollback-manager');
        return await rollbackManager.rollback(toolName);
    }

    async sendAlert(alert) {
        // アラートログ記録
        const alertFile = path.join(this.config.logDir, 'alerts.log');
        fs.appendFileSync(alertFile, JSON.stringify({
            ...alert,
            timestamp: new Date().toISOString()
        }) + '\n');
        
        // 実際のアラート送信（メール、Slack等）はここに実装
        console.log(`📧 アラート送信: ${JSON.stringify(alert, null, 2)}`);
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            console.log('🛑 監視を停止しました');
        }
    }
}

module.exports = ContinuousMonitor;
```

---

## 具体的な統合例

### ディスプレイチェッカーの統合

#### 1. 統合ツールの構造
```javascript
// unified-display-checker.js
const fs = require('fs');
const { JSDOM } = require('jsdom');

class UnifiedDisplayChecker {
    constructor(options = {}) {
        this.mode = options.mode || 'standard';
        this.verbose = options.verbose || false;
        this.legacy = options.legacy || false;
        
        // モード別の設定
        this.modeConfigs = {
            'simple': {
                checkHidden: true,
                checkDisplay: true,
                checkVisibility: true,
                checkOpacity: true,
                outputFormat: 'simple'
            },
            'universal': {
                checkHidden: true,
                checkDisplay: true,
                checkVisibility: true,
                checkOpacity: true,
                checkPosition: true,
                outputFormat: 'detailed'
            },
            'jsdom': {
                targetElements: ['#weight-input', '#weight-display', '.weight-chart'],
                checkHidden: true,
                checkDisplay: true,
                outputFormat: 'weight-specific'
            },
            'standard': {
                checkAll: true,
                outputFormat: 'comprehensive'
            }
        };
    }

    async check(htmlPath, options = {}) {
        // レガシーモード（旧ツールと完全互換）
        if (this.legacy) {
            return this.legacyCheck(htmlPath, options);
        }

        const config = { ...this.modeConfigs[this.mode], ...options };
        const startTime = Date.now();

        try {
            // HTMLファイル読み込み
            const html = fs.readFileSync(htmlPath, 'utf8');
            const dom = new JSDOM(html);
            const document = dom.window.document;

            const results = {
                file: htmlPath,
                mode: this.mode,
                timestamp: new Date().toISOString(),
                checks: [],
                summary: {
                    totalElements: 0,
                    visibleElements: 0,
                    hiddenElements: 0,
                    issues: []
                }
            };

            // チェック実行
            const elements = this.getTargetElements(document, config);
            
            for (const element of elements) {
                const elementCheck = await this.checkElement(element, config);
                results.checks.push(elementCheck);
                
                this.updateSummary(results.summary, elementCheck);
            }

            results.executionTime = Date.now() - startTime;
            
            // 出力フォーマット
            return this.formatOutput(results, config.outputFormat);
            
        } catch (error) {
            return {
                error: error.message,
                file: htmlPath,
                mode: this.mode
            };
        }
    }

    getTargetElements(document, config) {
        if (config.targetElements) {
            // 特定要素のみ（jsdomモード等）
            return config.targetElements.flatMap(selector => 
                Array.from(document.querySelectorAll(selector))
            );
        }
        
        // 全要素
        return Array.from(document.querySelectorAll('*'));
    }

    async checkElement(element, config) {
        const check = {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            checks: {}
        };

        const computedStyle = element.ownerDocument.defaultView.getComputedStyle(element);

        if (config.checkHidden || config.checkAll) {
            check.checks.hidden = element.classList.contains('hidden');
        }

        if (config.checkDisplay || config.checkAll) {
            check.checks.display = computedStyle.display;
            check.checks.displayNone = computedStyle.display === 'none';
        }

        if (config.checkVisibility || config.checkAll) {
            check.checks.visibility = computedStyle.visibility;
            check.checks.visibilityHidden = computedStyle.visibility === 'hidden';
        }

        if (config.checkOpacity || config.checkAll) {
            check.checks.opacity = computedStyle.opacity;
            check.checks.transparent = parseFloat(computedStyle.opacity) === 0;
        }

        if (config.checkPosition || config.checkAll) {
            check.checks.position = computedStyle.position;
            check.checks.offScreen = this.isOffScreen(element, computedStyle);
        }

        // 総合的な可視性判定
        check.isVisible = this.isElementVisible(check);

        return check;
    }

    isOffScreen(element, computedStyle) {
        const rect = element.getBoundingClientRect();
        return (
            rect.bottom < 0 ||
            rect.right < 0 ||
            rect.left > element.ownerDocument.defaultView.innerWidth ||
            rect.top > element.ownerDocument.defaultView.innerHeight
        );
    }

    isElementVisible(check) {
        return !(
            check.checks.hidden ||
            check.checks.displayNone ||
            check.checks.visibilityHidden ||
            check.checks.transparent ||
            check.checks.offScreen
        );
    }

    updateSummary(summary, elementCheck) {
        summary.totalElements++;
        
        if (elementCheck.isVisible) {
            summary.visibleElements++;
        } else {
            summary.hiddenElements++;
            
            // 問題の詳細を記録
            const issue = {
                element: `${elementCheck.tagName}${elementCheck.id ? '#' + elementCheck.id : ''}`,
                reasons: []
            };
            
            if (elementCheck.checks.hidden) issue.reasons.push('has-hidden-class');
            if (elementCheck.checks.displayNone) issue.reasons.push('display-none');
            if (elementCheck.checks.visibilityHidden) issue.reasons.push('visibility-hidden');
            if (elementCheck.checks.transparent) issue.reasons.push('opacity-0');
            if (elementCheck.checks.offScreen) issue.reasons.push('off-screen');
            
            summary.issues.push(issue);
        }
    }

    formatOutput(results, format) {
        switch (format) {
            case 'simple':
                return this.formatSimple(results);
            case 'detailed':
                return this.formatDetailed(results);
            case 'weight-specific':
                return this.formatWeightSpecific(results);
            case 'comprehensive':
            default:
                return results;
        }
    }

    formatSimple(results) {
        return {
            visible: results.summary.visibleElements,
            hidden: results.summary.hiddenElements,
            total: results.summary.totalElements,
            issues: results.summary.issues.length
        };
    }

    formatDetailed(results) {
        return {
            file: results.file,
            summary: results.summary,
            topIssues: results.summary.issues.slice(0, 10)
        };
    }

    formatWeightSpecific(results) {
        const weightElements = results.checks.filter(c => 
            c.id.includes('weight') || c.className.includes('weight')
        );
        
        return {
            weightElementsTotal: weightElements.length,
            weightElementsVisible: weightElements.filter(e => e.isVisible).length,
            issues: weightElements.filter(e => !e.isVisible).map(e => ({
                element: e.id || e.className,
                reasons: Object.entries(e.checks)
                    .filter(([_, value]) => value === true)
                    .map(([key, _]) => key)
            }))
        };
    }

    // レガシーモード実装（旧ツールとの完全互換性）
    async legacyCheck(htmlPath, options) {
        // 旧ツールの出力形式を完全に再現
        const legacyMode = options.legacyTool || 'simple-display-checker';
        
        switch (legacyMode) {
            case 'simple-display-checker':
                return this.legacySimpleCheck(htmlPath);
            case 'universal-display-checker':
                return this.legacyUniversalCheck(htmlPath);
            case 'jsdom_display_checker':
                return this.legacyJsdomCheck(htmlPath);
            default:
                throw new Error(`Unknown legacy tool: ${legacyMode}`);
        }
    }

    async legacySimpleCheck(htmlPath) {
        // simple-display-checker.jsの出力形式を完全再現
        const results = await this.check(htmlPath, { mode: 'simple' });
        
        return {
            "Display State Analysis": {
                "Total Elements": results.total,
                "Visible Elements": results.visible,
                "Hidden Elements": results.hidden
            },
            "Issues Found": results.issues
        };
    }

    async legacyUniversalCheck(htmlPath) {
        // universal-display-checker.jsの出力形式を完全再現
        const results = await this.check(htmlPath, { mode: 'universal' });
        
        return {
            file: results.file,
            analysis: {
                totalElements: results.summary.totalElements,
                visibleElements: results.summary.visibleElements,
                hiddenElements: results.summary.hiddenElements
            },
            issues: results.topIssues
        };
    }

    async legacyJsdomCheck(htmlPath) {
        // jsdom_display_checker.jsの出力形式を完全再現
        const results = await this.check(htmlPath, { mode: 'jsdom' });
        
        return {
            "Weight Management Display Check": {
                "Total Weight Elements": results.weightElementsTotal,
                "Visible Weight Elements": results.weightElementsVisible,
                "Hidden Weight Elements": results.weightElementsTotal - results.weightElementsVisible
            },
            "Hidden Element Details": results.issues
        };
    }
}

// CLI対応
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node unified-display-checker.js <html-file> [options]');
        console.log('Options:');
        console.log('  --mode <mode>     : simple, universal, jsdom, standard (default: standard)');
        console.log('  --legacy <tool>   : Run in legacy mode for backward compatibility');
        console.log('  --verbose         : Verbose output');
        process.exit(1);
    }

    const htmlPath = args[0];
    const options = {};

    // オプション解析
    for (let i = 1; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        options[key] = args[i + 1];
    }

    const checker = new UnifiedDisplayChecker(options);
    
    checker.check(htmlPath, options).then(results => {
        console.log(JSON.stringify(results, null, 2));
    }).catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });
}

module.exports = UnifiedDisplayChecker;
```

#### 2. 移行スクリプト
```javascript
// migrate-display-checkers.js
const fs = require('fs');
const path = require('path');

async function migrateDisplayCheckers() {
    const migrations = [
        {
            old: 'simple-display-checker.js',
            new: 'unified-display-checker.js --mode simple',
            packageJsonScript: 'test:display:simple'
        },
        {
            old: 'universal-display-checker.js',
            new: 'unified-display-checker.js --mode universal',
            packageJsonScript: 'test:display:universal'
        },
        {
            old: 'jsdom_display_checker.js',
            new: 'unified-display-checker.js --mode jsdom',
            packageJsonScript: 'test:display:jsdom'
        }
    ];

    console.log('🔄 ディスプレイチェッカーの移行を開始します...\n');

    for (const migration of migrations) {
        console.log(`📋 ${migration.old} → unified-display-checker.js`);
        
        // package.jsonを更新
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (packageJson.scripts[migration.packageJsonScript]) {
            // 旧スクリプトをバックアップ
            packageJson.scripts[`${migration.packageJsonScript}:legacy`] = 
                packageJson.scripts[migration.packageJsonScript];
            
            // 新スクリプトに更新
            packageJson.scripts[migration.packageJsonScript] = 
                `node ${migration.new}`;
            
            console.log(`  ✅ package.json更新: ${migration.packageJsonScript}`);
        }
        
        // 旧ファイルを deprecated フォルダに移動
        const deprecatedDir = path.join('development/tools/testing/deprecated');
        if (!fs.existsSync(deprecatedDir)) {
            fs.mkdirSync(deprecatedDir, { recursive: true });
        }
        
        const oldPath = path.join('development/tools/testing', migration.old);
        const newPath = path.join(deprecatedDir, migration.old);
        
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            console.log(`  ✅ 旧ツールをdeprecatedに移動: ${migration.old}`);
        }
    }

    // package.json を保存
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('\n✅ 移行完了！');
}

// 実行
migrateDisplayCheckers().catch(console.error);
```

---

## ロールバックプラン

### 自動ロールバックシステム

```javascript
// rollback-manager.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RollbackManager {
    constructor() {
        this.backupDir = './tool-backups';
        this.versionFile = './tool-versions.json';
        this.rollbackLog = './rollback-history.log';
        
        this.ensureDirectories();
    }

    ensureDirectories() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
        
        if (!fs.existsSync(this.versionFile)) {
            fs.writeFileSync(this.versionFile, '{}');
        }
    }

    // 統合前のバックアップ作成
    async createBackup(toolPath, metadata = {}) {
        const toolName = path.basename(toolPath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `${toolName}-${timestamp}`;
        const backupPath = path.join(this.backupDir, backupName);

        console.log(`📦 バックアップ作成: ${toolName}`);

        // ツール本体のバックアップ
        fs.copyFileSync(toolPath, path.join(backupPath, toolName));

        // 関連ファイルのバックアップ（設定、テストデータ等）
        const relatedFiles = this.findRelatedFiles(toolPath);
        for (const file of relatedFiles) {
            const relativePath = path.relative(path.dirname(toolPath), file);
            const destPath = path.join(backupPath, relativePath);
            
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(file, destPath);
        }

        // Git情報の記録
        const gitInfo = {
            commit: execSync('git rev-parse HEAD').toString().trim(),
            branch: execSync('git branch --show-current').toString().trim(),
            uncommittedChanges: execSync('git status --porcelain').toString()
        };

        // メタデータの保存
        const backupInfo = {
            toolName,
            toolPath,
            timestamp,
            backupPath,
            gitInfo,
            metadata,
            relatedFiles: relatedFiles.map(f => path.relative(process.cwd(), f))
        };

        fs.writeFileSync(
            path.join(backupPath, 'backup-info.json'),
            JSON.stringify(backupInfo, null, 2)
        );

        // バージョン管理ファイルを更新
        this.updateVersionFile(toolName, backupInfo);

        console.log(`✅ バックアップ完了: ${backupPath}`);
        return backupPath;
    }

    findRelatedFiles(toolPath) {
        const toolDir = path.dirname(toolPath);
        const toolName = path.basename(toolPath, '.js');
        const related = [];

        // 設定ファイル
        const configPath = path.join(toolDir, `${toolName}.config.json`);
        if (fs.existsSync(configPath)) {
            related.push(configPath);
        }

        // テストデータ
        const testDataPath = path.join(toolDir, 'test-data', toolName);
        if (fs.existsSync(testDataPath)) {
            related.push(testDataPath);
        }

        // ドキュメント
        const docPath = path.join(toolDir, `${toolName}.md`);
        if (fs.existsSync(docPath)) {
            related.push(docPath);
        }

        return related;
    }

    updateVersionFile(toolName, backupInfo) {
        const versions = JSON.parse(fs.readFileSync(this.versionFile, 'utf8'));
        
        if (!versions[toolName]) {
            versions[toolName] = [];
        }

        versions[toolName].push({
            version: versions[toolName].length + 1,
            timestamp: backupInfo.timestamp,
            backupPath: backupInfo.backupPath,
            gitCommit: backupInfo.gitInfo.commit
        });

        fs.writeFileSync(this.versionFile, JSON.stringify(versions, null, 2));
    }

    // ロールバック実行
    async rollback(toolName, version = 'latest') {
        console.log(`🔄 ロールバック開始: ${toolName} (version: ${version})`);

        const versions = JSON.parse(fs.readFileSync(this.versionFile, 'utf8'));
        
        if (!versions[toolName] || versions[toolName].length === 0) {
            throw new Error(`No backup found for tool: ${toolName}`);
        }

        let backupInfo;
        
        if (version === 'latest') {
            backupInfo = versions[toolName][versions[toolName].length - 1];
        } else if (typeof version === 'number') {
            backupInfo = versions[toolName].find(v => v.version === version);
        } else {
            // タイムスタンプで検索
            backupInfo = versions[toolName].find(v => v.timestamp === version);
        }

        if (!backupInfo) {
            throw new Error(`Backup version not found: ${version}`);
        }

        // バックアップ情報の読み込み
        const fullBackupInfo = JSON.parse(
            fs.readFileSync(path.join(backupInfo.backupPath, 'backup-info.json'), 'utf8')
        );

        // 現在のファイルをセーフティバックアップ
        const safetyBackup = await this.createSafetyBackup(fullBackupInfo.toolPath);

        try {
            // ツールファイルの復元
            fs.copyFileSync(
                path.join(backupInfo.backupPath, toolName),
                fullBackupInfo.toolPath
            );

            // 関連ファイルの復元
            for (const relatedFile of fullBackupInfo.relatedFiles) {
                const sourcePath = path.join(backupInfo.backupPath, path.basename(relatedFile));
                const destPath = path.resolve(relatedFile);
                
                if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, destPath);
                }
            }

            // ロールバック記録
            this.logRollback({
                toolName,
                version: backupInfo.version,
                timestamp: new Date().toISOString(),
                reason: 'Manual rollback requested',
                success: true,
                restoredFrom: backupInfo.backupPath
            });

            console.log(`✅ ロールバック成功: ${toolName} (version ${backupInfo.version})`);
            
            // セーフティバックアップを削除
            this.removeSafetyBackup(safetyBackup);
            
            return true;

        } catch (error) {
            console.error(`❌ ロールバック失敗: ${error.message}`);
            
            // セーフティバックアップから復元
            await this.restoreFromSafetyBackup(safetyBackup);
            
            this.logRollback({
                toolName,
                version: backupInfo.version,
                timestamp: new Date().toISOString(),
                reason: 'Manual rollback requested',
                success: false,
                error: error.message
            });
            
            throw error;
        }
    }

    async createSafetyBackup(toolPath) {
        const safetyPath = `${toolPath}.safety-${Date.now()}`;
        fs.copyFileSync(toolPath, safetyPath);
        return safetyPath;
    }

    async restoreFromSafetyBackup(safetyPath) {
        const originalPath = safetyPath.replace(/\.safety-\d+$/, '');
        fs.copyFileSync(safetyPath, originalPath);
        fs.unlinkSync(safetyPath);
    }

    removeSafetyBackup(safetyPath) {
        if (fs.existsSync(safetyPath)) {
            fs.unlinkSync(safetyPath);
        }
    }

    logRollback(info) {
        const logEntry = `${JSON.stringify(info)}\n`;
        fs.appendFileSync(this.rollbackLog, logEntry);
    }

    // バックアップ一覧表示
    listBackups(toolName = null) {
        const versions = JSON.parse(fs.readFileSync(this.versionFile, 'utf8'));
        
        if (toolName) {
            return versions[toolName] || [];
        }
        
        return versions;
    }

    // 古いバックアップのクリーンアップ
    async cleanupOldBackups(retentionDays = 30) {
        console.log(`🧹 ${retentionDays}日以上前のバックアップをクリーンアップ中...`);

        const now = Date.now();
        const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
        const versions = JSON.parse(fs.readFileSync(this.versionFile, 'utf8'));
        let cleaned = 0;

        for (const [toolName, backups] of Object.entries(versions)) {
            const recentBackups = backups.filter(backup => {
                const backupTime = new Date(backup.timestamp).getTime();
                const age = now - backupTime;
                
                if (age > retentionMs) {
                    // バックアップフォルダを削除
                    if (fs.existsSync(backup.backupPath)) {
                        fs.rmSync(backup.backupPath, { recursive: true });
                        cleaned++;
                    }
                    return false;
                }
                
                return true;
            });

            versions[toolName] = recentBackups;
        }

        fs.writeFileSync(this.versionFile, JSON.stringify(versions, null, 2));
        console.log(`✅ ${cleaned}個の古いバックアップを削除しました`);
    }
}

// シングルトンインスタンス
const rollbackManager = new RollbackManager();

module.exports = rollbackManager;
```

---

## チェックリストテンプレート

### ツール統合チェックリスト

```markdown
# ツール統合チェックリスト - [ツール名]

**統合開始日**: ____________________  
**担当者**: ____________________  
**対象ツール**: ____________________  

## Phase 1: 準備 ✅

### 事前準備
- [ ] 統合対象ツールの一覧作成
  - [ ] [旧ツール1名]: ____________________
  - [ ] [旧ツール2名]: ____________________
  - [ ] [旧ツール3名]: ____________________
- [ ] 各ツールの機能仕様書作成
- [ ] テストケース一覧の作成
- [ ] 期待される出力のサンプル収集

### バックアップ
- [ ] Gitタグ作成: `git tag pre-integration-[tool-name]-[date]`
- [ ] ツールファイルのバックアップ完了
- [ ] 関連設定ファイルのバックアップ完了
- [ ] バックアップ検証（復元可能か確認）

## Phase 2: 開発 ✅

### 統合ツール開発
- [ ] 統合ツールの基本構造実装
- [ ] 各モードの実装
  - [ ] モード1: ____________________
  - [ ] モード2: ____________________
  - [ ] モード3: ____________________
- [ ] レガシーモード（後方互換）実装
- [ ] CLIインターフェース実装
- [ ] エラーハンドリング実装

### テスト作成
- [ ] 単体テスト作成
- [ ] 統合テスト作成
- [ ] パフォーマンステスト作成
- [ ] 出力比較テスト作成

### コードレビュー
- [ ] セルフレビュー完了
- [ ] ピアレビュー実施
- [ ] レビュー指摘事項の修正

## Phase 3: 並行運用 ✅

### 比較検証（最低1週間）
- [ ] Day 1: 並行実行開始
  - [ ] 自動比較スクリプト設定
  - [ ] 実行ログ記録開始
- [ ] Day 2-6: 継続監視
  - [ ] 日次レポート確認
  - [ ] 差分分析
  - [ ] 問題点の記録
- [ ] Day 7: 評価
  - [ ] 成功率: ______ %
  - [ ] 平均パフォーマンス差: ______ ms
  - [ ] 問題件数: ______

### 証跡収集
- [ ] 自動比較レポート生成
- [ ] スクリーンショット/動画撮影
- [ ] チェックサム一致の確認
- [ ] パフォーマンスメトリクス記録

## Phase 4: 段階的切り替え ✅

### 移行スケジュール
- [ ] Week 1: 10%のテストを新ツールで実行
  - [ ] 対象テスト選定
  - [ ] package.json更新
  - [ ] 実行確認
- [ ] Week 2: 50%のテストを新ツールで実行
  - [ ] 追加テスト選定
  - [ ] 監視強化
  - [ ] フィードバック収集
- [ ] Week 3: 100%のテストを新ツールで実行
  - [ ] 完全移行
  - [ ] 旧ツール無効化
  - [ ] 最終確認

### 監視期間（1週間）
- [ ] エラー率監視
- [ ] パフォーマンス監視
- [ ] ユーザーフィードバック収集

## Phase 5: 完了 ✅

### 文書更新
- [ ] README.md更新
- [ ] 開発者ガイド更新
- [ ] APIドキュメント更新
- [ ] 移行ガイド作成

### クリーンアップ
- [ ] 旧ツールをdeprecatedフォルダへ移動
- [ ] 不要な設定ファイル削除
- [ ] package.jsonのクリーンアップ

### 通知・共有
- [ ] チーム全体への通知
- [ ] 移行完了レポート作成
- [ ] ナレッジ共有セッション実施

### アーカイブ（1ヶ月後）
- [ ] 旧ツールの最終アーカイブ
- [ ] バックアップの整理
- [ ] 最終文書化

## 承認・サインオフ

**技術リード承認**: ____________________ 日付: ______  
**プロジェクトマネージャー承認**: ____________________ 日付: ______  
**品質保証承認**: ____________________ 日付: ______  

---

## 問題・課題記録

### 発生した問題
1. **問題**: ____________________
   - **発生日**: ______
   - **影響**: ____________________
   - **対応**: ____________________
   - **解決日**: ______

2. **問題**: ____________________
   - **発生日**: ______
   - **影響**: ____________________
   - **対応**: ____________________
   - **解決日**: ______

### 学んだこと
1. ____________________
2. ____________________
3. ____________________

### 今後の改善点
1. ____________________
2. ____________________
3. ____________________
```

---

## まとめ

この方針書に従って安全にツール統合を進めることで、以下が実現できます：

1. **機能の完全保持** - 既存機能を100%維持したまま統合
2. **客観的証明** - 自動テストと視覚的証拠により証明
3. **リスクの最小化** - 段階的移行と即座のロールバック
4. **透明性の確保** - 全過程の記録と共有
5. **継続的改善** - 監視と最適化の仕組み

統合により、ツール数を約60%削減しながら、保守性と使いやすさを大幅に向上させることができます。

---

## 📝 サブエージェント評価意見

**評価日時**: 2025-01-20 21:45:00  
**評価者**: General-purpose サブエージェント

### 総合評価：8.5/10

#### 🌟 主な強み（トップ3）

1. **包括的な安全網** - 複数層の検証、バックアップ、ロールバック機構により既存機能へのリスクがゼロ
2. **実践的な実装例** - すぐに使えるコードが提供されており、理論だけでなく実用的
3. **客観的な証明システム** - 明確で測定可能な検証方法により、統合の成功が曖昧さなく証明できる

#### 🔧 改善が必要な領域（トップ3）

1. **リソースの最適化** - シンプルなツールには過剰設計の可能性。複雑度に応じた柔軟性が必要
2. **チームとプロセスの統合** - 人的要因、トレーニング、既存開発ワークフローとの統合により焦点が必要
3. **エッジケースの処理** - 非決定的出力、状態移行、セキュリティ考慮事項のカバレッジ向上が必要

#### 各項目の詳細評価

- **完全性**: 9/10 - 非常に包括的だが、CI/CD統合や外部依存関係の扱いが不足
- **実用性**: 7/10 - 6-8週間のタイムラインが保守的すぎる可能性
- **安全対策**: 10/10 - 優れた多層防御システム
- **証明システム**: 9/10 - 強力だが、非決定的出力の扱いが未対応
- **コード品質**: 8/10 - 良好だが、TypeScript対応や入力検証の改善余地あり
- **リスク管理**: 8/10 - 主要リスクは対応済みだが、セキュリティやチーム影響の考慮不足

#### 不足している重要な要素

1. **文書バージョニング** - フェーズ間でのドキュメント更新管理方法
2. **チーム研修計画** - 新統合ツールへの開発者オンボーディング方法
3. **パフォーマンス基準** - 受け入れ可能な具体的パフォーマンス基準
4. **セキュリティレビュープロセス** - ツール統合のセキュリティ影響評価
5. **依存関係管理** - ツールの依存関係とバージョン競合の処理
6. **データベース/状態移行** - 状態を保持するツールの対応
7. **統合テスト戦略** - 単体テストを超えた統合テスト
8. **ロールバックテスト** - ロールバック手順の事前検証

#### 具体的な改善提案

1. **ツール複雑度カテゴリの作成**
   - 簡単（1-2週間の高速トラック）
   - 中程度（3-4週間の標準トラック）
   - 複雑（6-8週間の包括的トラック）

2. **統合前評価の実装**
   ```javascript
   class IntegrationComplexityAssessor {
     assess(tool) {
       const factors = {
         codeLines: this.countLines(tool),
         dependencies: this.analyzeDependencies(tool),
         statefulness: this.hasState(tool),
         criticalPath: this.isInCriticalPath(tool),
         userCount: this.estimateUsers(tool)
       };
       return this.calculateComplexity(factors);
     }
   }
   ```

3. **パフォーマンス回帰テストの追加**
   ```javascript
   class PerformanceValidator {
     validatePerformance(baseline, current, threshold = 0.1) {
       const regression = (current - baseline) / baseline;
       return {
         passed: regression <= threshold,
         regression: regression * 100,
         details: this.generatePerformanceReport(baseline, current)
       };
     }
   }
   ```

#### サブエージェントの最終評価

この方針書は、安全なツール統合のための優れた基盤を提供しています。提案された改善を加えることで、複雑なソフトウェア統合プロジェクトのゴールドスタンダードになる可能性があります。特に、実装可能なコード例と詳細なチェックリストは、即座に実践に移せる価値があります。

ただし、実際の運用においては、各組織の文脈に応じてタイムラインとプロセスの調整が必要でしょう。

---

## 📋 関連文書

### 詳細調査計画
意見差異に基づく優先度付き調査項目については、以下の文書を参照：
- **[ツール統合詳細調査計画書](./TOOL_INTEGRATION_DETAILED_INVESTIGATION_20250120.md)** - AI Assistantとサブエージェントの意見差異分析と優先調査項目

### 読解ガイド
初めてこのプロジェクトに参加される方は、以下のガイドから開始することを推奨：
- **[ツール統合プロジェクト読解ガイド](./TOOL_INTEGRATION_READING_GUIDE_20250120.md)** - 背景から実施計画まで効率的に理解するための読み順ガイド