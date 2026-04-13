@echo off
echo Stopping all services...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul
echo.
echo Restarting all services...
echo.
start cmd /k "cd backend\services\auth && npm run dev"
timeout /t 2 /nobreak > nul
start cmd /k "cd backend\services\user && npm run dev"
timeout /t 2 /nobreak > nul
start cmd /k "cd backend\services\product && npm run dev"
timeout /t 2 /nobreak > nul
start cmd /k "cd backend\services\cart-order && npm run dev"
timeout /t 2 /nobreak > nul
start cmd /k "cd backend\services\payment && npm run dev"
timeout /t 2 /nobreak > nul
start cmd /k "cd backend\gateway && npm run dev"
timeout /t 2 /nobreak > nul
start cmd /k "cd frontend && npm start"
echo.
echo All services restarted!
pause
