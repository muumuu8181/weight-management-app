"""
体重グラフの動作確認スクリプト
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json
import sys

# UTF-8エンコーディングを設定
sys.stdout.reconfigure(encoding='utf-8')

def check_weight_graph():
    # ChromeDriverを起動
    driver = webdriver.Chrome()
    
    try:
        print("📊 体重管理アプリを開いています...")
        driver.get("http://localhost:8080")
        
        # ページが読み込まれるまで待機
        time.sleep(3)
        
        # ログイン処理（必要な場合）
        try:
            # ログインダイアログの確認
            login_dialog = driver.find_element(By.CLASS_NAME, "auth-modal")
            if login_dialog.is_displayed():
                # デモモードボタンを探す
                demo_btn = driver.find_element(By.XPATH, "//button[contains(., 'デモ') or contains(., 'Demo')]")
                demo_btn.click()
                print("✅ デモモードでログイン")
                time.sleep(2)
        except:
            print("ℹ️ ログイン画面をスキップ")
        
        # 体重タブをクリック（様々なセレクタを試す）
        try:
            # タブボタンを探す
            weight_tab = None
            
            # 方法1: テキストで検索
            try:
                weight_tab = driver.find_element(By.XPATH, "//button[contains(., '体重') or contains(@onclick, 'showTab(1)')]")
            except:
                pass
            
            # 方法2: onclick属性で検索
            if not weight_tab:
                try:
                    weight_tab = driver.find_element(By.CSS_SELECTOR, "button[onclick*='showTab(1)']")
                except:
                    pass
            
            # 方法3: クラス名で検索
            if not weight_tab:
                try:
                    tabs = driver.find_elements(By.CLASS_NAME, "tab-button")
                    if len(tabs) >= 1:
                        weight_tab = tabs[0]  # 最初のタブが体重タブ
                except:
                    pass
            
            if weight_tab:
                weight_tab.click()
                print("✅ 体重タブを開きました")
                time.sleep(2)
            else:
                print("❌ 体重タブが見つかりません")
                return
        except Exception as e:
            print(f"❌ タブ切り替えエラー: {str(e)}")
            return
        
        # グラフの存在を確認
        try:
            canvas = driver.find_element(By.ID, "weightChart")
            print(f"✅ グラフ要素を発見: 表示={canvas.is_displayed()}")
        except:
            print("❌ グラフ要素が見つかりません")
        
        # 各期間ボタンをテスト
        periods = [
            ("1日", "1日"),
            ("1週間", "1週間"),
            ("1ヶ月", "1ヶ月"),
            ("3ヶ月", "3ヶ月"),
            ("1年", "1年"),
            ("全期間", "全期間")
        ]
        
        for btn_text, period_name in periods:
            try:
                btn = driver.find_element(By.XPATH, f"//button[contains(text(), '{btn_text}')]")
                btn.click()
                print(f"\n📊 {period_name}表示をテスト中...")
                time.sleep(2)
                
                # コンソールログを確認
                logs = driver.get_log('browser')
                for log in logs:
                    if 'グラフ' in log['message'] or 'Chart' in log['message']:
                        print(f"  ログ: {log['message']}")
                
                # Chart.jsのデータセットを確認
                datasets_script = """
                if (window.WeightTab && window.WeightTab.weightChart) {
                    return window.WeightTab.weightChart.data.datasets.map(ds => ({
                        label: ds.label,
                        dataCount: ds.data.length
                    }));
                } else {
                    return null;
                }
                """
                datasets = driver.execute_script(datasets_script)
                
                if datasets:
                    print(f"  データセット数: {len(datasets)}")
                    for ds in datasets:
                        print(f"    - {ds['label']}: {ds['dataCount']}件")
                else:
                    print("  ⚠️ グラフデータが取得できません")
                    
            except Exception as e:
                print(f"❌ {period_name}のテスト失敗: {str(e)}")
        
        # スクリーンショット保存
        driver.save_screenshot("weight_graph_check.png")
        print("\n📸 スクリーンショットを保存しました: weight_graph_check.png")
        
        # 10秒間開いたままにする
        print("\n⏳ 10秒後に自動で閉じます...")
        time.sleep(10)
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {str(e)}")
    finally:
        driver.quit()
        print("\n✅ テスト完了")

if __name__ == "__main__":
    check_weight_graph()