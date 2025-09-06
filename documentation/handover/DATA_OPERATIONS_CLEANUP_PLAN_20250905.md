# 📋 data-operations.js クリーンアップ実行計画

**作成日**: 2025年9月5日  
**対象ファイル**: `shared/utils/data-operations.js`  
**目的**: 体重管理専用関数の重複解消と適切な配置

---

## 🎯 現在の5つの課題と対応優先順位

### 📊 リスク評価基準
- **危険度**: 機能が壊れる可能性の高さ（100点満点）
- **修正安全性**: 修正作業の安全性（100点満点）
- **総合スコア**: 危険度 × 修正安全性（高いほど対応しやすい）

---

## 🟢 レベル1: 即座に実行可能（リスク最小）

### 1. **editWeightEntry / deleteWeightEntry の重複削除**
- **現状**: 両関数が `data-operations.js` と `tab-weight.js` に重複存在
- **危険度**: 85点（どちらが実行されるか予測不能）
- **修正安全性**: 75点（単純削除で解決）
- **対応方法**:
  ```bash
  # data-operations.js の124-258行目を削除
  # - editWeightEntry (124-195行目)
  # - deleteWeightEntry (241-258行目)
  ```
- **理由**: tab-weight.js の実装の方が新しく、FirebaseCRUD統一クラスを使用している

### 2. **copyDebugInfo のテキスト汎用化**
- **現状**: "体重管理アプリ" という固有テキストが含まれる
- **危険度**: 40点（機能は壊れないがテキストが不適切）
- **修正安全性**: 85点（テキスト変更のみ）
- **対応方法**:
  ```javascript
  // 354行目を変更
  // 変更前: === 体重管理アプリ デバッグ情報 ===
  // 変更後: === アプリ デバッグ情報 ===
  ```

---

## 🟡 レベル2: 慎重に実行（中リスク）

### 3. **cancelEdit の移動**
- **現状**: 体重管理専用だがdata-operations.jsに存在
- **危険度**: 30点（体重タブ専用）
- **修正安全性**: 90点（依存関係なし）
- **対応方法**:
  ```bash
  # 1. tab-weight.js に既に同等機能があることを確認
  # 2. data-operations.js の198-237行目を削除
  ```
- **注意**: 削除前に tab-weight.js の cancelEdit (241-255行目) が正常動作することを確認

---

## 🔴 レベル3: 大規模改修が必要（高リスク）

### 4. **selectTiming / selectClothingTop / selectClothingBottom**
- **現状**: mode-control.js が動的に呼び出している
- **危険度**: 95点（移動するとカスタムアイテム機能が壊れる）
- **修正安全性**: 20点（複雑な依存関係）
- **影響範囲**:
  ```javascript
  // mode-control.js (258-274行目)
  if (typeof window[`select${category}`] === 'function') {
      window[`select${category}`](value);
  }
  ```

#### 対応オプション（推奨順）:

**Option A: 現状維持（最も安全）** ✅
- リスクがないため、当面はこのまま

**Option B: プロキシパターン（中期的解決）**
```javascript
// data-operations.js に残す（プロキシとして）
window.selectTiming = (value) => {
    if (window.WeightTab && window.WeightTab.selectTiming) {
        window.WeightTab.selectTiming(value);
    }
};
```

**Option C: mode-control.js のリファクタリング（長期的解決）**
- 動的呼び出しを静的な条件分岐に変更
- 影響が大きいため、十分なテストが必要

---

## 🟢 レベル0: 変更不要

### 5. **copyLogs**
- **現状**: 汎用的なログコピー機能
- **危険度**: 35点（共通機能として適切）
- **修正安全性**: 95点（変更の必要なし）
- **推奨**: 現状維持

---

## 📋 実行手順（推奨）

### Phase 1: 即座に実行（5分）
1. ✅ editWeightEntry の削除（124-195行目）
2. ✅ deleteWeightEntry の削除（241-258行目）
3. ✅ copyDebugInfo のテキスト修正（354行目）

### Phase 2: 動作確認後に実行（10分）
4. ⚠️ cancelEdit の削除（198-237行目）
   - 事前にtab-weight.jsの動作確認必須

### Phase 3: 将来的な検討事項
5. 🔄 selectTiming/selectClothing系の扱い
   - 当面は現状維持
   - システム全体のリファクタリング時に再検討

---

## ⚡ 実行時の注意事項

1. **バックアップ**: 変更前に必ずGitでコミット
2. **段階的実行**: Phase 1完了後、動作確認してからPhase 2へ
3. **テスト項目**:
   - 体重データの編集機能
   - 体重データの削除機能
   - 編集キャンセル機能
   - カスタムアイテムの追加・削除

---

## 🎯 期待される成果

1. **重複の解消**: 関数の二重定義による予測不能な動作を防止
2. **保守性向上**: 体重管理機能がタブフォルダに集約
3. **コード量削減**: 約150行の削減（重複分）

---

## 📝 改修後の構造

```
shared/utils/data-operations.js
├── copyLogs()           # ✅ 残す（汎用機能）
├── copyDebugInfo()      # ✅ 残す（テキスト修正済み）
├── selectTiming()       # ⚠️ 残す（mode-control.js依存）
├── selectClothingTop()  # ⚠️ 残す（mode-control.js依存）
└── selectClothingBottom() # ⚠️ 残す（mode-control.js依存）

tabs/tab1-weight/tab-weight.js
├── saveWeightData()     # ✅ 既存（重複なし）
├── editWeightEntry()    # ✅ 既存（data-operationsから削除）
├── deleteWeightEntry()  # ✅ 既存（data-operationsから削除）
└── cancelEdit()         # ✅ 既存（data-operationsから削除）
```

このプランに従って段階的に実行することで、リスクを最小限に抑えながら重複を解消できます。