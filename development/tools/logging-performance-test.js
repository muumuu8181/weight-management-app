/**
 * ログシステム パフォーマンステストツール
 * 互換性レイヤーの影響を定量的に測定
 */

// Node.js環境でのテスト用
if (typeof window === 'undefined') {
    console.log('このテストはブラウザ環境で実行してください');
    process.exit(1);
}

class LoggingPerformanceTest {
    constructor() {
        this.results = {
            baseline: {},
            withCompatibility: {},
            comparison: {}
        };
    }

    /**
     * ベースラインテスト（直接console.log使用）
     */
    runBaselineTest(iterations = 10000) {
        console.log(`📊 ベースラインテスト開始 (${iterations}回の反復)`);
        
        // ウォームアップ
        for (let i = 0; i < 100; i++) {
            console.log(`Warmup ${i}`);
        }
        
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            console.log(`Baseline test message ${i}`);
        }
        
        const end = performance.now();
        const duration = end - start;
        
        this.results.baseline = {
            iterations: iterations,
            totalTime: duration,
            avgTime: duration / iterations,
            opsPerSecond: (iterations / duration) * 1000
        };
        
        console.log(`✅ ベースライン完了: ${duration.toFixed(2)}ms`);
        return this.results.baseline;
    }

    /**
     * 互換性レイヤー経由のテスト
     */
    runCompatibilityTest(iterations = 10000) {
        console.log(`📊 互換性レイヤーテスト開始 (${iterations}回の反復)`);
        
        // LoggingCompatibilityが存在することを確認
        if (!window.log || !window.LoggingCompatibility) {
            throw new Error('互換性レイヤーが読み込まれていません');
        }
        
        // 統計をリセット
        window.LoggingCompatibility.resetStats();
        
        // ウォームアップ
        for (let i = 0; i < 100; i++) {
            log(`Warmup ${i}`);
        }
        
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            log(`Compatibility test message ${i}`);
        }
        
        const end = performance.now();
        const duration = end - start;
        
        // ヘルスチェック
        const health = window.LoggingCompatibility.checkHealth();
        
        this.results.withCompatibility = {
            iterations: iterations,
            totalTime: duration,
            avgTime: duration / iterations,
            opsPerSecond: (iterations / duration) * 1000,
            health: health
        };
        
        console.log(`✅ 互換性レイヤーテスト完了: ${duration.toFixed(2)}ms`);
        return this.results.withCompatibility;
    }

    /**
     * 高負荷テスト（連続的なログ出力）
     */
    runStressTest(duration = 5000) {
        console.log(`💪 高負荷テスト開始 (${duration}ms間)`);
        
        let count = 0;
        const start = performance.now();
        const targetEnd = start + duration;
        
        // 統計をリセット
        if (window.LoggingCompatibility) {
            window.LoggingCompatibility.resetStats();
        }
        
        while (performance.now() < targetEnd) {
            log(`Stress test ${count} - ${new Date().toISOString()}`);
            count++;
        }
        
        const actualDuration = performance.now() - start;
        const health = window.LoggingCompatibility ? window.LoggingCompatibility.checkHealth() : null;
        
        const stressResults = {
            duration: actualDuration,
            logCount: count,
            logsPerSecond: (count / actualDuration) * 1000,
            avgTimePerLog: actualDuration / count,
            health: health
        };
        
        console.log(`✅ 高負荷テスト完了: ${count}ログ in ${actualDuration.toFixed(2)}ms`);
        return stressResults;
    }

    /**
     * メモリ使用量テスト
     */
    async runMemoryTest(iterations = 50000) {
        console.log(`💾 メモリ使用量テスト開始 (${iterations}回)`);
        
        // 初期メモリ状態（利用可能な場合）
        const initialMemory = performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize
        } : null;
        
        // ガベージコレクションを促す
        if (window.gc) {
            window.gc();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // 大量のログ生成
        for (let i = 0; i < iterations; i++) {
            log(`Memory test ${i} - ${new Array(100).fill('x').join('')}`);
        }
        
        // 終了時メモリ状態
        const finalMemory = performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize
        } : null;
        
        const memoryResults = {
            iterations: iterations,
            memoryAvailable: !!performance.memory,
            initialMemory: initialMemory,
            finalMemory: finalMemory,
            memoryIncrease: finalMemory && initialMemory ? 
                (finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize) / 1024 / 1024 : null
        };
        
        console.log(`✅ メモリテスト完了`);
        return memoryResults;
    }

    /**
     * 比較分析
     */
    compareResults() {
        const baseline = this.results.baseline;
        const withCompat = this.results.withCompatibility;
        
        if (!baseline.avgTime || !withCompat.avgTime) {
            throw new Error('先にベースラインテストと互換性テストを実行してください');
        }
        
        this.results.comparison = {
            overhead: {
                absolute: withCompat.avgTime - baseline.avgTime,
                percentage: ((withCompat.avgTime - baseline.avgTime) / baseline.avgTime) * 100
            },
            performance: {
                baselineOps: baseline.opsPerSecond,
                compatibilityOps: withCompat.opsPerSecond,
                degradation: ((baseline.opsPerSecond - withCompat.opsPerSecond) / baseline.opsPerSecond) * 100
            },
            acceptable: withCompat.avgTime - baseline.avgTime < 0.5 // 0.5ms以下なら許容範囲
        };
        
        return this.results.comparison;
    }

    /**
     * レポート生成
     */
    generateReport() {
        const report = `
========================================
ログシステム パフォーマンステスト結果
========================================

【ベースラインテスト】
- 反復回数: ${this.results.baseline.iterations || 'N/A'}
- 合計時間: ${this.results.baseline.totalTime?.toFixed(2) || 'N/A'}ms
- 平均時間: ${this.results.baseline.avgTime?.toFixed(4) || 'N/A'}ms/log
- 処理速度: ${this.results.baseline.opsPerSecond?.toFixed(0) || 'N/A'} logs/sec

【互換性レイヤーテスト】
- 反復回数: ${this.results.withCompatibility.iterations || 'N/A'}
- 合計時間: ${this.results.withCompatibility.totalTime?.toFixed(2) || 'N/A'}ms
- 平均時間: ${this.results.withCompatibility.avgTime?.toFixed(4) || 'N/A'}ms/log
- 処理速度: ${this.results.withCompatibility.opsPerSecond?.toFixed(0) || 'N/A'} logs/sec
- エラー率: ${this.results.withCompatibility.health?.errorRate?.toFixed(4) || 'N/A'}
- ステータス: ${this.results.withCompatibility.health?.status || 'N/A'}

【オーバーヘッド分析】
- 絶対増加: ${this.results.comparison.overhead?.absolute?.toFixed(4) || 'N/A'}ms/log
- 相対増加: ${this.results.comparison.overhead?.percentage?.toFixed(2) || 'N/A'}%
- 性能低下: ${this.results.comparison.performance?.degradation?.toFixed(2) || 'N/A'}%
- 評価: ${this.results.comparison.acceptable ? '✅ 許容範囲内' : '⚠️ 要改善'}

========================================
        `;
        
        return report;
    }

    /**
     * 全テスト実行
     */
    async runAllTests() {
        console.log('🚀 全テスト実行開始\n');
        
        try {
            // 1. ベースラインテスト
            this.runBaselineTest(10000);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 2. 互換性レイヤーテスト
            this.runCompatibilityTest(10000);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 3. 比較分析
            this.compareResults();
            
            // 4. 高負荷テスト
            const stressResults = this.runStressTest(3000);
            console.log(`高負荷時: ${stressResults.logsPerSecond.toFixed(0)} logs/sec`);
            
            // 5. メモリテスト
            const memoryResults = await this.runMemoryTest(10000);
            if (memoryResults.memoryIncrease !== null) {
                console.log(`メモリ増加: ${memoryResults.memoryIncrease.toFixed(2)} MB`);
            }
            
            // レポート生成
            const report = this.generateReport();
            console.log(report);
            
            return this.results;
            
        } catch (error) {
            console.error('テスト実行エラー:', error);
            throw error;
        }
    }
}

// グローバルに公開
window.LoggingPerformanceTest = LoggingPerformanceTest;

// 使用例を表示
console.log(`
📊 ログシステム パフォーマンステストツール

使用方法:
1. const test = new LoggingPerformanceTest();
2. await test.runAllTests(); // 全テスト実行
3. test.generateReport(); // レポート生成

個別テスト:
- test.runBaselineTest(10000); // ベースライン
- test.runCompatibilityTest(10000); // 互換性レイヤー
- test.runStressTest(5000); // 高負荷テスト
- test.runMemoryTest(50000); // メモリテスト
`);