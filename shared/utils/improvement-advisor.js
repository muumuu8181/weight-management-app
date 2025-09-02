// 改善アドバイスシステム - 汎用アドバイス生成ユーティリティ
// 各種データ分析結果から的確なアドバイスを自動生成

window.ImprovementAdvisor = {
    
    // 体重管理アドバイス
    getWeightAdvice: function(trend, currentWeight, targetWeight = null) {
        const adviceMap = {
            'trend-up': [
                '素晴らしい進歩です！この調子で継続しましょう。',
                '順調に減量できています。現在の生活習慣を維持してください。',
                '目標に向かって着実に進んでいます！'
            ],
            'trend-down': [
                '食事内容や運動習慣を見直してみましょう。',
                '記録を継続して、変化のパターンを把握しましょう。',
                '小さな変化から始めて、徐々に改善していきましょう。'
            ],
            'trend-stable': [
                '現状維持できています。長期的な目標を設定してみましょう。',
                '安定した記録ができています。次のステップを検討しましょう。',
                '継続は力なり。記録習慣が身についています。'
            ]
        };
        
        const baseAdvice = this.getRandomAdvice(adviceMap[trend.class] || adviceMap['trend-stable']);
        
        // 目標体重が設定されている場合の追加アドバイス
        if (targetWeight && currentWeight) {
            const diff = currentWeight - targetWeight;
            if (Math.abs(diff) < 1) {
                return baseAdvice + ' 目標体重まであと少しです！';
            } else if (diff > 5) {
                return baseAdvice + ' 中長期的な計画を立てて取り組みましょう。';
            }
        }
        
        return baseAdvice;
    },
    
    // 睡眠管理アドバイス
    getSleepAdvice: function(trend, avgQuality, avgDuration = null) {
        const adviceMap = {
            'trend-up': [
                '睡眠の質が向上しています！現在の生活リズムを維持しましょう。',
                '良質な睡眠が取れています。この調子で継続してください。',
                '睡眠習慣が改善されています。素晴らしい成果です！'
            ],
            'trend-down': [
                '就寝時間や睡眠環境を見直してみましょう。',
                'ストレス管理や運動習慣が睡眠に影響している可能性があります。',
                'スクリーンタイムの減少やリラックス時間の確保を検討しましょう。'
            ],
            'trend-stable': [
                '安定した睡眠パターンが維持できています。',
                '現在の睡眠習慣を基盤に、質の向上を目指しましょう。',
                '睡眠記録の継続が習慣化されています。'
            ]
        };
        
        let advice = this.getRandomAdvice(adviceMap[trend.class] || adviceMap['trend-stable']);
        
        // 睡眠時間に基づく追加アドバイス
        if (avgDuration) {
            if (avgDuration < 6) {
                advice += ' 睡眠時間の確保を優先しましょう。';
            } else if (avgDuration > 9) {
                advice += ' 睡眠時間が長めです。睡眠の質を重視しましょう。';
            }
        }
        
        return advice;
    },
    
    // タスク管理アドバイス
    getTaskAdvice: function(trend, completionRate, activityLevel) {
        const adviceMap = {
            'trend-up': [
                'タスク完了率が高く、順調に進んでいます！',
                '効率的にタスクをこなせています。この調子で継続しましょう。',
                '目標達成に向けて着実に前進しています。'
            ],
            'trend-down': [
                'タスクの優先順位を見直してみましょう。',
                '小さなタスクから始めて、達成感を積み重ねましょう。',
                'タスクの分割や時間管理を改善しましょう。'
            ],
            'trend-stable': [
                '安定したペースでタスクに取り組めています。',
                '現在のペースを維持しつつ、効率化を検討しましょう。',
                'タスク管理の習慣が身についています。'
            ]
        };
        
        let advice = this.getRandomAdvice(adviceMap[trend.class] || adviceMap['trend-stable']);
        
        // 完了率に基づく追加アドバイス
        if (completionRate < 0.3) {
            advice += ' タスクの量や難易度を調整することを検討しましょう。';
        } else if (completionRate > 0.9) {
            advice += ' 高い完了率です。新しい挑戦を加えてみましょう。';
        }
        
        return advice;
    },
    
    // メモ・アイデア管理アドバイス
    getMemoAdvice: function(trend, totalCount, categoryDistribution = {}) {
        const adviceMap = {
            'trend-up': [
                'アイデアや考えの記録が活発です！',
                '思考の記録習慣が身についています。',
                'メモ活動が増加傾向にあります。'
            ],
            'trend-down': [
                'メモ習慣を再開してみましょう。小さなことでも記録しましょう。',
                '日々の気づきを記録する習慣を取り戻しましょう。',
                '定期的なメモ時間を設けることを検討しましょう。'
            ],
            'trend-stable': [
                '安定してメモを記録できています。',
                'メモ習慣が定着しています。内容の質に注目しましょう。',
                '継続的な記録ができています。'
            ]
        };
        
        let advice = this.getRandomAdvice(adviceMap[trend.class] || adviceMap['trend-stable']);
        
        // メモ数に基づく追加アドバイス
        if (totalCount > 100) {
            advice += ' 豊富なメモが蓄積されています。定期的な整理・分類を検討しましょう。';
        } else if (totalCount < 10) {
            advice += ' メモを習慣化することで、アイデアの蓄積ができます。';
        }
        
        return advice;
    },
    
    // 総合改善スコア算出
    calculateOverallScore: function(trendResults) {
        if (!trendResults || trendResults.length === 0) {
            return { score: 0, level: 'unknown', message: 'データ不足' };
        }
        
        const totalScore = trendResults.reduce((sum, result) => sum + (result.score || 50), 0);
        const averageScore = Math.round(totalScore / trendResults.length);
        
        let level, message, colorClass;
        
        if (averageScore >= 80) {
            level = 'excellent';
            message = '非常に良好！';
            colorClass = 'score-excellent';
        } else if (averageScore >= 70) {
            level = 'good';
            message = '順調です';
            colorClass = 'score-good';
        } else if (averageScore >= 50) {
            level = 'average';
            message = '普通';
            colorClass = 'score-average';
        } else if (averageScore >= 30) {
            level = 'poor';
            message = '改善の余地あり';
            colorClass = 'score-poor';
        } else {
            level = 'bad';
            message = 'より一層の努力を';
            colorClass = 'score-bad';
        }
        
        return {
            score: averageScore,
            level: level,
            message: message,
            colorClass: colorClass,
            details: trendResults
        };
    },
    
    // カテゴリ別アドバイス生成
    getCategoryAdvice: function(category, data, options = {}) {
        switch(category.toLowerCase()) {
            case 'weight':
            case '体重':
                return this.getWeightAdvice(data.trend, data.current, options.target);
                
            case 'sleep':
            case '睡眠':
                return this.getSleepAdvice(data.trend, data.avgQuality, data.avgDuration);
                
            case 'task':
            case 'room':
            case 'タスク':
            case '部屋':
                return this.getTaskAdvice(data.trend, data.completionRate, data.activityLevel);
                
            case 'memo':
            case 'メモ':
                return this.getMemoAdvice(data.trend, data.totalCount, data.categoryDistribution);
                
            default:
                return '継続的な記録と改善を心がけましょう。';
        }
    },
    
    // ランダムアドバイス選択
    getRandomAdvice: function(adviceArray) {
        if (!adviceArray || adviceArray.length === 0) {
            return '継続的な取り組みを続けましょう。';
        }
        
        const randomIndex = Math.floor(Math.random() * adviceArray.length);
        return adviceArray[randomIndex];
    },
    
    // 改善提案生成
    generateImprovementSuggestions: function(allTrendData) {
        const suggestions = [];
        
        allTrendData.forEach(trendData => {
            if (trendData.score < 50) {
                suggestions.push(`${trendData.category}: ${this.getCategoryAdvice(trendData.category, trendData)}`);
            }
        });
        
        if (suggestions.length === 0) {
            suggestions.push('全体的に良好な状況です。現在の習慣を維持しましょう。');
        }
        
        return suggestions;
    }
};

// グローバル公開
window.IMPROVEMENT_ADVISOR = window.ImprovementAdvisor;

log('✅ 改善アドバイスシステム読み込み完了');