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

## 🎉 **結論**

**体重管理アプリの規模・チーム構成なら Git Worktree は有効！**

### **特に有効なシナリオ**
1. **Smart Effects拡張** と **新タブ追加** を並行
2. **リファクタリング実験** と **バグ修正** を分離  
3. **UI改善** と **機能追加** を同時進行

**あなたの理解は完璧です。導入価値は十分にあります！** 🌟

---

**📌 このガイドは `documentation/project/08_GIT_WORKTREE_GUIDE.md` として保存し、今後のリファレンスとして活用してください。**