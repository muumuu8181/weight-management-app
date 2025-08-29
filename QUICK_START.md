# 🚀 クイックスタート - 5秒で理解する必須ルール

## ⚡ 修正作業の絶対ルール（これだけ守れば大丈夫）

```bash
# 1. 最新を取得
git pull

# 2. 修正実装
# ⚠️ core/フォルダは絶対触らない

# 3. バージョン更新（必須！）
# index.html の APP_VERSION を +0.01
# 例: v0.77 → v0.78

# 4. コミット＆プッシュ（必須！）
git add .
git commit -m "fix: 修正内容 (vX.XX)"
git push origin main

# 5. 2分待って確認
# https://muumuu8181.github.io/weight-management-app/
```

## ❌ これをやったら即アウト
1. **core/フォルダを変更** → プロジェクト差し戻し
2. **バージョン更新忘れ** → 動作しない
3. **git push忘れ** → 反映されない

## ✅ 困ったら
- **詳細ルール**: [AI_CHECKLIST.md](AI_CHECKLIST.md)
- **プロジェクト構造**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **必須要件**: [MANDATORY_REQUIREMENTS.md](MANDATORY_REQUIREMENTS.md)

---
**これだけ読めば作業開始できます。他の文書は必要時のみ。**