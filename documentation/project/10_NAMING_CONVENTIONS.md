# 🏷️ ファイル・フォルダ命名規則

## 📋 基本ルール

### **新しいファイル・フォルダを作る前に、必ず既存の命名パターンを確認せよ**

## 📂 フォルダ別命名規則

### 1. documentation/project/ （教科書・マニュアル系）
**ルール**: `番号_名前.md`
```
✅ 正しい例:
01_QUICK_START.md
02_DEVELOPER_WORKFLOW.md
09_NEW_CREATION_CHECKLIST.md

❌ 間違い例:
QUICK_START.md          # 番号なし
1_QUICK_START.md        # ゼロパディングなし
QUICK_START_01.md       # 番号の位置が違う
```

### 2. documentation/handover/ （開発記録・調査結果）
**ルール**: `名前_日付YYYYMMDD.md`
```
✅ 正しい例:
LOG_SYSTEM_INVESTIGATION_RESULT_20250905.md
CURRENT_ISSUES_STATUS_INVESTIGATION_20250120.md

❌ 間違い例:
LOG_SYSTEM_INVESTIGATION.md        # 日付なし
20250905_LOG_SYSTEM.md             # 日付が前
```

### 3. documentation/issues/ （未解決問題）
**ルール**: `問題名-日付YYYY-MM-DD.md`
```
✅ 正しい例:
sleep-tab-recording-issue-20250829.md
previous-period-button-issue-20250829.md

❌ 間違い例:
sleep-issue.md                     # 日付なし
20250829-sleep-issue.md            # 日付が前
```

### 4. documentation/issues/resolved/ （解決済み）
**ルール**: `問題名-日付YYYYMMDD.md`
```
✅ 正しい例:
sleep-tab-recording-issue-20250829.md
insulting-expressions-fixed-20250907.md
```

### 5. tabs/ （タブ機能）
**ルール**: `tab番号-機能名/`
```
✅ 正しい例:
tabs/tab1-weight/
tabs/tab2-sleep/
tabs/tab8-memo-list/

❌ 間違い例:
tabs/weight/               # 番号なし
tabs/tab-1-weight/         # ハイフン位置違い
```

## 🔍 命名規則確認手順

### 新しくファイルを作る前に:
1. **対象フォルダの既存ファイルを確認**
   ```bash
   ls documentation/project/    # 番号パターン確認
   ls documentation/handover/   # 日付パターン確認
   ```

2. **パターンに合わせて命名**
   - project/ なら `番号_名前.md`
   - handover/ なら `名前_YYYYMMDD.md`

3. **判断に迷ったらユーザーに報告**
   ```
   📋 命名規則確認が必要
   
   **作成予定**: [ファイル名]
   **対象フォルダ**: [パス]
   **既存パターン**: [確認した規則]
   **提案命名**: [提案]
   **確認依頼**: 命名規則が正しいか確認をお願いします
   ```

## ❌ 禁止事項

1. **勝手な命名規則の作成** - 既存に合わせろ
2. **規則無視** - 「NEW_CREATION_CHECKLIST.md」のような番号なしは禁止
3. **確認なしでの作成** - 迷ったら必ずユーザーに報告

## 🆕 新規フォルダの命名規則が不明な場合

```
🚨 命名規則が不明です

**新規作成対象**: [フォルダ/ファイル名]
**既存確認結果**: 命名パターンが見つかりません
**対応**: 命名規則の策定をお願いします
```

---

**🎯 目標**: 統一された命名規則でプロジェクトの整合性を保つ