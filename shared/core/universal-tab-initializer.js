// 統一タブ初期化システム
// 全タブの初期化処理を標準化し、コード重複を大幅削減

class UniversalTabInitializer {
    
    // タブ初期化の統一処理
    static async initTab(tabConfig) {
        const { 
            tabNumber, 
            tabName, 
            collection, 
            requiredFields = [], 
            optionalFields = [], 
            customInit,
            dataLoader,
            defaultValues = {}
        } = tabConfig;
        
        console.log(`🔄 ${tabName}タブ初期化開始...`);
        
        try {
            // 1. 認証確認
            if (!currentUser) {
                console.log(`⚠️ ${tabName}タブ: ログインが必要です`);
                return false;
            }
            
            // 2. 日付・時刻デフォルト値設定
            await this.setDefaultDateTime(tabNumber, defaultValues);
            
            // 3. 必須・任意フィールドのバッジ設定
            await this.setupFieldBadges(requiredFields, optionalFields);
            
            // 4. カスタム項目復元
            await this.restoreCustomItems(tabNumber);
            
            // 5. タブ固有の初期化処理
            if (customInit && typeof customInit === 'function') {
                await customInit();
            }
            
            // 6. データ読み込み
            if (dataLoader && typeof dataLoader === 'function') {
                await dataLoader(currentUser.uid);
            } else if (collection) {
                await this.loadStandardData(collection, currentUser.uid);
            }
            
            console.log(`✅ ${tabName}タブ初期化完了`);
            return true;
            
        } catch (error) {
            console.error(`❌ ${tabName}タブ初期化エラー:`, error);
            return false;
        }
    }
    
    // 日付・時刻デフォルト値設定
    static async setDefaultDateTime(tabNumber, defaults = {}) {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeString = today.toTimeString().slice(0, 5); // HH:MM
        
        // 共通的な日付・時刻フィールドを設定
        const dateFields = ['dateInput', `tab${tabNumber}DateInput`, 'sleepDateInput', 'roomDateInput', 'pedometerDateInput'];
        const timeFields = ['timeInput', `tab${tabNumber}TimeInput`, 'sleepTimeInput', 'roomTimeInput', 'pedometerTimeInput'];
        
        dateFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = todayString;
                console.log(`📅 日付設定: ${fieldId} = ${todayString}`);
            }
        });
        
        timeFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value) {
                field.value = timeString;
                console.log(`⏰ 時刻設定: ${fieldId} = ${timeString}`);
            }
        });
        
        // タブ固有のデフォルト値
        Object.entries(defaults).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && !field.value) {
                field.value = value;
                console.log(`🎯 デフォルト値設定: ${fieldId} = ${value}`);
            }
        });
    }
    
    // フィールドバッジ設定
    static async setupFieldBadges(requiredFields, optionalFields) {
        if (typeof window.markRequiredFields === 'function') {
            const fieldConfig = {
                required: requiredFields,
                optional: optionalFields
            };
            
            try {
                window.markRequiredFields(fieldConfig);
                console.log(`🏷️ フィールドバッジ設定完了: 必須${requiredFields.length}項目、任意${optionalFields.length}項目`);
            } catch (error) {
                console.log(`⚠️ バッジ適用スキップ: ${error.message}`);
            }
        }
    }
    
    // カスタム項目復元
    static async restoreCustomItems(tabNumber) {
        if (typeof window.loadCustomItems === 'function') {
            try {
                window.loadCustomItems();
                console.log(`🔄 カスタム項目復元完了: タブ${tabNumber}`);
            } catch (error) {
                console.log(`⚠️ カスタム項目復元スキップ: ${error.message}`);
            }
        }
    }
    
    // 標準データ読み込み
    static async loadStandardData(collection, userId) {
        try {
            const snapshot = await FirebaseCRUD.once(collection, userId);
            const data = snapshot.val();
            
            if (data) {
                const dataArray = Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
                console.log(`📊 ${collection}データ読み込み完了: ${dataArray.length}件`);
                return dataArray;
            } else {
                console.log(`📊 ${collection}: データなし（新規ユーザー）`);
                return [];
            }
        } catch (error) {
            console.error(`❌ ${collection}データ読み込みエラー:`, error);
            return [];
        }
    }
    
    // 共通エラーハンドリング
    static handleError(tabName, operation, error) {
        const message = `❌ ${tabName}タブ ${operation}エラー: ${error.message}`;
        console.error(message);
        if (typeof log === 'function') {
            log(message);
        }
        return false;
    }
    
    // エフェクト実行（共通化）
    static executeEffect(effectType, actionName, targetElement) {
        if (window.smartEffects && targetElement) {
            try {
                window.smartEffects.trigger(effectType, actionName, targetElement);
                console.log(`✨ エフェクト実行完了: ${effectType}.${actionName}`);
            } catch (error) {
                console.log(`⚠️ エフェクト実行失敗: ${error.message}`);
            }
        }
    }
}

// グローバルに公開
window.UniversalTabInitializer = UniversalTabInitializer;

// タブ設定プリセット
window.TAB_INIT_CONFIGS = {
    weight: {
        tabNumber: 1,
        tabName: '体重管理',
        collection: 'weights',
        requiredFields: ['dateInput', 'weightValue', 'selectedTiming'],
        optionalFields: ['timeInput', 'memoInput', 'selectedClothingTop', 'selectedClothingBottom'],
        defaultValues: {
            weightValue: '72.0'
        }
    },
    
    sleep: {
        tabNumber: 2, 
        tabName: '睡眠管理',
        collection: 'sleepData',
        requiredFields: ['sleepDateInput', 'sleepTimeInput'],
        optionalFields: ['selectedSleepType', 'selectedQuality', 'selectedSleepTags', 'sleepMemoInput']
    },
    
    room: {
        tabNumber: 3,
        tabName: '部屋片付け', 
        collection: 'roomData',
        requiredFields: ['roomDateInput', 'selectedRoom', 'roomDuration'],
        optionalFields: ['roomTimeInput', 'roomMemoInput', 'selectedAchievement']
    },
    
    stretch: {
        tabNumber: 4,
        tabName: 'ストレッチ',
        collection: 'stretchData', 
        requiredFields: ['stretchDateInput', 'selectedStretchType', 'stretchDuration'],
        optionalFields: ['stretchTimeInput', 'selectedIntensity', 'selectedBodyParts', 'stretchMemoInput']
    },
    
    pedometer: {
        tabNumber: 7,
        tabName: '万歩計',
        collection: 'pedometerData',
        requiredFields: ['pedometerDateInput', 'stepsInput', 'selectedExerciseType'],
        optionalFields: ['pedometerTimeInput', 'distanceInput', 'caloriesInput', 'pedometerMemoInput']
    },
    
    memoList: {
        tabNumber: 8,
        tabName: 'メモリスト',
        collection: 'memos',
        requiredFields: ['newMemoText'],
        optionalFields: ['memoCategory', 'memoPriority', 'memoTimeframe', 'deadlineInput']
    },
    
    jobDC: {
        tabNumber: 6,
        tabName: 'JOB_DC',
        collection: 'jobTasks',
        requiredFields: ['jobTaskText', 'selectedSkillType'],
        optionalFields: ['selectedTaskPriority', 'selectedEstimatedTime', 'selectedTags']
    }
};

console.log('🚀 統一タブ初期化システム読み込み完了');