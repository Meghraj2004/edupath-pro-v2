const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "career-education",
  // Note: In production, use environment variables for credentials
  "private_key_id": "your-private-key-id",
  "private_key": "your-private-key",
  "client_email": "your-client-email",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
};

// For development, we'll use a simpler approach
// Initialize without service account for now
try {
  admin.initializeApp({
    projectId: 'career-education'
  });
} catch (error) {
  console.log('Firebase Admin already initialized');
}

const db = getFirestore();

// Function to create admin user
async function createAdminUser() {
  try {
    // Create admin document
    await db.collection('admins').doc('admin-megharaj').set({
      username: 'megharaj',
      email: 'megharaj@admin.com',
      role: 'super-admin',
      createdAt: new Date(),
      permissions: ['read', 'write', 'delete', 'manage-users']
    });
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Function to initialize sample data
async function initializeSampleData() {
  try {
    // Sample colleges
    const colleges = [
      {
        name: 'Indian Institute of Technology Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        type: 'Public',
        rating: 4.8,
        ranking: 2,
        programs: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering'],
        description: 'Premier engineering institute known for excellence in technology and research.',
        fees: 200000,
        admissionProcess: 'JEE Advanced',
        placements: {
          averagePackage: 1800000,
          highestPackage: 5000000,
          placementRate: 95
        }
      },
      {
        name: 'University of Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        type: 'Public',
        rating: 4.5,
        ranking: 15,
        programs: ['Arts', 'Science', 'Commerce', 'Law'],
        description: 'One of India\'s largest and most prestigious universities.',
        fees: 50000,
        admissionProcess: 'CUET',
        placements: {
          averagePackage: 800000,
          highestPackage: 2500000,
          placementRate: 85
        }
      }
    ];

    // Add colleges to database
    for (const college of colleges) {
      await db.collection('colleges').add(college);
    }
    
    // Sample scholarships
    const scholarships = [
      {
        name: 'National Scholarship Portal - Central Sector Scheme',
        description: 'Scholarship for meritorious students from economically weaker sections',
        provider: 'Central Government',
        amount: 12000,
        type: 'Merit-based',
        eligibility: {
          category: ['General', 'SC', 'ST', 'OBC'],
          class: ['12', 'Graduation'],
          income: 250000
        },
        applicationDeadline: new Date('2024-12-31'),
        applicationLink: 'https://scholarships.gov.in'
      }
    ];
    
    for (const scholarship of scholarships) {
      await db.collection('scholarships').add(scholarship);
    }
    
    // Sample quiz questions
    const quizQuestions = [
      {
        id: 1,
        question: 'Which subject interests you the most?',
        options: [
          { text: 'Mathematics and Physics', value: 'STEM' },
          { text: 'Literature and Languages', value: 'Arts' },
          { text: 'Business and Economics', value: 'Commerce' },
          { text: 'Biology and Chemistry', value: 'Medical' }
        ],
        category: 'interests'
      }
    ];
    
    for (const question of quizQuestions) {
      await db.collection('quizQuestions').add(question);
    }
    
    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

// Main function
async function initialize() {
  console.log('Initializing Firebase project...');
  await createAdminUser();
  await initializeSampleData();
  console.log('Firebase initialization complete!');
}

// Run initialization
if (require.main === module) {
  initialize().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });
}

module.exports = { initialize };