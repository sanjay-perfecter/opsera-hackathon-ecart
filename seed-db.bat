@echo off
echo ========================================
echo Setting Up Database with Sample Data
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

echo Step 1: Generating product images...
cd backend\services\product
call node generate-images.js
echo.

echo Step 2: Seeding database with products...
call node seed.js
cd ..\..\..

echo.
echo ========================================
echo Database setup completed successfully!
echo ========================================
echo.
pause
