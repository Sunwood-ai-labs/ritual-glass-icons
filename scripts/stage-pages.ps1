$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root ".dist-pages"
$scriptsDist = Join-Path $dist "scripts"

if (Test-Path $dist) {
  Remove-Item $dist -Recurse -Force
}

New-Item -ItemType Directory -Path $dist | Out-Null
New-Item -ItemType Directory -Path $scriptsDist | Out-Null

Copy-Item (Join-Path $root "index.html") $dist
Copy-Item (Join-Path $root "site.webmanifest") $dist
Copy-Item (Join-Path $root "robots.txt") $dist
Copy-Item (Join-Path $root ".nojekyll") $dist
Copy-Item (Join-Path $root "assets") (Join-Path $dist "assets") -Recurse
Copy-Item (Join-Path $root "collections") (Join-Path $dist "collections") -Recurse
Copy-Item (Join-Path $root "scripts\site-catalog.mjs") $scriptsDist

Write-Output "Staged static site to $dist"
