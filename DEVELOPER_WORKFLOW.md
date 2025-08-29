# 🔧 開発者向けワークフロー

## 📋 機能追加時の必須手順

### 1. 機能実装後の作業チェックリスト
- [ ] 機能テスト完了
- [ ] バージョンアップ（0.01刻み）
- [ ] GitHub Pages自動デプロイ
- [ ] 動作確認

### 2. バージョンアップ手順
```bash
# index.htmlのAPP_VERSIONを更新
const APP_VERSION = 'v0.XX';

# 変更をコミット・プッシュ
git add .
git commit -m "feat: 機能説明 (vX.XX)"
git push origin main
```

### 3. 重要ドキュメント
- **PROJECT_HANDOVER.md**: プロジェクト全体方針
- **GITHUB_PAGES_MANUAL.md**: デプロイ手順詳細

## ⚠️ 重要な注意点
**機能実装完了 ≠ 作業完了**
必ずバージョンアップとデプロイまで実施すること！