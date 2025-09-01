# 🔄 新しいsharedフォルダ構造への統合メモ

## ⚠️ 重要な注意事項
**現在、他のAIがindex.htmlを作業中のため、ファイル参照の更新は保留中**

## 📝 統合作業が必要な内容

### 1. index.htmlでの読み込み順序変更

**現在:**
```html
<script src="shared/common.js"></script>
<link rel="stylesheet" href="shared/common.css">
```

**変更後:**
```html
<!-- 定数・設定（最初に読み込み） -->
<script src="shared/configs/constants.js"></script>

<!-- コアシステム（順序重要） -->
<script src="shared/core/utils.js"></script>
<script src="shared/core/firebase.js"></script>
<script src="shared/core/tabs.js"></script>

<!-- エフェクトシステム -->
<script src="shared/effects/celebration-effects.js"></script>

<!-- スタイルシート -->
<link rel="stylesheet" href="shared/styles/base.css">
<link rel="stylesheet" href="shared/styles/components.css">
```

### 2. 削除予定の古いファイル
- `shared/common.js` ✅ 機能分離完了
- `shared/common.css` ✅ styles/フォルダに分離完了

### 3. 各タブファイルでの変更不要事項
- **体重管理 (tabs/tab1-weight/)** - グローバル関数使用のため変更不要
- **睡眠管理 (tabs/tab2-sleep/)** - グローバル関数使用のため変更不要  
- **部屋片付け (tabs/tab3-room-cleaning/)** - グローバル関数使用のため変更不要
- **ストレッチ (tabs/tab4-stretch/)** - グローバル関数使用のため変更不要
- **メモ (tabs/tab8-memo-list/)** - グローバル関数使用のため変更不要

### 4. 新機能の活用可能項目

**定数の活用例:**
```javascript
// 従来
if (weight < 20 || weight > 300) { ... }

// 新方式
if (weight < INPUT_LIMITS.WEIGHT.MIN || weight > INPUT_LIMITS.WEIGHT.MAX) { ... }
```

**メッセージの統一:**
```javascript
// 従来
log('体重データを保存しました');

// 新方式  
log(MESSAGES.SUCCESS.WEIGHT_SAVED);
```

**お祝いエフェクトの統合:**
```javascript
// 新記録達成時
if (isNewRecord) {
    celebrate({
        type: 'record',
        title: '📈 新記録達成！',
        message: '過去最高を更新しました！',
        intensity: 'high'
    });
}
```

### 5. 統合後のメリット
- ✅ 保守性向上（機能別ファイル分離）
- ✅ 再利用性向上（モジュール化）  
- ✅ 読み込み最適化（必要な機能のみ）
- ✅ エラー追跡容易（責任範囲明確）
- ✅ 新機能追加簡単（お祝いエフェクト等）

### 6. 統合タイミング
**他のAIの作業完了後に実施:**
1. index.htmlのscript/link tagを上記の順序に変更
2. 古いcommon.js/common.cssを削除
3. 動作確認テスト実行
4. 問題があれば個別修正

---

**📅 作成日:** 2025-08-31  
**👤 作成者:** Claude Code  
**🔄 ステータス:** 統合待機中