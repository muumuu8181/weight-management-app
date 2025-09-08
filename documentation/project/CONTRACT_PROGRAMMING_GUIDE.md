# 契約プログラミング導入ガイド

## 概要

契約プログラミング（Design by Contract）をweight-management-appに導入しました。これにより、AIとの共同開発で頻発する問題を未然に防ぐことができます。

**バージョン**: v2.85で導入
**ファイル**: `shared/utils/contract.js`

## 基本的な使い方

### 1. 事前条件（Precondition）
関数実行前に満たすべき条件を定義します。

```javascript
function saveWeight(weight, date) {
    // 事前条件：引数の検証
    Contract.require(weight !== null && weight !== undefined, 'weightが必要です');
    Contract.require(typeof weight === 'number', 'weightは数値である必要があります');
    Contract.require(weight > 0 && weight < 500, 'weightは0-500の範囲である必要があります');
    Contract.require(date instanceof Date || typeof date === 'string', 'dateは日付型または文字列である必要があります');
    
    // 処理を続行...
}
```

### 2. 事後条件（Postcondition）
関数実行後に保証される条件を定義します。

```javascript
async function fetchWeightData(userId) {
    Contract.require(userId, 'userIdが必要です');
    
    const data = await firebase.database()
        .ref(`users/${userId}/weights`)
        .once('value')
        .then(snapshot => snapshot.val() || {});
    
    // 事後条件：データ形式の保証
    Contract.ensure(typeof data === 'object', 'データはオブジェクトである必要があります');
    Contract.ensure(Object.keys(data).every(key => data[key].weight), '全てのエントリにweightが必要です');
    
    return data;
}
```

### 3. 不変条件（Invariant）
オブジェクトが常に保つべき条件を定義します。

```javascript
class WeightManager {
    constructor() {
        this.entries = [];
        this.currentFilter = 'all';
    }
    
    addEntry(entry) {
        const oldCount = this.entries.length;
        
        // 処理...
        this.entries.push(entry);
        
        // 不変条件：エントリ数は減らない
        Contract.invariant(this.entries.length >= oldCount, 'エントリ数が減少しました');
        Contract.invariant(this.entries.length >= 0, 'エントリ数が負の値です');
    }
}
```

## 実際の適用例

### 前期間ボタン問題への適用

```javascript
// tabs/tab1-weight/tab-weight.js
function togglePreviousPeriod() {
    // 事前条件
    Contract.require(WeightTab.chart, 'チャートが初期化されている必要があります');
    Contract.require(typeof showPreviousPeriod === 'boolean', 'showPreviousPeriod変数が定義されている必要があります');
    Contract.requireElement('previousPeriodButton', '前期間ボタンが存在する必要があります');
    
    const oldDatasetCount = WeightTab.chart.data.datasets.length;
    const button = document.getElementById('previousPeriodButton');
    
    // 状態をトグル
    showPreviousPeriod = !showPreviousPeriod;
    
    if (showPreviousPeriod) {
        button.style.backgroundColor = '#dc3545';
        button.style.color = 'white';
        
        // データを取得して追加
        const previousData = getPreviousPeriodData();
        Contract.ensure(Array.isArray(previousData), '前期間データは配列である必要があります');
        
        // Chart.jsに前期間データセットを追加
        WeightTab.chart.data.datasets.push({
            label: '前期間',
            data: previousData,
            borderColor: 'rgba(255, 99, 132, 0.5)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            fill: false
        });
    } else {
        button.style.backgroundColor = '#28a745';
        button.style.color = 'white';
        
        // 前期間データセットを削除
        WeightTab.chart.data.datasets = WeightTab.chart.data.datasets.filter(
            dataset => dataset.label !== '前期間'
        );
    }
    
    // 事後条件：データセット数の検証
    Contract.ensure(
        showPreviousPeriod ? 
            WeightTab.chart.data.datasets.length === oldDatasetCount + 1 : 
            WeightTab.chart.data.datasets.length === oldDatasetCount - 1,
        '前期間表示状態とデータセット数が一致する必要があります'
    );
    
    // チャートを更新
    WeightTab.chart.update();
    
    // 不変条件：チャートインスタンスの健全性
    Contract.invariant(WeightTab.chart instanceof Chart, 'チャートインスタンスが破壊されています');
}
```

### Firebase操作への適用

```javascript
// shared/utils/firebase-crud.js に追加する契約
async function saveData(userId, collection, data) {
    // 事前条件
    Contract.require(firebase && firebase.database, 'Firebaseが初期化されている必要があります');
    Contract.require(userId && typeof userId === 'string', '有効なuserIdが必要です');
    Contract.require(collection && typeof collection === 'string', '有効なcollectionが必要です');
    Contract.require(data && typeof data === 'object', '保存データはオブジェクトである必要があります');
    Contract.require(!Array.isArray(data), '保存データは配列ではなくオブジェクトである必要があります');
    
    // 認証状態の確認
    Contract.require(
        firebase.auth().currentUser, 
        'ユーザーが認証されている必要があります'
    );
    Contract.require(
        firebase.auth().currentUser.uid === userId,
        'userIdが認証ユーザーと一致する必要があります'
    );
    
    const result = await firebase.database()
        .ref(`users/${userId}/${collection}`)
        .push(data);
    
    // 事後条件
    Contract.ensure(result.key, '保存操作は有効なキーを返す必要があります');
    Contract.ensure(typeof result.key === 'string', 'キーは文字列である必要があります');
    
    return result;
}
```

### DOM操作への適用

```javascript
// UIコントロールでの使用例
function updateFieldDisplay(fieldId, value) {
    // DOM要素の存在を保証
    const field = Contract.requireElement(fieldId);
    
    // 事前条件
    Contract.require(value !== undefined, '表示する値が必要です');
    
    const oldValue = field.value;
    
    // 値を更新
    field.value = value;
    
    // 事後条件
    Contract.ensure(field.value === String(value), '値が正しく設定されていません');
    
    // イベントをトリガー
    field.dispatchEvent(new Event('change'));
    
    return oldValue;
}
```

## 開発環境と本番環境の違い

- **開発環境**（localhost）: 契約違反時に例外を投げて処理を停止
- **本番環境**: 契約違反をログに記録するが処理は継続

## デバッグ機能

```javascript
// 違反ログの確認
const violations = Contract.getViolationLog();
console.log('契約違反の履歴:', violations);

// ログのクリア
Contract.clearViolationLog();

// 一時的に契約チェックを無効化
Contract.enabled = false;  // 無効化
Contract.enabled = true;   // 有効化

// パフォーマンスクリティカルな処理での使用
Contract.withoutChecks(() => {
    // この中では契約チェックが行われない
    for (let i = 0; i < 100000; i++) {
        processData(i);
    }
});
```

## 導入による効果

1. **AIのミスを即座に検出**
   - DOM要素が存在しない状態でのアクセス
   - 不正な型での関数呼び出し
   - 非同期処理の順序違反

2. **デバッグ時間の短縮**
   - 問題発生箇所が契約違反として即座に特定
   - スタックトレースで呼び出し元も明確

3. **コードの自己文書化**
   - 契約が関数の仕様を明示
   - 新規開発者/AIが理解しやすい

## 注意事項

1. **契約の粒度**
   - 公開API、状態変更処理には必須
   - 内部ヘルパー関数には最小限
   - パフォーマンスクリティカルな部分は避ける

2. **エラーメッセージ**
   - 日本語で分かりやすく
   - 何が問題かを明確に
   - 修正方法のヒントを含める

3. **既存コードへの適用**
   - 問題が発生している箇所から優先的に
   - 新規機能には必ず適用
   - 段階的な導入を推奨

## 今後の展開

1. 前期間ボタン問題への即座の適用
2. Firebase操作全体への展開
3. 各タブの主要機能への導入
4. 開発ガイドラインへの正式組み込み