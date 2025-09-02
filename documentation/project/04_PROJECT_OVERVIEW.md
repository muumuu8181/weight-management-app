# 🏗️ プロジェクト概要 - AI開発者向け必須情報

## 🚨 最重要：最初に読む必須事項

### 📂 プロジェクト構造

```
weight-management-app/
├── README.md                    # このファイル（エントリーポイント）
├── index.html                   # メインアプリケーション
├── package.json                 # npm設定
│
├── 📁 answers/                  # 📝 検証・解答集
├── 📁 archive/                  # 📚 古いバージョン（参考のみ）
├── 📁 config/                   # ⚙️ 設定ファイル
├── 🚫 core/                     # ⚠️ 絶対に触ってはいけない領域
│   ├── src/firebase-config.js  # Firebase設定（変更禁止）
│   └── universal-system/       # Core機能（変更禁止）
├── ✅ custom/                   # 🎨 自由にカスタマイズ可能
│   ├── app-config.js           # アプリ設定
│   └── styles.css              # カスタムCSS
├── 📁 docs/                     # 📚 教科書・マニュアル系（固定的な学習用文書）
├── 📁 examples/                 # 🔬 サンプルコード・データ
│   └── data/                   # サンプルデータ
├── 📁 handover/                 # 📊 開発記録・技術的変更履歴（流動的）
├── 📁 issues/                   # 🔴 現在の未解決問題
├── 📁 jsdom-storage/            # 🧪 テスト用ストレージ
├── 📁 node_modules/             # 📦 npm依存関係
├── 📁 scripts/                  # 📜 スクリプトファイル
├── 📁 shared/                   # 🔗 共通機能・ライブラリ
├── 📁 tabs/                     # 📱 タブベース機能
│   ├── tab1-weight/           # 体重管理（完成）
│   ├── tab2-sleep/            # 睡眠管理（完成）
│   ├── tab3-room-cleaning/    # 部屋片付け
│   ├── tab4-stretch/          # ストレッチ
│   ├── tab5-dashboard/        # ダッシュボード
│   ├── tab6-job-dc/           # JOB_DC（キャリア管理）
│   ├── tab7-pedometer/        # 万歩計
│   └── tab8-memo-list/        # メモリスト
└── 📁 tools/                    # 🛠️ テストツール・データストレージ
```

### 🚫 **絶対に触ってはいけない場所**

1. **`core/`フォルダ全体** - Firebase設定・認証・コピー機能の核心部分
2. **`src/firebase-config.js`** - データベース接続設定
3. **`universal-system/`** - テンプレート基盤システム
4. **`.github/workflows/`** - 自動デプロイ設定

**理由**: 変更すると全体が動作しなくなり、プロジェクト差し戻しになります。

### ✅ **自由に変更できる場所**

1. **`custom/app-config.js`** - アプリ名・ボタン設定・動作設定
2. **`custom/styles.css`** - カラーテーマ・フォント・レイアウト
3. **`index.html`の表示部分** - UI構造（Firebase設定部分以外）
4. **`tabs/`フォルダ** - 各タブの機能実装

## 🔴 現在の緊急問題（未解決）

### 1. **前期間記録ボタン機能不全** (優先度：高)
- **状態**: v0.72で未解決
- **問題**: ボタンUIは正常、データ取得も成功、但しChart.jsでグラフに前期間データが表示されない
- **場所**: `issues/previous-period-button-*.md`

### 2. **睡眠タブ記録不具合** (優先度：高)
- **状態**: v0.69で未解決  
- **問題**: 睡眠データの記録が保存されない
- **場所**: `issues/sleep-tab-recording-issue-20250829.md`

## 🏗️ アーキテクチャ概要

### 技術スタック
- **フロントエンド**: Vanilla HTML/CSS/JavaScript
- **認証**: Firebase Authentication (Google OAuth) - **必須**
- **データベース**: Firebase Realtime Database - **必須**
- **可視化**: Chart.js
- **デプロイ**: GitHub Pages (自動)

### データ構造
```
/users/{uid}/
├── weightData/{push_id}/
│   ├── weight: number
│   ├── date: "YYYY-MM-DD"
│   ├── time: "HH:MM"
│   ├── timing: string
│   └── memo: string
└── sleepData/{push_id}/
    ├── sleepType: string
    ├── bedtime: "HH:MM"
    ├── wakeupTime: "HH:MM"
    └── quality: number (1-5)
```

### タブ構成
- **タブ1**: 体重管理（完成）- チャート表示・ナビゲーション・統計
- **タブ2**: 睡眠管理（完成・但し保存不具合あり）
- **タブ3**: 未実装（将来拡張用）

## ⚡ 開発の基本ルール

### 1. **バージョン管理**: 0.01刻みで必ずバージョンアップ
### 2. **既存機能保護**: 新機能追加時も既存機能を破壊しない
### 3. **テスト必須**: 機能実装後は必ずテストツールで確認
### 4. **デプロイ確認**: GitHub Pagesで実際に動作確認するまで完了ではない

## 📋 必須確認チェックリスト

作業開始前に必ず確認：

- [ ] ✅ `MANDATORY_REQUIREMENTS.md` 読了済み
- [ ] ✅ Firebase Database使用（LocalStorage禁止）
- [ ] ✅ Google認証実装（省略禁止）
- [ ] ✅ ログ機能・コピーボタン保持
- [ ] ✅ Core部分未変更

## 🔧 開発環境

### 必要コマンド
```bash
# HTTPサーバー起動
python -m http.server 8000
# または
npx http-server -p 8000

# テスト実行
npm test
npm run test:firebase
npm run test:auth

# GitHub Pages確認
https://muumuu8181.github.io/weight-management-app/
```

### デバッグツール
- **Chrome DevTools**: 必須
- **Firebase Console**: データベース確認
- **GitHub Actions**: デプロイ状況確認

## 🎯 開発フロー

1. **問題調査** → `issues/`フォルダの未解決問題を確認
2. **機能実装** → 既存機能保護を最優先
3. **テスト実行** → 全テスト通過まで実施
4. **バージョンアップ** → 0.01刻みで更新
5. **デプロイ確認** → GitHub Pagesで動作確認
6. **完了報告** → 実際の動作確認後に完了

## ⚠️ よくある失敗パターン

1. **Firebase → LocalStorage変更** → プロジェクト差し戻し
2. **Core部分の変更** → 全体動作不良
3. **テスト省略** → 本番環境で問題発覚
4. **バージョンアップ忘れ** → 進捗追跡不能

## 🚀 成功の秘訣

- **段階的開発**: 小さな変更を積み重ねる
- **テスト重視**: 動作確認を怠らない
- **既存機能保護**: 新機能より安定性優先
- **ドキュメント更新**: 変更は必ず記録

---

**🎯 この文書を読んだら、次は `MANDATORY_REQUIREMENTS.md` を必ず読んでください。**