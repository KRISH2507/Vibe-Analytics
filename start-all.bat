@echo off
echo Starting Vibe Analytics...
echo.

REM Start backend in new window
start "Vibe Analytics Backend" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak

REM Start frontend in new window
start "Vibe Analytics Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8081
echo.
