// 汎用タスク管理システム - メモリスト機能をベースに共通化
// 4階層システム + 統合機能 + 細分化機能

class UniversalTaskManager {
    constructor(options = {}) {
        // 設定
        this.containerId = options.containerId || 'universalTaskContainer';
        this.dataPath = options.dataPath || 'tasks';
        this.title = options.title || '📝 タスク管理';
        this.categories = options.categories || [
            { value: '', label: '選択なし' },
            { value: 'アイデア', label: '💡 アイデア' },
            { value: 'やること', label: '✅ やること' },
            { value: '考え事', label: '🤔 考え事' },
            { value: 'メモ', label: '📝 メモ' },
            { value: '重要', label: '⚠️ 重要' },
            { value: 'その他', label: '📋 その他' }
        ];
        
        // 内部データ
        this.taskData = [];
        this.filteredTaskData = [];
        this.selectedTaskIds = [];
        this.isIntegrationMode = false;
        this.editingTaskId = null;
        
        // コールバック
        this.onSave = options.onSave || null;
        this.onLoad = options.onLoad || null;
        this.onDelete = options.onDelete || null;
    }
    
    // 初期化
    init() {
        this.createHTML();
        this.bindEvents();
        this.loadTasks();
    }
    
    // HTML構造生成
    createHTML() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`UniversalTaskManager: Container ${this.containerId} not found`);
            return;
        }
        
        container.innerHTML = `
            <!-- タスク追加エリア -->
            <div class="input-card">
                <h3>${this.title}</h3>
                
                <!-- タスク入力フォーム -->
                <div style="margin-bottom: 15px;">
                    <textarea id="${this.containerId}_newTaskText" placeholder="タスクを入力してください..." 
                        style="width: 100%; max-width: 600px; height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; resize: vertical; font-family: inherit; font-size: 14px; line-height: 1.4;"></textarea>
                </div>

                <!-- カテゴリ選択 -->
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px; flex-wrap: wrap;">
                    <label style="font-weight: bold;">🏷️ カテゴリ:</label>
                    <select id="${this.containerId}_taskCategory" style="padding: 5px; border: 1px solid #ddd; border-radius: 3px;">
                        ${this.categories.map(cat => `<option value="${cat.value}">${cat.label}</option>`).join('')}
                    </select>
                </div>

                <!-- 重要度選択 -->
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 8px;">🎯 重要度:</label>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button type="button" class="priority-btn" data-priority="" onclick="${this.containerId}_selectPriority('')" style="background: #f8f9fa; color: #495057; border: 1px solid #dee2e6; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; opacity: 1;">なし</button>
                        <button type="button" class="priority-btn" data-priority="S" onclick="${this.containerId}_selectPriority('S')" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; opacity: 0.7;">🔥 S</button>
                        <button type="button" class="priority-btn" data-priority="A" onclick="${this.containerId}_selectPriority('A')" style="background: #fd7e14; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; opacity: 0.7;">⚡ A</button>
                        <button type="button" class="priority-btn" data-priority="B" onclick="${this.containerId}_selectPriority('B')" style="background: #ffc107; color: #212529; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; opacity: 0.7;">📋 B</button>
                    </div>
                    <input type="hidden" id="${this.containerId}_taskPriority" value="">
                </div>

                <!-- 対応時間選択 -->
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 8px;">⏰ 対応時間:</label>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button type="button" class="timeframe-btn" data-timeframe="" onclick="${this.containerId}_selectTimeframe('')" style="background: #f8f9fa; color: #495057; border: 1px solid #dee2e6; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; opacity: 1;">なし</button>
                        <button type="button" class="timeframe-btn" data-timeframe="短期" onclick="${this.containerId}_selectTimeframe('短期')" style="background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; opacity: 0.7;">⚡ 短期</button>
                        <button type="button" class="timeframe-btn" data-timeframe="中長期" onclick="${this.containerId}_selectTimeframe('中長期')" style="background: #17a2b8; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; opacity: 0.7;">📅 中長期</button>
                    </div>
                    <input type="hidden" id="${this.containerId}_taskTimeframe" value="">
                </div>

                <!-- 締切日設定 -->
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 8px;">📅 締切日（任意）:</label>
                    <input type="date" id="${this.containerId}_taskDeadline" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;">
                </div>

                <!-- 保存ボタン -->
                <button class="save-button" onclick="${this.containerId}_saveTask()">💾 タスク保存</button>
                <button id="${this.containerId}_cancelEditBtn" onclick="${this.containerId}_cancelEdit()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px; display: none;">❌ 編集キャンセル</button>
            </div>

            <!-- タスク管理エリア -->
            <div class="input-card">
                <h3>📋 タスク一覧</h3>
                
                <!-- 検索・フィルター -->
                <div style="margin-bottom: 15px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <input type="text" id="${this.containerId}_taskFilter" placeholder="タスクを検索..." 
                        onkeyup="${this.containerId}_filterTasks()" 
                        style="flex: 1; min-width: 200px; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    <span id="${this.containerId}_filterCount" style="font-size: 12px; color: #666;"></span>
                </div>
                
                <!-- ソート機能 -->
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; margin-right: 10px;">📊 並び順:</label>
                    <select id="${this.containerId}_sortOption" onchange="${this.containerId}_applySorting()" style="padding: 5px; border: 1px solid #ddd; border-radius: 3px; margin-right: 10px;">
                        <option value="default">⏰ 作成日時順</option>
                        <option value="priority">🎯 重要度順</option>
                        <option value="deadline">📅 締切順</option>
                        <option value="category">🏷️ カテゴリ順</option>
                    </select>
                </div>
                
                <!-- 統合モード切り替え -->
                <div style="margin-bottom: 15px;">
                    <button id="${this.containerId}_integrationBtn" onclick="${this.containerId}_toggleIntegrationMode()" 
                        style="background: #6c757d; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 12px;">🔗 統合モード</button>
                    <button id="${this.containerId}_integrateBtn" onclick="${this.containerId}_integrateTasks()" 
                        style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-left: 10px; display: none;">✨ 選択したタスクを統合</button>
                    <button id="${this.containerId}_cancelIntegrationBtn" onclick="${this.containerId}_cancelIntegration()" 
                        style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-left: 10px; display: none;">❌ キャンセル</button>
                </div>
                
                <!-- タスクリスト表示エリア -->
                <div class="data-area" id="${this.containerId}_taskList">
                    データを読み込み中...<br>
                </div>
            </div>
        `;
    }
    
    // イベントバインド
    bindEvents() {
        // グローバル関数として登録（HTML内のonclickから呼び出すため）
        window[`${this.containerId}_selectPriority`] = (priority) => this.selectPriority(priority);
        window[`${this.containerId}_selectTimeframe`] = (timeframe) => this.selectTimeframe(timeframe);
        window[`${this.containerId}_saveTask`] = () => this.saveTask();
        window[`${this.containerId}_filterTasks`] = () => this.filterTasks();
        window[`${this.containerId}_applySorting`] = () => this.applySorting();
        window[`${this.containerId}_toggleIntegrationMode`] = () => this.toggleIntegrationMode();
        window[`${this.containerId}_integrateTasks`] = () => this.integrateTasks();
        window[`${this.containerId}_cancelIntegration`] = () => this.cancelIntegration();
        window[`${this.containerId}_subdivideTask`] = (taskId) => this.subdivideTask(taskId);
        window[`${this.containerId}_deleteTask`] = (taskId) => this.deleteTask(taskId);
        window[`${this.containerId}_toggleTaskSelection`] = (taskId) => this.toggleTaskSelection(taskId);
        window[`${this.containerId}_editTask`] = (taskId) => this.editTask(taskId);
        window[`${this.containerId}_cancelEdit`] = () => this.cancelEdit();
    }
    
    // 優先度選択
    selectPriority(priority) {
        document.getElementById(`${this.containerId}_taskPriority`).value = priority;
        
        // ボタンの表示更新
        const container = document.getElementById(this.containerId);
        container.querySelectorAll('.priority-btn').forEach(btn => {
            if (btn.dataset.priority === priority) {
                btn.style.opacity = '1';
            } else {
                btn.style.opacity = '0.7';
            }
        });
    }
    
    // 対応時間選択
    selectTimeframe(timeframe) {
        document.getElementById(`${this.containerId}_taskTimeframe`).value = timeframe;
        
        // ボタンの表示更新
        const container = document.getElementById(this.containerId);
        container.querySelectorAll('.timeframe-btn').forEach(btn => {
            if (btn.dataset.timeframe === timeframe) {
                btn.style.opacity = '1';
            } else {
                btn.style.opacity = '0.7';
            }
        });
    }
    
    // 重要度の色を取得
    getPriorityColor(priority) {
        switch(priority) {
            case 'S': return '#dc3545'; // 赤
            case 'A': return '#fd7e14'; // オレンジ
            case 'B': return '#ffc107'; // 黄色
            case 'C': return '#6c757d'; // グレー
            case 'D': return '#28a745'; // 緑
            default: return '#6c757d';
        }
    }
    
    // 重要度のアイコンを取得
    getPriorityIcon(priority) {
        switch(priority) {
            case 'S': return '🔥';
            case 'A': return '⚡';
            case 'B': return '📋';
            case 'C': return '📝';
            case 'D': return '📌';
            default: return '';
        }
    }
    
    // 対応時間の色を取得
    getTimeframeColor(timeframe) {
        switch(timeframe) {
            case '短期': return '#28a745'; // 緑
            case '中長期': return '#17a2b8'; // 青
            default: return '#6c757d';
        }
    }
    
    // 対応時間のアイコンを取得
    getTimeframeIcon(timeframe) {
        switch(timeframe) {
            case '短期': return '⚡';
            case '中長期': return '📅';
            default: return '';
        }
    }
    
    // タスク保存
    async saveTask() {
        const taskText = document.getElementById(`${this.containerId}_newTaskText`).value.trim();
        const category = document.getElementById(`${this.containerId}_taskCategory`).value;
        const priority = document.getElementById(`${this.containerId}_taskPriority`).value;
        const timeframe = document.getElementById(`${this.containerId}_taskTimeframe`).value;
        const deadline = document.getElementById(`${this.containerId}_taskDeadline`).value;
        
        if (!taskText) {
            alert('タスク内容を入力してください');
            return;
        }
        
        const isEdit = this.editingTaskId !== null;
        const taskId = isEdit ? this.editingTaskId : parseInt(Date.now().toString() + Math.floor(Math.random() * 100).toString());
        
        const task = {
            id: taskId,
            text: taskText,
            category: category,
            priority: priority,
            timeframe: timeframe,
            deadline: deadline || null,
            parentId: isEdit ? this.findTaskById(taskId)?.parentId || null : null,
            level: isEdit ? this.findTaskById(taskId)?.level || 0 : 0,
            date: isEdit ? this.findTaskById(taskId)?.date : new Date().toLocaleDateString('ja-JP'),
            time: isEdit ? this.findTaskById(taskId)?.time : new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            createdAt: isEdit ? this.findTaskById(taskId)?.createdAt : new Date().toISOString(),
            updatedAt: isEdit ? new Date().toISOString() : null
        };
        
        try {
            await this.saveTaskToFirebase(task);
            this.resetForm();
            this.loadTasks();
            
            if (this.onSave) {
                this.onSave(task);
            }
            
            console.log('📝 タスク保存完了:', task);
        } catch (error) {
            console.error('タスク保存エラー:', error);
            alert('タスクの保存に失敗しました: ' + error.message);
        }
    }
    
    // Firebase保存
    async saveTaskToFirebase(task) {
        if (typeof firebase === 'undefined' || !firebase.auth || !firebase.auth().currentUser) {
            throw new Error('Firebase認証が必要です');
        }
        
        const user = firebase.auth().currentUser;
        const cleanId = String(task.id).split('.')[0];
        const path = `users/${user.uid}/${this.dataPath}/${cleanId}`;
        
        await firebase.database().ref(path).set({
            ...task,
            id: cleanId
        });
        
        console.log('💾 Firebaseに保存:', path);
    }
    
    // フォームリセット
    resetForm() {
        document.getElementById(`${this.containerId}_newTaskText`).value = '';
        document.getElementById(`${this.containerId}_taskCategory`).value = '';
        document.getElementById(`${this.containerId}_taskDeadline`).value = '';
        this.selectPriority('');
        this.selectTimeframe('');
        
        // 編集モード終了
        this.editingTaskId = null;
        document.getElementById(`${this.containerId}_cancelEditBtn`).style.display = 'none';
        document.querySelector(`#${this.containerId} .save-button`).textContent = '💾 タスク保存';
    }
    
    // タスク読み込み
    async loadTasks() {
        try {
            if (typeof firebase === 'undefined' || !firebase.auth || !firebase.auth().currentUser) {
                console.log('UniversalTaskManager: Firebase認証待機中');
                return;
            }
            
            const user = firebase.auth().currentUser;
            const tasksRef = firebase.database().ref(`users/${user.uid}/${this.dataPath}`);
            
            tasksRef.on('value', (snapshot) => {
                const data = snapshot.val();
                this.taskData = [];
                
                if (data) {
                    Object.keys(data).forEach(key => {
                        this.taskData.push({
                            id: key,
                            ...data[key]
                        });
                    });
                }
                
                // 階層ソート
                this.taskData = this.sortByHierarchy();
                this.displayTasks();
                
                console.log('📋 タスク読み込み完了:', this.taskData.length, '件');
                
                if (this.onLoad) {
                    this.onLoad(this.taskData);
                }
            });
            
        } catch (error) {
            console.error('タスク読み込みエラー:', error);
            const listElement = document.getElementById(`${this.containerId}_taskList`);
            if (listElement) {
                listElement.innerHTML = `<div style="color: red; text-align: center;">タスクの読み込みに失敗しました<br>エラー: ${error.message}</div>`;
            }
        }
    }
    
    // 階層ソート
    sortByHierarchy() {
        const result = [];
        const processed = new Set();
        
        // レベル0（親）タスクを時系列順でソート
        const parents = this.taskData.filter(task => (task.level || 0) === 0)
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        
        // 再帰的に子タスクを追加
        const addChildren = (parentId, currentLevel) => {
            const children = this.taskData.filter(task => 
                task.parentId == parentId && (task.level || 0) === currentLevel
            ).sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
            
            children.forEach(child => {
                if (!processed.has(child.id)) {
                    result.push(child);
                    processed.add(child.id);
                    
                    // さらに子がいる場合は再帰的に追加（最大4階層まで）
                    if (currentLevel < 3) {
                        addChildren(child.id, currentLevel + 1);
                    }
                }
            });
        };
        
        // 親タスクとその子孫を順番に追加
        parents.forEach(parent => {
            if (!processed.has(parent.id)) {
                result.push(parent);
                processed.add(parent.id);
                addChildren(parent.id, 1);
            }
        });
        
        return result;
    }
    
    // タスク表示
    displayTasks(tasksToShow = null) {
        const tasks = tasksToShow || this.taskData;
        const listElement = document.getElementById(`${this.containerId}_taskList`);
        
        if (!listElement) return;
        
        if (tasks.length === 0) {
            listElement.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">まだタスクがありません</div>';
            return;
        }
        
        let html = '';
        
        tasks.forEach(task => {
            const levelLimits = { 0: 20, 1: 17, 2: 14, 3: 11 };
            const charLimit = levelLimits[task.level || 0] || 20;
            const displayText = task.text.length > charLimit ? task.text.substring(0, charLimit) + '...' : task.text;
            
            // 階層表示用のインデントと境界線
            const indent = task.level ? '　'.repeat(task.level) + '└ ' : '';
            const borderLeft = task.level > 0 ? `border-left: 3px solid ${this.getPriorityColor(task.priority || 'C')}; margin-left: ${task.level * 15}px; padding-left: 8px;` : '';
            
            // 統合モード時の選択チェックボックス
            const integrationCheckbox = this.isIntegrationMode ? 
                `<input type="checkbox" onchange="${this.containerId}_toggleTaskSelection(${task.id})" 
                 ${this.selectedTaskIds.includes(task.id) ? 'checked' : ''} 
                 style="margin-right: 8px;">` : '';
            
            html += `
                <div class="task-item" style="${borderLeft} ${this.selectedTaskIds.includes(task.id) ? 'background-color: #e3f2fd; border: 2px solid #2196f3;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            ${integrationCheckbox}
                            <small class="task-date">${task.date} ${task.time}</small>
                        </div>
                        <div style="display: flex; gap: 3px;">
                            <button onclick="${this.containerId}_editTask(${task.id})" style="background: #007bff; color: white; border: none; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-size: 9px;">✏️</button>
                            ${(task.level || 0) < 3 ? `<button onclick="${this.containerId}_subdivideTask(${task.id})" style="background: #28a745; color: white; border: none; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-size: 9px;">🔀</button>` : ''}
                            <button onclick="${this.containerId}_deleteTask(${task.id})" style="background: #dc3545; color: white; border: none; padding: 2px 5px; border-radius: 3px; cursor: pointer; font-size: 9px;">🗑️</button>
                        </div>
                    </div>
                    <div class="task-text" style="margin: 8px 0; font-weight: bold; cursor: pointer;" onclick="${this.containerId}_showFullText(${task.id})">
                        ${indent}${displayText}
                    </div>
                    <div style="display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap;">
                        ${task.category ? `<span style="background: #17a2b8; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">${task.category}</span>` : ''}
                        ${task.priority ? `<span style="background: ${this.getPriorityColor(task.priority)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">${this.getPriorityIcon(task.priority)} ${task.priority}</span>` : ''}
                        ${task.timeframe ? `<span style="background: ${this.getTimeframeColor(task.timeframe)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">${this.getTimeframeIcon(task.timeframe)} ${task.timeframe}</span>` : ''}
                        ${task.deadline ? `<span style="background: #e83e8c; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">📅 ${this.formatDeadline(task.deadline)}</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        listElement.innerHTML = html;
        
        // 全文表示関数をグローバル登録
        window[`${this.containerId}_showFullText`] = (taskId) => {
            const task = this.taskData.find(t => t.id == taskId);
            if (task) {
                alert(`【完全版】\n${task.text}`);
            }
        };
    }
    
    // タスクフィルタリング
    filterTasks() {
        const filterText = document.getElementById(`${this.containerId}_taskFilter`).value.toLowerCase();
        const filteredData = filterText === '' ? this.taskData : 
            this.taskData.filter(task => 
                task.text.toLowerCase().includes(filterText) ||
                (task.category && task.category.toLowerCase().includes(filterText)) ||
                (task.priority && task.priority.toLowerCase().includes(filterText)) ||
                (task.timeframe && task.timeframe.toLowerCase().includes(filterText))
            );
        
        this.displayTasks(filteredData);
        this.updateFilterCount(filteredData.length, this.taskData.length);
    }
    
    // フィルター件数表示
    updateFilterCount(filteredCount, totalCount) {
        const countElement = document.getElementById(`${this.containerId}_filterCount`);
        if (countElement) {
            const filterText = document.getElementById(`${this.containerId}_taskFilter`).value;
            if (filterText && filteredCount < totalCount) {
                countElement.textContent = `${filteredCount}/${totalCount} 件`;
            } else {
                countElement.textContent = '';
            }
        }
    }
    
    // 統合モード切り替え
    toggleIntegrationMode() {
        this.isIntegrationMode = !this.isIntegrationMode;
        const integrationBtn = document.getElementById(`${this.containerId}_integrationBtn`);
        const integrateBtn = document.getElementById(`${this.containerId}_integrateBtn`);
        const cancelBtn = document.getElementById(`${this.containerId}_cancelIntegrationBtn`);
        
        if (this.isIntegrationMode) {
            integrationBtn.textContent = '🔗 統合モード ON';
            integrationBtn.style.background = '#dc3545';
            integrateBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
            console.log('🔗 統合モード開始');
        } else {
            integrationBtn.textContent = '🔗 統合モード';
            integrationBtn.style.background = '#6c757d';
            integrateBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            this.selectedTaskIds = [];
            console.log('🔗 統合モード終了');
        }
        
        this.displayTasks();
    }
    
    // タスク選択切り替え
    toggleTaskSelection(taskId) {
        // 数値IDを文字列として統一して比較
        const taskIdStr = String(taskId);
        const index = this.selectedTaskIds.findIndex(id => String(id) === taskIdStr);
        
        if (index > -1) {
            this.selectedTaskIds.splice(index, 1);
        } else {
            this.selectedTaskIds.push(taskIdStr);
        }
        
        console.log('選択中のタスク:', this.selectedTaskIds);
        
        // チェックボックス状態の即座更新
        const checkbox = document.querySelector(`input[onchange*="toggleTaskSelection(${taskId})"]`);
        if (checkbox) {
            checkbox.checked = this.selectedTaskIds.includes(taskIdStr);
        }
        
        this.displayTasks();
    }
    
    // タスク統合
    async integrateTasks() {
        if (this.selectedTaskIds.length < 2) {
            alert('統合するには2つ以上のタスクを選択してください');
            return;
        }
        
        try {
            // 選択されたタスクを取得
            const tasksToIntegrate = this.taskData.filter(task => this.selectedTaskIds.includes(task.id));
            
            // レベル3のタスクが含まれているかチェック
            if (tasksToIntegrate.some(task => (task.level || 0) >= 3)) {
                alert('レベル3のタスクは統合できません。（4階層制限のため）');
                return;
            }
            
            // 統合タスク作成
            const integrationText = tasksToIntegrate.map(task => task.text).join('\n\n');
            const maxPriority = this.getMaxPriority(tasksToIntegrate.map(task => task.priority));
            
            const integrationTask = {
                id: parseInt(Date.now().toString() + Math.floor(Math.random() * 100).toString()),
                text: integrationText,
                category: tasksToIntegrate[0].category || '',
                priority: maxPriority,
                timeframe: tasksToIntegrate[0].timeframe || '',
                parentId: null,
                level: 0,
                date: new Date().toLocaleDateString('ja-JP'),
                time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                createdAt: new Date().toISOString()
            };
            
            // 統合タスクを保存
            await this.saveTaskToFirebase(integrationTask);
            
            // 元のタスクを削除
            for (const task of tasksToIntegrate) {
                await this.deleteTaskFromFirebase(task.id);
            }
            
            // 統合モード終了
            this.toggleIntegrationMode();
            
            alert(`${tasksToIntegrate.length}個のタスクを統合しました`);
            console.log('✨ タスク統合完了');
            
        } catch (error) {
            console.error('タスク統合エラー:', error);
            alert('タスクの統合に失敗しました: ' + error.message);
        }
    }
    
    // 最大優先度取得
    getMaxPriority(priorities) {
        const order = ['S', 'A', 'B', 'C', 'D', ''];
        for (const p of order) {
            if (priorities.includes(p)) return p;
        }
        return '';
    }
    
    // タスク細分化
    async subdivideTask(taskId) {
        const task = this.taskData.find(t => t.id == taskId);
        if (!task) return;
        
        // 4階層制限チェック
        if ((task.level || 0) >= 3) {
            alert('細分化は4階層（レベル3）まで可能です。\nこれ以上細分化できません。');
            return;
        }
        
        const childText = prompt('細分化したタスクの内容を入力してください:', '');
        if (!childText || !childText.trim()) return;
        
        const childTask = {
            id: parseInt(Date.now().toString() + Math.floor(Math.random() * 1000).toString()),
            text: childText.trim(),
            category: task.category || '',
            priority: task.priority || '',
            timeframe: task.timeframe || '',
            parentId: task.id,
            level: (task.level || 0) + 1,
            date: new Date().toLocaleDateString('ja-JP'),
            time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date().toISOString()
        };
        
        try {
            await this.saveTaskToFirebase(childTask);
            console.log('🔀 タスク細分化完了:', childTask);
        } catch (error) {
            console.error('タスク細分化エラー:', error);
            alert('タスクの細分化に失敗しました: ' + error.message);
        }
    }
    
    // タスク削除
    async deleteTask(taskId) {
        if (!confirm('このタスクを削除しますか？\n（子タスクがある場合は一緒に削除されます）')) {
            return;
        }
        
        try {
            // 子タスクも含めて削除
            await this.deleteTaskAndChildren(taskId);
            
            if (this.onDelete) {
                this.onDelete(taskId);
            }
            
            console.log('🗑️ タスク削除完了:', taskId);
        } catch (error) {
            console.error('タスク削除エラー:', error);
            alert('タスクの削除に失敗しました: ' + error.message);
        }
    }
    
    // タスクとその子タスクを削除
    async deleteTaskAndChildren(taskId) {
        // 子タスクを再帰的に削除
        const children = this.taskData.filter(task => task.parentId == taskId);
        for (const child of children) {
            await this.deleteTaskAndChildren(child.id);
        }
        
        // 自分を削除
        await this.deleteTaskFromFirebase(taskId);
    }
    
    // Firebase削除
    async deleteTaskFromFirebase(taskId) {
        if (typeof firebase === 'undefined' || !firebase.auth || !firebase.auth().currentUser) {
            throw new Error('Firebase認証が必要です');
        }
        
        const user = firebase.auth().currentUser;
        const cleanId = String(taskId).split('.')[0];
        const path = `users/${user.uid}/${this.dataPath}/${cleanId}`;
        
        await firebase.database().ref(path).remove();
        console.log('🗑️ Firebaseから削除:', path);
    }
    
    // タスク編集
    editTask(taskId) {
        const task = this.findTaskById(taskId);
        if (!task) return;
        
        // フォームに値を設定
        document.getElementById(`${this.containerId}_newTaskText`).value = task.text;
        document.getElementById(`${this.containerId}_taskCategory`).value = task.category || '';
        document.getElementById(`${this.containerId}_taskDeadline`).value = task.deadline || '';
        this.selectPriority(task.priority || '');
        this.selectTimeframe(task.timeframe || '');
        
        // 編集モードに切り替え
        this.editingTaskId = taskId;
        document.getElementById(`${this.containerId}_cancelEditBtn`).style.display = 'inline-block';
        document.querySelector(`#${this.containerId} .save-button`).textContent = '✏️ 更新';
        
        // フォームまでスクロール
        document.getElementById(this.containerId).scrollIntoView({ behavior: 'smooth' });
        
        console.log('✏️ タスク編集モード:', task);
    }
    
    // 編集キャンセル
    cancelEdit() {
        this.resetForm();
        console.log('❌ 編集キャンセル');
    }
    
    // 統合キャンセル
    cancelIntegration() {
        this.isIntegrationMode = false;
        this.selectedTaskIds = [];
        
        const integrationBtn = document.getElementById(`${this.containerId}_integrationBtn`);
        const integrateBtn = document.getElementById(`${this.containerId}_integrateBtn`);
        const cancelBtn = document.getElementById(`${this.containerId}_cancelIntegrationBtn`);
        
        integrationBtn.textContent = '🔗 統合モード';
        integrationBtn.style.background = '#6c757d';
        integrateBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        
        this.displayTasks();
        console.log('❌ 統合モードキャンセル');
    }
    
    // ソート機能
    applySorting() {
        const sortOption = document.getElementById(`${this.containerId}_sortOption`).value;
        let sortedTasks = [...this.taskData];
        
        switch (sortOption) {
            case 'priority':
                // 重要度順 (S > A > B > C > D > なし)
                const priorityOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4, '': 5 };
                sortedTasks.sort((a, b) => {
                    const aOrder = priorityOrder[a.priority || ''] || 5;
                    const bOrder = priorityOrder[b.priority || ''] || 5;
                    return aOrder - bOrder;
                });
                break;
                
            case 'deadline':
                // 締切順（近い順、未設定は最後）
                sortedTasks.sort((a, b) => {
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                });
                break;
                
            case 'category':
                // カテゴリ順（アルファベット順）
                sortedTasks.sort((a, b) => {
                    const aCategory = a.category || '';
                    const bCategory = b.category || '';
                    return aCategory.localeCompare(bCategory);
                });
                break;
                
            default:
                // デフォルト（作成日時順）- 元の階層ソートを維持
                sortedTasks = this.sortByHierarchy();
                break;
        }
        
        // 階層構造を維持しつつソート（デフォルト以外の場合）
        if (sortOption !== 'default') {
            sortedTasks = this.maintainHierarchyInSort(sortedTasks);
        }
        
        this.displayTasks(sortedTasks);
        console.log('📊 ソート適用:', sortOption);
    }
    
    // 階層構造を維持しながらソート
    maintainHierarchyInSort(sortedTasks) {
        const result = [];
        const processed = new Set();
        
        // レベル0のタスクから処理
        const parents = sortedTasks.filter(task => (task.level || 0) === 0);
        
        const addWithChildren = (parent) => {
            if (processed.has(parent.id)) return;
            
            result.push(parent);
            processed.add(parent.id);
            
            // 子タスクを再帰的に追加
            const addChildren = (parentId, level) => {
                const children = sortedTasks.filter(task => 
                    task.parentId == parentId && (task.level || 0) === level
                );
                
                children.forEach(child => {
                    if (!processed.has(child.id)) {
                        result.push(child);
                        processed.add(child.id);
                        if (level < 3) {
                            addChildren(child.id, level + 1);
                        }
                    }
                });
            };
            
            addChildren(parent.id, 1);
        };
        
        parents.forEach(addWithChildren);
        return result;
    }
    
    // 締切日フォーマット
    formatDeadline(deadline) {
        if (!deadline) return '';
        
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `${deadline} (期限切れ)`;
        } else if (diffDays === 0) {
            return `${deadline} (今日!)`;
        } else if (diffDays === 1) {
            return `${deadline} (明日)`;
        } else if (diffDays <= 7) {
            return `${deadline} (${diffDays}日後)`;
        } else {
            return deadline;
        }
    }
    
    // タスク検索ヘルパー
    findTaskById(taskId) {
        return this.taskData.find(task => String(task.id) === String(taskId));
    }
}

// グローバルに公開
window.UniversalTaskManager = UniversalTaskManager;