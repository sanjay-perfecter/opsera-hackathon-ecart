$ErrorActionPreference = 'Stop'

$scoopShims = "$env:USERPROFILE\scoop\shims"
$pyScripts  = "$env:APPDATA\Python\Python314\Scripts"

$current = [Environment]::GetEnvironmentVariable('Path', 'User')
$parts = $current -split ';' | Where-Object { $_ -ne '' }

$added = @()
foreach ($p in @($scoopShims, $pyScripts)) {
    if ($parts -notcontains $p) {
        $parts += $p
        $added += $p
    }
}

if ($added.Count -gt 0) {
    $new = ($parts -join ';')
    [Environment]::SetEnvironmentVariable('Path', $new, 'User')
    Write-Host "Added to User PATH:"
    $added | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "Both paths already on User PATH."
}

# Verify in current shell too
$env:PATH = "$scoopShims;$pyScripts;$env:PATH"
Write-Host "`n=== verify ==="
gitleaks version
grype version 2>&1 | Select-String -Pattern 'Version:' | Select-Object -First 1
hadolint --version
semgrep --version
checkov --version
