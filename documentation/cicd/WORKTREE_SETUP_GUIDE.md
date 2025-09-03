# 🌿 Git Worktree 設定ガイド - 4人チーム開発

## 📋 概要

同一端末で複数ブランチを同時に作業するためのGit Worktree設定ガイドです。4人チーム開発での効率的な作業環境を構築します。

## 🎯 Git Worktreeのメリット

### **従来の問題**
```bash
# ❌ 従来の方式（ブランチ切り替え）
git checkout feature/weight-fix    # 作業中...
git checkout feature/sleep-ui      # 前の作業が中断される
git checkout main                  # また切り替え...
```

### **Worktreeの解決策**
```bash
# ✅ Worktree方式（同時作業可能）
📁 weight-app-main/          # mainブランチ
📁 weight-app-weight-fix/    # feature/weight-fixブランチ  
📁 weight-app-sleep-ui/      # feature/sleep-uiブランチ
```

## 🛠️ セットアップ手順

### **Step 1: 基本セットアップ**

```bash
# 1. メインディレクトリに移動
cd C:\Users\user\Desktop\work\90_cc\20250806\weight-management-app

# 2. 現在の状態確認
git branch -a
git status

# 3. 作業用ディレクトリ作成
mkdir ../worktrees
cd ../worktrees
```

### **Step 2: Worktree作成**

```bash
# メインリポジトリのパス
MAIN_REPO="../weight-management-app"

# 4人の開発者用worktree作成
git worktree add -b feature/weight-optimization ../weight-app-dev1 main
git worktree add -b feature/sleep-tracking ../weight-app-dev2 main  
git worktree add -b feature/ui-improvement ../weight-app-dev3 main
git worktree add -b hotfix/critical-fix ../weight-app-hotfix main

# 共通作業用
git worktree add ../weight-app-develop develop
git worktree add ../weight-app-main main
```

### **Step 3: 作業環境確認**

```bash
# Worktree一覧表示
git worktree list

# 出力例:
# C:/Users/user/Desktop/work/90_cc/20250806/weight-management-app    abc1234 [main]
# C:/Users/user/Desktop/work/90_cc/20250806/weight-app-dev1         def5678 [feature/weight-optimization]
# C:/Users/user/Desktop/work/90_cc/20250806/weight-app-dev2         ghi9012 [feature/sleep-tracking]
# C:/Users/user/Desktop/work/90_cc/20250806/weight-app-dev3         jkl3456 [feature/ui-improvement]
```

## 👥 チーム作業分担

### **推奨ディレクトリ構成**

```
📁 90_cc/20250806/
├── 📁 weight-management-app/     # 🏠 メインリポジトリ（管理者用）
├── 📁 weight-app-main/           # 📋 リリース確認用
├── 📁 weight-app-develop/        # 🧪 統合テスト用
├── 📁 weight-app-dev1/          # 👤 開発者A: 体重最適化
├── 📁 weight-app-dev2/          # 👤 開発者B: 睡眠追跡
├── 📁 weight-app-dev3/          # 👤 開発者C: UI改善
└── 📁 weight-app-hotfix/        # 🚨 緊急修正用
```

### **開発者別の役割**

| 担当者 | ディレクトリ | ブランチ | 担当領域 |
|--------|-------------|----------|----------|
| 👤 **開発者A** | `weight-app-dev1/` | `feature/weight-optimization` | タブ1: 体重管理機能 |
| 👤 **開発者B** | `weight-app-dev2/` | `feature/sleep-tracking` | タブ2: 睡眠管理機能 | 
| 👤 **開発者C** | `weight-app-dev3/` | `feature/ui-improvement` | UI/UX、共通コンポーネント |
| 👤 **統合担当** | `weight-app-develop/` | `develop` | マージ・テスト・デプロイ |

## 🔄 日常的な作業フロー

### **開発者の作業例（開発者A）**

```bash
# 1. 自分の作業ディレクトリに移動
cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-dev1

# 2. ブランチ確認
git branch    # → feature/weight-optimization

# 3. 最新情報取得
git fetch origin
git pull origin feature/weight-optimization

# 4. 開発作業
# index.html、tabs/tab1-weight/ を編集...

# 5. テスト実行
npm test

# 6. コミット
git add .
git commit -m "feat: 体重入力UIを改善"

# 7. プッシュ
git push origin feature/weight-optimization
```

### **統合担当者の作業例**

```bash
# 1. 統合ディレクトリに移動  
cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-develop

# 2. 各開発者のブランチをマージ
git fetch origin
git merge origin/feature/weight-optimization
git merge origin/feature/sleep-tracking  
git merge origin/feature/ui-improvement

# 3. 統合テスト実行
npm run test:all

# 4. 問題なければdevelopにプッシュ
git push origin develop

# 5. リリース準備（mainブランチ用ディレクトリに移動）
cd ../weight-app-main
git merge origin/develop
git push origin main  # → 自動デプロイ実行
```

## ⚠️ 注意事項と回避方法

### **1. 混乱防止**

```bash
# ✅ 必ず現在地確認
pwd
git branch

# ✅ ディレクトリ名でブランチが分かるよう命名
weight-app-[ブランチ名]/
```

### **2. ストレージ容量管理**

```bash
# 🧹 不要なworktree削除
git worktree remove ../weight-app-dev1
git worktree prune

# 📊 容量確認  
du -sh ../weight-app-*/
```

### **3. 同期問題回避**

```bash
# 🔄 定期的な同期（全worktreeで実行）
git fetch origin

# ⚠️ stashは共有されるので注意
git stash list  # 全worktreeで共通
```

## 🚀 効率的な運用テクニック

### **VSCode対応**

```bash
# 複数ウィンドウで同時開発
code C:\Users\user\Desktop\work\90_cc\20250806\weight-app-dev1
code C:\Users\user\Desktop\work\90_cc\20250806\weight-app-dev2
code C:\Users\user\Desktop\work\90_cc\20250806\weight-app-develop
```

### **エイリアス設定**

```bash
# .bashrc または PowerShell Profile に追加
alias cdmain='cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-main'
alias cddev1='cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-dev1'
alias cddev2='cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-dev2'
alias cddevelop='cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-develop'
```

### **バッチスクリプト例**

```batch
@echo off
REM setup-worktrees.bat
echo 🌿 Git Worktree セットアップ開始...

cd /d "C:\Users\user\Desktop\work\90_cc\20250806\weight-management-app"

echo 📁 開発者A用worktree作成中...
git worktree add -b feature/weight-optimization ../weight-app-dev1 main

echo 📁 開発者B用worktree作成中...  
git worktree add -b feature/sleep-tracking ../weight-app-dev2 main

echo 📁 開発者C用worktree作成中...
git worktree add -b feature/ui-improvement ../weight-app-dev3 main

echo 📁 統合用worktree作成中...
git worktree add ../weight-app-develop develop

echo ✅ セットアップ完了！
git worktree list
pause
```

## 📊 パフォーマンス比較

| 作業方式 | セットアップ | 切り替え時間 | 同時作業 | ディスク使用量 |
|----------|-------------|-------------|----------|---------------|
| **従来ブランチ** | 1分 | 10-30秒 | ❌ | 1x |
| **Worktree** | 5分 | 0秒 | ✅ | 3-4x |

## 🔧 トラブルシューティング

### **よくある問題**

1. **"already exists" エラー**
   ```bash
   git worktree remove ../weight-app-dev1
   git worktree add -b feature/new-name ../weight-app-dev1 main
   ```

2. **ブランチが見つからない**
   ```bash
   git fetch origin
   git branch -a  # リモートブランチ確認
   ```

3. **容量不足**
   ```bash
   # 不要なworktree削除
   git worktree list
   git worktree remove [不要なパス]
   git worktree prune
   ```

## 📈 今後の拡張

### **自動化スクリプト**
- Worktree一括作成スクリプト
- 同期確認スクリプト  
- クリーンアップスクリプト

### **チーム管理**
- 作業状況共有ダッシュボード
- ブランチ命名規則自動チェック
- マージ競合検出システム

---

**🎯 Worktreeを活用して、4人チームでの効率的な並行開発を実現しましょう！**