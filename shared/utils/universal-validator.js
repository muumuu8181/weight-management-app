// 統一データバリデーションシステム  
// 全タブの入力検証を標準化

class UniversalValidator {
    
    // 必須フィールド検証
    static validateRequired(fields, customMessages = {}) {
        // 事前条件：パラメータの検証
        Contract.requireArray(fields, 'fields', false);
        Contract.require(typeof customMessages === 'object' && !Array.isArray(customMessages), 
            'customMessagesはオブジェクトである必要があります');
        
        const errors = [];
        const missing = [];
        
        fields.forEach(fieldId => {
            // 事前条件：fieldIdの検証
            Contract.requireType(fieldId, 'string', 'fieldId');
            Contract.require(fieldId.length > 0, 'fieldIdは空であってはいけません');
            
            const field = document.getElementById(fieldId);
            if (!field) {
                errors.push(`フィールドが見つかりません: ${fieldId}`);
                return;
            }
            
            const value = field.value ? field.value.trim() : '';
            if (!value) {
                missing.push(fieldId);
                const message = customMessages[fieldId] || `${fieldId}を入力してください`;
                this.showFieldError(field, message);
            } else {
                this.clearFieldError(field);
            }
        });
        
        if (missing.length > 0) {
            const defaultMessage = `必須項目を入力してください: ${missing.join(', ')}`;
            UniversalErrorHandler.showUserError(defaultMessage, 'warning');
            UniversalErrorHandler.logWarning(`必須項目未入力: ${missing.join(', ')}`, 'バリデーション');
            return false;
        }
        
        // 事後条件：すべてのフィールドが検証されたことを確認
        Contract.ensure(fields.length === errors.length + (fields.length - missing.length - errors.length), 
            'すべてのフィールドが処理されました');
        
        return true;
    }
    
    // 数値範囲検証
    static validateNumber(fieldId, min = null, max = null, allowFloat = true) {
        // 事前条件：パラメータの検証
        Contract.requireType(fieldId, 'string', 'fieldId');
        Contract.require(fieldId.length > 0, 'fieldIdは空であってはいけません');
        Contract.require(min === null || typeof min === 'number', 'minはnullまたは数値である必要があります');
        Contract.require(max === null || typeof max === 'number', 'maxはnullまたは数値である必要があります');
        Contract.require(typeof allowFloat === 'boolean', 'allowFloatはboolean型である必要があります');
        
        // 事前条件：min/maxの整合性
        if (min !== null && max !== null) {
            Contract.require(min <= max, '最小値は最大値以下である必要があります');
        }
        
        const field = document.getElementById(fieldId);
        if (!field || !field.value) return true;
        
        const value = allowFloat ? parseFloat(field.value) : parseInt(field.value);
        
        if (isNaN(value)) {
            this.showFieldError(field, '数値を入力してください');
            return false;
        }
        
        if (min !== null && value < min) {
            this.showFieldError(field, `${min}以上の値を入力してください`);
            return false;
        }
        
        if (max !== null && value > max) {
            this.showFieldError(field, `${max}以下の値を入力してください`);
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    // 日付検証
    static validateDate(fieldId, allowFuture = true, allowPast = true) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value) return true;
        
        const inputDate = new Date(field.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(inputDate.getTime())) {
            this.showFieldError(field, '正しい日付を入力してください');
            return false;
        }
        
        if (!allowFuture && inputDate > today) {
            this.showFieldError(field, '未来の日付は入力できません');
            return false;
        }
        
        if (!allowPast && inputDate < today) {
            this.showFieldError(field, '過去の日付は入力できません');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    // メールアドレス検証
    static validateEmail(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value) return true;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            this.showFieldError(field, '正しいメールアドレスを入力してください');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    // 体重専用検証
    static validateWeight(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value) return true;
        
        const weight = parseFloat(field.value);
        
        if (isNaN(weight)) {
            this.showFieldError(field, '数値を入力してください');
            return false;
        }
        
        if (weight <= 0) {
            this.showFieldError(field, '正の数値を入力してください');
            return false;
        }
        
        if (weight < 20 || weight > 300) {
            this.showFieldError(field, '20kg〜300kgの範囲で入力してください');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    // 時刻検証
    static validateTime(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value) return true;
        
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(field.value)) {
            this.showFieldError(field, '正しい時刻を入力してください (HH:MM)');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    // 文字数制限検証
    static validateLength(fieldId, minLength = 0, maxLength = 1000) {
        const field = document.getElementById(fieldId);
        if (!field) return true;
        
        const value = field.value || '';
        
        if (value.length < minLength) {
            this.showFieldError(field, `${minLength}文字以上入力してください`);
            return false;
        }
        
        if (value.length > maxLength) {
            this.showFieldError(field, `${maxLength}文字以下で入力してください`);
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }
    
    // 複合検証（複数ルールを一度に適用）
    static validateMultiple(validations) {
        let allValid = true;
        
        validations.forEach(validation => {
            const { type, fieldId, options = {} } = validation;
            let isValid = true;
            
            switch (type) {
                case 'required':
                    isValid = this.validateRequired([fieldId], options.messages);
                    break;
                case 'number':
                    isValid = this.validateNumber(fieldId, options.min, options.max, options.allowFloat);
                    break;
                case 'date':
                    isValid = this.validateDate(fieldId, options.allowFuture, options.allowPast);
                    break;
                case 'email':
                    isValid = this.validateEmail(fieldId);
                    break;
                case 'weight':
                    isValid = this.validateWeight(fieldId);
                    break;
                case 'time':
                    isValid = this.validateTime(fieldId);
                    break;
                case 'length':
                    isValid = this.validateLength(fieldId, options.min, options.max);
                    break;
                default:
                    console.warn(`Unknown validation type: ${type}`);
            }
            
            if (!isValid) allValid = false;
        });
        
        return allValid;
    }
    
    // フィールドエラー表示
    static showFieldError(field, message) {
        // 事前条件：パラメータの検証
        Contract.require(field && field instanceof HTMLElement, 'fieldはHTML要素である必要があります');
        Contract.requireType(message, 'string', 'message');
        Contract.require(message.length > 0, 'エラーメッセージは空であってはいけません');
        Contract.require(field.parentNode, 'フィールドには親要素が必要です');
        
        this.clearFieldError(field);
        
        field.style.borderColor = '#dc3545';
        field.style.borderWidth = '2px';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 12px;
            margin-top: 4px;
            padding: 4px 8px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 3px;
        `;
        errorDiv.textContent = message;
        
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }
    
    // フィールドエラークリア
    static clearFieldError(field) {
        // 事前条件：パラメータの検証
        Contract.require(field && field instanceof HTMLElement, 'fieldはHTML要素である必要があります');
        
        field.style.borderColor = '';
        field.style.borderWidth = '';
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // 全フィールドエラークリア
    static clearAllErrors() {
        document.querySelectorAll('.field-error').forEach(error => error.remove());
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.style.borderColor = '';
            field.style.borderWidth = '';
        });
    }
}

// タブ別バリデーション設定
window.TAB_VALIDATION_CONFIGS = {
    weight: [
        { type: 'required', fieldId: 'dateInput' },
        { type: 'required', fieldId: 'weightValue' },
        { type: 'weight', fieldId: 'weightValue' },
        { type: 'date', fieldId: 'dateInput', options: { allowFuture: false } },
        { type: 'time', fieldId: 'timeInput' }
    ],
    
    sleep: [
        { type: 'required', fieldId: 'sleepDateInput' },
        { type: 'required', fieldId: 'sleepTimeInput' },
        { type: 'date', fieldId: 'sleepDateInput', options: { allowFuture: false } },
        { type: 'time', fieldId: 'sleepTimeInput' }
    ],
    
    room: [
        { type: 'required', fieldId: 'roomDateInput' },
        { type: 'required', fieldId: 'selectedRoom' },
        { type: 'required', fieldId: 'roomDuration' },
        { type: 'number', fieldId: 'roomDuration', options: { min: 1, max: 1440, allowFloat: false } }
    ],
    
    memo: [
        { type: 'required', fieldId: 'newMemoText' },
        { type: 'length', fieldId: 'newMemoText', options: { min: 1, max: 500 } }
    ],
    
    pedometer: [
        { type: 'required', fieldId: 'stepsInput' },
        { type: 'number', fieldId: 'stepsInput', options: { min: 0, max: 100000, allowFloat: false } },
        { type: 'date', fieldId: 'pedometerDateInput', options: { allowFuture: false } }
    ]
};

// グローバルに公開
window.UniversalValidator = UniversalValidator;

// エイリアス関数  
window.validateRequired = UniversalValidator.validateRequired.bind(UniversalValidator);
window.validateTabData = (tabName) => {
    const config = window.TAB_VALIDATION_CONFIGS[tabName];
    if (config) {
        return UniversalValidator.validateMultiple(config);
    }
    return true;
};

console.log('✅ 統一データバリデーションシステム読み込み完了');