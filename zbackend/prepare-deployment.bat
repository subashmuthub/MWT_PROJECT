@echo off
echo.
echo ============================================
echo   Railway Deployment Preparation
echo ============================================
echo.

REM Check if .env exists
if exist .env (
    echo [OK] .env file found
) else (
    echo [ERROR] .env file not found!
    echo Please create .env file first.
    exit /b 1
)

REM Check .gitignore
if exist .gitignore (
    findstr /C:".env" .gitignore >nul
    if %errorlevel% equ 0 (
        echo [OK] .gitignore includes .env
    ) else (
        echo [WARNING] Adding .env to .gitignore
        echo .env >> .gitignore
    )
) else (
    echo [OK] Creating .gitignore
    (
        echo # Environment variables
        echo .env
        echo node_modules/
        echo uploads/
        echo logs/
    ) > .gitignore
)

echo.
echo ============================================
echo   READY FOR DEPLOYMENT
echo ============================================
echo.
echo Next Steps:
echo.
echo 1. Commit your code:
echo    git add .
echo    git commit -m "Ready for Railway deployment"
echo    git push origin main
echo.
echo 2. Go to Railway Dashboard:
echo    https://railway.app/dashboard
echo.
echo 3. Create new project from GitHub repo
echo.
echo 4. Set environment variables
echo    (See .env.railway file for values)
echo.
echo 5. Deploy and get your live URL!
echo.
echo Full guide: RAILWAY_DEPLOYMENT_GUIDE.md
echo Quick guide: DEPLOYMENT_CHECKLIST.txt
echo.
pause
