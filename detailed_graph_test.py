"""
体重グラフの詳細テスト
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("=== 体重グラフ詳細テスト ===\n")
    
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
            windows = driver.window_handles
            if len(windows) > 1:
                driver.switch_to.window(windows[0])
        except:
            print("⚠️ ログインボタンが見つかりません")
        
        # ログイン完了を待つ
        print("\n⏳ ログイン完了を待機中（20秒）...")
        time.sleep(20)
        
        # 体重タブに切り替え
        print("\n📊 体重タブに切り替え...")
        driver.execute_script("if (typeof showTab === 'function') showTab(1)")
        time.sleep(3)
        
        # 現在のデータを確認
        print("\n📊 現在のデータ状態を確認...")
        data_info = driver.execute_script("""
            if (window.WeightTab && window.WeightTab.allWeightData) {
                // 日付ごとにグループ化
                const grouped = {};
                window.WeightTab.allWeightData.forEach(entry => {
                    if (!grouped[entry.date]) {
                        grouped[entry.date] = [];
                    }
                    grouped[entry.date].push(entry);
                });
                
                // 複数測定がある日を探す
                const multipleDays = [];
                Object.entries(grouped).forEach(([date, entries]) => {
                    if (entries.length > 1) {
                        multipleDays.push({
                            date: date,
                            count: entries.length,
                            values: entries.map(e => e.value || e.weight)
                        });
                    }
                });
                
                return {
                    totalCount: window.WeightTab.allWeightData.length,
                    uniqueDays: Object.keys(grouped).length,
                    multipleMeasurementDays: multipleDays
                };
            }
            return null;
        """)
        
        if data_info:
            print(f"  総データ数: {data_info['totalCount']}件")
            print(f"  ユニーク日数: {data_info['uniqueDays']}日")
            print(f"  複数測定日数: {len(data_info['multipleMeasurementDays'])}日")
            
            if data_info['multipleMeasurementDays']:
                print("\n  複数測定がある日の例:")
                for day in data_info['multipleMeasurementDays'][:3]:  # 最初の3日分
                    print(f"    {day['date']}: {day['count']}回測定 {day['values']}")
        
        # 修正版のupdateChart関数を注入（詳細ログ付き）
        print("\n🔧 修正版updateChart関数を注入...")
        update_chart_code = """
window.updateChart = function(days = 30) {
    console.log('🔴🔴🔴 修正版updateChart実行中!!!! days=' + days);
    
    const ctx = document.getElementById('weightChart');
    if (!ctx) {
        console.log('⚠️ weightChart要素が見つかりません');
        return;
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

    console.log(`📊 フィルタ結果: ${filteredData.length}件のデータ`);
    
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

            console.log(`🔴 1日表示: ${chartData.length}個のデータポイント`);

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
            
            console.log(`🔴 グループ化完了: ${Object.keys(groupedData).length}日分`);
            
            const avgData = [], maxData = [], minData = [];
            let multipleCount = 0;
            
            Object.keys(groupedData).sort().forEach(date => {
                const values = groupedData[date];
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                const max = Math.max(...values);
                const min = Math.min(...values);
                
                avgData.push({ x: date, y: avg });
                if (values.length > 1) {
                    maxData.push({ x: date, y: max });
                    minData.push({ x: date, y: min });
                    multipleCount++;
                    console.log(`🔴 複数測定日: ${date} - ${values.length}回測定 [${min} ~ ${max}]`);
                }
            });
            
            console.log(`🔴 複数測定日数: ${multipleCount}日`);
            
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
            
            // 実際のデータセット数を確認
            const actualDatasets = window.WeightTab.weightChart.data.datasets;
            console.log(`🔴 実際のデータセット数: ${actualDatasets.length}`);
            actualDatasets.forEach((ds, i) => {
                console.log(`🔴 実際のデータセット[${i}]: ${ds.label}, ${ds.data.length}件`);
            });
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
        
        driver.execute_script(update_chart_code)
        print("✅ 修正版関数の注入成功！")
        
        # コンソールログを全て表示
        def print_all_console_logs():
            logs = driver.get_log('browser')
            if logs:
                print("\n[コンソールログ]")
                for log in logs:
                    msg = log['message']
                    if '🔴' in msg or 'updateChart' in msg or 'データセット' in msg:
                        # Chrome DevToolsのログフォーマットを整形
                        if 'console-api' in msg:
                            parts = msg.split('"')
                            if len(parts) > 1:
                                actual_msg = parts[1]
                                print(f"  {actual_msg}")
                        else:
                            print(f"  {msg}")
        
        # 各期間でテスト（詳細版）
        periods = [(7, "1週間"), (30, "1ヶ月")]
        
        for days, name in periods:
            print(f"\n\n{'='*60}")
            print(f"🔄 {name}表示をテスト...")
            print('='*60)
            
            # コンソールログをクリア
            driver.get_log('browser')
            
            # updateChartを実行
            driver.execute_script(f"updateChart({days})")
            time.sleep(2)
            
            # コンソールログ確認
            print_all_console_logs()
            
            # データセット情報を詳細に取得
            dataset_info = driver.execute_script("""
                if (window.WeightTab && window.WeightTab.weightChart) {
                    const datasets = window.WeightTab.weightChart.data.datasets;
                    return {
                        count: datasets.length,
                        datasets: datasets.map(ds => ({
                            label: ds.label,
                            dataCount: ds.data.length,
                            hasDash: ds.borderDash ? true : false,
                            borderColor: ds.borderColor,
                            firstData: ds.data.length > 0 ? {x: ds.data[0].x, y: ds.data[0].y} : null,
                            lastData: ds.data.length > 0 ? {x: ds.data[ds.data.length-1].x, y: ds.data[ds.data.length-1].y} : null
                        }))
                    };
                }
                return null;
            """)
            
            if dataset_info:
                print(f"\n📊 実際のグラフのデータセット情報:")
                print(f"  データセット数: {dataset_info['count']}")
                for i, ds in enumerate(dataset_info['datasets']):
                    dash = " (破線)" if ds['hasDash'] else ""
                    print(f"\n  [{i}] {ds['label']}: {ds['dataCount']}件{dash}")
                    print(f"      色: {ds['borderColor']}")
                    if ds['firstData']:
                        print(f"      最初: x={ds['firstData']['x']}, y={ds['firstData']['y']}")
                    if ds['lastData']:
                        print(f"      最後: x={ds['lastData']['x']}, y={ds['lastData']['y']}")
            
            # スクリーンショット
            driver.save_screenshot(f"detailed_test_{name}.png")
            print(f"\n📸 スクリーンショット保存: detailed_test_{name}.png")
        
        print("\n\n✅ 詳細テスト完了！")
        print("\n⏳ 15秒後に自動で閉じます...")
        time.sleep(15)
        
    except Exception as e:
        print(f"\n❌ エラー: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()
        print("\n✅ ブラウザを閉じました")

if __name__ == "__main__":
    main()