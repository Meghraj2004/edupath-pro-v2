const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - make sure this matches your project
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Create admin user account
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'megharaj@admin.com', 
      'megharaj@123'
    );

    const user = userCredential.user;
    console.log('Admin user created with UID:', user.uid);

    // Add to users collection
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: 'Megharaj Admin',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Added user to users collection');

    // Add to admins collection for security rules
    await setDoc(doc(db, 'admins', user.uid), {
      uid: user.uid,
      username: 'megharaj',
      email: user.email,
      role: 'super-admin',
      createdAt: new Date(),
      permissions: ['read', 'write', 'delete', 'manage-users'],
      active: true
    });
    console.log('Added user to admins collection');

    // Mark setup as complete for admin creation
    await setDoc(doc(db, 'setup', 'initialized'), {
      completed: true,
      completedAt: new Date(),
      adminEmail: 'megharaj@admin.com'
    });
    console.log('Setup marked as complete');

    console.log('\n✅ SUCCESS!');
    console.log('Admin user created successfully!');
    console.log('Email: megharaj@admin.com');
    console.log('Password: megharaj@123');
    console.log('\nYou can now log in to the admin panel.');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.code === 'auth/email-already-in-use') {
      console.log('\nℹ️  Admin user already exists. You can log in with:');
      console.log('Email: megharaj@admin.com');
      console.log('Password: megharaj@123');
    }
  }
}

// Run the script
createAdminUser().catch(console.error);