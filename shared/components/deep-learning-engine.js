// 🧠 Deep Learning Engine - TensorFlow.js統合版
// 体重予測・分析・学習機能を提供

// Deep Learning システム管理
class DeepLearningEngine {
    constructor() {
        this.model = null;
        this.isModelReady = false;
        this.trainingData = [];
        this.predictionHistory = [];
        this.modelMetrics = {
            accuracy: 0,
            loss: 0,
            trainingEpochs: 0,
            lastTrained: null
        };
        
        log('🧠 Deep Learning Engine初期化開始');
        this.initializeEngine();
    }

    // Deep Learning Engine初期化
    async initializeEngine() {
        try {
            // TensorFlow.js準備確認
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js が読み込まれていません');
            }
            
            log(`🧠 TensorFlow.js v${tf.version.tfjs} 読み込み完了`);
            
            // デフォルトモデル構築
            await this.buildModel();
            
            log('✅ Deep Learning Engine初期化完了');
            
        } catch (error) {
            log(`❌ Deep Learning Engine初期化エラー: ${error.message}`);
        }
    }

    // ニューラルネットワークモデル構築
    async buildModel() {
        log('🔧 体重予測モデル構築開始');
        
        try {
            // Sequential モデル作成
            this.model = tf.sequential({
                layers: [
                    // 入力層：過去データ（体重、日付、曜日、時間等）
                    tf.layers.dense({
                        inputShape: [10], // 10個の特徴量
                        units: 64,
                        activation: 'relu',
                        name: 'input_layer'
                    }),
                    
                    // 隠れ層1：深い学習
                    tf.layers.dense({
                        units: 128,
                        activation: 'relu',
                        name: 'hidden_layer_1'
                    }),
                    
                    // Dropout層：過学習防止
                    tf.layers.dropout({
                        rate: 0.2,
                        name: 'dropout_1'
                    }),
                    
                    // 隠れ層2：パターン認識
                    tf.layers.dense({
                        units: 64,
                        activation: 'relu',
                        name: 'hidden_layer_2'
                    }),
                    
                    // Dropout層2
                    tf.layers.dropout({
                        rate: 0.1,
                        name: 'dropout_2'
                    }),
                    
                    // 隠れ層3：細かな調整
                    tf.layers.dense({
                        units: 32,
                        activation: 'relu',
                        name: 'hidden_layer_3'
                    }),
                    
                    // 出力層：体重予測
                    tf.layers.dense({
                        units: 1,
                        activation: 'linear',
                        name: 'output_layer'
                    })
                ]
            });
            
            // モデルコンパイル
            this.model.compile({
                optimizer: tf.train.adam(0.001), // Adamオプティマイザー
                loss: 'meanSquaredError',
                metrics: ['mae', 'mse']
            });
            
            this.isModelReady = true;
            log('✅ 深層学習モデル構築完了');
            log(`📊 モデル概要: ${this.model.layers.length}層, パラメータ数: ${this.model.countParams()}`);
            
        } catch (error) {
            log(`❌ モデル構築エラー: ${error.message}`);
        }
    }

    // 特徴量エンジニアリング
    prepareFeatures(weightData) {
        if (!weightData || weightData.length < 2) {
            return [];
        }

        const features = [];
        
        // 時系列データを特徴量に変換
        for (let i = 1; i < weightData.length; i++) {
            const current = weightData[i];
            const previous = weightData[i - 1];
            const date = new Date(current.date);
            
            // 10個の特徴量
            const feature = [
                parseFloat(previous.weight) || 70,                    // 前回体重
                i,                                                   // データ順序（時間経過）
                date.getDay(),                                       // 曜日 (0-6)
                date.getDate(),                                      // 日付 (1-31)
                date.getMonth() + 1,                                 // 月 (1-12)
                date.getHours() || 12,                              // 時間 (0-23)
                current.clothing === 'light' ? 0 : 1,              // 服装 (軽装=0, 重装=1)
                current.timing === 'morning' ? 0 : 1,              // 測定時刻 (朝=0, 夜=1)
                current.note && current.note.length > 0 ? 1 : 0,   // メモ有無
                Math.random() * 0.1 - 0.05                         // ノイズ追加
            ];
            
            features.push({
                input: feature,
                output: parseFloat(current.weight) || 70
            });
        }
        
        return features;
    }

    // モデル訓練
    async trainModel(weightData) {
        if (!this.isModelReady) {
            log('❌ モデルが準備されていません');
            return false;
        }

        log('🎓 Deep Learning モデル訓練開始');
        
        try {
            // 特徴量準備
            const features = this.prepareFeatures(weightData);
            
            if (features.length < 5) {
                log('⚠️ 訓練データが不足しています（最低5件必要）');
                return false;
            }

            // データをテンソルに変換
            const inputData = features.map(f => f.input);
            const outputData = features.map(f => f.output);
            
            const xs = tf.tensor2d(inputData);
            const ys = tf.tensor1d(outputData);
            
            // 訓練実行
            const history = await this.model.fit(xs, ys, {
                epochs: 50,
                batchSize: Math.min(8, features.length),
                validationSplit: 0.2,
                shuffle: true,
                verbose: 0,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        if (epoch % 10 === 9) {
                            log(`🎓 エポック ${epoch + 1}/50: loss=${logs.loss.toFixed(4)}, mae=${logs.mae.toFixed(4)}`);
                        }
                    }
                }
            });
            
            // メトリクス更新
            const finalLoss = history.history.loss[history.history.loss.length - 1];
            const finalMae = history.history.mae[history.history.mae.length - 1];
            
            this.modelMetrics = {
                accuracy: Math.max(0, (1 - finalMae / 10) * 100), // MAEから精度計算
                loss: finalLoss,
                trainingEpochs: this.modelMetrics.trainingEpochs + 50,
                lastTrained: new Date(),
                dataPoints: features.length
            };
            
            // テンソル解放
            xs.dispose();
            ys.dispose();
            
            log(`✅ モデル訓練完了: 精度=${this.modelMetrics.accuracy.toFixed(1)}%, Loss=${finalLoss.toFixed(4)}`);
            return true;
            
        } catch (error) {
            log(`❌ モデル訓練エラー: ${error.message}`);
            return false;
        }
    }

    // 体重予測
    async predictWeight(weightData, daysAhead = 7) {
        if (!this.isModelReady || !weightData.length) {
            return null;
        }

        try {
            const features = this.prepareFeatures(weightData);
            if (features.length === 0) return null;

            const predictions = [];
            let lastData = weightData[weightData.length - 1];
            
            for (let day = 1; day <= daysAhead; day++) {
                const futureDate = new Date(lastData.date);
                futureDate.setDate(futureDate.getDate() + day);
                
                // 未来の特徴量生成
                const futureFeature = [
                    parseFloat(lastData.weight),
                    features.length + day,
                    futureDate.getDay(),
                    futureDate.getDate(),
                    futureDate.getMonth() + 1,
                    12, // デフォルト時間
                    0,  // 軽装想定
                    0,  // 朝の測定想定
                    0,  // メモなし
                    0   // ノイズなし
                ];
                
                // 予測実行
                const inputTensor = tf.tensor2d([futureFeature]);
                const prediction = this.model.predict(inputTensor);
                const predictedWeight = await prediction.data();
                
                predictions.push({
                    date: futureDate.toISOString().split('T')[0],
                    weight: Math.round(predictedWeight[0] * 10) / 10,
                    confidence: Math.max(0.6, 0.95 - (day * 0.05)), // 日数が経つほど信頼度低下
                    type: 'prediction'
                });
                
                // 次の予測のために更新
                lastData = {
                    date: futureDate.toISOString().split('T')[0],
                    weight: predictedWeight[0]
                };
                
                // テンソル解放
                inputTensor.dispose();
                prediction.dispose();
            }
            
            log(`🔮 ${daysAhead}日間の体重予測完了`);
            return predictions;
            
        } catch (error) {
            log(`❌ 体重予測エラー: ${error.message}`);
            return null;
        }
    }

    // 高度な分析
    async analyzePattern(weightData) {
        if (!weightData || weightData.length < 7) {
            return null;
        }

        try {
            const weights = weightData.map(d => parseFloat(d.weight)).filter(w => !isNaN(w));
            const dates = weightData.map(d => new Date(d.date));
            
            // 深層学習による複雑パターン解析
            const analysis = {
                // トレンド検出
                trend: {
                    direction: this.detectTrend(weights),
                    strength: this.calculateTrendStrength(weights),
                    cyclicity: this.detectCyclicity(weights)
                },
                
                // 異常値検出
                anomalies: this.detectAnomalies(weights),
                
                // 季節性分析
                seasonality: this.analyzeSeasonality(weightData),
                
                // 変動パターン
                volatility: {
                    score: this.calculateVolatility(weights),
                    stability: this.calculateStability(weights)
                },
                
                // 予測精度
                modelPerformance: {
                    accuracy: this.modelMetrics.accuracy,
                    confidence: this.calculateConfidence(weights),
                    reliability: this.modelMetrics.trainingEpochs > 50 ? 'high' : 'medium'
                }
            };
            
            return analysis;
            
        } catch (error) {
            log(`❌ パターン分析エラー: ${error.message}`);
            return null;
        }
    }

    // トレンド検出
    detectTrend(weights) {
        const n = weights.length;
        let upCount = 0, downCount = 0;
        
        for (let i = 1; i < n; i++) {
            if (weights[i] > weights[i-1]) upCount++;
            else if (weights[i] < weights[i-1]) downCount++;
        }
        
        if (upCount > downCount * 1.2) return 'increasing';
        if (downCount > upCount * 1.2) return 'decreasing';
        return 'stable';
    }

    // トレンド強度計算
    calculateTrendStrength(weights) {
        const n = weights.length;
        if (n < 2) return 0;
        
        const slope = (weights[n-1] - weights[0]) / n;
        return Math.min(1, Math.abs(slope) * 10);
    }

    // 周期性検出
    detectCyclicity(weights) {
        // 簡単な周期性検出（週次パターン等）
        if (weights.length < 14) return 0;
        
        let cyclicity = 0;
        const weeklyPattern = [];
        
        for (let i = 0; i < 7; i++) {
            const dayWeights = [];
            for (let j = i; j < weights.length; j += 7) {
                dayWeights.push(weights[j]);
            }
            weeklyPattern.push(dayWeights.reduce((a, b) => a + b, 0) / dayWeights.length);
        }
        
        // 曜日間の変動を計算
        const variance = this.calculateVariance(weeklyPattern);
        cyclicity = Math.min(1, variance / 2);
        
        return cyclicity;
    }

    // 異常値検出
    detectAnomalies(weights) {
        const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
        const std = Math.sqrt(this.calculateVariance(weights));
        
        return weights.map((weight, index) => ({
            index,
            weight,
            isAnomaly: Math.abs(weight - mean) > 2 * std,
            zScore: (weight - mean) / std
        })).filter(item => item.isAnomaly);
    }

    // 季節性分析
    analyzeSeasonality(weightData) {
        const monthlyData = {};
        
        weightData.forEach(data => {
            const month = new Date(data.date).getMonth();
            if (!monthlyData[month]) monthlyData[month] = [];
            monthlyData[month].push(parseFloat(data.weight));
        });
        
        const monthlyAvg = {};
        Object.keys(monthlyData).forEach(month => {
            monthlyAvg[month] = monthlyData[month].reduce((a, b) => a + b, 0) / monthlyData[month].length;
        });
        
        return monthlyAvg;
    }

    // 変動性計算
    calculateVolatility(weights) {
        if (weights.length < 2) return 0;
        
        const returns = [];
        for (let i = 1; i < weights.length; i++) {
            returns.push((weights[i] - weights[i-1]) / weights[i-1]);
        }
        
        return Math.sqrt(this.calculateVariance(returns));
    }

    // 安定性計算
    calculateStability(weights) {
        const volatility = this.calculateVolatility(weights);
        return Math.max(0, 1 - volatility * 10);
    }

    // 信頼度計算
    calculateConfidence(weights) {
        const stability = this.calculateStability(weights);
        const dataQuality = Math.min(1, weights.length / 30);
        const modelQuality = this.modelMetrics.accuracy / 100;
        
        return (stability * 0.4 + dataQuality * 0.3 + modelQuality * 0.3) * 100;
    }

    // 分散計算ヘルパー
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    // モデル状態取得
    getModelStatus() {
        return {
            isReady: this.isModelReady,
            metrics: this.modelMetrics,
            hasModel: this.model !== null,
            tensorflowVersion: typeof tf !== 'undefined' ? tf.version.tfjs : 'not loaded'
        };
    }
}

// グローバルインスタンス
window.DeepLearningEngine = new DeepLearningEngine();

log('🧠 Deep Learning Engine モジュール読み込み完了');