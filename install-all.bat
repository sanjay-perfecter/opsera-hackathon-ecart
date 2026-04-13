@echo off
echo ========================================
echo Installing Dependencies for All Services
echo ========================================
echo.

echo [1/8] Installing root dependencies...
call npm install
echo.

echo [2/8] Installing Frontend dependencies...
cd frontend
call npm install
cd ..
echo.

echo [3/8] Installing Gateway dependencies...
cd backend\gateway
call npm install
cd ..\..
echo.

echo [4/8] Installing Auth Service dependencies...
cd backend\services\auth
call npm install
cd ..\..\..
echo.

echo [5/8] Installing User Service dependencies...
cd backend\services\user
call npm install
cd ..\..\..
echo.

echo [6/8] Installing Product Service dependencies...
cd backend\services\product
call npm install
cd ..\..\..
echo.

echo [7/8] Installing Cart/Order Service dependencies...
cd backend\services\cart-order
call npm install
cd ..\..\..
echo.

echo [8/8] Installing Payment Service dependencies...
cd backend\services\payment
call npm install
cd ..\..\..
echo.

echo ========================================
echo All dependencies installed successfully!
echo ========================================
echo.
pause
