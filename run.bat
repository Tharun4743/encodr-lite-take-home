@echo off
setlocal

echo ===================================================================
echo               Encodr Lite - Transcoding Dashboard
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing npm dependencies...
    call npm install
) else (
    echo Dependencies are already installed.
)

echo.
echo ===================================================================
echo Select an option:
echo   [1] Start Development Server (http://localhost:3000) - Default
echo   [2] Run Automated Tests (vitest)
echo   [3] Run TypeScript Typecheck
echo   [4] Build Production Bundle
echo   [5] Exit
echo ===================================================================
echo.

set CHOICE=1
set /p CHOICE="Enter your choice [1-5, default 1]: "

if "%CHOICE%"=="1" goto start_dev
if "%CHOICE%"=="2" goto run_tests
if "%CHOICE%"=="3" goto run_typecheck
if "%CHOICE%"=="4" goto run_build
if "%CHOICE%"=="5" goto do_exit
goto start_dev

:start_dev
echo.
echo Starting development server on http://localhost:3000 ...
echo Press Ctrl+C to stop the server.
echo.
start http://localhost:3000
call npm run dev
goto do_exit

:run_tests
echo.
echo Running automated test suite...
call npm run test:run
echo.
pause
goto do_exit

:run_typecheck
echo.
echo Running TypeScript typecheck...
call npm run typecheck
echo.
pause
goto do_exit

:run_build
echo.
echo Building Next.js production bundle...
call npm run build
echo.
pause
goto do_exit

:do_exit
exit /b 0
