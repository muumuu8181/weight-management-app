// 汎用ダッシュボードビルダー - 統計・分析UI自動生成システム
// 任意のタブデータから統計ダッシュボードを自動構築

window.DashboardBuilder = {
    
    // メイン: ダッシュボード構築
    buildDashboard: function(containerId, tabConfigs, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            if (typeof log === "function") log('❌ ダッシュボードコンテナが見つかりません');
            return;
        }
        
        const {
            showWeeklyData = true,
            showOverallProgress = true,
            gridColumns = 'repeat(auto-fit, minmax(250px, 1fr))'
        } = options;
        
        let html = '';
        
        // タブ切り替えボタン
        if (tabConfigs.length > 1) {
            html += this.generateTabSwitcher(tabConfigs);
        }
        
        // メインビュー
        html += '<div id="overviewView" class="dashboard-view">';
        
        // サマリーカードグリッド
        html += `<div class="dashboard-grid" style="display: grid; grid-template-columns: ${gridColumns}; gap: 15px; margin-bottom: 20px;">`;
        
        tabConfigs.forEach(config => {
            html += this.generateSummaryCard(config);
        });
        
        html += '</div>';
        
        // 週次データ（オプション）
        if (showWeeklyData) {
            html += this.generateWeeklyDataSection(tabConfigs);
        }
        
        // 総合進捗（オプション）
        if (showOverallProgress) {
            html += this.generateOverallProgressSection();
        }
        
        html += '</div>';
        
        // 個別詳細ビュー
        tabConfigs.forEach(config => {
            html += this.generateDetailView(config);
        });
        
        // コントロールボタン
        html += this.generateControlButtons();
        
        container.innerHTML = html;
        if (typeof log === "function") log('✅ ダッシュボードUI生成完了');
    },
    
    // タブ切り替えボタン生成
    generateTabSwitcher: function(tabConfigs) {
        let html = '<div class="dashboard-tab-switcher" style="margin-bottom: 20px; text-align: center;">';
        
        // 概要ボタン
        html += '<button id="dashOverviewBtn" onclick="switchDashboardView(\'overview\')" style="background: #007bff; color: white; border: none; padding: 8px 15px; margin: 2px; border-radius: 5px; cursor: pointer; font-size: 12px;">📋 全体概要</button>';
        
        // 各タブの詳細ボタン
        tabConfigs.forEach(config => {
            html += `<button id="dash${config.id}Btn" onclick="switchDashboardView('${config.id}')" style="background: #f8f9fa; color: #495057; border: none; padding: 8px 15px; margin: 2px; border-radius: 5px; cursor: pointer; font-size: 12px;">${config.icon} ${config.shortName}詳細</button>`;
        });
        
        html += '</div>';
        return html;
    },
    
    // サマリーカード生成
    generateSummaryCard: function(config) {
        const { id, name, icon, color, metrics } = config;
        
        let html = `<div class="summary-card" style="background: #f8f9fa; border: 2px solid ${color}; border-radius: 8px; padding: 15px;">`;
        html += `<h4 style="color: ${color}; margin: 0 0 10px 0;">${icon} ${name}</h4>`;
        html += `<div id="${id}Summary">`;
        
        // 総記録数（必須）
        html += `<div class="metric-item">総記録数: <span id="${id}DataCount">--</span>件</div>`;
        
        // カスタムメトリクス
        if (metrics && Array.isArray(metrics)) {
            metrics.forEach(metric => {
                html += `<div class="metric-item">${metric.label}: <span id="${metric.id}">--</span>${metric.unit || ''}</div>`;
            });
        }
        
        // 傾向インジケーター
        html += `<div class="trend-indicator" id="${id}Trend">傾向: 分析中...</div>`;
        
        html += '</div></div>';
        return html;
    },
    
    // 週次データセクション生成
    generateWeeklyDataSection: function(tabConfigs) {
        let html = '<div class="weekly-activity" style="background: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; padding: 15px; margin-bottom: 15px;">';
        html += '<h4 style="color: #007bff; margin: 0 0 15px 0;">📅 週次活動状況</h4>';
        html += '<div class="weekly-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">';
        
        tabConfigs.forEach(config => {
            const bgColor = this.hexToRgba(config.color, 0.05);
            const borderColor = this.hexToRgba(config.color, 0.2);
            
            html += `<div class="weekly-card" style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 5px; padding: 10px;">`;
            html += `<div style="font-weight: bold; color: ${config.color}; font-size: 12px; margin-bottom: 8px;">${config.icon} ${config.name}</div>`;
            html += `<div class="weekly-data" id="${config.id}WeeklyData">`;
            html += `<div class="week-item">今週: <span id="${config.id}ThisWeek">--</span>件</div>`;
            html += `<div class="week-item">先週: <span id="${config.id}LastWeek">--</span>件</div>`;
            html += `<div class="week-item">今月: <span id="${config.id}ThisMonth">--</span>件</div>`;
            html += '</div></div>';
        });
        
        html += '</div></div>';
        return html;
    },
    
    // 総合進捗セクション生成
    generateOverallProgressSection: function() {
        return `
        <div class="overall-progress" style="background: #e8f5e8; border: 2px solid #28a745; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
            <h4 style="color: #155724; margin: 0 0 10px 0;">🎯 総合改善状況</h4>
            <div id="overallTrendAnalysis">
                <div id="improvementScore" style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">改善スコア: 計算中...</div>
                <div id="improvementDetails"></div>
            </div>
        </div>`;
    },
    
    // 詳細ビュー生成
    generateDetailView: function(config) {
        const { id, name, icon, color } = config;
        
        return `
        <div id="${id}View" class="dashboard-view hidden">
            <div class="detail-card" style="background: #f8f9fa; border: 2px solid ${color}; border-radius: 8px; padding: 20px;">
                <h4 style="color: ${color};">${icon} ${name} - 詳細分析</h4>
                <div id="${id}DetailContent">
                    <canvas id="${id}TrendChart" width="400" height="200"></canvas>
                    <div id="${id}AnalysisText" style="margin-top: 15px;"></div>
                </div>
            </div>
        </div>`;
    },
    
    // コントロールボタン生成
    generateControlButtons: function() {
        return `
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="refreshDashboardData()" style="background: #17a2b8; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px;">🔄 データ更新</button>
            <button class="universal-copy-btn" onclick="copyDashboardData()" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px;">📋 サマリーをコピー</button>
            <button onclick="exportTrendData()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px;">📊 詳細データエクスポート</button>
        </div>`;
    },
    
    // データ更新（統合版）
    updateDashboardData: function(tabConfigs, dashboardData) {
        // 基本サマリー更新
        tabConfigs.forEach(config => {
            const data = dashboardData[config.id] || [];
            
            // 総記録数更新
            const countElement = document.getElementById(`${config.id}DataCount`);
            if (countElement) {
                countElement.textContent = data.length;
            }
            
            // カスタムメトリクス更新
            if (config.updateFunction && typeof config.updateFunction === 'function') {
                config.updateFunction(data, config);
            }
            
            // 傾向分析更新
            if (config.trendAnalysis && typeof config.trendAnalysis === 'function') {
                const trend = config.trendAnalysis(data);
                const trendElement = document.getElementById(`${config.id}Trend`);
                if (trendElement) {
                    trendElement.textContent = `傾向: ${trend.message}`;
                    trendElement.className = `trend-indicator ${trend.class}`;
                }
            }
        });
        
        // 週次データ更新
        this.updateAllWeeklyData(tabConfigs, dashboardData);
        
        if (typeof log === "function") log('✅ ダッシュボードデータ更新完了');
    },
    
    // 週次データ一括更新
    updateAllWeeklyData: function(tabConfigs, dashboardData) {
        tabConfigs.forEach(config => {
            const data = dashboardData[config.id] || [];
            const weeklyStats = window.DATA_ANALYTICS.calculateWeeklyStats(data, config.dateField);
            
            const elements = {
                thisWeek: document.getElementById(`${config.id}ThisWeek`),
                lastWeek: document.getElementById(`${config.id}LastWeek`),
                thisMonth: document.getElementById(`${config.id}ThisMonth`)
            };
            
            if (elements.thisWeek) elements.thisWeek.textContent = weeklyStats.thisWeek;
            if (elements.lastWeek) elements.lastWeek.textContent = weeklyStats.lastWeek;
            if (elements.thisMonth) elements.thisMonth.textContent = weeklyStats.thisMonth;
            
            if (typeof log === "function") log(`📊 ${config.name}週次統計: 今週${weeklyStats.thisWeek}件, 先週${weeklyStats.lastWeek}件, 今月${weeklyStats.thisMonth}件`);
        });
    },
    
    // ユーティリティ: 色変換
    hexToRgba: function(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    
    // ビュー切り替え汎用関数
    switchView: function(viewType, tabConfigs) {
        // 全ビューを非表示
        document.querySelectorAll('.dashboard-view').forEach(view => {
            view.classList.add('hidden');
        });
        
        // ボタン状態をリセット
        document.querySelectorAll('.dashboard-tab-switcher button').forEach(btn => {
            btn.style.background = '#f8f9fa';
            btn.style.color = '#495057';
        });
        
        // 選択されたビューとボタンをアクティブに
        const targetView = document.getElementById(viewType + 'View');
        const targetBtn = document.getElementById('dash' + viewType.charAt(0).toUpperCase() + viewType.slice(1) + 'Btn');
        
        if (targetView) {
            targetView.classList.remove('hidden');
        }
        
        if (targetBtn) {
            targetBtn.style.background = '#007bff';
            targetBtn.style.color = 'white';
        }
        
        if (typeof log === "function") log(`📑 ダッシュボードビュー切り替え: ${viewType}`);
    }
};

// 標準的なタブ設定テンプレート
window.DashboardBuilder.getStandardTabConfigs = function() {
    return [
        {
            id: 'weight',
            name: '体重管理',
            shortName: '体重',
            icon: '📊',
            color: '#007bff',
            dateField: 'date',
            metrics: [
                { label: '最新体重', id: 'latestWeight', unit: 'kg' },
                { label: '前回差', id: 'weightDiff', unit: 'kg' },
                { label: '月間変化', id: 'monthlyChange', unit: 'kg' }
            ],
            updateFunction: function(data, config) {
                if (data.length === 0) return;
                
                const latest = data[data.length - 1];
                document.getElementById('latestWeight').textContent = latest.weight;
                
                if (data.length > 1) {
                    const previous = data[data.length - 2];
                    const diff = (latest.weight - previous.weight).toFixed(1);
                    document.getElementById('weightDiff').textContent = diff >= 0 ? `+${diff}` : diff;
                }
                
                // 月間変化計算
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                const monthlyData = data.filter(w => new Date(w.date) >= oneMonthAgo);
                
                if (monthlyData.length > 1) {
                    const monthlyChange = (monthlyData[monthlyData.length - 1].weight - monthlyData[0].weight).toFixed(1);
                    document.getElementById('monthlyChange').textContent = monthlyChange >= 0 ? `+${monthlyChange}` : monthlyChange;
                }
            },
            trendAnalysis: function(data) {
                return window.DATA_ANALYTICS.analyzeNumericTrend(data, 'weight', 60);
            }
        },
        
        {
            id: 'sleep',
            name: '睡眠管理',
            shortName: '睡眠',
            icon: '🛏️',
            color: '#6f42c1',
            dateField: 'date',
            metrics: [
                { label: '平均睡眠時間', id: 'avgSleepTime', unit: 'h' },
                { label: '平均睡眠質', id: 'avgSleepQuality', unit: '/5' },
                { label: '今月記録数', id: 'sleepRecords', unit: '回' }
            ],
            updateFunction: function(data, config) {
                if (data.length === 0) return;
                
                // 平均睡眠時間計算
                let totalHours = 0;
                let validRecords = 0;
                
                data.forEach(sleep => {
                    if (sleep.bedtime && sleep.wakeupTime) {
                        const duration = window.DashboardBuilder.calculateSleepDuration(sleep.bedtime, sleep.wakeupTime);
                        if (duration > 0) {
                            totalHours += duration;
                            validRecords++;
                        }
                    }
                });
                
                if (validRecords > 0) {
                    document.getElementById('avgSleepTime').textContent = (totalHours / validRecords).toFixed(1);
                }
                
                // 平均睡眠質
                const qualityRecords = data.filter(s => s.quality);
                if (qualityRecords.length > 0) {
                    const avgQuality = qualityRecords.reduce((sum, s) => sum + s.quality, 0) / qualityRecords.length;
                    document.getElementById('avgSleepQuality').textContent = avgQuality.toFixed(1);
                }
                
                // 今月の記録数
                const thisMonth = new Date();
                thisMonth.setDate(1);
                const monthlyRecords = data.filter(s => new Date(s.date) >= thisMonth);
                document.getElementById('sleepRecords').textContent = monthlyRecords.length;
            },
            trendAnalysis: function(data) {
                return window.DATA_ANALYTICS.analyzeRatingTrend(data, 'quality', 5, 14);
            }
        },
        
        {
            id: 'room',
            name: '部屋片付け',
            shortName: '片付け',
            icon: '🏠',
            color: '#28a745',
            dateField: 'date',
            metrics: [
                { label: '完了タスク', id: 'completedTasks', unit: '' },
                { label: '完了率', id: 'completionRate', unit: '%' },
                { label: '今月活動', id: 'monthlyActivity', unit: '回' }
            ],
            updateFunction: function(data, config) {
                if (data.length === 0) return;
                
                const completedTasks = data.filter(r => r.completed || r.status === 'completed').length;
                document.getElementById('completedTasks').textContent = `${completedTasks}/${data.length}`;
                
                const completionRate = (completedTasks / data.length * 100).toFixed(0);
                document.getElementById('completionRate').textContent = completionRate;
                
                const thisMonth = new Date();
                thisMonth.setDate(1);
                const monthlyActivity = data.filter(r => {
                    const recordDate = new Date(r.date || r.timestamp);
                    return recordDate >= thisMonth;
                }).length;
                document.getElementById('monthlyActivity').textContent = monthlyActivity;
            },
            trendAnalysis: function(data) {
                return window.DATA_ANALYTICS.analyzeCompletionTrend(data, 'completed');
            }
        },
        
        {
            id: 'memo',
            name: 'メモリスト',
            shortName: 'メモ',
            icon: '📝',
            color: '#ffc107',
            dateField: 'date',
            metrics: [
                { label: '総メモ数', id: 'totalMemos', unit: '' },
                { label: '重要メモ', id: 'importantMemos', unit: '' },
                { label: '今月追加', id: 'monthlyMemos', unit: '' }
            ],
            updateFunction: function(data, config) {
                if (data.length === 0) return;
                
                document.getElementById('totalMemos').textContent = data.length;
                
                const importantMemos = data.filter(m => 
                    m.priority === '高' || m.priority === '緊急' || m.category === '重要'
                ).length;
                document.getElementById('importantMemos').textContent = importantMemos;
                
                const thisMonth = new Date();
                thisMonth.setDate(1);
                const monthlyMemos = data.filter(m => {
                    const memoDate = new Date(m.date || m.timestamp);
                    return memoDate >= thisMonth;
                }).length;
                document.getElementById('monthlyMemos').textContent = monthlyMemos;
            },
            trendAnalysis: function(data) {
                return window.DATA_ANALYTICS.analyzeMonthlyComparison(data);
            }
        }
    ];
};

// ユーティリティ関数
window.DashboardBuilder.calculateSleepDuration = function(bedtime, wakeupTime) {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeupTime.split(':').map(Number);
    
    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;
    
    if (wakeMinutes <= bedMinutes) {
        wakeMinutes += 24 * 60;
    }
    
    return (wakeMinutes - bedMinutes) / 60;
};

// グローバル公開
window.DASHBOARD_BUILDER = window.DashboardBuilder;

if (typeof log === "function") log('✅ ダッシュボードビルダー読み込み完了');