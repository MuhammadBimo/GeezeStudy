@echo off
title GeezeStudy - jangan tutup jendela ini selama dipakai
cd /d "%~dp0frontend"

if not exist node_modules (
  echo Pertama kali dijalankan: memasang dependency, tunggu sebentar...
  call npm install
)

echo.
echo Membuka http://localhost:5173 dalam beberapa detik...
echo Untuk berhenti: tutup jendela ini atau tekan Ctrl + C.
echo.
start "" cmd /c "timeout /t 5 >nul & start http://localhost:5173"
call npm run dev
pause
