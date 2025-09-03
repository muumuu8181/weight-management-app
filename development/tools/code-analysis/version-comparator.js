// バージョン比較ツール - ビフォーアフター分析
// 過去のメトリクスデータと現在を比較してテーブル形式で出力

const fs = require('fs');
const path = require('path');
const CodeMetricsAnalyzer = require('./code-metrics-analyzer');

class VersionComparator {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.reportsDir = path.join(projectRoot, 'tools', 'reports');
        this.analyzer = new CodeMetricsAnalyzer(projectRoot);
    }
    
    // バージョン比較実行
    async compareVersions(fromVersion = null, toVersion = 'current') {
        console.log('📊 バージョン比較開始...');
        
        let fromData, toData;
        
        // FROM データ取得
        if (fromVersion) {
            fromData = this.loadVersionData(fromVersion);
            if (!fromData) {
                console.error(`❌ バージョン ${fromVersion} のデータが見つかりません`);
                return;
            }
        } else {
            fromData = this.getLatestStoredData();
            if (!fromData) {
                console.log('⚠️ 過去データなし - 現在のデータのみ保存');
                await this.analyzer.analyzeProject();
                return;
            }
        }
        
        // TO データ取得
        if (toVersion === 'current') {
            toData = await this.analyzer.analyzeProject();
        } else {
            toData = this.loadVersionData(toVersion);
            if (!toData) {
                console.error(`❌ バージョン ${toVersion} のデータが見つかりません`);
                return;
            }
        }
        
        // 比較分析
        const comparison = this.generateComparison(fromData, toData);
        await this.saveComparison(comparison, fromVersion, toVersion);
        
        console.log('✅ バージョン比較完了');
        return comparison;
    }
    
    // バージョンデータ読み込み
    loadVersionData(versionTag) {
        const files = fs.readdirSync(this.reportsDir)
            .filter(file => file.includes(versionTag) && file.endsWith('.json'))
            .sort()
            .reverse();
        
        if (files.length === 0) return null;
        
        const filePath = path.join(this.reportsDir, files[0]);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    // 最新保存データ取得
    getLatestStoredData() {
        if (!fs.existsSync(this.reportsDir)) return null;
        
        const files = fs.readdirSync(this.reportsDir)
            .filter(file => file.startsWith('code-metrics-') && file.endsWith('.json'))
            .sort()
            .reverse();
        
        if (files.length === 0) return null;
        
        const latestPath = path.join(this.reportsDir, files[0]);
        return JSON.parse(fs.readFileSync(latestPath, 'utf8'));
    }
    
    // 比較データ生成
    generateComparison(fromData, toData) {
        const comparison = {
            fromTimestamp: fromData.timestamp,
            toTimestamp: toData.timestamp,
            tabChanges: this.compareTabsData(fromData.tabs, toData.tabs),
            sharedChanges: this.compareSharedData(fromData.shared, toData.shared),
            summary: {}
        };
        
        // サマリー計算
        const fromTotal = this.calculateTotal(fromData);
        const toTotal = this.calculateTotal(toData);
        
        comparison.summary = {
            fromTotal: fromTotal,
            toTotal: toTotal,
            totalChange: toTotal - fromTotal,
            changePercent: fromTotal > 0 ? ((toTotal - fromTotal) / fromTotal * 100).toFixed(1) : 0
        };
        
        return comparison;
    }
    
    // タブデータ比較
    compareTabsData(fromTabs, toTabs) {
        const changes = [];
        const allTabNames = new Set([...Object.keys(fromTabs), ...Object.keys(toTabs)]);
        
        allTabNames.forEach(tabName => {
            const fromTab = fromTabs[tabName] || { total: 0 };
            const toTab = toTabs[tabName] || { total: 0 };
            
            const change = toTab.total - fromTab.total;
            const changePercent = fromTab.total > 0 ? ((change / fromTab.total) * 100).toFixed(1) : 'N/A';
            
            changes.push({
                name: tabName,
                from: fromTab.total,
                to: toTab.total,
                change: change,
                changePercent: changePercent,
                status: change > 0 ? '増加' : change < 0 ? '削減' : '変更なし'
            });
        });
        
        return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    }
    
    // 共通データ比較
    compareSharedData(fromShared, toShared) {
        const changes = [];
        const allDirs = new Set([...Object.keys(fromShared), ...Object.keys(toShared)]);
        
        allDirs.forEach(dirName => {
            const fromDir = fromShared[dirName] || { total: 0 };
            const toDir = toShared[dirName] || { total: 0 };
            
            const change = toDir.total - fromDir.total;
            const changePercent = fromDir.total > 0 ? ((change / fromDir.total) * 100).toFixed(1) : 'N/A';
            
            changes.push({
                name: `shared/${dirName}`,
                from: fromDir.total,
                to: toDir.total,
                change: change,
                changePercent: changePercent,
                status: change > 0 ? '増加' : change < 0 ? '削減' : '変更なし'
            });
        });
        
        return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    }
    
    // 総行数計算
    calculateTotal(data) {
        let total = 0;
        
        // タブ
        Object.values(data.tabs).forEach(tab => total += tab.total);
        
        // 共通
        Object.values(data.shared).forEach(shared => total += shared.total);
        
        // コア
        total += data.core.total;
        
        // その他
        Object.values(data.other).forEach(lines => total += lines);
        
        return total;
    }
    
    // 比較レポート保存
    async saveComparison(comparison, fromVersion, toVersion) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `version-comparison-${fromVersion || 'prev'}-to-${toVersion}-${timestamp}`;
        
        // テキストレポート生成
        let report = `=== バージョン比較レポート ===\n`;
        report += `比較期間: ${new Date(comparison.fromTimestamp).toLocaleString()} → ${new Date(comparison.toTimestamp).toLocaleString()}\n\n`;
        
        // 総合変化
        report += `【総合変化】\n`;
        report += `総行数: ${comparison.summary.fromTotal} → ${comparison.summary.toTotal} (${comparison.summary.totalChange >= 0 ? '+' : ''}${comparison.summary.totalChange}行, ${comparison.summary.changePercent}%)\n\n`;
        
        // タブ別変化
        report += `【タブ別変化】\n`;
        report += `| タブ名 | Before | After | 変化 | 変化率 | 状態 |\n`;
        report += `|--------|--------|-------|------|--------|------|\n`;
        
        comparison.tabChanges.forEach(change => {
            report += `| ${change.name} | ${change.from}行 | ${change.to}行 | ${change.change >= 0 ? '+' : ''}${change.change}行 | ${change.changePercent}% | ${change.status} |\n`;
        });
        
        report += `\n【共通機能変化】\n`;
        report += `| 機能 | Before | After | 変化 | 変化率 | 状態 |\n`;
        report += `|------|--------|-------|------|--------|------|\n`;
        
        comparison.sharedChanges.forEach(change => {
            report += `| ${change.name} | ${change.from}行 | ${change.to}行 | ${change.change >= 0 ? '+' : ''}${change.change}行 | ${change.changePercent}% | ${change.status} |\n`;
        });
        
        // 保存
        const txtPath = path.join(this.reportsDir, `${filename}.txt`);
        const jsonPath = path.join(this.reportsDir, `${filename}.json`);
        
        fs.writeFileSync(txtPath, report, 'utf8');
        fs.writeFileSync(jsonPath, JSON.stringify(comparison, null, 2), 'utf8');
        
        console.log(`📊 比較レポート保存: ${txtPath}`);
        console.log(`📊 比較データ保存: ${jsonPath}`);
    }
}

// CLI実行
async function main() {
    const args = process.argv.slice(2);
    const fromVersion = args.find(arg => arg.startsWith('--from'))?.split('=')[1];
    const toVersion = args.find(arg => arg.startsWith('--to'))?.split('=')[1] || 'current';
    
    const projectRoot = process.cwd();
    const comparator = new VersionComparator(projectRoot);
    
    try {
        await comparator.compareVersions(fromVersion, toVersion);
        console.log('\n🎉 比較完了 - tools/reports/ フォルダを確認してください');
    } catch (error) {
        console.error('❌ 比較エラー:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = VersionComparator;