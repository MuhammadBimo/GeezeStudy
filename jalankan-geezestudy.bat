@echo off
title GeezeStudy - jangan tutup jendela ini selama dipakai
rem Prasyarat: MySQL (Laragon) sudah menyala, PHP + Composer + Node.js terpasang.

cd /d "%~dp0backend"
if not exist vendor (
  echo Pertama kali: memasang dependency backend...
  call composer install
)
if not exist .env (
  copy .env.example .env >nul
  call php artisan key:generate
)
echo Menyiapkan database (migrasi + data awal)...
call php artisan migrate --seed --force
echo Menyalakan backend di http://localhost:8010 (jendela terpisah)...
start "GeezeStudy Backend" cmd /k "cd /d %~dp0backend && composer serve"

cd /d "%~dp0frontend"
if not exist node_modules (
  echo Pertama kali: memasang dependency frontend, tunggu sebentar...
  call npm install
)

echo.
echo Membuka http://localhost:5173 dalam beberapa detik...
echo Akun uji: admin@ / sd@ / smp@ / sma@ / mahasiswa@ geezestudy.test, password: password123
echo Untuk berhenti: tutup kedua jendela atau tekan Ctrl + C.
echo.
start "" cmd /c "timeout /t 6 >nul & start http://localhost:5173"
call npm run dev
pause
