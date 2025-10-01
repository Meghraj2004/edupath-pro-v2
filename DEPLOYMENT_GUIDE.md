# Firebase Deployment Instructions

## Option 1: Manual Firestore Rules Update (Recommended)

Since you might encounter authentication issues with Firebase CLI, the easiest way to fix the permissions error is to manually update the Firestore security rules:

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `career-education`
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the content from `firestore.rules` file
5. Click **Publish**

### Rules Content:
Copy and paste the entire content from the `firestore.rules` file in this directory.

## Option 2: Using Firebase CLI

If you want to use Firebase CLI:

```bash
# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Option 3: Quick Fix for Development

For immediate testing, you can temporarily use these permissive rules (NOT for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Next Steps After Rules Deployment:

1. Visit `/setup` page in your application
2. Click "Complete Setup" to initialize data and create admin user
3. Use admin credentials: `megharaj@edupath.com` / `megharaj@123`
4. Start using the application!

## Troubleshooting:

If you still get permission errors:
1. Check that you're logged in (authentication working)
2. Verify the rules are deployed correctly
3. Make sure the collections exist (run setup page)
4. Check browser console for detailed error messages