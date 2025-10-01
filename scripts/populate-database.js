const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc } = require('firebase/firestore');

// Firebase configuration (you'll need to add your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyB5rOnr90VlQ_qsX7NlcGVBqG1vwf8OKvo",
  authDomain: "career-education.firebaseapp.com",
  projectId: "career-education",
  storageBucket: "career-education.firebasestorage.app",
  messagingSenderId: "500848380035",
  appId: "1:500848380035:web:9f38bf43826e308b0af3b6",
  measurementId: "G-B43L116GV2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data
const sampleCourses = [
  {
    name: "Bachelor of Technology in Computer Science",
    shortName: "B.Tech CSE",
    description: "A comprehensive 4-year undergraduate program covering computer science fundamentals, programming, data structures, algorithms, and emerging technologies.",
    duration: "4 years",
    eligibility: "12th grade with PCM (Physics, Chemistry, Mathematics) with minimum 60% marks",
    stream: ["Engineering", "Technology", "Computer Science"],
    fees: 200000,
    rating: 4.5,
    provider: "Various Engineering Colleges"
  },
  {
    name: "Bachelor of Medicine and Bachelor of Surgery",
    shortName: "MBBS",
    description: "A 5.5-year medical degree program including 1 year of internship, covering all aspects of medical science and practice.",
    duration: "5.5 years",
    eligibility: "12th grade with PCB (Physics, Chemistry, Biology) with minimum 50% marks and NEET qualification",
    stream: ["Medical", "Healthcare", "Medicine"],
    fees: 500000,
    rating: 4.8,
    provider: "Medical Colleges"
  },
  {
    name: "Bachelor of Business Administration",
    shortName: "BBA",
    description: "A 3-year undergraduate program focusing on business management, entrepreneurship, and leadership skills.",
    duration: "3 years",
    eligibility: "12th grade in any stream with minimum 50% marks",
    stream: ["Business", "Management", "Commerce"],
    fees: 150000,
    rating: 4.2,
    provider: "Business Schools"
  },
  {
    name: "Bachelor of Fine Arts",
    shortName: "BFA",
    description: "A 4-year program focusing on creative arts, design, visual arts, and artistic expression.",
    duration: "4 years",
    eligibility: "12th grade in any stream with portfolio submission",
    stream: ["Arts", "Design", "Creative"],
    fees: 120000,
    rating: 4.0,
    provider: "Art Colleges"
  },
  {
    name: "Bachelor of Science in Data Science",
    shortName: "B.Sc Data Science",  
    description: "A 3-year program covering statistics, machine learning, programming, and big data analytics.",
    duration: "3 years",
    eligibility: "12th grade with PCM with minimum 60% marks",
    stream: ["Engineering", "Technology", "Analytics"],
    fees: 180000,
    rating: 4.6,
    provider: "Technology Institutes"
  },
  {
    name: "Bachelor of Pharmacy",
    shortName: "B.Pharm",
    description: "A 4-year program focusing on pharmaceutical sciences, drug development, and healthcare.",
    duration: "4 years",
    eligibility: "12th grade with PCB/PCM with minimum 50% marks",
    stream: ["Medical", "Pharmacy", "Healthcare"],
    fees: 250000,
    rating: 4.3,
    provider: "Pharmacy Colleges"
  }
];

const sampleColleges = [
  {
    name: "Indian Institute of Technology Delhi",
    location: {
      city: "New Delhi",
      state: "Delhi",
      district: "South West Delhi"
    },
    coursesOffered: [
      {
        name: "B.Tech Computer Science",
        duration: "4 years",
        fees: 200000
      },
      {
        name: "B.Tech Mechanical Engineering", 
        duration: "4 years",
        fees: 200000
      }
    ],
    facilities: ["Central Library", "Research Labs", "Hostels", "Sports Complex", "Wi-Fi Campus", "Medical Center"],
    rating: 4.9,
    isGovernment: true
  },
  {
    name: "All India Institute of Medical Sciences",
    location: {
      city: "New Delhi",
      state: "Delhi", 
      district: "South Delhi"
    },
    coursesOffered: [
      {
        name: "MBBS",
        duration: "5.5 years",
        fees: 100000
      },
      {
        name: "B.Sc Nursing",
        duration: "4 years", 
        fees: 80000
      }
    ],
    facilities: ["Medical Library", "Research Centers", "Hospital", "Hostels", "Cafeteria", "Ambulance Service"],
    rating: 4.9,
    isGovernment: true
  },
  {
    name: "Indian Institute of Management Ahmedabad",
    location: {
      city: "Ahmedabad",
      state: "Gujarat",
      district: "Ahmedabad"
    },
    coursesOffered: [
      {
        name: "MBA",
        duration: "2 years",
        fees: 2500000
      },
      {
        name: "Executive MBA",
        duration: "1 year",
        fees: 1800000
      }
    ],
    facilities: ["Business Library", "Case Study Rooms", "Hostels", "Gym", "Swimming Pool", "Placement Cell"],
    rating: 4.8,
    isGovernment: true
  },
  {
    name: "National Institute of Design",
    location: {
      city: "Ahmedabad", 
      state: "Gujarat",
      district: "Ahmedabad"
    },
    coursesOffered: [
      {
        name: "B.Des Product Design",
        duration: "4 years",
        fees: 150000
      },
      {
        name: "M.Des Communication Design",
        duration: "2 years",
        fees: 180000
      }
    ],
    facilities: ["Design Studios", "Workshop", "Library", "Hostels", "Exhibition Space", "Computer Lab"],
    rating: 4.7,
    isGovernment: true
  },
  {
    name: "Manipal Institute of Technology",
    location: {
      city: "Manipal",
      state: "Karnataka", 
      district: "Udupi"
    },
    coursesOffered: [
      {
        name: "B.Tech Information Technology",
        duration: "4 years",
        fees: 350000
      },
      {
        name: "B.Tech Biotechnology",
        duration: "4 years",
        fees: 330000
      }
    ],
    facilities: ["Digital Library", "Labs", "Hostels", "Sports Complex", "Medical Center", "Cafeterias"],
    rating: 4.4,
    isGovernment: false
  },
  {
    name: "Symbiosis International University",
    location: {
      city: "Pune",
      state: "Maharashtra",
      district: "Pune"
    },
    coursesOffered: [
      {
        name: "BBA",
        duration: "3 years", 
        fees: 400000
      },
      {
        name: "B.Tech Computer Science",
        duration: "4 years",
        fees: 450000
      }
    ],
    facilities: ["Central Library", "Computer Labs", "Hostels", "Sports Facilities", "Auditorium", "Placement Cell"],
    rating: 4.3,
    isGovernment: false
  }
];

const sampleCareers = [
  {
    title: "Software Engineer",
    description: "Design, develop, and maintain software applications and systems. Work with programming languages, frameworks, and development tools to create innovative solutions.",
    averageSalary: {
      min: 600000,
      max: 1500000
    },
    requiredSkills: ["Programming", "Problem Solving", "Data Structures", "Algorithms", "Version Control", "Testing"],
    jobRoles: [
      {
        title: "Frontend Developer",
        description: "Create user interfaces and user experiences for web applications",
        companies: ["Google", "Microsoft", "Amazon", "Meta", "Netflix"]
      },
      {
        title: "Backend Developer", 
        description: "Build server-side applications and APIs",
        companies: ["Google", "Microsoft", "Amazon", "Uber", "Spotify"]
      },
      {
        title: "Full Stack Developer",
        description: "Work on both frontend and backend development",
        companies: ["Startups", "Mid-size companies", "Consulting firms"]
      }
    ]
  },
  {
    title: "Medical Doctor",
    description: "Diagnose and treat patients, provide medical care, and work in various specialties within healthcare system.",
    averageSalary: {
      min: 800000,
      max: 2500000
    },
    requiredSkills: ["Medical Knowledge", "Communication", "Empathy", "Critical Thinking", "Decision Making", "Continuous Learning"],
    jobRoles: [
      {
        title: "General Practitioner",
        description: "Provide primary healthcare and general medical services",
        companies: ["Hospitals", "Clinics", "Healthcare Centers"]
      },
      {
        title: "Specialist Doctor",
        description: "Focus on specific medical fields like cardiology, neurology, etc.",
        companies: ["Specialized Hospitals", "Medical Centers", "Private Practice"]
      }
    ]
  },
  {
    title: "Business Analyst",
    description: "Analyze business processes, identify improvement opportunities, and help organizations make data-driven decisions.",
    averageSalary: {
      min: 500000,
      max: 1200000
    },
    requiredSkills: ["Data Analysis", "Business Intelligence", "Communication", "Project Management", "Excel", "SQL"],
    jobRoles: [
      {
        title: "Data Analyst",
        description: "Analyze data to provide business insights",
        companies: ["Consulting firms", "Banks", "E-commerce", "Healthcare"]
      },
      {
        title: "Process Improvement Analyst",
        description: "Optimize business processes and workflows",
        companies: ["Manufacturing", "Service companies", "Government"]
      }
    ]
  },
  {
    title: "Graphic Designer", 
    description: "Create visual concepts and designs for various media including digital and print materials.",
    averageSalary: {
      min: 300000,
      max: 800000
    },
    requiredSkills: ["Creative Design", "Adobe Creative Suite", "Typography", "Color Theory", "Branding", "User Experience"],
    jobRoles: [
      {
        title: "UI/UX Designer",
        description: "Design user interfaces and user experiences for digital products",
        companies: ["Tech companies", "Startups", "Design agencies"]
      },
      {
        title: "Brand Designer",
        description: "Create brand identities and marketing materials",
        companies: ["Advertising agencies", "Marketing firms", "Corporate brands"]
      }
    ]
  }
];

const sampleScholarships = [
  {
    name: "National Merit Scholarship",
    description: "Merit-based scholarship for academically excellent students across all streams",
    amount: 50000,
    eligibility: "Minimum 85% in 12th grade, family income below 5 LPA",
    deadline: new Date('2024-12-31'),
    provider: "Government of India",
    category: "Merit",
    applicationLink: "https://scholarships.gov.in"
  },
  {
    name: "Engineering Excellence Award",
    description: "Scholarship for engineering students with outstanding academic performance",
    amount: 75000,
    eligibility: "Engineering students with CGPA above 8.5",
    deadline: new Date('2024-11-30'),
    provider: "AICTE",
    category: "Engineering",
    applicationLink: "https://aicte-india.org"
  },
  {
    name: "Medical Student Support Scholarship",
    description: "Financial aid for medical students from economically weaker sections",
    amount: 100000,
    eligibility: "MBBS students, family income below 3 LPA",
    deadline: new Date('2024-10-15'),
    provider: "Ministry of Health",
    category: "Medical",
    applicationLink: "https://mohfw.gov.in"
  }
];

async function populateDatabase() {
  console.log('🚀 Starting database population...');

  try {
    // Add courses
    console.log('📚 Adding courses...');
    for (const course of sampleCourses) {
      await addDoc(collection(db, 'courses'), course);
    }
    console.log(`✅ Added ${sampleCourses.length} courses`);

    // Add colleges
    console.log('🏫 Adding colleges...');  
    for (const college of sampleColleges) {
      await addDoc(collection(db, 'colleges'), college);
    }
    console.log(`✅ Added ${sampleColleges.length} colleges`);

    // Add careers
    console.log('💼 Adding careers...');
    for (const career of sampleCareers) {
      await addDoc(collection(db, 'careers'), career);
    }
    console.log(`✅ Added ${sampleCareers.length} careers`);

    // Add scholarships
    console.log('🎓 Adding scholarships...');
    for (const scholarship of sampleScholarships) {
      await addDoc(collection(db, 'scholarships'), scholarship);
    }
    console.log(`✅ Added ${sampleScholarships.length} scholarships`);

    console.log('🎉 Database population completed successfully!');

  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
}

// Uncomment the line below to run the population script
// populateDatabase();