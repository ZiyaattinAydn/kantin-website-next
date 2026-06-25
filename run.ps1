$ErrorActionPreference = "Stop"
if (-not (Test-Path "package.json")) {
  throw "Bu komutu kantin-website-next proje kökünde çalıştır."
}
$email = Read-Host "Admin e-posta"
$securePassword = Read-Host "Admin şifre" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  $env:E2E_ADMIN_EMAIL = $email
  $env:E2E_ADMIN_PASSWORD = $plainPassword
  if (-not $env:QA_BASE_URL) {
    $env:QA_BASE_URL = "https://kantin-website-ziyaattinaydns-projects.vercel.app"
  }
  node qa-live/live-admin-smoke.mjs
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  Remove-Item Env:E2E_ADMIN_PASSWORD -ErrorAction SilentlyContinue
}
