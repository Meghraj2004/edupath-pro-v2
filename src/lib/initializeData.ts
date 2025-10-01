import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';

// Sample data for initialization - Fixed College Structure
const sampleColleges = [
  {
    name: 'Indian Institute of Technology Delhi',
    location: {
      district: 'New Delhi',
      state: 'Delhi',
      pincode: '110016'
    },
    coursesOffered: [
      { id: 'cs', name: 'Computer Science Engineering', duration: '4 years', degree: 'B.Tech' },
      { id: 'ee', name: 'Electrical Engineering', duration: '4 years', degree: 'B.Tech' },
      { id: 'me', name: 'Mechanical Engineering', duration: '4 years', degree: 'B.Tech' },
      { id: 'ce', name: 'Civil Engineering', duration: '4 years', degree: 'B.Tech' }
    ],
    cutoffs: {
      'cs': { general: 150, obc: 140, sc: 120, st: 110 },
      'ee': { general: 180, obc: 170, sc: 150, st: 140 }
    },
    medium: ['English'],
    facilities: ['Library', 'Hostel', 'Labs', 'Sports Complex', 'Cafeteria'],
    fees: {
      'cs': 200000,
      'ee': 200000,
      'me': 200000,
      'ce': 200000
    },
    website: 'https://home.iitd.ac.in/',
    contact: {
      phone: '+91-11-2659-1000',
      email: 'info@iitd.ac.in'
    },
    isGovernment: true
  },
  {
    name: 'University of Delhi',
    location: {
      district: 'New Delhi',
      state: 'Delhi',
      pincode: '110007'
    },
    coursesOffered: [
      { id: 'ba', name: 'Bachelor of Arts', duration: '3 years', degree: 'B.A.' },
      { id: 'bsc', name: 'Bachelor of Science', duration: '3 years', degree: 'B.Sc.' },
      { id: 'bcom', name: 'Bachelor of Commerce', duration: '3 years', degree: 'B.Com.' },
      { id: 'llb', name: 'Bachelor of Laws', duration: '3 years', degree: 'LL.B.' }
    ],
    cutoffs: {
      'ba': { general: 85, obc: 82, sc: 78, st: 75 },
      'bsc': { general: 90, obc: 87, sc: 83, st: 80 }
    },
    medium: ['English', 'Hindi'],
    facilities: ['Central Library', 'Hostels', 'Sports Complex', 'Medical Center', 'Cafeterias'],
    fees: {
      'ba': 50000,
      'bsc': 55000,
      'bcom': 50000,
      'llb': 60000
    },
    website: 'https://www.du.ac.in/',
    contact: {
      phone: '+91-11-2766-7049',
      email: 'registrar@du.ac.in'
    },
    isGovernment: true
  },
  {
    name: 'Jawaharlal Nehru University',
    location: {
      district: 'New Delhi',
      state: 'Delhi',
      pincode: '110067'
    },
    coursesOffered: [
      { id: 'ma-pol', name: 'M.A. Political Science', duration: '2 years', degree: 'M.A.' },
      { id: 'ma-int', name: 'M.A. International Studies', duration: '2 years', degree: 'M.A.' },
      { id: 'ba-lang', name: 'B.A. Language Studies', duration: '3 years', degree: 'B.A.' },
      { id: 'msc-bio', name: 'M.Sc. Biotechnology', duration: '2 years', degree: 'M.Sc.' }
    ],
    cutoffs: {
      'ma-pol': { general: 75, obc: 72, sc: 68, st: 65 },
      'ma-int': { general: 78, obc: 75, sc: 71, st: 68 }
    },
    medium: ['English'],
    facilities: ['Central Library', 'Research Centers', 'Hostels', 'Cultural Centers', 'Sports Facilities'],
    fees: {
      'ma-pol': 40000,
      'ma-int': 40000,
      'ba-lang': 35000,
      'msc-bio': 45000
    },
    website: 'https://www.jnu.ac.in/',
    contact: {
      phone: '+91-11-2670-4000',
      email: 'registrar@jnu.ac.in'
    },
    isGovernment: true
  },
  {
    name: 'Indian Institute of Technology Bombay',
    location: {
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400076'
    },
    coursesOffered: [
      { id: 'cs', name: 'Computer Science Engineering', duration: '4 years', degree: 'B.Tech' },
      { id: 'aero', name: 'Aerospace Engineering', duration: '4 years', degree: 'B.Tech' },
      { id: 'chem', name: 'Chemical Engineering', duration: '4 years', degree: 'B.Tech' },
      { id: 'ee', name: 'Electrical Engineering', duration: '4 years', degree: 'B.Tech' }
    ],
    cutoffs: {
      'cs': { general: 120, obc: 110, sc: 100, st: 90 },
      'aero': { general: 160, obc: 150, sc: 130, st: 120 }
    },
    medium: ['English'],
    facilities: ['World-class Labs', 'Innovation Cell', 'Hostels', 'Sports Complex', 'Tech Park'],
    fees: {
      'cs': 210000,
      'aero': 210000,
      'chem': 210000,
      'ee': 210000
    },
    website: 'https://www.iitb.ac.in/',
    contact: {
      phone: '+91-22-2572-2545',
      email: 'info@iitb.ac.in'
    },
    isGovernment: true
  },
  {
    name: 'Indian Institute of Science',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Public',
    rating: 4.9,
    ranking: 1,
    programs: ['Science', 'Engineering', 'Research'],
    description: 'India’s leading institute for advanced scientific and technological research.',
    fees: 150000,
    admissionProcess: 'JEE/NEET/IISc Entrance',
    placements: {
      averagePackage: 1600000,
      highestPackage: 4200000,
      placementRate: 92
    },
    website: 'https://iisc.ac.in/',
    established: 1909,
    campus: 'Urban',
    hostels: true
  },
  {
    name: 'National Institute of Technology Tiruchirappalli',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    type: 'Public',
    rating: 4.7,
    ranking: 10,
    programs: ['Civil Engineering', 'Electronics and Communication', 'Mechanical Engineering', 'Computer Science'],
    description: 'Leading NIT offering high-quality engineering education.',
    fees: 140000,
    admissionProcess: 'JEE Main + JoSAA',
    placements: {
      averagePackage: 1200000,
      highestPackage: 3000000,
      placementRate: 90
    },
    website: 'https://www.nitt.edu/',
    established: 1964,
    campus: 'Urban',
    hostels: true
  },
  {
    name: 'Banaras Hindu University',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'Public',
    rating: 4.6,
    ranking: 17,
    programs: ['Arts', 'Science', 'Medicine', 'Engineering', 'Law'],
    description: 'One of the oldest universities with a large residential campus.',
    fees: 60000,
    admissionProcess: 'CUET/JEE',
    placements: {
      averagePackage: 700000,
      highestPackage: 1800000,
      placementRate: 80
    },
    website: 'https://www.bhu.ac.in/',
    established: 1916,
    campus: 'Urban',
    hostels: true
  },
  {
    name: 'BITS Pilani',
    city: 'Pilani',
    state: 'Rajasthan',
    type: 'Private',
    rating: 4.8,
    ranking: 7,
    programs: ['Computer Science', 'Electronics', 'Mechanical Engineering', 'Pharmacy'],
    description: 'Renowned private university focused on technology and innovation.',
    fees: 450000,
    admissionProcess: 'BITSAT',
    placements: {
      averagePackage: 1800000,
      highestPackage: 3500000,
      placementRate: 94
    },
    website: 'https://www.bits-pilani.ac.in/',
    established: 1964,
    campus: 'Semi-Urban',
    hostels: true
  },
  {
    name: 'Christ University',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Private',
    rating: 4.4,
    ranking: 20,
    programs: ['Management', 'Humanities', 'Commerce', 'Law', 'Engineering'],
    description: 'Leading private university with a diverse range of programs.',
    fees: 200000,
    admissionProcess: 'CUET/Christ Entrance Test',
    placements: {
      averagePackage: 600000,
      highestPackage: 1500000,
      placementRate: 82
    },
    website: 'https://christuniversity.in/',
    established: 1969,
    campus: 'Urban',
    hostels: true
  },
  {
    name: 'Symbiosis International University',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'Private',
    rating: 4.5,
    ranking: 25,
    programs: ['Management', 'Law', 'Arts', 'Computer Science'],
    description: 'Popular private university known for MBA and international programs.',
    fees: 350000,
    admissionProcess: 'SNAP/Entrance Test',
    placements: {
      averagePackage: 900000,
      highestPackage: 2400000,
      placementRate: 88
    },
    website: 'https://siu.edu.in/',
    established: 2002,
    campus: 'Urban',
    hostels: true
  }
];


const sampleScholarships = [
  {
    name: 'National Scholarship Portal - Central Sector Scheme',
    description: 'Scholarship for meritorious students from economically weaker sections pursuing higher education',
    provider: 'Central Government',
    amount: 12000,
    type: 'Merit-based',
    eligibility: {
      category: ['General', 'SC', 'ST', 'OBC'],
      class: ['12', 'Graduation', 'Post-Graduation'],
      income: 250000
    },
    applicationDeadline: new Date('2025-12-31'),
    applicationLink: 'https://scholarships.gov.in',
    documents: ['Income Certificate', 'Caste Certificate', 'Academic Records'],
    status: 'Active'
  },
  {
    name: 'PM Scholarship Scheme',
    description: 'Scholarship for children and widows of Armed Forces personnel and Railway employees',
    provider: 'Central Government',
    amount: 25000,
    type: 'Need-based',
    eligibility: {
      category: ['General'],
      class: ['Graduation', 'Post-Graduation'],
      income: 600000
    },
    applicationDeadline: new Date('2025-11-30'),
    applicationLink: 'https://scholarships.gov.in',
    documents: ['Service Certificate', 'Income Certificate', 'Academic Records'],
    status: 'Active'
  },
  {
    name: 'Merit Scholarship for Class 12',
    description: 'State government scholarship for meritorious students completing Class 12',
    provider: 'State Government',
    amount: 8000,
    type: 'Merit-based',
    eligibility: {
      category: ['General', 'SC', 'ST', 'OBC'],
      class: ['12'],
      income: 200000
    },
    applicationDeadline: new Date('2026-03-31'),
    applicationLink: 'https://scholarships.gov.in',
    documents: ['Class 12 Marksheet', 'Income Certificate', 'Domicile Certificate'],
    status: 'Active'
  },
  {
    name: 'Minority Scholarship Scheme',
    description: 'Financial assistance for students from minority communities',
    provider: 'Central Government',
    amount: 15000,
    type: 'Need-based',
    eligibility: {
      category: ['Minority'],
      class: ['10', '12', 'Graduation'],
      income: 200000
    },
    applicationDeadline: new Date('2026-01-15'),
    applicationLink: 'https://scholarships.gov.in',
    documents: ['Minority Certificate', 'Income Certificate', 'Academic Records'],
    status: 'Active'
  },
  {
    name: 'Girl Child Education Scholarship',
    description: 'Special scholarship to promote girl child education',
    provider: 'NGO',
    amount: 10000,
    type: 'Gender-based',
    eligibility: {
      category: ['General', 'SC', 'ST', 'OBC'],
      class: ['10', '12', 'Graduation'],
      income: 300000
    },
    applicationDeadline: new Date('2026-02-28'),
    applicationLink: 'https://girlchild-scholarship.org',
    documents: ['Birth Certificate', 'Income Certificate', 'Academic Records'],
    status: 'Active'
  },
  {
    name: 'Engineering Excellence Scholarship',
    description: 'Scholarship for students pursuing engineering courses',
    provider: 'Private',
    amount: 50000,
    type: 'Merit-based',
    eligibility: {
      category: ['General', 'SC', 'ST', 'OBC'],
      class: ['Graduation'],
      income: 500000
    },
    applicationDeadline: new Date('2025-10-15'),
    applicationLink: 'https://engineering-scholarship.com',
    documents: ['JEE Scorecard', 'Income Certificate', 'Academic Records'],
    status: 'Active'
  },
  {
    name: 'Research Scholar Grant',
    description: 'Financial support for post-graduate research students',
    provider: 'Central Government',
    amount: 31000,
    type: 'Merit-based',
    eligibility: {
      category: ['General', 'SC', 'ST', 'OBC'],
      class: ['Post-Graduation'],
      income: 800000
    },
    applicationDeadline: new Date('2025-12-15'),
    applicationLink: 'https://ugc.ac.in',
    documents: ['Research Proposal', 'Academic Transcripts', 'Supervisor Recommendation'],
    status: 'Active'
  },
  {
    name: 'Sports Excellence Scholarship',
    description: 'Scholarship for talented athletes pursuing higher education',
    provider: 'State Government',
    amount: 20000,
    type: 'Sports-based',
    eligibility: {
      category: ['General', 'SC', 'ST', 'OBC'],
      class: ['12', 'Graduation'],
      income: 400000
    },
    applicationDeadline: new Date('2026-04-30'),
    applicationLink: 'https://sports-scholarship.gov.in',
    documents: ['Sports Certificate', 'Achievement Records', 'Income Certificate'],
    status: 'Active'
  },
  {
    name: 'Single Child Scholarship',
    description: 'Special scholarship for single child families',
    provider: 'State Government',
    amount: 12000,
    type: 'Need-based',
    eligibility: {
      category: ['General', 'OBC'],
      class: ['10', '12', 'Graduation'],
      income: 250000
    },
    applicationDeadline: new Date('2025-11-15'),
    applicationLink: 'https://scholarships.gov.in',
    documents: ['Single Child Certificate', 'Income Certificate', 'Academic Records'],
    status: 'Active'
  },
  {
    name: 'Innovation & Entrepreneurship Scholarship',
    description: 'Supporting innovative minds and future entrepreneurs',
    provider: 'Private',
    amount: 75000,
    type: 'Innovation-based',
    eligibility: {
      category: ['General', 'SC', 'ST', 'OBC'],
      class: ['Graduation', 'Post-Graduation'],
      income: 600000
    },
    applicationDeadline: new Date('2026-01-31'),
    applicationLink: 'https://innovation-scholarship.org',
    documents: ['Project Proposal', 'Academic Records', 'Recommendation Letters'],
    status: 'Active'
  }
];

const sampleResources = [
  {
    title: 'NCERT Digital Textbooks',
    description: 'Free digital textbooks for all classes from NCERT',
    type: 'textbook',
    category: 'Academic',
    subjects: ['Mathematics', 'Science', 'Social Science', 'English'],
    url: 'https://ncert.nic.in/textbook.php',
    isVerified: true,
    rating: 4.8,
    language: 'English'
  },
  {
    title: 'Khan Academy',
    description: 'Free online courses and practice exercises',
    type: 'course',
    category: 'Academic',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    url: 'https://www.khanacademy.org/',
    isVerified: true,
    rating: 4.7,
    language: 'English'
  }
];

const sampleQuizQuestions = [
  {
    id: 1,
    question: 'Which subject interests you the most?',
    options: [
      { text: 'Mathematics and Physics', value: 'STEM', skills: ['Analytical Thinking', 'Problem Solving'] },
      { text: 'Literature and Languages', value: 'Arts', skills: ['Communication', 'Creative Writing'] },
      { text: 'Business and Economics', value: 'Commerce', skills: ['Leadership', 'Financial Analysis'] },
      { text: 'Biology and Chemistry', value: 'Medical', skills: ['Research', 'Attention to Detail'] }
    ],
    category: 'interests',
    weight: 3
  },
  {
    id: 2,
    question: 'What type of work environment do you prefer?',
    options: [
      { text: 'Independent work with minimal supervision', value: 'Independent', skills: ['Self-motivation', 'Time Management'] },
      { text: 'Collaborative team environment', value: 'Team', skills: ['Teamwork', 'Communication'] },
      { text: 'Mix of both independent and team work', value: 'Hybrid', skills: ['Adaptability', 'Flexibility'] },
      { text: 'Structured environment with clear guidelines', value: 'Structured', skills: ['Organization', 'Following Protocols'] }
    ],
    category: 'workStyle',
    weight: 2
  }
];

export async function initializeFirebaseData() {
  try {
    console.log('Starting Firebase data initialization...');

    // Initialize colleges
    console.log('Adding colleges...');
    for (const college of sampleColleges) {
      await addDoc(collection(db, 'colleges'), college);
    }

    // Initialize scholarships
    console.log('Adding scholarships...');
    for (const scholarship of sampleScholarships) {
      await addDoc(collection(db, 'scholarships'), scholarship);
    }

    // Initialize resources
    console.log('Adding resources...');
    for (const resource of sampleResources) {
      await addDoc(collection(db, 'resources'), resource);
    }

    // Initialize quiz questions
    console.log('Adding quiz questions...');
    for (const question of sampleQuizQuestions) {
      await addDoc(collection(db, 'quizQuestions'), question);
    }

    // Create admin user entry (this will be referenced by security rules)
    console.log('Creating admin user...');
    await setDoc(doc(db, 'admins', 'megharaj-admin'), {
      username: 'megharaj',
      email: 'megharaj@edupath.com',
      role: 'super-admin',
      createdAt: serverTimestamp(),
      permissions: ['read', 'write', 'delete', 'manage-users'],
      active: true
    });

    console.log('Firebase data initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
    throw error;
  }
}

// For browser environment
if (typeof window !== 'undefined') {
  (window as any).initializeFirebaseData = initializeFirebaseData;
}