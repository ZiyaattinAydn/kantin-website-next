$ErrorActionPreference = "Stop"
if (-not (Test-Path "package.json")) {
  throw "Bu komutu kantin-website-next proje kökünde çalıştır."
}
Write-Host "Kantin canlı admin yazma kabul aracı v5.0.0 (final sağlamlaştırılmış sürüm)" -ForegroundColor Cyan
Write-Host "UYARI: Bu test yalnız TEST_QA_ önekli geçici canlı kayıtlar oluşturur ve temizlemeyi dener." -ForegroundColor Yellow
$confirm = Read-Host "Devam etmek için TEST_YAZMA_TESTI_ONAYLI yaz"
if ($confirm -ne "TEST_YAZMA_TESTI_ONAYLI") { throw "Onay eşleşmedi; test iptal edildi." }
$email = Read-Host "Admin e-posta"
$password = Read-Host "Admin şifre" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
try { $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
$env:QA_WRITE_CONFIRM = $confirm
$env:E2E_ADMIN_EMAIL = $email
$env:E2E_ADMIN_PASSWORD = $plain
if (-not $env:QA_BASE_URL) { $env:QA_BASE_URL = "https://kantin-website-ziyaattinaydns-projects.vercel.app" }
try {
  node qa-live-write/live-admin-write-acceptance.mjs
}
finally {
  Remove-Item Env:E2E_ADMIN_PASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:E2E_ADMIN_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:QA_WRITE_CONFIRM -ErrorAction SilentlyContinue
  $plain = $null
}
