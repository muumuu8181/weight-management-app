# 📊 体重管理アプリ - AI開発者向けドキュメントハブ

## ⚡ **超重要：まずこれだけ読んで！**

### 🔥 **[QUICK_START.md](QUICK_START.md)** - 5秒で理解する必須ルール
**修正作業をすぐ始めたい人は、これだけ読めばOK！**

---

## 🚨 **新人AI開発者へ - 詳細を知りたい場合は以下を順番に**

このプロジェクトには13個のドキュメントがありますが、**以下の順番で読むことで迷わず開発作業を開始できます**。

---

## 🥇 **Level 1: 必須（初期設定）** - 最初に絶対読むもの

### 📖 **1. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** ⭐ まず最初にこれを読む
プロジェクト全体像・フォルダ構造・触ってはいけない場所・現在の問題を把握

### 📖 **2. [MANDATORY_REQUIREMENTS.md](MANDATORY_REQUIREMENTS.md)** ⭐ 絶対遵守事項
Firebase必須・Google認証必須・Core部分変更禁止など、違反すると差し戻しになる重要事項

### 📖 **3. [handover/STANDARDIZED_HANDOVER_GUIDE.md](handover/STANDARDIZED_HANDOVER_GUIDE.md)**
標準化された引継ぎ方針とプロジェクト運営ルール

---

## 🥈 **Level 2: 重要（恒常作業）** - 開発時に毎回確認するもの

### ✅ **4. [AI_CHECKLIST.md](AI_CHECKLIST.md)** ⭐ 開発時の必須手順書
機能追加・修正時の6ステップ作業手順（作業前→実装→テスト→バージョンアップ→デプロイ→完了報告）

### 🔧 **5. [DEVELOPER_WORKFLOW.md](DEVELOPER_WORKFLOW.md)**
バージョンアップとGitHub Pages自動デプロイの基本手順

### 🚀 **6. [GITHUB_PAGES_MANUAL.md](GITHUB_PAGES_MANUAL.md)**
デプロイ手順詳細・トラブルシューティング・確認方法

### 🔴 **7. 現在の未解決問題（緊急対応必要）**
- **[issues/previous-period-button-handover-20250829.md](issues/previous-period-button-handover-20250829.md)** - 前期間記録ボタン機能不全（v0.72で未解決）
- **[issues/previous-period-button-issue-20250829.md](issues/previous-period-button-issue-20250829.md)** - 前期間ボタン問題の詳細
- **[issues/sleep-tab-recording-issue-20250829.md](issues/sleep-tab-recording-issue-20250829.md)** - 睡眠タブ記録不具合（v0.69で未解決）

---

## 🥉 **Level 3: 推奨（参考情報）** - 必要時に読むもの

### 📚 **参考・学習用ドキュメント**
- **[INCIDENT_REPORT.md](INCIDENT_REPORT.md)** - GitHub Pages更新失敗の教訓
- **[MOBILE_LOGIN_TROUBLESHOOTING_HISTORY.md](MOBILE_LOGIN_TROUBLESHOOTING_HISTORY.md)** - モバイル認証問題解決履歴
- **[GITHUB_PAGES_DEPLOYMENT_REFLECTION.md](GITHUB_PAGES_DEPLOYMENT_REFLECTION.md)** - デプロイ関連の振り返り
- **[tools/testing/docs/README.md](tools/testing/docs/README.md)** - テストツール関連
- **[tools/data-storage/INTEGRATION_GUIDE.md](tools/data-storage/INTEGRATION_GUIDE.md)** - データストレージ機能

---

## 📚 **Level 4: アーカイブ（保管）** - 古いバージョンや重複文書

### 📦 **古いバージョン（参考のみ）**
- **[PROJECT_HANDOVER_v0.66.md](PROJECT_HANDOVER_v0.66.md)** - 旧版引継ぎ文書
- **[KNOWLEDGE_VERIFICATION_v0.66.md](KNOWLEDGE_VERIFICATION_v0.66.md)** - 旧版検証リスト
- **[answers/CHECKLIST_ANSWERS_v0.66.md](answers/CHECKLIST_ANSWERS_v0.66.md)** - 旧版回答

### 📦 **統合済み文書（読まなくてOK）**
- ~~KNOWLEDGE_VERIFICATION_CHECKLIST.md~~ → MANDATORY_REQUIREMENTS.mdに統合済み
- ~~KNOWLEDGE_VERIFICATION_ANSWERS.md~~ → handoverフォルダに統合済み
- ~~NEW_DEVELOPER_HANDOFF.md~~ → PROJECT_OVERVIEW.mdに統合済み

---

## 🎯 **開発作業開始の推奨手順**

### **Step 1**: Level 1の3文書を順番に読む（必須・約15分）
1. PROJECT_OVERVIEW.md → 全体把握
2. MANDATORY_REQUIREMENTS.md → 絶対遵守事項
3. handover/STANDARDIZED_HANDOVER_GUIDE.md → 運営方針

### **Step 2**: 現在の問題を把握（必須・約10分）  
1. issues/フォルダの未解決問題3件を確認
2. 優先度の高い問題から着手検討

### **Step 3**: 開発作業時にLevel 2を参照（恒常作業）
1. AI_CHECKLIST.md → 6ステップ手順に従って作業
2. 必要に応じて他の Level 2文書を参照

---

## 📊 プロジェクト基本情報

Firebase + Google認証による汎用データ管理アプリテンプレートです。**Core/Custom分離構造**により、安全で効率的なカスタマイズが可能になりました。

## 🌟 主要機能

### 📊 基本機能
- **データ記録**: 日付・時刻・値・タイミング・メモを記録
- **🔐 Google認証**: 安全なGoogle OAuth認証システム
- **🔄 リアルタイム同期**: Firebase Realtime Databaseによるデバイス間同期
- **⌨️ キーボード操作**: ↑↓キーで0.1単位の調整
- **📈 履歴表示**: 時系列でのデータ履歴確認

### 🎨 Core/Custom分離構造 (v0.2の新機能)
- **🚫 Core フォルダ**: 触ってはいけない安全領域（Firebase設定・GitHub Actions等）
- **✅ Custom フォルダ**: 自由にカスタマイズ可能（色・ボタン・動作設定）
- **🔧 簡単変更**: 様々なデータ管理アプリへの転用が容易
- **🛡️ 安全性**: 誤った変更による動作不良を防止

### 🔘 タイミングボタン（カスタマイズ可能）
- 🌅 朝起床後
- 🚽 トイレ後  
- 🛁 風呂前
- 🛀 風呂後
- 🍽️ 食事前/後

## 🚀 使用方法

### ライブデモ
**https://muumuu8181.github.io/0000-00-00-project-template/**

### ローカル実行
1. HTTPサーバーを起動：
   ```bash
   python -m http.server 8000
   ```
   または
   ```bash
   npx http-server -p 8000
   ```

2. ブラウザで `http://localhost:8000` にアクセス

3. Googleアカウントでログイン

4. データを入力して保存

## 🔧 技術仕様

- **フロントエンド**: Vanilla HTML/CSS/JavaScript
- **認証**: Firebase Authentication (Google OAuth)
- **データベース**: Firebase Realtime Database
- **デプロイ**: GitHub Pages
- **対応ブラウザ**: Chrome, Firefox, Safari, Edge

## 📱 データ構造

```json
{
  "users": {
    "userId": {
      "weights": {
        "recordId": {
          "date": "2025-08-06",
          "time": "20:30",
          "value": 72.5,
          "timing": "風呂後",
          "memo": "夕食後",
          "timestamp": 1722944530000,
          "userEmail": "user@example.com"
        }
      }
    }
  }
}
```

## 🛡️ プライバシー

- データはユーザー別に完全分離
- Firebase認証による安全なアクセス制御
- 個人情報はFirebaseサーバー側で保護
- アプリコードに個人データは含まれません

## 📁 プロジェクト構造 - Core/Custom分離版

### 🔧 フォルダ構成

```
app-template/
├── core/                           # 🚫 触ってはいけない領域
│   ├── .github/                   # GitHub Actions設定
│   │   └── workflows/
│   │       └── pages.yml          # GitHub Pages自動デプロイ
│   ├── src/                       # Core Firebase設定
│   │   └── firebase-config.js     # Firebase認証・DB設定
│   └── universal-system/          # Universal Template システム
├── custom/                         # ✅ 自由にカスタマイズ可能
│   ├── app-config.js              # アプリ設定（色・ボタン・動作等）
│   └── styles.css                 # カスタムCSS（デザイン全般）
├── index.html                      # メインアプリファイル
└── README.md                       # このファイル
```

### 🚫 CORE フォルダ（触ってはいけない）

- **🔥 Firebase設定** - 認証・データベース接続の核心部分（絶対変更禁止）
- **⚙️ GitHub Actions** - 自動デプロイ設定（変更するとデプロイ失敗）
- **🛠️ Universal System** - テンプレート基盤（Core変更は全体に影響）

### ✅ CUSTOM フォルダ（自由にカスタマイズ可能）

- **🎨 app-config.js** - アプリ名・ボタン設定・動作設定
- **🎨 styles.css** - カラーテーマ・フォント・レイアウト・ダークモード

## 🔄 他のアプリに変更する方法

### ✅ 変更してOKなファイル
- `custom/app-config.js` → アプリの動作・設定
- `custom/styles.css` → 見た目・デザイン
- `index.html` の表示部分のみ → UI構造

### 🚫 変更NGなファイル
- `core/` 内のすべて
- `index.html` のFirebase設定部分

### 🎯 カスタマイズ例

#### 食事記録アプリに変更
1. `custom/app-config.js` で：アプリ名・タイミングボタンを食事関連に変更
2. `custom/styles.css` で：カラーテーマを食事系に変更
3. `index.html` で：表示テキストを食事関連に変更（**Firebase設定は変更禁止**）

#### 運動記録アプリに変更
1. `custom/app-config.js` で：アプリ名・ボタンを運動関連に変更
2. `custom/styles.css` で：スポーツ系カラーテーマに変更

## ⚡ 開発ワークフロー

1. **カスタマイズ** → `custom/` フォルダのみ編集
2. **テスト** → ローカルでHTTPサーバー起動
3. **デプロイ** → `git push` で自動デプロイ
4. **確認** → https://muumuu8181.github.io/app-template/

## 🛡️ 保護メカニズム

- **Core分離** - 誤った変更を物理的に防止
- **明確な境界** - 触ってOK/NGが一目瞭然
- **独立カスタマイズ** - 他への影響なし
- **バックアップ保護** - Core部分は常に安全

## 🎯 開発情報

- **バージョン**: v0.2
- **作成日**: 2025-08-06
- **言語**: JavaScript (ES6)
- **ライセンス**: MIT

## 📋 更新履歴

### v0.2 (2025-08-06)
- **Core/Custom分離構造**導入
- `core/` フォルダ：安全な核心部分
- `custom/` フォルダ：カスタマイズ可能領域
- プロジェクト構造ドキュメント追加
- 他アプリへの転用が容易に

### v0.1 (2025-08-06)
- 初回リリース
- Firebase + Google認証実装
- 体重記録・履歴表示機能
- キーボード操作対応
- 測定タイミングプリセット
- GitHub Pages デプロイ完成

## 🤝 貢献

Issue・Pull Request歓迎です。改善提案やバグ報告をお待ちしています。

---

**🚀 GitHub Pages**: https://muumuu8181.github.io/app-template/