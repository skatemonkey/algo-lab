@echo off
setlocal
title Algo Lab
set "ALGO_LAB_URL=http://127.0.0.1:5174/"
cd /d "%~dp0" || goto :failed

call :open_running
if not errorlevel 1 exit /b 0

where npm.cmd >nul 2>&1
if errorlevel 1 (
    echo Node.js and npm are required. Install Node.js, then try again.
    goto :failed
)
if not exist "node_modules\vite\bin\vite.js" (
    echo Frontend dependencies are missing. Run npm install in the Algo Lab folder once.
    goto :failed
)

echo Starting Algo Lab...
echo Keep this window open. Close it to stop the website.
call npm.cmd run dev -- --host 127.0.0.1 --port 5174 --strictPort --open
if not errorlevel 1 exit /b 0

rem Another launch may have started the server while this one was starting.
call :open_running
if not errorlevel 1 exit /b 0

:failed
echo.
echo Algo Lab could not start. See the message above.
pause
exit /b 1

:open_running
powershell.exe -NoLogo -NoProfile -NonInteractive -Command "try { $page = Invoke-WebRequest -Uri $env:ALGO_LAB_URL -UseBasicParsing -TimeoutSec 2; if ($page.Content.Contains('<title>Algo Lab')) { exit 0 } } catch {}; exit 1" >nul 2>&1
if errorlevel 1 exit /b 1
start "" "%ALGO_LAB_URL%"
exit /b 0
