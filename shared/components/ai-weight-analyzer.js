// 🤖 体重管理AI分析システム - 統合ダッシュボード用
// ブラウザ内で動作する軽量Deep Learning風分析エンジン

class WeightPredictionAI {
    constructor() {
        this.data = [];
        this.patterns = {};
        this.predictions = {};
        this.initialized = false;
    }

    // AIシステム初期化
    initialize(weightData) {
        if (!weightData || weightData.length === 0) {
            log('⚠️ AI初期化: データが不足しています');
            return false;
        }

        this.data = this.preprocessData(weightData);
        this.analyzePatterns();
        this.initialized = true;
        log(`🤖 AI初期化完了: ${this.data.length}件のデータを分析`);
        return true;
    }

    // データ前処理
    preprocessData(rawData) {
        return rawData
            .filter(entry => entry.weight || entry.value)
            .map(entry => ({
                date: new Date(entry.date),
                weight: parseFloat(entry.weight || entry.value),
                time: entry.time || '00:00',
                timing: entry.timing || '未設定',
                clothing: entry.clothing || '普段着',
                dayOfWeek: new Date(entry.date).getDay(),
                dayOfMonth: new Date(entry.date).getDate(),
                weekOfMonth: Math.ceil(new Date(entry.date).getDate() / 7)
            }))
            .sort((a, b) => a.date - b.date);
    }

    // パターン分析実行
    analyzePatterns() {
        if (this.data.length < 3) {
            this.patterns = { insufficient: true };
            return;
        }

        this.patterns = {
            trend: this.calculateTrend(),
            weekly: this.getWeeklyPattern(),
            daily: this.getDailyPattern(),
            clothing: this.getClothingImpact(),
            volatility: this.calculateVolatility(),
            seasonality: this.detectSeasonality()
        };
    }

    // トレンド分析
    calculateTrend() {
        if (this.data.length < 7) return { trend: 'データ不足', slope: 0, direction: '不明' };

        const recent = this.data.slice(-14); // 2週間
        const older = this.data.slice(-28, -14); // その前の2週間

        const recentAvg = recent.reduce((sum, d) => sum + d.weight, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((sum, d) => sum + d.weight, 0) / older.length : recentAvg;
        
        const slope = (recentAvg - olderAvg) / 14; // 1日あたりの変化
        const direction = slope > 0.02 ? '増加' : slope < -0.02 ? '減少' : '安定';

        return {
            slope,
            direction,
            trend: `${direction}傾向 (${slope > 0 ? '+' : ''}${slope.toFixed(3)}kg/日)`,
            confidence: Math.min(95, Math.max(60, recent.length * 5))
        };
    }

    // 曜日別パターン
    getWeeklyPattern() {
        const weeklyData = Array(7).fill(0).map(() => []);
        const weekNames = ['日', '月', '火', '水', '木', '金', '土'];

        this.data.forEach(entry => {
            weeklyData[entry.dayOfWeek].push(entry.weight);
        });

        const weeklyAvg = weeklyData.map((dayData, index) => ({
            day: weekNames[index],
            average: dayData.length > 0 ? dayData.reduce((a, b) => a + b) / dayData.length : 0,
            count: dayData.length
        }));

        const bestDay = weeklyAvg.reduce((min, day) => 
            day.count > 0 && day.average < min.average ? day : min, 
            { average: Infinity, day: '不明' }
        );

        const worstDay = weeklyAvg.reduce((max, day) => 
            day.count > 0 && day.average > max.average ? day : max,
            { average: -Infinity, day: '不明' }
        );

        return {
            pattern: weeklyAvg,
            bestDay: bestDay.day,
            worstDay: worstDay.day,
            variation: worstDay.average - bestDay.average
        };
    }

    // 時間帯パターン
    getDailyPattern() {
        const timeGroups = {
            '朝': [], '昼': [], '夜': [], '深夜': []
        };

        this.data.forEach(entry => {
            const hour = parseInt(entry.time.split(':')[0]);
            let timeGroup = '深夜';
            if (hour >= 6 && hour < 12) timeGroup = '朝';
            else if (hour >= 12 && hour < 18) timeGroup = '昼';
            else if (hour >= 18 && hour < 24) timeGroup = '夜';
            
            timeGroups[timeGroup].push(entry.weight);
        });

        const timeAnalysis = Object.entries(timeGroups).map(([time, weights]) => ({
            time,
            average: weights.length > 0 ? weights.reduce((a, b) => a + b) / weights.length : 0,
            count: weights.length
        }));

        const optimalTime = timeAnalysis.reduce((best, current) => 
            current.count > 1 && current.average < best.average ? current : best,
            { average: Infinity, time: '朝' }
        );

        return {
            analysis: timeAnalysis,
            optimal: optimalTime.time,
            recommendation: `最軽量時間帯: ${optimalTime.time}（平均${optimalTime.average.toFixed(1)}kg）`
        };
    }

    // 服装影響分析
    getClothingImpact() {
        const clothingGroups = {};
        
        this.data.forEach(entry => {
            if (!clothingGroups[entry.clothing]) {
                clothingGroups[entry.clothing] = [];
            }
            clothingGroups[entry.clothing].push(entry.weight);
        });

        const clothingAnalysis = Object.entries(clothingGroups)
            .filter(([_, weights]) => weights.length > 1)
            .map(([clothing, weights]) => ({
                clothing,
                average: weights.reduce((a, b) => a + b) / weights.length,
                count: weights.length
            }))
            .sort((a, b) => a.average - b.average);

        const impact = clothingAnalysis.length > 1 ? 
            clothingAnalysis[clothingAnalysis.length - 1].average - clothingAnalysis[0].average : 0;

        return {
            analysis: clothingAnalysis,
            impact: impact,
            lightest: clothingAnalysis[0]?.clothing || '不明',
            heaviest: clothingAnalysis[clothingAnalysis.length - 1]?.clothing || '不明'
        };
    }

    // ボラティリティ計算
    calculateVolatility() {
        if (this.data.length < 7) return { volatility: 0, stability: '不明' };

        const weights = this.data.slice(-30).map(d => d.weight); // 最近30日
        const mean = weights.reduce((a, b) => a + b) / weights.length;
        const variance = weights.reduce((sum, weight) => sum + Math.pow(weight - mean, 2), 0) / weights.length;
        const volatility = Math.sqrt(variance);

        let stability = '高';
        if (volatility > 1.0) stability = '低';
        else if (volatility > 0.5) stability = '中';

        return {
            volatility: volatility,
            stability: stability,
            description: `体重変動: ${volatility.toFixed(2)}kg (安定性: ${stability})`
        };
    }

    // 季節性検出
    detectSeasonality() {
        if (this.data.length < 30) return { detected: false, pattern: '不明' };

        const monthlyData = Array(12).fill(0).map(() => []);
        this.data.forEach(entry => {
            monthlyData[entry.date.getMonth()].push(entry.weight);
        });

        const monthlyAvg = monthlyData.map((monthData, index) => ({
            month: index + 1,
            average: monthData.length > 0 ? monthData.reduce((a, b) => a + b) / monthData.length : 0,
            count: monthData.length
        })).filter(m => m.count > 0);

        if (monthlyAvg.length < 3) {
            return { detected: false, pattern: 'データ不足' };
        }

        return {
            detected: true,
            pattern: monthlyAvg,
            description: '季節パターンを検出中...'
        };
    }

    // 1週間後の体重予測
    predictNextWeek() {
        if (!this.initialized || this.data.length < 5) {
            return {
                predicted: null,
                confidence: 0,
                error: 'データ不足'
            };
        }

        const recent = this.data.slice(-14);
        const currentWeight = recent[recent.length - 1].weight;
        const trend = this.patterns.trend.slope;
        
        // 線形予測 + ランダムウォーク要素
        const linearPrediction = currentWeight + (trend * 7);
        const volatilityAdjustment = this.patterns.volatility.volatility * 0.3;
        
        const predicted = linearPrediction + (Math.random() - 0.5) * volatilityAdjustment;
        const confidence = Math.max(60, Math.min(90, recent.length * 4));

        return {
            predicted: predicted,
            confidence: confidence,
            trend: this.patterns.trend.direction,
            change: predicted - currentWeight,
            method: 'Linear + Stochastic'
        };
    }

    // 目標体重到達予測
    predictGoalAchievement(targetWeight) {
        if (!this.initialized) return null;

        const currentWeight = this.data[this.data.length - 1].weight;
        const weeklyChange = this.patterns.trend.slope * 7;
        const difference = targetWeight - currentWeight;

        if (Math.abs(weeklyChange) < 0.01) {
            return {
                achievable: false,
                reason: '変化トレンドが不明確',
                recommendation: '継続的な測定が必要'
            };
        }

        const weeksToGoal = difference / weeklyChange;
        const achievable = weeksToGoal > 0 && weeksToGoal < 104; // 2年以内

        return {
            achievable,
            weeksToGoal: Math.abs(weeksToGoal),
            expectedDate: new Date(Date.now() + Math.abs(weeksToGoal) * 7 * 24 * 60 * 60 * 1000),
            currentTrend: this.patterns.trend.direction,
            recommendation: this.generateGoalRecommendation(targetWeight, currentWeight, weeklyChange)
        };
    }

    // AI推奨生成
    generateRecommendations() {
        if (!this.initialized) return ['データを蓄積してください'];

        const recommendations = [];
        const trend = this.patterns.trend;
        const weekly = this.patterns.weekly;
        const daily = this.patterns.daily;

        // トレンドベース推奨
        if (trend.direction === '増加' && trend.slope > 0.05) {
            recommendations.push('⚠️ 体重増加傾向です。生活習慣の見直しを検討してください');
        } else if (trend.direction === '減少' && trend.slope < -0.05) {
            recommendations.push('📈 良好な減量トレンドです。現在のペースを維持しましょう');
        } else {
            recommendations.push('✅ 体重が安定しています。現在の生活リズムを継続してください');
        }

        // 測定タイミング推奨
        if (daily.optimal) {
            recommendations.push(`⏰ 最適測定時間: ${daily.optimal}（最も安定した測定が期待できます）`);
        }

        // 曜日別推奨
        if (weekly.bestDay && weekly.worstDay !== weekly.bestDay) {
            recommendations.push(`📅 ${weekly.bestDay}曜日の測定値が最も軽い傾向です`);
        }

        // ボラティリティ推奨
        if (this.patterns.volatility.stability === '低') {
            recommendations.push('📊 体重変動が大きいです。測定条件を一定にすることを推奨します');
        }

        return recommendations;
    }

    // 目標推奨生成
    generateGoalRecommendation(target, current, weeklyChange) {
        const difference = Math.abs(target - current);
        
        if (difference < 1) return '現在の体重に近い適切な目標です';
        if (difference > 10) return '目標体重との差が大きいため、段階的な目標設定を推奨します';
        if (Math.abs(weeklyChange) < 0.1) return '現在のペースでは時間がかかります。生活習慣の調整を検討してください';
        
        return '適切なペースで目標達成が期待できます';
    }

    // 分析結果サマリー取得
    getAnalysisSummary() {
        if (!this.initialized) {
            return { error: 'AI未初期化', recommendations: ['データを蓄積してください'] };
        }

        const prediction = this.predictNextWeek();
        const recommendations = this.generateRecommendations();

        return {
            dataPoints: this.data.length,
            trend: this.patterns.trend,
            prediction: prediction,
            patterns: {
                weekly: this.patterns.weekly,
                daily: this.patterns.daily,
                clothing: this.patterns.clothing,
                volatility: this.patterns.volatility
            },
            recommendations: recommendations,
            lastUpdated: new Date(),
            aiVersion: '1.0-lightweight'
        };
    }
}

// グローバル AI インスタンス
window.WeightAI = new WeightPredictionAI();

// 初期化関数
window.initWeightAI = function(weightData) {
    const success = window.WeightAI.initialize(weightData);
    if (success) {
        log('🤖 AI分析システム初期化完了');
        return window.WeightAI.getAnalysisSummary();
    } else {
        log('❌ AI分析システム初期化失敗');
        return null;
    }
};

log('🤖 AI分析システム読み込み完了: ai-weight-analyzer.js');