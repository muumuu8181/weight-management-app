// JOB_DC タブ専用JavaScript

// グローバル変数
let jobTasks = [];
let selectedSkillType = '';
let selectedTaskPriority = '';
let selectedEstimatedTime = '';
let selectedAutomationGoal = '';

// 初期化
function initJobDCTab() {
    console.log('JOB_DC タブを初期化中...');
    
    // 今日の日付を設定
    const today = new Date().toISOString().split('T')[0];
    
    // Firebase接続確認
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('JOB_DC: Firebase認証済み');
                loadJobTasks();
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
    const todayTasks = jobTasks.filter(task => {
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
        return taskDate === today && task.completed;
    });
    
    // スキル分類別の作業時間計算
    let projectSpecificTime = 0;
    let marketableTime = 0;
    let automationTime = 0;
    
    todayTasks.forEach(task => {
        const time = parseEstimatedTime(task.estimatedTime);
        switch (task.skillType) {
            case '案件固有':
                projectSpecificTime += time;
                break;
            case '市場汎用':
                marketableTime += time;
                break;
            case '自動化推進':
                automationTime += time;
                break;
        }
    });
    
    // 表示更新
    document.getElementById('todayProjectSpecific').textContent = `${projectSpecificTime}分`;
    document.getElementById('todayMarketable').textContent = `${marketableTime}分`;
    document.getElementById('todayAutomation').textContent = `${automationTime}分`;
    
    // キャリア価値向上度計算
    const totalTime = projectSpecificTime + marketableTime + automationTime;
    const careerValue = totalTime > 0 ? 
        Math.round(((marketableTime + automationTime * 1.5) / totalTime) * 100) : 0;
    
    document.getElementById('careerValueScore').textContent = `${careerValue}%`;
    document.getElementById('careerValueScore').style.color = 
        careerValue >= 80 ? '#28a745' : 
        careerValue >= 60 ? '#ffc107' : '#dc3545';
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