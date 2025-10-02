export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  academicInterests?: string[];
  interests?: string[];
  careerGoals?: string[];
  location?: string;
  class?: '10' | '12';
  category?: string;
  bio?: string;
  quizResults?: QuizResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizResult {
  id: string;
  userId: string;
  answers: QuizAnswer[];
  recommendedStreams: Stream[];
  personality: PersonalityType;
  strengths: string[];
  score: number;
  completedAt: Date;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  score: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  isActive: boolean;
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'checkbox' | 'rating' | 'text';
  options?: string[];
  category: 'academic' | 'personality' | 'interest' | 'skills';
  weight: number;
}

export type Stream = 'science' | 'commerce' | 'arts' | 'vocational';
export type PersonalityType = 'analytical' | 'creative' | 'social' | 'practical' | 'investigative';

export interface College {
  id: string;
  name: string;
  location: {
    district: string;
    state: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  coursesOffered: Course[];
  cutoffs: {
    [courseId: string]: {
      general: number;
      obc: number;
      sc: number;
      st: number;
    };
  };
  medium: string[];
  facilities: string[];
  fees: {
    [courseId: string]: number;
  };
  website?: string;
  contact?: {
    phone: string;
    email: string;
  };
  isGovernment: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  name: string;
  shortName: string;
  duration: string;
  eligibility: string;
  stream: Stream[];
  description: string;
  careerPaths?: CareerPath[];
  subjects: string[];
  degree?: string;
  skills?: string[];
  careerProspects?: string[];
  fees?: number;
  rating?: number;
  provider?: string;
  image?: string;
  enrolledStudents?: number;
  studentsEnrolled?: number;
  isActive: boolean;
  level?: string;
  category?: string;
  certification?: boolean;
  mode?: string;
  courseLink?: string;
  syllabus?: {
    module: string;
    topics: string[];
    duration: string;
  }[];
  prerequisites?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  courseId: string;
  jobRoles: JobRole[];
  higherEducation?: string[];
  governmentExams?: string[];
  averageSalary: {
    min: number;
    max: number;
  };
  growthProspects: string;
  requiredSkills: string[];
  industryTrends?: string[];
  workLife?: string;
  workLocation?: string;
  workCulture?: string;
}

export interface JobRole {
  title: string;
  description: string;
  salaryRange: {
    min: number;
    max: number;
  };
  companies: string[];
  requirements: string[];
}

export interface Scholarship {
  id: string;
  name: string;
  description: string;
  eligibility: {
    class: string[];
    income: number;
    category: string[];
    gender?: string[];
  };
  amount: number;
  applicationDeadline: Date;
  applicationLink: string;
  documents: string[];
  provider: string;
  isActive: boolean;
  createdAt: Date;
}

export interface TimelineEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: Date;
  type: string;
  priority: string;
  isCompleted: boolean;
  reminderDates?: Date[];
  relatedLinks?: string[];
  createdAt?: Date;
}

export interface AdminUser {
  username: string;
  password: string;
  lastLogin?: Date;
}

export interface Recommendation {
  id: string;
  userId: string;
  type: 'course' | 'college' | 'career' | 'scholarship';
  title: string;
  description: string;
  confidence: number;
  reasons: string[];
  relatedId: string;
  createdAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'ebook' | 'video' | 'course' | 'website';
  url: string;
  category: string;
  subjects: string[];
  isVerified: boolean;
  createdAt: Date;
}
