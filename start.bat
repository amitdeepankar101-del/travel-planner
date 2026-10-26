@echo off
echo Starting AI Travel Planner...
echo.

REM Start backend in a new window
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe -m uvicorn main:app --port 8000"

REM Wait 3 seconds for backend to boot
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "Frontend - Vite" cmd /k "cd /d %~dp0frontend && node_modules\.bin\vite.cmd --port 5173"

REM Wait 4 seconds for frontend to boot
timeout /t 4 /nobreak >nul

REM Open browser
start "" "http://localhost:5173"

echo.
echo Both servers are starting in separate windows.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Close those two windows to stop the servers.
