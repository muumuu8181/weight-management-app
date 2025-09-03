@echo off
echo 🔄 バージョン比較ツール
echo.

cd /d "%~dp0..\.."

if "%1"=="" (
    echo 📊 最新の変更を前回と比較...
    node tools\code-analysis\version-comparator.js
) else if "%2"=="" (
    echo 📊 %1 と現在を比較...
    node tools\code-analysis\version-comparator.js --from=%1
) else (
    echo 📊 %1 と %2 を比較...
    node tools\code-analysis\version-comparator.js --from=%1 --to=%2
)

echo.
echo ✅ 比較完了！
echo 📁 レポート保存先: tools\reports\
echo.

echo 使用例:
echo   compare-versions.bat                  # 最新の変更を比較
echo   compare-versions.bat v2.30           # v2.30と現在を比較  
echo   compare-versions.bat v2.30 v2.32     # v2.30とv2.32を比較
echo.
pause