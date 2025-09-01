// 入力値検証・日付処理・フォーマット処理 (validation.js)
// 分析レポート Step 2-1 による共通ユーティリティ外部化

// キーボードでの値調整機能
window.handleWeightKeypress = (event) => {
    const weightInput = document.getElementById('weightValue');
    const currentValue = parseFloat(weightInput.value) || 72.0;
    
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        weightInput.value = (currentValue + 0.1).toFixed(1);
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        weightInput.value = Math.max(0, currentValue - 0.1).toFixed(1);
    }
};

// 今日の日付を取得（タイムゾーン考慮）
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 現在時刻を取得（日本時間フォーマット）
function getCurrentTimeString() {
    const now = new Date();
    return now.toLocaleTimeString('ja-JP', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// 体重値の検証・フォーマット
function validateWeight(weightValue) {
    const weight = parseFloat(weightValue);
    
    if (isNaN(weight) || weight <= 0) {
        return {
            isValid: false,
            error: '有効な体重を入力してください（0より大きい数値）',
            value: null
        };
    }
    
    if (weight > 300) {
        return {
            isValid: false,
            error: '体重が300kgを超えています。正しい値を入力してください',
            value: null
        };
    }
    
    return {
        isValid: true,
        error: null,
        value: weight
    };
}

// 日付の検証
function validateDate(dateString) {
    if (!dateString) {
        return {
            isValid: false,
            error: '日付を入力してください',
            value: null
        };
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return {
            isValid: false,
            error: '有効な日付形式で入力してください',
            value: null
        };
    }
    
    // 未来日チェック（今日から30日後まで許可）
    const today = new Date();
    const maxFutureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    if (date > maxFutureDate) {
        return {
            isValid: false,
            error: '未来の日付は30日後まで入力可能です',
            value: null
        };
    }
    
    // 過去日チェック（1年前まで許可）
    const minPastDate = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000));
    
    if (date < minPastDate) {
        return {
            isValid: false,
            error: '過去の日付は1年前まで入力可能です',
            value: null
        };
    }
    
    return {
        isValid: true,
        error: null,
        value: dateString
    };
}

// メモテキストの検証
function validateMemo(memoText) {
    if (!memoText) {
        return {
            isValid: true,
            error: null,
            value: ''
        };
    }
    
    if (memoText.length > 500) {
        return {
            isValid: false,
            error: 'メモは500文字以内で入力してください',
            value: null
        };
    }
    
    return {
        isValid: true,
        error: null,
        value: memoText.trim()
    };
}

// 体重データ入力の総合検証
function validateWeightData() {
    const date = document.getElementById('dateInput').value;
    const weight = document.getElementById('weightValue').value;
    const memo = document.getElementById('memoInput').value || '';
    
    // 個別検証
    const dateValidation = validateDate(date);
    const weightValidation = validateWeight(weight);
    const memoValidation = validateMemo(memo);
    
    const errors = [];
    
    if (!dateValidation.isValid) {
        errors.push(dateValidation.error);
    }
    
    if (!weightValidation.isValid) {
        errors.push(weightValidation.error);
    }
    
    if (!memoValidation.isValid) {
        errors.push(memoValidation.error);
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        data: {
            date: dateValidation.value,
            weight: weightValidation.value,
            memo: memoValidation.value
        }
    };
}

// 数値フォーマット関数
function formatWeight(weight) {
    const num = parseFloat(weight);
    if (isNaN(num)) return '0.0';
    return num.toFixed(1);
}

// 日付フォーマット関数（表示用）
function formatDateDisplay(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// タイムスタンプフォーマット（ログ用）
function formatTimestamp() {
    const now = new Date();
    return now.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 入力値サニタイズ
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return String(input);
    }
    
    // HTMLタグを除去
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
}

// グローバル公開
window.getTodayString = getTodayString;
window.getCurrentTimeString = getCurrentTimeString;
window.validateWeight = validateWeight;
window.validateDate = validateDate;
window.validateMemo = validateMemo;
window.validateWeightData = validateWeightData;
window.formatWeight = formatWeight;
window.formatDateDisplay = formatDateDisplay;
window.formatTimestamp = formatTimestamp;
window.sanitizeInput = sanitizeInput;