param(
  [string]$ProjectPath = "",
  [string]$ArchivePath = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)][string]$Command,
    [Parameter(Mandatory = $false)][string[]]$Arguments = @()
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Command komutu başarısız oldu. Çıkış kodu: $LASTEXITCODE"
  }
}

function Resolve-ProjectRoot {
  param([string]$RequestedPath)

  $candidates = @()

  if ($RequestedPath) {
    $candidates += $RequestedPath
  }

  $candidates += (Get-Location).Path
  $candidates += $PSScriptRoot

  foreach ($candidate in $candidates | Select-Object -Unique) {
    $resolved = Resolve-Path -LiteralPath $candidate -ErrorAction SilentlyContinue
    if (
      $resolved -and
      (Test-Path -LiteralPath (Join-Path $resolved.Path "package.json")) -and
      (Test-Path -LiteralPath (Join-Path $resolved.Path ".git"))
    ) {
      return $resolved.Path
    }
  }

  throw "Proje kökü bulunamadı. Betiği kantin-website-next klasöründe çalıştır veya -ProjectPath parametresi ver."
}

function Resolve-Archive {
  param(
    [string]$RequestedArchive,
    [string]$ProjectRoot
  )

  $archiveName = "kantin-faz14g-14i-degisen-dosyalar.zip"
  $candidates = @()

  if ($RequestedArchive) {
    $candidates += $RequestedArchive
  }

  $candidates += (Join-Path $ProjectRoot $archiveName)
  $candidates += (Join-Path $PSScriptRoot $archiveName)
  $candidates += (Join-Path $env:USERPROFILE "Downloads\$archiveName")

  foreach ($candidate in $candidates | Select-Object -Unique) {
    $resolved = Resolve-Path -LiteralPath $candidate -ErrorAction SilentlyContinue
    if ($resolved) {
      return $resolved.Path
    }
  }

  throw @"
$archiveName bulunamadı.

ZIP dosyasını şu konumlardan birine koy:
- Proje kökü
- Bu betiğin bulunduğu klasör
- İndirilenler klasörü

Alternatif:
powershell -ExecutionPolicy Bypass -File .\uygula-faz14g-14i.ps1 -ArchivePath "C:\tam\yol\paket.zip"
"@
}

$projectRoot = Resolve-ProjectRoot -RequestedPath $ProjectPath
$archive = Resolve-Archive -RequestedArchive $ArchivePath -ProjectRoot $projectRoot
$logPath = Join-Path $projectRoot "faz14g-14i-uygulama.log"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("kantin-faz14g-14i-" + [guid]::NewGuid().ToString("N"))

Start-Transcript -Path $logPath -Force | Out-Null

try {
  Set-Location -LiteralPath $projectRoot

  Write-Step "Proje ve paket doğrulanıyor"
  Write-Host "Proje: $projectRoot"
  Write-Host "Paket : $archive"

  $dirty = (& git status --porcelain)
  if ($LASTEXITCODE -ne 0) {
    throw "Git durumu okunamadı."
  }

  if ($dirty) {
    Write-Host ""
    Write-Host "Çalışma ağacı temiz değil. Dosya kaybını önlemek için işlem durduruldu." -ForegroundColor Yellow
    Write-Host "Önce değişiklikleri commit et veya stash kullan:"
    Write-Host '  git add .'
    Write-Host '  git commit -m "security: complete Faz 14F audit reliability"'
    Write-Host "veya"
    Write-Host '  git stash push -u -m "faz14g-oncesi-yedek"'
    throw "Kirli çalışma ağacı."
  }

  $currentBranch = (& git branch --show-current).Trim()
  if ($LASTEXITCODE -ne 0) {
    throw "Aktif branch okunamadı."
  }

  if ($currentBranch -eq "faz-14f-audit") {
    $existingBranch = (& git branch --list "faz-14g-14i").Trim()
    if ($existingBranch) {
      Write-Step "Mevcut faz-14g-14i branch'ine geçiliyor"
      Invoke-Checked "git" @("switch", "faz-14g-14i")
    } else {
      Write-Step "faz-14g-14i branch'i oluşturuluyor"
      Invoke-Checked "git" @("switch", "-c", "faz-14g-14i")
    }
  } elseif ($currentBranch -ne "faz-14g-14i") {
    throw "Aktif branch '$currentBranch'. Betiği faz-14f-audit veya faz-14g-14i branch'inde çalıştır."
  }

  Write-Step "Faz 14G-14I paketi açılıyor"
  New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null
  Expand-Archive -LiteralPath $archive -DestinationPath $tempRoot -Force

  Write-Step "Güncel dosyalar proje üzerine kopyalanıyor"
  Get-ChildItem -LiteralPath $tempRoot -Force | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $projectRoot -Recurse -Force
  }

  Write-Step "Eski ve kullanılmayan dosyalar kaldırılıyor"
  $obsoleteFiles = @(
    "src/content/admin.ts",
    "src/content/home.ts",
    "src/content/menu.ts",
    "src/content/site.ts",
    "src/components/events/EventCards.tsx",
    "src/components/home/HomeMenuBranchCard.tsx",
    "src/components/layout/navigation.ts"
  )

  foreach ($relativePath in $obsoleteFiles) {
    $fullPath = Join-Path $projectRoot $relativePath
    if (Test-Path -LiteralPath $fullPath) {
      Remove-Item -LiteralPath $fullPath -Force
      Write-Host "Silindi: $relativePath"
    }
  }

  Write-Step "Bağımlılıklar kuruluyor"
  Invoke-Checked "npm.cmd" @("install")

  Write-Step "Unit testler çalıştırılıyor"
  Invoke-Checked "npm.cmd" @("run", "test:unit")

  Write-Step "ESLint çalıştırılıyor"
  Invoke-Checked "npm.cmd" @("run", "lint")

  Write-Step "TypeScript kontrolü çalıştırılıyor"
  Invoke-Checked "npx.cmd" @("tsc", "--noEmit")

  Write-Step "Production build oluşturuluyor"
  Invoke-Checked "npm.cmd" @("run", "build")

  Write-Step "Bağımlılık güvenlik taraması çalıştırılıyor"
  Invoke-Checked "npm.cmd" @("audit")

  Write-Step "Git diff biçim kontrolü"
  Invoke-Checked "git" @("diff", "--check")

  Write-Step "İşlem tamamlandı"
  Write-Host ""
  Write-Host "Aktif branch:" -ForegroundColor Green
  & git branch --show-current

  Write-Host ""
  Write-Host "Değişen dosyalar:" -ForegroundColor Green
  & git status --short

  Write-Host ""
  Write-Host "Diff özeti:" -ForegroundColor Green
  & git diff --stat

  Write-Host ""
  Write-Host "Kontroller başarılıysa commit komutları:" -ForegroundColor Yellow
  Write-Host '  git add .'
  Write-Host '  git commit -m "refactor: complete Faz 14G through 14I"'
  Write-Host '  git push -u origin faz-14g-14i'
  Write-Host ""
  Write-Host "Log dosyası: $logPath"
}
catch {
  Write-Host ""
  Write-Host "İşlem durdu: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Ayrıntılı log: $logPath"
  exit 1
}
finally {
  if (Test-Path -LiteralPath $tempRoot) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
  }

  Stop-Transcript | Out-Null
}
