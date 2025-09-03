# 🚀 CI/CD 設定ガイド - 体重管理アプリ

## 📋 概要

4人チーム開発体制での品質保証とデプロイ自動化を実現するCI/CDパイプライン設定ガイドです。

## 🏗️ アーキテクチャ

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  開発者A-D  │───►│ GitHub Repo │───►│GitHub Actions│
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   │                   │
       │            ┌─────────────┐    ┌─────────────┐
       └────────────│ Pull Request│    │GitHub Pages │
                    └─────────────┘    └─────────────┘
```

## 🔧 設定済みファイル

### 1. **CI/CDパイプライン**
- **ファイル**: `.github/workflows/ci.yml`
- **機能**:
  - 🧪 全テストスイート自動実行
  - 🔍 コード品質チェック
  - 📊 PR分析レポート
  - 🚀 GitHub Pages自動デプロイ（mainブランチ）
  - 🔄 週次クリーンアップ

### 2. **デプロイワークフロー**  
- **ファイル**: `.github/workflows/deploy.yml`
- **機能**:
  - 🧹 デプロイ前クリーンアップ
  - ⚡ 本番環境最適化
  - 📊 デプロイ情報生成

### 3. **除外設定**
- **ファイル**: `.gitignore` 
- **除外対象**:
  - テストエビデンスファイル (`*test-evidence*.json`)
  - バックアップファイル (`*.backup*`) 
  - 監査レポート (`audit-report-*.json`)

## 📋 GitHub リポジトリ設定手順

### Step 1: GitHub Pages有効化

1. **リポジトリ設定**へ移動
2. **Pages** セクションを選択
3. **Source**: `GitHub Actions` を選択
4. **保存**をクリック

### Step 2: ブランチ保護ルール設定

```bash
# 設定対象ブランチ: main, develop
Settings → Branches → Add rule

✅ Require a pull request before merging
  ✅ Require approvals (1人)
  ✅ Dismiss stale PR approvals when new commits are pushed
  ✅ Require review from code owners

✅ Require status checks to pass before merging  
  ✅ Require branches to be up to date before merging
  ✅ Status checks: 
    - test (CI/CD Pipeline)
    - quality (CI/CD Pipeline) 

✅ Require linear history
✅ Include administrators
```

### Step 3: 必要なSecrets設定

```bash
# 現在は不要（将来的な拡張用）
Settings → Secrets and variables → Actions

# 将来設定予定:
SLACK_WEBHOOK_URL     # Slack通知用
FIREBASE_TOKEN        # Firebase CLI用
```

## 🔄 開発ワークフロー

### **ブランチ戦略**

```bash
main                    # 🚀 本番用（自動デプロイ）
├── develop            # 🧪 統合テスト用  
├── feature/weight-fix # 👤 開発者A
├── feature/sleep-ui   # 👤 開発者B
├── feature/chart-opt  # 👤 開発者C
└── hotfix/login-bug   # 🚨 緊急修正
```

### **作業手順**

1. **機能ブランチ作成**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/新機能名
   ```

2. **開発・テスト**
   ```bash
   # ローカルテスト実行
   npm test
   
   # コミット
   git add .
   git commit -m "feat: 新機能追加"
   git push origin feature/新機能名
   ```

3. **プルリクエスト作成**
   - `feature/新機能名` → `develop`
   - 自動テスト実行 + PR分析レポート生成
   - レビュー承認後マージ

4. **リリース**（デプロイ担当者のみ）
   ```bash
   # develop → main マージでGitHub Pages自動デプロイ
   ```

## 🧪 テスト実行内容

### **CI環境での自動テスト**

| テスト種別 | 実行コマンド | 内容 |
|---|---|---|
| 🔥 Firebase | `npm run test:firebase` | Firebase接続テスト |
| 🎯 UI | `npm run test:ui` | ボタン・フォーム動作テスト |
| 💾 Storage | `npm run test:storage` | データストレージテスト |
| ⚖️ Weight | `npm run test:weight` | 体重管理機能テスト |
| 🔍 Validation | `npm run test:field-validation` | 入力検証テスト |
| 🔗 Integration | `npm run test:integration` | HTML-JS統合テスト |

### **テスト環境**

- **OS**: Ubuntu Latest
- **Node.js**: v18
- **ブラウザ**: Chrome, Firefox（Matrix実行）
- **実行環境**: ヘッドレスモード

## 📊 品質ゲート

### **マージ条件**

- ✅ **全テスト通過必須**
- ✅ **1名以上のレビュー承認**
- ✅ **ブランチが最新状態**
- ✅ **コンフリクト解消済み**

### **デプロイ条件**

- ✅ **mainブランチへのプッシュ**
- ✅ **CI/CDパイプライン成功**
- ✅ **プロジェクトサイズ < 100MB**

## 🚨 トラブルシューティング

### **よくある問題**

1. **テスト失敗**
   ```bash
   # ローカルで再現確認
   npm test
   
   # ログ確認
   cat npm-debug.log
   ```

2. **デプロイ失敗** 
   ```bash
   # GitHub Actionsログ確認
   Actions タブ → 失敗したワークフロー → ログ表示
   ```

3. **容量オーバー**
   ```bash
   # 大きなファイル確認  
   find . -size +1M -not -path "./node_modules/*" -ls
   
   # クリーンアップ
   npm run cleanup
   ```

### **緊急時対応**

```bash
# 🚨 緊急修正（hotfix）
git checkout main
git checkout -b hotfix/緊急修正名
# 修正作業
git push origin hotfix/緊急修正名
# hotfix → main 直接PR
```

## 📈 モニタリング

### **デプロイ状況確認**

- **URL**: https://muumuu8181.github.io/weight-management-app/
- **ステータス**: GitHub Actions タブで確認
- **デプロイ履歴**: Environments → github-pages

### **パフォーマンス監視**

- **テスト実行時間**: 目標5分以内
- **デプロイ時間**: 目標3分以内  
- **プロジェクトサイズ**: 目標50MB以下

## 🎯 今後の改善計画

### **フェーズ2: 高度な品質管理**
- ESLint/Prettier設定
- コードカバレッジ測定
- パフォーマンステスト自動化

### **フェーズ3: 通知システム**
- Slack通知統合
- メール通知設定
- ダッシュボード構築

---

## 📞 サポート

設定に問題がある場合は、GitHubのIssueまたはプロジェクト内の`issues/`フォルダで報告してください。