# 🎯 Smart Effects システムガイド

## ⚡ 5秒で分かる使い方

```javascript
// たった1行でエフェクト実行
window.smartEffects.trigger('weight', 'save', saveButton);
```

**これだけで JSON設定に基づいて適切なエフェクトが自動実行されます！**

---

## 📋 エフェクトレベル一覧表

| レベル | 名前 | 色 | キラキラ | メッセージ | 用途例 |
|--------|------|-----|----------|------------|--------|
| **level1** | 軽微操作 | 🟢 緑 | 3個 | 完了！ | メモ追加、小タスク完了 |
| **level2** | 標準記録 | 🔵 青 | 6個 | 記録完了！ | 体重記録、睡眠記録 |
| **level3** | 達成・完了 | 🟡 金 | 12個 | 素晴らしい！ | 良質睡眠、全タスク完了 |
| **level4** | 編集・更新 | 🔷 水色 | 4個 | 更新完了！ | データ編集、設定変更 |
| **level5** | 重要操作 | 🔴 赤 | 8個 | 重要操作完了！ | 削除、重要な変更 |
| **level6** | 特別達成 | 🟣 紫 | 16個 | 🎉 最高です！ | 完璧睡眠、特別記録 |

---

## 🔧 実装方法

### **基本パターン**
```javascript
// 保存完了時にエフェクト実行
async function saveData() {
    // データ保存処理...
    
    // 🎯 スマートエフェクト実行
    const saveButton = document.querySelector('.save-button');
    if (window.smartEffects && saveButton) {
        window.smartEffects.trigger('タブ名', 'save', saveButton);
    }
}
```

### **条件分岐パターン（睡眠管理の例）**
```javascript
// 睡眠の質に応じてエフェクトレベル変更
const saveButton = document.querySelector('.sleep-save-btn');
if (window.smartEffects && saveButton) {
    let actionName = 'record';
    if (sleepQuality >= 8) {
        actionName = 'perfect_sleep';  // level6: 特別達成
    } else if (sleepQuality >= 6) {
        actionName = 'good_sleep';     // level3: 達成・完了  
    }
    window.smartEffects.trigger('sleep', actionName, saveButton);
}
```

### **自動検出パターン**
```javascript
// ボタンセレクターから自動検出
window.smartEffects.auto('weight', 'save');
// 設定ファイルの buttonSelectors から該当ボタンを自動検出
```

---

## ⚙️ JSON設定カスタマイズ

### **新タブ追加**
`shared/effects/smart-effects-config.json` を編集：

```json
{
  "tabMappings": {
    "your-new-tab": {
      "save": "level2",
      "delete": "level5", 
      "special": "level6"
    }
  },
  "buttonSelectors": {
    "your-new-tab": {
      "save": ".your-save-btn",
      "delete": ".your-delete-btn"
    }
  }
}
```

### **エフェクトレベル調整**
```json
{
  "effectLevels": {
    "level2": {
      "sparkleCount": 8,     // キラキラ数変更 (6 → 8)
      "color": "#ff6b6b",    // 色変更 (青 → 赤)
      "message": "やったね！" // メッセージ変更
    }
  }
}
```

---

## 🎮 使用例集

### **体重管理タブ**
```javascript
// 保存: level2 (標準記録)
window.smartEffects.trigger('weight', 'save', saveButton);

// 編集: level4 (編集・更新)  
window.smartEffects.trigger('weight', 'edit', editButton);
```

### **睡眠管理タブ**
```javascript
// 普通記録: level2
window.smartEffects.trigger('sleep', 'record', saveButton);

// 良質睡眠: level3 (6-7点)
window.smartEffects.trigger('sleep', 'good_sleep', saveButton);

// 完璧睡眠: level6 (8点以上)
window.smartEffects.trigger('sleep', 'perfect_sleep', saveButton);
```

### **メモリスト**
```javascript
// メモ追加: level1 (軽微操作)
window.smartEffects.trigger('memo-list', 'save', addButton);

// 一括完了: level3 (達成・完了)
window.smartEffects.trigger('memo-list', 'bulk_complete', completeButton);
```

---

## 🐛 トラブルシューティング

### **エフェクトが動かない**
1. **コンソール確認**
   ```javascript
   // デバッグモード有効化
   window.smartEffects.debugMode = true;
   ```

2. **設定確認**
   ```javascript
   // 統計情報表示
   console.log(window.smartEffects.getStats());
   ```

3. **ボタン要素確認**
   ```javascript
   const button = document.querySelector('.save-button');
   console.log('ボタン存在:', !!button);
   ```

### **設定が読み込まれない**
```javascript
// 設定ファイル状態確認
console.log('設定読み込み状態:', window.smartEffects.isLoaded);
console.log('設定内容:', window.smartEffects.config);
```

### **よくあるエラー**

**❌ ボタンが見つからない**
```javascript
// 解決策: セレクターを確認
const button = document.querySelector('.correct-selector');
```

**❌ タブマッピングなし**
```javascript
// 解決策: smart-effects-config.json に追加
"your-tab": { "save": "level2" }
```

---

## 🔍 高度な使い方

### **軽量モード**
```javascript
// パフォーマンス重視の軽量エフェクト
window.smartEffects.quick(buttonElement, 'level1');
```

### **設定の動的変更**
```javascript
// ランタイムで設定変更
window.smartEffects.updateConfig({
  settings: { globalDisable: true }
});
```

### **統計情報取得**
```javascript
const stats = window.smartEffects.getStats();
console.log(`利用可能レベル: ${stats.totalLevels}`);
console.log(`対応タブ: ${stats.totalTabs}`);
```

---

## 📚 関連ドキュメント

- 📄 **[01_QUICK_START.md](01_QUICK_START.md)** - 基本的な開発ルール
- 📄 **[02_DEVELOPER_WORKFLOW.md](02_DEVELOPER_WORKFLOW.md)** - 開発フロー  
- 📄 **[NEW_TAB_CREATION_GUIDE.md](NEW_TAB_CREATION_GUIDE.md)** - 新タブ作成方法

---

## 💡 プロTips

### **エフェクトの使い分け**
- **Level 1-2**: 日常的な操作
- **Level 3-4**: 重要な操作・達成
- **Level 5-6**: 特別な操作・完璧達成

### **パフォーマンス考慮**
- **モバイル**: 軽量エフェクト優先
- **デスクトップ**: フルエフェクト活用
- **バッテリー低下時**: 自動軽量化

### **ユーザー体験**
- **頻繁な操作**: Level 1-2で控えめに
- **達成感演出**: Level 3以上で盛大に
- **重要な変更**: Level 5で注意喚起

---

**🎯 Smart Effects でユーザーに最高の体験を！** ✨