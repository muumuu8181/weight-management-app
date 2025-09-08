@echo off
setlocal enabledelayedexpansion

:: 引数がある場合はそれを使用
if not "%1"=="" (
    set PORT=%1
    echo Using specified port: %PORT%
    goto :startserver
)

:: 引数がない場合は自動検知
echo ========================================
echo Auto-detecting available port...
echo ========================================

:: ポート候補リスト（よく使うポート順）
set PORTS=3000 3001 3002 8000 8001 8080 8081 5000 5001 4000 4001

:: 利用可能なポートを探す
set PORT=
for %%p in (%PORTS%) do (
    if "!PORT!"=="" (
        :: ポートが使用中かチェック
        netstat -an | findstr ":%%p.*LISTENING" >nul 2>&1
        if !errorlevel! neq 0 (
            :: TCPでもチェック
            netstat -an | findstr "TCP.*:%%p.*LISTENING" >nul 2>&1
            if !errorlevel! neq 0 (
                set PORT=%%p
            )
        )
    )
)

:: ポートが見つからない場合
if "%PORT%"=="" (
    echo ⚠️  All common ports are in use!
    echo Using fallback port: 9999
    set PORT=9999
)

:startserver
echo.
echo ========================================
echo 🚀 Starting HTTP Server
echo 📁 Directory: %CD%
echo 🌐 Port: %PORT%
echo 🔗 URL: http://localhost:%PORT%
echo ========================================
echo.
echo Usage:
echo   start-server.bat        (auto-detect port)
echo   start-server.bat 8080   (use specific port)
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

:: サーバー起動
python -m http.server %PORT%

if errorlevel 1 (
    echo.
    echo ❌ Failed to start server on port %PORT%
    echo Try a different port: start-server.bat [port]
)

pause