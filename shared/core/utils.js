/**
 * 汎用ユーティリティ関数
 * アプリケーション全体で使用される便利な関数群
 */

/**
 * ログ出力機能
 * コンソールとUIの両方にメッセージを表示
 * @param {string} message - ログメッセージ
 * @param {string} level - ログレベル（info, warn, error）
 */
function log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    
    // コンソール出力
    switch (level) {
        case 'warn':
            console.warn(logMessage);
            break;
        case 'error':
            console.error(logMessage);
            break;
        default:
            console.log(logMessage);
    }
    
    // UI表示
    const logArea = document.getElementById('logArea');
    if (logArea) {
        const logClass = level !== 'info' ? ` class="log-${level}"` : '';
        logArea.innerHTML += `<div${logClass}>${message}</div>`;
        logArea.scrollTop = logArea.scrollHeight;
    }
}

/**
 * 日付を文字列に変換
 * @param {Date} date - 変換する日付
 * @param {string} format - フォーマット形式（'YYYY-MM-DD', 'MM/DD', 'full'）
 * @returns {string} フォーマットされた日付文字列
 */
function formatDate(date = new Date(), format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    switch (format) {
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'MM/DD':
            return `${month}/${day}`;
        case 'full':
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        case 'time':
            return `${hours}:${minutes}`;
        default:
            return date.toLocaleDateString('ja-JP');
    }
}

/**
 * 時間を文字列に変換
 * @param {Date} date - 変換する日付時刻
 * @returns {string} HH:MM形式の時刻文字列
 */
function formatTime(date = new Date()) {
    return date.toTimeString().slice(0, 5);
}

/**
 * 要素の表示/非表示を切り替え
 * @param {string|HTMLElement} element - 要素のIDまたは要素オブジェクト
 * @param {boolean} show - 表示するかどうか
 */
function toggleElement(element, show) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
        if (show) {
            el.classList.remove('hidden');
            el.style.display = '';
        } else {
            el.classList.add('hidden');
            el.style.display = 'none';
        }
    }
}

/**
 * 配列をCSV形式に変換
 * @param {Array} data - 変換するデータ配列
 * @param {Array} headers - ヘッダー配列
 * @returns {string} CSV文字列
 */
function arrayToCSV(data, headers = []) {
    const csvHeaders = headers.length > 0 ? headers.join(',') + '\n' : '';
    const csvData = data.map(row => {
        if (Array.isArray(row)) {
            return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
        } else if (typeof row === 'object') {
            return Object.values(row).map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
        }
        return `"${String(row).replace(/"/g, '""')}"`;
    }).join('\n');
    
    return csvHeaders + csvData;
}

/**
 * クリップボードにテキストをコピー
 * @param {string} text - コピーするテキスト
 * @param {string} successMessage - 成功メッセージ
 */
async function copyToClipboard(text, successMessage = 'クリップボードにコピーしました') {
    try {
        await navigator.clipboard.writeText(text);
        log(successMessage);
        return true;
    } catch (error) {
        log(`❌ コピーに失敗: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 数値を範囲内に制限
 * @param {number} value - 制限する値
 * @param {number} min - 最小値
 * @param {number} max - 最大値
 * @returns {number} 制限された値
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * ランダムな文字列を生成
 * @param {number} length - 文字列の長さ
 * @returns {string} ランダム文字列
 */
function generateRandomString(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * デバウンス関数（連続実行を制限）
 * @param {Function} func - 実行する関数
 * @param {number} delay - 遅延時間（ミリ秒）
 * @returns {Function} デバウンスされた関数
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * オブジェクトのディープコピー
 * @param {any} obj - コピーするオブジェクト
 * @returns {any} コピーされたオブジェクト
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
    return obj;
}

// グローバルエクスポート
window.log = log;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.toggleElement = toggleElement;
window.arrayToCSV = arrayToCSV;
window.copyToClipboard = copyToClipboard;
window.clamp = clamp;
window.generateRandomString = generateRandomString;
window.debounce = debounce;
window.deepClone = deepClone;