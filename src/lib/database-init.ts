import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { College, Course, CareerPath, Scholarship, Quiz, Resource } from '@/types';

// Sample data for initialization
export const sampleColleges: College[] = [
  {
    id: 'college-1',
    name: 'Government Medical College, Mumbai',
    location: {
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    coursesOffered: [
      { id: 'mbbs', name: 'Bachelor of Medicine and Bachelor of Surgery', shortName: 'MBBS', duration: '5.5 years', eligibility: '12th Science with PCB', stream: ['science'], description: 'Undergraduate medical degree program', careerPaths: [], subjects: ['Biology', 'Chemistry', 'Physics'], isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ],
    cutoffs: {
      'mbbs': { general: 600, obc: 580, sc: 520, st: 500 }
    },
    medium: ['English', 'Hindi'],
    facilities: ['Hospital', 'Library', 'Hostel', 'Laboratory'],
    fees: { 'mbbs': 50000 },
    website: 'http://gmcmumbai.ac.in',
    contact: { phone: '+91-22-12345678', email: 'info@gmcmumbai.ac.in' },
    isGovernment: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'college-2',
    name: 'Government Engineering College, Delhi',
    location: {
      district: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      coordinates: { lat: 28.7041, lng: 77.1025 }
    },
    coursesOffered: [
      { id: 'btech-cs', name: 'Bachelor of Technology in Computer Science', shortName: 'B.Tech CS', duration: '4 years', eligibility: '12th Science with PCM', stream: ['science'], description: 'Undergraduate engineering program in computer science', careerPaths: [], subjects: ['Mathematics', 'Physics', 'Computer Science'], isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ],
    cutoffs: {
      'btech-cs': { general: 180, obc: 170, sc: 150, st: 140 }
    },
    medium: ['English'],
    facilities: ['Computer Lab', 'Library', 'Hostel', 'Cafeteria'],
    fees: { 'btech-cs': 75000 },
    website: 'http://gecdelhi.ac.in',
    contact: { phone: '+91-11-87654321', email: 'info@gecdelhi.ac.in' },
    isGovernment: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const sampleCourses: Course[] = [
  {
    id: 'btech-cs',
    name: 'Bachelor of Technology in Computer Science',
    shortName: 'B.Tech CS',
    duration: '4 years',
    eligibility: '12th Science with PCM',
    stream: ['science'],
    description: 'Comprehensive undergraduate program in computer science and engineering',
    careerPaths: [
      {
        id: 'cs-career-1',
        title: 'Software Development',
        description: 'Build applications, websites, and software systems',
        courseId: 'btech-cs',
        jobRoles: [
          {
            title: 'Software Engineer',
            description: 'Develop and maintain software applications',
            salaryRange: { min: 400000, max: 1200000 },
            companies: ['TCS', 'Infosys', 'Google', 'Microsoft'],
            requirements: ['Programming skills', 'Problem solving', 'Team work']
          }
        ],
        higherEducation: ['M.Tech', 'MS in Computer Science', 'MBA'],
        governmentExams: ['GATE', 'UPSC CSE'],
        averageSalary: { min: 400000, max: 1500000 },
        growthProspects: 'High demand in IT industry with excellent growth opportunities',
        requiredSkills: ['Programming', 'Data Structures', 'Algorithms', 'System Design']
      }
    ],
    subjects: ['Mathematics', 'Physics', 'Computer Science', 'Data Structures', 'Algorithms'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bcom',
    name: 'Bachelor of Commerce',
    shortName: 'B.Com',
    duration: '3 years',
    eligibility: '12th in any stream',
    stream: ['commerce', 'arts'],
    description: 'Undergraduate program in commerce and business studies',
    careerPaths: [
      {
        id: 'bcom-career-1',
        title: 'Finance and Banking',
        description: 'Work in financial institutions and banking sector',
        courseId: 'bcom',
        jobRoles: [
          {
            title: 'Banking Associate',
            description: 'Handle customer transactions and banking operations',
            salaryRange: { min: 250000, max: 600000 },
            companies: ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'],
            requirements: ['Financial knowledge', 'Customer service', 'Communication skills']
          }
        ],
        higherEducation: ['M.Com', 'MBA', 'CA', 'CS'],
        governmentExams: ['IBPS', 'SSC CGL', 'UPSC'],
        averageSalary: { min: 250000, max: 800000 },
        growthProspects: 'Good opportunities in banking and financial services',
        requiredSkills: ['Accounting', 'Finance', 'Communication', 'Analysis']
      }
    ],
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const sampleScholarships: Scholarship[] = [
  {
    id: 'post-matric-sc',
    name: 'Post Matric Scholarship for SC Students',
    description: 'Financial assistance for SC students pursuing higher education',
    eligibility: {
      class: ['12', 'graduation', 'post-graduation'],
      income: 250000,
      category: ['SC'],
    },
    amount: 20000,
    applicationDeadline: new Date('2024-12-31'),
    applicationLink: 'https://scholarships.gov.in',
    documents: ['Income Certificate', 'Caste Certificate', 'Admission Receipt', 'Bank Passbook'],
    provider: 'Government of India',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'merit-scholarship',
    name: 'Merit Scholarship for Outstanding Students',
    description: 'Scholarship for students with excellent academic performance',
    eligibility: {
      class: ['12', 'graduation'],
      income: 500000,
      category: ['General', 'OBC', 'SC', 'ST'],
    },
    amount: 50000,
    applicationDeadline: new Date('2024-11-30'),
    applicationLink: 'https://scholarships.gov.in/merit',
    documents: ['Mark Sheets', 'Income Certificate', 'Admission Receipt'],
    provider: 'State Government',
    isActive: true,
    createdAt: new Date()
  }
];

export const sampleQuiz: Quiz = {
  id: 'career-aptitude-quiz',
  title: 'Career Aptitude & Interest Assessment',
  description: 'Discover your strengths, interests, and ideal career paths through this comprehensive assessment',
  questions: [
    {
      id: 'q1',
      question: 'Which subject do you find most interesting?',
      type: 'multiple-choice',
      options: ['Mathematics', 'Science', 'Literature', 'History', 'Arts', 'Commerce'],
      category: 'academic',
      weight: 3
    },
    {
      id: 'q2',
      question: 'What type of activities do you enjoy most?',
      type: 'multiple-choice',
      options: ['Problem solving', 'Creative expression', 'Helping others', 'Leading teams', 'Analyzing data'],
      category: 'interest',
      weight: 4
    },
    {
      id: 'q3',
      question: 'In a group project, you usually:',
      type: 'multiple-choice',
      options: ['Take the lead', 'Do the research', 'Handle creative aspects', 'Coordinate with team', 'Present the results'],
      category: 'personality',
      weight: 3
    },
    {
      id: 'q4',
      question: 'Your ideal work environment would be:',
      type: 'multiple-choice',
      options: ['Laboratory/Research facility', 'Office with team', 'Creative studio', 'Outdoor/Field work', 'Hospital/Clinic'],
      category: 'interest',
      weight: 4
    },
    {
      id: 'q5',
      question: 'Rate your interest in technology (1-5):',
      type: 'rating',
      category: 'interest',
      weight: 3
    }
  ],
  isActive: true,
  createdAt: new Date()
};

export const sampleResources: Resource[] = [
  {
    id: 'ncert-books',
    title: 'NCERT Textbooks (Free Download)',
    description: 'Official NCERT textbooks for all subjects and classes',
    type: 'ebook',
    url: 'https://ncert.nic.in/textbook.php',
    category: 'Textbooks',
    subjects: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
    isVerified: true,
    createdAt: new Date()
  },
  {
    id: 'khan-academy',
    title: 'Khan Academy - Free Online Courses',
    description: 'World-class education for anyone, anywhere',
    type: 'course',
    url: 'https://www.khanacademy.org',
    category: 'Online Learning',
    subjects: ['Mathematics', 'Science', 'Economics', 'History'],
    isVerified: true,
    createdAt: new Date()
  }
];

// Initialize database with sample data
export async function initializeDatabase() {
  try {
    // Check if data already exists
    const checkDoc = await getDoc(doc(db, 'config', 'initialized'));
    if (checkDoc.exists()) {
      console.log('Database already initialized');
      return;
    }

    // Add colleges
    for (const college of sampleColleges) {
      await setDoc(doc(db, 'colleges', college.id), college);
    }

    // Add courses
    for (const course of sampleCourses) {
      await setDoc(doc(db, 'courses', course.id), course);
    }

    // Add scholarships
    for (const scholarship of sampleScholarships) {
      await setDoc(doc(db, 'scholarships', scholarship.id), scholarship);
    }

    // Add quiz
    await setDoc(doc(db, 'quizzes', sampleQuiz.id), sampleQuiz);

    // Add resources
    for (const resource of sampleResources) {
      await setDoc(doc(db, 'resources', resource.id), resource);
    }

    // Create admin user
    await setDoc(doc(db, 'admin', 'credentials'), {
      username: 'megharaj@admin.com',
      password: 'megharaj@123', // In production, this should be hashed
      lastLogin: null
    });

    // Mark as initialized
    await setDoc(doc(db, 'config', 'initialized'), {
      timestamp: new Date(),
      version: '1.0'
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}