#!/bin/bash

echo "🔥 Firebase Database Cleanup Script"
echo "This will delete ALL data from Firestore collections"
echo "⚠️  WARNING: This action cannot be undone!"
echo ""

read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 1
fi

echo ""
echo "🗑️  Starting cleanup..."

# Collections to delete
collections=(
    "users"
    "courses"
    "colleges"
    "careers"
    "scholarships"
    "bookmarks"
    "applications"
    "activities"
    "quizResults"
    "timeline"
)

# Delete each collection
for collection in "${collections[@]}"; do
    echo "Deleting collection: $collection"
    firebase firestore:delete --project career-education --recursive --yes "/$collection" 2>/dev/null || echo "Collection $collection might be empty or already deleted"
done

echo ""
echo "✅ Cleanup completed!"
echo "📝 Note: Admin users in the 'admins' collection were preserved"
echo ""
echo "Next steps:"
echo "1. Add new sample data manually or run data population script"
echo "2. Test your application"