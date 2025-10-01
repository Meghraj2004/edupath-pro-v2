@echo off
echo Deploying Firestore rules and indexes...
firebase deploy --only firestore:rules,firestore:indexes
echo.
echo Deployment complete!
echo.
echo If you see any index creation URLs, please visit them to create the required indexes.
pause