// 共通JavaScript関数
// 全タブで使用される関数を集約

// 影響の少ない関数から段階的に移動

// カスタム項目判定関数
function isCustomItem(item, target) {
    const defaults = {
        timing: ['起床後', 'トイレ前', 'トイレ後', '風呂前', '風呂後', '食事前', '食事後'],
        top: ['なし', '下着シャツ', 'ワイシャツ'],
        bottom: ['なし', 'トランクス', 'ハーフパンツ']
    };
    return !defaults[target].includes(item);
}

// カスタム項目削除（統一版）
function deleteCustomItem(item, target) {
    const selector = `[data-${target === 'timing' ? 'timing' : target === 'top' ? 'clothing-top' : 'clothing-bottom'}="${item}"]`;
    const button = document.querySelector(selector);
    if (button && isCustomItem(item, target)) {
        button.remove();
        saveCustomItems();
        log(`🗑️ カスタム項目削除: ${item} (${target === 'timing' ? 'タイミング' : target === 'top' ? '上半身' : '下半身'})`);
    }
}