# Pull Request作成ガイド - 他の端末から開発する方法

## 概要
このドキュメントでは、他の端末（サブPC、別の開発環境）から本プロジェクトに貢献する方法を説明します。

## 1. 初回セットアップ

### 1.1 リポジトリのクローン
```bash
# リポジトリをクローン
git clone https://github.com/muumuu8181/weight-management-app.git
cd weight-management-app

# 最新のmainブランチを確認
git pull origin main
```

### 1.2 開発環境の確認
```bash
# Pythonがインストールされているか確認（HTTPサーバー用）
python --version

# GitHub CLIをインストール（推奨）
# Windows: winget install --id GitHub.cli
# Mac: brew install gh
# 初回ログイン: gh auth login
```

## 2. 開発フロー

### 2.1 作業用ブランチの作成

ブランチ名は以下の命名規則に従ってください：

- `feature/機能名` - 新機能の追加
- `fix/バグ名` - バグ修正
- `chore/作業内容` - リファクタリング、ドキュメント更新など
- `hotfix/緊急修正` - 緊急のバグ修正

```bash
# 例: 新機能の追加
git checkout -b feature/add-export-function

# 例: バグ修正
git checkout -b fix/chart-display-error

# 例: ドキュメント更新
git checkout -b chore/update-documentation
```

### 2.2 Git Worktreeを使った開発（推奨）

複数の機能を並行開発する場合はworktreeが便利です：

```bash
# 新しい作業ディレクトリを作成
git worktree add ../weight-app-feature-export -b feature/export-function
cd ../weight-app-feature-export

# 開発作業を実施
```

詳細は[08_GIT_WORKTREE_GUIDE.md](./08_GIT_WORKTREE_GUIDE.md)を参照してください。

### 2.3 開発とテスト

```bash
# ローカルサーバーを起動してテスト
start-server.bat  # Windows
# または
python -m http.server 3000  # Mac/Linux

# ブラウザで http://localhost:3000 を開いて動作確認
```

### 2.4 変更のコミット

コミットメッセージは以下の形式に従ってください：

```bash
# 機能追加
git add .
git commit -m "feat: エクスポート機能を追加

- CSV形式でのデータエクスポート実装
- 期間指定でのフィルタリング機能
- ダウンロードボタンをUIに追加"

# バグ修正
git commit -m "fix: グラフ表示のエラーを修正

期間を切り替えた際にグラフが更新されない問題を解決"

# その他の変更
git commit -m "chore: 開発ドキュメントを更新"
```

## 3. Pull Requestの作成

### 3.1 リモートリポジトリへのプッシュ

```bash
# 初回プッシュ（アップストリームを設定）
git push -u origin feature/your-feature-name

# 2回目以降
git push
```

### 3.2 GitHub CLIを使ったPR作成（推奨）

```bash
gh pr create --title "feat: エクスポート機能の実装" --body "## 概要
データをCSV形式でエクスポートする機能を実装しました。

## 変更内容
- エクスポートボタンをUIに追加
- 期間選択機能を実装
- CSV生成ロジックを実装

## テスト内容
- [ ] 1日分のデータエクスポート
- [ ] 1ヶ月分のデータエクスポート
- [ ] データがない期間の処理

## スクリーンショット
（必要に応じて追加）"
```

### 3.3 ブラウザでのPR作成

プッシュ後に表示されるURLをクリックするか、以下にアクセス：
https://github.com/muumuu8181/weight-management-app/pulls

## 4. コンフリクトの解決

他の開発者の変更とコンフリクトが発生した場合：

```bash
# 最新のmainを取得
git fetch origin main

# mainの変更をマージ
git merge origin/main

# コンフリクトを解決
# エディタでコンフリクトマーカーを探して手動で解決
# <<<<<<< HEAD
# あなたの変更
# =======
# mainの変更
# >>>>>>> origin/main

# 解決後
git add .
git commit -m "fix: mainとのコンフリクトを解決"
git push
```

## 5. レビューとマージ

1. PRが作成されたら、レビュー担当者の確認を待つ
2. 修正が必要な場合は、同じブランチで修正してプッシュ
3. 承認されたらマージ
4. マージ後、ローカルブランチを削除

```bash
# ローカルブランチの削除
git checkout main
git branch -d feature/your-feature-name
```

## 6. よくある質問

### Q: 複数の端末で同じブランチで作業したい
A: 以下の手順で同期できます：
```bash
# 端末A（作業済み）
git push

# 端末B
git pull origin feature/your-feature-name
```

### Q: mainが更新されたので最新化したい
A: 定期的に最新のmainを取り込むことを推奨：
```bash
git fetch origin main
git merge origin/main
```

### Q: PRのタイトルやコメントを後から変更したい
A: GitHub CLIで編集可能：
```bash
gh pr edit
```

## 関連ドキュメント

- [02_DEVELOPER_WORKFLOW.md](./02_DEVELOPER_WORKFLOW.md) - 基本的な開発フロー
- [08_GIT_WORKTREE_GUIDE.md](./08_GIT_WORKTREE_GUIDE.md) - Git Worktreeの詳細
- [06_GITHUB_PAGES_MANUAL.md](./06_GITHUB_PAGES_MANUAL.md) - デプロイ手順

## 更新履歴

- 2024-01-08: 初版作成