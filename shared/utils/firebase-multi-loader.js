// Firebase複数パス読み込みユーティリティ
// データパスが不確定な場合の統合読み込み機能

window.FirebaseMultiLoader = {
    
    // 複数パスからデータを統合読み込み
    loadFromMultiplePaths: async function(userId, pathConfigs, options = {}) {
        const {
            logPrefix = '📊',
            sortFunction = null,
            debugMode = true
        } = options;
        
        return new Promise((resolve) => {
            let totalData = [];
            let pathChecked = 0;
            
            if (debugMode) {
                log(`${logPrefix} データパス確認開始 (${pathConfigs.length}パス)`);
            }
            
            pathConfigs.forEach((config, index) => {
                const path = `/users/${userId}/${config.path}`;
                
                if (debugMode) {
                    log(`🔍 パス確認[${index + 1}/${pathConfigs.length}]: ${path}`);
                }
                
                database.ref(path).once('value', (snapshot) => {
                    const data = snapshot.val();
                    
                    if (data) {
                        let dataArray = [];
                        
                        // データ形式の正規化
                        if (Array.isArray(data)) {
                            dataArray = data;
                        } else if (typeof data === 'object') {
                            dataArray = Object.values(data);
                        }
                        
                        // データ変換処理（オプション）
                        if (config.transform && typeof config.transform === 'function') {
                            dataArray = dataArray.map(config.transform);
                        }
                        
                        totalData = totalData.concat(dataArray);
                        
                        if (debugMode) {
                            log(`${logPrefix} データ発見(${config.name || path}): ${dataArray.length}件`);
                            
                            // サンプルデータ表示（デバッグ用）
                            if (dataArray.length > 0 && config.showSample) {
                                log(`${logPrefix} サンプル: ${JSON.stringify(dataArray[0])}`);
                            }
                        }
                    } else {
                        if (debugMode) {
                            log(`${logPrefix} データなし(${config.name || path})`);
                        }
                    }
                    
                    pathChecked++;
                    if (pathChecked === pathConfigs.length) {
                        // ソート処理（オプション）
                        if (sortFunction && typeof sortFunction === 'function') {
                            totalData.sort(sortFunction);
                        }
                        
                        if (debugMode) {
                            log(`${logPrefix} データ統合完了: ${totalData.length}件`);
                        }
                        
                        resolve(totalData);
                    }
                }).catch((error) => {
                    if (debugMode) {
                        log(`❌ 読み込みエラー(${config.name || path}): ${error.message}`);
                    }
                    
                    pathChecked++;
                    if (pathChecked === pathConfigs.length) {
                        resolve(totalData);
                    }
                });
            });
        });
    },
    
    // よく使用されるパス設定集
    getCommonPathConfigs: function() {
        return {
            weight: [
                { path: 'weightData/', name: '体重データ(標準)', showSample: true },
                { path: 'weights/', name: '体重データ(簡略)' },
                { path: 'weightRecords/', name: '体重レコード' },
                { path: 'bodyWeight/', name: 'ボディ体重' }
            ],
            
            sleep: [
                { path: 'sleepData/', name: '睡眠データ(標準)', showSample: true },
                { path: 'sleeps/', name: '睡眠データ(簡略)' },
                { path: 'sleepRecords/', name: '睡眠レコード' }
            ],
            
            room: [
                { path: 'roomData/', name: '部屋データ(標準)' },
                { path: 'roomManagement/', name: '部屋管理' },
                { path: 'cleaningTasks/', name: '掃除タスク' },
                { path: 'cleaningData/', name: '掃除データ' }
            ],
            
            memo: [
                { path: 'memoData/', name: 'メモデータ(標準)' },
                { path: 'memos/', name: 'メモ(簡略)' },
                { path: 'taskData/', name: 'タスクデータ' },
                { path: 'jobdcData/', name: 'JOB_DCデータ' },
                { path: 'notes/', name: 'ノート' }
            ],
            
            pedometer: [
                { path: 'pedometerData/', name: '万歩計データ(標準)' },
                { path: 'stepData/', name: 'ステップデータ' },
                { path: 'walkingData/', name: 'ウォーキングデータ' }
            ]
        };
    },
    
    // 簡易読み込み関数（よく使用されるパターン）
    loadWeightData: async function(userId) {
        const configs = this.getCommonPathConfigs().weight;
        return await this.loadFromMultiplePaths(userId, configs, {
            logPrefix: '📊',
            sortFunction: (a, b) => new Date(a.date + ' ' + (a.time || '00:00')) - new Date(b.date + ' ' + (b.time || '00:00'))
        });
    },
    
    loadSleepData: async function(userId) {
        const configs = this.getCommonPathConfigs().sleep;
        return await this.loadFromMultiplePaths(userId, configs, {
            logPrefix: '🛏️',
            sortFunction: (a, b) => new Date(a.date) - new Date(b.date)
        });
    },
    
    loadRoomData: async function(userId) {
        const configs = this.getCommonPathConfigs().room;
        return await this.loadFromMultiplePaths(userId, configs, {
            logPrefix: '🏠'
        });
    },
    
    loadMemoData: async function(userId) {
        const configs = this.getCommonPathConfigs().memo;
        return await this.loadFromMultiplePaths(userId, configs, {
            logPrefix: '📝'
        });
    },
    
    // カスタムパス設定での読み込み
    loadCustomData: async function(userId, tabName, customPaths) {
        const configs = customPaths.map(path => ({
            path: path,
            name: `${tabName}(${path})`
        }));
        
        return await this.loadFromMultiplePaths(userId, configs, {
            logPrefix: `🔧 ${tabName}`
        });
    }
};

// グローバル公開
window.FIREBASE_MULTI_LOADER = window.FirebaseMultiLoader;

log('✅ Firebase複数パス読み込みユーティリティ読み込み完了');