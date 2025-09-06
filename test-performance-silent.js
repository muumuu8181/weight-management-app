/**
 * Node.js環境での簡易パフォーマンステスト（サイレント版）
 */

const fs = require('fs');
const originalConsoleLog = console.log;

// サイレントモードでのテスト
const logs = [];
const silentConsoleLog = () => {}; // 何も出力しない

function runSilentPerformanceTest() {
    console.log('📊 パフォーマンステスト実行中...\n');
    
    const iterations = 10000;
    const results = {};
    
    // 1. ベースラインテスト（console.logを一時的に無効化）
    console.log = silentConsoleLog;
    
    const baselineStart = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
        originalConsoleLog(`Baseline test ${i}`);
    }
    
    const baselineEnd = process.hrtime.bigint();
    const baselineDuration = Number(baselineEnd - baselineStart) / 1000000;
    
    results.baseline = {
        iterations,
        totalTime: baselineDuration,
        avgTime: baselineDuration / iterations,
        opsPerSecond: (iterations / baselineDuration) * 1000
    };
    
    // 2. 互換性レイヤー模擬テスト
    logs.length = 0;
    
    const compatStart = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
        // console.log相当
        originalConsoleLog(`Compatibility test ${i}`);
        
        // 追加処理
        const timestamp = new Date().toISOString();
        const level = 'info';
        
        logs.push({
            timestamp,
            level,
            message: `Compatibility test ${i}`,
            context: 'test'
        });
        
        if (logs.length > 1000) {
            logs.shift();
        }
    }
    
    const compatEnd = process.hrtime.bigint();
    const compatDuration = Number(compatEnd - compatStart) / 1000000;
    
    results.compatibility = {
        iterations,
        totalTime: compatDuration,
        avgTime: compatDuration / iterations,
        opsPerSecond: (iterations / compatDuration) * 1000,
        logsStored: logs.length
    };
    
    // 3. 比較分析
    results.comparison = {
        overhead: {
            absolute: results.compatibility.avgTime - results.baseline.avgTime,
            percentage: ((results.compatibility.avgTime - results.baseline.avgTime) / results.baseline.avgTime) * 100
        },
        performance: {
            baselineOps: results.baseline.opsPerSecond,
            compatibilityOps: results.compatibility.opsPerSecond,
            degradation: ((results.baseline.opsPerSecond - results.compatibility.opsPerSecond) / results.baseline.opsPerSecond) * 100
        },
        acceptable: results.compatibility.avgTime - results.baseline.avgTime < 0.5
    };
    
    // 4. 高負荷テスト（1秒間）
    console.log = silentConsoleLog;
    const stressStart = Date.now();
    let stressCount = 0;
    logs.length = 0;
    
    while (Date.now() - stressStart < 1000) {
        originalConsoleLog(`Stress test ${stressCount}`);
        
        logs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: `Stress test ${stressCount}`,
            context: 'stress'
        });
        
        if (logs.length > 1000) {
            logs.shift();
        }
        
        stressCount++;
    }
    
    results.stress = {
        duration: 1000,
        logCount: stressCount,
        logsPerSecond: stressCount,
        logsInMemory: logs.length
    };
    
    // console.logを復元
    console.log = originalConsoleLog;
    
    // レポート生成
    const report = `
========================================
📊 ログシステム パフォーマンステスト結果
========================================

【ベースライン（console.logのみ）】
合計時間: ${results.baseline.totalTime.toFixed(2)}ms
平均時間: ${results.baseline.avgTime.toFixed(4)}ms/log
処理速度: ${results.baseline.opsPerSecond.toFixed(0)} logs/sec

【互換性レイヤー（console.log + 追加処理）】
合計時間: ${results.compatibility.totalTime.toFixed(2)}ms
平均時間: ${results.compatibility.avgTime.toFixed(4)}ms/log
処理速度: ${results.compatibility.opsPerSecond.toFixed(0)} logs/sec

【オーバーヘッド分析】
絶対増加: ${results.comparison.overhead.absolute.toFixed(4)}ms/log
相対増加: ${results.comparison.overhead.percentage.toFixed(2)}%
性能低下: ${results.comparison.performance.degradation.toFixed(2)}%
評価: ${results.comparison.acceptable ? '✅ 許容範囲内（< 0.5ms）' : '⚠️ 要改善（>= 0.5ms）'}

【高負荷テスト（1秒間）】
処理数: ${results.stress.logCount} logs
速度: ${results.stress.logsPerSecond} logs/sec
メモリ内ログ数: ${results.stress.logsInMemory}（最大1000）

========================================
`;
    
    console.log(report);
    
    // 結果をファイルに保存
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `performance-test-results-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`📄 詳細結果を保存: ${filename}`);
    
    return results;
}

// テスト実行
runSilentPerformanceTest();