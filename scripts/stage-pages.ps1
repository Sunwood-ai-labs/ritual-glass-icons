$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root ".dist-pages"

if (Test-Path $dist) {
  Remove-Item $dist -Recurse -Force
}

New-Item -ItemType Directory -Path $dist | Out-Null
Copy-Item (Join-Path $root "index.html") $dist
Copy-Item (Join-Path $root "site.webmanifest") $dist
Copy-Item (Join-Path $root "robots.txt") $dist
Copy-Item (Join-Path $root ".nojekyll") $dist
Copy-Item (Join-Path $root "icons") (Join-Path $dist "icons") -Recurse
Copy-Item (Join-Path $root "assets") (Join-Path $dist "assets") -Recurse

Write-Output "Staged static site to $dist"
