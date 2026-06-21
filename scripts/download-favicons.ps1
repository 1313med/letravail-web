$ErrorActionPreference = "Continue"
$outDir = Join-Path $PSScriptRoot "..\public\logos"
$headers = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }

# slug => domain
$domains = [ordered]@{
  "attijariwafa-bank" = "attijariwafabank.com"
  "cih-bank"          = "cihbank.ma"
  "bank-of-africa"    = "bankofafrica.ma"
  "banque-populaire"  = "gp.ma"
  "bmci"              = "bmci.ma"
  "credit-agricole"   = "credit-agricole.ma"
  "societe-generale"  = "societegenerale.ma"
  "cdm"               = "creditdumaroc.ma"
  "bank-al-maghrib"   = "bkam.ma"
  "maroc-telecom"     = "iam.ma"
  "orange-maroc"      = "orange.ma"
  "inwi"              = "inwi.ma"
  "ocp"               = "ocpgroup.ma"
  "royal-air-maroc"   = "royalairmaroc.com"
  "oncf"              = "oncf.ma"
  "managem"           = "managemgroup.com"
  "lafargeholcim"     = "lafargeholcim.ma"
  "renault-maroc"     = "renault.ma"
  "stellantis"        = "stellantis.com"
  "marjane"           = "marjane.ma"
  "labelvie"          = "labelvie.ma"
  "aswak-assalam"     = "aswakassalam.com"
  "bim"               = "bim.ma"
  "auto-hall"         = "autohall.ma"
  "capgemini"         = "capgemini.com"
  "cgi"               = "cgi.com"
  "dxc-technology"    = "dxc.com"
  "wafa-assurance"    = "wafabank.com"
  "rma-watanya"       = "rmawatanya.ma"
  "saham-assurance"   = "sahamassurance.ma"
  "axa-maroc"         = "axa.ma"
  "cdg"               = "cdg.ma"
  "anapec"            = "anapec.org"
  "emploi-public"     = "emploipublic.ma"
  "onee"              = "onee.ma"
  "masen"             = "masen.ma"
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$ok = 0

foreach ($entry in $domains.GetEnumerator()) {
  $slug = $entry.Key
  $domain = $entry.Value
  $dest = Join-Path $outDir "$slug.png"
  $url = "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://$domain&size=256"
  try {
    Invoke-WebRequest -Uri $url -Headers $headers -OutFile $dest -UseBasicParsing -TimeoutSec 25
    $size = (Get-Item $dest).Length
    if ($size -lt 400) {
      Remove-Item $dest -Force
      Write-Host "SKIP $slug (too small: $size)"
      continue
    }
    Write-Host "OK  $slug ($size bytes)"
    $ok++
  } catch {
    Write-Host "FAIL $slug"
    if (Test-Path $dest) { Remove-Item $dest -Force }
  }
  Start-Sleep -Milliseconds 500
}

Write-Host "`nSaved $ok PNG logos"
