/**
 * 🎉 Ultimate Celebration Effects System
 * 新記録達成や特別な瞬間を盛大に祝うエフェクト集
 */

class CelebrationEffects {
    constructor() {
        this.activeEffects = new Set();
        this.soundEnabled = true;
        this.vibrationEnabled = true;
        this.lastCelebrationTime = 0;
        this.debounceDelay = 1000; // 1秒間は重複実行を防ぐ
        this.init();
    }

    init() {
        // CSS スタイルを動的に追加
        if (!document.getElementById('celebration-styles')) {
            const style = document.createElement('style');
            style.id = 'celebration-styles';
            style.textContent = this.getCSSStyles();
            document.head.appendChild(style);
        }
        
        // エフェクトコンテナを作成
        if (!document.getElementById('celebration-container')) {
            const container = document.createElement('div');
            container.id = 'celebration-container';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
                overflow: hidden;
            `;
            document.body.appendChild(container);
        }
    }

    // 🎊 メイン祝福エフェクト（全部入り）
    async celebrate(options = {}) {
        const now = Date.now();
        
        // デバウンス: 短時間での重複実行を防ぐ
        if (now - this.lastCelebrationTime < this.debounceDelay) {
            console.log('🎉 Celebration debounced - too frequent calls');
            return;
        }
        
        this.lastCelebrationTime = now;

        const config = {
            type: 'achievement', // achievement, record, milestone, victory
            title: '🎉 新記録達成！',
            message: 'おめでとうございます！',
            color: '#FFD700',
            duration: 5000,
            intensity: 'high', // low, medium, high, extreme
            ...options
        };

        const effectId = now.toString();
        this.activeEffects.add(effectId);

        try {
            console.log(`🎉 Starting celebration effect: ${config.type} - ${config.title}`);
            
            // 複数エフェクトを同時実行
            await Promise.all([
                this.showAchievementPopup(config),
                this.createConfettiExplosion(config),
                this.triggerScreenFlash(config),
                this.playVictorySound(config),
                this.triggerVibration(config)
            ]);
        } finally {
            this.activeEffects.delete(effectId);
            console.log(`🎉 Celebration effect completed: ${effectId}`);
        }
    }

    // 🏆 達成ポップアップ
    async showAchievementPopup(config) {
        // 既存のポップアップを削除
        const existingPopups = document.querySelectorAll('.achievement-popup');
        existingPopups.forEach(popup => popup.remove());

        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${this.getAchievementIcon(config.type)}</div>
                <div class="achievement-title">${config.title}</div>
                <div class="achievement-message">${config.message}</div>
                <div class="achievement-sparkles">✨✨✨</div>
            </div>
        `;

        const container = document.getElementById('celebration-container');
        if (container) {
            container.appendChild(popup);

            // アニメーション開始
            requestAnimationFrame(() => {
                popup.style.animation = `achievementSlideIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
            });

            // 自動削除
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.style.animation = `achievementSlideOut 0.5s ease-in`;
                    setTimeout(() => {
                        if (popup.parentNode) popup.remove();
                    }, 500);
                }
            }, config.duration - 500);
        }
    }

    // 🎊 紙吹雪爆発
    async createConfettiExplosion(config) {
        const colors = this.getConfettiColors(config.type);
        const intensity = this.getIntensityMultiplier(config.intensity);
        
        // 中央から爆発
        this.createConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, colors, intensity * 50);
        
        // サイド爆発
        setTimeout(() => {
            this.createConfettiBurst(100, window.innerHeight / 3, colors, intensity * 30);
            this.createConfettiBurst(window.innerWidth - 100, window.innerHeight / 3, colors, intensity * 30);
        }, 200);

        // 追加爆発（高強度の場合）
        if (config.intensity === 'extreme') {
            setTimeout(() => {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        const x = Math.random() * window.innerWidth;
                        const y = Math.random() * window.innerHeight * 0.6;
                        this.createConfettiBurst(x, y, colors, intensity * 20);
                    }, i * 300);
                }
            }, 500);
        }
    }

    // 🎆 個別紙吹雪バースト
    createConfettiBurst(x, y, colors, count) {
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                pointer-events: none;
            `;

            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const velocity = Math.random() * 300 + 200;
            const gravity = 500;
            const rotation = Math.random() * 360;

            confetti.style.animation = `confettiFly 3s ease-out forwards`;
            confetti.style.setProperty('--angle', angle);
            confetti.style.setProperty('--velocity', velocity);
            confetti.style.setProperty('--rotation', rotation);

            document.getElementById('celebration-container').appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    }

    // ⚡ 画面フラッシュ
    async triggerScreenFlash(config) {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, ${config.color}40, #ffffff60);
            pointer-events: none;
            animation: screenFlash 0.6s ease-out;
        `;

        document.getElementById('celebration-container').appendChild(flash);
        setTimeout(() => flash.remove(), 600);
    }

    // 🔊 勝利サウンド
    async playVictorySound(config) {
        if (!this.soundEnabled) return;

        // Web Audio API を使用したサウンド生成
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const sounds = {
                achievement: () => this.playTrumpetFanfare(audioContext),
                record: () => this.playVictoryChime(audioContext),
                milestone: () => this.playMagicalChime(audioContext),
                victory: () => this.playEpicFanfare(audioContext)
            };

            const soundFunction = sounds[config.type] || sounds.achievement;
            await soundFunction();
        } catch (error) {
            console.warn('Audio playback not supported:', error);
        }
    }

    // 📳 バイブレーション
    async triggerVibration(config) {
        if (!this.vibrationEnabled || !navigator.vibrate) return;

        const patterns = {
            low: [100, 50, 100],
            medium: [200, 100, 200, 100, 200],
            high: [300, 100, 300, 100, 300, 100, 300],
            extreme: [500, 200, 300, 100, 200, 100, 400, 200, 500]
        };

        const pattern = patterns[config.intensity] || patterns.medium;
        navigator.vibrate(pattern);
    }

    // 🎺 トランペットファンファーレ
    playTrumpetFanfare(audioContext) {
        const notes = [
            { freq: 261.63, time: 0, duration: 0.3 }, // C
            { freq: 329.63, time: 0.15, duration: 0.3 }, // E
            { freq: 392.00, time: 0.3, duration: 0.3 }, // G
            { freq: 523.25, time: 0.6, duration: 0.6 } // C high
        ];

        notes.forEach(note => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = note.freq;
                oscillator.type = 'triangle';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.duration);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + note.duration);
            }, note.time * 1000);
        });
    }

    // 🔔 勝利チャイム
    playVictoryChime(audioContext) {
        const chimes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
        
        chimes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.8);
            }, index * 200);
        });
    }

    // ✨ 魔法チャイム
    playMagicalChime(audioContext) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 440 * Math.pow(2, i * 0.25);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
            }, i * 100);
        }
    }

    // 🏁 エピックファンファーレ
    playEpicFanfare(audioContext) {
        // 複雑なメロディー
        const melody = [
            { freq: 261.63, time: 0, duration: 0.2 },
            { freq: 329.63, time: 0.2, duration: 0.2 },
            { freq: 392.00, time: 0.4, duration: 0.2 },
            { freq: 523.25, time: 0.6, duration: 0.4 },
            { freq: 659.25, time: 1.0, duration: 0.4 },
            { freq: 783.99, time: 1.4, duration: 0.6 },
        ];

        melody.forEach(note => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = note.freq;
                oscillator.type = 'sawtooth';
                
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.duration);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + note.duration);
            }, note.time * 1000);
        });
    }

    // ユーティリティメソッド
    getAchievementIcon(type) {
        const icons = {
            achievement: '🏆',
            record: '📈',
            milestone: '🎯',
            victory: '👑'
        };
        return icons[type] || '🎉';
    }

    getConfettiColors(type) {
        const colorSchemes = {
            achievement: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF'],
            record: ['#FF1493', '#00CED1', '#FFD700', '#32CD32', '#FF6347'],
            milestone: ['#9370DB', '#20B2AA', '#FFD700', '#FF69B4', '#00FA9A'],
            victory: ['#FF0000', '#FFD700', '#00FF00', '#0000FF', '#FF00FF']
        };
        return colorSchemes[type] || colorSchemes.achievement;
    }

    getIntensityMultiplier(intensity) {
        const multipliers = { low: 0.5, medium: 1, high: 1.5, extreme: 2.5 };
        return multipliers[intensity] || 1;
    }

    getCSSStyles() {
        return `
            @keyframes achievementSlideIn {
                from {
                    transform: translateY(-100px) scale(0.8);
                    opacity: 0;
                }
                to {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
            }

            @keyframes achievementSlideOut {
                from {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
                to {
                    transform: translateY(-100px) scale(0.8);
                    opacity: 0;
                }
            }

            @keyframes confettiFly {
                from {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: 1;
                }
                to {
                    transform: translate(
                        calc(cos(var(--angle)) * var(--velocity) * 1px), 
                        calc(sin(var(--angle)) * var(--velocity) * 1px + 500px)
                    ) rotate(calc(var(--rotation) * 1deg));
                    opacity: 0;
                }
            }

            @keyframes screenFlash {
                0% { opacity: 0; }
                50% { opacity: 0.8; }
                100% { opacity: 0; }
            }

            @keyframes sparkle {
                0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
                50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
            }

            .achievement-popup {
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: 3px solid #FFD700;
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(255,215,0,0.5);
                text-align: center;
                z-index: 10000;
                pointer-events: none;
            }

            .achievement-content {
                color: white;
            }

            .achievement-icon {
                font-size: 60px;
                margin-bottom: 15px;
                animation: bounce 2s infinite;
            }

            .achievement-title {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }

            .achievement-message {
                font-size: 18px;
                margin-bottom: 15px;
                opacity: 0.9;
            }

            .achievement-sparkles {
                font-size: 20px;
                animation: sparkle 1.5s infinite;
            }

            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }

            .confetti-piece {
                animation: confettiFly 3s ease-out forwards;
            }

            .screen-flash {
                animation: screenFlash 0.6s ease-out;
            }
        `;
    }

    // 設定メソッド
    enableSound(enabled = true) {
        this.soundEnabled = enabled;
    }

    enableVibration(enabled = true) {
        this.vibrationEnabled = enabled;
    }

    // すべてのエフェクトを停止
    stopAllEffects() {
        this.activeEffects.clear();
        const container = document.getElementById('celebration-container');
        if (container) {
            container.innerHTML = '';
        }
    }
}

// グローバルインスタンス作成
window.celebrationEffects = new CelebrationEffects();

// 便利な関数をグローバルに公開
window.celebrate = (options) => window.celebrationEffects.celebrate(options);

// 使用例をコンソールに出力
console.log('🎉 Celebration Effects System loaded!');
console.log('使用例:');
console.log('celebrate({ type: "achievement", title: "🎯 目標達成!", message: "素晴らしい！", intensity: "high" });');
console.log('celebrate({ type: "record", title: "📈 新記録!", message: "過去最高を更新しました！", intensity: "extreme" });');