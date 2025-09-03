#!/usr/bin/env node

/**
 * 汎用グラフ・チャート表示確認ツール
 * 任意のHTMLファイルでグラフ要素の存在・表示状態・初期化状態を検証
 * 体重管理、睡眠、部屋片付け等、全タブのグラフ要素に対応
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');

class UniversalChartChecker {
    constructor() {
        this.results = {};
        this.chartConfigs = {
            weight: {
                file: 'tabs/tab1-weight/tab-weight.html',
                elements: ['weightChart', 'chartPanel', 'weightHistory', 'weightHistoryPanel'],
                chartLibrary: 'Chart.js',
                dataSource: 'Firebase weights collection'
            },
            sleep: {
                file: 'index.html', // 睡眠はまだindex内
                elements: ['sleepChart', 'sleepHistory', 'sleepStats'],
                chartLibrary: 'Chart.js',
                dataSource: 'Firebase sleepData collection'
            },
            room: {
                file: 'tabs/tab3-room-cleaning/tab-room-cleaning.html',
                elements: ['roomHistoryArea', 'roomStatsArea'],
                chartLibrary: 'HTML Table',
                dataSource: 'Firebase roomData collection'
            },
            memo: {
                file: 'tabs/tab8-memo-list/tab-memo-list.html',
                elements: ['memoListArea', 'memoStats', 'filterStatus'],
                chartLibrary: 'Dynamic HTML',
                dataSource: 'Firebase memos collection'
            }
        };
    }

    async checkAllCharts() {
        console.log('🧪 全タブのグラフ・チャート表示チェック開始\n');
        
        for (const [tabName, config] of Object.entries(this.chartConfigs)) {
            console.log(`📊 ${tabName.toUpperCase()}タブ チェック:`);
            await this.checkTabChart(tabName, config);
            console.log('');
        }
        
        this.generateSummary();
    }
    
    async checkTabChart(tabName, config) {
        try {
            // HTMLファイル存在確認
            if (!fs.existsSync(config.file)) {
                console.log(`   ❌ HTMLファイル不存在: ${config.file}`);
                return;
            }
            
            const html = fs.readFileSync(config.file, 'utf8');
            const dom = new JSDOM(html, { runScripts: 'outside-only' });
            const document = dom.window.document;
            
            console.log(`   ✅ ${path.basename(config.file)} 読み込み完了`);
            
            const tabResults = {
                file: config.file,
                chartLibrary: config.chartLibrary,
                dataSource: config.dataSource,
                elements: {}
            };
            
            // 各要素をチェック
            for (const elementId of config.elements) {
                const element = document.getElementById(elementId);
                const exists = element !== null;
                
                tabResults.elements[elementId] = {
                    exists: exists,
                    visible: exists ? this.isElementVisible(element) : false,
                    ready: exists ? this.isChartReady(element, tabName) : false,
                    info: exists ? this.getChartInfo(element) : null
                };
                
                const status = exists ? '✅ 存在' : '❌ 不存在';
                const visibility = exists ? (this.isElementVisible(element) ? '👁️ 表示' : '🙈 非表示') : '';
                const readiness = exists ? (this.isChartReady(element, tabName) ? '🎯 準備OK' : '⏳ 未準備') : '';
                
                console.log(`   - ${elementId}: ${status} ${visibility} ${readiness}`);
                
                if (exists && !this.isElementVisible(element)) {
                    console.log(`     ⚠️ 非表示の理由: ${this.getHiddenReason(element)}`);
                }
                
                if (exists && !this.isChartReady(element, tabName)) {
                    console.log(`     ⚠️ 未準備の理由: ${this.getUnreadyReason(element, tabName)}`);
                }
            }
            
            this.results[tabName] = tabResults;
            
        } catch (error) {
            console.log(`   ❌ ${tabName}タブチェックエラー: ${error.message}`);
        }
    }
    
    isElementVisible(element) {
        if (!element) return false;
        
        const style = element.style;
        
        // display: none チェック
        if (style.display === 'none') return false;
        
        // visibility: hidden チェック  
        if (style.visibility === 'hidden') return false;
        
        // opacity: 0 チェック
        if (style.opacity === '0') return false;
        
        // hidden属性チェック
        if (element.hasAttribute('hidden')) return false;
        
        // クラスによる非表示チェック
        if (element.classList.contains('hidden')) return false;
        
        return true;
    }
    
    isChartReady(element, tabName) {
        if (!element) return false;
        
        // 要素のサイズチェック
        if (element.offsetWidth === 0 || element.offsetHeight === 0) {
            return false;
        }
        
        // 内容の有無チェック
        const hasContent = element.innerHTML && element.innerHTML.trim().length > 0;
        if (!hasContent) return false;
        
        // タブ固有のチェック
        switch (tabName) {
            case 'weight':
                // Chart.js canvas要素の確認
                const canvas = element.querySelector('canvas');
                return canvas !== null;
                
            case 'sleep':
                // 睡眠データ表示確認
                return !element.innerHTML.includes('データを読み込み中');
                
            case 'room':
                // 部屋片付け履歴表示確認
                return !element.innerHTML.includes('まだ片付け記録がありません');
                
            case 'memo':
                // メモリスト表示確認
                return !element.innerHTML.includes('まだメモがありません');
                
            default:
                return hasContent;
        }
    }
    
    getHiddenReason(element) {
        const reasons = [];
        
        if (element.style.display === 'none') reasons.push('display:none');
        if (element.style.visibility === 'hidden') reasons.push('visibility:hidden');
        if (element.style.opacity === '0') reasons.push('opacity:0');
        if (element.hasAttribute('hidden')) reasons.push('hidden属性');
        if (element.classList.contains('hidden')) reasons.push('hiddenクラス');
        
        return reasons.length > 0 ? reasons.join(', ') : '不明';
    }
    
    getUnreadyReason(element, tabName) {
        const reasons = [];
        
        if (element.offsetWidth === 0) reasons.push('幅=0');
        if (element.offsetHeight === 0) reasons.push('高さ=0');
        
        const hasContent = element.innerHTML && element.innerHTML.trim().length > 0;
        if (!hasContent) reasons.push('内容なし');
        
        // タブ固有の理由
        switch (tabName) {
            case 'weight':
                const canvas = element.querySelector('canvas');
                if (!canvas) reasons.push('Canvas要素なし');
                break;
        }
        
        return reasons.length > 0 ? reasons.join(', ') : '不明';
    }
    
    getChartInfo(element) {
        return {
            tagName: element.tagName,
            classList: Array.from(element.classList),
            style: element.style.cssText,
            offsetWidth: element.offsetWidth,
            offsetHeight: element.offsetHeight,
            hasContent: element.innerHTML && element.innerHTML.trim().length > 0,
            contentLength: element.innerHTML ? element.innerHTML.length : 0
        };
    }
    
    generateSummary() {
        console.log('📊 チェック結果サマリー:');
        
        let totalElements = 0;
        let existingElements = 0;
        let visibleElements = 0;
        let readyElements = 0;
        
        for (const [tabName, tabResult] of Object.entries(this.results)) {
            const elements = Object.values(tabResult.elements);
            totalElements += elements.length;
            existingElements += elements.filter(e => e.exists).length;
            visibleElements += elements.filter(e => e.visible).length;
            readyElements += elements.filter(e => e.ready).length;
        }
        
        console.log(`   📈 要素存在率: ${existingElements}/${totalElements} (${Math.round(existingElements/totalElements*100)}%)`);
        console.log(`   👁️ 要素表示率: ${visibleElements}/${existingElements} (${Math.round(visibleElements/existingElements*100)}%)`);
        console.log(`   🎯 チャート準備率: ${readyElements}/${existingElements} (${Math.round(readyElements/existingElements*100)}%)`);
        
        // 詳細結果の保存
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultFile = `./tools/testing/analysis-results/chart_check_summary_${timestamp}.json`;
        
        // ディレクトリが存在しない場合は作成
        const dir = path.dirname(resultFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(resultFile, JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                totalElements,
                existingElements, 
                visibleElements,
                readyElements
            },
            results: this.results
        }, null, 2));
        
        console.log(`💾 詳細結果保存: ${resultFile}`);
    }
}

// コマンドライン実行
if (require.main === module) {
    const checker = new UniversalChartChecker();
    const mode = process.argv[2];
    
    if (mode === 'all') {
        checker.checkAllCharts();
    } else if (checker.chartConfigs[mode]) {
        const config = checker.chartConfigs[mode];
        checker.checkTabChart(mode, config);
    } else {
        console.log('🔧 使用方法:');
        console.log('   node tools/testing/universal-chart-checker.js all    # 全タブ一括チェック');
        console.log('   node tools/testing/universal-chart-checker.js weight # 体重管理のみ');
        console.log('   node tools/testing/universal-chart-checker.js sleep  # 睡眠管理のみ');
        console.log('   node tools/testing/universal-chart-checker.js room   # 部屋片付けのみ');
        console.log('   node tools/testing/universal-chart-checker.js memo   # メモリストのみ');
    }
}

module.exports = UniversalChartChecker;