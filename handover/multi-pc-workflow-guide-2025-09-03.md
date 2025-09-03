# 複数PC作業ガイド - GitHubワークフロー
*作成日: 2025-09-03*

## 🎯 複数PC作業での安全なワークフロー

### **基本原則**
- **メインPC**: `main`ブランチで作業
- **サブPC**: 必ず`feature`ブランチを作成
- **AI作業**: どのPCでもプルリクエスト経由で統合

---

## 📋 ワークフロー手順

### **1. サブPCでの作業開始**
```bash
git checkout main
git pull origin main                    # 最新取得
git checkout -b feature/description     # 新ブランチ作成
```

### **2. AI と作業**
```bash
# 通常通りAIと開発作業
# 変更・テスト・確認
```

### **3. 作業完了時**
```bash
git add .
git commit -m "変更内容の説明"
git push origin feature/description
```

### **4. プルリクエスト作成**
GitHub上でプルリクエスト作成

### **5. メインPCでマージ**
```bash
# GitHubでレビュー・マージ後
git checkout main
git pull origin main
```

---

## ⚠️ 注意点・リスク対策

### **高リスク要因**
1. **Firebase設定** - 共有DB使用、データ競合注意
2. **認証設定** - Google認証共通、設定変更時要注意
3. **バックアップファイル** - 同時作業での上書きリスク

### **中リスク要因**
1. **テストレポート** - 出力先修正が必要
2. **package-lock.json** - npm install時の差分

### **対策**
- **.gitignore追加**: テストレポート類
- **出力先修正**: `tools/testing/ui-test-runner.js`
- **ブランチ戦略**: 機能別に分離
- **レビュー必須**: 設定ファイル変更時

---

## 🔧 現在の問題

### **JSDOMテストレポート**
- **問題**: rootフォルダに出力
- **場所**: `tools/testing/ui-test-runner.js:679`
- **修正必要**: 出力先を適切なフォルダに変更

### **推奨修正**
```javascript
// 修正前
const reportPath = `jsdom-test-report-${Date.now()}.html`;

// 修正後
const reportPath = `tools/testing/test-reports/jsdom-test-report-${Date.now()}.html`;
```

---

## ✅ 結論

設定ファイル不変 + 適切なブランチ戦略により、複数PC + AI作業での干渉リスクは**十分に管理可能**です。

主な残課題は**テストレポートの出力先修正**のみです。