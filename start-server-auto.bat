@echo off
setlocal enabledelayedexpansion

:: デフォルトポート候補リスト
set PORTS=3000 3001 3002 8080 8081 8082 8000 8001 5000 5001

:: 利用可能なポートを探す
set FOUND_PORT=
for %%p in (%PORTS%) do (
    if "!FOUND_PORT!"=="" (
        netstat -an | findstr ":%%p.*LISTENING" >nul 2>&1
        if !errorlevel! neq 0 (
            set FOUND_PORT=%%p
        )
    )
)

:: ポートが見つからない場合はデフォルト
if "%FOUND_PORT%"=="" (
    echo All common ports are in use. Using default 9999
    set FOUND_PORT=9999
)

echo ========================================
echo Auto-detecting available port...
echo Found available port: %FOUND_PORT%
echo URL: http://localhost:%FOUND_PORT%
echo ========================================
echo.
echo Starting HTTP server...
echo Press Ctrl+C to stop
echo ========================================

:: サーバー起動
python -m http.server %FOUND_PORT%

pause