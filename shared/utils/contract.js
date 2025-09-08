/**
 * 契約プログラミング（Design by Contract）ライブラリ
 * 
 * AIとの共同開発における品質保証のための事前条件・事後条件・不変条件チェック機能
 * 
 * 使用例:
 * Contract.require(userId != null, 'userIdが必要です');
 * Contract.ensure(result.length > 0, '結果が空です');
 * Contract.invariant(this.items.length >= 0, 'アイテム数が負の値');
 */

(function() {
    'use strict';

    // 契約違反のログを保存するための配列
    const violationLog = [];

    // 契約プログラミングのメインオブジェクト
    const Contract = {
        // 開発/本番環境の判定
        isDevelopment: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
        
        // 契約チェックの有効/無効フラグ
        enabled: true,
        
        // 違反時のログ記録を有効化
        logViolations: true,
        
        /**
         * 事前条件のチェック
         * @param {boolean} condition - チェックする条件
         * @param {string} message - 違反時のメッセージ
         * @param {Object} context - デバッグ用の追加情報
         */
        require(condition, message, context = {}) {
            if (!this.enabled) return;
            
            if (!condition) {
                this._handleViolation('precondition', message, context);
            }
        },
        
        /**
         * 事後条件のチェック
         * @param {boolean} condition - チェックする条件
         * @param {string} message - 違反時のメッセージ
         * @param {Object} context - デバッグ用の追加情報
         */
        ensure(condition, message, context = {}) {
            if (!this.enabled) return;
            
            if (!condition) {
                this._handleViolation('postcondition', message, context);
            }
        },
        
        /**
         * 不変条件のチェック
         * @param {boolean} condition - チェックする条件
         * @param {string} message - 違反時のメッセージ
         * @param {Object} context - デバッグ用の追加情報
         */
        invariant(condition, message, context = {}) {
            if (!this.enabled) return;
            
            if (!condition) {
                this._handleViolation('invariant', message, context);
            }
        },
        
        /**
         * DOM要素の存在を保証する特別なヘルパー
         * @param {string} elementId - 要素ID
         * @param {string} customMessage - カスタムエラーメッセージ
         * @returns {HTMLElement} - 見つかった要素
         */
        requireElement(elementId, customMessage) {
            const element = document.getElementById(elementId);
            const message = customMessage || `要素 '${elementId}' が見つかりません`;
            
            this.require(element !== null, message, { elementId });
            
            return element;
        },
        
        /**
         * 型チェックヘルパー
         * @param {any} value - チェックする値
         * @param {string} type - 期待する型
         * @param {string} varName - 変数名
         */
        requireType(value, type, varName) {
            const actualType = typeof value;
            this.require(
                actualType === type,
                `${varName}は${type}型である必要があります（実際: ${actualType}）`,
                { value, expectedType: type, actualType }
            );
        },
        
        /**
         * 配列の検証ヘルパー
         * @param {any} value - チェックする値
         * @param {string} varName - 変数名
         * @param {boolean} allowEmpty - 空配列を許可するか
         */
        requireArray(value, varName, allowEmpty = false) {
            this.require(
                Array.isArray(value),
                `${varName}は配列である必要があります`,
                { value, type: typeof value }
            );
            
            if (!allowEmpty) {
                this.require(
                    value.length > 0,
                    `${varName}は空であってはいけません`,
                    { length: value.length }
                );
            }
        },
        
        /**
         * 違反処理の共通ロジック
         * @private
         */
        _handleViolation(type, message, context) {
            const violation = {
                type,
                message,
                context,
                timestamp: new Date().toISOString(),
                stack: new Error().stack
            };
            
            // ログ記録
            if (this.logViolations) {
                violationLog.push(violation);
                console.error(`[Contract ${type}] ${message}`, context);
            }
            
            // 開発環境では例外を投げる
            if (this.isDevelopment) {
                const error = new Error(`契約違反 [${type}]: ${message}`);
                error.contractViolation = violation;
                throw error;
            } else {
                // 本番環境ではuniversal-loggerがあれば使用
                if (window.universalLogger && typeof window.universalLogger.error === 'function') {
                    window.universalLogger.error('CONTRACT_VIOLATION', violation);
                }
            }
        },
        
        /**
         * 違反ログの取得
         * @returns {Array} 違反ログの配列
         */
        getViolationLog() {
            return [...violationLog];
        },
        
        /**
         * 違反ログのクリア
         */
        clearViolationLog() {
            violationLog.length = 0;
        },
        
        /**
         * 契約チェックの一時無効化（パフォーマンスが重要な場合）
         * @param {Function} fn - 実行する関数
         * @returns {any} 関数の戻り値
         */
        withoutChecks(fn) {
            const wasEnabled = this.enabled;
            this.enabled = false;
            try {
                return fn();
            } finally {
                this.enabled = wasEnabled;
            }
        }
    };
    
    // グローバルに公開
    window.Contract = Contract;
    
    // デバッグ用：コンソールから契約を無効化できるようにする
    if (Contract.isDevelopment) {
        console.log('契約プログラミングライブラリが読み込まれました。');
        console.log('Contract.enabled = false で無効化できます。');
    }
    
})();