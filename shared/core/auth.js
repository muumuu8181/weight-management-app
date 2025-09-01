// Googleログイン（改良版 - ポップアップブロック検知付き）
window.handleGoogleLogin = async () => {
    try {
        log('🔐 Googleログイン開始...');
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // モバイルデバイス検出（iPhone専用対応）
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        // iPhoneはリダイレクト方式、それ以外はポップアップ方式
        if (isIPhone) {
            log('📱 iPhone/iPad検出 - リダイレクト方式でログイン（Safari対応）');
            log('🔄 ページがGoogleに移動します...');
            // リダイレクト方式（iPhone専用）
            await auth.signInWithRedirect(provider);
            return; // リダイレクトするのでここで終了
        } else if (isMobile) {
            log('📱 モバイルデバイス検出 - ポップアップ方式でログイン');
            log('💡 ポップアップが途中で止まる場合は、ブラウザ設定の確認が必要です');
        } else {
            log('🖥️ デスクトップデバイス - ポップアップ方式でログイン');
        }
        
        // ポップアップブロック検知のためのタイムアウト設定（iPhone以外）
        log('🪟 ポップアップウィンドウでGoogleログインを開始...');
        
        const loginPromise = auth.signInWithPopup(provider);
        
        // タイムアウト検知（15秒でポップアップが開かない場合）
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('ポップアップタイムアウト - ブロックされた可能性があります'));
            }, 15000);  // 元の15秒に戻す（iPhone以外用）
        });
        
        try {
            const result = await Promise.race([loginPromise, timeoutPromise]);
            log(`✅ ログイン成功: ${result.user.displayName}`);
        } catch (raceError) {
            // タイムアウトの場合の特別処理
            if (raceError.message.includes('タイムアウト')) {
                log('⏰ ポップアップが15秒以内に開きませんでした');
                log('🔄 ポップアップブロック検知 - 解決方法をご案内します');
                throw new Error('POPUP_TIMEOUT');
            } else {
                throw raceError;
            }
        }
        
    } catch (error) {
        log(`❌ ログインエラー: ${error.message}`);
        
        // エラーの詳細情報をログに出力
        if (error.code) {
            log(`- エラーコード: ${error.code}`);
            
            // 特定のエラーコードに対する解決策を提示
            switch(error.code) {
                case 'auth/unauthorized-domain':
                    log('💡 ドメイン許可設定の問題です');
                    log('💡 Firebase Consoleで認証ドメインを確認してください');
                    break;
                case 'auth/popup-blocked':
                    log('💡 ポップアップがブロックされました');
                    showPopupGuide(isMobile);
                    break;
                case 'auth/popup-closed-by-user':
                    log('💡 ユーザーがポップアップを閉じました');
                    log('💡 もう一度ログインボタンを押してください');
                    break;
                case 'auth/cancelled-popup-request':
                    log('💡 前回のポップアップがキャンセルされました');
                    log('💡 しばらく待ってから再試行してください');
                    break;
                default:
                    if (error.message === 'POPUP_TIMEOUT') {
                        log('⚠️ ポップアップが途中で止まりました');
                        showPopupGuide(isMobile);
                    } else {
                        log('💡 ブラウザを更新してもう一度お試しください');
                    }
            }
        } else if (error.message === 'POPUP_TIMEOUT') {
            showPopupGuide(isMobile);
        }
        
        if (error.credential) {
            log('- 認証情報は取得済み');
        }
    }
};

// ポップアップ許可ガイド表示
function showPopupGuide(isMobile) {
    log('📖 === ポップアップ許可ガイド ===');
    if (isMobile) {
        log('📱 スマートフォン向け解決手順:');
        log('1. ページ上部のアドレスバーに表示される「ポップアップがブロックされました」をタップ');
        log('2. または、ブラウザメニュー(⋮) → 設定 → サイト設定 → ポップアップとリダイレクト → 許可');
        log('3. Chrome: 右上⋮メニュー → 設定 → 詳細設定 → サイト設定 → ポップアップとリダイレクト');
        log('4. Safari: 設定アプリ → Safari → ポップアップブロック → オフ');
        log('5. 設定後、このページを更新してもう一度ログインボタンを押してください');
    } else {
        log('💻 PC向け解決手順:');
        log('1. アドレスバー右端のアイコン(🚫)をクリック → 許可');
        log('2. または、ブラウザ設定 → プライバシーとセキュリティ → ポップアップとリダイレクト → 許可');
    }
    log('💡 それでも解決しない場合: プライベートモードを終了するか、別のブラウザをお試しください');
    log('🔄 ポップアップ設定を確認したら、再度「Googleでログイン」ボタンを押してください');
    log('📖 ========================');
}

// ポップアップテスト機能
window.testPopup = () => {
    log('🧪 ポップアップテスト開始...');
    
    try {
        const testWindow = window.open('', '_blank', 'width=400,height=500');
        
        if (testWindow) {
            log('✅ ポップアップ許可済み - ログイン可能です');
            testWindow.close();
            log('💡 「Googleでログイン」ボタンを押してください');
        } else {
            log('❌ ポップアップがブロックされています');
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            showPopupGuide(isMobile);
        }
    } catch (error) {
        log(`❌ ポップアップテストエラー: ${error.message}`);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        showPopupGuide(isMobile);
    }
};

// ログアウト
window.handleLogout = async () => {
    try {
        await auth.signOut();
        // loadCustomItems実行フラグをリセット（次回ログイン時に再実行可能にする）
        isLoadCustomItemsExecuted = false;
        log('📤 ログアウト完了 (カスタム項目フラグリセット済み)');
    } catch (error) {
        log(`❌ ログアウトエラー: ${error.message}`);
    }
};