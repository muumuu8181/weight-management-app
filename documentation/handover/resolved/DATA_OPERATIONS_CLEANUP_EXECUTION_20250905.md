# 📋 data-operations.js クリーンアップ実行書

**作成日**: 2025年9月5日  
**実行者**: Claude + サブエージェント検証済み  
**対象ファイル**: `shared/utils/data-operations.js`

---

## ✅ 修正方針（合意済み）

### 基本方針
1. **重複関数の削除**: tab-weight.js に存在する上位互換版を優先
2. **依存関係の保護**: mode-control.js が使用する関数は維持
3. **段階的実行**: 最も安全な修正から順次実施
4. **動作確認**: 各段階で機能テストを実施

### 判断根拠
- 主調査とサブエージェント調査の結論が一致
- tab-weight.js の実装が新しく、FirebaseCRUD統一クラスを使用
- 削除対象の関数は体重タブ内でのみ参照されている
- mode-control.js 依存の関数は現状維持が安全

---

## 📝 作業項目（実行順）

### Phase 1: テキスト修正（最も安全）

#### 作業 1.1: copyDebugInfo のテキスト汎用化
**対象**: data-operations.js  
**作業内容**: 
```javascript
// 現在（239行目付近）
const debugInfo = `
=== 体重管理アプリ デバッグ情報 ===

// 修正後
const debugInfo = `
=== アプリ デバッグ情報 ===
```
**影響**: なし（表示テキストのみ）  
**確認方法**: デバッグ情報コピーボタンを押してテキスト確認

---

### Phase 2: 重複関数の削除（安全性確認済み）

#### 作業 2.1: editWeightEntry 関数の削除
**対象**: data-operations.js の 9-80行目  
**削除範囲**:
```javascript
// 体重データ編集機能
window.editWeightEntry = async (entryId) => {
    // ... 全体を削除 ...
};
```
**確認事項**:
- tab-weight.js に同名関数が存在すること
- 体重データの編集機能が正常動作すること

#### 作業 2.2: cancelEdit 関数の削除
**対象**: data-operations.js の 83-122行目  
**削除範囲**:
```javascript
// 編集キャンセル機能
window.cancelEdit = () => {
    // ... 全体を削除 ...
};
```
**確認事項**:
- tab-weight.js に同名関数が存在すること
- 編集キャンセル機能が正常動作すること

#### 作業 2.3: deleteWeightEntry 関数の削除
**対象**: data-operations.js の 125-143行目  
**削除範囲**:
```javascript
// データ削除
window.deleteWeightEntry = async (entryId) => {
    // ... 全体を削除 ...
};
```
**確認事項**:
- tab-weight.js に同名関数が存在すること
- 体重データの削除機能が正常動作すること

---

### Phase 3: コメント追加（保守性向上）

#### 作業 3.1: 残存関数へのコメント追加
**対象**: selectTiming, selectClothingTop, selectClothingBottom  
**作業内容**:
```javascript
// 注意: これらの関数はmode-control.jsから動的に呼び出されているため、
// 削除や移動はできません。将来的なリファクタリング検討事項です。
// 依存箇所: shared/components/mode-control.js (258-274行目)
```

---

## 🧪 動作確認チェックリスト

### Phase 1 完了後
- [ ] デバッグ情報コピーボタンで「アプリ デバッグ情報」と表示される

### Phase 2 完了後
- [ ] 体重データの新規登録が可能
- [ ] 既存データの編集ボタンが機能する
- [ ] 編集モードでのキャンセルが機能する
- [ ] データの削除ボタンが機能する
- [ ] カスタムアイテム（タイミング・服装）の追加が可能

### Phase 3 完了後
- [ ] コメントが適切に追加されている

---

## ⚠️ 注意事項

1. **削除前の確認**
   - 必ず該当関数がtab-weight.jsに存在することを確認
   - Gitでコミットしてから作業開始

2. **削除時の注意**
   - 関数全体を削除（閉じ括弧まで）
   - 前後の空行も適切に調整

3. **削除してはいけない関数**（再確認）
   - selectTiming（タイミング選択）
   - selectClothingTop（上半身服装選択）
   - selectClothingBottom（下半身服装選択）
   - copyLogs（ログコピー）
   - copyDebugInfo（削除せず、テキスト修正のみ）

---

## 📊 期待される成果

1. **コード量削減**: 約150行（重複分）
2. **保守性向上**: 体重管理機能がtab-weight.jsに集約
3. **実行の予測可能性**: 重複による不確実性の排除
4. **最新実装への統一**: FirebaseCRUD使用版に統一

---

## 🚀 実行開始

上記の作業項目をPhase 1から順次実行します。
各Phaseの完了後、動作確認を行ってから次のPhaseに進みます。