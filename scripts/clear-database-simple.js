const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, writeBatch } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration (from your firebase config)
const firebaseConfig = {
  // You need to add your Firebase config here
  // Get it from Firebase Console > Project Settings > General > Your apps
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function clearDatabase() {
  console.log('🔥 Starting database cleanup...');
  
  try {
    // You need to sign in as an admin user first
    console.log('🔐 Please sign in with admin credentials...');
    
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
      
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty) {
        console.log(`   ✅ Collection ${collectionName} is already empty`);
        continue;
      }

      // Delete documents in batches
      const batch = writeBatch(db);
      let batchCount = 0;
      
      snapshot.forEach((document) => {
        // Skip admin documents if they exist
        if (collectionName === 'users' && document.id.includes('admin')) {
          console.log(`   ⚠️  Skipping admin user: ${document.id}`);
          return;
        }
        
        batch.delete(document.ref);
        batchCount++;
      });
      
      if (batchCount > 0) {
        await batch.commit();
        console.log(`   ✅ Deleted ${batchCount} documents from ${collectionName}`);
      }
    }

    console.log('🎉 Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

// Run the cleanup
clearDatabase();