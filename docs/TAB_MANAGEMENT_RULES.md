# タブ管理ルール

## 📋 基本原則

### ✅ 必須ルール
1. **一つのタブにつき一つのフォルダ** - 各タブは独立したフォルダで管理
2. **共通HTMLに直接記述禁止** - `index.html`にタブ固有のコードを書かない
3. **3ファイル構成** - HTML/CSS/JavaScriptの3ファイルで構成
4. **命名規則統一** - `tab{番号}-{機能名}` 形式でフォルダ命名

### ✅ フォルダ構造
```
tabs/
├── tab1-weight/          # 体重管理
│   ├── weight.html
│   ├── weight.css
│   └── weight.js
├── tab2-sleep/           # 睡眠管理
│   ├── sleep.html
│   ├── sleep.css
│   └── sleep.js
├── tab3-room-cleaning/   # 部屋片付け
│   ├── room-cleaning.html
│   ├── room-cleaning.css
│   └── room-cleaning.js
└── tab8-memo-list/       # メモリスト
    ├── memo-list.html
    ├── memo-list.css
    └── memo-list.js
```

## 🔧 実装ルール

### HTMLファイル
- タブコンテンツは`<div id="tab{番号}Content">`で囲む
- 機能に必要なHTML構造のみ記述
- インラインスタイルは最小限に留める

### CSSファイル  
- そのタブでのみ使用するスタイルを定義
- クラス名は機能固有の名前を使用
- 他のタブに影響しないよう配慮

### JavaScriptファイル
- そのタブの機能に関する関数・変数のみ定義
- グローバル関数は`window.`で明示的に公開
- 初期化関数を提供（`init{機能名}()`形式推奨）

### index.htmlでの読み込み
```html
<!-- タブ固有スタイル -->
<link rel="stylesheet" href="tabs/tab3-room-cleaning/room-cleaning.css">
<link rel="stylesheet" href="tabs/tab8-memo-list/memo-list.css">

<!-- タブ固有JavaScript -->
<script src="tabs/tab3-room-cleaning/room-cleaning.js"></script>
<script src="tabs/tab8-memo-list/memo-list.js"></script>
```

## 🚫 禁止事項

### ❌ してはいけないこと
1. `index.html`内にタブ固有のHTML/CSS/JSを直接記述
2. タブ間での関数・変数の直接参照
3. 他のタブのDOM要素への直接アクセス
4. 共通スタイルクラス名の上書き

### ❌ 避けるべき実装
- タブ切り替え時の動的HTML生成
- 外部CSSライブラリのタブ固有読み込み
- タブ固有のグローバル汚染

## 📚 新規タブ追加手順

### 1. フォルダ作成
```bash
mkdir tabs/tab{番号}-{機能名}
```

### 2. ファイル作成
```bash
# 基本3ファイルを作成
touch tabs/tab{番号}-{機能名}/{機能名}.html
touch tabs/tab{番号}-{機能名}/{機能名}.css  
touch tabs/tab{番号}-{機能名}/{機能名}.js
```

### 3. index.html更新
- CSS/JSの読み込み追加
- バージョン番号を0.01アップ

### 4. 機能実装
- HTMLでUI構造定義
- CSSでスタイル定義
- JavaScriptで機能実装

### 5. テスト・デプロイ
```bash
# 変更をコミット・プッシュ
git add .
git commit -m "feat: add tab{番号} {機能名} (v{バージョン})"
git push origin main
```

## 🔄 既存タブの分離手順

1. **フォルダ作成** - `tabs/tab{番号}-{機能名}/`
2. **コード抽出** - `index.html`から該当部分を抽出
3. **ファイル作成** - HTML/CSS/JSファイルに分離
4. **index.html更新** - 読み込み追加、元コード削除
5. **動作確認** - 機能が正常動作するかテスト

## ✅ メリット

### 🎯 保守性向上
- タブごとの独立性確保
- 機能追加時の影響範囲限定
- デバッグ・修正作業の効率化

### 🎯 開発効率向上  
- 複数人での並行開発可能
- 機能単位でのテスト・リリース可能
- コードの再利用性向上

### 🎯 ファイル管理向上
- 目的別のファイル整理
- 検索・編集作業の効率化
- バージョン管理の精度向上

---

**重要:** このルールは今後の全てのタブ開発で適用すること