// Properly structured colleges for replacement
export const properColleges = [
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
      { id: 'bsc-phy', name: 'B.Sc Physics', duration: '3 years', degree: 'B.Sc.' },
      { id: 'llb', name: 'Bachelor of Laws', duration: '3 years', degree: 'LL.B.' }
    ],
    cutoffs: {
      'btech-cs': { general: 85, obc: 82, sc: 75, st: 70 },
      'ba-eng': { general: 70, obc: 67, sc: 60, st: 55 },
      'bsc-phy': { general: 75, obc: 72, sc: 65, st: 60 },
      'llb': { general: 80, obc: 77, sc: 70, st: 65 }
    },
    medium: ['English', 'Hindi'],
    facilities: ['Central Library', 'Hostels', 'Sports Complex', 'Medical Center', 'Cultural Centers'],
    fees: {
      'btech-cs': 60000,
      'ba-eng': 25000,
      'bsc-phy': 30000,
      'llb': 35000
    },
    website: 'https://www.bhu.ac.in/',
    contact: {
      phone: '+91-542-2307016',
      email: 'info@bhu.ac.in'
    },
    isGovernment: true
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
      { id: 'btech-ee', name: 'B.Tech Electrical Engineering', duration: '4 years', degree: 'B.Tech' },
      { id: 'btech-me', name: 'B.Tech Mechanical Engineering', duration: '4 years', degree: 'B.Tech' },
      { id: 'bpharma', name: 'Bachelor of Pharmacy', duration: '4 years', degree: 'B.Pharma' }
    ],
    cutoffs: {
      'btech-cs': { general: 350, obc: 340, sc: 320, st: 310 },
      'btech-ee': { general: 320, obc: 310, sc: 290, st: 280 },
      'btech-me': { general: 300, obc: 290, sc: 270, st: 260 },
      'bpharma': { general: 280, obc: 270, sc: 250, st: 240 }
    },
    medium: ['English'],
    facilities: ['World-class Labs', 'Innovation Centers', 'Hostels', 'Sports Facilities', 'Tech Incubators'],
    fees: {
      'btech-cs': 450000,
      'btech-ee': 450000,
      'btech-me': 450000,
      'bpharma': 400000
    },
    website: 'https://www.bits-pilani.ac.in/',
    contact: {
      phone: '+91-1596-242210',
      email: 'info@pilani.bits-pilani.ac.in'
    },
    isGovernment: false
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
      { id: 'bca', name: 'Bachelor of Computer Applications', duration: '3 years', degree: 'BCA' },
      { id: 'ba-eng', name: 'Bachelor of Arts English', duration: '3 years', degree: 'B.A.' },
      { id: 'bcom', name: 'Bachelor of Commerce', duration: '3 years', degree: 'B.Com.' }
    ],
    cutoffs: {
      'bba': { general: 85, obc: 82, sc: 75, st: 70 },
      'bca': { general: 80, obc: 77, sc: 70, st: 65 },
      'ba-eng': { general: 75, obc: 72, sc: 65, st: 60 },
      'bcom': { general: 78, obc: 75, sc: 68, st: 63 }
    },
    medium: ['English'],
    facilities: ['Modern Classrooms', 'Computer Labs', 'Library', 'Hostels', 'Sports Complex'],
    fees: {
      'bba': 200000,
      'bca': 180000,
      'ba-eng': 150000,
      'bcom': 160000
    },
    website: 'https://christuniversity.in/',
    contact: {
      phone: '+91-80-4012-9100',
      email: 'info@christuniversity.in'
    },
    isGovernment: false
  }
];