# 前期間記録ボタン問題 - 引継ぎ文書

**作成日**: 2025年8月29日  
**最終バージョン**: v0.72  
**問題状態**: **未解決**  

## 問題概要

「前期間の記録」ボタンを押してもグラフに前期間データの線が追加表示されない。

## 実装済み内容

### ✅ 正常動作する部分
1. **ボタンUI**: 緑色「前期間の記録」→ 赤色「前期間OFF」の切り替え正常
2. **データ取得**: `getPreviousPeriodData()` 関数で前期間データ取得成功
3. **ログ出力**: コンソールで「前期間データ件数: 12件」等の表示確認済み
4. **JSDOMテスト**: 5/5テスト全て成功（100%）

### ❌ 問題のある部分
- **Chart.js表示**: グラフに前期間の線（薄いグレー破線）が表示されない
- **期待**: 2本線（現在期間 + 前期間）
- **実際**: 1本線のみ

## 技術詳細

### 関連ファイル
- **メインファイル**: `index.html`
- **テストファイル**: `tools/testing/weight-management-tests.js`

### 関連関数
```javascript
// ボタン制御 (正常動作)
function togglePreviousPeriod() { ... }

// データ取得 (正常動作)  
function getPreviousPeriodData(days, currentEndDate) { ... }

// チャート描画 (問題あり)
function renderChartWithData(days, filteredData, startDate, endDate) { ... }
```

### 実装場所
- **ボタン**: line 274
- **状態管理**: line 494 `showPreviousPeriod`
- **データ取得**: line 1976-2020
- **1日表示Chart.js追加**: line 1563-1589
- **複数日表示Chart.js追加**: line 1691-1721

## デバッグ状況

### 確認済み事項
1. **データ存在**: 前期間のデータは確実に存在（前ボタンで確認可能）
2. **データ取得**: `getPreviousPeriodData()` で正しくフィルタリング
3. **ログ確認**: 以下のログが正常出力される
   ```
   🔍 前期間データ取得: 1日, 現在終了日: Fri Aug 29 2025
   🔍 前期間範囲: Thu Aug 28 2025 - Thu Aug 28 2025  
   🔍 前期間データ件数: 12件
   ```

### 試行した修正
1. **v0.68**: 前期間比較機能追加
2. **v0.69**: JSDOMテスト環境追加
3. **v0.70**: 日付計算ロジック修正
4. **v0.71**: 文字列比較による日付フィルタリング修正
5. **v0.72**: データフィールド順序修正 (`entry.weight || entry.value`)

## 残る問題

### 仮説
1. **Chart.js datasets配列**: `datasets.push()` が実行されていない可能性
2. **スコープ問題**: `showPreviousPeriod` 変数がChart.js処理で参照されていない
3. **Chart.js destroy/create**: 既存チャート破棄と新チャート作成の順序問題
4. **データ形式**: Chart.jsが期待する形式と異なる可能性

### 調査が必要な項目
1. **Chart.js datasets確認**: `console.log(datasets)` でChart.js作成直前の配列内容確認
2. **showPreviousPeriod状態**: Chart.js処理時点での変数値確認
3. **Chart.js エラー**: ブラウザコンソールでChart.js関連エラー確認
4. **データ形式**: 前期間データの x, y 値が正しい形式か確認

## 次の担当者への指示

### 推奨デバッグ手順
1. **Chart.js処理直前ログ追加**:
   ```javascript
   console.log('📊 Chart.js作成直前:', {
       showPreviousPeriod,
       datasetsCount: datasets.length,
       datasets: datasets
   });
   ```

2. **実ブラウザでの動作確認**:
   - F12でコンソール確認
   - 1日表示で前期間ボタンクリック
   - datasets配列に2つの要素があるか確認

3. **Chart.js エラー確認**:
   - Chart.jsライブラリエラー
   - データ形式エラー
   - Canvas描画エラー

### 参考情報
- **Chart.js公式**: https://www.chartjs.org/docs/
- **デバッグ用データ**: 8/28に12件、8/27に9件のデータ存在確認済み
- **JSDOMテスト**: `npm run test:weight` で関数レベルテスト可能

## データベース構造

```
/users/{uid}/weightData/{push_id}/
├── weight: number (体重値)
├── date: "YYYY-MM-DD" (日付)  
├── time: "HH:MM" (時刻)
├── timing: string (測定タイミング)
├── memo: string (メモ)
└── timestamp: ServerValue
```

## 優先度

**高**: 前期間比較は主要機能として実装予定だった機能のため、早急な解決が必要。

---

**引継ぎ者**: この文書を読んだ後、JSDOMテストで関数動作を確認してから、Chart.js部分のデバッグに集中してください。データ取得は正常動作しているため、表示処理に問題があります。