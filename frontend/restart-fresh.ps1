# Complete Fresh Restart Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fresh Restart - Clearing All Caches  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear Vite cache
Write-Host "Step 1: Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "✓ Removed node_modules/.vite" -ForegroundColor Green
} else {
    Write-Host "- .vite cache not found" -ForegroundColor Gray
}

# Step 2: Clear dist
Write-Host ""
Write-Host "Step 2: Clearing dist folder..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✓ Removed dist" -ForegroundColor Green
} else {
    Write-Host "- dist not found" -ForegroundColor Gray
}

# Step 3: Clear npm cache
Write-Host ""
Write-Host "Step 3: Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "✓ npm cache cleared" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ All caches cleared successfully!   " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now starting dev server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: In your browser:" -ForegroundColor Red
Write-Host "1. Press Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "2. Clear 'Cached images and files'" -ForegroundColor White
Write-Host "3. Or press Ctrl+F5 for hard refresh" -ForegroundColor White
Write-Host ""

# Start dev server
npm run dev
