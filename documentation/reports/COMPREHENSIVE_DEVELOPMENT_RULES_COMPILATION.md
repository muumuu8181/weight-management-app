# 📋 体重管理アプリ - 開発ルール・ガイドライン完全集

**作成日**: 2025-09-06  
**対象プロジェクト**: weight-management-app  
**目的**: プロジェクト内の全ての開発ポリシー、ルール、ガイドライン、重要注意事項を網羅的に抽出・整理

---

## 🚨 **絶対禁止事項** (README.md より)

### 1. 全削除機能は全タブで永続的に禁止
- **場所**: README.md (行3-12)
- **詳細**:
  - 🗑️ 全削除ボタンの実装は絶対に禁止（全タブ共通）
  - clearAllMemos() 関数およびその類似機能の UI ボタン化は厳禁
  - データ全削除機能は重大なデータ損失リスクを引き起こす
  - 体重管理、睡眠、部屋片付け、メモリスト等、全てのタブで適用
  - この制限に例外はなく、全開発者が厳守すること
  - 違反した場合は即座に削除し、セキュリティログに記録

### 2. 開発ツール作成時の絶対ルール
- **場所**: README.md (行13-19)
- **詳細**:
  - 📋 ツール作成前に既存ツールを必ず確認 - `development/tools/`配下の全ツール調査必須
  - ❌ 重複機能ツールの新規作成禁止 - 類似機能は既存ツールの拡張で対応
  - 📊 重複分析レポート参照必須 - `handover/TOOL_DUPLICATION_ANALYSIS_REPORT_20250904.md`で28個→16個の統合案確認
  - ⚠️ 現在28個のツールが存在、42%が重複機能 - 新規作成は本当に必要な場合のみ
  - 🔍 機能確認コマンド: `find development/tools -name "*.js" | head -10` で既存ツール一覧表示

---

## 🔥 **必須要件** (03_MANDATORY_REQUIREMENTS.md より)

### 必須要件 1: Firebase Database 必須使用
- **場所**: 03_MANDATORY_REQUIREMENTS.md (行11-31)
- **必須事項**:
  - Firebase Realtime Database または Firestore を**必ず**使用すること
  - すべてのデータ保存・読み込みはFirebase経由で行うこと
  - データベース接続は自動設定されており、変更禁止
- **禁止事項**:
  - LocalStorage への変更は**絶対禁止**
  - 「技術的に困難」を理由とした回避は**不可**
  - 「デモモード」への変更は**仕様違反**
  - その他の代替手段への変更は**すべて禁止**

### 必須要件 2: Google認証 必須実装
- **場所**: 03_MANDATORY_REQUIREMENTS.md (行34-55)
- **必須事項**:
  - Firebase Authentication + Google OAuth を**必ず**実装すること
  - ユーザーログイン機能は Google認証 のみ使用
  - 匿名認証も可（Firebase Authentication経由のみ）
- **禁止事項**:
  - 独自認証システムの実装は**禁止**
  - 認証なしモードへの変更は**禁止**
  - 「認証が難しい」を理由とした省略は**不可**

### 必須要件 3: テストツール動作確認必須
- **場所**: 03_MANDATORY_REQUIREMENTS.md (行58-79)
- **必須事項**:
  - 報告前に**必ず**テストツールで動作確認を実施すること
  - Firebase接続テストを**必ず**実行すること
  - Google認証ログインテストを**必ず**実施すること
  - すべてのテスト結果をログで確認すること
- **禁止事項**:
  - テスト未実施での報告は**絶対禁止**
  - 「動作しているはず」での報告は**不可**
  - テスト失敗を隠しての報告は**仕様違反**

### 必須要件 4: ログ機能・コピー機能絶対保持
- **場所**: 03_MANDATORY_REQUIREMENTS.md (行82-103)
- **必須事項**:
  - ログ出力機能を**絶対に除去してはいけません**
  - コピーボタン機能を**絶対に除去してはいけません**
  - ログはすべてコピー可能な状態を維持すること
  - 実行ログ・エラーログ・デバッグログすべてにコピーボタン必須
- **禁止事項**:
  - 「不要だから」によるログ機能除去は**禁止**
  - 「見た目が悪い」によるコピーボタン除去は**禁止**
  - ログ機能の簡略化・省略は**すべて禁止**

### 必須要件 5: Core部分変更絶対禁止
- **場所**: 03_MANDATORY_REQUIREMENTS.md (行106-126)
- **必須事項**:
  - `universal-system/core/` 内のファイルは**絶対に変更禁止**
  - `src/firebase-config.js` の設定変更は**禁止**
  - `src/copy-system.js` の機能変更は**禁止**
  - Core機能の「改善」「最適化」は**すべて禁止**
- **禁止事項**:
  - 「バグ修正」を理由とした Core変更は**禁止**
  - 「性能向上」を理由とした Core変更は**禁止**
  - 「使いやすさ向上」を理由とした Core変更は**禁止**

---

## 📋 **開発ワークフロー** (01_QUICK_START.md, 02_DEVELOPER_WORKFLOW.md より)

### 修正作業の絶対ルール
- **場所**: 01_QUICK_START.md (行3-24)
- **手順**:
  1. 最新を取得: `git pull`
  2. 修正実装（⚠️ core/フォルダは絶対触らない）
  3. バージョン更新（必須！）: index.html の APP_VERSION を +0.01
  4. コミット＆プッシュ（必須！）: `git add . && git commit -m "fix: 修正内容 (vX.XX)" && git push origin main`
  5. 2分待って確認: https://muumuu8181.github.io/weight-management-app/

### 避けるべき事項
- **場所**: 01_QUICK_START.md (行25-28)
- core/フォルダを変更 → プロジェクト差し戻し
- バージョン更新忘れ → 動作しない
- git push忘れ → 反映されない

### 機能追加時の必須手順
- **場所**: 02_DEVELOPER_WORKFLOW.md (行5-20)
- 機能テスト完了
- バージョンアップ（0.01刻み）
- GitHub Pages自動デプロイ
- 動作確認
- **重要**: 機能実装完了 ≠ 作業完了（必ずバージョンアップとデプロイまで実施）

---

## ⚠️ **開発時の必須ルール** (README.md より)

### 1. core/フォルダは絶対に変更しない
- **場所**: README.md (行134)

### 2. バージョン番号は0.01刻みで更新
- **場所**: README.md (行135)

### 3. 変更後は必ずgit push
- **場所**: README.md (行136)

### 4. タブ管理ルール
- **場所**: README.md (行137-140)
- 一つのタブにつき一つのフォルダ（HTML/CSS/JS 3ファイル構成）
- 共通HTMLに直接記述禁止
- `tabs/tab{番号}-{機能名}/` 形式でフォルダ命名

### 5. 問題解決後は documentation/issues/resolved/ に移動
- **場所**: README.md (行141-143)
- 修正完了した問題文書は documentation/issues/resolved/ に移動
- 移動時にバージョン番号を記録

### 6. ゴミコード・ファイル・フォルダの絶対禁止ルール
- **場所**: README.md (行144-153)
- **ゴミファイル、ゴミコード、ゴミフォルダを一切残すな！**
- 禁止例:
  - `calculateWeight()` → `calculateWeightFixed()` を追加して古いのを残す
  - ~~`xxx2.js`のような不明瞭なファイルを放置~~ **【解決済み】**
  - 使われていない古いフォルダを残す
- 正解: 既存コードを直接修正し、不要なものは即削除
- ゴミを見つけたら積極的にユーザーに報告すること
- 作業に余裕がある時は、都度フォルダ状況を確認し、ゴミが残っていないか見回る習慣をつけること
- 不要なコードは必ず削除し、プロジェクトを清潔に保ってください。

### 7. 新規作成前の必須確認ルール
- **場所**: README.md (行154-158)
- 何かを新しく作る前に、必ず既存・類似の確認を行うこと
- 詳細手順: 09_NEW_CREATION_CHECKLIST.md
- 3ステップ確認: ①既存を探せ ②類似を確認せよ ③判断せよ
- 確認なしでの新規作成は禁止。重複を作るな。

### 8. 機能追加時のサブエージェントコードレビュー必須
- **場所**: README.md (行159-163)
- 新機能実装・修正完了後は必ずサブエージェントによるコードレビューを実施
- レビュー観点: コード品質、セキュリティ、パフォーマンス、既存機能への影響
- レビュー結果を`documentation/handover/`に記録（日付付きファイル）
- 重大な問題発見時は修正完了まで次工程進行禁止

### 9. コーディング作業完了時の必須報告事項
- **場所**: README.md (行164-169)
- **サブエージェント活用状況**: 調査・レビューを実施したか報告必須
- **新規作成物**: 変数・関数・ファイル・フォルダの新規作成有無を明記
- **修正箇所数**: 各ファイルにおける変更箇所数を具体的に報告
- **🔗 共通機能修正時の強調表示**: shared/配下の共通ファイル・共通機能修正時は **【共通機能修正】** と強調表記必須
- 報告例: 「3ファイル修正（tab1: 2箇所、**【共通機能】**shared/utils/: 1箇所）、新規関数1個、サブエージェントレビュー実施済み」

---

## 📂 **フォルダ・ファイル管理ルール** (README.md より)

### フォルダ別命名規則 (10_NAMING_CONVENTIONS.md より)

#### 1. documentation/project/ （教科書・マニュアル系）
- **ルール**: `番号_名前.md`
- **正しい例**: 01_QUICK_START.md, 02_DEVELOPER_WORKFLOW.md
- **間違い例**: QUICK_START.md（番号なし）, 1_QUICK_START.md（ゼロパディングなし）

#### 2. documentation/handover/ （開発記録・調査結果）
- **ルール**: `名前_日付YYYYMMDD.md`
- **正しい例**: LOG_SYSTEM_INVESTIGATION_RESULT_20250905.md
- **間違い例**: LOG_SYSTEM_INVESTIGATION.md（日付なし）, 20250905_LOG_SYSTEM.md（日付が前）

#### 3. documentation/issues/ （未解決問題）
- **ルール**: `問題名-日付YYYY-MM-DD.md`
- **正しい例**: sleep-tab-recording-issue-20250829.md
- **間違い例**: sleep-issue.md（日付なし）, 20250829-sleep-issue.md（日付が前）

#### 4. documentation/issues/resolved/ （解決済み）
- **ルール**: `問題名-日付YYYYMMDD.md`
- **正しい例**: sleep-tab-recording-issue-20250829.md, insulting-expressions-fixed-20250907.md

#### 5. tabs/ （タブ機能）
- **ルール**: `tab番号-機能名/`
- **正しい例**: tabs/tab1-weight/, tabs/tab2-sleep/, tabs/tab8-memo-list/
- **間違い例**: tabs/weight/（番号なし）, tabs/tab-1-weight/（ハイフン位置違い）

### フォルダの使い分けガイド
- **場所**: README.md (行94-119)

#### docs/ - 教科書・マニュアル系
- **用途**: 固定的な学習用文書
- **適用例**: 開発ワークフロー、必須要件、プロジェクト概要
- **特徴**: 01_-07_番号付き体系、変更頻度が低い
- **不適切**: 調査結果、開発記録、日付付き分析文書

#### documentation/handover/ - 開発記録・技術的変更履歴
- **用途**: 流動的な開発経緯・分析結果
- **適用例**: コードメトリクス、機能開発記録、調査分析結果
- **特徴**: 日付付きファイル、技術的変更の詳細記録
- **不適切**: 基本的なマニュアル、固定的な手順書

#### documentation/issues/ - 未解決問題・現在進行中の課題
- **用途**: 現在対処中の問題
- **適用例**: バグ報告、未解決の技術課題、対処待ち事項
- **特徴**: 解決待ちのもの、進行中の問題
- **不適切**: 完了済みの調査結果、過去の記録

### フォルダ二重構造厳禁
- **場所**: README.md (行120)
- ルート直下に`handover/`や`issues/`フォルダを作るな！全て`documentation/`配下に統一せよ。

---

## 📋 **AI開発者チェックリスト** (05_AI_CHECKLIST.md より)

### Step 1: 作業前チェック
- **場所**: 05_AI_CHECKLIST.md (行5-17)
- 未解決問題確認: `issues/`フォルダの現在の問題を把握
- 現在バージョン確認: `index.html`の`APP_VERSION`を確認
- Git状態確認: `git status`で作業ブランチ確認
- Firebase接続確認: ログイン機能が正常動作するか確認
- 必須ドキュメント再読: MANDATORY_REQUIREMENTS.md, PROJECT_OVERVIEW.md, 該当issue文書

### Step 2: 実装中チェック
- **場所**: 05_AI_CHECKLIST.md (行21-33)
- Core部分未変更: `core/`、`src/firebase-config.js`、`universal-system/`に触っていない
- Firebase必須使用: LocalStorageや代替手段を使用していない
- Google認証保持: 認証機能を省略・変更していない
- ログ・コピー機能保持: 機能を除去していない
- 既存機能保護: 新機能が既存機能に悪影響を与えていない
- 段階的変更: 小さな変更を積み重ねている
- 詳細ログ出力: `log()`でデバッグ情報を出力
- エラーハンドリング: try-catch で例外処理実装

### Step 3: テスト実行
- **場所**: 05_AI_CHECKLIST.md (行37-63)
- 必須テスト（全て合格必須）:
  - `npm test` # 全テスト実行
  - `npm run test:firebase` # Firebase接続テスト
  - `npm run test:auth` # Google認証テスト
  - `npm run test:ui` # UI動作テスト
- ブラウザテスト:
  - Google認証ログイン: 実際にログイン・ログアウト動作確認
  - データ保存・読込: Firebase Database でのCRUD操作確認
  - 既存機能動作: 全タブ・全機能が正常動作する
  - レスポンシブ確認: デスクトップ・モバイルで表示確認

### Step 4: バージョンアップ
- **場所**: 05_AI_CHECKLIST.md (行67-86)
- APP_VERSION更新: `index.html`で0.01刻みでバージョンアップ
- コミット・プッシュ:
  ```bash
  git add .
  git commit -m "feat: 機能説明 (vX.XX)"  # または "fix: 問題修正内容 (vX.XX)"
  git push origin main
  ```

### Step 5: デプロイ確認
- **場所**: 05_AI_CHECKLIST.md (行90-110)
- GitHub Actions確認:
  ```bash
  gh run list --limit 1  # ワークフロー実行確認
  gh run watch  # ワークフロー完了監視
  gh run view --log  # 失敗時の詳細確認
  ```
- 実サイト動作確認（5-10分後）:
  - サイトアクセス: https://muumuu8181.github.io/weight-management-app/
  - ハードリロード: `Ctrl+F5`でキャッシュクリア
  - バージョン確認: 更新されたバージョンが表示される
  - 実装機能確認: 追加・修正した機能が正常動作
  - 既存機能確認: 全ての既存機能が影響を受けていない

### Step 6: 完了報告
- **場所**: 05_AI_CHECKLIST.md (行114-127)
- 報告前最終確認:
  - 全テスト合格: ローカルテスト・ブラウザテスト全て成功
  - GitHub Pages反映: 実サイトで変更が確認できる
  - 問題解決確認: 対象の問題が完全に解決している
  - 副作用なし: 他の機能に悪影響がない
- 報告内容に含める情報:
  - 変更内容: 何を実装・修正したか
  - バージョン: 更新前 → 更新後のバージョン
  - テスト結果: 全テスト合格の旨
  - URL: GitHub Pages の実サイトURL
  - 次の課題: 他に残っている問題があるか

---

## 🆕 **新規作成時の必須確認手順** (09_NEW_CREATION_CHECKLIST.md より)

### 3ステップ確認手順
- **場所**: 09_NEW_CREATION_CHECKLIST.md (行5-26)

#### ステップ1: 既存を探せ（30秒）
```bash
# 作りたいものが既にないか検索
grep -r "作りたい機能名" .
find . -name "*作りたい名前*"
```

#### ステップ2: 類似を確認せよ（30秒）
```bash
# 類似機能がないか確認
ls tabs/          # タブ関連の場合
ls shared/utils/  # 関数関連の場合
ls development/tools/testing/  # ツール関連の場合
```

#### ステップ3: 判断せよ（10秒）
- 既存あり → 既存を修正・拡張
- 類似あり → 類似を参考に既存コードベースに統合
- 完全に新規 → 作成OK

### 禁止パターン
- **場所**: 09_NEW_CREATION_CHECKLIST.md (行29-38)
- やってはいけない例:
  - いきなり `calculateWeightNew.js` を作成
  - 既存の `display-checker.js` があるのに `simple-display-checker.js` を追加
  - `tabs/tab2-sleep/` があるのに `tabs/tab2-sleep-v2/` を作成
- 正しい例:
  - 既存修正: `calculateWeight()` 関数を直接修正
  - 統合: 既存 `display-checker.js` に機能を追加
  - 適切な新規: 本当に新しい機能のみ作成

---

## 📱 **タブ管理ルール** (TAB_MANAGEMENT_RULES.md より)

### 基本原則
- **場所**: TAB_MANAGEMENT_RULES.md (行5-10)
- 一つのタブにつき一つのフォルダ - 各タブは独立したフォルダで管理
- 共通HTMLに直接記述禁止 - `index.html`にタブ固有のコードを書かない
- 3ファイル構成 - HTML/CSS/JavaScriptの3ファイルで構成
- 命名規則統一 - `tab{番号}-{機能名}` 形式でフォルダ命名

### 実装ルール
- **場所**: TAB_MANAGEMENT_RULES.md (行33-57)
- HTMLファイル:
  - タブコンテンツは`<div id="tab{番号}Content">`で囲む
  - 機能に必要なHTML構造のみ記述
  - インラインスタイルは最小限に留める
- CSSファイル:
  - そのタブでのみ使用するスタイルを定義
  - クラス名は機能固有の名前を使用
  - 他のタブに影響しないよう配慮
- JavaScriptファイル:
  - そのタブの機能に関する関数・変数のみ定義
  - グローバル関数は`window.`で明示的に公開
  - 初期化関数を提供（`init{機能名}()`形式推奨）

### 禁止事項
- **場所**: TAB_MANAGEMENT_RULES.md (行62-72)
- してはいけないこと:
  - `index.html`内にタブ固有のHTML/CSS/JSを直接記述
  - タブ間での関数・変数の直接参照
  - 他のタブのDOM要素への直接アクセス
  - 共通スタイルクラス名の上書き
- 避けるべき実装:
  - タブ切り替え時の動的HTML生成
  - 外部CSSライブラリのタブ固有読み込み
  - タブ固有のグローバル汚染

---

## 📊 **引き継ぎ文書作成ルール** (HANDOVER_CREATION_RULES.md より)

### 問題数確定ルール
- **場所**: HANDOVER_CREATION_RULES.md (行5-43)
- 問題数の明記（必須）:
  - 総問題数: [X]問
  - 総配点: 100点
  - 作成日、作成者、最終更新
  - セクション別内訳表
- 問題番号の連続性確認
- 配点の検証:
  - 総配点が100点であることを確認
  - 各問題の配点が2.5点の倍数であることを確認
  - セクション別配点の合計が100点であることを確認
  - 問題数×配点の計算が正しいことを確認

### 引き継ぎ文書作成ルール
- **場所**: HANDOVER_CREATION_RULES.md (行47-108)
- 完成時の必須チェック:
  - PROJECT_HANDOVER.md が存在する
  - KNOWLEDGE_VERIFICATION_CHECKLIST.md が存在する
  - handover/answers/CHECKLIST_ANSWERS.md が存在する
  - 問題数・配点が全て一致している
- 問題品質ルール:
  - 良い問題: 客観的事実のみ（バージョン、使用技術、ファイル名等）
  - 悪い問題: 主観的・経験依存・解釈が複数ある内容
- フォルダ配置ルール:
  - 標準フォルダ構造に従う
  - PROJECT_HANDOVER.md: ルート直下
  - KNOWLEDGE_VERIFICATION_CHECKLIST.md: ルート直下
  - handover/answers/CHECKLIST_ANSWERS.md: 解答集
- 命名規則（厳守）:
  - 引き継ぎ文書: `PROJECT_HANDOVER.md`
  - チェックリスト: `KNOWLEDGE_VERIFICATION_CHECKLIST.md`
  - 解答集: `CHECKLIST_ANSWERS.md`

### 禁止事項・注意事項
- **場所**: HANDOVER_CREATION_RULES.md (行151-175)
- 絶対禁止事項:
  - 問題数・配点の曖昧記載（「約40問」「だいたい100点」等）
  - 主観的問題の出題（「良い/悪い」「適切/不適切」等）
  - 引き継ぎ文書外からの出題（一般的な技術知識、文書に記載のない内容）
  - 不適切なフォルダ配置（標準構造以外、3階層以上）
- 注意事項:
  - 更新時の責任: 問題数・内容を変更した場合は概要表も必ず更新
  - バックアップの重要性: 大幅変更前は archives/ への保存必須

---

## 🌳 **Git Worktree ガイド** (08_GIT_WORKTREE_GUIDE.md より)

### 重要な注意点・デメリット
- **場所**: 08_GIT_WORKTREE_GUIDE.md (行126-184)
- 容量問題:
  - 元のプロジェクト: 200MB
  - 3つのworktreeでも ~500MB程度（約3倍弱）
  - 体重管理アプリなら実用的な範囲内
- 混乱しやすいポイント:
  - 現在地迷子問題: `pwd`で常に確認する癖をつける
  - 共有リソースの競合リスク: 同じファイルを複数worktreeで同時編集は危険
  - 全worktree共有される要素: git stash、git config、.gitignore
- IDE・ツールの混乱:
  - VSCode等での設定ファイル競合
  - キャッシュ混乱、デバッガー混乱
  - Node.js/npm問題: node_modulesは各worktree独立（重複でサイズ増加）

### 安全運用ルール
- **場所**: 08_GIT_WORKTREE_GUIDE.md (行241-260)
- 作業前必須確認:
  ```bash
  pwd && git branch && echo "--- 現在の状況確認 ---"
  git worktree list
  ```
- 責務分離原則:
  - main: 安定版保守（バグ修正・緊急対応）
  - feature1: 新機能開発（新タブ追加・大機能）
  - experiment: 実験・検証（アーキテクチャ変更・POC）
- 定期メンテナンス:
  ```bash
  git worktree list  # 現状確認
  git worktree prune  # 不要worktree自動削除（週1回推奨）
  ```

---

## 🎉 **v2.00 タブ分離作業の教訓** (TAB_BUNRI_SAKUGYO_LESSONS_LEARNED_v2.00.md より)

### 成功の重要ポイント
- **場所**: TAB_BUNRI_SAKUGYO_LESSONS_LEARNED_v2.00.md (行34-51)
- 厳格なルール遵守:
  - docs/separation-work-rules.md 完全準拠
  - 完全コピー戦略: 一切の改善・最適化を禁止
  - 段階的移動: 1関数ずつの安全な分離
  - 即座の動作確認: 各段階でのテスト実行
- copy → delete → 公開ループ:
  1. バックアップ作成
  2. 外部JSファイルに完全コピー
  3. index.htmlから完全削除
  4. バージョン更新・公開
  5. 動作確認・問題修正
  6. 次の関数へ

### 遭遇した問題と解決策・教訓
- **場所**: TAB_BUNRI_SAKUGYO_LESSONS_LEARNED_v2.00.md (行75-99)
- 関数重複定義:
  - 教訓: 移動後の削除確認を厳格に実施
- DOM要素アクセスタイミング:
  - 教訓: 動的読み込みのタイミング制御が重要
- Chart.js初期化失敗:
  - 教訓: 依存関係のある関数群は一括移動が効果的
- 初期化関数の呼び出し漏れ:
  - 教訓: 外部JS移動時は初期化フローの見直しが必要

---

## 🚀 **GitHub Pages更新マニュアル** (06_GITHUB_PAGES_MANUAL.md より)

### GitHub Pagesの仕組み
- **場所**: 06_GITHUB_PAGES_MANUAL.md (行3-7)
- GitHub ActionsワークフローでG自動デプロイ
- `main`ブランチへのpushで自動的にトリガー
- デプロイ完了まで通常1-5分

### トラブルシューティング
- **場所**: 06_GITHUB_PAGES_MANUAL.md (行43-80)
- 更新が反映されない場合:
  - ワークフロー実行確認: `gh run list`
  - ブラウザキャッシュクリア: ハードリロード `Ctrl + F5`
  - 強制プッシュ（注意）: `git push --force-with-lease origin main`
- ワークフローが失敗した場合:
  - 失敗理由確認: `gh run view --log`
  - 再実行: `gh workflow run "Deploy static content to Pages"`
  - 空コミットでトリガー: `git commit --allow-empty -m "Trigger GitHub Pages" && git push origin main`

### タイムライン目安
- **場所**: 06_GITHUB_PAGES_MANUAL.md (行88-92)
- コミット・プッシュ: 即座
- ワークフロー開始: 30秒～2分
- デプロイ完了: プッシュから3～7分
- ブラウザ反映: デプロイ完了から1～2分

---

## 🎯 **Smart Effects システムガイド** (07_SMART_EFFECTS_GUIDE.md より)

### エフェクトレベル一覧表
- **場所**: 07_SMART_EFFECTS_GUIDE.md (行14-24)
- level1 - 軽微操作: 緑、キラキラ3個、メモ追加・小タスク完了
- level2 - 標準記録: 青、キラキラ6個、体重記録・睡眠記録
- level3 - 達成・完了: 金、キラキラ12個、良質睡眠・全タスク完了
- level4 - 編集・更新: 水色、キラキラ4個、データ編集・設定変更
- level5 - 重要操作: 赤、キラキラ8個、削除・重要な変更
- level6 - 特別達成: 紫、キラキラ16個、完璧睡眠・特別記録

### 基本的な使い方
- **場所**: 07_SMART_EFFECTS_GUIDE.md (行5-8)
```javascript
// たった1行でエフェクト実行
window.smartEffects.trigger('weight', 'save', saveButton);
```

---

## 📝 **プロジェクト概要・アーキテクチャ** (04_PROJECT_OVERVIEW.md より)

### 絶対に触ってはいけない場所
- **場所**: 04_PROJECT_OVERVIEW.md (行43-51)
1. `core/`フォルダ全体 - Firebase設定・認証・コピー機能の核心部分
2. `src/firebase-config.js` - データベース接続設定
3. `universal-system/` - テンプレート基盤システム
4. `.github/workflows/` - 自動デプロイ設定
- **理由**: 変更すると全体が動作しなくなり、プロジェクト差し戻しになります。

### 自由に変更できる場所
- **場所**: 04_PROJECT_OVERVIEW.md (行53-58)
1. `custom/app-config.js` - アプリ名・ボタン設定・動作設定
2. `custom/styles.css` - カラーテーマ・フォント・レイアウト
3. `index.html`の表示部分 - UI構造（Firebase設定部分以外）
4. `tabs/`フォルダ - 各タブの機能実装

### 技術スタック
- **場所**: 04_PROJECT_OVERVIEW.md (行73-78)
- フロントエンド: Vanilla HTML/CSS/JavaScript
- 認証: Firebase Authentication (Google OAuth) - **必須**
- データベース: Firebase Realtime Database - **必須**
- 可視化: Chart.js
- デプロイ: GitHub Pages (自動)

### 開発の基本ルール
- **場所**: 04_PROJECT_OVERVIEW.md (行101-104)
1. バージョン管理: 0.01刻みで必ずバージョンアップ
2. 既存機能保護: 新機能追加時も既存機能を破壊しない
3. テスト必須: 機能実装後は必ずテストツールで確認
4. デプロイ確認: GitHub Pagesで実際に動作確認するまで完了ではない

### よくある失敗パターン
- **場所**: 04_PROJECT_OVERVIEW.md (行151-156)
1. Firebase → LocalStorage変更 → プロジェクト差し戻し
2. Core部分の変更 → 全体動作不良
3. テスト省略 → 本番環境で問題発覚
4. バージョンアップ忘れ → 進捗追跡不能

---

## 🛡️ **違反時の対応** (03_MANDATORY_REQUIREMENTS.md より)

### 軽微な違反
- **場所**: 03_MANDATORY_REQUIREMENTS.md (行148-149)
- テスト未実施 → 即座にテスト実行・結果提出
- ログ機能除去 → 即座に復旧・動作確認

### 重大な違反
- **場所**: 03_MANDATORY_REQUIREMENTS.md (行151-154)
- Firebase → LocalStorage変更 → **プロジェクト差し戻し**
- Google認証省略 → **プロジェクト差し戻し**
- Core部分変更 → **プロジェクト差し戻し**

### 緊急対応
- **場所**: 03_MANDATORY_REQUIREMENTS.md (行156-159)
- 違反検出時は自動復旧システムが作動
- バックアップから自動復元
- 違反内容の詳細ログ記録

---

## 💡 **成功の秘訣とプロTips**

### 開発フロー (04_PROJECT_OVERVIEW.md より)
- **場所**: 04_PROJECT_OVERVIEW.md (行141-148)
1. 問題調査 → `issues/`フォルダの未解決問題を確認
2. 機能実装 → 既存機能保護を最優先
3. テスト実行 → 全テスト通過まで実施
4. バージョンアップ → 0.01刻みで更新
5. デプロイ確認 → GitHub Pagesで動作確認
6. 完了報告 → 実際の動作確認後に完了

### 成功の秘訣 (04_PROJECT_OVERVIEW.md より)
- **場所**: 04_PROJECT_OVERVIEW.md (行158-163)
- 段階的開発: 小さな変更を積み重ねる
- テスト重視: 動作確認を怠らない
- 既存機能保護: 新機能より安定性優先
- ドキュメント更新: 変更は必ず記録

### 良い開発フロー (05_AI_CHECKLIST.md より)
- **場所**: 05_AI_CHECKLIST.md (行156-161)
- 小さく始める → 大きな変更は段階的に分割
- 頻繁なテスト → 変更の都度テスト実行
- 詳細なログ → 問題発生時の調査を容易に
- 確実な確認 → 推測ではなく実際の動作で判断

### 問題解決アプローチ (05_AI_CHECKLIST.md より)
- **場所**: 05_AI_CHECKLIST.md (行163-168)
- 問題の詳細把握 → issueフォルダの文書を熟読
- 環境の確認 → Firebase・認証・デプロイ状況を確認
- 段階的デバッグ → ログ出力で問題箇所を特定
- 最小修正 → 必要最小限の変更で解決

---

## 📞 **質問・相談について** (03_MANDATORY_REQUIREMENTS.md より)

### 相談OK事項
- **場所**: 03_MANDATORY_REQUIREMENTS.md (行186-190)
- 要件を満たした上での機能追加
- UI/UXの改善（Core部分以外）
- パフォーマンス最適化（Core部分以外）

### 相談不可事項
- **場所**: 03_MANDATORY_REQUIREMENTS.md (行192-195)
- 必須要件の変更・回避・省略
- 「技術的に困難」による代替案
- Core部分の変更・改善

---

## 🎯 **総括**

このドキュメントは、weight-management-appプロジェクトの全開発ルール、ガイドライン、ポリシーを網羅的にまとめたものです。

### 最重要ポイント
1. **絶対禁止事項の厳守**: 全削除機能、Core部分変更、LocalStorage使用等
2. **必須要件の遵守**: Firebase使用、Google認証、テスト実施、ログ・コピー機能保持
3. **開発フローの徹底**: git pull → 修正 → バージョンアップ → テスト → push → デプロイ確認
4. **新規作成前の確認**: 既存確認 → 類似確認 → 判断
5. **ゴミコード排除**: プロジェクトを常に清潔に保つ

### 開発者への期待
- ルールに従えば、100%確実に動作するアプリケーションが完成します
- 技術的困難は自動解決システムが対応します
- プロジェクトを清潔に保ち、効率的な開発を心がけてください

**このルール集を遵守することで、安全で効率的な開発が可能になります。開発成功を祈ります！**