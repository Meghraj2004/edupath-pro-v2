Write-Host "Deploying Firestore rules and indexes..." -ForegroundColor Green
firebase deploy --only firestore:rules,firestore:indexes

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "If you see any index creation URLs, please visit them to create the required indexes." -ForegroundColor Yellow
Read-Host "Press Enter to continue"