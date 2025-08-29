# 🔧 新人開発者向け - 緊急引き継ぎ文書

## 📂 作業フォルダ（フルパス）
```
/mnt/c/Users/user/Desktop/work/90_cc/20250806/weight-management-app
```

**Windowsパス**: `C:\Users\user\Desktop\work\90_cc\20250806\weight-management-app`  
**WSLパス**: `/mnt/c/Users/user/Desktop/work/90_cc/20250806/weight-management-app`

### 📁 重要なファイル構造
```
/mnt/c/Users/user/Desktop/work/90_cc/20250806/weight-management-app/
├── index.html                    # メインアプリファイル
├── README.md                     # プロジェクトハブ（要ハブ化）
├── NEW_DEVELOPER_HANDOFF.md      # この引き継ぎ文書
├── DEVELOPER_WORKFLOW.md         # 開発ワークフロー
├── PROJECT_HANDOVER.md           # プロジェクト引き継ぎ
├── GITHUB_PAGES_MANUAL.md        # GitHub Pages手順
├── core/                         # 🚨触ってはいけない領域
├── custom/                       # カスタマイズ可能領域
├── tabs/                         # タブ別機能
└── .github/workflows/            # 🚨自動デプロイ設定
```

## 🎯 現在の状況
- **アプリ**: 体重管理アプリ（8タブ構成）
- **現在バージョン**: v0.73.1
- **最新追加機能**: タブ8「メモリスト」機能
- **公開URL**: https://muumuu8181.github.io/weight-management-app/

## 🚨 緊急対応が必要な問題

### 📝 メモリスト機能のFirebase連携不具合
**症状**: ページリロード時にメモが消える（体重データは残る）  
**原因**: Firebase Realtime Database連携が不完全  
**影響**: ユーザーのメモが保存されない  

## 📋 ドキュメント整理タスク（13個のmd文書を整理）

### 🎯 目標: AI向けハブ構造の確立
```
README.md（ハブ）
├── 🥇 Level 1: PROJECT_OVERVIEW.md（新規作成）
├── 🥈 Level 2: AI_CHECKLIST.md（新規作成）  
├── 🥉 Level 3: 重要ドキュメント3個
└── 📚 Level 4: その他ドキュメント
```

### 📊 現在の13個の文書一覧
1. DEVELOPER_WORKFLOW.md（作成済み）
2. GITHUB_PAGES_MANUAL.md
3. PROJECT_HANDOVER.md
4. PROJECT_HANDOVER_v0.66.md
5. KNOWLEDGE_VERIFICATION_*.md（複数バージョン）
6. INCIDENT_REPORT.md
7. MOBILE_LOGIN_TROUBLESHOOTING_HISTORY.md
8. GITHUB_PAGES_DEPLOYMENT_REFLECTION.md
9. MANDATORY_REQUIREMENTS.md
10. README.md
11. handover/（フォルダ内に複数テンプレート）
12. answers/（フォルダ内に複数回答）
13. issues/（フォルダ内に複数課題）

## 🔧 作業手順

### 📋 Step 1: ドキュメント分析・分類
1. **古いドキュメントの特定**
   - `*v0.66.md` → 古いバージョン
   - 重複内容のマージ対象を特定

2. **優先順位付け**
   - 🥇 必須（初期設定）
   - 🥈 重要（恒常作業）  
   - 🥉 推奨（参考情報）
   - 📚 アーカイブ（保管）

### 📋 Step 2: 新規ドキュメント作成
1. **PROJECT_OVERVIEW.md**
   ```
   - フォルダ構造説明
   - 絶対に触ってはいけない場所（core/フォルダ等）
   - 基本コンセプト
   ```

2. **AI_CHECKLIST.md**  
   ```
   - 機能追加後の必須チェックリスト
   - バージョンアップ手順（+0.01刻み）
   - GitHub Pages自動デプロイ手順
   ```

3. **STATUS.json**（状態管理）
   ```json
   {
     "current_version": "v0.73.1",
     "last_update": "2025-08-29",
     "active_features": ["weight", "sleep", "memo"],
     "known_issues": ["memo firebase sync"]
   }
   ```

### 📋 Step 3: README.mdハブ化
- 各ドキュメントへの適切なリンク設置
- 優先順位別のナビゲーション構造
- AI向け特別配慮の追加

## ⚠️ 重要な注意点

### 🚨 絶対に触ってはいけない領域
- `core/` フォルダ（Firebase設定等）
- `.github/workflows/` （自動デプロイ設定）
- 既存機能のコア部分

### 📏 作業基準
- **バージョン管理**: 必ず0.01刻みで更新
- **デプロイ**: 変更後は必ずGitHub Pagesに反映
- **テスト**: 本番環境での動作確認必須

### 🤖 AI向け特別配慮
- 構造化データ（チェックリスト、JSON）重視
- 「なぜ重要か」の明記
- 判断基準の具体的記載
- 🚨⚠️💡📖等の視覚的優先度表示

## 📞 引き継ぎ完了の目安
- [ ] 13個の文書を4レベルに分類完了
- [ ] PROJECT_OVERVIEW.md、AI_CHECKLIST.md作成完了  
- [ ] README.mdハブ化完了
- [ ] 古い文書の整理・アーカイブ完了
- [ ] 新人がREADME.md読むだけで作業開始できる状態

## 🎯 成果物
**「README.md一つ読めば、AIが迷わず開発作業できる」状態**

---
*作成者: Claude* | *引き継ぎ日: 2025-08-29* | *緊急度: 中（アプリ修正後）*