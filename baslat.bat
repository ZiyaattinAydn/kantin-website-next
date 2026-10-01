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

echo.
echo [Kantin] Yerel gelistirme ortami hazirlaniyor...

rem Eski Next/Turbopack chunk'lari branch/commit degisikliklerinden sonra
rem tarayicida "Failed to fetch" uretebildigi icin yerel cache'i temizle.
if exist ".next" (
  echo [Kantin] Eski .next onbellegi temizleniyor...
  rmdir /s /q ".next"
)

rem 3000 portunda baska bir uygulama varsa Next farkli porta gecmesin.
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":3000 .*LISTENING"') do (
  echo.
  echo [HATA] 3000 portu zaten kullaniliyor. PID: %%P
  echo Gorev Yoneticisi'nden bu islemi kapatip baslat.bat'i tekrar calistir.
  echo.
  pause
  exit /b 1
)

echo [Kantin] Next.js gelistirme sunucusu 127.0.0.1:3000 adresinde baslatiliyor...
echo [Kantin] Tarayici, sunucu gercekten hazir oldugunda otomatik acilacak.

start "" powershell -NoProfile -WindowStyle Hidden -Command ^
  "$url='http://127.0.0.1:3000';" ^
  "for($i=0;$i -lt 180;$i++){" ^
  "try{$r=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1; Start-Process $url; exit}catch{};" ^
  "Start-Sleep -Milliseconds 500" ^
  "}"

call npm run dev -- --hostname 127.0.0.1 --port 3000
set "EXIT_CODE=%errorlevel%"

echo.
if "%EXIT_CODE%"=="0" (
  echo [Kantin] Gelistirme sunucusu kapatildi.
) else (
  echo [HATA] Next.js gelistirme sunucusu beklenmedik sekilde durdu.
  echo Yukaridaki ilk kirmizi hata asil sebebi gosterir.
)
echo.
pause
exit /b %EXIT_CODE%
