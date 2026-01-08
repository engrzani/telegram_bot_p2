@echo off
echo ============================================
echo  Amazon Flex Bot System - Startup
echo ============================================
echo.

REM Kill existing processes
echo [1/4] Stopping existing processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

REM Start Python bot in new window
echo [2/4] Starting Python bot on port 5000...
start "Python Bot API" cmd /k "cd /d %~dp0 && python bot\main_simple.py"
timeout /t 3 /nobreak >nul

REM Start Node.js server in new window
echo [3/4] Starting Node.js server on port 3000...
start "Node.js Dashboard" cmd /k "cd /d %~dp0 && npm start"
timeout /t 5 /nobreak >nul

REM Open browser
echo [4/4] Opening browser...
start http://localhost:3000

echo.
echo ============================================
echo  System Started Successfully!
echo ============================================
echo.
echo  Node.js Dashboard: http://localhost:3000
echo  Python Bot API:    http://localhost:5000
echo.
echo  Login: demo@example.com / demo123
echo.
echo  Press any key to close this window...
pause >nul
