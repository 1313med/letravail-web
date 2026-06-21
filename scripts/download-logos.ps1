$ErrorActionPreference = "Stop"
$outDir = Join-Path $PSScriptRoot "..\public\logos"
$headers = @{ "User-Agent" = "LetravailWeb/1.0 (https://letravail.ma; logo import)" }

$logos = [ordered]@{
  "attijariwafa-bank.png" = "https://upload.wikimedia.org/wikipedia/en/4/49/ATTIJARIWAFA_BANK_LOGO.png"
  "cih-bank.png"          = "https://upload.wikimedia.org/wikipedia/commons/4/4e/CIH_Bank_logo.png"
  "bank-of-africa.png"    = "https://upload.wikimedia.org/wikipedia/commons/1/1a/Bank_of_Africa_logo.png"
  "maroc-telecom.png"     = "https://upload.wikimedia.org/wikipedia/commons/5/5e/Maroc_Telecom_logo.png"
  "orange-maroc.png"      = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/512px-Orange_logo.svg.png"
  "ocp.png"               = "https://upload.wikimedia.org/wikipedia/commons/5/5f/OCP_Group_logo.png"
  "royal-air-maroc.png"   = "https://upload.wikimedia.org/wikipedia/commons/2/2e/Royal_Air_Maroc_logo.png"
  "bank-al-maghrib.png"   = "https://upload.wikimedia.org/wikipedia/commons/4/48/Bank_Al-Maghrib_logo.png"
  "renault-maroc.png"     = "https://upload.wikimedia.org/wikipedia/commons/4/4e/Renault_2021.svg.png"
  "stellantis.png"        = "https://upload.wikimedia.org/wikipedia/commons/e/e0/Stellantis.svg.png"
  "capgemini.png"         = "https://upload.wikimedia.org/wikipedia/commons/7/7d/Capgemini_201x_logo.svg.png"
  "cgi.png"               = "https://upload.wikimedia.org/wikipedia/commons/3/3a/CGI_logo.svg.png"
  "dxc-technology.png"    = "https://upload.wikimedia.org/wikipedia/commons/8/8e/DXC_Technology_logo.svg.png"
  "axa-maroc.png"         = "https://upload.wikimedia.org/wikipedia/commons/9/94/AXA_Logo.svg.png"
  "societe-generale.png"  = "https://upload.wikimedia.org/wikipedia/commons/9/93/Soci%C3%A9t%C3%A9_G%C3%A9n%C3%A9rale.svg.png"
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$ok = 0; $fail = 0

foreach ($entry in $logos.GetEnumerator()) {
  $dest = Join-Path $outDir $entry.Key
  try {
    Start-Sleep -Seconds 2
    Invoke-WebRequest -Uri $entry.Value -Headers $headers -OutFile $dest -UseBasicParsing -TimeoutSec 30
    $size = (Get-Item $dest).Length
    if ($size -lt 500) { throw "File too small ($size bytes)" }
    Write-Host "OK  $($entry.Key) ($size bytes)"
    $ok++
  } catch {
    Write-Host "FAIL $($entry.Key): $($_.Exception.Message)"
    if (Test-Path $dest) { Remove-Item $dest -Force }
    $fail++
  }
}

Write-Host "`nDownloaded $ok logos, $fail failed"
