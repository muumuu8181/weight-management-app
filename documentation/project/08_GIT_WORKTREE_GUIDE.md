# 🌳 Git Worktree 完全ガイド

## ⚡ 5秒で分かる概要

**1つのリポジトリで複数の作業ディレクトリを同時に使える機能**
- 同時並行作業が可能
- ブランチ切り替え不要
- 容量は約3倍（.git共有で完全3倍ではない）

---

## 🚀 基本コマンド

### **新規worktree作成**
```bash
# 新しいブランチで作業ディレクトリ作成
git worktree add ../work-feature1 feature1

# 既存ブランチで作業ディレクトリ作成  
git worktree add ../work-main main
```

### **worktree一覧確認**
```bash
git worktree list
# 結果例:
# /path/to/main                    [main]
# /path/to/work-feature1           [feature1]
# /path/to/work-experimental       [experimental]
```

### **worktree削除**
```bash
# ✅ 正しい削除方法
git worktree remove ../work-feature1

# ❌ 危険：直接フォルダ削除は禁止
# rm -rf ../work-feature1  # これはダメ！
```

---

## 🛠️ 4人チーム開発向けセットアップ手順

### **Step 1: 基本セットアップ**

```bash
# 1. メインディレクトリに移動
cd C:\Users\user\Desktop\work\90_cc\20250806\weight-management-app

# 2. 現在の状態確認
git branch -a
git status

# 3. 作業用ディレクトリ作成
mkdir ../worktrees
cd ../worktrees
```

### **Step 2: Worktree作成**

```bash
# メインリポジトリのパス
MAIN_REPO="../weight-management-app"

# 4人の開発者用worktree作成
git worktree add -b feature/weight-optimization ../weight-app-dev1 main
git worktree add -b feature/sleep-tracking ../weight-app-dev2 main  
git worktree add -b feature/ui-improvement ../weight-app-dev3 main
git worktree add -b hotfix/critical-fix ../weight-app-hotfix main

# 共通作業用
git worktree add ../weight-app-develop develop
git worktree add ../weight-app-main main
```

### **Step 3: 作業環境確認**

```bash
# Worktree一覧表示
git worktree list

# 出力例:
# C:/Users/user/Desktop/work/90_cc/20250806/weight-management-app    abc1234 [main]
# C:/Users/user/Desktop/work/90_cc/20250806/weight-app-dev1         def5678 [feature/weight-optimization]
# C:/Users/user/Desktop/work/90_cc/20250806/weight-app-dev2         ghi9012 [feature/sleep-tracking]
# C:/Users/user/Desktop/work/90_cc/20250806/weight-app-dev3         jkl3456 [feature/ui-improvement]
```

---

## 👥 チーム作業分担

### **推奨ディレクトリ構成**

```
📁 90_cc/20250806/
├── 📁 weight-management-app/     # 🏠 メインリポジトリ（管理者用）
├── 📁 weight-app-main/           # 📋 リリース確認用
├── 📁 weight-app-develop/        # 🧪 統合テスト用
├── 📁 weight-app-dev1/          # 👤 開発者A: 体重最適化
├── 📁 weight-app-dev2/          # 👤 開発者B: 睡眠追跡
├── 📁 weight-app-dev3/          # 👤 開発者C: UI改善
└── 📁 weight-app-hotfix/        # 🚨 緊急修正用
```

### **開発者別の役割**

| 担当者 | ディレクトリ | ブランチ | 担当領域 |
|--------|-------------|----------|----------|
| 👤 **開発者A** | `weight-app-dev1/` | `feature/weight-optimization` | タブ1: 体重管理機能 |
| 👤 **開発者B** | `weight-app-dev2/` | `feature/sleep-tracking` | タブ2: 睡眠管理機能 | 
| 👤 **開発者C** | `weight-app-dev3/` | `feature/ui-improvement` | UI/UX、共通コンポーネント |
| 👤 **統合担当** | `weight-app-develop/` | `develop` | マージ・テスト・デプロイ |

---

## 🚨 **重要な注意点・デメリット**

### **1. 容量問題**
```
元のプロジェクト:     200MB
+ worktree1:        +180MB (共有.git分差し引き)
+ worktree2:        +180MB
= 合計:             560MB (約3倍弱)
```

**💡 この体重管理アプリなら**:
- 現在サイズ: ~200MB
- 3つのworktreeでも ~500MB程度
- **実用的な範囲内** ✅

### **2. 混乱しやすいポイント**

#### **🧭 現在地迷子問題**
```bash
# 😵 どこにいるかわからなくなりがち
pwd                    # 常に確認する癖をつける
git branch            # 現在のブランチ確認
git worktree list     # 全worktree確認
```

#### **📂 ディレクトリ構造例**
```
project/
├── weight-management-app/     # メイン作業ディレクトリ
├── work-tab-refactor/        # タブリファクタリング用
├── work-ui-improvement/      # UI改善用
└── work-experimental/        # 実験用
```

### **3. 共有リソースの競合リスク**

#### **🚫 危険な操作**
```bash
# 同じファイルを複数worktreeで同時編集
work1/tabs/tab1-weight/tab-weight.js  ← 編集中
work2/tabs/tab1-weight/tab-weight.js  ← 同時編集 (危険!)
```

#### **🚫 全worktree共有される要素**
```bash
git stash         # 全worktreeで共有 → 混乱の元
git config        # 設定も共有
.gitignore        # 無視設定も共有
```

### **4. IDE・ツールの混乱**

#### **VSCode等での問題**
- **設定ファイル競合**: `.vscode/settings.json`
- **キャッシュ混乱**: 複数プロジェクト認識
- **デバッガー混乱**: どのworktreeをデバッグ中か不明

#### **Node.js/npm問題**
```bash
# node_modulesは各worktree独立
work1/node_modules/  # 独立
work2/node_modules/  # 独立 (重複でサイズ増加)
```

---

## 🔄 日常的な作業フロー

### **開発者の作業例（開発者A）**

```bash
# 1. 自分の作業ディレクトリに移動
cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-dev1

# 2. ブランチ確認
git branch    # → feature/weight-optimization

# 3. 最新情報取得
git fetch origin
git pull origin feature/weight-optimization

# 4. 開発作業
# index.html、tabs/tab1-weight/ を編集...

# 5. テスト実行
npm test

# 6. コミット
git add .
git commit -m "feat: 体重入力UIを改善"

# 7. プッシュ
git push origin feature/weight-optimization
```

### **統合担当者の作業例**

```bash
# 1. 統合ディレクトリに移動  
cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-develop

# 2. 各開発者のブランチをマージ
git fetch origin
git merge origin/feature/weight-optimization
git merge origin/feature/sleep-tracking  
git merge origin/feature/ui-improvement

# 3. 統合テスト実行
npm run test:all

# 4. 問題なければdevelopにプッシュ
git push origin develop

# 5. リリース準備（mainブランチ用ディレクトリに移動）
cd ../weight-app-main
git merge origin/develop
git push origin main  # → 自動デプロイ実行
```

---

## 🛡️ **安全運用ルール**

### **🔥 作業前必須確認**
```bash
# 毎回実行する安全確認
pwd && git branch && echo "--- 現在の状況確認 ---"
git worktree list
```

### **⚖️ 責務分離原則**
| Worktree | 担当範囲 | 例 |
|----------|----------|-----|
| **main** | 安定版保守 | バグ修正・緊急対応 |
| **feature1** | 新機能開発 | 新タブ追加・大機能 |
| **experiment** | 実験・検証 | アーキテクチャ変更・POC |

### **🧹 定期メンテナンス**
```bash
# 週1回実行推奨
git worktree list                    # 現状確認
git worktree prune                   # 不要worktree自動削除
```

---

## 🎯 **体重管理アプリでの活用例**

### **💡 推奨構成**
```bash
# メイン作業
weight-management-app/           # v2.48 安定版
├── tabs/                       # 日常の修正・改善
├── shared/                     # 共通機能保守
└── documentation/              # ドキュメント更新

# 大機能開発用
../work-smart-effects/          # エフェクト機能拡張
└── shared/effects/            # 新エフェクト実装

# 実験用  
../work-ui-redesign/           # UI大改修実験
└── tabs/                     # 新デザイン試行
```

### **🔄 作業フロー例**
```bash
# 1. 新機能開発開始
cd weight-management-app
git worktree add ../work-new-feature feature-branch

# 2. 新機能開発
cd ../work-new-feature
# 開発作業...

# 3. メイン作業に戻る
cd ../weight-management-app
# バグ修正等...

# 4. 新機能完成・マージ
cd ../work-new-feature
git push origin feature-branch
# PR作成・マージ

# 5. worktree削除
cd ../weight-management-app
git worktree remove ../work-new-feature
```

---

## ⚠️ **追加注意事項**

### **🔒 セキュリティ面**
```bash
# API Key等の機密情報
# 各worktreeで独立管理が必要
work1/.env.local     # 独立
work2/.env.local     # 独立 (同じ内容でも別ファイル)
```

### **🗄️ Firebase設定**
```javascript
// 同じFirebase設定を複数worktreeで使用
// → 同じユーザーデータにアクセス
// → テスト時は注意（データ競合可能性）
```

### **📦 package.json依存関係**
```bash
# npm install は各worktreeで実行必要
cd work1 && npm install    # 必須
cd work2 && npm install    # 必須
```

### **🧪 テスト実行時の注意**
```bash
# テスト結果ファイルが重複
work1/jsdom-test-report-*.html
work2/jsdom-test-report-*.html
# → 結果ファイル管理に注意
```

### **⚠️ ストレージ容量管理**

```bash
# 🧹 不要なworktree削除
git worktree remove ../weight-app-dev1
git worktree prune

# 📊 容量確認  
du -sh ../weight-app-*/
```

### **⚠️ 同期問題回避**

```bash
# 🔄 定期的な同期（全worktreeで実行）
git fetch origin

# ⚠️ stashは共有されるので注意
git stash list  # 全worktreeで共通
```

---

## 🚀 効率的な運用テクニック

### **VSCode対応**

```bash
# 複数ウィンドウで同時開発
code C:\Users\user\Desktop\work\90_cc\20250806\weight-app-dev1
code C:\Users\user\Desktop\work\90_cc\20250806\weight-app-dev2
code C:\Users\user\Desktop\work\90_cc\20250806\weight-app-develop
```

### **エイリアス設定**

```bash
# .bashrc または PowerShell Profile に追加
alias cdmain='cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-main'
alias cddev1='cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-dev1'
alias cddev2='cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-dev2'
alias cddevelop='cd C:\Users\user\Desktop\work\90_cc\20250806\weight-app-develop'
```

### **バッチスクリプト例**

```batch
@echo off
REM setup-worktrees.bat
echo 🌿 Git Worktree セットアップ開始...

cd /d "C:\Users\user\Desktop\work\90_cc\20250806\weight-management-app"

echo 📁 開発者A用worktree作成中...
git worktree add -b feature/weight-optimization ../weight-app-dev1 main

echo 📁 開発者B用worktree作成中...  
git worktree add -b feature/sleep-tracking ../weight-app-dev2 main

echo 📁 開発者C用worktree作成中...
git worktree add -b feature/ui-improvement ../weight-app-dev3 main

echo 📁 統合用worktree作成中...
git worktree add ../weight-app-develop develop

echo ✅ セットアップ完了！
git worktree list
pause
```

---

## 💡 **Pro Tips**

### **🎯 効率的な使い分け**

#### **Main Worktree**: 日常作業
```bash
# 小修正・バグ修正・緊急対応
- バージョンアップ
- Smart Effects微調整  
- ドキュメント更新
```

#### **Feature Worktree**: 大機能開発
```bash
# 新タブ追加・大規模リファクタリング
- 新しいタブ実装
- 共通機能大幅変更
- アーキテクチャ改善
```

#### **Experimental Worktree**: 検証・実験
```bash
# リスクの高い変更・POC
- UIフレームワーク導入
- パフォーマンス改善実験
- 新技術検証
```

### **🔧 設定の最適化**

#### **gitignore設定**
```gitignore
# worktree特有の除外
**/work-*/node_modules/
**/work-*/tools/reports/
**/work-*/.env.local
```

#### **IDE設定**
```json
// .vscode/settings.json
{
  "files.exclude": {
    "**/work-*": false  // worktreeを表示
  }
}
```

---

## 🎮 **実践演習**

### **🧪 テスト運用**

#### **ステップ1: 実験worktree作成**
```bash
git worktree add ../work-test test-branch
cd ../work-test
npm install
npm test  # 動作確認
```

#### **ステップ2: 並行作業体験**
```bash
# Terminal 1: メイン作業
cd weight-management-app
# 日常的な修正作業

# Terminal 2: 実験作業
cd ../work-test  
# 新機能開発・実験
```

#### **ステップ3: 安全削除**
```bash
cd weight-management-app
git worktree remove ../work-test
```

---

## 📊 **費用対効果分析**

### **✅ メリット**
| 項目 | 効果 | 重要度 |
|------|------|--------|
| **並行作業** | 複数機能を同時開発 | 🔥🔥🔥🔥🔥 |
| **ブランチ切替なし** | 作業中断なし | 🔥🔥🔥🔥 |
| **安全な実験** | メイン環境に影響なし | 🔥🔥🔥🔥 |

### **❌ デメリット**
| 項目 | 影響 | 対策 |
|------|------|------|
| **容量3倍** | ディスク使用量 | 🔧 定期削除・SSD使用 |
| **管理複雑化** | 混乱リスク | 🧭 命名規則・確認癖 |
| **ツール対応** | IDE混乱 | ⚙️ 設定調整 |

### **パフォーマンス比較**

| 作業方式 | セットアップ | 切り替え時間 | 同時作業 | ディスク使用量 |
|----------|-------------|-------------|----------|---------------|
| **従来ブランチ** | 1分 | 10-30秒 | ❌ | 1x |
| **Worktree** | 5分 | 0秒 | ✅ | 3-4x |

---

## 🔧 トラブルシューティング

### **よくある問題**

1. **"already exists" エラー**
   ```bash
   git worktree remove ../weight-app-dev1
   git worktree add -b feature/new-name ../weight-app-dev1 main
   ```

2. **ブランチが見つからない**
   ```bash
   git fetch origin
   git branch -a  # リモートブランチ確認
   ```

3. **容量不足**
   ```bash
   # 不要なworktree削除
   git worktree list
   git worktree remove [不要なパス]
   git worktree prune
   ```

---

## 🎯 **推奨判断**

### **🟢 Git Worktree推奨ケース**
- **大規模リファクタリング**: 安全な実験環境
- **長期機能開発**: メイン作業と並行
- **複数人開発**: 機能別分離

### **🟡 慎重検討ケース**  
- **ディスク容量制限**: 500GB以下のPC
- **初心者**: Git操作に慣れていない
- **単純作業**: ブランチ切り替えで十分

### **🔴 非推奨ケース**
- **短期作業**: 数時間で完了する修正
- **同一ファイル**: 同じファイルを複数人で編集
- **学習コスト**: 追加学習時間が取れない

---

## 📋 **チェックリスト**

### **🔍 運用開始前**
- [ ] ディスク容量確認（3倍弱必要）
- [ ] バックアップ作成
- [ ] チーム内運用ルール共有

### **📅 日常運用**
- [ ] `pwd && git branch` 毎回確認
- [ ] 作業開始時に`git worktree list`
- [ ] 1worktree = 1機能の原則遵守

### **🧹 定期メンテナンス**  
- [ ] 週1回: `git worktree prune`
- [ ] 月1回: 不要worktree削除
- [ ] 四半期: 運用ルール見直し

---

## 📈 今後の拡張

### **自動化スクリプト**
- Worktree一括作成スクリプト
- 同期確認スクリプト  
- クリーンアップスクリプト

### **チーム管理**
- 作業状況共有ダッシュボード
- ブランチ命名規則自動チェック
- マージ競合検出システム

---

## 🎉 **結論**

**体重管理アプリの規模・チーム構成なら Git Worktree は有効！**

### **特に有効なシナリオ**
1. **Smart Effects拡張** と **新タブ追加** を並行
2. **リファクタリング実験** と **バグ修正** を分離  
3. **UI改善** と **機能追加** を同時進行

### **🎯 Worktreeのメリット**
- **並行作業可能**: 複数ブランチを同時編集
- **作業継続性**: ブランチ切り替えなしで作業継続
- **実験環境確保**: メイン環境を汚さない

**🌿 Worktreeを活用して、4人チームでの効率的な並行開発を実現しましょう！**

---

**📌 このガイドは `documentation/project/08_GIT_WORKTREE_GUIDE.md` として保存し、今後のリファレンスとして活用してください。**