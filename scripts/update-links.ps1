# Script to update all internal links after folder reorganization
# Run from project root: .\scripts\update-links.ps1

$ErrorActionPreference = "Stop"

# Define path mappings (old -> new)
$categoryPages = @(
    "navidad.html",
    "clasicos-pop.html",
    "pop-latino.html",
    "otono.html",
    "cumpleanos.html",
    "mix.html",
    "rock.html",
    "musica-espanol.html",
    "musica-ingles.html"
)

$toolPages = @(
    "generador.html",
    "jugar.html",
    "online.html"
)

$legalPages = @(
    "privacy.html",
    "cookies.html",
    "legal.html",
    "faq.html",
    "contacto.html",
    "about.html"
)

# Get all HTML files in project (excluding moved files)
$htmlFiles = Get-ChildItem -Path . -Recurse -Include *.html,*.md | Where-Object {
    $_.FullName -notlike "*\node_modules\*" -and
    $_.FullName -notlike "*\.git\*"
}

Write-Host "Found $($htmlFiles.Count) HTML/MD files to update..." -ForegroundColor Cyan

$updatesCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Determine the base path for this file (how many ../ needed)
    $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart("\")
    $depth = ($relativePath.Split("\").Length - 1)
    
    # Calculate prefix based on depth
    if ($depth -eq 0) {
        # Root level (index.html, blog.html, etc.)
        $prefix = ""
    } elseif ($depth -eq 1) {
        # First level (blog/, pages/)
        $prefix = "../"
    } elseif ($depth -eq 2) {
        # Second level (pages/categories/, pages/tools/, etc.)
        $prefix = "../../"
    } else {
        # Deeper (blog/posts/, etc.)
        $prefix = "../" * $depth
    }
    
    # Update category links
    foreach ($page in $categoryPages) {
        $oldPattern = "href=`"$page`""
        $newPath = "${prefix}pages/categories/$page"
        $newPattern = "href=`"$newPath`""
        
        if ($content -match $oldPattern) {
            $content = $content -replace $oldPattern, $newPattern
            $updatesCount++
        }
    }
    
    # Update tool links
    foreach ($page in $toolPages) {
        $oldPattern = "href=`"$page`""
        $newPath = "${prefix}pages/tools/$page"
        $newPattern = "href=`"$newPath`""
        
        if ($content -match $oldPattern) {
            $content = $content -replace $oldPattern, $newPattern
            $updatesCount++
        }
    }
    
    # Update legal links
    foreach ($page in $legalPages) {
        $oldPattern = "href=`"$page`""
        $newPath = "${prefix}pages/legal/$page"
        $newPattern = "href=`"$newPath`""
        
        if ($content -match $oldPattern) {
            $content = $content -replace $oldPattern, $newPattern
            $updatesCount++
        }
    }
    
    # Update asset paths for moved files (CSS, JS, icons)
    if ($file.DirectoryName -like "*\pages\*") {
        # Files in pages/ need to adjust asset paths
        $content = $content -replace 'href="assets/', 'href="../../assets/'
        $content = $content -replace 'src="assets/', 'src="../../assets/'
        $content = $content -replace 'content="assets/', 'content="../../assets/'
        
        # Fix manifest and icons
        $content = $content -replace 'href="/manifest.json"', 'href="../../manifest.json"'
    }
    
    # Save if modified
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Updated: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n✅ Done! Total link updates: $updatesCount" -ForegroundColor Green
Write-Host "⚠️  Remember to also update:" -ForegroundColor Yellow
Write-Host "   - service-worker.js (cache paths)" -ForegroundColor Yellow
Write-Host "   - sitemap.xml (URLs)" -ForegroundColor Yellow
Write-Host "   - robots.txt (if needed)" -ForegroundColor Yellow
