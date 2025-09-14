"""
アプリケーションの状態をデバッグ
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

def debug_app():
    driver = webdriver.Chrome()
    
    try:
        print("📊 アプリケーションを開いています...")
        driver.get("http://localhost:8080")
        time.sleep(3)
        
        # ページタイトル
        print(f"\n📄 ページタイトル: {driver.title}")
        
        # 全てのボタンを探す
        print("\n🔘 ボタン一覧:")
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for i, btn in enumerate(buttons):
            text = btn.text.strip()
            onclick = btn.get_attribute("onclick")
            classes = btn.get_attribute("class")
            print(f"  {i+1}. テキスト: '{text}' | onclick: {onclick} | class: {classes}")
        
        # タブコンテンツを探す
        print("\n📑 タブコンテンツ:")
        tab_contents = driver.find_elements(By.CLASS_NAME, "tab-content")
        for i, tab in enumerate(tab_contents):
            tab_id = tab.get_attribute("id")
            display = tab.is_displayed()
            print(f"  {i+1}. ID: {tab_id} | 表示: {display}")
        
        # Canvas要素を探す
        print("\n📊 Canvas要素:")
        canvases = driver.find_elements(By.TAG_NAME, "canvas")
        for i, canvas in enumerate(canvases):
            canvas_id = canvas.get_attribute("id")
            display = canvas.is_displayed()
            print(f"  {i+1}. ID: {canvas_id} | 表示: {display}")
        
        # JavaScriptでWeightTabオブジェクトを確認
        print("\n🔧 JavaScript状態:")
        js_check = """
        return {
            hasWeightTab: typeof window.WeightTab !== 'undefined',
            hasChart: window.WeightTab && window.WeightTab.weightChart ? true : false,
            currentUser: window.currentUser ? true : false,
            currentTab: window.currentTab || 'unknown'
        };
        """
        js_state = driver.execute_script(js_check)
        print(f"  WeightTabオブジェクト: {js_state['hasWeightTab']}")
        print(f"  グラフオブジェクト: {js_state['hasChart']}")
        print(f"  ログイン状態: {js_state['currentUser']}")
        print(f"  現在のタブ: {js_state['currentTab']}")
        
        # スクリーンショット
        driver.save_screenshot("app_debug_state.png")
        print("\n📸 スクリーンショット保存: app_debug_state.png")
        
        input("\n⏸️ Enterキーを押すと終了します...")
        
    except Exception as e:
        print(f"\n❌ エラー: {str(e)}")
    finally:
        driver.quit()

if __name__ == "__main__":
    debug_app()