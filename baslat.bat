@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi. Once Node.js LTS kurulmali.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Gerekli paketler kuruluyor...
  call npm install
  if errorlevel 1 (
    echo Paket kurulumu basarisiz oldu.
    pause
    exit /b 1
  )
)

echo Kantin gelistirme sunucusu baslatiliyor...
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"
call npm run dev

if errorlevel 1 (
  echo Sunucu baslatilirken hata olustu.
  pause
)
