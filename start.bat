@echo off
chcp 65001 >nul 2>&1
title 吃瓜命理盘 · 启动中...

echo.
echo 🍉 吃瓜命理盘 · 启动中...
echo.

:: 检查 PHP
where php >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ 未检测到 PHP，请先安装
    echo    下载: https://windows.php.net/download/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('php -v') do (
    echo ✓ PHP: %%i
    goto :next
)
:next

:: 设置端口
set HOST=0.0.0.0
set PORT=8000

echo.
echo 🚀 服务启动：
echo    本地访问: http://localhost:%PORT%
echo    API:      http://localhost:%PORT%/api/
echo.
echo 按 Ctrl+C 停止服务
echo.

:: 获取脚本所在目录
set SCRIPT_DIR=%~dp0

php -S %HOST%:%PORT% "%SCRIPT_DIR%server.php"
