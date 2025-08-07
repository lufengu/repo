@echo off
echo ==========================================
echo INICIANDO FRONTEND (REPO)
echo ==========================================
echo.
echo Puerto: 5173
echo URL: http://localhost:5173
echo.

cd /d "%~dp0"
npm run dev

echo.
echo Frontend cerrado. Presiona cualquier tecla para salir...
pause > nul
