// メモリストタブ - UniversalTaskManager使用版

// グローバル変数
let memoTaskManager = null;

// 互換性のためのエイリアス
window.memoData = [];
window.saveMemoData = function() {
    if (memoTaskManager) {
        const newTask = {
            text: document.getElementById('memoTaskManager_newTaskText').value,
            category: document.getElementById('memoTaskManager_taskCategory').value,
            priority: document.getElementById('memoTaskManager_taskPriority').value,
            timeframe: document.getElementById('memoTaskManager_taskTimeframe').value,
            deadline: document.getElementById('memoTaskManager_taskDeadline').value
        };
        
        if (!newTask.text.trim()) {
            alert('メモ内容を入力してください');
            return;
        }
        
        // 直接saveTaskを呼び出す
        window[`memoTaskManager_saveTask`]();
    } else {
        log('❌ memoTaskManager not initialized');
    }
};

// メモカテゴリ定義
const memoCategories = [
    { value: '', label: '選択なし' },
    { value: 'アイデア', label: '💡 アイデア' },
    { value: 'やること', label: '✅ やること' },
    { value: '考え事', label: '🤔 考え事' },
    { value: 'メモ', label: '📝 メモ' },
    { value: '重要', label: '⚠️ 重要' },
    { value: 'その他', label: '📋 その他' }
];

// フィールド設定（field-validationチェッカー対応）
window.MEMO_FIELD_CONFIG = {
    required: ['newMemoText'],
    optional: ['memoCategory', 'memoPriority', 'memoTimeframe', 'deadlineInput']
};

// 初期化
function initMemoListTab() {
    console.log('メモリストタブ初期化開始...');
    
    // UniversalTaskManager作成
    memoTaskManager = new UniversalTaskManager({
        containerId: 'memoTaskManager',
        dataPath: 'memos',
        title: '📝 メモリスト',
        categories: memoCategories,
        onSave: (task) => {
            // スマートエフェクト
            if (window.smartEffects) {
                const btn = document.querySelector('#memoTaskManager_addTaskBtn');
                if (btn) {
                    window.smartEffects.trigger('memo', 'save', btn);
                }
            }
            log(`💾 メモ保存: ${task.text.substring(0, 20)}...`);
            updateMemoStats();
        },
        onLoad: (tasks) => {
            console.log('📋 メモ読み込み完了:', tasks.length, '件');
            window.memoData = tasks; // 互換性のため
            updateMemoStats();
        },
        onDelete: (taskId) => {
            log(`🗑️ メモ削除: ID ${taskId}`);
            updateMemoStats();
        }
    });
    
    // 初期化実行
    memoTaskManager.init();
    
    // Tab8固有機能を有効化
    // memoTaskManager.enableCharacterFilter(); // 削除：文字フィルター機能は不要
    memoTaskManager.enableMultiKeywordFilter();
    
    // 統計情報の定期更新
    setInterval(updateMemoStats, 30000); // 30秒ごと
    
    console.log('メモリストタブ初期化完了');
}

// 統計情報更新
function updateMemoStats() {
    if (!memoTaskManager || !memoTaskManager.taskData) return;
    
    const tasks = memoTaskManager.taskData;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    let todayCount = 0;
    let weekCount = 0;
    let priorityCount = 0;
    
    tasks.forEach(task => {
        const taskDate = new Date(task.timestamp);
        taskDate.setHours(0, 0, 0, 0);
        
        if (taskDate.getTime() === today.getTime()) {
            todayCount++;
        }
        
        if (taskDate >= weekStart) {
            weekCount++;
        }
        
        if (task.priority === 'S' || task.priority === 'A') {
            priorityCount++;
        }
    });
    
    // DOM更新
    const totalCount = document.getElementById('totalMemoCount');
    const todayElement = document.getElementById('todayMemoCount');
    const weekElement = document.getElementById('weekMemoCount');
    const priorityElement = document.getElementById('priorityMemoCount');
    
    if (totalCount) totalCount.textContent = tasks.length;
    if (todayElement) todayElement.textContent = todayCount;
    if (weekElement) weekElement.textContent = weekCount;
    if (priorityElement) priorityElement.textContent = priorityCount;
}

// 旧API互換性のための関数（段階的廃止予定）
window.addMemo = function() {
    window.saveMemoData();
};

window.filterMemos = function() {
    // UniversalTaskManagerの検索機能にリダイレクト
    const filterInput = document.getElementById('memoFilter');
    const universalFilterInput = document.getElementById('memoTaskManager_taskFilter');
    if (filterInput && universalFilterInput) {
        universalFilterInput.value = filterInput.value;
        window[`memoTaskManager_filterTasks`]();
    }
};

window.clearFilter = function() {
    const filterInput = document.getElementById('memoFilter');
    const universalFilterInput = document.getElementById('memoTaskManager_taskFilter');
    if (filterInput) filterInput.value = '';
    if (universalFilterInput) {
        universalFilterInput.value = '';
        window[`memoTaskManager_filterTasks`]();
    }
};

window.copyAllMemos = function() {
    if (memoTaskManager) {
        memoTaskManager.copyAllTasks();
    }
};

window.toggleIntegrationMode = function() {
    if (memoTaskManager) {
        memoTaskManager.toggleIntegrationMode();
    }
};

// loadMemoData関数を定義（tab-systemとの互換性）
function loadMemoData() {
    if (memoTaskManager) {
        // 既に初期化されている場合はデータを再読み込み
        memoTaskManager.loadTasks();
        log('✅ メモデータ再読み込み実行');
    } else {
        // 初期化されていない場合は初期化を実行
        initMemoListTab();
        log('✅ メモリストタブ初期化実行');
    }
}

// グローバル関数として登録
window.initMemoListTab = initMemoListTab;
window.loadMemoData = loadMemoData;