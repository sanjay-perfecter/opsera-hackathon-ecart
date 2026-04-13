@echo off
echo ========================================
echo Stopping MetaYB E-Commerce Application
echo ========================================
echo.

echo Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul

if %ERRORLEVEL% EQU 0 (
    echo All services stopped successfully.
) else (
    echo No running services found.
)

echo.
pause
