Write-Host "Firebase Database Cleanup Script" -ForegroundColor Red
Write-Host "This will delete ALL data from Firestore collections" -ForegroundColor Yellow
Write-Host "WARNING: This action cannot be undone!" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Are you sure you want to continue? (type 'yes' to confirm)"
if ($confirm -ne "yes") {
    Write-Host "Operation cancelled." -ForegroundColor Green
    exit
}

Write-Host ""
Write-Host "Starting cleanup..." -ForegroundColor Yellow

# Collections to delete
$collections = @(
    "users",
    "courses", 
    "colleges",
    "careers",
    "scholarships",
    "bookmarks",
    "applications",
    "activities",
    "quizResults",
    "timeline"
)

# Delete each collection
foreach ($collection in $collections) {
    Write-Host "Deleting collection: $collection" -ForegroundColor Cyan
    try {
        firebase firestore:delete --project career-education --recursive --yes "/$collection" 2>$null
        Write-Host "  Collection $collection deleted" -ForegroundColor Green
    } catch {
        Write-Host "  Collection $collection might be empty or already deleted" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Cleanup completed!" -ForegroundColor Green
Write-Host "Note: Admin users in the admins collection were preserved" -ForegroundColor Blue
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add new sample data manually or run data population script"
Write-Host "2. Test your application"