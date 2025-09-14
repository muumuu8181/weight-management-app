"""
GitHub Pagesで公開されたアプリをテスト
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("=== GitHub Pages 体重グラフテスト ===\n")
    
    # コンソールログを有効化
    caps = DesiredCapabilities.CHROME
    caps['goog:loggingPrefs'] = {'browser': 'ALL'}
    
    options = webdriver.ChromeOptions()
    options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    driver = webdriver.Chrome(options=options)
    
    try:
        print("📊 GitHub Pagesを開いています...")
        driver.get("https://muumuu8181.github.io/weight-management-app/")
        driver.maximize_window()
        time.sleep(3)
        
        # ページが読み込まれたか確認
        print(f"📄 ページタイトル: {driver.title}")
        
        # Googleログイン
        print("\n🔐 Googleログインボタンを探しています...")
        try:
            # 複数のセレクタを試す
            login_btn = None
            selectors = [
                "//button[contains(., 'Google')]",
                "//button[contains(text(), 'ログイン')]",
                "//button[@class='auth-button']"
            ]
            
            for selector in selectors:
                try:
                    login_btn = driver.find_element(By.XPATH, selector)
                    if login_btn:
                        print(f"✅ ログインボタン発見: {selector}")
                        break
                except:
                    continue
            
            if login_btn:
                login_btn.click()
                print("✅ Googleログインボタンをクリック")
                time.sleep(3)
                
                # 新しいウィンドウが開いた場合の処理
                windows = driver.window_handles
                if len(windows) > 1:
                    print(f"📱 ウィンドウ数: {len(windows)}")
                    # Googleログインウィンドウに切り替え
                    driver.switch_to.window(windows[1])
                    print("🔄 Googleログインウィンドウに切り替え")
                    time.sleep(2)
                    
                    # ログインウィンドウのURLを確認
                    print(f"🌐 ログインURL: {driver.current_url[:50]}...")
                    
                    # メインウィンドウに戻る
                    driver.switch_to.window(windows[0])
                    print("🔄 メインウィンドウに戻りました")
        except Exception as e:
            print(f"⚠️ ログインボタンが見つかりません: {str(e)}")
        
        # 手動ログインを待つ
        print("\n⏳ 手動でGoogleログインを完了してください（30秒待機）...")
        print("   ログイン後、体重タブが表示されるまでお待ちください...")
        
        for i in range(30, 0, -5):
            print(f"   残り {i} 秒...")
            time.sleep(5)
            
            # ログイン状態を確認
            login_status = driver.execute_script("""
                return {
                    currentUser: window.currentUser ? true : false,
                    tabVisible: document.getElementById('tab1') ? true : false
                };
            """)
            
            if login_status['currentUser']:
                print("✅ ログイン確認！")
                break
        
        # 体重タブに切り替え
        print("\n📊 体重タブに切り替えています...")
        tab_result = driver.execute_script("""
            if (typeof showTab === 'function') {
                showTab(1);
                return true;
            } else {
                // タブボタンを直接クリック
                const tabBtn = document.getElementById('tab1');
                if (tabBtn) {
                    tabBtn.click();
                    return true;
                }
                return false;
            }
        """)
        
        if tab_result:
            print("✅ 体重タブに切り替えました")
        else:
            print("❌ 体重タブへの切り替えに失敗")
        
        time.sleep(3)
        
        # データの状態を確認
        print("\n📊 データ状態を確認...")
        data_info = driver.execute_script("""
            if (window.WeightTab && window.WeightTab.allWeightData) {
                return {
                    exists: true,
                    count: window.WeightTab.allWeightData.length,
                    hasChart: window.WeightTab.weightChart ? true : false
                };
            }
            return {exists: false};
        """)
        
        print(f"  WeightTabオブジェクト: {data_info.get('exists', False)}")
        print(f"  データ数: {data_info.get('count', 0)}件")
        print(f"  グラフ存在: {data_info.get('hasChart', False)}")
        
        # 各期間でテスト
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
            update_result = driver.execute_script(f"""
                if (typeof updateChart === 'function') {{
                    updateChart({days});
                    return true;
                }}
                return false;
            """)
            
            if not update_result:
                print("  ❌ updateChart関数が見つかりません")
                continue
            
            time.sleep(2)
            
            # グラフの状態を確認
            chart_info = driver.execute_script("""
                if (window.WeightTab && window.WeightTab.weightChart) {
                    const datasets = window.WeightTab.weightChart.data.datasets;
                    return {
                        exists: true,
                        datasetCount: datasets.length,
                        datasets: datasets.map(ds => ({
                            label: ds.label,
                            dataCount: ds.data.length,
                            hasDash: ds.borderDash ? true : false
                        }))
                    };
                }
                return {exists: false};
            """)
            
            if chart_info['exists']:
                print(f"  ✅ グラフ表示成功")
                print(f"  データセット数: {chart_info['datasetCount']}")
                for ds in chart_info['datasets']:
                    dash = " (破線)" if ds['hasDash'] else ""
                    print(f"    - {ds['label']}: {ds['dataCount']}件{dash}")
            else:
                print("  ❌ グラフが表示されていません")
            
            # コンソールログを確認
            logs = driver.get_log('browser')
            has_debug_logs = False
            for log in logs[-10:]:
                if '🔴' in log['message']:
                    has_debug_logs = True
                    print(f"  [LOG] {log['message']}")
            
            if has_debug_logs:
                print("  ✅ 修正版のデバッグログを確認！")
            
            # 1週間表示でスクリーンショット
            if days == 7:
                driver.save_screenshot("github_pages_test_1week.png")
                print("  📸 スクリーンショット保存: github_pages_test_1week.png")
        
        # 最大値・最小値の表示を確認
        print("\n📊 最大値・最小値表示の確認...")
        final_check = driver.execute_script("""
            if (window.WeightTab && window.WeightTab.weightChart) {
                const datasets = window.WeightTab.weightChart.data.datasets;
                const hasMax = datasets.some(ds => ds.label === '最大値');
                const hasMin = datasets.some(ds => ds.label === '最小値');
                const hasAvg = datasets.some(ds => ds.label === '平均値');
                
                return {
                    hasMaxMin: hasMax && hasMin,
                    hasAvg: hasAvg,
                    details: datasets.map(ds => ds.label)
                };
            }
            return null;
        """)
        
        if final_check:
            print(f"  平均値表示: {'✅' if final_check['hasAvg'] else '❌'}")
            print(f"  最大値・最小値表示: {'✅' if final_check['hasMaxMin'] else '❌'}")
            print(f"  全データセット: {final_check['details']}")
        
        print("\n✅ テスト完了！")
        print("\n⏳ 20秒後に自動で閉じます...")
        time.sleep(20)
        
    except Exception as e:
        print(f"\n❌ エラー: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()
        print("\n✅ ブラウザを閉じました")

if __name__ == "__main__":
    main()