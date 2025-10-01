import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB5rOnr90VlQ_qsX7NlcGVBqG1vwf8OKvo",
  authDomain: "career-education.firebaseapp.com",
  projectId: "career-education",
  storageBucket: "career-education.firebasestorage.app",
  messagingSenderId: "500848380035",
  appId: "1:500848380035:web:9f38bf43826e308b0af3b6",
  measurementId: "G-B43L116GV2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    // Create admin document for the user megharaj@admin.com
    const adminData = {
      uid: 'aar2PMLqRdVTJK5WRpREcayoOC72',
      email: 'megharaj@admin.com',
      role: 'admin',
      name: 'Megha Raj',
      createdAt: new Date(),
      permissions: {
        manageUsers: true,
        manageCourses: true,
        manageColleges: true,
        manageCareers: true,
        manageScholarships: true
      }
    };

    await setDoc(doc(db, 'admins', 'aar2PMLqRdVTJK5WRpREcayoOC72'), adminData);
    console.log('Admin user document created successfully!');
    console.log('Admin UID:', adminData.uid);
    console.log('Admin Email:', adminData.email);

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();