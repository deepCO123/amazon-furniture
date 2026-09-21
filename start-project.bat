@echo off
chcp 65001 > nul
title Amazon Furniture - Full Stack Server Runner
echo ================================================================
echo    🚀 تشغيل منصة متجر Amazon Furniture بالكامل
echo ================================================================
echo.
echo [1/2] جاري فحص وتشغيل الخادم الخلفي والواجهة الأمامية...
echo      - الفرونت إند: http://localhost:3000
echo      - الباك إند:   http://localhost:5000
echo.
echo اضغط Ctrl + C في أي وقت لإيقاف السيرفر.
echo ================================================================
echo.

start http://localhost:3000

npm run dev

pause
