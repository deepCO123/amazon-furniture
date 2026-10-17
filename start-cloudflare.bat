@echo off
chcp 65001 > nul
title Amazon Furniture - Full Stack + Cloudflare Tunnel
echo ================================================================
echo    🚀 تشغيل متجر Amazon Furniture بالكامل + نفق Cloudflare
echo ================================================================
echo.
echo [1/3] جاري تشغيل الواجهة الخلفية (Backend) على المنفذ 5000...
echo [2/3] جاري تشغيل الواجهة الأمامية (Frontend) على المنفذ 3000...
echo [3/3] جاري تشغيل Cloudflare Tunnel لبث الموقع برابط عام مشفر HTTPS...
echo.
echo اضغط Ctrl + C في أي وقت لإيقاف السيرفر.
echo ================================================================
echo.

npm run dev:tunnel

pause
