"""
体重グラフの直接確認（JavaScriptで直接実行）
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

def quick_check():
    driver = webdriver.Chrome()
    
    try:
        print("📊 アプリケーションを開いています...")
        driver.get("http://localhost:8080/index.html")
        time.sleep(3)
        
        # デバッグ用：JavaScriptでログイン状態をシミュレート
        print("\n🔧 ログイン状態をシミュレート...")
        driver.execute_script("""
            // ログイン状態をシミュレート
            window.currentUser = {email: 'test@example.com', uid: 'test123'};
            
            // タブボタンを表示
            document.querySelector('.auth-modal').style.display = 'none';
            document.querySelector('.main-container').style.display = 'block';
            
            // タブシステムを初期化
            if (typeof initializeTabs === 'function') {
                initializeTabs();
            }
        """)
        time.sleep(2)
        
        # 体重タブを表示
        print("\n📊 体重タブを表示...")
        driver.execute_script("showTab(1)")
        time.sleep(2)
        
        # 体重タブの初期化を強制実行
        print("\n🔧 体重タブを初期化...")
        driver.execute_script("""
            if (typeof initWeightTab === 'function') {
                initWeightTab();
            }
        """)
        time.sleep(2)
        
        # テストデータを挿入
        print("\n📊 テストデータを挿入...")
        driver.execute_script("""
            // テストデータを作成
            window.WeightTab = window.WeightTab || {};
            window.WeightTab.allWeightData = [
                {date: '2025-01-10', time: '08:00', value: 72.5},
                {date: '2025-01-10', time: '20:00', value: 73.2},
                {date: '2025-01-11', time: '08:00', value: 72.8},
                {date: '2025-01-11', time: '20:00', value: 73.5},
                {date: '2025-01-12', time: '08:00', value: 72.3},
                {date: '2025-01-12', time: '12:00', value: 72.9},
                {date: '2025-01-12', time: '20:00', value: 73.1},
                {date: '2025-01-13', time: '08:00', value: 72.0},
                {date: '2025-01-14', time: '08:00', value: 72.2}
            ];
        """)
        
        # updateChart関数を直接テスト
        print("\n📊 各期間でグラフをテスト...")
        
        periods = [
            (1, "1日"),
            (7, "1週間"),
            (30, "1ヶ月"),
            (90, "3ヶ月"),
            (365, "1年"),
            (0, "全期間")
        ]
        
        for days, name in periods:
            print(f"\n🔄 {name}表示をテスト...")
            
            # updateChartを実行
            driver.execute_script(f"updateChart({days})")
            time.sleep(1)
            
            # グラフの状態を確認
            result = driver.execute_script("""
                if (window.WeightTab && window.WeightTab.weightChart) {
                    const datasets = window.WeightTab.weightChart.data.datasets;
                    return {
                        exists: true,
                        datasetCount: datasets.length,
                        datasets: datasets.map(ds => ({
                            label: ds.label,
                            dataCount: ds.data.length,
                            borderDash: ds.borderDash || null
                        }))
                    };
                } else {
                    return {exists: false};
                }
            """)
            
            if result['exists']:
                print(f"  ✅ グラフ存在: データセット数 = {result['datasetCount']}")
                for ds in result['datasets']:
                    dash = " (破線)" if ds['borderDash'] else ""
                    print(f"     - {ds['label']}: {ds['dataCount']}件{dash}")
            else:
                print("  ❌ グラフが存在しません")
        
        # コンソールログを確認
        print("\n📋 コンソールログ:")
        logs = driver.get_log('browser')
        for log in logs[-10:]:  # 最後の10件
            if 'グラフ' in log['message'] or 'Chart' in log['message']:
                print(f"  {log['message']}")
        
        # スクリーンショット
        driver.save_screenshot("weight_graph_test_result.png")
        print("\n📸 スクリーンショット保存: weight_graph_test_result.png")
        
        # 10秒待機
        print("\n⏳ 10秒後に自動で閉じます...")
        time.sleep(10)
        
    except Exception as e:
        print(f"\n❌ エラー: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()

if __name__ == "__main__":
    quick_check()