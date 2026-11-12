@echo off
setlocal
title GeezeStudy - jangan tutup jendela ini selama dipakai
echo ==============================================
echo   GeezeStudy - menjalankan aplikasi di komputer ini
echo ==============================================
echo.

rem ---------- 1. Cek program yang dibutuhkan ----------
set "MISSING="
for %%C in (git php composer node npm) do (
  where %%C >nul 2>nul
  if errorlevel 1 (
    echo [KURANG] %%C belum terpasang atau belum masuk PATH.
    set "MISSING=1"
  )
)
if defined MISSING goto :need_tools

rem ---------- 2. Cari folder proyek (di dalam repo, atau unduh dari GitHub) ----------
if exist "%~dp0backend\artisan" (
  set "ROOT=%~dp0"
  goto :have_root
)
set "ROOT=%~dp0GeezeStudy\"
if exist "%ROOT%backend\artisan" (
  echo Memperbarui kode dari GitHub...
  git -C "%ROOT%" pull --ff-only
  goto :have_root
)
echo Mengunduh kode dari GitHub ke "%ROOT%" ...
git clone https://github.com/MuhammadBimo/GeezeStudy.git "%ROOT%"
if errorlevel 1 goto :clone_failed

:have_root
echo Folder proyek: %ROOT%
echo.

rem ---------- 3. Cek MySQL (Laragon: Start All) ----------
netstat -an | find ":3306" | find "LISTENING" >nul
if errorlevel 1 goto :need_mysql

rem ---------- 4. Backend ----------
cd /d "%ROOT%backend"
if not exist vendor (
  echo Memasang dependency backend ^(pertama kali, beberapa menit^)...
  call composer install --no-interaction
  if errorlevel 1 goto :backend_failed
)
if not exist .env (
  copy .env.example .env >nul
  call php artisan key:generate --force
)
echo Menyiapkan database "geezestudy"...
php -r "try { (new PDO('mysql:host=127.0.0.1;port=3306','root',''))->exec('CREATE DATABASE IF NOT EXISTS geezestudy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'); } catch (Exception $e) { fwrite(STDERR, $e->getMessage() . PHP_EOL); exit(1); }"
if errorlevel 1 goto :db_failed
call php artisan migrate --seed --force
if errorlevel 1 goto :db_failed

echo Menyalakan backend di http://localhost:8010 ^(jendela terpisah^)...
start "GeezeStudy Backend" /d "%ROOT%backend" cmd /k composer serve

rem ---------- 5. Frontend ----------
cd /d "%ROOT%frontend"
if not exist node_modules (
  echo Memasang dependency frontend ^(pertama kali, beberapa menit^)...
  call npm install
  if errorlevel 1 goto :frontend_failed
)

echo.
echo ----------------------------------------------
echo  Aplikasi : http://localhost:5173  ^(terbuka otomatis^)
echo  Akun uji : admin@ / sd@ / smp@ / sma@ / mahasiswa@ geezestudy.test
echo  Password : password123
echo  Berhenti : tutup jendela ini dan jendela "GeezeStudy Backend"
echo ----------------------------------------------
echo.
start "" cmd /c "timeout /t 6 >nul & start http://localhost:5173"
call npm run dev
goto :end

:need_tools
echo.
echo Pasang dulu program yang kurang, lalu jalankan file ini lagi:
echo   - Laragon ^(sudah berisi PHP, MySQL, Composer^): https://laragon.org
echo   - Node.js versi 22 atau lebih baru: https://nodejs.org
echo   - Git: https://git-scm.com
echo Setelah memasang, tutup lalu buka lagi jendela ini agar PATH terbaca.
goto :end

:clone_failed
echo.
echo Gagal mengunduh kode dari GitHub. Periksa koneksi internet lalu coba lagi.
goto :end

:need_mysql
echo.
echo MySQL belum menyala. Buka Laragon lalu klik "Start All", kemudian jalankan file ini lagi.
goto :end

:backend_failed
echo.
echo Gagal memasang dependency backend. Baca pesan error di atas.
goto :end

:db_failed
echo.
echo Gagal menyiapkan database. Pastikan MySQL menyala dan user "root" tanpa password
echo ^(bawaan Laragon^), atau sesuaikan DB_USERNAME / DB_PASSWORD di backend\.env
goto :end

:frontend_failed
echo.
echo Gagal memasang dependency frontend. Baca pesan error di atas.
goto :end

:end
echo.
pause
endlocal
