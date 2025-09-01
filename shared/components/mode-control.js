// 統一モード制御システム (mode-control.js)
// 分析レポート Step 2-2 によるコンポーネント分離

// モード制御変数（グローバル）
let currentMode = 'normal'; // 'normal', 'add', 'delete'
let selectedTarget = null; // 'timing', 'top', 'bottom' のいずれか

// 統一モード制御機能
window.setMode = (mode) => {
    currentMode = mode;
    updateModeUI();
    
    // モード変更時の表示更新
    if (mode === 'delete' && selectedTarget) {
        updateDeleteModeDisplay();
    } else if (mode !== 'delete') {
        restoreNormalDisplay();
    }
    
    log(`🔧 モード変更: ${mode === 'normal' ? '通常' : mode === 'add' ? '追加' : '削除'}モード`);
};

// 対象選択機能（統一版）
window.selectTarget = (target) => {
    selectedTarget = target;
    updateTargetUI();
    log(`🎯 対象選択: ${target === 'timing' ? 'タイミング' : target === 'top' ? '上半身' : '下半身'}`);
    
    // モードに応じて処理実行
    handleModeAction();
    
    // 削除モード時はガイダンス更新
    if (currentMode === 'delete') {
        updateDeleteModeGuidance();
    }
};

// モードに応じた処理実行
function handleModeAction() {
    if (currentMode === 'add' && selectedTarget) {
        // 追加モード: 統一入力フィールド表示
        showUnifiedAddInput();
    } else if (currentMode === 'delete' && selectedTarget) {
        // 削除モード: カスタム項目の表示変更
        updateDeleteModeDisplay();
    }
}

// 統一追加入力表示
function showUnifiedAddInput() {
    const inputArea = document.getElementById('unifiedAddInput');
    
    // 元の入力フォームに復元
    inputArea.innerHTML = `
        <div style="margin-bottom: 5px;">
            <span style="font-size: 11px; color: #155724; font-weight: bold;">✨ 新規項目を追加</span>
        </div>
        <div style="display: flex; gap: 3px; align-items: center;">
            <input type="text" id="unifiedAddText" placeholder="項目名を入力" style="flex: 1; padding: 4px 8px; border: 1px solid #28a745; border-radius: 3px; font-size: 11px;">
            <button onclick="executeAdd()" style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">✓ 追加</button>
            <button onclick="cancelAdd()" style="background: #6c757d; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">✗ キャンセル</button>
        </div>
    `;
    inputArea.style.background = '#e8f5e8';
    inputArea.style.borderColor = '#28a745';
    inputArea.style.display = 'block';
    
    const textField = document.getElementById('unifiedAddText');
    textField.value = '';
    textField.placeholder = `${selectedTarget === 'timing' ? 'タイミング' : selectedTarget === 'top' ? '上半身の服装' : '下半身の服装'}を入力`;
    textField.focus();
}

// 統一追加実行
window.executeAdd = () => {
    const newItem = document.getElementById('unifiedAddText').value.trim();
    if (!newItem || !selectedTarget) return;
    
    // 重複チェック
    const containers = {
        timing: document.getElementById('timingButtons'),
        top: document.getElementById('topClothingButtons'),
        bottom: document.getElementById('bottomClothingButtons')
    };
    
    const targetContainer = containers[selectedTarget];
    const existingButtons = Array.from(targetContainer.children);
    
    // 既存項目名チェック
    const isDuplicate = existingButtons.some(button => {
        const existingText = button.textContent.replace(/^(⏰|👔|👖)\s/, '').trim();
        return existingText.toLowerCase() === newItem.toLowerCase();
    });
    
    if (isDuplicate) {
        alert(`「${newItem}」は既に存在します。別の名前を入力してください。`);
        return;
    }

    // ランダムカラー生成
    const randomColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
    
    const button = document.createElement('button');
    button.type = 'button';
    
    if (selectedTarget === 'timing') {
        button.className = 'timing-btn';
        button.setAttribute('data-timing', newItem);
        button.onclick = () => selectTiming(newItem);
        button.textContent = `⏰ ${newItem}`;
    } else if (selectedTarget === 'top') {
        button.className = 'clothing-btn';
        button.setAttribute('data-clothing-top', newItem);
        button.onclick = () => selectClothingTop(newItem);
        button.textContent = `👔 ${newItem}`;
    } else if (selectedTarget === 'bottom') {
        button.className = 'clothing-btn';
        button.setAttribute('data-clothing-bottom', newItem);
        button.onclick = () => selectClothingBottom(newItem);
        button.textContent = `👖 ${newItem}`;
    }
    
    button.style.cssText = `background: ${randomColor}; color: white; opacity: 0.7;`;
    button.setAttribute('data-original-color', randomColor);
    
    containers[selectedTarget].appendChild(button);
    
    // 追加後すぐに選択
    if (selectedTarget === 'timing') selectTiming(newItem);
    else if (selectedTarget === 'top') selectClothingTop(newItem);
    else if (selectedTarget === 'bottom') selectClothingBottom(newItem);
    
    // 永続化保存
    saveCustomItems();
    
    // ログ出力
    const targetName = selectedTarget === 'timing' ? 'タイミング' : selectedTarget === 'top' ? '上半身' : '下半身';
    log(`✅ ${targetName}項目追加: ${newItem}`);
    
    // 入力エリアを非表示
    cancelAdd();
};

// 追加キャンセル
window.cancelAdd = () => {
    document.getElementById('unifiedAddInput').style.display = 'none';
    document.getElementById('unifiedAddText').value = '';
};

// モードUI更新
function updateModeUI() {
    const buttons = {
        normal: document.getElementById('normalModeBtn'),
        add: document.getElementById('addModeBtn'),
        delete: document.getElementById('deleteModeBtn')
    };

    // すべてリセット
    Object.entries(buttons).forEach(([key, btn]) => {
        if (btn) btn.style.background = '#6c757d';
    });

    // 選択されたモードを強調
    if (buttons[currentMode]) {
        const colors = { normal: '#007bff', add: '#28a745', delete: '#dc3545' };
        buttons[currentMode].style.background = colors[currentMode];
    }

    // モード別の表示制御
    if (currentMode === 'add') {
        // 追加モード時のガイダンス表示
        updateAddModeGuidance();
    } else if (currentMode === 'delete') {
        // 削除モード時のガイダンス表示
        updateDeleteModeGuidance();
    } else {
        // 通常モード時は統一入力を非表示
        const unifiedInput = document.getElementById('unifiedAddInput');
        if (unifiedInput) unifiedInput.style.display = 'none';
    }
}

// 追加モードガイダンス更新
function updateAddModeGuidance() {
    const inputArea = document.getElementById('unifiedAddInput');
    if (!inputArea) return;
    
    if (!selectedTarget) {
        // 対象未選択時はガイダンス表示
        inputArea.style.display = 'block';
        inputArea.innerHTML = `
            <div style="margin-bottom: 5px;">
                <span style="font-size: 11px; color: #856404; font-weight: bold;">👆 追加したい項目の対象を選択してください</span>
            </div>
        `;
        inputArea.style.background = '#fff3cd';
        inputArea.style.borderColor = '#ffc107';
    }
}

// 削除モードガイダンス更新
function updateDeleteModeGuidance() {
    const inputArea = document.getElementById('unifiedAddInput');
    if (!inputArea) return;
    
    if (!selectedTarget) {
        // 対象未選択時はガイダンス表示
        inputArea.style.display = 'block';
        inputArea.innerHTML = `
            <div style="margin-bottom: 5px;">
                <span style="font-size: 11px; color: #721c24; font-weight: bold;">👆 削除したい項目の対象を選択してください</span>
            </div>
        `;
        inputArea.style.background = '#f8d7da';
        inputArea.style.borderColor = '#dc3545';
    } else {
        // 対象選択済み時は削除方法の案内
        inputArea.style.display = 'block';
        inputArea.innerHTML = `
            <div style="margin-bottom: 5px;">
                <span style="font-size: 11px; color: #721c24; font-weight: bold;">❌ 赤色のカスタム項目をクリックして削除</span>
            </div>
        `;
        inputArea.style.background = '#f8d7da';
        inputArea.style.borderColor = '#dc3545';
    }
}

// 対象UI更新
function updateTargetUI() {
    const buttons = {
        timing: document.getElementById('timingTargetBtn'),
        top: document.getElementById('topTargetBtn'),
        bottom: document.getElementById('bottomTargetBtn')
    };

    // すべてリセット
    Object.entries(buttons).forEach(([key, btn]) => {
        if (btn) btn.style.background = '#6c757d';
    });

    // 選択された対象を強調
    if (selectedTarget && buttons[selectedTarget]) {
        buttons[selectedTarget].style.background = '#007bff';
    }
}

// 削除モード表示更新
function updateDeleteModeDisplay() {
    if (currentMode !== 'delete' || !selectedTarget) {
        return;
    }
    
    // 対象に応じたカスタムボタンを赤色に変更
    const selectors = {
        timing: '.timing-btn[data-original-color]',
        top: '.clothing-btn[data-clothing-top][data-original-color]',
        bottom: '.clothing-btn[data-clothing-bottom][data-original-color]'
    };
    
    const targetButtons = document.querySelectorAll(selectors[selectedTarget]);
    targetButtons.forEach(button => {
        button.style.background = '#dc3545';
        button.style.transform = 'scale(0.95)';
    });
    
    log(`🔴 削除モード表示: ${selectedTarget}のカスタム項目を赤色に変更`);
}

// 通常表示復元
function restoreNormalDisplay() {
    // すべてのカスタムボタンを元の色に戻す
    const customButtons = document.querySelectorAll('[data-original-color]');
    customButtons.forEach(button => {
        const originalColor = button.getAttribute('data-original-color');
        button.style.background = originalColor;
        button.style.transform = 'scale(1)';
    });
    
    // 統一入力を非表示
    const inputArea = document.getElementById('unifiedAddInput');
    if (inputArea) {
        inputArea.style.display = 'none';
    }
}

// UI状態の初期化
function initializeModeControl() {
    currentMode = 'normal';
    selectedTarget = null;
    updateModeUI();
    updateTargetUI();
    restoreNormalDisplay();
    log('🔧 モード制御システム初期化完了');
}

// グローバル公開
window.currentMode = () => currentMode;
window.selectedTarget = () => selectedTarget;
window.initializeModeControl = initializeModeControl;
window.updateModeUI = updateModeUI;
window.updateTargetUI = updateTargetUI;