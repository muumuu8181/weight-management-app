// JOB_DC タブ専用JavaScript

// グローバル変数
let jobTasks = [];
let selectedSkillType = '';
let selectedTaskPriority = '';
let selectedEstimatedTime = '';
let selectedAutomationGoal = '';
let selectedTaskCategory = '';
let categorySelector = null;
let timeTracker = null;
let workTimeRecords = [];

// 初期化
function initJobDCTab() {
    console.log('JOB_DC タブを初期化中...');
    
    // カテゴリセレクター初期化
    initCategorySelector();
    
    // 作業時間トラッカー初期化
    initTimeTracker();
    
    // Firebase接続確認
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('JOB_DC: Firebase認証済み');
                loadJobTasks();
                loadWorkTimeRecords();
                updateTodayStats();
                updateAutomationProgress();
            } else {
                console.log('JOB_DC: Firebase認証待機中');
            }
        });
    } else {
        console.log('JOB_DC: Firebase未初期化');
    }
}

// 作業時間トラッカー初期化
function initTimeTracker() {
    // 作業カテゴリ定義
    const workCategories = [
        { name: 'コーディング', color: '#007bff' },
        { name: 'フォルダ整理', color: '#28a745' },
        { name: 'ミーティング', color: '#ffc107' },
        { name: 'メール・連絡', color: '#17a2b8' },
        { name: '学習・調査', color: '#6f42c1' },
        { name: '設定・メンテナンス', color: '#fd7e14' },
        { name: 'ドキュメント作成', color: '#e83e8c' },
        { name: '打ち合わせ準備', color: '#20c997' }
    ];
    
    // TimeTrackerインスタンス作成
    timeTracker = new TimeTracker({
        containerId: 'timeTrackerContainer',
        categories: workCategories,
        onSave: saveWorkTimeRecord,
        onStart: (category, startTime) => {
            addToOperationLog(`⏱️ 作業開始: ${category}`);
        },
        onStop: (category, endTime, durationSeconds) => {
            addToOperationLog(`⏹️ 作業終了: ${category} - ${formatDuration(durationSeconds)}`);
        }
    });
}

// カテゴリセレクター初期化
function initCategorySelector() {
    if (typeof UnifiedSelector === 'undefined') {
        console.error('UnifiedSelector が読み込まれていません');
        return;
    }
    
    categorySelector = new UnifiedSelector({
        containerId: 'categoryButtons',
        hiddenInputId: 'taskCategory',
        multiple: false,
        items: ['', '開発', '会議', '学習', '調査'],
        prefix: 'カテゴリ',
        onSelectionChange: (selection) => {
            selectedTaskCategory = selection;
            console.log('カテゴリ選択:', selection);
        }
    });
    
    categorySelector.initialize();
    console.log('カテゴリセレクター初期化完了');
}

// カテゴリ追加入力を表示
function showCategoryAddInput() {
    const inputArea = document.getElementById('categoryAddInput');
    const inputField = document.getElementById('newCategoryName');
    
    inputArea.style.display = 'block';
    inputField.value = '';
    inputField.focus();
    
    log('✨ カテゴリ追加入力表示');
}

// 新しいカテゴリを追加
function addNewCategory() {
    const inputField = document.getElementById('newCategoryName');
    const newCategoryName = inputField.value.trim();
    
    if (!newCategoryName) {
        alert('カテゴリ名を入力してください');
        return;
    }
    
    if (!categorySelector) {
        console.error('categorySelector が初期化されていません');
        return;
    }
    
    // カスタム項目追加（アイコンは📂を使用）
    const success = categorySelector.addCustomItem(newCategoryName, '📂');
    
    if (success) {
        // 追加後すぐに選択
        categorySelector.selectSingle(newCategoryName);
        
        // 入力エリアを非表示
        cancelCategoryAdd();
        
        // ログ出力
        log(`✅ カテゴリ追加成功: ${newCategoryName}`);
        
        // 永続化（将来的にFirebaseに保存）
        saveCategorySettings();
        
    } else {
        log(`❌ カテゴリ追加失敗: ${newCategoryName}`);
    }
}

// カテゴリ追加をキャンセル
function cancelCategoryAdd() {
    const inputArea = document.getElementById('categoryAddInput');
    const inputField = document.getElementById('newCategoryName');
    
    inputArea.style.display = 'none';
    inputField.value = '';
    
    log('✗ カテゴリ追加キャンセル');
}

// カテゴリ設定保存（将来的にFirebase対応）
async function saveCategorySettings() {
    try {
        // 現在のカスタムカテゴリを取得
        const customCategories = [];
        const categoryButtons = document.querySelectorAll('#categoryButtons button[data-original-color]');
        categoryButtons.forEach(button => {
            const value = button.getAttribute('data-value');
            if (value) {
                customCategories.push(value);
            }
        });
        
        console.log('カスタムカテゴリ保存:', customCategories);
        
        // 将来的にFirebaseに保存
        // const user = firebase.auth().currentUser;
        // await firebase.database().ref(`users/${user.uid}/customCategories`).set(customCategories);
        
    } catch (error) {
        console.error('カテゴリ設定保存エラー:', error);
    }
}

// 作業時間記録保存
async function saveWorkTimeRecord(data) {
    try {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            const user = firebase.auth().currentUser;
            const recordRef = firebase.database().ref(`users/${user.uid}/workTimeRecords`).push();
            await recordRef.set(data);
            
            console.log('作業時間記録をFirebaseに保存しました:', data);
            addToOperationLog(`💾 作業時間記録保存: ${data.category} - ${data.duration}`);
            
            // データ再読み込み
            loadWorkTimeRecords();
            updateTodayStats();
            
        } else {
            throw new Error('Firebase認証が必要です');
        }
    } catch (error) {
        console.error('作業時間記録保存エラー:', error);
        alert('作業時間記録の保存に失敗しました: ' + error.message);
    }
}

// 作業時間記録読み込み
async function loadWorkTimeRecords() {
    try {
        if (typeof firebase === 'undefined' || !firebase.auth || !firebase.auth().currentUser) {
            console.log('JOB_DC: Firebase認証待機中');
            return;
        }
        
        const user = firebase.auth().currentUser;
        const recordsRef = firebase.database().ref(`users/${user.uid}/workTimeRecords`);
        
        recordsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            workTimeRecords = [];
            
            if (data) {
                Object.keys(data).forEach(key => {
                    workTimeRecords.push({
                        id: key,
                        ...data[key]
                    });
                });
            }
            
            // 日時で降順ソート
            workTimeRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            console.log('JOB_DC: 作業時間記録を読み込みました:', workTimeRecords.length, '件');
        });
        
    } catch (error) {
        console.error('作業時間記録読み込みエラー:', error);
    }
}

// 時間フォーマット関数
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}時間${minutes}分${secs}秒`;
    } else if (minutes > 0) {
        return `${minutes}分${secs}秒`;
    } else {
        return `${secs}秒`;
    }
}

// スキル分類選択
function selectSkillType(skillType) {
    selectedSkillType = skillType;
    document.getElementById('taskSkillType').value = skillType;
    
    // ボタンの表示更新
    document.querySelectorAll('.skill-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.skill === skillType) {
            btn.classList.add('selected');
        }
    });
    
    console.log('選択されたスキル分類:', skillType);
}

// 重要度選択
function selectTaskPriority(priority) {
    selectedTaskPriority = priority;
    document.getElementById('taskPriority').value = priority;
    
    // ボタンの表示更新
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.priority === priority) {
            btn.classList.add('selected');
        }
    });
    
    console.log('選択された重要度:', priority);
}

// 予想工数選択
function selectEstimatedTime(time) {
    selectedEstimatedTime = time;
    document.getElementById('taskEstimatedTime').value = time;
    
    // ボタンの表示更新
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.time === time) {
            btn.classList.add('selected');
        }
    });
    
    console.log('選択された予想工数:', time);
}

// 自動化目標選択
function selectAutomationGoal(goal) {
    selectedAutomationGoal = goal;
    document.getElementById('taskAutomationGoal').value = goal;
    
    // ボタンの表示更新
    document.querySelectorAll('.automation-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.automation === goal) {
            btn.classList.add('selected');
        }
    });
    
    console.log('選択された自動化目標:', goal);
}

// タスク保存
async function saveJobTask() {
    const taskText = document.getElementById('newTaskText').value.trim();
    
    if (!taskText) {
        alert('タスク内容を入力してください');
        return;
    }
    
    const taskData = {
        text: taskText,
        skillType: selectedSkillType || '未分類',
        category: selectedTaskCategory || '未分類',
        priority: selectedTaskPriority || '',
        estimatedTime: selectedEstimatedTime || '',
        automationGoal: selectedAutomationGoal || '',
        createdAt: new Date().toISOString(),
        completed: false,
        actualTime: 0
    };
    
    console.log('保存するタスクデータ:', taskData);
    
    try {
        // Firebase保存処理
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            const user = firebase.auth().currentUser;
            const taskRef = firebase.database().ref(`users/${user.uid}/jobTasks`).push();
            await taskRef.set(taskData);
            
            console.log('タスクをFirebaseに保存しました');
            
            // UI更新
            addToOperationLog(`JOB_DC: タスク「${taskText}」を保存しました`);
            
            // フォームリセット
            resetTaskForm();
            
            // データ再読み込み
            loadJobTasks();
            updateTodayStats();
            
        } else {
            throw new Error('Firebase認証が必要です');
        }
    } catch (error) {
        console.error('タスク保存エラー:', error);
        alert('タスクの保存に失敗しました: ' + error.message);
    }
}

// タスクフォームリセット
function resetTaskForm() {
    document.getElementById('newTaskText').value = '';
    
    // 選択状態リセット
    selectedSkillType = '';
    selectedTaskPriority = '';
    selectedEstimatedTime = '';
    selectedAutomationGoal = '';
    
    // ボタン表示リセット
    document.querySelectorAll('.skill-btn, .priority-btn, .time-btn, .automation-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 最初のボタンを選択状態に
    document.querySelector('.skill-btn[data-skill=""]').classList.add('selected');
    document.querySelector('.priority-btn[data-priority=""]').classList.add('selected');
    document.querySelector('.time-btn[data-time=""]').classList.add('selected');
    document.querySelector('.automation-btn[data-automation=""]').classList.add('selected');
}

// タスク読み込み
async function loadJobTasks() {
    try {
        if (typeof firebase === 'undefined' || !firebase.auth || !firebase.auth().currentUser) {
            console.log('JOB_DC: Firebase認証待機中');
            return;
        }
        
        const user = firebase.auth().currentUser;
        const tasksRef = firebase.database().ref(`users/${user.uid}/jobTasks`);
        
        tasksRef.on('value', (snapshot) => {
            const data = snapshot.val();
            jobTasks = [];
            
            if (data) {
                Object.keys(data).forEach(key => {
                    jobTasks.push({
                        id: key,
                        ...data[key]
                    });
                });
            }
            
            // 作成日時で降順ソート
            jobTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            console.log('JOB_DC: タスクを読み込みました:', jobTasks.length, '件');
            displayJobTasks();
        });
        
    } catch (error) {
        console.error('タスク読み込みエラー:', error);
        document.getElementById('jobTaskHistory').innerHTML = `
            <div style="color: red; text-align: center;">
                タスクの読み込みに失敗しました<br>
                エラー: ${error.message}
            </div>
        `;
    }
}

// タスク表示
function displayJobTasks(filterSkill = 'all') {
    const container = document.getElementById('jobTaskHistory');
    
    if (jobTasks.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">まだタスクがありません</div>';
        return;
    }
    
    // フィルタリング
    let filteredTasks = jobTasks;
    if (filterSkill !== 'all') {
        filteredTasks = jobTasks.filter(task => task.skillType === filterSkill);
    }
    
    let html = '';
    
    filteredTasks.forEach(task => {
        const createdDate = new Date(task.createdAt).toLocaleString('ja-JP');
        const skillBadgeClass = task.skillType || '未分類';
        
        html += `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 8px;">
                    <div style="flex: 1;">
                        <span class="skill-badge ${skillBadgeClass}">${task.skillType || '未分類'}</span>
                        ${task.priority ? `<span class="priority-badge ${task.priority}">${task.priority}</span>` : ''}
                        ${task.estimatedTime ? `<span class="time-badge">${task.estimatedTime}</span>` : ''}
                        ${task.automationGoal ? `<span class="automation-badge ${task.automationGoal}">${task.automationGoal}</span>` : ''}
                    </div>
                    <div style="font-size: 11px; color: #666;">
                        ${createdDate}
                    </div>
                </div>
                <div class="task-text" style="margin-bottom: 10px; line-height: 1.4;">
                    ${task.text.replace(/\n/g, '<br>')}
                </div>
                <div style="display: flex; gap: 5px;">
                    ${!task.completed ? `<button class="action-btn complete" onclick="completeTask('${task.id}')">✓ 完了</button>` : ''}
                    <button class="action-btn delete" onclick="deleteTask('${task.id}')">🗑️ 削除</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// タスクフィルター
function filterTasks(skillType) {
    displayJobTasks(skillType);
    
    // フィルターボタンの表示更新
    document.querySelectorAll('#jobTaskList button').forEach(btn => {
        btn.style.background = '#6c757d';
    });
    event.target.style.background = '#007bff';
}

// タスク完了
async function completeTask(taskId) {
    try {
        const user = firebase.auth().currentUser;
        const taskRef = firebase.database().ref(`users/${user.uid}/jobTasks/${taskId}`);
        
        await taskRef.update({
            completed: true,
            completedAt: new Date().toISOString()
        });
        
        addToOperationLog(`JOB_DC: タスクを完了しました`);
        updateTodayStats();
        
    } catch (error) {
        console.error('タスク完了エラー:', error);
        alert('タスクの完了に失敗しました');
    }
}

// タスク削除
async function deleteTask(taskId) {
    if (!confirm('このタスクを削除しますか？')) {
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        const taskRef = firebase.database().ref(`users/${user.uid}/jobTasks/${taskId}`);
        
        await taskRef.remove();
        
        addToOperationLog(`JOB_DC: タスクを削除しました`);
        
    } catch (error) {
        console.error('タスク削除エラー:', error);
        alert('タスクの削除に失敗しました');
    }
}

// 今日の統計更新
function updateTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // 作業時間記録から今日のデータを取得
    const todayWorkRecords = workTimeRecords.filter(record => {
        const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
        return recordDate === today;
    });
    
    // カテゴリ別時間計算（秒単位）
    let codingTime = 0;
    let organizingTime = 0;
    let meetingTime = 0;
    let communicationTime = 0;
    let learningTime = 0;
    let maintenanceTime = 0;
    let documentTime = 0;
    let preparationTime = 0;
    let otherTime = 0;
    
    todayWorkRecords.forEach(record => {
        const seconds = record.durationSeconds || 0;
        switch (record.category) {
            case 'コーディング':
                codingTime += seconds;
                break;
            case 'フォルダ整理':
                organizingTime += seconds;
                break;
            case 'ミーティング':
                meetingTime += seconds;
                break;
            case 'メール・連絡':
                communicationTime += seconds;
                break;
            case '学習・調査':
                learningTime += seconds;
                break;
            case '設定・メンテナンス':
                maintenanceTime += seconds;
                break;
            case 'ドキュメント作成':
                documentTime += seconds;
                break;
            case '打ち合わせ準備':
                preparationTime += seconds;
                break;
            default:
                otherTime += seconds;
                break;
        }
    });
    
    // 分類別に整理（案件固有 vs 市場汎用 vs 自動化推進）
    const projectSpecificTime = organizingTime + maintenanceTime; // 案件固有（分単位）
    const marketableTime = codingTime + learningTime + documentTime; // 市場汎用（分単位）
    const automationTime = 0; // 自動化推進タスクがあれば追加
    
    // 表示更新（分秒表示）
    const projectSpecificElement = document.getElementById('todayProjectSpecific');
    const marketableElement = document.getElementById('todayMarketable');
    const automationElement = document.getElementById('todayAutomation');
    
    if (projectSpecificElement) {
        projectSpecificElement.textContent = formatDuration(projectSpecificTime);
    }
    if (marketableElement) {
        marketableElement.textContent = formatDuration(marketableTime);
    }
    if (automationElement) {
        automationElement.textContent = formatDuration(automationTime);
    }
    
    // キャリア価値向上度計算
    const totalTime = projectSpecificTime + marketableTime + automationTime;
    const careerValue = totalTime > 0 ? 
        Math.round(((marketableTime + automationTime * 1.5) / totalTime) * 100) : 0;
    
    const careerScoreElement = document.getElementById('careerValueScore');
    if (careerScoreElement) {
        careerScoreElement.textContent = `${careerValue}%`;
        careerScoreElement.style.color = 
            careerValue >= 80 ? '#28a745' : 
            careerValue >= 60 ? '#ffc107' : '#dc3545';
    }
    
    // 総作業時間表示
    const totalWorkTime = codingTime + organizingTime + meetingTime + communicationTime + 
                         learningTime + maintenanceTime + documentTime + preparationTime + otherTime;
    console.log(`今日の総作業時間: ${formatDuration(totalWorkTime)}`);
}

// 自動化進捗更新
function updateAutomationProgress() {
    // 今月の案件固有タスクの削減率計算
    const thisMonth = new Date();
    const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1);
    
    const thisMonthTasks = jobTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1) &&
               task.skillType === '案件固有' && task.completed;
    });
    
    const lastMonthTasks = jobTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1) &&
               taskDate < new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1) &&
               task.skillType === '案件固有' && task.completed;
    });
    
    const thisMonthTime = thisMonthTasks.reduce((sum, task) => sum + parseEstimatedTime(task.estimatedTime), 0);
    const lastMonthTime = lastMonthTasks.reduce((sum, task) => sum + parseEstimatedTime(task.estimatedTime), 0);
    
    const reductionRate = lastMonthTime > 0 ? 
        Math.round(((lastMonthTime - thisMonthTime) / lastMonthTime) * 100) : 0;
    
    document.getElementById('reductionProgress').style.width = `${Math.max(0, reductionRate)}%`;
    document.getElementById('reductionProgress').textContent = `${reductionRate}%`;
}

// 工数文字列を分に変換
function parseEstimatedTime(timeStr) {
    if (!timeStr) return 0;
    
    switch (timeStr) {
        case '5分': return 5;
        case '30分': return 30;
        case '1時間': return 60;
        case '半日': return 240;
        default: return 0;
    }
}

// 共通ログ出力関数（既存のシステムと連携）
function addToOperationLog(message) {
    if (typeof window.addToOperationLog === 'function') {
        window.addToOperationLog(message);
    } else {
        console.log('操作ログ:', message);
    }
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('jobTaskInput')) {
        initJobDCTab();
    }
});