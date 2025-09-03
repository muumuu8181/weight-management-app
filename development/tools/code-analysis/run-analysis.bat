@echo off
echo 📊 体重管理アプリ コードメトリクス分析ツール
echo.

cd /d "%~dp0..\.."

echo 🔍 現在のコード構成を分析中...
node tools\code-analysis\code-metrics-analyzer.js

echo.
echo 📈 ビジュアルレポートを生成中...
node tools\code-analysis\visual-report-generator.js

echo.
echo ✅ 分析完了！
echo 📁 レポート保存先: tools\reports\
echo.
pause