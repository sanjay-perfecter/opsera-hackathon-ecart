$ErrorActionPreference = 'Continue'
$env:PATH = "$env:USERPROFILE\scoop\shims;$env:PATH"
Write-Host "=== scoop version ==="
scoop --version
Write-Host "=== installing gitleaks grype hadolint ==="
scoop install gitleaks grype hadolint
Write-Host "=== verifying ==="
gitleaks version
grype version
hadolint --version
