@echo off
title Laboratory Management System - Full Stack Startup
echo =================================================
echo   Laboratory Management System Startup
echo =================================================
echo.
echo Starting Backend Server...
start "Backend Server" /d "D:\MWT_PROJECT\zbackend" node server.js

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak

echo Starting Frontend Server...
start "Frontend Server" /d "D:\MWT_PROJECT\frontend" npm run dev

echo.
echo =================================================
echo   Both servers are starting up!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173 (or next available port)
echo =================================================
echo.
echo Press any key to close this window...
pause > nul