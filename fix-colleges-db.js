const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, addDoc } = require('firebase/firestore');

// Firebase configuration
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
const db = getFirestore(app);

const properColleges = [
  {
    name: 'Banaras Hindu University',
    location: {
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221005'
    },
    coursesOffered: [
      { id: 'btech-cs', name: 'B.Tech Computer Science', duration: '4 years', degree: 'B.Tech' },
      { id: 'ba-eng', name: 'Bachelor of Arts English', duration: '3 years', degree: 'B.A.' },
      { id: 'bsc-phy', name: 'B.Sc Physics', duration: '3 years', degree: 'B.Sc.' }
    ],
    cutoffs: {
      'btech-cs': { general: 85, obc: 82, sc: 75, st: 70 },
      'ba-eng': { general: 70, obc: 67, sc: 60, st: 55 }
    },
    medium: ['English', 'Hindi'],
    facilities: ['Central Library', 'Hostels', 'Sports Complex', 'Medical Center'],
    fees: {
      'btech-cs': 60000,
      'ba-eng': 25000,
      'bsc-phy': 30000
    },
    website: 'https://www.bhu.ac.in/',
    contact: {
      phone: '+91-542-2307016',
      email: 'info@bhu.ac.in'
    },
    isGovernment: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'BITS Pilani',
    location: {
      district: 'Pilani',
      state: 'Rajasthan',
      pincode: '333031'
    },
    coursesOffered: [
      { id: 'btech-cs', name: 'B.Tech Computer Science', duration: '4 years', degree: 'B.Tech' },
      { id: 'btech-ee', name: 'B.Tech Electrical Engineering', duration: '4 years', degree: 'B.Tech' }
    ],
    cutoffs: {
      'btech-cs': { general: 350, obc: 340, sc: 320, st: 310 },
      'btech-ee': { general: 320, obc: 310, sc: 290, st: 280 }
    },
    medium: ['English'],
    facilities: ['World-class Labs', 'Innovation Centers', 'Hostels', 'Sports Facilities'],
    fees: {
      'btech-cs': 450000,
      'btech-ee': 450000
    },
    website: 'https://www.bits-pilani.ac.in/',
    contact: {
      phone: '+91-1596-242210',
      email: 'info@pilani.bits-pilani.ac.in'
    },
    isGovernment: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Christ University',
    location: {
      district: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560029'
    },
    coursesOffered: [
      { id: 'bba', name: 'Bachelor of Business Administration', duration: '3 years', degree: 'BBA' },
      { id: 'bca', name: 'Bachelor of Computer Applications', duration: '3 years', degree: 'BCA' }
    ],
    cutoffs: {
      'bba': { general: 85, obc: 82, sc: 75, st: 70 },
      'bca': { general: 80, obc: 77, sc: 70, st: 65 }
    },
    medium: ['English'],
    facilities: ['Modern Classrooms', 'Computer Labs', 'Library', 'Hostels'],
    fees: {
      'bba': 200000,
      'bca': 180000
    },
    website: 'https://christuniversity.in/',
    contact: {
      phone: '+91-80-4012-9100',
      email: 'info@christuniversity.in'
    },
    isGovernment: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function fixCollegesData() {
  try {
    console.log('🔄 Starting college data cleanup...');
    
    // Clear existing colleges
    const snapshot = await getDocs(collection(db, 'colleges'));
    console.log(`Found ${snapshot.size} existing colleges to remove`);
    
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'colleges', docSnap.id));
    }
    console.log('✅ Cleared existing colleges');
    
    // Add new properly structured colleges
    for (const college of properColleges) {
      await addDoc(collection(db, 'colleges'), college);
      console.log(`✅ Added: ${college.name}`);
    }
    
    console.log('\n🎉 SUCCESS! College data has been fixed!');
    console.log('- Removed old incorrectly structured data');
    console.log('- Added 3 properly structured colleges');
    console.log('- All colleges now have proper location.district and location.state');
    console.log('\nThe admin dashboard should now display college locations correctly.');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

// Run the fix
fixCollegesData().catch(console.error);