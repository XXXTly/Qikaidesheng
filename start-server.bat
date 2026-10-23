@echo off
chcp 65001 > nul
echo.
echo ==========================================
echo   骑开得胜 - 本地预览服务器
echo ==========================================
echo.
echo 正在启动服务器，请稍候...
echo.

for /f "tokens=2 delims=[]" %%a in ('ping -4 -n 1 %computername% ^| findstr "["') do set LOCAL_IP=%%a

echo 电脑局域网 IP：%LOCAL_IP%
echo.
echo 请在手机浏览器中访问以下地址：
echo   http://%LOCAL_IP%:3456/
echo.
echo 按 Ctrl+C 关闭服务器
echo.

npx serve . -l 3456 --no-request-logging
