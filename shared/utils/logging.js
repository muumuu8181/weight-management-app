// ログ出力関数（安全アクセス対応）
function log(message) {
    const logArea = document.getElementById('logArea');
    const timestamp = new Date().toLocaleTimeString();
    
    // DOM要素が存在しない場合はコンソールログのみ
    if (logArea) {
        logArea.innerHTML += `[${timestamp}] ${message}<br>`;
        logArea.scrollTop = logArea.scrollHeight;
    }
    console.log(`[${timestamp}] ${message}`);
}

// デバッグ情報をクリップボードにコピー
window.copyDebugInfo = async () => {
    const debugInfo = [];
    
    debugInfo.push('=== デバッグ情報 ===');
    debugInfo.push(`日時: ${new Date().toLocaleString()}`);
    debugInfo.push(`URL: ${window.location.href}`);
    debugInfo.push(`ユーザーエージェント: ${navigator.userAgent}`);
    
    if (currentUser) {
        debugInfo.push(`ユーザー: ${currentUser.email} (${currentUser.displayName})`);
        debugInfo.push(`UID: ${currentUser.uid}`);
    } else {
        debugInfo.push('ユーザー: 未ログイン');
    }
    
    // Firebase設定（機密情報は除く）
    debugInfo.push(`Project ID: ${firebaseConfig.projectId}`);
    debugInfo.push(`Auth Domain: ${firebaseConfig.authDomain}`);
    
    // ログエリアの内容を取得
    const logArea = document.getElementById('logArea');
    if (logArea && logArea.innerHTML) {
        debugInfo.push('=== ログ ===');
        debugInfo.push(logArea.innerText);
    }
    
    const debugText = debugInfo.join('\n');
    
    try {
        await navigator.clipboard.writeText(debugText);
        log('📋 デバッグ情報をクリップボードにコピーしました');
    } catch (error) {
        log(`❌ クリップボードへのコピーに失敗: ${error.message}`);
        
        // フォールバック: テキストエリアに表示
        const textarea = document.createElement('textarea');
        textarea.value = debugText;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.width = '100%';
        textarea.style.height = '300px';
        textarea.style.zIndex = '9999';
        textarea.style.background = 'white';
        textarea.style.border = '2px solid #ccc';
        
        document.body.appendChild(textarea);
        textarea.select();
        
        log('📋 上のテキストエリアの内容をコピーしてください');
        log('✅ コピー後、テキストエリアをクリックして閉じてください');
        
        textarea.addEventListener('click', () => {
            document.body.removeChild(textarea);
        });
    }
};