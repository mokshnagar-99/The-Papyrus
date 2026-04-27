@echo off
title The Papyrus — Dev Server
echo.
echo  ==========================================
echo   The Papyrus — Starting Dev Server
echo  ==========================================
echo.
echo  DO NOT open HTML files directly in your browser.
echo  This launcher starts the local dev server so
echo  Firebase, fonts, and auth all work correctly.
echo.
echo  Once started, open: http://localhost:3000/login.html
echo.

cd /d "%~dp0"
npm run dev

pause
