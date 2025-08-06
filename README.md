# GitHubプロジェクト管理テンプレート with UI Testing

このテンプレートは、毎日10〜20のプロジェクトを複数デバイスで作成・管理するためのガイドラインです。時系列での検索性、デバイス間の同期、整理されたリポジトリ管理を目指します。

**🧪 NEW: Universal Template v0.01 - よっぽどの馬鹿でも使える**
- Firebase Database + Google認証 完全自動設定
- 全自動コピーボタンシステム搭載
- 新人問題完全防止機能付き
- カップラーメン方式: npm start だけで完成

**🚨 重要: 必須要件について**
開発前に必ず `MANDATORY_REQUIREMENTS.md` を読んでください。

## 1. GitHub Organizationの設定

全プロジェクトを1つのOrganizationで管理。個人アカウントの散らかりを防ぎ、デバイス間でのアクセスを統一。

- **Organization名**: `daily-projects`（例）
- **作成手順**:
  1. GitHubにログイン
  2. 右上プロフィール → "Your organizations" → "New organization"
  3. 名前を入力（例: daily-projects）、プランは無料でOK
  4. 各デバイスから同一アカウントでアクセス

**利点**: リポジトリをグループ化、検索やTopicsで管理しやすく、コラボレーション準備も簡単。

## 2. リポジトリ命名規則

リポジトリ名に日付を含め、時系列検索を容易に。

**命名フォーマット**: `YYYY-MM-DD-プロジェクト名`

**例**:
- `2025-08-04-sample-project`
- `2025-08-04-data-scraper`
- `2025-08-05-api-tool`

**ルール**:
- 小文字、ハイフン（-）で単語を区切る
- 重複回避のため、必要なら末尾にユニークID（例: `2025-08-04-sample-1234`）

**検索例**:
- GitHub検索バーで `created:2025-08-04 org:daily-projects` → 8月4日のリポジトリ一覧
- Topicsで `2025-08` を検索 → 8月のリポジトリを抽出

## 3. リポジトリの初期構造

各リポジトリは以下の標準構造で作成。デバイス間で一貫性を保ち、運用を効率化。

```
プロジェクト名/
├── src/                  # ソースコード（例: Python, JSなど）
├── tools/                # 🧪 テストツール（統合済み）
│   └── testing/
│       ├── ui-test-runner.js     # UIテストメインツール
│       ├── browser-api-enhancements.js  # ブラウザAPI拡張
│       ├── configs/              # テスト設定ファイル
│       └── docs/                 # テストツールドキュメント
├── examples/             # サンプルファイル
│   └── simple-button-app.html    # テスト用サンプルHTML
├── scripts/              # 実行スクリプト
│   ├── setup.sh          # 環境セットアップ
│   └── test.sh           # テスト実行
├── tests/               # 追加テストコード（任意）
├── README.md            # プロジェクト概要
├── LICENSE              # ライセンス（例: MIT）
├── package.json         # Node.js依存関係（テストツール用）
├── .gitignore           # Gitで無視するファイル
└── requirements.txt     # Python依存関係
```

### README.mdテンプレート:

```markdown
# プロジェクト名 (例: 2025-08-04-sample-project)

## 概要
- **作成日**: 2025-08-04
- **目的**: [プロジェクトの簡単な説明]
- **使用技術**: [例: Python, Flask]

## セットアップ
1. リポジトリをクローン: `git clone https://github.com/daily-projects/2025-08-04-sample-project.git`
2. 環境セットアップ: `npm run setup`（Node.js + Python）
3. 依存関係をインストール: `pip install -r requirements.txt`
4. 実行: [例: `python src/main.py`]

## 🧪 UIテスト実行
- 基本テスト: `npm run test:ui`
- ボタン自動検出: `npm run test:ui-auto`
- Bootstrap対応: `npm run test:bootstrap`
- ヘルプ表示: `npm run help`

## メモ
- [作成した背景や特記事項]
```

### .gitignoreテンプレート:

```
# 基本
*.pyc
__pycache__/
*.log
.DS_Store
node_modules/
venv/
```

## 4. デバイス間での運用フロー

複数デバイスで一貫した管理を行うための手順。

### プロジェクト開始:

1. **ローカルリポジトリ作成**: `git init 2025-08-04-sample-project`
2. **GitHub CLIでリモートリポジトリ作成**:
   ```bash
   gh repo create daily-projects/2025-08-04-sample-project --public --source=. --remote=origin
   ```
3. **初期ファイルをコミット**:
   ```bash
   git add .
   git commit -m "Initial commit for 2025-08-04-sample-project"
   git push -u origin main
   ```
4. **Topicsを追加**（GitHub UI or CLI）:
   ```bash
   gh repo edit daily-projects/2025-08-04-sample-project --add-topic 2025-08
   ```

### 他のデバイスでの作業:

1. **クローン**: `git clone https://github.com/daily-projects/2025-08-04-sample-project.git`
2. **ブランチ作成**（衝突防止）: `git checkout -b feature-branch`
3. **変更をプッシュ**: `git push origin feature-branch`
4. **プルリクエストでマージ**（GitHub UI or `gh pr create`）

### 毎日運用:

- 各デバイスでその日のリポジトリを作成
- 作業終了時に必ずpush
- 衝突が心配なら、ブランチを分ける

## 5. 検索と整理のルール

リポジトリが増えても探しやすくするための設定。

### Topicsの活用:

**必須タグ**:
- 時期タグ: `2025-08`, `2025-09`など（月単位で分類）
- プロジェクト種別タグ: `python`, `prototype`, `script`

**追加方法**: GitHub UIの「Add topics」または `gh repo edit --add-topic タグ名`

### 検索例:

- 8月4日のリポジトリ: `created:2025-08-04 org:daily-projects`
- Pythonプロジェクト: `from:daily-projects python`

### アーカイブ:

- 古いプロジェクト（例: 3ヶ月以上前）はGitHub UIでアーカイブ
- アーカイブ方法: リポジトリの「Settings」→「Archive repository」
- アーカイブ済みは検索可能だが、リストから非表示でスッキリ

## 6. 自動化（オプション）

GitHub CLIやスクリプトでリポジトリ作成を効率化。

### GitHub CLIインストール:

```bash
# macOS
brew install gh
# Windows (PowerShell)
winget install --id GitHub.cli
# Linux
sudo apt install gh
```

ログイン: `gh auth login`

### 一括リポジトリ作成スクリプト（例: Bash）

```bash
# 今日の日付でリポジトリを作成
DATE=$(date +%Y-%m-%d)
PROJECT="sample-project"
gh repo create daily-projects/${DATE}-${PROJECT} --public --source=. --remote=origin
gh repo edit daily-projects/${DATE}-${PROJECT} --add-topic ${DATE:0:7}
```

## 7. work配下の構造

ローカル開発環境での管理構造：

```
work/
├── 0000-00-00-project-template/  # このテンプレート
├── 2025-08-04-project1/
├── 2025-08-04-project2/
└── [既存プロジェクト]
```

## 8. 注意点

- **命名の一貫性**: 命名ルールを徹底
- **バックアップ**: 毎日pushを習慣化
- **リポジトリ数**: 1000超えてもGitHubは動作するが、Topicsや検索を活用して整理
- **モノレポの検討**: プロジェクトが小さく（数ファイル）、コード共有が多い場合のみモノレポを検討

## 9. 開始手順

1. GitとGitHub CLIをインストール
2. Organizationを作成
3. 命名規則に従い、リポジトリ作成
4. READMEと初期ファイルを追加、Topicsを設定
5. 毎日作業後、pushして同期

このテンプレートを参照し、プロジェクト開始時に従ってください。検索性と整理性を保ちながら、複数デバイスでの運用がスムーズになります！