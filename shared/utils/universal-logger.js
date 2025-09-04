// 統一ログ管理システム  
// 全タブのログ処理を標準化・強化

class UniversalLogger {
    
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.logLevel = 'INFO'; // DEBUG, INFO, WARN, ERROR
        this.enableConsole = true;
        this.enableUI = true;
    }
    
    // レベル別ログメソッド
    static debug(message, data = null, context = '') {
        this.writeLog('DEBUG', message, data, context, '🔍');
    }
    
    static info(message, data = null, context = '') {
        this.writeLog('INFO', message, data, context, 'ℹ️');
    }
    
    static warn(message, data = null, context = '') {
        this.writeLog('WARN', message, data, context, '⚠️');
    }
    
    static error(message, data = null, context = '') {
        this.writeLog('ERROR', message, data, context, '❌');
    }
    
    static success(message, data = null, context = '') {
        this.writeLog('SUCCESS', message, data, context, '✅');
    }
    
    // Firebase操作ログ
    static firebase(operation, collection, result, context = '') {
        const message = `Firebase ${operation}: ${collection}${result ? ` (${result})` : ''}`;
        this.writeLog('FIREBASE', message, null, context, '🔥');
    }
    
    // UI操作ログ  
    static ui(action, target, context = '') {
        const message = `UI ${action}: ${target}`;
        this.writeLog('UI', message, null, context, '🎨');
    }
    
    // データ操作ログ
    static data(operation, type, count, context = '') {
        const message = `Data ${operation}: ${type} (${count}件)`;
        this.writeLog('DATA', message, null, context, '📊');
    }
    
    // 内部ログ書き込み
    static writeLog(level, message, data, context, icon) {
        const timestamp = new Date();
        const timeString = timestamp.toLocaleTimeString('ja-JP', { hour12: false });
        
        // ログエントリ作成
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            context,
            icon
        };
        
        // ログ蓄積
        if (!this.logs) this.logs = [];
        this.logs.push(logEntry);
        
        // 最大件数制限
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        
        // コンソール出力
        if (this.enableConsole) {
            const fullMessage = `${icon} [${timeString}] ${context ? `${context}: ` : ''}${message}`;
            
            switch (level) {
                case 'ERROR':
                    console.error(fullMessage, data || '');
                    break;
                case 'WARN':
                    console.warn(fullMessage, data || '');
                    break;
                case 'DEBUG':
                    if (this.logLevel === 'DEBUG') {
                        console.log(fullMessage, data || '');
                    }
                    break;
                default:
                    console.log(fullMessage, data || '');
            }
        }
        
        // UI出力（既存のlog()関数と連携）
        if (this.enableUI && typeof log === 'function') {
            const uiMessage = `${icon} ${context ? `${context}: ` : ''}${message}`;
            log(uiMessage);
        }
    }
    
    // ログフィルタリング
    static getLogs(level = null, context = null, limit = 100) {
        let filtered = this.logs || [];
        
        if (level) {
            filtered = filtered.filter(entry => entry.level === level);
        }
        
        if (context) {
            filtered = filtered.filter(entry => 
                entry.context && entry.context.toLowerCase().includes(context.toLowerCase())
            );
        }
        
        return filtered.slice(-limit);
    }
    
    // ログ統計
    static getLogStats() {
        if (!this.logs || this.logs.length === 0) {
            return { total: 0, byLevel: {}, byContext: {} };
        }
        
        const byLevel = {};
        const byContext = {};
        
        this.logs.forEach(entry => {
            byLevel[entry.level] = (byLevel[entry.level] || 0) + 1;
            if (entry.context) {
                byContext[entry.context] = (byContext[entry.context] || 0) + 1;
            }
        });
        
        return {
            total: this.logs.length,
            byLevel,
            byContext
        };
    }
    
    // ログエクスポート
    static exportLogs(format = 'json') {
        const stats = this.getLogStats();
        const exportData = {
            exportedAt: new Date().toISOString(),
            stats,
            logs: this.logs || []
        };
        
        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        }
        
        if (format === 'csv') {
            const headers = ['timestamp', 'level', 'context', 'message'];
            const rows = this.logs.map(entry => [
                entry.timestamp.toISOString(),
                entry.level,
                entry.context || '',
                entry.message
            ]);
            
            return [headers, ...rows].map(row => 
                row.map(cell => `"${cell}"`).join(',')
            ).join('\n');
        }
        
        return exportData;
    }
    
    // ログクリア
    static clearLogs() {
        this.logs = [];
        console.log('🧹 ログを全てクリアしました');
    }
    
    // 設定
    static setLogLevel(level) {
        this.logLevel = level;
        console.log(`📊 ログレベル設定: ${level}`);
    }
    
    static setConsoleOutput(enabled) {
        this.enableConsole = enabled;
        console.log(`📺 コンソール出力: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    static setUIOutput(enabled) {
        this.enableUI = enabled;
        console.log(`🖥️ UI出力: ${enabled ? 'ON' : 'OFF'}`);
    }
}

// 便利なエイリアス
window.logDebug = UniversalLogger.debug.bind(UniversalLogger);
window.logInfo = UniversalLogger.info.bind(UniversalLogger);  
window.logWarn = UniversalLogger.warn.bind(UniversalLogger);
window.logError = UniversalLogger.error.bind(UniversalLogger);
window.logSuccess = UniversalLogger.success.bind(UniversalLogger);
window.logFirebase = UniversalLogger.firebase.bind(UniversalLogger);
window.logUI = UniversalLogger.ui.bind(UniversalLogger);
window.logData = UniversalLogger.data.bind(UniversalLogger);

// 既存のlog()関数を拡張
const originalLog = window.log;
window.log = function(message, data = null, context = '') {
    // 既存のUI出力
    if (typeof originalLog === 'function') {
        originalLog(message);
    }
    
    // 統一ログシステムにも記録
    UniversalLogger.info(message, data, context);
};

// グローバルに公開
window.UniversalLogger = UniversalLogger;

console.log('📝 統一ログ管理システム読み込み完了');