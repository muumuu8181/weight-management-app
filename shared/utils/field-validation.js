// 必須・オプション項目表示システム
// 全タブ統一の入力フィールド管理

// 必須・オプション項目のバッジ表示（遅延対応版）
window.markRequiredFields = function(config, delay = 300) {
    // HTML読み込み完了を待つ
    setTimeout(() => {
        markRequiredFieldsImmediate(config);
    }, delay);
};

// 即座実行版（内部関数）
function markRequiredFieldsImmediate(config) {
    if (!config || (!config.required && !config.optional)) {
        if (typeof log === 'function') log('⚠️ フィールド設定が無効です');
        return;
    }
    
    // 必須項目にバッジ追加
    if (config.required && Array.isArray(config.required)) {
        config.required.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;
            
            // ラベルを探す（複数の方法で検索）
            let label = document.querySelector(`label[for="${fieldId}"]`);
            if (!label) {
                // 1. 親要素内のlabelを探す
                const parent = field.closest('.input-row, div, .input-card');
                if (parent) {
                    label = parent.querySelector('label');
                }
            }
            if (!label) {
                // 2. フィールドの直前の兄弟要素を探す
                let prevElement = field.previousElementSibling;
                while (prevElement) {
                    if (prevElement.tagName === 'LABEL') {
                        label = prevElement;
                        break;
                    }
                    prevElement = prevElement.previousElementSibling;
                }
            }
            if (!label) {
                // 3. 同じ親要素内で最初のlabelを探す
                const container = field.parentElement;
                if (container) {
                    label = container.querySelector('label');
                }
            }
            
            if (label && !label.querySelector('.required-badge')) {
                const badge = document.createElement('span');
                badge.className = 'required-badge';
                badge.textContent = '必須';
                badge.title = 'この項目は必須です';
                label.appendChild(badge);
                
                // フィールドにも必須クラス追加
                field.classList.add('required-field');
                
                if (typeof log === 'function') log(`✅ 必須バッジ追加: ${fieldId}`);
            } else if (!label) {
                if (typeof log === 'function') log(`⚠️ ラベルが見つかりません: ${fieldId}`);
            } else {
                if (typeof log === 'function') log(`ℹ️ 必須バッジ既存: ${fieldId}`);
            }
        });
    }
    
    // オプション項目にバッジ追加
    if (config.optional && Array.isArray(config.optional)) {
        config.optional.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;
            
            // ラベルを探す（for属性またはフィールドの直前）
            let label = document.querySelector(`label[for="${fieldId}"]`);
            if (!label) {
                // for属性がない場合、フィールドの直前のlabelを探す
                const parent = field.closest('.input-row');
                if (parent) {
                    label = parent.querySelector('label');
                }
            }
            
            if (label && !label.querySelector('.optional-badge')) {
                const badge = document.createElement('span');
                badge.className = 'optional-badge';
                badge.textContent = '任意';
                badge.title = 'この項目は任意です';
                label.appendChild(badge);
                
                // フィールドにもオプションクラス追加
                field.classList.add('optional-field');
                
                if (typeof log === 'function') log(`✅ 任意バッジ追加: ${fieldId}`);
            } else if (!label) {
                if (typeof log === 'function') log(`⚠️ ラベルが見つかりません: ${fieldId}`);
            } else {
                if (typeof log === 'function') log(`ℹ️ 任意バッジ既存: ${fieldId}`);
            }
        });
    }
    
    if (typeof log === 'function') {
        log(`✅ フィールドバッジ設定完了: 必須${config.required?.length || 0}項目、任意${config.optional?.length || 0}項目`);
    }
};

// バッジ除去（リセット用）
window.clearFieldBadges = function() {
    // 既存のバッジを削除
    document.querySelectorAll('.required-badge, .optional-badge').forEach(badge => {
        badge.remove();
    });
    
    // フィールドクラスも削除
    document.querySelectorAll('.required-field, .optional-field').forEach(field => {
        field.classList.remove('required-field', 'optional-field');
    });
    
    log('🧹 フィールドバッジクリア完了');
};

// 必須項目の検証（バリデーション強化）
window.validateRequiredFields = function(config) {
    if (!config || !config.required) return true;
    
    const missingFields = [];
    
    config.required.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        let isEmpty = false;
        if (field.type === 'checkbox' || field.type === 'radio') {
            isEmpty = !field.checked;
        } else if (field.tagName === 'SELECT') {
            isEmpty = !field.value || field.value === '';
        } else {
            isEmpty = !field.value || field.value.trim() === '';
        }
        
        if (isEmpty) {
            missingFields.push(fieldId);
            // 必須項目のハイライト
            field.style.borderColor = '#dc3545';
            field.style.boxShadow = '0 0 5px rgba(220, 53, 69, 0.5)';
        } else {
            // 正常なスタイルに戻す
            field.style.borderColor = '';
            field.style.boxShadow = '';
        }
    });
    
    if (missingFields.length > 0) {
        log(`❌ 必須項目が未入力です: ${missingFields.join(', ')}`);
        return false;
    }
    
    return true;
};

// フィールド設定のテンプレート例
window.FIELD_CONFIG_TEMPLATES = {
    weight: {
        required: ['dateInput', 'weightValue', 'selectedTiming'],
        optional: ['timeInput', 'selectedTop', 'selectedBottom', 'memoInput']
    },
    sleep: {
        required: ['sleepDateInput', 'sleepTimeInput'],
        optional: ['selectedSleepType', 'selectedQuality', 'selectedSleepTags', 'sleepMemoInput']
    },
    pedometer: {
        required: ['pedometerDateInput', 'stepsInput', 'selectedExerciseType'],
        optional: ['pedometerTimeInput', 'distanceInput', 'caloriesInput', 'pedometerMemoInput']
    }
};

log('🏷️ フィールドバッジシステム初期化完了');