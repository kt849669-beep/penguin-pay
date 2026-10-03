@echo off
title PenguinPay Local Server
cd /d "%~dp0"
echo ==============================================
echo        Starting PenguinPay Local Server
echo ==============================================
echo.
echo User App:    http://127.0.0.1:4173/
echo Admin Panel: http://127.0.0.1:4173/admin
echo.
echo Admin Login:
echo   Email:    admin@penguinpay.com
echo   Password: admin@0123
echo ==============================================
echo.
npm run dev
pause
