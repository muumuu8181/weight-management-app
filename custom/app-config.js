// ============================================================
// 🎨 カスタムアプリ設定 - 自由に変更可能
// ============================================================

export const APP_CONFIG = {
    // アプリの基本情報（自由に変更可能）
    name: "体重管理アプリ",
    version: "0.2",
    description: "Firebase + Google認証による個人用体重管理アプリ",
    
    // デフォルト値設定（カスタマイズ可能）
    defaults: {
        weight: 72.0,
        unit: "kg",
        precision: 1 // 小数点以下桁数
    },
    
    // UI設定（カスタマイズ可能）
    ui: {
        theme: {
            primaryColor: "#007bff",
            secondaryColor: "#6c757d",
            successColor: "#28a745",
            backgroundColor: "#f8f9fa"
        },
        
        // 測定タイミングボタン（自由に変更・追加可能）
        timingButtons: [
            { id: "morning", label: "🌅 朝起床後", color: "#ffc107" },
            { id: "toilet", label: "🚽 トイレ後", color: "#17a2b8" },
            { id: "before_bath", label: "🛁 風呂前", color: "#fd7e14" },
            { id: "after_bath", label: "🛀 風呂後", color: "#20c997" },
            { id: "before_meal", label: "🍽️ 食事前", color: "#e83e8c" },
            { id: "after_meal", label: "🍴 食事後", color: "#6f42c1" }
        ],
        
        // キーボードショートカット設定（カスタマイズ可能）
        keyboard: {
            increment: "ArrowUp",      // 体重増加
            decrement: "ArrowDown",    // 体重減少
            save: "Enter",             // データ保存
            step: 0.1                  // 調整単位
        },
        
        // 表示設定
        display: {
            maxHistoryItems: 10,       // 履歴表示件数
            dateFormat: "YYYY-MM-DD",  // 日付形式
            timeFormat: "HH:mm"        // 時刻形式
        }
    },
    
    // データ設定（カスタマイズ可能）
    data: {
        // Firebase Collection名（変更する場合は注意）
        collection: "weights",
        
        // 必須フィールド
        requiredFields: ["weight", "date", "time"],
        
        // オプションフィールド
        optionalFields: ["timing", "memo", "userEmail"]
    }
};

// デバッグ設定（開発時のみ有効にする）
export const DEBUG_CONFIG = {
    enabled: true,  // false にすると全デバッグ機能が無効
    features: {
        console: true,      // コンソール出力
        copyButtons: true,  // コピーボタン
        apiLogs: true,      // API通信ログ
        userActions: true   // ユーザー操作ログ
    }
};