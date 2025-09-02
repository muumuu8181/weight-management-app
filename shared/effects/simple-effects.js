/**
 * 🎉 Simple Effects System
 * 記録完了時の軽量エフェクトシステム
 */

class SimpleEffects {
    constructor() {
        this.init();
    }

    init() {
        // CSS スタイルを動的に追加
        if (!document.getElementById('simple-effects-styles')) {
            const style = document.createElement('style');
            style.id = 'simple-effects-styles';
            style.textContent = this.getCSSStyles();
            document.head.appendChild(style);
        }
    }

    getCSSStyles() {
        return `
            /* 記録成功エフェクト */
            .record-success {
                position: relative;
                animation: successPulse 0.8s ease-out;
            }

            @keyframes successPulse {
                0% {
                    transform: scale(1);
                    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 0 0 8px rgba(40, 167, 69, 0.3);
                }
                100% {
                    transform: scale(1);
                    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
                }
            }

            /* キラキラエフェクト */
            .sparkle-container {
                position: absolute;
                pointer-events: none;
                z-index: 1000;
            }

            .sparkle {
                position: absolute;
                width: 8px;
                height: 8px;
                background: #ffd700;
                border-radius: 50%;
                animation: sparkleFloat 1s ease-out forwards;
            }

            @keyframes sparkleFloat {
                0% {
                    opacity: 1;
                    transform: translate(0, 0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(var(--end-x), var(--end-y)) scale(0);
                }
            }

            /* 成功テキスト */
            .success-text {
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(40, 167, 69, 0.9);
                color: white;
                padding: 4px 12px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: bold;
                z-index: 1001;
                animation: successTextFloat 1.5s ease-out forwards;
                pointer-events: none;
            }

            @keyframes successTextFloat {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(10px);
                }
                20% {
                    opacity: 1;
                }
                80% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(-10px);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }

            /* タブ別カラーバリエーション */
            .record-success.tab-weight {
                animation: successPulseBlue 0.8s ease-out;
            }

            @keyframes successPulseBlue {
                0% {
                    transform: scale(1);
                    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 0 0 8px rgba(0, 123, 255, 0.3);
                }
                100% {
                    transform: scale(1);
                    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
                }
            }

            .record-success.tab-sleep {
                animation: successPulsePurple 0.8s ease-out;
            }

            @keyframes successPulsePurple {
                0% {
                    transform: scale(1);
                    box-shadow: 0 0 0 0 rgba(108, 117, 125, 0.7);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 0 0 8px rgba(108, 117, 125, 0.3);
                }
                100% {
                    transform: scale(1);
                    box-shadow: 0 0 0 0 rgba(108, 117, 125, 0);
                }
            }
        `;
    }

    /**
     * 記録完了時のメインエフェクト
     * @param {HTMLElement} buttonElement - エフェクトを適用するボタン要素
     * @param {Object} options - オプション設定
     */
    recordSaved(buttonElement, options = {}) {
        if (!buttonElement) {
            console.log('⚠️ SimpleEffects: ボタン要素が見つかりません');
            return;
        }

        const {
            tabType = 'weight',
            message = '記録完了！',
            sparkleCount = 6
        } = options;

        console.log(`✨ SimpleEffects: ${tabType}タブで記録完了エフェクト実行`);

        // 1. ボタンパルスエフェクト
        this.addSuccessPulse(buttonElement, tabType);

        // 2. キラキラエフェクト
        this.addSparkleEffect(buttonElement, sparkleCount);

        // 3. 成功メッセージ
        this.addSuccessText(buttonElement, message);
    }

    /**
     * ボタンパルスエフェクトを追加
     */
    addSuccessPulse(buttonElement, tabType) {
        const className = `record-success tab-${tabType}`;
        buttonElement.classList.add('record-success', `tab-${tabType}`);
        
        setTimeout(() => {
            buttonElement.classList.remove('record-success', `tab-${tabType}`);
        }, 800);
    }

    /**
     * キラキラエフェクトを追加
     */
    addSparkleEffect(buttonElement, count) {
        const rect = buttonElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            
            // ランダムな方向と距離
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const distance = 30 + Math.random() * 20;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            sparkle.style.cssText = `
                left: ${centerX}px;
                top: ${centerY}px;
                --end-x: ${endX}px;
                --end-y: ${endY}px;
                animation-delay: ${Math.random() * 0.2}s;
            `;
            
            document.body.appendChild(sparkle);
            
            // 1秒後に削除
            setTimeout(() => {
                sparkle.remove();
            }, 1200);
        }
    }

    /**
     * 成功メッセージを追加
     */
    addSuccessText(buttonElement, message) {
        const textElement = document.createElement('div');
        textElement.className = 'success-text';
        textElement.textContent = message;
        
        // ボタンに相対配置
        buttonElement.style.position = 'relative';
        buttonElement.appendChild(textElement);
        
        // 1.5秒後に削除
        setTimeout(() => {
            textElement.remove();
        }, 1500);
    }

    /**
     * 軽量版エフェクト（パフォーマンス重視）
     */
    recordSavedLight(buttonElement, tabType = 'weight') {
        if (!buttonElement) return;
        
        console.log(`💫 SimpleEffects: ${tabType}タブで軽量エフェクト実行`);
        this.addSuccessPulse(buttonElement, tabType);
    }
}

// グローバルインスタンス作成
window.simpleEffects = new SimpleEffects();

console.log('🎉 Simple Effects System initialized');