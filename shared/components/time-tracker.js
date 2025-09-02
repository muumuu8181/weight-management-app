// 汎用時間トラッキングコンポーネント
// 部屋片付け機能をベースに汎用化

class TimeTracker {
    constructor(options = {}) {
        this.containerId = options.containerId || 'timeTracker';
        this.categories = options.categories || [];
        this.onSave = options.onSave || null;
        this.onStart = options.onStart || null;
        this.onStop = options.onStop || null;
        
        // 内部状態
        this.selectedCategory = '';
        this.startTime = null;
        this.endTime = null;
        this.isTracking = false;
        this.customCategories = JSON.parse(localStorage.getItem(`${this.containerId}_customCategories`) || '[]');
        
        // 初期化
        this.init();
    }
    
    // 初期化
    init() {
        this.createHTML();
        this.bindEvents();
        this.loadCustomCategories();
    }
    
    // HTML生成
    createHTML() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`TimeTracker: Container ${this.containerId} not found`);
            return;
        }
        
        container.innerHTML = `
            <div class="time-tracker-component">
                <!-- カテゴリ管理モード -->
                <div class="category-mode-control" style="background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px; padding: 8px; margin: 8px 0; text-align: center;">
                    <div style="margin-bottom: 8px;">
                        <span style="font-size: 13px; color: #444; font-weight: bold;">🔧 カテゴリ管理モード</span>
                    </div>
                    <div style="display: flex; gap: 5px; justify-content: center; margin-bottom: 8px;">
                        <button id="${this.containerId}_normalModeBtn" style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 11px;">📝 通常</button>
                        <button id="${this.containerId}_addModeBtn" style="background: #6c757d; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 11px;">➕ 追加</button>
                        <button id="${this.containerId}_deleteModeBtn" style="background: #6c757d; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 11px;">🗑️ 削除</button>
                    </div>
                    
                    <!-- 追加モード用入力エリア -->
                    <div id="${this.containerId}_addInput" style="display: none; margin-top: 8px; padding: 8px; background: #e8f5e8; border-radius: 5px; border: 2px solid #28a745;">
                        <div style="margin-bottom: 5px;">
                            <span style="font-size: 11px; color: #155724; font-weight: bold;">✨ 新しいカテゴリを追加</span>
                        </div>
                        <div style="display: flex; gap: 3px; align-items: center;">
                            <input type="text" id="${this.containerId}_addText" placeholder="カテゴリ名を入力" style="flex: 1; padding: 4px 8px; border: 1px solid #28a745; border-radius: 3px; font-size: 11px;">
                            <button id="${this.containerId}_executeAdd" style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">✓ 追加</button>
                            <button id="${this.containerId}_cancelAdd" style="background: #6c757d; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">✗ キャンセル</button>
                        </div>
                    </div>
                </div>

                <!-- 日付・時刻表示 -->
                <div style="margin-bottom: 10px;">
                    <input type="date" id="${this.containerId}_dateInput" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 3px;" readonly>
                    <input type="time" id="${this.containerId}_timeInput" style="width: 100%; margin-top: 5px; padding: 6px; border: 1px solid #ddd; border-radius: 3px;" readonly>
                </div>
                
                <!-- 開始・終了ボタン -->
                <div style="margin-bottom: 15px; text-align: center;">
                    <button id="${this.containerId}_startBtn" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; margin-right: 10px;">▶️ 作業開始</button>
                    <button id="${this.containerId}_endBtn" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; display: none;">⏹️ 作業終了</button>
                </div>
                
                <!-- カテゴリ選択 -->
                <div style="margin-bottom: 10px;">
                    <div style="text-align: center; margin-bottom: 8px;">
                        <span style="font-size: 13px; color: #444; font-weight: bold;">📂 作業カテゴリ</span>
                    </div>
                    <div id="${this.containerId}_categoryButtons" style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; margin-bottom: 8px;">
                        <!-- カテゴリボタンは動的生成 -->
                    </div>
                    <input type="text" id="${this.containerId}_selectedCategory" placeholder="選択したカテゴリ" readonly style="margin-top: 5px; font-size: 12px; padding: 6px; text-align: center; background: #f0f8ff; width: 100%; border: 1px solid #ddd; border-radius: 3px;">
                </div>
                
                <!-- 作業時間（自動計算） -->
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #444;">⏱️ 作業時間</label>
                    <input type="text" id="${this.containerId}_duration" placeholder="開始ボタンで計測開始" readonly style="width: 100%; text-align: center; background: #f0f8ff; padding: 6px; border: 1px solid #ddd; border-radius: 3px;">
                </div>
                
                <!-- メモ -->
                <textarea id="${this.containerId}_memo" placeholder="作業内容のメモ（オプション）" rows="3" style="width: 100%; margin-bottom: 10px; padding: 6px; border: 1px solid #ddd; border-radius: 3px; resize: vertical;"></textarea>
                
                <div style="text-align: center;">
                    <button id="${this.containerId}_saveBtn" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;">💾 記録を保存</button>
                </div>
            </div>
        `;
    }
    
    // イベント設定
    bindEvents() {
        // モード切り替え
        document.getElementById(`${this.containerId}_normalModeBtn`).onclick = () => this.setMode('normal');
        document.getElementById(`${this.containerId}_addModeBtn`).onclick = () => this.setMode('add');
        document.getElementById(`${this.containerId}_deleteModeBtn`).onclick = () => this.setMode('delete');
        
        // カテゴリ追加
        document.getElementById(`${this.containerId}_executeAdd`).onclick = () => this.executeAdd();
        document.getElementById(`${this.containerId}_cancelAdd`).onclick = () => this.setMode('normal');
        
        // 作業開始・終了
        document.getElementById(`${this.containerId}_startBtn`).onclick = () => this.start();
        document.getElementById(`${this.containerId}_endBtn`).onclick = () => this.stop();
        
        // 保存
        document.getElementById(`${this.containerId}_saveBtn`).onclick = () => this.save();
        
        // 現在時刻設定
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
    }
    
    // 現在日時更新
    updateDateTime() {
        if (!this.isTracking) {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const currentTime = now.toTimeString().slice(0, 5);
            
            document.getElementById(`${this.containerId}_dateInput`).value = today;
            document.getElementById(`${this.containerId}_timeInput`).value = currentTime;
        }
    }
    
    // モード設定
    setMode(mode) {
        this.currentMode = mode;
        
        // ボタンスタイル更新
        document.getElementById(`${this.containerId}_normalModeBtn`).style.background = mode === 'normal' ? '#007bff' : '#6c757d';
        document.getElementById(`${this.containerId}_addModeBtn`).style.background = mode === 'add' ? '#007bff' : '#6c757d';
        document.getElementById(`${this.containerId}_deleteModeBtn`).style.background = mode === 'delete' ? '#007bff' : '#6c757d';
        
        // 追加入力エリア表示切り替え
        const addInput = document.getElementById(`${this.containerId}_addInput`);
        addInput.style.display = mode === 'add' ? 'block' : 'none';
    }
    
    // カテゴリボタン生成
    generateCategoryButtons() {
        const container = document.getElementById(`${this.containerId}_categoryButtons`);
        container.innerHTML = '';
        
        // デフォルトカテゴリ + カスタムカテゴリ
        const allCategories = [...this.categories, ...this.customCategories];
        
        allCategories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.textContent = category.name || category;
            button.style.cssText = `
                background: ${category.color || '#007bff'}; 
                color: white; 
                border: none; 
                padding: 5px 10px; 
                border-radius: 5px; 
                cursor: pointer; 
                font-size: 12px; 
                opacity: 0.7;
                margin: 2px;
            `;
            button.onclick = () => this.selectCategory(category.name || category);
            container.appendChild(button);
        });
    }
    
    // カテゴリ選択
    selectCategory(categoryName) {
        if (this.currentMode === 'delete') {
            if (this.customCategories.includes(categoryName)) {
                if (confirm(`「${categoryName}」を削除しますか？`)) {
                    this.removeCategory(categoryName);
                }
            }
            return;
        }
        
        this.selectedCategory = categoryName;
        document.getElementById(`${this.containerId}_selectedCategory`).value = categoryName;
        
        // ボタンスタイル更新
        document.querySelectorAll('.category-btn').forEach(btn => {
            if (btn.textContent === categoryName) {
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1.05)';
            } else {
                btn.style.opacity = '0.7';
                btn.style.transform = 'scale(1)';
            }
        });
    }
    
    // カテゴリ追加
    executeAdd() {
        const input = document.getElementById(`${this.containerId}_addText`);
        const categoryName = input.value.trim();
        
        if (!categoryName) return;
        
        if (!this.customCategories.includes(categoryName)) {
            this.customCategories.push(categoryName);
            localStorage.setItem(`${this.containerId}_customCategories`, JSON.stringify(this.customCategories));
            this.generateCategoryButtons();
        }
        
        input.value = '';
        this.setMode('normal');
    }
    
    // カテゴリ削除
    removeCategory(categoryName) {
        this.customCategories = this.customCategories.filter(cat => cat !== categoryName);
        localStorage.setItem(`${this.containerId}_customCategories`, JSON.stringify(this.customCategories));
        this.generateCategoryButtons();
    }
    
    // カスタムカテゴリ読み込み
    loadCustomCategories() {
        this.generateCategoryButtons();
    }
    
    // 作業開始
    start() {
        if (!this.selectedCategory) {
            alert('作業カテゴリを選択してください');
            return;
        }
        
        this.startTime = new Date();
        this.isTracking = true;
        
        // ボタン表示切り替え
        document.getElementById(`${this.containerId}_startBtn`).style.display = 'none';
        document.getElementById(`${this.containerId}_endBtn`).style.display = 'inline-block';
        
        // 時刻固定
        const timeString = this.startTime.toTimeString().slice(0, 5);
        document.getElementById(`${this.containerId}_timeInput`).value = timeString;
        document.getElementById(`${this.containerId}_duration`).value = '計測中...';
        
        if (this.onStart) this.onStart(this.selectedCategory, this.startTime);
    }
    
    // 作業終了
    stop() {
        if (!this.startTime) return;
        
        this.endTime = new Date();
        this.isTracking = false;
        const durationSeconds = Math.round((this.endTime - this.startTime) / 1000);
        
        // ボタン表示切り替え
        document.getElementById(`${this.containerId}_startBtn`).style.display = 'inline-block';
        document.getElementById(`${this.containerId}_endBtn`).style.display = 'none';
        
        // 時間表示更新
        const durationInput = document.getElementById(`${this.containerId}_duration`);
        durationInput.value = this.formatDuration(durationSeconds);
        durationInput.setAttribute('data-seconds', durationSeconds);
        
        if (this.onStop) this.onStop(this.selectedCategory, this.endTime, durationSeconds);
    }
    
    // 時間フォーマット
    formatDuration(seconds) {
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
    
    // データ保存
    save() {
        const durationInput = document.getElementById(`${this.containerId}_duration`);
        const data = {
            date: document.getElementById(`${this.containerId}_dateInput`).value,
            time: document.getElementById(`${this.containerId}_timeInput`).value,
            category: this.selectedCategory,
            duration: durationInput.value,
            durationSeconds: parseInt(durationInput.getAttribute('data-seconds')) || 0,
            memo: document.getElementById(`${this.containerId}_memo`).value,
            timestamp: new Date().toISOString()
        };
        
        if (!data.category || !data.duration || data.duration === '計測中...') {
            alert('作業カテゴリを選択し、計測を完了してから保存してください');
            return;
        }
        
        if (this.onSave) {
            this.onSave(data);
        }
        
        // フォームリセット
        this.reset();
    }
    
    // フォームリセット
    reset() {
        this.selectedCategory = '';
        this.startTime = null;
        this.endTime = null;
        this.isTracking = false;
        
        document.getElementById(`${this.containerId}_selectedCategory`).value = '';
        document.getElementById(`${this.containerId}_duration`).value = '';
        document.getElementById(`${this.containerId}_memo`).value = '';
        
        // ボタンスタイルリセット
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.style.opacity = '0.7';
            btn.style.transform = 'scale(1)';
        });
    }
}

// グローバルに公開
window.TimeTracker = TimeTracker;