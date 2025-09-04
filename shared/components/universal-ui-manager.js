// 統一UI管理システム
// 全タブのUI状態管理・ボタン操作を標準化

class UniversalUIManager {
    
    // 統一選択状態管理
    static setSelectedState(selector, selectedValue, dataAttribute) {
        try {
            // 全ボタンを非選択状態に
            document.querySelectorAll(selector).forEach(btn => {
                btn.style.opacity = '0.7';
                btn.style.transform = 'scale(1)';
                btn.classList.remove('selected');
            });
            
            // 選択されたボタンを強調表示
            const selectedBtn = document.querySelector(`[${dataAttribute}="${selectedValue}"]`);
            if (selectedBtn) {
                selectedBtn.style.opacity = '1';
                selectedBtn.style.transform = 'scale(1.05)';
                selectedBtn.classList.add('selected');
                
                console.log(`✅ UI選択状態更新: ${selectedValue}`);
                return true;
            } else {
                console.log(`⚠️ 選択対象が見つかりません: ${selectedValue}`);
                return false;
            }
            
        } catch (error) {
            console.error(`❌ UI状態管理エラー:`, error);
            return false;
        }
    }
    
    // 統一ボタン状態設定
    static setButtonState(buttonId, state) {
        const button = document.getElementById(buttonId);
        if (!button) return false;
        
        const stateStyles = {
            success: { background: '#28a745', color: 'white' },
            warning: { background: '#ffc107', color: '#212529' },
            danger: { background: '#dc3545', color: 'white' },
            info: { background: '#17a2b8', color: 'white' },
            primary: { background: '#007bff', color: 'white' },
            secondary: { background: '#6c757d', color: 'white' }
        };
        
        const style = stateStyles[state];
        if (style) {
            Object.assign(button.style, style);
            console.log(`🎨 ボタン状態変更: ${buttonId} → ${state}`);
            return true;
        }
        
        return false;
    }
    
    // 統一モード切り替え
    static switchMode(modeButtons, activeMode, callback) {
        try {
            // 全モードボタンを非アクティブに
            Object.entries(modeButtons).forEach(([mode, buttonId]) => {
                const btn = document.getElementById(buttonId);
                if (btn) {
                    btn.style.background = '#6c757d';
                    btn.style.color = 'white';
                }
            });
            
            // アクティブモードボタンを強調
            const activeButtonId = modeButtons[activeMode];
            if (activeButtonId) {
                const activeBtn = document.getElementById(activeButtonId);
                if (activeBtn) {
                    activeBtn.style.background = '#007bff';
                    activeBtn.style.color = 'white';
                }
            }
            
            // コールバック実行
            if (typeof callback === 'function') {
                callback(activeMode);
            }
            
            console.log(`🔧 モード切り替え完了: ${activeMode}`);
            return true;
            
        } catch (error) {
            console.error(`❌ モード切り替えエラー:`, error);
            return false;
        }
    }
    
    // 統一フォームリセット
    static resetForm(formFields) {
        try {
            formFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = false;
                    } else {
                        field.value = '';
                    }
                }
            });
            
            // ボタン状態もリセット
            document.querySelectorAll('.selected').forEach(btn => {
                btn.style.opacity = '0.7';
                btn.style.transform = 'scale(1)';
                btn.classList.remove('selected');
            });
            
            console.log(`🧹 フォームリセット完了: ${formFields.length}項目`);
            return true;
            
        } catch (error) {
            console.error(`❌ フォームリセットエラー:`, error);
            return false;
        }
    }
    
    // 統一保存エフェクト
    static async applySaveEffect(button, effectType = 'success', duration = 2000) {
        if (!button) return;
        
        const originalText = button.textContent;
        const originalStyle = button.style.cssText;
        
        try {
            // 保存中エフェクト
            button.textContent = '💾 保存中...';
            button.style.background = '#ffc107';
            button.style.transform = 'scale(0.95)';
            button.disabled = true;
            
            // 少し待機（保存処理のための時間）
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 成功エフェクト
            button.textContent = '✅ 保存完了!';
            button.style.background = '#28a745';
            button.style.transform = 'scale(1.05)';
            button.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
            
            // 元の状態に復元
            setTimeout(() => {
                button.textContent = originalText;
                button.style.cssText = originalStyle;
                button.disabled = false;
            }, duration);
            
            console.log(`✨ 保存エフェクト完了: ${button.id || 'unknown'}`);
            
        } catch (error) {
            // エラー時の復元
            button.textContent = originalText;
            button.style.cssText = originalStyle;
            button.disabled = false;
            console.error(`❌ 保存エフェクトエラー:`, error);
        }
    }
    
    // 統一バリデーション表示
    static showValidationMessage(fieldId, message, type = 'error') {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // 既存のエラーメッセージを削除
        const existingMsg = field.parentNode.querySelector('.validation-message');
        if (existingMsg) {
            existingMsg.remove();
        }
        
        // 新しいメッセージを作成
        const msgElement = document.createElement('div');
        msgElement.className = 'validation-message';
        msgElement.textContent = message;
        msgElement.style.cssText = `
            color: ${type === 'error' ? '#dc3545' : '#28a745'};
            font-size: 12px;
            margin-top: 2px;
            padding: 4px 8px;
            background: ${type === 'error' ? '#f8d7da' : '#d4edda'};
            border-radius: 3px;
            border: 1px solid ${type === 'error' ? '#f5c6cb' : '#c3e6cb'};
        `;
        
        // フィールドの後に挿入
        field.parentNode.insertBefore(msgElement, field.nextSibling);
        
        // 3秒後に自動削除
        setTimeout(() => {
            if (msgElement.parentNode) {
                msgElement.remove();
            }
        }, 3000);
    }
    
    // 統一データ表示更新
    static updateDataDisplay(containerId, data, renderFunction) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                console.log(`⚠️ データ表示コンテナが見つかりません: ${containerId}`);
                return false;
            }
            
            if (!data || data.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">データがありません</p>';
                return true;
            }
            
            if (typeof renderFunction === 'function') {
                const html = renderFunction(data);
                container.innerHTML = html;
            } else {
                // デフォルトの表示形式
                container.innerHTML = data.map(item => `
                    <div style="background: #f8f9fa; padding: 8px; margin: 4px 0; border-radius: 4px;">
                        ${JSON.stringify(item, null, 2)}
                    </div>
                `).join('');
            }
            
            console.log(`📊 データ表示更新完了: ${containerId} (${data.length}件)`);
            return true;
            
        } catch (error) {
            console.error(`❌ データ表示エラー:`, error);
            return false;
        }
    }
}

// グローバルに公開
window.UniversalUIManager = UniversalUIManager;

// DOMUtils との互換性のためのエイリアス
if (!window.DOMUtils) {
    window.DOMUtils = {
        setSelectedState: UniversalUIManager.setSelectedState,
        setButtonState: UniversalUIManager.setButtonState
    };
}

console.log('🎨 統一UI管理システム読み込み完了');