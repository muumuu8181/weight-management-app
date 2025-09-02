/**
 * 🎯 Smart Effects Manager
 * JSON設定ベースの統合エフェクトシステム
 */

class SmartEffectsManager {
    constructor() {
        this.config = null;
        this.isLoaded = false;
        this.debugMode = false;
        this.init();
    }

    async init() {
        try {
            await this.loadConfig();
            this.debugMode = this.config?.settings?.debugMode || false;
            this.createDynamicCSS();
            this.log('🎯 Smart Effects Manager 初期化完了');
            this.isLoaded = true;
        } catch (error) {
            console.error('❌ Smart Effects Manager 初期化エラー:', error);
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('shared/effects/smart-effects-config.json');
            if (!response.ok) {
                throw new Error(`設定ファイル読み込みエラー: ${response.status}`);
            }
            this.config = await response.json();
            this.log(`✅ 設定ファイル読み込み完了 v${this.config.systemInfo.version}`);
        } catch (error) {
            console.error('❌ 設定ファイル読み込み失敗:', error);
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            effectLevels: {
                level1: { color: '#28a745', sparkleCount: 3, message: '完了！', duration: 600 },
                level2: { color: '#007bff', sparkleCount: 6, message: '記録完了！', duration: 800 }
            },
            tabMappings: {
                weight: { save: 'level2', edit: 'level1' }
            },
            settings: { globalDisable: false, debugMode: true }
        };
    }

    createDynamicCSS() {
        if (!this.config?.effectLevels) return;

        let css = '/* Smart Effects Dynamic CSS */\n';
        
        Object.entries(this.config.effectLevels).forEach(([levelKey, level]) => {
            const intensity = level.pulseIntensity || 'normal';
            const color = level.color;
            
            css += `
                .smart-effect-${levelKey} {
                    animation: smartPulse${levelKey} ${level.duration}ms ease-out;
                }
                
                @keyframes smartPulse${levelKey} {
                    0% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 ${color}70;
                    }
                    50% {
                        transform: scale(${intensity === 'light' ? 1.02 : intensity === 'strong' ? 1.08 : intensity === 'epic' ? 1.12 : 1.05});
                        box-shadow: 0 0 0 ${intensity === 'light' ? 4 : intensity === 'strong' ? 12 : intensity === 'epic' ? 16 : 8}px ${color}30;
                    }
                    100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 ${color}00;
                    }
                }
            `;
        });

        // 成功メッセージのCSS
        css += `
            .smart-success-message {
                position: absolute;
                top: -35px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(40, 167, 69, 0.9);
                color: white;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: bold;
                z-index: 1001;
                animation: smartMessageFloat 1.5s ease-out forwards;
                pointer-events: none;
                white-space: nowrap;
            }

            @keyframes smartMessageFloat {
                0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
                20% { opacity: 1; }
                80% { opacity: 1; transform: translateX(-50%) translateY(-10px); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-25px); }
            }

            .smart-sparkle {
                position: absolute;
                width: 8px;
                height: 8px;
                background: #ffd700;
                border-radius: 50%;
                animation: smartSparkleFloat 1.2s ease-out forwards;
                pointer-events: none;
            }

            @keyframes smartSparkleFloat {
                0% { opacity: 1; transform: translate(0, 0) scale(1); }
                100% { opacity: 0; transform: translate(var(--end-x), var(--end-y)) scale(0); }
            }
        `;

        // CSSを動的に追加
        if (!document.getElementById('smart-effects-dynamic-css')) {
            const style = document.createElement('style');
            style.id = 'smart-effects-dynamic-css';
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    /**
     * メインエフェクトトリガー
     * @param {string} tabName - タブ名 (weight, sleep, etc.)
     * @param {string} actionName - アクション名 (save, edit, etc.)
     * @param {HTMLElement} buttonElement - ボタン要素
     * @param {Object} options - オプション設定
     */
    trigger(tabName, actionName, buttonElement, options = {}) {
        if (!this.isLoaded) {
            this.log('⚠️ まだ初期化中です。少し待ってから実行してください。');
            return;
        }

        if (this.config?.settings?.globalDisable) {
            this.log('🔇 エフェクトシステムは無効になっています');
            return;
        }

        if (!buttonElement) {
            this.log(`⚠️ ボタン要素が見つかりません: ${tabName}.${actionName}`);
            return;
        }

        const levelKey = this.config?.tabMappings?.[tabName]?.[actionName];
        if (!levelKey) {
            this.log(`⚠️ マッピングが見つかりません: ${tabName}.${actionName}`);
            return;
        }

        const effectConfig = this.config.effectLevels[levelKey];
        if (!effectConfig) {
            this.log(`⚠️ エフェクト設定が見つかりません: ${levelKey}`);
            return;
        }

        this.log(`✨ エフェクト実行: ${tabName}.${actionName} → ${levelKey} (${effectConfig.name})`);

        // エフェクト実行
        this.executeEffect(buttonElement, effectConfig, levelKey, options);
    }

    executeEffect(buttonElement, effectConfig, levelKey, options) {
        const {
            customMessage = effectConfig.message,
            customSparkles = effectConfig.sparkleCount
        } = options;

        // 1. ボタンパルスエフェクト
        this.addPulseEffect(buttonElement, levelKey, effectConfig.duration);

        // 2. キラキラエフェクト
        this.addSparkleEffect(buttonElement, customSparkles, effectConfig.color);

        // 3. 成功メッセージ
        this.addSuccessMessage(buttonElement, customMessage, effectConfig.color);
    }

    addPulseEffect(buttonElement, levelKey, duration) {
        const className = `smart-effect-${levelKey}`;
        buttonElement.classList.add(className);
        
        setTimeout(() => {
            buttonElement.classList.remove(className);
        }, duration);
    }

    addSparkleEffect(buttonElement, count, color) {
        const rect = buttonElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'smart-sparkle';
            sparkle.style.background = color;
            
            // ランダムな方向と距離
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const distance = 25 + Math.random() * 20;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            sparkle.style.cssText += `
                left: ${centerX}px;
                top: ${centerY}px;
                --end-x: ${endX}px;
                --end-y: ${endY}px;
                animation-delay: ${Math.random() * 0.3}s;
                background: ${color};
            `;
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 1400);
        }
    }

    addSuccessMessage(buttonElement, message, color) {
        const messageElement = document.createElement('div');
        messageElement.className = 'smart-success-message';
        messageElement.textContent = message;
        messageElement.style.background = `${color}E6`; // 90% opacity
        
        // ボタンに相対配置
        buttonElement.style.position = 'relative';
        buttonElement.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.remove();
        }, 1500);
    }

    /**
     * 自動適用 - ボタンセレクターから自動検出
     * @param {string} tabName - タブ名
     * @param {string} actionName - アクション名  
     * @param {Object} options - オプション
     */
    auto(tabName, actionName, options = {}) {
        if (!this.config?.buttonSelectors?.[tabName]?.[actionName]) {
            this.log(`⚠️ 自動セレクターが見つかりません: ${tabName}.${actionName}`);
            return;
        }

        const selector = this.config.buttonSelectors[tabName][actionName];
        const buttonElement = document.querySelector(selector);
        
        if (buttonElement) {
            this.trigger(tabName, actionName, buttonElement, options);
        } else {
            this.log(`⚠️ ボタンが見つかりません: ${selector}`);
        }
    }

    /**
     * 軽量モード - 設定無視でシンプルエフェクトのみ
     */
    quick(buttonElement, level = 'level1') {
        if (!buttonElement || !this.config?.effectLevels?.[level]) return;
        
        const config = this.config.effectLevels[level];
        buttonElement.classList.add(`smart-effect-${level}`);
        
        setTimeout(() => {
            buttonElement.classList.remove(`smart-effect-${level}`);
        }, config.duration);
    }

    log(message) {
        if (this.debugMode) {
            console.log(`🎯 SmartEffects: ${message}`);
        }
    }

    // 設定の動的変更
    updateConfig(updates) {
        if (this.config) {
            Object.assign(this.config, updates);
            this.log('⚙️ 設定を更新しました');
        }
    }

    // 統計情報取得
    getStats() {
        if (!this.config) return null;
        
        return {
            totalLevels: Object.keys(this.config.effectLevels).length,
            totalTabs: Object.keys(this.config.tabMappings).length,
            enabledTabs: this.config.settings.enabledTabs?.length || 0,
            version: this.config.systemInfo.version
        };
    }
}

// グローバルインスタンス作成
window.smartEffects = new SmartEffectsManager();

console.log('🎯 Smart Effects Manager 読み込み完了');