/**
 * 🌟 Ultimate Effects Collection
 * 根本的に異なる演出パターンの完全版
 */

class UltimateEffects {
    constructor() {
        this.activeEffects = new Set();
        this.init();
    }

    init() {
        // CSS を動的追加
        const style = document.createElement('style');
        style.textContent = this.getAllStyles();
        document.head.appendChild(style);
        
        // コンテナ作成
        if (!document.getElementById('ultimate-effects-container')) {
            const container = document.createElement('div');
            container.id = 'ultimate-effects-container';
            container.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none; z-index: 99999; overflow: hidden;
            `;
            document.body.appendChild(container);
        }
    }

    // 🌧️ Matrix デジタルレイン
    async matrixRain(duration = 5000) {
        const container = document.getElementById('ultimate-effects-container');
        const columns = Math.floor(window.innerWidth / 20);
        
        for (let i = 0; i < columns; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';
            column.style.cssText = `
                position: absolute;
                left: ${i * 20}px;
                top: -100px;
                width: 20px;
                height: 100px;
                color: #00ff00;
                font-family: monospace;
                font-size: 14px;
                white-space: pre;
                animation: matrixFall ${Math.random() * 3 + 2}s linear infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            
            // ランダムな文字を生成
            let text = '';
            for (let j = 0; j < 5; j++) {
                text += String.fromCharCode(0x30A0 + Math.random() * 96) + '\n';
            }
            column.textContent = text;
            
            container.appendChild(column);
        }
        
        setTimeout(() => {
            container.querySelectorAll('.matrix-column').forEach(col => col.remove());
        }, duration);
    }

    // 🔥 炎と爆発エフェクト
    async fireExplosion(x = window.innerWidth/2, y = window.innerHeight/2) {
        const container = document.getElementById('ultimate-effects-container');
        
        // メイン爆発
        const explosion = document.createElement('div');
        explosion.className = 'fire-explosion';
        explosion.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 200px;
            height: 200px;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, #ff4444 0%, #ff8800 30%, #ffaa00 60%, transparent 100%);
            border-radius: 50%;
            animation: fireExplode 2s ease-out;
        `;
        container.appendChild(explosion);
        
        // 火花
        for (let i = 0; i < 20; i++) {
            const spark = document.createElement('div');
            spark.className = 'fire-spark';
            const angle = (Math.PI * 2 * i) / 20;
            const distance = Math.random() * 300 + 100;
            
            spark.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: #ffff00;
                border-radius: 50%;
                animation: sparkFly 1.5s ease-out;
                --spark-x: ${Math.cos(angle) * distance}px;
                --spark-y: ${Math.sin(angle) * distance}px;
            `;
            container.appendChild(spark);
        }
        
        setTimeout(() => {
            explosion.remove();
            container.querySelectorAll('.fire-spark').forEach(s => s.remove());
        }, 2000);
    }

    // 🌊 水の波紋エフェクト
    async waterRipples(clickX = window.innerWidth/2, clickY = window.innerHeight/2) {
        const container = document.getElementById('ultimate-effects-container');
        
        // 複数の波紋を作成
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const ripple = document.createElement('div');
                ripple.className = 'water-ripple';
                ripple.style.cssText = `
                    position: absolute;
                    left: ${clickX}px;
                    top: ${clickY}px;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(0, 150, 255, 0.6);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    animation: rippleExpand 2s ease-out;
                `;
                container.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 2000);
            }, i * 200);
        }
    }

    // ⚡ 稲妻・電気エフェクト
    async lightningStrike() {
        const container = document.getElementById('ultimate-effects-container');
        
        // 稲妻の軌道を作成
        const lightning = document.createElement('div');
        lightning.className = 'lightning-bolt';
        
        // ジグザグのパスを作成
        let path = `M${Math.random() * window.innerWidth},0 `;
        let currentX = Math.random() * window.innerWidth;
        let currentY = 0;
        
        for (let i = 0; i < 10; i++) {
            currentX += (Math.random() - 0.5) * 100;
            currentY += window.innerHeight / 10;
            path += `L${currentX},${currentY} `;
        }
        
        lightning.innerHTML = `
            <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
                <path d="${path}" 
                      stroke="#ffffff" 
                      stroke-width="3" 
                      fill="none" 
                      filter="drop-shadow(0 0 10px #00ffff)"
                      style="animation: lightningFlash 0.5s ease-out;" />
            </svg>
        `;
        
        container.appendChild(lightning);
        
        // 画面全体を一瞬白くする
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: white; animation: lightningWhiteFlash 0.2s ease-out;
        `;
        container.appendChild(flash);
        
        setTimeout(() => {
            lightning.remove();
            flash.remove();
        }, 1000);
    }

    // ❄️ 雪と氷のエフェクト
    async snowStorm(duration = 4000) {
        const container = document.getElementById('ultimate-effects-container');
        const snowflakeCount = 100;
        
        for (let i = 0; i < snowflakeCount; i++) {
            setTimeout(() => {
                const snowflake = document.createElement('div');
                snowflake.className = 'snowflake';
                snowflake.textContent = ['❄️', '❅', '❆'][Math.floor(Math.random() * 3)];
                snowflake.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * window.innerWidth}px;
                    top: -20px;
                    font-size: ${Math.random() * 20 + 10}px;
                    color: rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2});
                    animation: snowFall ${Math.random() * 3 + 2}s linear;
                    --wind: ${(Math.random() - 0.5) * 100}px;
                `;
                container.appendChild(snowflake);
                
                setTimeout(() => snowflake.remove(), 5000);
            }, Math.random() * 2000);
        }
    }

    // 🌌 宇宙・コスミックエフェクト
    async cosmicExplosion() {
        const container = document.getElementById('ultimate-effects-container');
        
        // 星の爆発
        const center = document.createElement('div');
        center.className = 'cosmic-center';
        center.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            width: 100px;
            height: 100px;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, #ffffff 0%, #ffff00 20%, #ff6600 40%, #cc00ff 70%, transparent 100%);
            border-radius: 50%;
            animation: cosmicPulse 2s ease-out;
        `;
        container.appendChild(center);
        
        // 星屑
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'cosmic-star';
            const angle = (Math.PI * 2 * i) / 50;
            const distance = Math.random() * 400 + 100;
            
            star.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                width: 3px;
                height: 3px;
                background: white;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: starExplode 3s ease-out;
                --star-x: ${Math.cos(angle) * distance}px;
                --star-y: ${Math.sin(angle) * distance}px;
                box-shadow: 0 0 10px white;
            `;
            container.appendChild(star);
        }
        
        setTimeout(() => {
            center.remove();
            container.querySelectorAll('.cosmic-star').forEach(s => s.remove());
        }, 3000);
    }

    // 🌈 レトロ80年代ネオンエフェクト
    async neon80sBlast() {
        const container = document.getElementById('ultimate-effects-container');
        
        // ネオングリッド背景
        const grid = document.createElement('div');
        grid.className = 'neon-grid';
        grid.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(cyan 1px, transparent 1px),
                linear-gradient(90deg, cyan 1px, transparent 1px);
            background-size: 50px 50px;
            animation: neonGridPulse 2s ease-in-out;
            opacity: 0.3;
        `;
        container.appendChild(grid);
        
        // ネオンテキスト
        const neonText = document.createElement('div');
        neonText.className = 'neon-text';
        neonText.textContent = 'ACHIEVEMENT UNLOCKED';
        neonText.style.cssText = `
            position: absolute;
            left: 50%;
            top: 40%;
            transform: translate(-50%, -50%);
            font-family: 'Courier New', monospace;
            font-size: 36px;
            font-weight: bold;
            color: #ff00ff;
            text-shadow: 
                0 0 5px #ff00ff,
                0 0 10px #ff00ff,
                0 0 15px #ff00ff,
                0 0 20px #ff00ff;
            animation: neonFlicker 3s ease-in-out;
        `;
        container.appendChild(neonText);
        
        setTimeout(() => {
            grid.remove();
            neonText.remove();
        }, 4000);
    }

    // 🌪️ 竜巻・ワールプールエフェクト
    async tornadoWhirl() {
        const container = document.getElementById('ultimate-effects-container');
        
        // 渦の中心
        const vortex = document.createElement('div');
        vortex.className = 'tornado-vortex';
        vortex.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            width: 300px;
            height: 300px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: conic-gradient(from 0deg, transparent, #00ffff, transparent);
            animation: tornadoSpin 3s ease-out;
        `;
        container.appendChild(vortex);
        
        // 渦に巻き込まれるパーティクル
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'tornado-particle';
            const radius = Math.random() * 150 + 50;
            const angle = Math.random() * Math.PI * 2;
            
            particle.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                width: 8px;
                height: 8px;
                background: #ffff00;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: tornadoOrbit 3s ease-out;
                --radius: ${radius}px;
                --angle: ${angle}rad;
                --speed: ${Math.random() * 2 + 1};
            `;
            container.appendChild(particle);
        }
        
        setTimeout(() => {
            vortex.remove();
            container.querySelectorAll('.tornado-particle').forEach(p => p.remove());
        }, 3000);
    }

    // 🌸 桜吹雪エフェクト
    async sakuraBlizzard(duration = 6000) {
        const container = document.getElementById('ultimate-effects-container');
        
        for (let i = 0; i < 80; i++) {
            setTimeout(() => {
                const petal = document.createElement('div');
                petal.className = 'sakura-petal';
                petal.textContent = '🌸';
                petal.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * window.innerWidth}px;
                    top: -30px;
                    font-size: ${Math.random() * 15 + 15}px;
                    animation: sakuraFall ${Math.random() * 4 + 3}s ease-in-out;
                    --sway: ${(Math.random() - 0.5) * 200}px;
                    --rotation: ${Math.random() * 720}deg;
                `;
                container.appendChild(petal);
                
                setTimeout(() => petal.remove(), 7000);
            }, Math.random() * 3000);
        }
    }

    // 🎆 花火大会エフェクト
    async fireworksShow() {
        const container = document.getElementById('ultimate-effects-container');
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.1;
                
                // 花火の爆発
                const firework = document.createElement('div');
                firework.className = 'firework-burst';
                firework.style.cssText = `
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    width: 20px;
                    height: 20px;
                    transform: translate(-50%, -50%);
                `;
                
                // 花火の粒子
                const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
                for (let j = 0; j < 16; j++) {
                    const particle = document.createElement('div');
                    const angle = (Math.PI * 2 * j) / 16;
                    const distance = Math.random() * 100 + 50;
                    
                    particle.style.cssText = `
                        position: absolute;
                        width: 6px;
                        height: 6px;
                        background: ${colors[Math.floor(Math.random() * colors.length)]};
                        border-radius: 50%;
                        animation: fireworkParticle 2s ease-out;
                        --fx: ${Math.cos(angle) * distance}px;
                        --fy: ${Math.sin(angle) * distance}px;
                        box-shadow: 0 0 8px currentColor;
                    `;
                    firework.appendChild(particle);
                }
                
                container.appendChild(firework);
                setTimeout(() => firework.remove(), 2000);
            }, i * 500);
        }
    }

    // 🌀 DNA螺旋エフェクト
    async dnaHelix() {
        const container = document.getElementById('ultimate-effects-container');
        
        const helix = document.createElement('div');
        helix.className = 'dna-helix';
        helix.style.cssText = `
            position: absolute;
            left: 50%;
            top: 20%;
            width: 200px;
            height: 400px;
            transform: translateX(-50%);
            animation: dnaRotate 4s ease-in-out;
        `;
        
        // DNA の塩基対を作成
        for (let i = 0; i < 20; i++) {
            const basePair = document.createElement('div');
            const angle1 = (i * 18) * Math.PI / 180;
            const angle2 = angle1 + Math.PI;
            
            basePair.innerHTML = `
                <div class="dna-base" style="
                    position: absolute;
                    left: ${100 + Math.cos(angle1) * 80}px;
                    top: ${i * 20}px;
                    width: 8px;
                    height: 8px;
                    background: #00ff00;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #00ff00;
                "></div>
                <div class="dna-base" style="
                    position: absolute;
                    left: ${100 + Math.cos(angle2) * 80}px;
                    top: ${i * 20}px;
                    width: 8px;
                    height: 8px;
                    background: #ff0000;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #ff0000;
                "></div>
                <div class="dna-connection" style="
                    position: absolute;
                    left: ${100 + Math.cos(angle1) * 80}px;
                    top: ${i * 20 + 4}px;
                    width: ${Math.abs(Math.cos(angle2) * 80 - Math.cos(angle1) * 80)}px;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.5);
                "></div>
            `;
            helix.appendChild(basePair);
        }
        
        container.appendChild(helix);
        setTimeout(() => helix.remove(), 4000);
    }

    // 🔮 魔法陣エフェクト
    async magicCircle() {
        const container = document.getElementById('ultimate-effects-container');
        
        const circle = document.createElement('div');
        circle.className = 'magic-circle';
        circle.innerHTML = `
            <svg width="400" height="400" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">
                <circle cx="200" cy="200" r="180" fill="none" stroke="#8000ff" stroke-width="3" 
                        stroke-dasharray="20 10" style="animation: magicRotate 4s linear infinite;" />
                <circle cx="200" cy="200" r="140" fill="none" stroke="#ff00ff" stroke-width="2" 
                        stroke-dasharray="15 5" style="animation: magicRotate 3s linear infinite reverse;" />
                <circle cx="200" cy="200" r="100" fill="none" stroke="#00ffff" stroke-width="2" 
                        stroke-dasharray="10 5" style="animation: magicRotate 2s linear infinite;" />
                <text x="200" y="200" text-anchor="middle" dominant-baseline="middle" 
                      fill="#ffffff" font-size="24" font-weight="bold"
                      style="animation: magicPulse 1s infinite alternate;">✨ MAGIC ✨</text>
            </svg>
        `;
        
        container.appendChild(circle);
        setTimeout(() => circle.remove(), 4000);
    }

    // 🌺 花弁舞い散りエフェクト
    async flowerPetals() {
        const container = document.getElementById('ultimate-effects-container');
        const flowers = ['🌺', '🌻', '🌷', '🌹', '🌼'];
        
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const petal = document.createElement('div');
                petal.textContent = flowers[Math.floor(Math.random() * flowers.length)];
                petal.style.cssTime = `
                    position: absolute;
                    left: ${Math.random() * window.innerWidth}px;
                    top: -30px;
                    font-size: ${Math.random() * 25 + 20}px;
                    animation: petalDance ${Math.random() * 4 + 3}s ease-in-out;
                    --dance-x: ${(Math.random() - 0.5) * 300}px;
                    --dance-y: ${window.innerHeight + 50}px;
                    --spin: ${Math.random() * 720}deg;
                `;
                container.appendChild(petal);
                
                setTimeout(() => petal.remove(), 7000);
            }, Math.random() * 2000);
        }
    }

    // 🎭 演劇カーテンエフェクト
    async theaterCurtain() {
        const container = document.getElementById('ultimate-effects-container');
        
        const curtainLeft = document.createElement('div');
        curtainLeft.className = 'theater-curtain-left';
        curtainLeft.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, #8b0000 0%, #dc143c 100%);
            animation: curtainOpen 3s ease-out;
            z-index: 10000;
        `;
        
        const curtainRight = document.createElement('div');
        curtainRight.className = 'theater-curtain-right';
        curtainRight.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 50%;
            height: 100%;
            background: linear-gradient(270deg, #8b0000 0%, #dc143c 100%);
            animation: curtainOpen 3s ease-out;
            z-index: 10000;
        `;
        
        const spotLight = document.createElement('div');
        spotLight.className = 'spot-light';
        spotLight.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            width: 300px;
            height: 300px;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
            animation: spotlightPulse 3s ease-in-out;
            z-index: 9999;
        `;
        
        container.appendChild(curtainLeft);
        container.appendChild(curtainRight);
        container.appendChild(spotLight);
        
        setTimeout(() => {
            curtainLeft.remove();
            curtainRight.remove();
            spotLight.remove();
        }, 3000);
    }

    getAllStyles() {
        return `
            @keyframes matrixFall {
                to { transform: translateY(${window.innerHeight + 100}px); }
            }
            
            @keyframes fireExplode {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
            
            @keyframes sparkFly {
                0% { transform: translate(-2px, -2px); opacity: 1; }
                100% { transform: translate(var(--spark-x), var(--spark-y)); opacity: 0; }
            }
            
            @keyframes rippleExpand {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(20); opacity: 0; }
            }
            
            @keyframes lightningFlash {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
            
            @keyframes lightningWhiteFlash {
                0% { opacity: 0; }
                10% { opacity: 0.9; }
                100% { opacity: 0; }
            }
            
            @keyframes snowFall {
                to { 
                    transform: translateY(${window.innerHeight + 50}px) translateX(var(--wind)); 
                    opacity: 0; 
                }
            }
            
            @keyframes cosmicPulse {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                50% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
            }
            
            @keyframes starExplode {
                0% { transform: translate(-50%, -50%); opacity: 1; }
                100% { transform: translate(calc(-50% + var(--star-x)), calc(-50% + var(--star-y))); opacity: 0; }
            }
            
            @keyframes neonGridPulse {
                0%, 100% { opacity: 0; }
                50% { opacity: 0.8; }
            }
            
            @keyframes neonFlicker {
                0%, 100% { opacity: 1; }
                25% { opacity: 0.8; }
                50% { opacity: 1; }
                75% { opacity: 0.9; }
            }
            
            @keyframes tornadoSpin {
                from { transform: translate(-50%, -50%) rotate(0deg) scale(0); }
                to { transform: translate(-50%, -50%) rotate(720deg) scale(1); }
            }
            
            @keyframes tornadoOrbit {
                from { 
                    transform: translate(-50%, -50%) 
                              rotate(0deg) 
                              translateX(var(--radius)) 
                              rotate(0deg); 
                }
                to { 
                    transform: translate(-50%, -50%) 
                              rotate(calc(360deg * var(--speed))) 
                              translateX(var(--radius)) 
                              rotate(calc(-360deg * var(--speed))); 
                }
            }
            
            @keyframes sakuraFall {
                0% { transform: translateY(0) translateX(0) rotate(0deg); }
                100% { 
                    transform: translateY(${window.innerHeight + 50}px) 
                              translateX(var(--sway)) 
                              rotate(var(--rotation)); 
                }
            }
            
            @keyframes petalDance {
                0% { transform: translateY(0) translateX(0) rotate(0deg); }
                50% { transform: translateY(calc(var(--dance-y) * 0.5)) translateX(calc(var(--dance-x) * 0.5)) rotate(calc(var(--spin) * 0.5)); }
                100% { transform: translateY(var(--dance-y)) translateX(var(--dance-x)) rotate(var(--spin)); }
            }
            
            @keyframes fireworkParticle {
                0% { transform: translate(0, 0); opacity: 1; }
                100% { transform: translate(var(--fx), var(--fy)); opacity: 0; }
            }
            
            @keyframes curtainOpen {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }
            
            @keyframes spotlightPulse {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
            
            @keyframes magicRotate {
                from { stroke-dashoffset: 0; }
                to { stroke-dashoffset: 314; }
            }
            
            @keyframes magicPulse {
                from { opacity: 0.8; }
                to { opacity: 1; }
            }
        `;
    }
}

// グローバルインスタンス
window.ultimateEffects = new UltimateEffects();

// 個別エフェクト関数をグローバルに公開
window.matrixRain = (duration) => window.ultimateEffects.matrixRain(duration);
window.fireExplosion = (x, y) => window.ultimateEffects.fireExplosion(x, y);
window.waterRipples = (x, y) => window.ultimateEffects.waterRipples(x, y);
window.lightningStrike = () => window.ultimateEffects.lightningStrike();
window.snowStorm = (duration) => window.ultimateEffects.snowStorm(duration);
window.cosmicExplosion = () => window.ultimateEffects.cosmicExplosion();
window.neon80sBlast = () => window.ultimateEffects.neon80sBlast();
window.tornadoWhirl = () => window.ultimateEffects.tornadoWhirl();
window.sakuraBlizzard = (duration) => window.ultimateEffects.sakuraBlizzard(duration);
window.flowerPetals = () => window.ultimateEffects.flowerPetals();
window.fireworksShow = () => window.ultimateEffects.fireworksShow();
window.theaterCurtain = () => window.ultimateEffects.theaterCurtain();
window.dnaHelix = () => window.ultimateEffects.dnaHelix();
window.magicCircle = () => window.ultimateEffects.magicCircle();