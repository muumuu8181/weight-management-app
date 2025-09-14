"""
ログイン後の体重グラフ確認
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

def check_after_login():
    driver = webdriver.Chrome()
    
    try:
        print("📊 アプリケーションを開いています...")
        driver.get("http://localhost:8080")
        time.sleep(3)
        
        # Googleログインボタンをクリック
        print("\n🔐 ログイン処理...")
        try:
            login_btn = driver.find_element(By.XPATH, "//button[contains(., 'Google')]")
            login_btn.click()
            print("✅ Googleログインボタンをクリック")
            
            # 新しいウィンドウが開く場合の処理
            time.sleep(2)
            windows = driver.window_handles
            if len(windows) > 1:
                print("ℹ️ ログインウィンドウが開きました")
                # メインウィンドウに戻る
                driver.switch_to.window(windows[0])
        except:
            print("⚠️ ログインボタンが見つかりません")
        
        # ログイン後の画面を待つ
        print("\n⏳ ログイン処理を待機中...")
        print("ℹ️ 手動でGoogleログインを完了してください")
        print("ℹ️ ログイン完了後、Enterキーを押してください...")
        input()
        
        # タブボタンを探す
        print("\n🔍 タブボタンを探しています...")
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for btn in buttons:
            text = btn.text
            if text:
                print(f"  - ボタン: '{text}'")
        
        # JavaScriptでタブ表示
        print("\n📊 体重タブを表示...")
        driver.execute_script("showTab(1)")
        time.sleep(2)
        
        # WeightTabオブジェクトの確認
        js_check = """
        return {
            hasWeightTab: typeof window.WeightTab !== 'undefined',
            hasChart: window.WeightTab && window.WeightTab.weightChart ? true : false,
            allData: window.WeightTab && window.WeightTab.allWeightData ? window.WeightTab.allWeightData.length : 0
        };
        """
        state = driver.execute_script(js_check)
        print(f"\n🔧 JavaScript状態:")
        print(f"  WeightTab: {state['hasWeightTab']}")
        print(f"  Chart: {state['hasChart']}")
        print(f"  データ数: {state['allData']}")
        
        # グラフ更新を実行
        print("\n📊 グラフ更新を実行...")
        driver.execute_script("updateChart(30)")
        time.sleep(2)
        
        # データセット確認
        datasets_script = """
        if (window.WeightTab && window.WeightTab.weightChart) {
            return window.WeightTab.weightChart.data.datasets.map(ds => ({
                label: ds.label,
                dataCount: ds.data.length,
                borderDash: ds.borderDash || []
            }));
        }
        return null;
        """
        datasets = driver.execute_script(datasets_script)
        
        if datasets:
            print(f"\n📊 データセット情報:")
            for ds in datasets:
                dash = " (破線)" if ds['borderDash'] else ""
                print(f"  - {ds['label']}: {ds['dataCount']}件{dash}")
        
        # 各期間をテスト
        periods = [1, 7, 30, 90, 365, 0]
        for days in periods:
            print(f"\n🔄 {days}日表示をテスト...")
            driver.execute_script(f"updateChart({days})")
            time.sleep(1)
            
            datasets = driver.execute_script(datasets_script)
            if datasets:
                print(f"  データセット数: {len(datasets)}")
                for ds in datasets:
                    print(f"    - {ds['label']}: {ds['dataCount']}件")
        
        # スクリーンショット
        driver.save_screenshot("weight_graph_after_login.png")
        print("\n📸 スクリーンショット保存: weight_graph_after_login.png")
        
        input("\n⏸️ Enterキーを押すと終了します...")
        
    except Exception as e:
        print(f"\n❌ エラー: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()

if __name__ == "__main__":
    check_after_login()