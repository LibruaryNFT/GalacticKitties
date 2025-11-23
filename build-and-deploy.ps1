# Build script for production deployment (PowerShell)

Write-Host "Building React app..." -ForegroundColor Green
Set-Location viewer
npm run build
Set-Location ..

Write-Host "Build complete! Files are in dist/" -ForegroundColor Green
Write-Host ""
Write-Host "For GitHub Pages:" -ForegroundColor Yellow
Write-Host "1. Copy contents of dist/ to root directory, OR"
Write-Host "2. Configure GitHub Pages to serve from /dist folder"
Write-Host ""
Write-Host "For other hosting:" -ForegroundColor Yellow
Write-Host "Upload the contents of dist/ to your web server"

