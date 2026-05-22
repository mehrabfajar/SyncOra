@echo off
echo.
echo ====================================
echo    SyncOra -- Install Script
echo ====================================
echo.

echo Installing Python backend...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet
call venv\Scripts\deactivate.bat
cd ..
echo Backend ready.

echo.
echo Installing Node frontend...
cd frontend
call npm install --silent
cd ..
echo Frontend ready.

echo.
echo Done! Run start.bat to launch the app.
echo.
pause
