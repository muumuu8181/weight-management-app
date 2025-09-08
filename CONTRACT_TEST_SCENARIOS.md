# 契約プログラミング動作確認シナリオ

## 🧪 テスト方法

### 方法1: 自動テスト（推奨）
```bash
cd C:\Users\user\Desktop\work\90_cc\20250806\weight-management-app
node development/tools/testing/contract-test.js
```

### 方法2: テスト用HTMLページ
1. アプリを起動
2. ブラウザで `http://localhost:3000/test-contract.html` を開く
3. 各ボタンをクリックしてテスト実行

### 方法3: 実際のアプリで確認

## 📋 重要なテストシナリオ

### 1. **Firebase認証関連**

#### シナリオ A: ログアウト状態でのデータ保存
1. アプリにアクセス
2. ログアウト状態を確認
3. 体重タブで数値を入力して保存ボタンクリック
4. **期待結果**: 契約違反エラー「ユーザーがログインしている必要があります」

#### シナリオ B: 不正なユーザーIDでの操作
```javascript
// 開発者コンソールで実行
const wrongUserId = 'invalid-user-id';
FirebaseCRUD.save('weights', wrongUserId, {weight: 65});
```
**期待結果**: 契約違反「userIdが現在のログインユーザーと一致する必要があります」

### 2. **バリデーション関連**

#### シナリオ C: 存在しないフィールドのバリデーション
```javascript
// 開発者コンソールで実行
UniversalValidator.validateRequired(['non-existent-field']);
```
**期待結果**: エラーメッセージ「フィールドが見つかりません: non-existent-field」

#### シナリオ D: 不正な型でのバリデーション
```javascript
// 開発者コンソールで実行
UniversalValidator.validateNumber('weightInput', 'not-a-number', 100);
```
**期待結果**: 契約違反「minはnullまたは数値である必要があります」

### 3. **パラメータ検証**

#### シナリオ E: null/undefined パラメータ
```javascript
// 各種null/undefinedテスト
FirebaseCRUD.save(null, null, null);
UniversalValidator.validateRequired(null);
UniversalValidator.showFieldError(null, 'test');
```
**期待結果**: 各関数で適切な契約違反エラー

### 4. **開発/本番モードの違い**

#### シナリオ F: モード切り替えテスト
```javascript
// 開発モード（デフォルト）
Contract.require(false, 'テスト違反');  // エラーを投げる

// 本番モードに切り替え
Contract.isDevelopment = false;
Contract.require(false, 'テスト違反');  // ログのみ、エラーは投げない

// ログ確認
console.log(Contract.getViolationLog());
```

## 🔍 確認ポイント

### 正常動作の確認
1. **ログイン状態**での通常操作が問題なく動作すること
2. **正しいパラメータ**での関数呼び出しが成功すること
3. 契約チェックによる**パフォーマンス低下**が顕著でないこと

### エラー検出の確認
1. **型の不一致**が即座に検出されること
2. **認証状態の不整合**が検出されること
3. **DOM要素の不在**が検出されること
4. エラーメッセージが**日本語で分かりやすい**こと

### ログ機能の確認
1. 違反ログが正しく記録されること
2. ログのクリアが機能すること
3. 本番モードでもログが残ること

## 💡 デバッグのヒント

### 契約違反が発生した場合
```javascript
// 1. スタックトレースを確認
// エラーメッセージに違反箇所が表示される

// 2. 違反ログを確認
const violations = Contract.getViolationLog();
console.table(violations);

// 3. 一時的に契約を無効化
Contract.enabled = false;
// 処理を実行
Contract.enabled = true;
```

### パフォーマンステスト
```javascript
// 契約ありなしの処理時間比較
console.time('with-contract');
for(let i = 0; i < 1000; i++) {
    UniversalValidator.validateNumber('test', 0, 100);
}
console.timeEnd('with-contract');

Contract.enabled = false;
console.time('without-contract');
for(let i = 0; i < 1000; i++) {
    UniversalValidator.validateNumber('test', 0, 100);
}
console.timeEnd('without-contract');
Contract.enabled = true;
```

## 📌 重要な注意事項

1. **開発環境**（localhost）では契約違反でエラーが投げられます
2. **本番環境**では契約違反はログに記録されるのみです
3. 契約チェックは**既存の動作を変更しません**（検証のみ）
4. 潜在的なバグが**契約違反として表面化**する可能性があります