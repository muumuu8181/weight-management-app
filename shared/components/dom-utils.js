// DOM操作ヘルパー機能 (dom-utils.js)
// 分析レポート Step 2-2 によるコンポーネント分離

// 要素表示/非表示制御
function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
        return true;
    }
    return false;
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
        return true;
    }
    return false;
}

function toggleElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const isVisible = element.style.display !== 'none';
        element.style.display = isVisible ? 'none' : 'block';
        return !isVisible;
    }
    return false;
}

// ボタン状態管理
function setButtonState(buttonId, state) {
    const button = document.getElementById(buttonId);
    if (!button) return false;
    
    const states = {
        normal: { background: '#6c757d', color: 'white', opacity: '1' },
        active: { background: '#007bff', color: 'white', opacity: '1' },
        success: { background: '#28a745', color: 'white', opacity: '1' },
        danger: { background: '#dc3545', color: 'white', opacity: '1' },
        warning: { background: '#ffc107', color: '#212529', opacity: '1' },
        disabled: { background: '#6c757d', color: 'white', opacity: '0.5' }
    };
    
    if (states[state]) {
        Object.assign(button.style, states[state]);
        button.disabled = (state === 'disabled');
        return true;
    }
    return false;
}

function resetButtonStyles(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (container) {
        const buttons = container.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.background = '#6c757d';
            button.style.color = 'white';
            button.style.opacity = '0.7';
            button.style.transform = 'scale(1)';
            button.classList.remove('selected');
        });
        return buttons.length;
    }
    return 0;
}

// 選択状態の管理
function setSelectedState(selector, selectedValue, attribute) {
    // すべてのボタンから選択状態を削除
    const allButtons = document.querySelectorAll(selector);
    allButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.style.opacity = '0.7';
        btn.style.transform = 'scale(1)';
    });
    
    // 選択されたボタンに選択状態を追加
    const selectedBtn = document.querySelector(`[${attribute}="${selectedValue}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.05)';
        return true;
    }
    return false;
}

// 入力フィールド操作
function clearInput(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = '';
        return true;
    }
    return false;
}

function setInputValue(inputId, value) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = value;
        return true;
    }
    return false;
}

function focusInput(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.focus();
        return true;
    }
    return false;
}

// テキスト内容の設定
function setText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
        return true;
    }
    return false;
}

function setHTML(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = html;
        return true;
    }
    return false;
}

// スタイル操作
function setElementStyle(elementId, styles) {
    const element = document.getElementById(elementId);
    if (element && typeof styles === 'object') {
        Object.assign(element.style, styles);
        return true;
    }
    return false;
}

function addClassName(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add(className);
        return true;
    }
    return false;
}

function removeClassName(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove(className);
        return true;
    }
    return false;
}

// 動的要素作成
function createElement(tagName, attributes = {}, textContent = '') {
    const element = document.createElement(tagName);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (textContent) {
        element.textContent = textContent;
    }
    
    return element;
}

function appendToContainer(containerId, element) {
    const container = document.getElementById(containerId);
    if (container && element) {
        container.appendChild(element);
        return true;
    }
    return false;
}

function removeElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.remove();
        return true;
    }
    return false;
}

// スクロール操作
function scrollToTop() {
    window.scrollTo(0, 0);
}

function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return true;
    }
    return false;
}

// 一括DOM操作
function batchOperation(operations) {
    const results = [];
    
    operations.forEach(operation => {
        try {
            const { type, target, ...params } = operation;
            let result = false;
            
            switch (type) {
                case 'show':
                    result = showElement(target);
                    break;
                case 'hide':
                    result = hideElement(target);
                    break;
                case 'setText':
                    result = setText(target, params.text);
                    break;
                case 'setStyle':
                    result = setElementStyle(target, params.styles);
                    break;
                case 'buttonState':
                    result = setButtonState(target, params.state);
                    break;
                default:
                    result = false;
            }
            
            results.push({ operation: type, target, success: result });
        } catch (error) {
            results.push({ operation: operation.type, target: operation.target, success: false, error: error.message });
        }
    });
    
    return results;
}

// 安全なDOM操作（存在チェック付き）
function safeOperation(elementId, operation) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element not found: ${elementId}`);
        return false;
    }
    
    try {
        return operation(element);
    } catch (error) {
        console.error(`DOM operation failed for ${elementId}:`, error);
        return false;
    }
}

// グローバル公開
window.DOMUtils = {
    showElement,
    hideElement,
    toggleElement,
    setButtonState,
    resetButtonStyles,
    setSelectedState,
    clearInput,
    setInputValue,
    focusInput,
    setText,
    setHTML,
    setElementStyle,
    addClassName,
    removeClassName,
    createElement,
    appendToContainer,
    removeElement,
    scrollToTop,
    scrollToElement,
    batchOperation,
    safeOperation
};