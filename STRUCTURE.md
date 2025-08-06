# 📁 プロジェクト構造 v0.2 - Core/Custom分離版

## 🔧 フォルダ構成

```
weight-management-app/
├── core/                           # 🚫 触ってはいけない領域
│   ├── .github/                   # GitHub Actions設定
│   │   └── workflows/
│   │       └── pages.yml          # GitHub Pages自動デプロイ
│   ├── src/                       # Core Firebase設定
│   │   └── firebase-config.js     # Firebase認証・DB設定
│   └── universal-system/          # Universal Template システム
│       └── core/
│           └── universal-template.js
├── custom/                         # ✅ 自由にカスタマイズ可能
│   ├── app-config.js              # アプリ設定（色・ボタン・動作等）
│   └── styles.css                 # カスタムCSS（デザイン全般）
├── index.html                      # メインアプリファイル
├── package.json                    # プロジェクト設定
├── README.md                      # プロジェクト説明
├── STRUCTURE.md                   # この構造説明
└── GITHUB_PAGES_DEPLOYMENT_REFLECTION.md  # デプロイ振り返り
```

## 🚫 CORE フォルダ（触ってはいけない）

### 🔥 Firebase設定 (core/src/firebase-config.js)
- **絶対に変更禁止**
- 認証・データベース接続の核心部分
- API Key、プロジェクト設定を含む
- 他のアプリでも同じ設定を共用

### ⚙️ GitHub Actions (core/.github/workflows/pages.yml)
- GitHub Pages自動デプロイ設定
- 権限・ワークフロー設定
- **変更するとデプロイが失敗する**

### 🛠️ Universal System (core/universal-system/)
- テンプレートの基盤システム
- 自動設定・テスト機能
- **Core部分の変更は全体に影響**

## ✅ CUSTOM フォルダ（自由にカスタマイズ可能）

### 🎨 app-config.js
```javascript
// 以下の項目を自由に変更可能
- アプリ名・バージョン
- デフォルト体重値
- 測定タイミングボタン（追加・削除・色変更）
- キーボードショートカット
- 表示設定（履歴件数・日付形式）
- デバッグ設定
```

### 🎨 styles.css
```css
/* 以下を自由にカスタマイズ可能 */
- カラーテーマ（全色変更可能）
- フォント設定
- レイアウト・スペーシング
- ボタンデザイン
- レスポンシブ対応
- ダークモード
```

## 🔄 他のアプリに変更する場合

### ✅ 変更してOKなファイル
- `custom/app-config.js` → アプリの動作・設定
- `custom/styles.css` → 見た目・デザイン
- `index.html` の表示部分のみ → UI構造

### 🚫 変更NGなファイル
- `core/` 内のすべて
- `index.html` のFirebase設定部分
- `package.json` のcore関連設定

## 🎯 カスタマイズ例

### 食事記録アプリに変更する場合
1. `custom/app-config.js` で：
   - `name: "食事記録アプリ"`
   - `timingButtons` を食事関連に変更
   - `defaults.weight` を `meal` に変更

2. `custom/styles.css` で：
   - カラーテーマを食事系の色に変更
   - アイコンを食べ物系に変更

3. `index.html` で：
   - 表示テキストを食事関連に変更
   - **Firebase設定部分は絶対に変更しない**

### 運動記録アプリに変更する場合
1. `custom/app-config.js` で：
   - `name: "運動記録アプリ"`
   - `timingButtons` を運動関連に変更
   - データ項目を運動内容に変更

2. `custom/styles.css` で：
   - スポーツ系のカラーテーマに変更

## ⚡ 開発ワークフロー

1. **カスタマイズ**：`custom/` フォルダのみ編集
2. **テスト**：ローカルでHTTPサーバー起動
3. **デプロイ**：`git push` で自動デプロイ
4. **確認**：https://muumuu8181.github.io/weight-management-app/

## 🛡️ 保護メカニズム

- **Core分離**：誤った変更を物理的に防止
- **明確な境界**：触ってOK/NGが一目瞭然
- **独立したカスタマイズ**：他への影響なし
- **バックアップ保護**：Core部分は常に安全

---

**🎉 この構造により、安全で効率的なカスタマイズが可能！**