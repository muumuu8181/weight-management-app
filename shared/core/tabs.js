/**
 * タブ管理システム
 * アプリケーションのタブ切り替え、ナビゲーション機能を担当
 */

// 現在のタブ状態
let currentTab = 1;

/**
 * タブ切り替え処理
 * @param {number} tabNumber - 切り替え先のタブ番号
 */
function switchTab(tabNumber) {
    currentTab = tabNumber;
    
    // すべてのタブボタンを非アクティブに
    for (let i = 1; i <= 10; i++) { // 将来の拡張を考慮して10まで対応
        const tabBtn = document.getElementById(`tab${i}`);
        const tabContent = document.getElementById(`tabContent${i}`);
        
        if (tabBtn && tabContent) {
            if (i === tabNumber) {
                // アクティブタブ
                tabBtn.style.background = '#007bff';
                tabBtn.style.color = 'white';
                tabContent.classList.remove('hidden');
            } else {
                // 非アクティブタブ
                tabBtn.style.background = '#f8f9fa';
                tabBtn.style.color = '#495057';
                tabContent.classList.add('hidden');
            }
        }
    }
    
    log(`📑 タブ切り替え: タブ${tabNumber}`);
}

/**
 * タブの初期化
 * ページ読み込み時にタブシステムをセットアップ
 */
function initializeTabs() {
    // デフォルトでタブ1を表示
    switchTab(1);
    
    // タブボタンにクリックイベントを設定
    for (let i = 1; i <= 10; i++) {
        const tabBtn = document.getElementById(`tab${i}`);
        if (tabBtn) {
            tabBtn.addEventListener('click', () => switchTab(i));
        }
    }
    
    log('📑 タブシステム初期化完了');
}

/**
 * 現在のタブ番号を取得
 * @returns {number} 現在のタブ番号
 */
function getCurrentTab() {
    return currentTab;
}

/**
 * タブの有効/無効を制御
 * @param {number} tabNumber - タブ番号
 * @param {boolean} enabled - 有効無効フラグ
 */
function setTabEnabled(tabNumber, enabled) {
    const tabBtn = document.getElementById(`tab${tabNumber}`);
    if (tabBtn) {
        if (enabled) {
            tabBtn.disabled = false;
            tabBtn.style.opacity = '1';
            tabBtn.style.cursor = 'pointer';
        } else {
            tabBtn.disabled = true;
            tabBtn.style.opacity = '0.5';
            tabBtn.style.cursor = 'not-allowed';
        }
        log(`📑 タブ${tabNumber} ${enabled ? '有効化' : '無効化'}`);
    }
}

/**
 * タブに通知バッジを表示
 * @param {number} tabNumber - タブ番号
 * @param {string|number} badge - バッジ内容（数字や文字）
 */
function setTabBadge(tabNumber, badge) {
    const tabBtn = document.getElementById(`tab${tabNumber}`);
    if (tabBtn) {
        // 既存のバッジを削除
        const existingBadge = tabBtn.querySelector('.tab-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // 新しいバッジを追加
        if (badge) {
            const badgeElement = document.createElement('span');
            badgeElement.className = 'tab-badge';
            badgeElement.textContent = badge;
            badgeElement.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff4757;
                color: white;
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 10px;
                font-weight: bold;
                min-width: 16px;
                text-align: center;
            `;
            
            tabBtn.style.position = 'relative';
            tabBtn.appendChild(badgeElement);
        }
        
        log(`📑 タブ${tabNumber} バッジ: ${badge || 'なし'}`);
    }
}

// DOM読み込み完了時にタブシステムを初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
});

// グローバルエクスポート
window.switchTab = switchTab;
window.getCurrentTab = getCurrentTab;
window.setTabEnabled = setTabEnabled;
window.setTabBadge = setTabBadge;
window.currentTab = currentTab;