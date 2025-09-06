// 🤖 AI分析ダッシュボード拡張モジュール
// 既存ダッシュボードにAI分析機能を統合

// AI分析ダッシュボード構築
window.buildAIDashboard = function() {
    if (!window.WeightAI || !window.WeightAI.initialized) {
        return '<div class="ai-loading" style="text-align: center; padding: 50px; color: #666;">🤖 AI分析を初期化中...</div>';
    }
    
    const analysis = window.WeightAI.getAnalysisSummary();
    if (analysis.error) {
        return `<div class="ai-error" style="text-align: center; padding: 30px; color: #dc3545;">❌ ${analysis.error}</div>`;
    }
    
    return `
        <div class="ai-dashboard" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <div class="ai-header" style="text-align: center; margin-bottom: 30px;">
                <h3 style="color: #333; margin-bottom: 10px;">🤖 AI体重分析 v${analysis.aiVersion}</h3>
                <p style="color: #666; font-size: 0.9em;">データ点: ${analysis.dataPoints}件 | 最終更新: ${analysis.lastUpdated.toLocaleString('ja-JP')}</p>
            </div>
            
            <div class="ai-predictions" style="margin-bottom: 30px;">
                <div class="prediction-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <h4 style="margin: 0 0 15px 0; font-size: 1.2em;">📈 1週間後予測</h4>
                    <div class="predicted-weight" style="font-size: 3em; font-weight: bold; margin: 15px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                        ${analysis.prediction.predicted ? analysis.prediction.predicted.toFixed(1) : '?'}kg
                    </div>
                    <div class="prediction-details" style="display: flex; justify-content: space-around; flex-wrap: wrap; margin-top: 20px;">
                        <span class="confidence" style="background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 20px; margin: 5px;">信頼度: ${analysis.prediction.confidence}%</span>
                        <span class="trend-info" style="background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 20px; margin: 5px;">傾向: ${analysis.prediction.trend}</span>
                        <span class="change-info" style="background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 20px; margin: 5px;">
                            変化: ${analysis.prediction.change > 0 ? '+' : ''}${analysis.prediction.change ? analysis.prediction.change.toFixed(2) : '0'}kg
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="ai-patterns" style="margin-bottom: 30px;">
                <div class="pattern-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                    <div class="pattern-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 5px solid #007bff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h5 style="color: #007bff; margin: 0 0 15px 0; display: flex; align-items: center;">📊 トレンド分析</h5>
                        <p style="margin: 10px 0; color: #333;">${analysis.trend.trend}</p>
                        <span class="confidence-badge" style="background: #28a745; color: white; padding: 4px 10px; border-radius: 15px; font-size: 0.85em; display: inline-block;">
                            信頼度: ${analysis.trend.confidence}%
                        </span>
                    </div>
                    
                    <div class="pattern-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 5px solid #28a745; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h5 style="color: #28a745; margin: 0 0 15px 0;">📅 曜日パターン</h5>
                        <p style="margin: 8px 0; color: #333;"><strong>最軽量:</strong> ${analysis.patterns.weekly.bestDay}曜日</p>
                        <p style="margin: 8px 0; color: #333;"><strong>変動幅:</strong> ${analysis.patterns.weekly.variation.toFixed(2)}kg</p>
                    </div>
                    
                    <div class="pattern-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 5px solid #ffc107; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h5 style="color: #e6a000; margin: 0 0 15px 0;">⏰ 時間パターン</h5>
                        <p style="margin: 10px 0; color: #333;">${analysis.patterns.daily.recommendation}</p>
                    </div>
                    
                    <div class="pattern-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 5px solid #6f42c1; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h5 style="color: #6f42c1; margin: 0 0 15px 0;">👕 服装影響</h5>
                        <p style="margin: 8px 0; color: #333;"><strong>最軽装:</strong> ${analysis.patterns.clothing.lightest}</p>
                        <p style="margin: 8px 0; color: #333;"><strong>影響度:</strong> ${analysis.patterns.clothing.impact.toFixed(2)}kg</p>
                    </div>
                </div>
            </div>
            
            <div class="ai-recommendations" style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 25px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                <h4 style="color: #1976d2; margin: 0 0 20px 0; display: flex; align-items: center;">💡 AI推奨事項</h4>
                <ul class="recommendation-list" style="list-style: none; padding: 0; margin: 0;">
                    ${analysis.recommendations.map(rec => `
                        <li style="margin: 12px 0; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #2196F3; box-shadow: 0 2px 4px rgba(0,0,0,0.1); color: #333;">
                            ${rec}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="ai-volatility" style="background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%); padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h5 style="color: #f57c00; margin: 0 0 15px 0;">📈 変動性分析</h5>
                <p style="margin: 10px 0 15px 0; color: #333;">${analysis.patterns.volatility.description}</p>
                <div class="volatility-meter" style="background: #eee; height: 12px; border-radius: 6px; overflow: hidden; position: relative;">
                    <div class="volatility-bar" style="
                        width: ${Math.min(100, analysis.patterns.volatility.volatility * 50)}%; 
                        height: 100%; 
                        background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 30%, #FFC107 70%, #FF9800 90%, #F44336 100%); 
                        transition: width 0.5s ease;
                        border-radius: 6px;
                    "></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.8em; color: #666;">
                    <span>低変動</span>
                    <span>高変動</span>
                </div>
            </div>
        </div>
    `;
};

// AI分析初期化（非同期対応）
window.initAIAnalysisAsync = function() {
    let retryCount = 0;
    const maxRetries = 12; // 最大1分待機

    const checkAndInitAI = () => {
        if (window.WeightTab && window.WeightTab.allWeightData && window.WeightTab.allWeightData.length > 0) {
            log(`🤖 AI分析開始: ${window.WeightTab.allWeightData.length}件の体重データを検出`);
            const aiSummary = window.initWeightAI(window.WeightTab.allWeightData);
            if (aiSummary) {
                log(`✅ AI分析完了: ${aiSummary.dataPoints}件のデータを分析`);
                // ダッシュボードが既にAIビューの場合は再描画
                if (window.currentDashboardView === 'ai') {
                    refreshAIDashboard();
                }
                return true;
            }
        } else if (retryCount < maxRetries) {
            retryCount++;
            log(`⏳ 体重データ待機中... (${retryCount}/${maxRetries})`);
            setTimeout(checkAndInitAI, 5000);
        } else {
            log('❌ AI分析初期化タイムアウト: 体重データが見つかりません');
        }
        return false;
    };

    setTimeout(checkAndInitAI, 1000);
};

// AIダッシュボード再描画
window.refreshAIDashboard = function() {
    const container = document.getElementById('dashboardContainer');
    if (container && window.currentDashboardView === 'ai') {
        const contentArea = container.querySelector('.dashboard-content');
        if (contentArea) {
            contentArea.innerHTML = window.buildAIDashboard();
        }
        log('🔄 AIダッシュボード再描画完了');
    }
};

// 既存switchDashboardView関数の拡張
if (window.switchDashboardView) {
    const originalSwitchView = window.switchDashboardView;
    window.switchDashboardView = function(viewType) {
        if (viewType === 'ai') {
            window.currentDashboardView = viewType;
            const container = document.getElementById('dashboardContainer');
            if (container) {
                // ナビボタンのアクティブ状態更新
                const navButtons = container.querySelectorAll('.dashboard-nav button');
                navButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.view === 'ai' || btn.textContent.includes('AI')) {
                        btn.classList.add('active');
                    }
                });

                // コンテンツエリア更新
                let contentArea = container.querySelector('.dashboard-content');
                if (!contentArea) {
                    contentArea = document.createElement('div');
                    contentArea.className = 'dashboard-content';
                    container.appendChild(contentArea);
                }
                contentArea.innerHTML = window.buildAIDashboard();
            }
            log('🤖 AI分析ダッシュボード表示');
        } else {
            originalSwitchView(viewType);
        }
    };
}

// ダッシュボードナビゲーションにAIボタン追加
window.addAINavigationButton = function() {
    const container = document.getElementById('dashboardContainer');
    if (container) {
        const nav = container.querySelector('.dashboard-nav');
        if (nav && !nav.querySelector('[data-view="ai"]')) {
            const aiButton = document.createElement('button');
            aiButton.textContent = '🤖 AI分析';
            aiButton.dataset.view = 'ai';
            aiButton.onclick = () => window.switchDashboardView('ai');
            aiButton.style.cssText = `
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: transform 0.2s ease;
                margin: 5px;
            `;
            aiButton.onmouseover = () => aiButton.style.transform = 'translateY(-2px)';
            aiButton.onmouseout = () => aiButton.style.transform = 'translateY(0)';
            
            nav.appendChild(aiButton);
            log('✅ AIナビゲーションボタン追加完了');
        }
    }
};

// 自動初期化
document.addEventListener('DOMContentLoaded', () => {
    // AI分析システム初期化を少し遅延実行
    setTimeout(() => {
        window.initAIAnalysisAsync();
        window.addAINavigationButton();
    }, 2000);
});

log('🤖 AI分析ダッシュボード拡張モジュール読み込み完了');