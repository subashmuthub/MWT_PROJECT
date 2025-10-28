@echo off
REM Docker Deployment Script for Laboratory Management System (Windows)

echo 🐋 Starting LabMS Docker Deployment...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📄 Creating .env file from .env.docker template...
    copy .env.docker .env
    echo ⚠️  Please update the .env file with your actual values before proceeding.
    echo    Especially update: JWT_SECRET, DB_PASSWORD, GMAIL credentials
    pause
)

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Ask about rebuilding
set /p rebuild="Do you want to remove old images and rebuild? (y/N): "
if /i "%rebuild%"=="y" (
    echo 🧹 Removing old images...
    docker-compose down --rmi all --volumes --remove-orphans
)

REM Build and start services
echo 🏗️  Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check service status
echo 🔍 Checking service status...
docker-compose ps

REM Test services
echo 🧪 Testing services...

echo Testing backend API...
curl -f http://localhost:5000/api/health || echo ❌ Backend health check failed

echo Testing frontend...
curl -f http://localhost/health || echo ❌ Frontend health check failed

echo ✅ LabMS Docker deployment completed!
echo.
echo 📋 Service URLs:
echo    Frontend: http://localhost
echo    Backend API: http://localhost:5000/api
echo    Database: localhost:3307
echo.
echo 📊 View logs: docker-compose logs -f
echo 🛑 Stop services: docker-compose down
echo 🔄 Restart services: docker-compose restart

pause