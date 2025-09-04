// 統一エラーハンドリング・ログ管理システム
// 全タブのエラー処理とログを標準化

class UniversalErrorHandler {
    
    constructor() {
        this.errorLog = [];
        this.logLevel = 'INFO'; // DEBUG, INFO, WARN, ERROR
        this.maxLogEntries = 1000;
    }
    
    // 統一エラーハンドリング
    static async handleAsync(operation, context = '', fallback = null) {
        try {
            if (typeof operation === 'function') {
                return await operation();
            }
            return operation;
            
        } catch (error) {
            this.logError(error, context);
            
            if (typeof fallback === 'function') {
                try {
                    return await fallback();
                } catch (fallbackError) {
                    this.logError(fallbackError, `${context} (fallback)`);
                    return null;
                }
            }
            
            return fallback;
        }
    }
    
    // 同期処理用エラーハンドリング
    static handle(operation, context = '', fallback = null) {
        try {
            if (typeof operation === 'function') {
                return operation();
            }
            return operation;
            
        } catch (error) {
            this.logError(error, context);
            
            if (typeof fallback === 'function') {
                try {
                    return fallback();
                } catch (fallbackError) {
                    this.logError(fallbackError, `${context} (fallback)`);
                    return null;
                }
            }
            
            return fallback;
        }
    }
    
    // Firebase操作用エラーハンドリング
    static async handleFirebase(operation, operationType, collection, context = '') {
        try {
            const result = await operation();
            this.logSuccess(operationType, collection, context);
            return result;
            
        } catch (error) {
            this.logFirebaseError(error, operationType, collection, context);
            
            // Firebase特有のエラー対処
            if (error.code === 'permission-denied') {
                this.logError('Firebase権限エラー: ログインを確認してください', context);
                return { error: 'auth_required' };
            }
            
            if (error.code === 'network-request-failed') {
                this.logError('ネットワークエラー: 接続を確認してください', context);
                return { error: 'network_failed' };
            }
            
            return { error: error.message };
        }
    }
    
    // エラーログ記録
    static logError(error, context = '') {
        const timestamp = new Date().toISOString();
        const errorEntry = {
            timestamp,
            level: 'ERROR',
            message: error.message || error,
            context,
            stack: error.stack || '',
            userAgent: navigator.userAgent || '',
            url: window.location.href || ''
        };
        
        console.error(`❌ [${timestamp}] ${context}: ${errorEntry.message}`);
        
        // shared/utils/logging.js のlog()関数も使用
        if (typeof log === 'function') {
            log(`❌ ${context}エラー: ${errorEntry.message}`);
        }
        
        // エラーログ蓄積
        if (!this.errorLog) this.errorLog = [];
        this.errorLog.push(errorEntry);
        
        // 最大件数制限
        if (this.errorLog.length > this.maxLogEntries) {
            this.errorLog = this.errorLog.slice(-this.maxLogEntries);
        }
    }
    
    // 成功ログ記録
    static logSuccess(operation, target, context = '') {
        const message = `✅ ${operation}成功${target ? `: ${target}` : ''}${context ? ` (${context})` : ''}`;
        console.log(message);
        
        if (typeof log === 'function') {
            log(message);
        }
    }
    
    // Firebase専用エラーログ
    static logFirebaseError(error, operation, collection, context = '') {
        const message = `❌ Firebase ${operation}エラー [${collection}]: ${error.message}${context ? ` (${context})` : ''}`;
        console.error(message);
        
        if (typeof log === 'function') {
            log(message);
        }
    }
    
    // 警告ログ
    static logWarning(message, context = '') {
        const fullMessage = `⚠️ ${context ? `${context}: ` : ''}${message}`;
        console.warn(fullMessage);
        
        if (typeof log === 'function') {
            log(fullMessage);
        }
    }
    
    // 情報ログ
    static logInfo(message, context = '') {
        const fullMessage = `ℹ️ ${context ? `${context}: ` : ''}${message}`;
        console.log(fullMessage);
        
        if (typeof log === 'function') {
            log(fullMessage);
        }
    }
    
    // デバッグログ
    static logDebug(message, data = null, context = '') {
        if (this.logLevel === 'DEBUG') {
            const fullMessage = `🔍 ${context ? `${context}: ` : ''}${message}`;
            console.log(fullMessage);
            
            if (data) {
                console.log('📊 Debug data:', data);
            }
            
            if (typeof log === 'function') {
                log(fullMessage);
            }
        }
    }
    
    // ユーザー向けエラー表示
    static showUserError(message, type = 'error', duration = 5000) {
        // UI上にエラーメッセージを表示
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            ${type === 'error' ? 'background: #dc3545; color: white;' : ''}
            ${type === 'warning' ? 'background: #ffc107; color: #212529;' : ''}
            ${type === 'success' ? 'background: #28a745; color: white;' : ''}
            ${type === 'info' ? 'background: #17a2b8; color: white;' : ''}
        `;
        
        alertDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: transparent; border: none; color: inherit; cursor: pointer; font-size: 16px; margin-left: 10px;">×</button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 自動削除
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    }
    
    // エラー統計取得
    static getErrorStats() {
        if (!this.errorLog || this.errorLog.length === 0) {
            return { total: 0, recent: 0, types: {} };
        }
        
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const recent = this.errorLog.filter(entry => new Date(entry.timestamp) > oneDayAgo);
        
        const types = {};
        this.errorLog.forEach(entry => {
            const context = entry.context || 'unknown';
            types[context] = (types[context] || 0) + 1;
        });
        
        return {
            total: this.errorLog.length,
            recent: recent.length,
            types
        };
    }
    
    // エラーレポート生成
    static generateErrorReport() {
        const stats = this.getErrorStats();
        const report = {
            timestamp: new Date().toISOString(),
            summary: stats,
            recentErrors: this.errorLog.slice(-10), // 最新10件
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.log('📊 エラーレポート:', report);
        return report;
    }
    
    // エラーログクリア
    static clearErrorLog() {
        this.errorLog = [];
        console.log('🧹 エラーログをクリアしました');
    }
}

// ログレベル設定
UniversalErrorHandler.setLogLevel = (level) => {
    UniversalErrorHandler.logLevel = level;
    console.log(`📊 ログレベル設定: ${level}`);
};

// 便利なエイリアス関数
window.handleAsync = UniversalErrorHandler.handleAsync.bind(UniversalErrorHandler);
window.handle = UniversalErrorHandler.handle.bind(UniversalErrorHandler);
window.handleFirebase = UniversalErrorHandler.handleFirebase.bind(UniversalErrorHandler);
window.logError = UniversalErrorHandler.logError.bind(UniversalErrorHandler);
window.logSuccess = UniversalErrorHandler.logSuccess.bind(UniversalErrorHandler);
window.logWarning = UniversalErrorHandler.logWarning.bind(UniversalErrorHandler);
window.logInfo = UniversalErrorHandler.logInfo.bind(UniversalErrorHandler);
window.showUserError = UniversalErrorHandler.showUserError.bind(UniversalErrorHandler);

// グローバルに公開
window.UniversalErrorHandler = UniversalErrorHandler;

// 未処理エラーキャッチ
window.addEventListener('error', (event) => {
    UniversalErrorHandler.logError(event.error, 'Global Error');
});

window.addEventListener('unhandledrejection', (event) => {
    UniversalErrorHandler.logError(event.reason, 'Unhandled Promise Rejection');
});

console.log('🛡️ 統一エラーハンドリングシステム読み込み完了');