# 📊 体重管理アプリ v0.2 - Core/Custom分離版

Firebase + Google認証による個人用体重管理アプリです。**Core/Custom分離構造**により、安全で効率的なカスタマイズが可能になりました。

## 🌟 主要機能

### 📊 基本機能
- **体重記録**: 日付・時刻・体重・測定タイミング・メモを記録
- **🔐 Google認証**: 安全なGoogle OAuth認証システム
- **🔄 リアルタイム同期**: Firebase Realtime Databaseによるデバイス間同期
- **⌨️ キーボード操作**: ↑↓キーで0.1kg単位の調整
- **📈 履歴表示**: 時系列での体重履歴確認

### 🎨 Core/Custom分離構造 (v0.2の新機能)
- **🚫 Core フォルダ**: 触ってはいけない安全領域（Firebase設定・GitHub Actions等）
- **✅ Custom フォルダ**: 自由にカスタマイズ可能（色・ボタン・動作設定）
- **🔧 簡単変更**: 他のアプリ（食事記録・運動記録等）への転用が容易
- **🛡️ 安全性**: 誤った変更による動作不良を防止

### 🔘 測定タイミング（カスタマイズ可能）
- 🌅 朝起床後
- 🚽 トイレ後  
- 🛁 風呂前
- 🛀 風呂後
- 🍽️ 食事前/後

## 🚀 使用方法

### ライブデモ
**https://muumuu8181.github.io/weight-management-app/**

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

4. 体重を入力して保存

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
          "weight": 72.5,
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

## 📁 プロジェクト構造

詳細は `STRUCTURE.md` を参照してください。

```
├── core/          # 🚫 触ってはいけない（Firebase・GitHub Actions等）
├── custom/        # ✅ 自由にカスタマイズ可能（設定・スタイル）
├── index.html     # メインアプリファイル
└── README.md      # このファイル
```

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

**🚀 GitHub Pages**: https://muumuu8181.github.io/weight-management-app/