@echo off
echo.
echo ====================================
echo     SyncOra -- Starting App
echo ====================================
echo.

echo Starting backend on http://localhost:5000 ...
cd backend
start "SyncOra Backend" cmd /k "venv\Scripts\activate && python run.py"
cd ..

timeout /t 2 > nul

echo Starting frontend on http://localhost:5173 ...
cd frontend
start "SyncOra Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ====================================
echo   Open: http://localhost:5173
echo   Close both windows to stop.
echo ====================================
echo.
pause
