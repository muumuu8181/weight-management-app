# 📊 体重管理アプリ

## 🚨 **絶対禁止事項** 🚨

**🚫 全削除機能は全タブで永続的に禁止**
- **🗑️ 全削除ボタンの実装は絶対に禁止**（全タブ共通）
- **clearAllMemos() 関数およびその類似機能の UI ボタン化は厳禁**
- **データ全削除機能は重大なデータ損失リスクを引き起こす**
- **体重管理、睡眠、部屋片付け、メモリスト等、全てのタブで適用**
- **この制限に例外はなく、全開発者が厳守すること**
- **違反した場合は即座に削除し、セキュリティログに記録**

**🛠️ 開発ツール作成時の絶対ルール**
- **📋 ツール作成前に既存ツールを必ず確認** - `development/tools/`配下の全ツール調査必須
- **❌ 重複機能ツールの新規作成禁止** - 類似機能は既存ツールの拡張で対応
- **📊 重複分析レポート参照必須** - `handover/TOOL_DUPLICATION_ANALYSIS_REPORT_20250904.md`で28個→16個の統合案確認
- **⚠️ 現在28個のツールが存在、42%が重複機能** - 新規作成は本当に必要な場合のみ
- **🔍 機能確認コマンド**: `find development/tools -name "*.js" | head -10` で既存ツール一覧表示

## 🚀 クイックスタート

新規開発者の方は **`docs/`フォルダ** を番号順に読んでください：

1. 📄 **[01_QUICK_START.md](docs/01_QUICK_START.md)** - 5秒で理解する必須ルール
2. 📄 **[02_DEVELOPER_WORKFLOW.md](docs/02_DEVELOPER_WORKFLOW.md)** - 開発ワークフロー
3. 📄 **[03_MANDATORY_REQUIREMENTS.md](docs/03_MANDATORY_REQUIREMENTS.md)** - 絶対遵守事項
4. 📄 **[04_PROJECT_OVERVIEW.md](docs/04_PROJECT_OVERVIEW.md)** - プロジェクト全体像

## 📋 開発引継ぎ文書

**📂 開発経緯の記録場所**: **`handover/`フォルダ**  
最新の機能開発内容、コードメトリクス、技術的な変更履歴は **`handover/`フォルダ** で管理しています。

最新の機能開発内容は **`issues/`フォルダ** と **`handover/`フォルダ** の引継ぎ文書を参照：

### **🎉 v2.00 メジャーリリース - JavaScript完全分離達成**
- 📄 **[handover/TAB_BUNRI_SAKUGYO_LESSONS_LEARNED_v2.00.md](handover/TAB_BUNRI_SAKUGYO_LESSONS_LEARNED_v2.00.md)** - **タブ分離作業の完全記録**
- 🏆 **劇的成果**: index.html 4,127行 → 1,971行 (52%削減)
- 🧪 **汎用ツール**: 全タブ対応のテストツール群整備
- 🔧 **分離完了**: 体重・睡眠・部屋片付け・メモリストの完全外部化

### **🎯 v2.32 メモリスト機能共通化達成**
- 📄 **[handover/CODE_METRICS_PRE_CLEANUP_20250902.md](handover/CODE_METRICS_PRE_CLEANUP_20250902.md)** - **共通化前のコードメトリクス記録**
- 🏆 **効率化成果**: 16行追加でメモリスト機能をJOB_DCに統合
- 🧩 **共通コンポーネント**: 631行で複数タブに同機能提供
- 📈 **コード効率**: 約50%の削減効果達成

### **📋 過去の開発記録**
- 📄 **[issues/TASK_INTEGRATION_HANDOVER_20250830.md](issues/TASK_INTEGRATION_HANDOVER_20250830.md)** - タスク統合機能開発の完全引継ぎ
- 🔧 **技術仕様**: v1.10〜v1.21の全変更履歴と実装詳細
- ⚠️ **重要制約**: セキュリティ制限と4階層制限の詳細
- 🚀 **拡張可能性**: 今後の改善案とトラブルシューティング

## 📁 プロジェクト構造

```
weight-management-app/
├── README.md                    # このファイル（エントリーポイント）
├── index.html                   # アプリケーション本体
├── package.json                 # npm設定
│
├── 📁 answers/                  # 📝 検証・解答集
├── 📁 archive/                  # 📚 古いバージョン（参考のみ）
├── 📁 config/                   # ⚙️ 設定ファイル
├── 📁 core/                     # ⚠️ 変更禁止（Firebase設定等）
├── 📁 custom/                   # ✅ カスタマイズ可能領域
├── 📁 docs/                     # 📚 教科書・マニュアル系（固定的な学習用文書）
│   ├── 01_QUICK_START.md       # 最初に読む！
│   ├── 02_DEVELOPER_WORKFLOW.md
│   ├── 03_MANDATORY_REQUIREMENTS.md
│   ├── 04_PROJECT_OVERVIEW.md
│   ├── 05_AI_CHECKLIST.md
│   ├── 06_GITHUB_PAGES_MANUAL.md
│   └── troubleshooting/        # トラブルシューティング
├── 📁 examples/                 # 🔬 サンプルコード・データ
│   └── data/                   # サンプルデータ
├── 📁 handover/                 # 📊 開発記録・技術的変更履歴（流動的）
├── 📁 issues/                   # 🔴 未解決問題・現在進行中の課題
├── 📁 jsdom-storage/            # 🧪 テスト用ストレージ
├── 📁 node_modules/             # 📦 npm依存関係
├── 📁 scripts/                  # 📜 スクリプトファイル
├── 📁 shared/                   # 🔗 共通機能・ライブラリ
├── 📁 tabs/                     # 📱 タブ固有機能
└── 📁 tools/                    # 🛠️ 開発ツール

```

## 📂 フォルダの使い分けガイド

### 📚 docs/ - 教科書・マニュアル系
**用途**: 固定的な学習用文書
- ✅ **適用例**: 開発ワークフロー、必須要件、プロジェクト概要
- ✅ **特徴**: 01_-07_番号付き体系、変更頻度が低い
- ❌ **不適切**: 調査結果、開発記録、日付付き分析文書

### 📊 handover/ - 開発記録・技術的変更履歴  
**用途**: 流動的な開発経緯・分析結果
- ✅ **適用例**: コードメトリクス、機能開発記録、調査分析結果
- ✅ **特徴**: 日付付きファイル、技術的変更の詳細記録
- ❌ **不適切**: 基本的なマニュアル、固定的な手順書

### 🔴 issues/ - 未解決問題・現在進行中の課題
**用途**: 現在対処中の問題
- ✅ **適用例**: バグ報告、未解決の技術課題、対処待ち事項
- ✅ **特徴**: 解決待ちのもの、進行中の問題
- ❌ **不適切**: 完了済みの調査結果、過去の記録

**判断基準**: 
- 教科書的 → docs/
- 開発記録・完了済み調査 → handover/  
- 未解決・進行中 → issues/

## 🌐 デプロイ先

**GitHub Pages**: https://muumuu8181.github.io/weight-management-app/

## ⚠️ 重要な注意事項

### Safari（iPhone）でのログイン問題
- iOS Safariではポップアップブロッカーが厳格なため、ログインできない場合があります
- **解決策**: Chrome for iOSを使用するか、v0.80のリダイレクト方式を有効化
- 詳細: [docs/troubleshooting/mobile-login-safari-issue.md](docs/troubleshooting/mobile-login-safari-issue.md)

### 開発時の必須ルール
1. **core/フォルダは絶対に変更しない**
2. **バージョン番号は0.01刻みで更新**
3. **変更後は必ずgit push**
4. **タブ管理ルール** - 詳細は [TAB_MANAGEMENT_RULES.md](docs/TAB_MANAGEMENT_RULES.md)
   - 一つのタブにつき一つのフォルダ（HTML/CSS/JS 3ファイル構成）
   - 共通HTMLに直接記述禁止
   - `tabs/tab{番号}-{機能名}/` 形式でフォルダ命名

## 🔧 ローカル開発

```bash
# HTTPサーバー起動
python -m http.server 8000
# または
npx http-server -p 8000

# ブラウザで開く
http://localhost:8000
```

## 🧪 JSDoMテストツール群

### 📋 **利用可能なテストツール**

#### 1. **UI Test Runner** (汎用性: ★★★★★)
```bash
# ボタンテスト自動化
npm run test:ui
node tools/testing/ui-test-runner.js --target your-page.html --auto-detect
```

#### 2. **Browser API Enhancements** (汎用性: ★★★★★)
```javascript
// JSDoM環境でのブラウザAPI拡張
const BrowserAPIEnhancements = require('./tools/testing/browser-api-enhancements.js');
```

#### 3. **Weight Management Tests** (汎用性: ★★★☆☆)
```bash
# 体重管理機能単体テスト
npm run test:weight
```

#### 4. **Display State Checker** (汎用性: ★★★★☆)
```bash
# 要素表示状態診断
node jsdom_display_checker.js
```

#### 5. **🔍 包括的品質チェックツール** (汎用性: ★★★★★) **【NEW!】**
```bash
# 構文エラー・関数依存性・データフロー・ブラウザ互換性の統合チェック
npm run test:quality
```

**検出項目:**
- ✅ **構文エラー**: テンプレートリテラル、async/await問題
- ✅ **関数依存性**: 未定義関数の呼び出し検出
- ✅ **スクリプト読み込み順序**: 依存関係の確認
- ✅ **データフロー**: 認証後のデータ読み込み漏れ
- 📝 **詳細レポート**: `quality-report.json` 自動生成

📖 **詳細マニュアル**: [docs/QUALITY_CHECK_MANUAL.md](docs/QUALITY_CHECK_MANUAL.md)

### 🎯 **テスト実行方法**

```bash
# 全テスト実行
npm test

# 個別テスト
npm run test:ui          # UIボタンテスト
npm run test:weight      # 体重管理テスト  
npm run test:storage     # データストレージテスト
npm run test:firebase    # Firebase接続テスト
npm run test:quality     # 🔍 包括的品質チェック（推奨）
```

## 📝 ライセンス

- **ライセンス**: MIT

---

詳細なドキュメントは `docs/` フォルダ内を参照してください。