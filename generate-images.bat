@echo off
echo ========================================
echo Generating Product Placeholder Images
echo ========================================
echo.

cd backend\services\product
node generate-images.js

echo.
pause
