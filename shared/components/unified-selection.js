// 汎用選択システム (unified-selection.js)
// 単一選択・複数選択に対応した統一選択コンポーネント

class UnifiedSelector {
    constructor(config) {
        this.containerId = config.containerId;
        this.isMultiple = config.multiple || false;
        this.hiddenInputId = config.hiddenInputId;
        this.prefix = config.prefix || '';
        this.selectedItems = this.isMultiple ? [] : null;
        this.items = config.items || [];
        this.colors = config.colors || this.getDefaultColors();
        this.onSelectionChange = config.onSelectionChange || null;
    }

    // デフォルトカラーパレット
    getDefaultColors() {
        return [
            '#28a745', '#dc3545', '#ffc107', '#17a2b8', 
            '#6f42c1', '#fd7e14', '#20c997', '#6c757d'
        ];
    }

    // 単一選択
    selectSingle(value) {
        // 既存の選択をリセット
        this.clearSelections();
        
        this.selectedItems = value;
        this.updateHiddenInput();
        this.updateButtonStyles();
        
        if (this.onSelectionChange) {
            this.onSelectionChange(this.selectedItems);
        }
        
        window.log && window.log(`✅ ${this.prefix}選択: ${value}`);
    }

    // 複数選択切り替え
    toggleMultiple(value) {
        if (!this.isMultiple) {
            this.selectSingle(value);
            return;
        }

        const index = this.selectedItems.indexOf(value);
        if (index > -1) {
            // 既に選択済み - 削除
            this.selectedItems.splice(index, 1);
        } else {
            // 未選択 - 追加
            this.selectedItems.push(value);
        }
        
        this.updateHiddenInput();
        this.updateButtonStyles();
        
        if (this.onSelectionChange) {
            this.onSelectionChange(this.selectedItems);
        }
        
        window.log && window.log(`✅ ${this.prefix}選択更新: [${this.selectedItems.join(', ')}]`);
    }

    // 選択状態をクリア
    clearSelections() {
        if (this.isMultiple) {
            this.selectedItems = [];
        } else {
            this.selectedItems = null;
        }
        this.updateHiddenInput();
        this.updateButtonStyles();
    }

    // hidden inputの値を更新
    updateHiddenInput() {
        const hiddenInput = document.getElementById(this.hiddenInputId);
        if (hiddenInput) {
            if (this.isMultiple) {
                hiddenInput.value = this.selectedItems.join(',');
            } else {
                hiddenInput.value = this.selectedItems || '';
            }
        }
    }

    // ボタンスタイルの更新
    updateButtonStyles() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const buttons = container.querySelectorAll('button[data-value]');
        buttons.forEach(button => {
            const value = button.getAttribute('data-value');
            const isSelected = this.isSelected(value);
            
            if (isSelected) {
                button.style.opacity = '1';
                button.style.transform = 'scale(1.05)';
                button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            } else {
                button.style.opacity = '0.7';
                button.style.transform = 'scale(1)';
                button.style.boxShadow = 'none';
            }
        });
    }

    // 選択状態をチェック
    isSelected(value) {
        if (this.isMultiple) {
            return this.selectedItems.includes(value);
        } else {
            return this.selectedItems === value;
        }
    }

    // カスタム項目追加
    addCustomItem(value, icon = '📂') {
        if (!value || value.trim() === '') return false;
        
        const trimmedValue = value.trim();
        
        // 重複チェック
        if (this.items.includes(trimmedValue)) {
            alert(`「${trimmedValue}」は既に存在します。`);
            return false;
        }

        // ランダムカラー選択
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // ボタン作成
        const container = document.getElementById(this.containerId);
        if (!container) return false;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'category-btn'; // CSSクラス
        button.setAttribute('data-value', trimmedValue);
        button.setAttribute('data-original-color', randomColor);
        button.textContent = `${icon} ${trimmedValue}`;
        
        // スタイル適用
        button.style.cssText = `
            background: ${randomColor}; 
            color: white; 
            border: none; 
            padding: 6px 12px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 12px; 
            opacity: 0.7;
            margin: 2px;
        `;

        // クリックイベント設定
        button.onclick = () => {
            if (this.isMultiple) {
                this.toggleMultiple(trimmedValue);
            } else {
                this.selectSingle(trimmedValue);
            }
        };

        container.appendChild(button);
        this.items.push(trimmedValue);

        // ログ出力
        window.log && window.log(`✨ ${this.prefix}カスタム項目追加: ${trimmedValue}`);
        
        return true;
    }

    // 初期化
    initialize() {
        this.updateHiddenInput();
        this.updateButtonStyles();
        window.log && window.log(`🔧 ${this.prefix}選択システム初期化完了`);
    }

    // 現在の選択内容を取得
    getSelection() {
        return this.selectedItems;
    }

    // 選択内容を設定
    setSelection(value) {
        if (this.isMultiple) {
            this.selectedItems = Array.isArray(value) ? value : [value];
        } else {
            this.selectedItems = value;
        }
        this.updateHiddenInput();
        this.updateButtonStyles();
    }
}

// グローバル公開
window.UnifiedSelector = UnifiedSelector;