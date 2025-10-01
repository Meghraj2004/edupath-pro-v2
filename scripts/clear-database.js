const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You need to download this from Firebase Console

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function clearDatabase() {
  console.log('🔥 Starting database cleanup...');
  
  try {
    // Collections to clear completely
    const collectionsToDelete = [
      'users',
      'courses', 
      'colleges',
      'careers',
      'scholarships',
      'bookmarks',
      'applications',
      'activities',
      'quizResults',
      'timeline'
    ];

    for (const collectionName of collectionsToDelete) {
      console.log(`🗑️  Clearing collection: ${collectionName}`);
      
      const collection = db.collection(collectionName);
      const snapshot = await collection.get();
      
      if (snapshot.empty) {
        console.log(`   ✅ Collection ${collectionName} is already empty`);
        continue;
      }

      // Delete documents in batches
      const batch = db.batch();
      let batchCount = 0;
      
      for (const doc of snapshot.docs) {
        // Skip admin documents if they exist
        if (collectionName === 'users' && doc.id.includes('admin')) {
          console.log(`   ⚠️  Skipping admin user: ${doc.id}`);
          continue;
        }
        
        batch.delete(doc.ref);
        batchCount++;
        
        // Commit batch when it reaches 500 (Firestore limit)
        if (batchCount === 500) {
          await batch.commit();
          console.log(`   📦 Committed batch of ${batchCount} deletions`);
          batchCount = 0;
        }
      }
      
      // Commit remaining documents
      if (batchCount > 0) {
        await batch.commit();
        console.log(`   📦 Committed final batch of ${batchCount} deletions`);
      }
      
      console.log(`   ✅ Collection ${collectionName} cleared successfully`);
    }

    // Also clear the admins collection except the actual admin entries
    console.log('🔐 Checking admins collection...');
    const adminsSnapshot = await db.collection('admins').get();
    if (!adminsSnapshot.empty) {
      console.log(`   ✅ Found ${adminsSnapshot.size} admin(s) - keeping them`);
    } else {
      console.log('   ⚠️  No admin users found');
    }

    console.log('🎉 Database cleanup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run the data population script to add sample data');
    console.log('2. Test the dashboard functionality');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    // Close the admin app
    admin.app().delete();
  }
}

// Run the cleanup
clearDatabase();