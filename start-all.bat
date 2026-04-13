@echo off
echo ========================================
echo Starting MetaYB E-Commerce Application
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy env.example to .env and configure it first.
    echo.
    pause
    exit /b 1
)

REM Check if MongoDB is running
echo Checking MongoDB connection...
timeout /t 2 /nobreak > nul

echo.
echo Starting all services...
echo.

REM Start API Gateway
echo [1/7] Starting API Gateway (Port 5000)...
start "API Gateway" cmd /k "cd backend\gateway && npm run dev"
timeout /t 2 /nobreak > nul

REM Start Auth Service
echo [2/7] Starting Auth Service (Port 5001)...
start "Auth Service" cmd /k "cd backend\services\auth && npm run dev"
timeout /t 2 /nobreak > nul

REM Start User Service
echo [3/7] Starting User Service (Port 5002)...
start "User Service" cmd /k "cd backend\services\user && npm run dev"
timeout /t 2 /nobreak > nul

REM Start Product Service
echo [4/7] Starting Product Service (Port 5003)...
start "Product Service" cmd /k "cd backend\services\product && npm run dev"
timeout /t 2 /nobreak > nul

REM Start Cart/Order Service
echo [5/7] Starting Cart/Order Service (Port 5004)...
start "Cart/Order Service" cmd /k "cd backend\services\cart-order && npm run dev"
timeout /t 2 /nobreak > nul

REM Start Payment Service
echo [6/7] Starting Payment Service (Port 5005)...
start "Payment Service" cmd /k "cd backend\services\payment && npm run dev"
timeout /t 2 /nobreak > nul

REM Start Frontend
echo [7/7] Starting Frontend (Port 3000)...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo All services are starting...
echo ========================================
echo.
echo Services will open in separate windows:
echo - API Gateway: http://localhost:5000
echo - Auth Service: http://localhost:5001
echo - User Service: http://localhost:5002
echo - Product Service: http://localhost:5003
echo - Cart/Order Service: http://localhost:5004
echo - Payment Service: http://localhost:5005
echo - Frontend: http://localhost:3000
echo.
echo Wait a few moments for all services to start...
echo Then open your browser to http://localhost:3000
echo.
echo To stop all services, close all the opened windows.
echo.
pause
