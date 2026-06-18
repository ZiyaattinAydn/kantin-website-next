@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo.
echo ========================================
echo   kantin. yerel test baslatiliyor
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi. Once Node.js LTS kurulmali.
  pause
  exit /b 1
)

if not exist package.json (
  echo package.json bulunamadi. Bu dosyayi proje kokunde calistir.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Gerekli paketler ilk kez kuruluyor...
  call npm install
  if errorlevel 1 goto :error
)

echo Tarayici birkac saniye icinde acilacak.
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"
call npm run dev
if errorlevel 1 goto :error

goto :end

:error
echo.
echo Proje baslatilirken hata olustu.
pause
exit /b 1

:end
endlocal
