// カスタム項目管理機能 (custom-items.js)
// 分析レポート Step 2-1 による共通ユーティリティ外部化

// ランダムカラー定数
const RANDOM_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a55eea'];

// カスタム項目の永続化機能（localStorage活用）
const STORAGE_KEYS = {
    customTimings: 'weightApp_customTimings',
    customTops: 'weightApp_customTops',
    customBottoms: 'weightApp_customBottoms'
};

window.addTopCustomItem = () => {
    const newItem = document.getElementById('topCustomText').value.trim();
    if (newItem) {
        const container = document.getElementById('topClothingButtons');
        
        // ランダムカラー生成（統一定数使用）
        // const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a55eea']; // 重複削除
        const randomColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
        
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'clothing-btn';
        button.setAttribute('data-clothing-top', newItem);
        button.onclick = () => selectClothingTop(newItem);
        button.style.cssText = `background: ${randomColor}; color: white; opacity: 0.7;`;
        button.setAttribute('data-original-color', randomColor);
        button.textContent = `👔 ${newItem}`;
        
        container.appendChild(button);
        log(`✅ 新しい上半身項目追加: ${newItem}`);
        
        // 追加後すぐに選択
        selectClothingTop(newItem);
        
        // カスタム項目を永続化保存
        saveCustomItems();
        
        // 入力フィールドをリセット・非表示
        document.getElementById('topCustomText').value = '';
        document.getElementById('topCustomInput').style.display = 'none';
    }
};

window.cancelTopCustom = () => {
    document.getElementById('topCustomText').value = '';
    document.getElementById('topCustomInput').style.display = 'none';
};

// カスタム下半身項目追加（改良版 - スマホ対応）
window.addCustomClothingBottom = () => {
    document.getElementById('bottomCustomInput').style.display = 'block';
    document.getElementById('bottomCustomText').focus();
};

window.addBottomCustomItem = () => {
    const newItem = document.getElementById('bottomCustomText').value.trim();
    if (newItem) {
        const container = document.getElementById('bottomClothingButtons');
        
        // ランダムカラー生成（統一定数使用）
        // const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a55eea']; // 重複削除
        const randomColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
        
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'clothing-btn';
        button.setAttribute('data-clothing-bottom', newItem);
        button.onclick = () => selectClothingBottom(newItem);
        button.style.cssText = `background: ${randomColor}; color: white; opacity: 0.7;`;
        button.setAttribute('data-original-color', randomColor);
        button.textContent = `👖 ${newItem}`;
        
        container.appendChild(button);
        log(`✅ 新しい下半身項目追加: ${newItem}`);
        
        // 追加後すぐに選択
        selectClothingBottom(newItem);
        
        // カスタム項目を永続化保存
        saveCustomItems();
        
        // 入力フィールドをリセット・非表示
        document.getElementById('bottomCustomText').value = '';
        document.getElementById('bottomCustomInput').style.display = 'none';
    }
};

window.cancelBottomCustom = () => {
    document.getElementById('bottomCustomText').value = '';
    document.getElementById('bottomCustomInput').style.display = 'none';
};

// カスタムタイミング項目追加（改良版 - スマホ対応）
window.addCustomTiming = () => {
    document.getElementById('timingCustomInput').style.display = 'block';
    document.getElementById('timingCustomText').focus();
};

window.addTimingCustomItem = () => {
    const newItem = document.getElementById('timingCustomText').value.trim();
    if (newItem) {
        const container = document.getElementById('timingButtons');
        
        // ランダムカラー生成（統一定数使用）
        // const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a55eea']; // 重複削除
        const randomColor = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
        
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'timing-btn';
        button.setAttribute('data-timing', newItem);
        button.onclick = () => selectTiming(newItem);
        button.style.cssText = `background: ${randomColor}; color: white; opacity: 0.7;`;
        button.setAttribute('data-original-color', randomColor);
        button.textContent = `⏰ ${newItem}`;
        
        container.appendChild(button);
        log(`✅ 新しいタイミング項目追加: ${newItem}`);
        
        // 追加後すぐに選択
        selectTiming(newItem);
        
        // カスタム項目を永続化保存
        saveCustomItems();
        
        // 入力フィールドをリセット・非表示
        document.getElementById('timingCustomText').value = '';
        document.getElementById('timingCustomInput').style.display = 'none';
    }
};

window.cancelTimingCustom = () => {
    document.getElementById('timingCustomText').value = '';
    document.getElementById('timingCustomInput').style.display = 'none';
};

// カスタム項目保存（Firebase版）
async function saveCustomItems() {
    const customTimings = Array.from(document.querySelectorAll('.timing-btn:not([data-timing="起床後"]):not([data-timing="トイレ前"]):not([data-timing="トイレ後"]):not([data-timing="風呂前"]):not([data-timing="風呂後"]):not([data-timing="食事前"]):not([data-timing="食事後"])'))
        .map(btn => ({
            text: btn.getAttribute('data-timing'),
            color: btn.style.background
        }));
    
    const customTops = Array.from(document.querySelectorAll('.clothing-btn[data-clothing-top]:not([data-clothing-top="なし"]):not([data-clothing-top="下着シャツ"]):not([data-clothing-top="ワイシャツ"])'))
        .map(btn => ({
            text: btn.getAttribute('data-clothing-top'),
            color: btn.style.background
        }));
    
    const customBottoms = Array.from(document.querySelectorAll('.clothing-btn[data-clothing-bottom]:not([data-clothing-bottom="なし"]):not([data-clothing-bottom="トランクス"]):not([data-clothing-bottom="ハーフパンツ"])'))
        .map(btn => ({
            text: btn.getAttribute('data-clothing-bottom'),
            color: btn.style.background
        }));

    log(`💾 保存対象: ${customTimings.length}個のタイミング、${customTops.length}個の上半身、${customBottoms.length}個の下半身`);

    if (!currentUser) {
        log('⚠️ カスタム項目保存: ログイン後に保存されます');
        // localStorage にも保存（ログイン前バックアップ）
        localStorage.setItem(STORAGE_KEYS.customTimings, JSON.stringify(customTimings));
        localStorage.setItem(STORAGE_KEYS.customTops, JSON.stringify(customTops));
        localStorage.setItem(STORAGE_KEYS.customBottoms, JSON.stringify(customBottoms));
        return;
    }

    try {
        const customItemsRef = database.ref(`users/${currentUser.uid}/customItems`);
        await customItemsRef.set({
            timings: customTimings,
            tops: customTops,
            bottoms: customBottoms,
            savedAt: new Date().toISOString()
        });
        
        log(`✅ カスタム項目保存完了 (Firebase): 計${customTimings.length + customTops.length + customBottoms.length}個`);
        
        // localStorage クリア（Firebase保存成功時）
        localStorage.removeItem(STORAGE_KEYS.customTimings);
        localStorage.removeItem(STORAGE_KEYS.customTops);
        localStorage.removeItem(STORAGE_KEYS.customBottoms);
        
    } catch (error) {
        log(`❌ Firebase保存エラー: ${error.message}`);
        // fallback to localStorage
        localStorage.setItem(STORAGE_KEYS.customTimings, JSON.stringify(customTimings));
        localStorage.setItem(STORAGE_KEYS.customTops, JSON.stringify(customTops));
        localStorage.setItem(STORAGE_KEYS.customBottoms, JSON.stringify(customBottoms));
        log('💾 localStorageにフォールバック保存しました');
    }
}

// グローバル変数: loadCustomItems実行フラグ
let isLoadCustomItemsExecuted = false;

// 固定カスタム項目を強制設定（安定表示用）
async function setFixedCustomItems() {
    const fixedTimings = [
        {text: "帰宅後", color: "#6c757d"},
        {text: "何となく", color: "#6c757d"},
        {text: "帰宅:食事無し", color: "#6c757d"},
        {text: "ある程度飲んだ後", color: "#6c757d"},
        {text: "帰宅:食事有+半日(7時間以上)", color: "#6c757d"},
        {text: "飲んだ後", color: "#6c757d"},
        {text: "トイレ(L)後", color: "#6c757d"}
    ];
    
    if (currentUser) {
        try {
            const customItemsRef = database.ref(`users/${currentUser.uid}/customItems`);
            await customItemsRef.set({
                timings: fixedTimings,
                tops: [],
                bottoms: [],
                savedAt: new Date().toISOString()
            });
            log('🔧 固定カスタム項目を設定しました');
        } catch (error) {
            log(`❌ 固定カスタム項目設定エラー: ${error.message}`);
        }
    }
}

// カスタム項目読み込み（Firebase版）
async function loadCustomItems() {
    // 実行制御: 既に実行済みの場合は即座にreturn
    if (isLoadCustomItemsExecuted) {
        log('⚠️ カスタム項目復元スキップ: 既に実行済み');
        return;
    }
    
    // 既存のカスタムボタンを完全削除（最優先実行）
    const existingTimingButtons = document.querySelectorAll('.timing-btn[data-original-color]');
    const existingClothingButtons = document.querySelectorAll('.clothing-btn[data-original-color]');
    
    existingTimingButtons.forEach(btn => btn.remove());
    existingClothingButtons.forEach(btn => btn.remove());
    
    log(`🧹 既存カスタムボタン完全削除: タイミング${existingTimingButtons.length}個、服装${existingClothingButtons.length}個`);
    
    // 実行フラグをtrueに設定
    isLoadCustomItemsExecuted = true;
    
    let timings = [];
    let tops = [];
    let bottoms = [];
    
    if (currentUser) {
        try {
            // Firebase から読み込み
            const customItemsRef = database.ref(`users/${currentUser.uid}/customItems`);
            const snapshot = await customItemsRef.once('value');
            const customData = snapshot.val();
            
            if (customData) {
                timings = customData.timings || [];
                tops = customData.tops || [];
                bottoms = customData.bottoms || [];
                log(`🔄 Firebase復元: ${timings.length}個のタイミング、${tops.length}個の上半身、${bottoms.length}個の下半身`);
            } else {
                log('⚠️ カスタム項目データなし - 固定項目を設定');
                await setFixedCustomItems();
                // 再帰呼び出しを防ぐため、固定項目を直接設定
                timings = [
                    {text: "帰宅後", color: "#6c757d"},
                    {text: "何となく", color: "#6c757d"},
                    {text: "帰宅:食事無し", color: "#6c757d"},
                    {text: "ある程度飲んだ後", color: "#6c757d"},
                    {text: "帰宅:食事有+半日(7時間以上)", color: "#6c757d"},
                    {text: "飲んだ後", color: "#6c757d"},
                    {text: "トイレ(L)後", color: "#6c757d"}
                ];
            }
        } catch (error) {
            log(`❌ Firebase読み込みエラー: ${error.message}`);
            // localStorage フォールバック
            try {
                timings = JSON.parse(localStorage.getItem(STORAGE_KEYS.customTimings) || '[]');
                tops = JSON.parse(localStorage.getItem(STORAGE_KEYS.customTops) || '[]');
                bottoms = JSON.parse(localStorage.getItem(STORAGE_KEYS.customBottoms) || '[]');
                log(`🔄 localStorage復元: ${timings.length}個のタイミング、${tops.length}個の上半身、${bottoms.length}個の下半身`);
            } catch (localError) {
                log(`❌ localStorage読み込みエラー: ${localError.message}`);
            }
        }
    } else {
        // 未ログイン時は localStorage から復元
        try {
            timings = JSON.parse(localStorage.getItem(STORAGE_KEYS.customTimings) || '[]');
            tops = JSON.parse(localStorage.getItem(STORAGE_KEYS.customTops) || '[]');
            bottoms = JSON.parse(localStorage.getItem(STORAGE_KEYS.customBottoms) || '[]');
            log(`🔄 未ログイン時localStorage復元: ${timings.length}個のタイミング、${tops.length}個の上半身、${bottoms.length}個の下半身`);
        } catch (error) {
            log(`❌ localStorage読み込みエラー: ${error.message}`);
        }
    }
    
    // UI に反映
    restoreCustomButtons(timings, tops, bottoms);
    
    log(`✅ カスタム項目復元完了: 合計${timings.length + tops.length + bottoms.length}個`);
}

// カスタムボタン復元
function restoreCustomButtons(timings, tops, bottoms) {
    // タイミングボタン復元
    const timingContainer = document.getElementById('timingButtons');
    if (timingContainer) {
        timings.forEach(timing => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'timing-btn';
            button.setAttribute('data-timing', timing.text);
            button.onclick = () => selectTiming(timing.text);
            button.style.cssText = `background: ${timing.color}; color: white; opacity: 0.7;`;
            button.setAttribute('data-original-color', timing.color);
            button.textContent = `⏰ ${timing.text}`;
            timingContainer.appendChild(button);
        });
    }
    
    // 上半身ボタン復元
    const topContainer = document.getElementById('topClothingButtons');
    if (topContainer) {
        tops.forEach(top => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'clothing-btn';
            button.setAttribute('data-clothing-top', top.text);
            button.onclick = () => selectClothingTop(top.text);
            button.style.cssText = `background: ${top.color}; color: white; opacity: 0.7;`;
            button.setAttribute('data-original-color', top.color);
            button.textContent = `👔 ${top.text}`;
            topContainer.appendChild(button);
        });
    }
    
    // 下半身ボタン復元
    const bottomContainer = document.getElementById('bottomClothingButtons');
    if (bottomContainer) {
        bottoms.forEach(bottom => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'clothing-btn';
            button.setAttribute('data-clothing-bottom', bottom.text);
            button.onclick = () => selectClothingBottom(bottom.text);
            button.style.cssText = `background: ${bottom.color}; color: white; opacity: 0.7;`;
            button.setAttribute('data-original-color', bottom.color);
            button.textContent = `👖 ${bottom.text}`;
            bottomContainer.appendChild(button);
        });
    }
}

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

// グローバル公開
window.saveCustomItems = saveCustomItems;
window.loadCustomItems = loadCustomItems;
window.setFixedCustomItems = setFixedCustomItems;
window.isCustomItem = isCustomItem;
window.deleteCustomItem = deleteCustomItem;