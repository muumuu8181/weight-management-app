/**
 * Node.js環境での簡易パフォーマンステスト
 * ログシステムの基本的なオーバーヘッドを測定
 */

// 簡易的なlog関数のモック
const logs = [];
const originalConsoleLog = console.log;

// ベースラインテスト用
function baselineLog(message) {
    originalConsoleLog(message);
}

// 互換性レイヤー風のテスト用
function compatibilityLog(message) {
    // 1. オリジナルのconsole.log
    originalConsoleLog(message);
    
    // 2. 追加処理（UniversalLoggerへの転送を模擬）
    const timestamp = new Date().toISOString();
    const level = message.includes('Error') ? 'error' : 'info';
    
    // オブジェクト作成とプッシュ（実際の処理を模擬）
    logs.push({
        timestamp,
        level,
        message,
        context: 'test'
    });
    
    // ログローテーション（1000件制限を模擬）
    if (logs.length > 1000) {
        logs.shift();
    }
}

// パフォーマンステスト実行
function runPerformanceTest() {
    console.log('📊 Node.js環境での簡易パフォーマンステスト\n');
    
    const iterations = 10000;
    const results = {};
    
    // 1. ベースラインテスト
    console.log('1️⃣ ベースラインテスト実行中...');
    const baselineStart = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
        baselineLog(`Baseline test ${i}`);
    }
    
    const baselineEnd = process.hrtime.bigint();
    const baselineDuration = Number(baselineEnd - baselineStart) / 1000000; // ナノ秒→ミリ秒
    
    results.baseline = {
        iterations,
        totalTime: baselineDuration,
        avgTime: baselineDuration / iterations,
        opsPerSecond: (iterations / baselineDuration) * 1000
    };
    
    // 少し待機
    setTimeout(() => {
        // 2. 互換性レイヤーテスト
        console.log('\n2️⃣ 互換性レイヤー模擬テスト実行中...');
        logs.length = 0; // ログクリア
        
        const compatStart = process.hrtime.bigint();
        
        for (let i = 0; i < iterations; i++) {
            compatibilityLog(`Compatibility test ${i}`);
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
        
        // レポート出力
        console.log('\n' + '='.repeat(50));
        console.log('📊 パフォーマンステスト結果サマリー');
        console.log('='.repeat(50));
        console.log('\n【ベースライン】');
        console.log(`合計時間: ${results.baseline.totalTime.toFixed(2)}ms`);
        console.log(`平均時間: ${results.baseline.avgTime.toFixed(4)}ms/log`);
        console.log(`処理速度: ${results.baseline.opsPerSecond.toFixed(0)} logs/sec`);
        
        console.log('\n【互換性レイヤー】');
        console.log(`合計時間: ${results.compatibility.totalTime.toFixed(2)}ms`);
        console.log(`平均時間: ${results.compatibility.avgTime.toFixed(4)}ms/log`);
        console.log(`処理速度: ${results.compatibility.opsPerSecond.toFixed(0)} logs/sec`);
        
        console.log('\n【オーバーヘッド分析】');
        console.log(`絶対増加: ${results.comparison.overhead.absolute.toFixed(4)}ms/log`);
        console.log(`相対増加: ${results.comparison.overhead.percentage.toFixed(2)}%`);
        console.log(`性能低下: ${results.comparison.performance.degradation.toFixed(2)}%`);
        console.log(`評価: ${results.comparison.acceptable ? '✅ 許容範囲内（< 0.5ms）' : '⚠️ 要改善（>= 0.5ms）'}`);
        
        // 高負荷テスト
        console.log('\n3️⃣ 高負荷テスト（1秒間）...');
        const stressStart = Date.now();
        let stressCount = 0;
        
        while (Date.now() - stressStart < 1000) {
            compatibilityLog(`Stress test ${stressCount}`);
            stressCount++;
        }
        
        console.log(`\n高負荷時: ${stressCount} logs/sec`);
        console.log('メモリ中のログ数:', logs.length);
        
        console.log('\n✅ すべてのテスト完了\n');
        
    }, 100);
}

// テスト実行
runPerformanceTest();