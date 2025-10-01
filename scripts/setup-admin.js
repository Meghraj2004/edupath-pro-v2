// Script to create admin user in Firestore
// This should be run after you have logged in as admin at least once

console.log("=== ADMIN SETUP INSTRUCTIONS ===");
console.log("");
console.log("1. First, login to your application with admin credentials");
console.log("2. Go to Firebase Console: https://console.firebase.google.com/project/career-education/firestore");
console.log("3. Look for the 'users' collection and find your admin user document");
console.log("4. Copy the document ID (this is your admin user's UID)");
console.log("5. Create a new collection called 'admins'");
console.log("6. Create a document with the admin user's UID as the document ID");
console.log("7. Add any field to the document (e.g., role: 'admin', createdAt: current timestamp)");
console.log("");
console.log("Example admin document structure:");
console.log("{");
console.log("  \"role\": \"admin\",");
console.log("  \"email\": \"admin@example.com\",");
console.log("  \"createdAt\": \"2024-09-27T00:00:00.000Z\",");
console.log("  \"permissions\": [\"read\", \"write\", \"delete\"]");
console.log("}");
console.log("");
console.log("=== ALTERNATIVE METHOD ===");
console.log("If you know your admin email, you can create the admin document manually:");
console.log("");
console.log("1. Go to Firebase Console > Authentication");
console.log("2. Find your admin user and copy the User UID");
console.log("3. Go to Firestore > Create collection 'admins'");
console.log("4. Create document with UID as document ID");
console.log("5. Add the admin data shown above");
console.log("");
console.log("After adding the admin document, logout and login again to refresh the admin status.");