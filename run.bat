@echo off
title NutriFeast EcoVision - Launch System
color 0A

echo ===================================================================
echo   NUTRIFEAST ECOVISION - AI FOOD WASTE INTELLIGENCE PLATFORM
echo   See the Waste. Save the Food. Protect the Planet.
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python backend dependencies...
python -c "import flask, flask_cors, ultralytics, cv2, PIL; print('   Python dependencies verified.')"
if %errorlevel% neq 0 (
    echo [!] Missing Python libraries. Installing requirements...
    python -m pip install -r backend\requirements.txt
)

echo.
echo [2/3] Launching Flask Backend Server on http://127.0.0.1:5000...
start "NutriFeast EcoVision Backend" cmd /k "cd backend && python app.py"

timeout /t 3 /nobreak >nul

echo.
echo [3/3] Launching Vite React Frontend on http://localhost:5173...
start "NutriFeast EcoVision Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================================
echo   ECOVISION APPLICATION RUNNING!
echo   - Backend:  http://127.0.0.1:5000
echo   - Frontend: http://localhost:5173
echo ===================================================================
echo.
echo Press any key to open the application in your browser...
pause >nul
start http://localhost:5173
