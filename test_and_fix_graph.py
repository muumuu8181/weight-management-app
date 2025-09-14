"""
体重グラフの修正を実行して確認
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("=== 体重グラフ修正テスト ===\n")
    
    # コンソールログを有効化
    caps = DesiredCapabilities.CHROME
    caps['goog:loggingPrefs'] = {'browser': 'ALL'}
    
    options = webdriver.ChromeOptions()
    options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    driver = webdriver.Chrome(options=options)
    
    try:
        print("📊 アプリケーションを開いています...")
        driver.get("http://localhost:8080")
        time.sleep(3)
        
        # Googleログイン
        print("\n🔐 Googleログインボタンをクリック...")
        try:
            login_btn = driver.find_element(By.XPATH, "//button[contains(., 'Google')]")
            login_btn.click()
            time.sleep(2)
            
            # ウィンドウを切り替え
            windows = driver.window_handles
            if len(windows) > 1:
                driver.switch_to.window(windows[0])
                print("ℹ️ メインウィンドウに戻りました")
        except:
            print("⚠️ ログインボタンが見つかりません")
        
        # ログイン完了を待つ（手動ログインの場合）
        print("\n⏳ 手動でログインしてください（15秒待機）...")
        time.sleep(15)
        
        # 体重タブに切り替え
        print("\n📊 体重タブに切り替え...")
        driver.execute_script("if (typeof showTab === 'function') showTab(1)")
        time.sleep(2)
        
        # 修正版のupdateChart関数を注入
        print("\n🔧 修正版updateChart関数を注入...")
        update_chart_code = """
window.updateChart = function(days = 30) {
    console.log('🔴🔴🔴 修正版updateChart実行中!!!! days=' + days);
    
    const ctx = document.getElementById('weightChart');
    if (!ctx) {
        console.log('⚠️ weightChart要素が見つかりません');
        return;
    }

    const currentOffset = window.periodOffset || 0;
    if (currentOffset > 0) {
        console.log(`📊 オフセット検出: updateChartWithOffsetに処理を委譲 (offset=${currentOffset})`);
        return updateChartWithOffset(days, currentOffset);
    }

    const now = new Date();
    const endDate = new Date(now);
    const startDate = new Date(now);
    if (days > 0) {
        startDate.setDate(now.getDate() - days);
    } else {
        if (WeightTab.allWeightData && WeightTab.allWeightData.length > 0) {
            startDate.setTime(new Date(WeightTab.allWeightData[0].date).getTime());
        }
    }

    const filteredData = (WeightTab.allWeightData || []).filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= now;
    });

    console.log(`📊 グラフ描画開始: データ件数=${filteredData.length}, 期間=${days}日`);
    
    try {
        if (WeightTab.chartManager) {
            WeightTab.chartManager.destroy();
        }
        if (WeightTab.weightChart) {
            WeightTab.weightChart.destroy();
            WeightTab.weightChart = null;
        }
        
        if (filteredData.length === 0) {
            console.log(`📊 表示するデータがありません`);
            return;
        }
        
        let datasets = [];
        
        console.log('🔴🔴🔴 データセット準備開始 days=' + days);
        
        if (days === 1) {
            console.log('🔴🔴🔴 1日表示モード - 時刻軸を使用!!');
            const chartData = filteredData.map(entry => {
                const dateTime = entry.time ? 
                    new Date(`${entry.date}T${entry.time}:00`) : 
                    new Date(`${entry.date}T12:00:00`);
                
                return {
                    x: dateTime,
                    y: parseFloat(entry.value || entry.weight)
                };
            }).sort((a, b) => a.x - b.x);

            datasets.push({
                label: '体重',
                data: chartData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
            });
            
            const chartOptions = {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'HH:mm'
                            }
                        },
                        title: {
                            display: true,
                            text: '時間'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: '体重 (kg)'
                        }
                    }
                }
            };
            
            WeightTab.chartManager = new UniversalChartManager('weightChart', chartOptions);
        } else {
            console.log('🔴🔴🔴 複数日表示モード - 最大値・最小値を計算!!');
            const groupedData = {};
            filteredData.forEach(entry => {
                if (!groupedData[entry.date]) {
                    groupedData[entry.date] = [];
                }
                groupedData[entry.date].push(parseFloat(entry.value || entry.weight));
            });
            
            const avgData = [], maxData = [], minData = [];
            Object.keys(groupedData).sort().forEach(date => {
                const values = groupedData[date];
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                const max = Math.max(...values);
                const min = Math.min(...values);
                
                avgData.push({ x: date, y: avg });
                if (values.length > 1) {
                    maxData.push({ x: date, y: max });
                    minData.push({ x: date, y: min });
                }
            });
            
            datasets.push({
                label: '平均値',
                data: avgData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                pointRadius: 4
            });
            
            if (maxData.length > 0) {
                console.log('🔴🔴🔴 最大値・最小値データセットを追加!! maxData=' + maxData.length + ', minData=' + minData.length);
                datasets.push({
                    label: '最大値',
                    data: maxData,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.1,
                    borderDash: [5, 5],
                    pointRadius: 3
                });
                
                datasets.push({
                    label: '最小値',
                    data: minData,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.1,
                    borderDash: [5, 5],
                    pointRadius: 3
                });
            } else {
                console.log('🔴🔴🔴 単一測定のみ - 最大値・最小値なし');
            }
            
            WeightTab.chartManager = new UniversalChartManager('weightChart');
        }
        
        console.log('🔴🔴🔴 グラフ作成開始 datasets.length=' + datasets.length);
        for (let i = 0; i < datasets.length; i++) {
            console.log('🔴🔴🔴 データセット[' + i + ']: ' + datasets[i].label + ', データ数=' + datasets[i].data.length);
        }
        
        const chart = WeightTab.chartManager.createLineChart(datasets);
        
        if (chart) {
            WeightTab.weightChart = chart;
            console.log('🔴🔴🔴 グラフ作成成功!!!');
        } else {
            console.log('🔴🔴🔴 グラフ作成失敗...');
        }
    } catch (error) {
        console.error('Chart creation error:', error);
    }
};

console.log('✅ updateChart関数を修正版に置き換えました！');
return true;
"""
        
        result = driver.execute_script(update_chart_code)
        if result:
            print("✅ 修正版関数の注入成功！")
        
        # コンソールログを表示
        def print_console_logs():
            logs = driver.get_log('browser')
            if logs:
                print("\n[コンソールログ]")
                for log in logs[-20:]:  # 最後の20件
                    if '🔴' in log['message'] or 'updateChart' in log['message']:
                        print(f"  {log['message']}")
        
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
            driver.execute_script(f"updateChart({days})")
            time.sleep(1)
            
            # コンソールログ確認
            print_console_logs()
            
            # データセット情報を取得
            dataset_info = driver.execute_script("""
                if (window.WeightTab && window.WeightTab.weightChart) {
                    return window.WeightTab.weightChart.data.datasets.map(ds => ({
                        label: ds.label,
                        dataCount: ds.data.length,
                        hasDash: ds.borderDash ? true : false
                    }));
                }
                return null;
            """)
            
            if dataset_info:
                print(f"\n  📊 データセット情報:")
                for ds in dataset_info:
                    dash = " (破線)" if ds['hasDash'] else ""
                    print(f"     - {ds['label']}: {ds['dataCount']}件{dash}")
            
            # スクリーンショット
            if days == 7:  # 1週間表示のみ保存
                driver.save_screenshot(f"weight_graph_{name}.png")
                print(f"  📸 スクリーンショット保存: weight_graph_{name}.png")
        
        print("\n✅ テスト完了！")
        print("\n⏳ 10秒後に自動で閉じます...")
        time.sleep(10)
        
    except Exception as e:
        print(f"\n❌ エラー: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()
        print("\n✅ ブラウザを閉じました")

if __name__ == "__main__":
    main()