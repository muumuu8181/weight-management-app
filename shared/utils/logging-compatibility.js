/**
 * ログシステム互換性レイヤー
 * 既存のlog()関数を維持しつつ、UniversalLoggerへの統合を実現
 * 
 * 実装方針：
 * - 既存の1,342箇所のlog()呼び出しは一切変更不要
 * - 内部でUniversalLoggerに転送してログを一元管理
 * - debug.jsの依存も維持（80箇所のlog()使用）
 */

(function() {
    'use strict';
    
    // 元のlog関数を保存
    const originalLog = window.log;
    const originalConsoleLog = console.log;
    
    // 統合ログ関数
    window.log = function(message, ...args) {
        const timestamp = new Date().toLocaleTimeString();
        
        // 1. 従来の動作を完全に維持（console出力）
        originalConsoleLog(`[${timestamp}] ${message}`, ...args);
        
        // 2. DOM出力も従来通り
        const logArea = document.getElementById('logArea');
        if (logArea) {
            const formattedMessage = `[${timestamp}] ${message}<br>`;
            logArea.innerHTML += formattedMessage;
            logArea.scrollTop = logArea.scrollHeight;
        }
        
        // 3. UniversalLoggerが存在する場合は転送
        if (window.UniversalLogger && typeof UniversalLogger.info === 'function') {
            try {
                // メッセージタイプを判定
                let level = 'info';
                if (message.includes('❌') || message.includes('エラー')) {
                    level = 'error';
                } else if (message.includes('⚠️') || message.includes('警告')) {
                    level = 'warn';
                } else if (message.includes('✅') || message.includes('成功')) {
                    level = 'success';
                } else if (message.includes('🔍') || message.includes('デバッグ')) {
                    level = 'debug';
                }
                
                // コンテキストを自動判定
                let context = 'legacy';
                if (message.includes('Firebase') || message.includes('🔥')) {
                    context = 'firebase';
                } else if (message.includes('認証') || message.includes('ログイン')) {
                    context = 'auth';
                } else if (message.includes('タブ')) {
                    context = 'tab';
                }
                
                // UniversalLoggerに転送
                switch(level) {
                    case 'error':
                        UniversalLogger.error(message, args.length > 0 ? args : null, context);
                        break;
                    case 'warn':
                        UniversalLogger.warn(message, args.length > 0 ? args : null, context);
                        break;
                    case 'success':
                        UniversalLogger.success(message, args.length > 0 ? args : null, context);
                        break;
                    case 'debug':
                        UniversalLogger.debug(message, args.length > 0 ? args : null, context);
                        break;
                    default:
                        UniversalLogger.info(message, args.length > 0 ? args : null, context);
                }
                
                // 転送成功をカウント
                window.LoggingCompatibility.stats.logCalls++;
            } catch (e) {
                // エラーハンドリング強化: エラーを記録して監視
                console.error('[LoggingCompatibility] UniversalLogger転送エラー:', e);
                window.LoggingCompatibility.stats.errorCount++;
                window.LoggingCompatibility.stats.lastError = {
                    timestamp: new Date().toISOString(),
                    error: e.message || String(e),
                    message: message,
                    context: context
                };
                
                // エラー率が高い場合は警告
                const errorRate = window.LoggingCompatibility.stats.errorCount / window.LoggingCompatibility.stats.logCalls;
                if (errorRate > 0.01 && window.LoggingCompatibility.stats.logCalls > 100) {
                    console.warn('[LoggingCompatibility] エラー率が1%を超えています:', errorRate);
                }
            }
        }
        
        // 元のlog関数が存在した場合の互換性
        if (originalLog && typeof originalLog === 'function') {
            originalLog(message, ...args);
        }
    };
    
    // console.log/error/warnもラップ（833箇所対応）
    const wrapConsoleMethod = (methodName, logLevel) => {
        const original = console[methodName];
        console[methodName] = function(...args) {
            // オリジナルのconsoleメソッドを呼び出し
            original.apply(console, args);
            
            // UniversalLoggerに転送
            if (window.UniversalLogger && typeof UniversalLogger[logLevel] === 'function') {
                try {
                    const message = args.map(arg => 
                        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                    ).join(' ');
                    
                    UniversalLogger[logLevel](message, args.length > 1 ? args.slice(1) : null, 'console');
                    window.LoggingCompatibility.stats[methodName + 'Calls']++;
                } catch (e) {
                    // エラーハンドリング強化
                    console.error(`[LoggingCompatibility] console.${methodName}転送エラー:`, e);
                    window.LoggingCompatibility.stats.errorCount++;
                }
            }
        };
    };
    
    // console.error, console.warnもラップ
    wrapConsoleMethod('error', 'error');
    wrapConsoleMethod('warn', 'warn');
    
    // 互換性レイヤーの初期化完了を記録
    if (window.log) {
        window.log('✅ ログシステム互換性レイヤー初期化完了');
    }
    
    // グローバルに互換性レイヤーのステータスを公開
    window.LoggingCompatibility = {
        version: '1.1.0',  // エラーハンドリング強化版
        initialized: true,
        originalLog: originalLog,
        stats: {
            logCalls: 0,
            errorCount: 0,
            errorCalls: 0,
            warnCalls: 0,
            lastError: null
        },
        
        // ヘルスチェック機能
        checkHealth() {
            const totalCalls = this.stats.logCalls + this.stats.errorCalls + this.stats.warnCalls;
            const errorRate = totalCalls > 0 ? this.stats.errorCount / totalCalls : 0;
            
            return {
                healthy: this.stats.errorCount === 0,
                totalCalls: totalCalls,
                errorCount: this.stats.errorCount,
                errorRate: errorRate,
                lastError: this.stats.lastError,
                status: errorRate === 0 ? '正常' : 
                        errorRate < 0.01 ? '警告' : '異常'
            };
        },
        
        // 統計リセット機能
        resetStats() {
            this.stats.logCalls = 0;
            this.stats.errorCount = 0;
            this.stats.errorCalls = 0;
            this.stats.warnCalls = 0;
            this.stats.lastError = null;
        }
    };
    
})();