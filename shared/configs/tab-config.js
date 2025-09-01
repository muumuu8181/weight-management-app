// タブ設定管理（16タブ対応）
// 追加タブ用の拡張対応設定

// タブボタンの基本スタイル設定
const TAB_STYLES = {
    active: {
        background: '#007bff',
        color: 'white'
    },
    inactive: {
        background: '#f8f9fa',
        color: '#495057'
    },
    common: {
        flex: '1',
        minWidth: '80px',
        padding: '8px 10px',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '5px 5px 0 0',
        marginRight: '1px',
        marginBottom: '1px',
        fontSize: '12px'
    }
};

// タブタイトル定義（16タブ対応）
const TAB_TITLES = {
    1: '📊 体重管理アプリ',
    2: '🛏️ 睡眠管理',
    3: '🏠 部屋片づけ',
    4: '🤸 ストレッチ',
    5: '📊 統合ダッシュボード',
    6: '🔧 xx6', 
    7: '🔧 xx7',
    8: '📝 メモリスト',
    9: '🔧 xx9',
    10: '🔧 xx10',
    11: '🔧 xx11',
    12: '🔧 xx12',
    13: '🔧 xx13',
    14: '🔧 xx14',
    15: '🔧 xx15',
    16: '🔧 xx16'
};

// タブボタン表示名（短縮版）
const TAB_BUTTON_NAMES = {
    1: '体重',
    2: '睡眠',
    3: '部屋片づけ',
    4: 'ストレッチ',
    5: 'ダッシュボード',
    6: 'xx6',
    7: 'xx7',
    8: 'メモリスト',
    9: 'xx9',
    10: 'xx10',
    11: 'xx11',
    12: 'xx12',
    13: 'xx13',
    14: 'xx14',
    15: 'xx15',
    16: 'xx16'
};

// タブナビゲーションHTML生成
function generateTabNavigation() {
    const nav = document.getElementById('tabNavigation');
    if (!nav) return;

    let row1Html = '<div style="display: flex; border-bottom: 2px solid #ddd; flex-wrap: wrap;">';
    let row2Html = '<div style="display: flex; border-bottom: 2px solid #ddd; flex-wrap: wrap;">';

    // 1行目（タブ1-8）
    for (let i = 1; i <= 8; i++) {
        const styleStr = Object.entries(TAB_STYLES.common)
            .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ');
        
        const marginStr = i === 8 ? 'margin-bottom: 1px;' : 'margin-right: 1px; margin-bottom: 1px;';
        
        row1Html += `<button id="tab${i}" class="tab-btn${i === 1 ? ' active' : ''}" 
                     onclick="switchTab(${i})" 
                     style="${styleStr}; ${marginStr}">${TAB_BUTTON_NAMES[i]}</button>`;
    }
    row1Html += '</div>';

    // 2行目（タブ9-16）
    for (let i = 9; i <= 16; i++) {
        const styleStr = Object.entries(TAB_STYLES.common)
            .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ');
        
        const marginStr = i === 16 ? 'margin-bottom: 1px;' : 'margin-right: 1px; margin-bottom: 1px;';
        
        row2Html += `<button id="tab${i}" class="tab-btn" 
                     onclick="switchTab(${i})" 
                     style="${styleStr}; ${marginStr}">${TAB_BUTTON_NAMES[i]}</button>`;
    }
    row2Html += '</div>';

    nav.innerHTML = row1Html + row2Html;
}

// タブスタイル適用関数
function applyTabStyles(tabNumber) {
    for (let i = 1; i <= 16; i++) {
        const tabBtn = document.getElementById(`tab${i}`);
        if (tabBtn) {
            if (i === tabNumber) {
                Object.assign(tabBtn.style, TAB_STYLES.active);
            } else {
                Object.assign(tabBtn.style, TAB_STYLES.inactive);
            }
        }
    }
}

// タブタイトル取得関数
function getTabTitle(tabNumber) {
    return TAB_TITLES[tabNumber] || '🔧 未実装';
}

// グローバルに公開
window.TAB_CONFIG = {
    generateTabNavigation,
    applyTabStyles,
    getTabTitle,
    TAB_TITLES,
    TAB_BUTTON_NAMES
};