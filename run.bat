@echo off
setlocal enabledelayedexpansion

echo ===================================================================
echo               Encodr Lite - Transcoding Dashboard
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js (v18+ recommended) from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing npm dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
) else (
    echo Dependencies are already installed.
)

echo.
echo ===================================================================
echo Select an option:
echo   [1] Start Development Server (http://localhost:3000) [Default]
echo   [2] Run Automated Tests (vitest)
echo   [3] Run TypeScript Typecheck
echo   [4] Build Production Bundle
echo   [5] Exit
echo ===================================================================
echo.

set /p CHOICE="Enter your choice (1-5, default 1): "
if "%CHOICE%"=="" set CHOICE=1

if "%CHOICE%"=="1" (
    echo.
    echo Starting development server on http://localhost:3000 ...
    echo Press Ctrl+C to stop the server.
    echo.
    start http://localhost:3000
    call npm run dev
) else if "%CHOICE%"=="2" (
    echo.
    echo Running automated test suite...
    call npm run test:run
    echo.
    pause
) else if "%CHOICE%"=="3" (
    echo.
    echo Running TypeScript typecheck...
    call npm run typecheck
    echo.
    pause
) else if "%CHOICE%"=="4" (
    echo.
    echo Building Next.js production bundle...
    call npm run build
    echo.
    pause
) else if "%CHOICE%"=="5" (
    echo Exiting.
    exit /b 0
) else (
    echo Invalid choice. Starting development server by default...
    start http://localhost:3000
    call npm run dev
)
