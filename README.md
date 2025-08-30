# 📊 体重管理アプリ

## 🚀 クイックスタート

新規開発者の方は **`docs/`フォルダ** を番号順に読んでください：

1. 📄 **[01_QUICK_START.md](docs/01_QUICK_START.md)** - 5秒で理解する必須ルール
2. 📄 **[02_DEVELOPER_WORKFLOW.md](docs/02_DEVELOPER_WORKFLOW.md)** - 開発ワークフロー
3. 📄 **[03_MANDATORY_REQUIREMENTS.md](docs/03_MANDATORY_REQUIREMENTS.md)** - 絶対遵守事項
4. 📄 **[04_PROJECT_OVERVIEW.md](docs/04_PROJECT_OVERVIEW.md)** - プロジェクト全体像

## 📁 プロジェクト構造

```
weight-management-app/
├── README.md                    # このファイル（エントリーポイント）
├── index.html                   # アプリケーション本体
├── package.json                 # npm設定
│
├── 📁 docs/                     # すべてのドキュメント（番号順に読む）
│   ├── 01_QUICK_START.md       # 最初に読む！
│   ├── 02_DEVELOPER_WORKFLOW.md
│   ├── 03_MANDATORY_REQUIREMENTS.md
│   ├── 04_PROJECT_OVERVIEW.md
│   ├── 05_AI_CHECKLIST.md
│   ├── 06_GITHUB_PAGES_MANUAL.md
│   └── troubleshooting/        # トラブルシューティング
│       ├── mobile-login-safari-issue.md
│       └── INCIDENT_REPORT.md
│
├── 📁 core/                     # ⚠️ 変更禁止（Firebase設定等）
├── 📁 custom/                   # ✅ カスタマイズ可能領域
├── 📁 issues/                   # 未解決問題
├── 📁 handover/                 # 引き継ぎ資料
├── 📁 archive/                  # 古いバージョン（参考のみ）
└── 📁 node_modules/             # npm依存関係

```

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

## 📝 バージョン情報

- **現在のバージョン**: v0.80
- **最終更新**: 2025-08-30
- **ライセンス**: MIT

---

詳細なドキュメントは `docs/` フォルダ内を参照してください。