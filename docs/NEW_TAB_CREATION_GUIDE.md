# 新規タブ追加手順書 - 完全ガイド

**サブタイトル**: JavaScript分離完了後のクリーンな新機能開発フロー

---

## 🎯 **前提条件**

### **✅ 必要な事前作業**
- **共通処理分離完了**: switchTab、loadTabContent等がshared/common-functions.jsに移動済み
- **index.htmlスリム化**: 2,000行以下に削減済み
- **テストツール整備**: 汎用テストツール群が利用可能

---

## 📋 **新規タブ追加の標準手順**

### **Step 1: タブ番号と機能名の決定**
```
空きタブ: 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16
推奨: 5, 6, 7 (上段の空きから順次使用)

命名規約: tab{番号}-{機能名}
例: tab5-exercise, tab6-nutrition, tab7-medical
```

### **Step 2: ディレクトリ構造作成**
```bash
mkdir tabs/tab{番号}-{機能名}
cd tabs/tab{番号}-{機能名}

# 3ファイル構成で作成
touch tab-{機能名}.html      # メインHTML
touch tab-{機能名}.css       # スタイル  
touch tab-{機能名}.js        # JavaScript
```

### **Step 3: HTMLファイル作成**
```html
<!-- tab-{機能名}.html -->
<div id="tab{番号}Content">
    <!-- {機能名}入力エリア -->
    <div class="input-card" id="{機能名}Input">
        <h3>🎯 {機能名}記録</h3>
        
        <!-- 日付入力 -->
        <input type="date" id="{機能名}DateInput">
        
        <!-- 機能固有の入力要素 -->
        
        <!-- 保存ボタン -->
        <button onclick="save{機能名}Data()">💾 記録を保存</button>
    </div>

    <!-- {機能名}履歴表示 -->
    <div class="input-card" id="{機能名}History">
        <h3>📊 {機能名}履歴</h3>
        <div class="data-area" id="{機能名}HistoryArea">
            まだ{機能名}記録がありません
        </div>
    </div>

    <!-- {機能名}統計 -->
    <div class="input-card" id="{機能名}Stats">
        <h3>📈 {機能名}統計</h3>
        <div id="{機能名}StatsArea">
            <!-- 統計表示エリア -->
        </div>
    </div>
</div>
```

### **Step 4: JavaScriptファイル作成**
```javascript
// tab-{機能名}.js
// {機能名}管理機能のJavaScript

// {機能名}関連のグローバル変数
let selected{機能名}Value = '';
let all{機能名}Data = [];

// {機能名}管理初期化
function init{機能名}Management() {
    // 現在の日付を設定
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const dateInput = document.getElementById('{機能名}DateInput');
    if (dateInput) dateInput.value = todayString;
    
    log('🎯 {機能名}管理初期化完了');
}

// {機能名}データ保存
window.save{機能名}Data = async () => {
    if (!currentUser) {
        log('❌ ログインが必要です');
        return;
    }
    
    try {
        const {機能名}Data = {
            date: document.getElementById('{機能名}DateInput').value,
            timestamp: new Date().toISOString()
        };
        
        const userRef = firebase.database().ref(`users/\${currentUser.uid}/{機能名}Data`);
        await userRef.push({機能名}Data);
        
        log('✅ {機能名}データ保存完了');
        load{機能名}Data();
        
    } catch (error) {
        log(`❌ {機能名}データ保存エラー: \${error.message}`);
    }
};

// {機能名}データ読み込み
window.load{機能名}Data = async () => {
    if (!currentUser) return;
    
    try {
        const userRef = firebase.database().ref(`users/\${currentUser.uid}/{機能名}Data`);
        const snapshot = await userRef.once('value');
        
        const historyArea = document.getElementById('{機能名}HistoryArea');
        if (!historyArea) return;
        
        if (!snapshot.exists()) {
            historyArea.innerHTML = '<p style="text-align: center; color: #666;">記録がありません</p>';
            return;
        }
        
        const data = snapshot.val();
        const entries = Object.entries(data).reverse();
        
        let html = '';
        entries.forEach(([key, entry]) => {
            html += `
                <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px;">
                    <strong>📅 \${entry.date}</strong>
                    <button onclick="delete{機能名}Entry('\${key}')" style="float: right; background: #dc3545; color: white; border: none; padding: 2px 6px; border-radius: 3px;">削除</button>
                </div>
            `;
        });
        
        historyArea.innerHTML = html;
        
    } catch (error) {
        log(`❌ {機能名}データ読み込みエラー: \${error.message}`);
    }
};

// {機能名}記録削除
window.delete{機能名}Entry = async (entryKey) => {
    if (!currentUser) return;
    
    if (!confirm('この記録を削除しますか？')) return;
    
    try {
        const entryRef = firebase.database().ref(`users/\${currentUser.uid}/{機能名}Data/\${entryKey}`);
        await entryRef.remove();
        
        log('🗑️ {機能名}記録を削除しました');
        load{機能名}Data();
        
    } catch (error) {
        log(`❌ {機能名}記録削除エラー: \${error.message}`);
    }
};
```

### **Step 5: index.htmlへの統合**

#### **5.1 CSSファイル読み込み追加**
```html
<!-- タブ固有スタイル -->
<link rel="stylesheet" href="tabs/tab{番号}-{機能名}/{機能名}.css">
```

#### **5.2 タブボタンの更新**
```html
<button id="tab{番号}" class="tab-btn" onclick="switchTab({番号})">🎯 {機能名}</button>
```

#### **5.3 タブコンテンツエリア**
```html
<!-- タブコンテンツ{番号}: {機能名} -->
<div id="tabContent{番号}" class="tab-content hidden">
    <!-- {機能名}コンテンツは動的読み込み -->
</div>
```

#### **5.4 動的読み込み設定**
```javascript
// switchTab関数内に追加
} else if (i === {番号}) {
    await loadTabContent({番号}, '{機能名}');
```

#### **5.5 タブ名マッピング**
```javascript
// タブ名マッピングに追加
{番号}: '🎯 {機能名}管理',
```

#### **5.6 初期化処理追加**
```javascript
// loadTabContent完了後の初期化
} else if (tabNumber === {番号} && currentUser) {
    setTimeout(() => {
        if (typeof window.init{機能名}Management === 'function') {
            window.init{機能名}Management();
            log('✅ {機能名}タブ初期化完了');
        }
    }, 200);
```

---

## 🧪 **品質保証・テスト**

### **汎用テストツールでの確認**
```bash
# 要素表示確認
node tools/testing/universal-display-checker.js {機能名}

# グラフ・チャート確認（必要に応じて）
node tools/testing/universal-chart-checker.js {機能名}

# 全体テスト
npm test
```

---

## ⚖️ **新規タブ追加のタイミング判断**

### **🚨 現在は後回し推奨**

**理由**:
- **index.html: 1,699行**はまだ大きい
- **共通処理**（switchTab、loadTabContent等）が残存
- **効率性**: 共通基盤整備→新機能追加の順が最適

### **✅ 追加可能になる条件**
1. **共通処理分離完了**: shared/common-functions.jsに移動
2. **index.html**: 1,500行以下に削減
3. **テストツール**: 新機能用の検証体制整備

---

## 📂 **参考ファイル**

- **既存実装例**: `tabs/tab4-stretch/` (完全実装済み)
- **テストツール**: `docs/TESTING_TOOLS_MANUAL.md`
- **分離ルール**: `docs/separation-work-rules.md`
- **タブ管理**: `docs/TAB_MANAGEMENT_RULES.md`

---

**作成日**: 2025年9月2日  
**対象バージョン**: v2.01以降  
**前提条件**: JavaScript分離作業完了後