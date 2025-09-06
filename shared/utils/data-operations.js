// 共通データ操作関数 (data-operations.js)
// 分析レポート Step 2-1 による共通ユーティリティ外部化

// 注意: saveWeightData関数は体重管理タブ固有の機能のため、
// tabs/tab1-weight/tab-weight.js に移動しました。
// 以下の関数も将来的にはタブフォルダへの移動を検討します。

// 注意: editWeightEntry, cancelEdit, deleteWeightEntry関数は
// tabs/tab1-weight/tab-weight.js に移動しました。

// 注意: 以下のselectTiming, selectClothingTop, selectClothingBottom関数は
// mode-control.jsから動的に呼び出されているため、削除や移動はできません。
// 依存箇所: shared/components/mode-control.js (258-274行目)
// 将来的なリファクタリング検討事項です。

// タイミング選択機能（改良版）
window.selectTiming = (timing) => {
    selectedTimingValue = timing;
    document.getElementById('selectedTiming').value = timing;
    
    // すべてのボタンから選択状態を削除
    document.querySelectorAll('.timing-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.style.opacity = '0.7';
    });
    
    // 選択されたボタンに選択状態を追加
    const selectedBtn = document.querySelector(`[data-timing="${timing}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        selectedBtn.style.opacity = '1';
    }
    
    log(`⏰ 測定タイミング選択: ${timing}`);
};

// 上半身服装選択機能
window.selectClothingTop = (clothing) => {
    selectedTopValue = clothing;
    const selectedTopElement = document.getElementById('selectedTop');
    if (selectedTopElement) {
        selectedTopElement.value = clothing;
    }
    
    // すべての上半身ボタンから選択状態を削除
    document.querySelectorAll('.clothing-btn[data-clothing-top]').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 選択されたボタンに選択状態を追加
    const selectedBtn = document.querySelector(`[data-clothing-top="${clothing}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.05)';
    }
    
    log(`👕 上半身選択: ${clothing}`);
};

// 下半身服装選択機能
window.selectClothingBottom = (clothing) => {
    selectedBottomValue = clothing;
    const selectedBottomElement = document.getElementById('selectedBottom');
    if (selectedBottomElement) {
        selectedBottomElement.value = clothing;
    }
    
    // すべての下半身ボタンから選択状態を削除
    document.querySelectorAll('.clothing-btn[data-clothing-bottom]').forEach(btn => {
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 選択されたボタンに選択状態を追加
    const selectedBtn = document.querySelector(`[data-clothing-bottom="${clothing}"]`);
    if (selectedBtn) {
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.05)';
    }
    
    log(`🩲 下半身選択: ${clothing}`);
};

// ログコピー機能（安全アクセス対応）
window.copyLogs = () => {
    const logArea = document.getElementById('logArea');
    if (!logArea) {
        console.log('⚠️ logArea要素が見つかりません');
        return;
    }
    const logText = logArea.innerText || logArea.textContent;
    navigator.clipboard.writeText(logText).then(() => {
        alert('✅ ログをコピーしました');
    }).catch(() => {
        // fallback
        const textArea = document.createElement('textarea');
        textArea.value = logText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('✅ ログをコピーしました');
    });
};

// デバッグ情報コピー機能
window.copyDebugInfo = () => {
    const debugInfo = `
=== アプリ デバッグ情報 ===

【現在の状態】
- ログイン状態: ${currentUser ? '✅ 認証済み' : '❌ 未認証'}
- ユーザー情報: ${currentUser ? currentUser.email : 'なし'}
- 現在のタブ: ${currentTab}
- 編集モード: ${window.editingEntryId ? '✅ ON' : '❌ OFF'}

【選択状態】
- 測定タイミング: ${selectedTimingValue || '未選択'}
- 上半身: ${selectedTopValue || '未選択'}
- 下半身: ${selectedBottomValue || '未選択'}

【ブラウザ情報】
- User Agent: ${navigator.userAgent}
- URL: ${window.location.href}
- 画面サイズ: ${window.innerWidth} x ${window.innerHeight}

【Firebase設定】
- Project ID: ${typeof firebaseConfig !== 'undefined' ? firebaseConfig.projectId : 'undefined'}
- Database URL: ${typeof firebaseConfig !== 'undefined' ? firebaseConfig.databaseURL : 'undefined'}

【ログ】
${document.getElementById('logArea') ? document.getElementById('logArea').innerText : 'ログエリアが見つかりません'}

生成日時: ${new Date().toLocaleString('ja-JP')}
    `.trim();
    
    navigator.clipboard.writeText(debugInfo).then(() => {
        alert('✅ デバッグ情報をコピーしました');
    }).catch(() => {
        // fallback
        const textArea = document.createElement('textarea');
        textArea.value = debugInfo;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('✅ デバッグ情報をコピーしました');
    });
};