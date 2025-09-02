// データ分析ユーティリティ - 共通統計・傾向分析システム
// 全タブで使用可能な汎用分析機能

// 週次データ統計計算
window.DataAnalytics = {
    
    // 週次統計データ計算
    calculateWeeklyStats: function(data, dateField = 'date') {
        const today = new Date();
        const thisWeekStart = this.getWeekStart(today);
        const lastWeekStart = this.getWeekStart(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        
        let thisWeekCount = 0;
        let lastWeekCount = 0;
        let thisMonthCount = 0;
        
        if (!data || data.length === 0) {
            return {
                thisWeek: 0,
                lastWeek: 0,
                thisMonth: 0,
                total: 0
            };
        }
        
        data.forEach(item => {
            const itemDate = this.getItemDate(item, dateField);
            if (!itemDate) return;
            
            if (itemDate >= thisWeekStart) {
                thisWeekCount++;
            } else if (itemDate >= lastWeekStart && itemDate < thisWeekStart) {
                lastWeekCount++;
            }
            
            if (itemDate >= thisMonthStart) {
                thisMonthCount++;
            }
        });
        
        return {
            thisWeek: thisWeekCount,
            lastWeek: lastWeekCount,
            thisMonth: thisMonthCount,
            total: data.length
        };
    },
    
    // 週の開始日取得（月曜日開始）
    getWeekStart: function(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(d.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
    },
    
    // データ項目から日付取得（複数フィールド対応）
    getItemDate: function(item, primaryField = 'date') {
        let dateStr = item[primaryField] || item.date || item.timestamp || item.createdAt || item.recordDate;
        
        if (!dateStr) return null;
        
        if (typeof dateStr === 'number') {
            return new Date(dateStr);
        }
        
        if (typeof dateStr === 'string') {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        }
        
        return null;
    },
    
    // 数値系傾向分析（体重・歩数等）
    analyzeNumericTrend: function(data, valueField, timeframe = 60) {
        if (!data || data.length < 2) {
            return { message: 'データ不足', class: 'trend-stable', score: 50 };
        }
        
        const timeframeAgo = new Date();
        timeframeAgo.setDate(timeframeAgo.getDate() - timeframe);
        
        const recentData = data.filter(item => {
            const itemDate = this.getItemDate(item);
            return itemDate && itemDate >= timeframeAgo;
        }).sort((a, b) => this.getItemDate(a) - this.getItemDate(b));
        
        if (recentData.length < 2) {
            return { message: '傾向分析中', class: 'trend-stable', score: 50 };
        }
        
        const firstValue = recentData[0][valueField];
        const lastValue = recentData[recentData.length - 1][valueField];
        const change = lastValue - firstValue;
        const changePercent = Math.abs(change / firstValue) * 100;
        
        // 閾値は用途に応じて調整可能
        if (Math.abs(change) < firstValue * 0.02) { // 2%未満の変化
            return { message: '安定維持', class: 'trend-stable', score: 60 };
        } else if (change < 0 && changePercent > 5) { // 5%以上の減少
            return { message: '順調に改善', class: 'trend-up', score: 80 };
        } else if (change < 0) {
            return { message: '緩やかに改善', class: 'trend-up', score: 70 };
        } else if (changePercent > 5) { // 5%以上の増加
            return { message: '要注意（悪化）', class: 'trend-down', score: 20 };
        } else {
            return { message: '微増傾向', class: 'trend-down', score: 40 };
        }
    },
    
    // 評価系傾向分析（睡眠質・満足度等）
    analyzeRatingTrend: function(data, ratingField, maxRating = 5, timeframe = 14) {
        if (!data || data.length < 3) {
            return { message: 'データ不足', class: 'trend-stable', score: 50 };
        }
        
        const timeframeAgo = new Date();
        timeframeAgo.setDate(timeframeAgo.getDate() - timeframe);
        
        const recentData = data.filter(item => {
            const itemDate = this.getItemDate(item);
            return itemDate && itemDate >= timeframeAgo && item[ratingField];
        });
        
        if (recentData.length < 3) {
            return { message: '分析中', class: 'trend-stable', score: 50 };
        }
        
        const avgRating = recentData.reduce((sum, item) => sum + item[ratingField], 0) / recentData.length;
        const ratingPercent = (avgRating / maxRating) * 100;
        
        if (ratingPercent >= 80) {
            return { message: '非常に良好', class: 'trend-up', score: 90 };
        } else if (ratingPercent >= 60) {
            return { message: '良好', class: 'trend-up', score: 70 };
        } else if (ratingPercent >= 40) {
            return { message: '普通', class: 'trend-stable', score: 50 };
        } else {
            return { message: '改善必要', class: 'trend-down', score: 30 };
        }
    },
    
    // 完了率系傾向分析（タスク・目標等）
    analyzeCompletionTrend: function(data, completionField = 'completed') {
        if (!data || data.length === 0) {
            return { message: 'データなし', class: 'trend-stable', score: 50 };
        }
        
        const completedItems = data.filter(item => 
            item[completionField] === true || 
            item.status === 'completed' || 
            item.status === '完了'
        );
        
        const completionRate = completedItems.length / data.length;
        const ratePercent = completionRate * 100;
        
        if (ratePercent >= 80) {
            return { message: '非常に良い', class: 'trend-up', score: 85 };
        } else if (ratePercent >= 60) {
            return { message: '順調', class: 'trend-up', score: 70 };
        } else if (ratePercent >= 40) {
            return { message: '改善余地あり', class: 'trend-stable', score: 50 };
        } else {
            return { message: '要努力', class: 'trend-down', score: 25 };
        }
    },
    
    // 活動頻度分析（継続性評価）
    analyzeActivityFrequency: function(data, targetDaysPerWeek = 5) {
        const weeklyStats = this.calculateWeeklyStats(data);
        const avgWeeklyActivity = (weeklyStats.thisWeek + weeklyStats.lastWeek) / 2;
        
        if (avgWeeklyActivity >= targetDaysPerWeek) {
            return { message: '継続性良好', class: 'trend-up', score: 80 };
        } else if (avgWeeklyActivity >= targetDaysPerWeek * 0.7) {
            return { message: '概ね継続', class: 'trend-stable', score: 60 };
        } else {
            return { message: '継続性改善必要', class: 'trend-down', score: 30 };
        }
    },
    
    // 月次比較分析
    analyzeMonthlyComparison: function(data) {
        const thisMonth = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
        const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        
        const thisMonthData = data.filter(item => {
            const itemDate = this.getItemDate(item);
            return itemDate && itemDate >= thisMonthStart;
        });
        
        const lastMonthData = data.filter(item => {
            const itemDate = this.getItemDate(item);
            return itemDate && itemDate >= lastMonthStart && itemDate < thisMonthStart;
        });
        
        const changePercent = lastMonthData.length > 0 ? 
            ((thisMonthData.length - lastMonthData.length) / lastMonthData.length * 100) : 0;
        
        if (changePercent > 20) {
            return { message: 'アクティブ増加', class: 'trend-up', score: 75 };
        } else if (changePercent > 0) {
            return { message: '微増', class: 'trend-stable', score: 60 };
        } else if (changePercent > -20) {
            return { message: '微減', class: 'trend-stable', score: 50 };
        } else {
            return { message: '活動減少', class: 'trend-down', score: 30 };
        }
    }
};

// グローバル公開
window.DATA_ANALYTICS = window.DataAnalytics;

log('✅ データ分析ユーティリティ読み込み完了');