'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Trophy, 
  Target,
  TrendingUp,
  Calendar,
  Star,
  ArrowRight,
  Brain,
  MapPin,
  Clock,
  Users,
  Phone,
  Info,
  CheckCircle2,
  Bookmark,
  MessageSquare,
  Bell,
  Zap,
  Award,
  TrendingDown,
  Activity,
  BarChart3,
  PlusCircle,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import Timeline from '@/components/Timeline';
import AIRecommendations from '@/components/AIRecommendations';
import { TimelineEvent } from '@/types';

// Type definitions
interface Course {
  id: string;
  name: string;
  shortName: string;
  description: string;
  duration: string;
  eligibility: string;
  stream: string[];
  fees: number;
  rating: number;
  provider: string;
}

interface College {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
    district: string;
  };
  coursesOffered: Course[];
  facilities: string[];
  rating: number;
  isGovernment: boolean;
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  averageSalary: {
    min: number;
    max: number;
  };
  requiredSkills: string[];
  jobRoles: {
    title: string;
    description: string;
    companies: string[];
  }[];
}

interface QuizResultAnalysis {
  primaryField: string;
  secondaryField: string;
  strengths: string[];
  personality: string;
  recommendedStreams: string[];
  scores: {
    analytical: number;
    creative: number;
    technical: number;
    social: number;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profileCompletion, setProfileCompletion] = useState(60);
  const [quizAnalysis, setQuizAnalysis] = useState<QuizResultAnalysis | null>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [suggestedColleges, setSuggestedColleges] = useState<College[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 0,
    bookmarkedItems: 0,
    completedEvents: 0,
    upcomingDeadlines: 0
  });

  // Analyze user's quiz results to determine their field and preferences
  const analyzeQuizResults = (quizResults: any): QuizResultAnalysis | null => {
    if (!quizResults) return null;

    const answers = quizResults.answers || [];
    const scores = quizResults.scores || {};
    
    // If we have direct scores from the quiz, use them
    if (Object.keys(scores).length > 0) {
      // Find the highest scoring stream
      const sortedStreams = Object.entries(scores)
        .sort(([,a], [,b]) => (b as number) - (a as number));
      
      const primaryStream = sortedStreams[0]?.[0] || 'science';
      const secondaryStream = sortedStreams[1]?.[0] || 'commerce';
      
      // Map streams to fields
      const streamToFieldMap: Record<string, string> = {
        'science': 'Engineering',
        'engineering': 'Engineering',
        'medical': 'Medical',
        'business': 'Business',
        'commerce': 'Business',
        'arts': 'Arts',
        'humanities': 'Arts'
      };

      const primaryField = streamToFieldMap[primaryStream] || 'Engineering';
      const secondaryField = streamToFieldMap[secondaryStream] || 'Business';

      // Determine personality based on scores
      let personality = 'Analytical';
      if (scores.arts > scores.science && scores.arts > scores.commerce) {
        personality = 'Creative';
      } else if (scores.business > scores.science || scores.commerce > scores.science) {
        personality = 'Social';
      }

      // Generate strengths based on high scores
      const strengths = Object.entries(scores)
        .filter(([, score]) => (score as number) > 60)
        .map(([stream]) => stream.charAt(0).toUpperCase() + stream.slice(1))
        .slice(0, 3);

      return {
        primaryField,
        secondaryField,
        strengths,
        personality,
        recommendedStreams: Object.keys(scores).filter(stream => scores[stream] > 50),
        scores: {
          analytical: scores.science || scores.engineering || 70,
          creative: scores.arts || scores.design || 60,
          technical: scores.engineering || scores.science || 65,
          social: scores.business || scores.commerce || 55
        }
      };
    }

    // Fallback: analyze answers if no direct scores
    let engineeringScore = 0;
    let medicalScore = 0;
    let businessScore = 0;
    let artsScore = 0;

    answers.forEach((answer: any) => {
      const answerText = answer.answer?.toLowerCase() || '';
      
      if (answerText.includes('technology') || answerText.includes('engineering') || 
          answerText.includes('programming') || answerText.includes('mathematics')) {
        engineeringScore += answer.score || 1;
      }
      if (answerText.includes('medicine') || answerText.includes('biology') || 
          answerText.includes('health') || answerText.includes('care')) {
        medicalScore += answer.score || 1;
      }
      if (answerText.includes('business') || answerText.includes('management') || 
          answerText.includes('finance') || answerText.includes('commerce')) {
        businessScore += answer.score || 1;
      }
      if (answerText.includes('arts') || answerText.includes('creative') || 
          answerText.includes('design') || answerText.includes('literature')) {
        artsScore += answer.score || 1;
      }
    });

    // Determine primary and secondary fields
    const fieldScores = [
      { field: 'Engineering', score: engineeringScore },
      { field: 'Medical', score: medicalScore },
      { field: 'Business', score: businessScore },
      { field: 'Arts', score: artsScore }
    ].sort((a, b) => b.score - a.score);

    // Generate personality based on dominant field
    let personality = 'Analytical';
    if (fieldScores[0].field === 'Arts') personality = 'Creative';
    else if (fieldScores[0].field === 'Business') personality = 'Social';
    else if (fieldScores[0].field === 'Medical') personality = 'Social';

    return {
      primaryField: fieldScores[0].field,
      secondaryField: fieldScores[1].field,
      strengths: fieldScores.filter(f => f.score > 0).map(f => f.field).slice(0, 3),
      personality,
      recommendedStreams: fieldScores.filter(f => f.score > 0).map(f => f.field.toLowerCase()),
      scores: {
        analytical: Math.min(100, engineeringScore * 15 + 25),
        creative: Math.min(100, artsScore * 15 + 20),
        technical: Math.min(100, engineeringScore * 12 + 30),
        social: Math.min(100, (businessScore + medicalScore) * 10 + 20)
      }
    };
  };

  // Fetch courses based on user's quiz results
  const fetchRecommendedCourses = async (primaryField: string) => {
    try {
      console.log('Fetching courses for field:', primaryField);
      
      const coursesQuery = query(
        collection(db, 'courses'),
        limit(10) // Increased limit to get more courses
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      let allCourses = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));

      console.log('All courses fetched:', allCourses.length);
      console.log('Sample course:', allCourses[0]);

      // If no courses in database, use sample data
      if (allCourses.length === 0) {
        console.log('No courses in database, using sample data');
        const sampleCourses = [
          {
            id: 'sample-1',
            name: 'Bachelor of Technology in Computer Science',
            shortName: 'B.Tech CSE',
            description: 'A comprehensive 4-year undergraduate program covering computer science fundamentals, programming, data structures, algorithms, and emerging technologies.',
            duration: '4 years',
            eligibility: '12th grade with PCM with minimum 60% marks',
            stream: ['science'] as any,
            subjects: ['Mathematics', 'Physics', 'Computer Science'],
            fees: 200000,
            rating: 4.5,
            provider: 'Various Engineering Colleges',
            isActive: true
          },
          {
            id: 'sample-2',
            name: 'Bachelor of Medicine and Bachelor of Surgery',
            shortName: 'MBBS',
            description: 'A 5.5-year medical degree program including 1 year of internship, covering all aspects of medical science and practice.',
            duration: '5.5 years',
            eligibility: '12th grade with PCB with minimum 50% marks and NEET qualification',
            stream: ['science'] as any,
            subjects: ['Biology', 'Chemistry', 'Physics'],
            fees: 500000,
            rating: 4.8,
            provider: 'Medical Colleges',
            isActive: true
          },
          {
            id: 'sample-3',
            name: 'Bachelor of Business Administration',
            shortName: 'BBA',
            description: 'A 3-year undergraduate program focusing on business management, entrepreneurship, and leadership skills.',
            duration: '3 years',
            eligibility: '12th grade in any stream with minimum 50% marks',
            stream: ['commerce'] as any,
            subjects: ['Business Studies', 'Economics', 'Accounting'],
            fees: 150000,
            rating: 4.2,
            provider: 'Business Schools',
            isActive: true
          },
          {
            id: 'sample-4',
            name: 'Bachelor of Fine Arts',
            shortName: 'BFA',
            description: 'A 4-year program focusing on creative arts, design, visual arts, and artistic expression.',
            duration: '4 years',
            eligibility: '12th grade in any stream with portfolio submission',
            stream: ['arts'] as any,
            subjects: ['Drawing', 'Painting', 'Sculpture'],
            fees: 120000,
            rating: 4.0,
            provider: 'Art Colleges',
            isActive: true
          }
        ];
        
        // Use sample courses for filtering
        allCourses = [...sampleCourses];
      }

      // Filter courses based on primary field - improved filtering logic
      const filteredCourses = allCourses.filter(course => {
        const courseName = course.name?.toLowerCase() || '';
        const courseDescription = course.description?.toLowerCase() || '';
        const courseStream = Array.isArray(course.stream) ? 
          course.stream.join(' ').toLowerCase() : 
          String(course.stream || '').toLowerCase();
        const fieldLower = primaryField.toLowerCase();
        
        // More flexible matching
        const searchText = `${courseName} ${courseDescription} ${courseStream}`;
        
        if (fieldLower === 'engineering') {
          return searchText.includes('engineering') || searchText.includes('technology') || 
                 searchText.includes('computer') || searchText.includes('b.tech') ||
                 searchText.includes('mechanical') || searchText.includes('electrical');
        }
        if (fieldLower === 'medical') {
          return searchText.includes('medical') || searchText.includes('medicine') || 
                 searchText.includes('mbbs') || searchText.includes('healthcare') ||
                 searchText.includes('biology') || searchText.includes('nursing');
        }
        if (fieldLower === 'business') {
          return searchText.includes('business') || searchText.includes('management') || 
                 searchText.includes('commerce') || searchText.includes('bba') ||
                 searchText.includes('mba') || searchText.includes('finance');
        }
        if (fieldLower === 'arts') {
          return searchText.includes('arts') || searchText.includes('design') || 
                 searchText.includes('creative') || searchText.includes('bfa') ||
                 searchText.includes('fine') || searchText.includes('visual');
        }
        return true; // Return all courses if no specific field filter matches
      });

      // If no courses match the filter, show all courses as fallback
      const finalCourses = filteredCourses.length > 0 ? filteredCourses.slice(0, 6) : allCourses.slice(0, 6);

      console.log('Filtered courses:', filteredCourses.length);
      console.log('Final courses to show:', finalCourses.length);
      console.log('Final courses data:', finalCourses);

      setRecommendedCourses(finalCourses);
    } catch (error: any) {
      console.error('Error fetching recommended courses:', error);
      setRecommendedCourses([]);
    }
  };

  // Fetch colleges based on user's field
  const fetchSuggestedColleges = async (primaryField: string) => {
    try {
      const collegesQuery = query(
        collection(db, 'colleges'),
        limit(6)
      );
      const collegesSnapshot = await getDocs(collegesQuery);
      const allColleges = collegesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as College));

      // Filter colleges that offer courses in the primary field
      const filteredColleges = allColleges.filter(college => {
        const coursesText = college.coursesOffered?.map(course => course.name).join(' ').toLowerCase() || '';
        const fieldLower = primaryField.toLowerCase();
        
        if (fieldLower === 'engineering') {
          return coursesText.includes('engineering') || coursesText.includes('technology');
        }
        if (fieldLower === 'medical') {
          return coursesText.includes('medical') || coursesText.includes('medicine') || coursesText.includes('biology');
        }
        if (fieldLower === 'business') {
          return coursesText.includes('business') || coursesText.includes('management') || coursesText.includes('commerce');
        }
        if (fieldLower === 'arts') {
          return coursesText.includes('arts') || coursesText.includes('design') || coursesText.includes('creative');
        }
        return true;
      }).slice(0, 6);

      setSuggestedColleges(filteredColleges);
    } catch (error: any) {
      console.error('Error fetching suggested colleges:', error);
      setSuggestedColleges([]);
    }
  };

  // Fetch career paths based on user's field
  const fetchCareerPaths = async (primaryField: string) => {
    try {
      const careersQuery = query(
        collection(db, 'careers'),
        limit(4)
      );
      const careersSnapshot = await getDocs(careersQuery);
      const allCareers = careersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CareerPath));

      // Filter careers based on primary field
      const filteredCareers = allCareers.filter(career => {
        const careerTitle = career.title?.toLowerCase() || '';
        const careerDesc = career.description?.toLowerCase() || '';
        const fieldLower = primaryField.toLowerCase();
        
        if (fieldLower === 'engineering') {
          return careerTitle.includes('engineer') || careerTitle.includes('technology') || 
                 careerDesc.includes('engineering') || careerDesc.includes('technical');
        }
        if (fieldLower === 'medical') {
          return careerTitle.includes('medical') || careerTitle.includes('doctor') || 
                 careerTitle.includes('health') || careerDesc.includes('medical');
        }
        if (fieldLower === 'business') {
          return careerTitle.includes('business') || careerTitle.includes('manager') || 
                 careerTitle.includes('analyst') || careerDesc.includes('business');
        }
        if (fieldLower === 'arts') {
          return careerTitle.includes('design') || careerTitle.includes('creative') || 
                 careerTitle.includes('artist') || careerDesc.includes('creative');
        }
        return true;
      }).slice(0, 4);

      setCareerPaths(filteredCareers);
    } catch (error: any) {
      console.error('Error fetching career paths:', error);
      setCareerPaths([]);
    }
  };

  // Fetch real user-created timeline events from Firestore
  const fetchUserTimelineEvents = async (userId: string) => {
    try {
      // Very simple query to avoid any index issues
      const timelineQuery = query(
        collection(db, 'timeline'),
        where('userId', '==', userId),
        limit(10)
      );
      
      const timelineSnapshot = await getDocs(timelineQuery);
      
      // Return empty array if no docs found
      if (timelineSnapshot.empty) {
        return [];
      }
      
      const allEvents: TimelineEvent[] = timelineSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate ? data.date.toDate() : new Date(data.date)
        } as TimelineEvent;
      });
      
      // Filter on client side to avoid complex index
      const now = new Date();
      const upcomingEvents = allEvents.filter(event => 
        !event.isCompleted && event.date >= now
      ).slice(0, 5);
      
      return upcomingEvents;
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      throw error; // Throw error to trigger fallback
    }
  };

  // Generate sample timeline events if user has no custom events
  const generateSampleTimelineEvents = (userData: any): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    const today = new Date();
    
    // Add some sample events based on user's current class and interests
    if (userData.class) {
      if (userData.class === '12' || userData.class === '12th') {
        events.push({
          id: 'sample-1',
          title: 'JEE Main Registration',
          description: 'Register for JEE Main entrance examination',
          date: new Date(today.getFullYear(), 11, 15), // Dec 15
          type: 'exam',
          priority: 'high',
          isCompleted: false,
          userId: userData.uid,
          reminderDates: []
        });
        events.push({
          id: 'sample-2',
          title: 'College Application Deadline',
          description: 'Submit applications for preferred colleges',
          date: new Date(today.getFullYear() + 1, 2, 31), // March 31 next year
          type: 'admission',
          priority: 'high',
          isCompleted: false,
          userId: userData.uid,
          reminderDates: []
        });
      }
      
      events.push({
        id: 'sample-3',
        title: 'Portfolio Update Deadline',
        description: 'Add recent achievements and projects to your profile',
        date: new Date(today.getFullYear(), today.getMonth() + 1, 15),
        type: 'deadline',
        priority: 'medium',
        isCompleted: false,
        userId: userData.uid,
        reminderDates: []
      });
    }

    // Add scholarship deadlines
    events.push({
      id: 'sample-4',
      title: 'Merit Scholarship Application',
      description: 'Apply for government merit scholarships',
      date: new Date(today.getFullYear(), today.getMonth() + 2, 10),
      type: 'scholarship',
      priority: 'high',
      isCompleted: false,
      userId: userData.uid,
      reminderDates: []
    });

    // Add career exploration tasks
    if (userData.academicInterests?.length) {
      events.push({
        id: 'sample-5',
        title: 'Career Exploration Deadline',
        description: `Complete research on ${userData.academicInterests[0]} career paths`,
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
        type: 'deadline',
        priority: 'medium',
        isCompleted: false,
        userId: userData.uid,
        reminderDates: []
      });
    }

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Fetch real-time dashboard statistics
  const fetchDashboardStats = async (userId: string) => {
    try {
      // Fetch user applications
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('userId', '==', userId)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const totalApplications = applicationsSnapshot.size;

      // Fetch user bookmarks
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', userId)
      );
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      const bookmarkedItems = bookmarksSnapshot.size;

      // Fetch all timeline events with simple query to avoid complex index requirements
      const allTimelineQuery = query(
        collection(db, 'timeline'),
        where('userId', '==', userId)
      );
      const allTimelineSnapshot = await getDocs(allTimelineQuery);

      // Get completed events count from the timeline data
      const completedEvents = allTimelineSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.isCompleted === true;
      }).length;
      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      // Filter in application instead of Firestore query
      const upcomingDeadlines = allTimelineSnapshot.docs.filter(doc => {
        const data = doc.data();
        const eventDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        return !data.isCompleted && eventDate <= thirtyDaysFromNow && eventDate >= new Date();
      }).length;

      return {
        totalApplications,
        bookmarkedItems,
        completedEvents,
        upcomingDeadlines
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalApplications: 0,
        bookmarkedItems: 0,
        completedEvents: 0,
        upcomingDeadlines: 0
      };
    }
  };

  // Handle bookmark toggle
  const toggleBookmark = async (itemId: string, itemType: 'course' | 'college' | 'scholarship', itemData: any) => {
    if (!user) return;

    try {
      // Check if bookmark exists
      const bookmarkQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('itemId', '==', itemId),
        where('itemType', '==', itemType)
      );
      const bookmarkSnapshot = await getDocs(bookmarkQuery);

      if (bookmarkSnapshot.empty) {
        // Add bookmark
        await addDoc(collection(db, 'bookmarks'), {
          userId: user.uid,
          itemId,
          itemType,
          itemData,
          createdAt: new Date()
        });
        
        // Update local stats
        setDashboardStats(prev => ({
          ...prev,
          bookmarkedItems: prev.bookmarkedItems + 1
        }));
      } else {
        // Remove bookmark
        const bookmarkDoc = bookmarkSnapshot.docs[0];
        await deleteDoc(doc(db, 'bookmarks', bookmarkDoc.id));
        
        // Update local stats
        setDashboardStats(prev => ({
          ...prev,
          bookmarkedItems: Math.max(0, prev.bookmarkedItems - 1)
        }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Handle course enrollment
  const enrollInCourse = async (courseId: string, courseData: any) => {
    if (!user) return;

    try {
      // Check if application already exists
      const existingApplicationQuery = query(
        collection(db, 'applications'),
        where('userId', '==', user.uid),
        where('itemId', '==', courseId),
        where('itemType', '==', 'course')
      );
      const existingApplicationSnapshot = await getDocs(existingApplicationQuery);
      
      if (!existingApplicationSnapshot.empty) {
        // Application already exists, skip creation
        return;
      }

      // Add application record
      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        itemId: courseId,
        itemType: 'course',
        itemData: courseData,
        status: 'applied',
        appliedAt: new Date()
      });

      // Update local stats
      setDashboardStats(prev => ({
        ...prev,
        totalApplications: prev.totalApplications + 1
      }));

      // Create timeline event
      await addDoc(collection(db, 'timeline'), {
        userId: user.uid,
        title: `Applied for ${courseData.name}`,
        description: `Submitted application for ${courseData.name} course`,
        date: new Date(),
        type: 'admission',
        priority: 'medium',
        isCompleted: false,
        relatedLinks: [`/courses/${courseId}`]
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  // Handle scholarship application
  const applyForScholarship = async (scholarshipId: string, scholarshipData: any) => {
    if (!user) return;

    try {
      // Check if application already exists
      const existingApplicationQuery = query(
        collection(db, 'applications'),
        where('userId', '==', user.uid),
        where('itemId', '==', scholarshipId),
        where('itemType', '==', 'scholarship')
      );
      const existingApplicationSnapshot = await getDocs(existingApplicationQuery);
      
      if (!existingApplicationSnapshot.empty) {
        // Application already exists, skip creation
        return;
      }

      // Add application record
      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        itemId: scholarshipId,
        itemType: 'scholarship',
        itemData: scholarshipData,
        status: 'applied',
        appliedAt: new Date()
      });

      // Update local stats
      setDashboardStats(prev => ({
        ...prev,
        totalApplications: prev.totalApplications + 1
      }));

      // Create timeline event
      await addDoc(collection(db, 'timeline'), {
        userId: user.uid,
        title: `Applied for ${scholarshipData.name}`,
        description: `Submitted scholarship application`,
        date: new Date(),
        type: 'scholarship',
        priority: 'high',
        isCompleted: false,
        relatedLinks: [`/scholarships/${scholarshipId}`]
      });
    } catch (error) {
      console.error('Error applying for scholarship:', error);
    }
  };

  // Get top 3 recommendations from quiz analysis
  const getTop3Recommendations = (analysis: QuizResultAnalysis | null) => {
    if (!analysis) return [];

    const recommendations = [];
    
    // Add primary field recommendation
    recommendations.push({
      title: `${analysis.primaryField} Career Path`,
      description: `Based on your personality type (${analysis.personality}) and strengths, this field aligns perfectly with your abilities.`,
      score: Math.max(...Object.values(analysis.scores)),
      type: 'Primary Match',
      icon: '🎯'
    });

    // Add secondary field recommendation
    recommendations.push({
      title: `${analysis.secondaryField} Alternative`,
      description: `Your secondary strength in this area provides excellent backup career options and skill diversity.`,
      score: Math.max(...Object.values(analysis.scores).filter(score => score !== Math.max(...Object.values(analysis.scores)))),
      type: 'Secondary Match',
      icon: '⭐'
    });

    // Add skill-based recommendation
    if (analysis.strengths.length > 0) {
      recommendations.push({
        title: `${analysis.strengths[0]} Focused Roles`,
        description: `Your top strength in ${analysis.strengths[0]} opens doors to specialized positions in various industries.`,
        score: 85,
        type: 'Skill Match',
        icon: '💪'
      });
    }

    return recommendations;
  };

  // Fetch quiz results from Firestore
  const fetchQuizResults = async (userId: string) => {
    try {
      const quizResultsQuery = query(
        collection(db, 'quiz-results'),
        where('userId', '==', userId)
      );
      
      const quizSnapshot = await getDocs(quizResultsQuery);
      
      if (!quizSnapshot.empty) {
        // Sort quiz results by completedAt descending and get the latest one
        const allQuizResults = quizSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            completedAt: data.completedAt.toDate ? data.completedAt.toDate() : new Date(data.completedAt)
          };
        });
        const sortedResults = allQuizResults.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
        const latestQuizResult = sortedResults[0];
        setHasCompletedQuiz(true);
        
        // Convert the quiz result to the expected format
        const convertedQuizResult = {
          answers: (latestQuizResult as any).answers || [],
          scores: (latestQuizResult as any).scores || {},
          personality: 'Analytical', // Default personality type
          strengths: [], // Will be derived from scores
          recommendedStreams: []
        };
        
        const analysis = analyzeQuizResults(convertedQuizResult);
        setQuizAnalysis(analysis);
        
        if (analysis) {
          // Fetch personalized content based on quiz results
          fetchRecommendedCourses(analysis.primaryField);
          fetchSuggestedColleges(analysis.primaryField);
          fetchCareerPaths(analysis.primaryField);
        }
      } else {
        // No quiz results found
        setHasCompletedQuiz(false);
        setQuizAnalysis(null);
        
        // Fetch general recommendations
        fetchRecommendedCourses('Engineering'); // Default field
        fetchSuggestedColleges('Engineering');
        fetchCareerPaths('Engineering');
      }
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      setHasCompletedQuiz(false);
      setQuizAnalysis(null);
    }
  };

  useEffect(() => {
    // Calculate profile completion based on user data
    if (user && user.uid) {
      let completion = 20; // Base for having an account
      if (user.displayName) completion += 15;
      if (user.age) completion += 15;
      if (user.gender) completion += 10;
      if (user.class) completion += 15;
      if (user.location) completion += 10;
      if (user.academicInterests?.length) completion += 15;
      
      setProfileCompletion(completion);
      
      // Fetch quiz results from Firestore
      fetchQuizResults(user.uid);

      // Fetch user timeline events and dashboard stats
      const fetchTimelineData = async () => {
        try {
          const userEvents = await fetchUserTimelineEvents(user.uid);
          setTimelineEvents(userEvents); // Only show real user events
          
          // Fetch real-time dashboard stats
          const stats = await fetchDashboardStats(user.uid);
          setDashboardStats(stats);
        } catch (error) {
          console.error('Error fetching timeline data:', error);
          setTimelineEvents([]); // Show empty array if error, no dummy data
          setDashboardStats({
            totalApplications: 0,
            bookmarkedItems: 0,
            completedEvents: 0,
            upcomingDeadlines: 0
          });
        }
      };
      
      fetchTimelineData();

      // Set up real-time updates every 30 seconds
      const intervalId = setInterval(() => {
        fetchTimelineData();
      }, 30000);

      // Cleanup interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.displayName || 'Student'}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {hasCompletedQuiz 
                      ? `Based on your aptitude test, you're perfect for ${quizAnalysis?.primaryField} field!`
                      : 'Take your aptitude test to discover your perfect career path'
                    }
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="text-right">
                    <div className="text-sm text-blue-100">Profile Completion</div>
                    <div className="text-2xl font-bold">{profileCompletion}%</div>
                    <Progress value={profileCompletion} className="w-32 mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/applications">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalApplications}</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">Active applications</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/bookmarks">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Bookmarks</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.bookmarkedItems}</p>
                      </div>
                      <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Bookmark className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-gray-600">Saved items</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/timeline">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.completedEvents}</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">Tasks done</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/timeline">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Deadlines</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.upcomingDeadlines}</p>
                      </div>
                      <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Bell className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-600">Coming up</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </motion.div>

          {!hasCompletedQuiz ? (
            // Show quiz prompt if user hasn't completed quiz
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-8"
            >
              <Card className="text-center p-8">
                <CardContent>
                  <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4">Discover Your Career Path</h2>
                  <p className="text-gray-600 mb-6">
                    Take our comprehensive aptitude test to get personalized course recommendations, 
                    college suggestions, and career guidance tailored just for you.
                  </p>
                  <Link href="/quiz">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Brain className="h-5 w-5 mr-2" />
                      Take Aptitude Test
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Quiz Results Visualization */}
              {quizAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-bold mb-6">Your Aptitude Test Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Your Strengths</CardTitle>
                        <CardDescription>Areas where you excel</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={[
                            { name: 'Analytical', value: quizAnalysis.scores.analytical },
                            { name: 'Creative', value: quizAnalysis.scores.creative },
                            { name: 'Technical', value: quizAnalysis.scores.technical },
                            { name: 'Social', value: quizAnalysis.scores.social }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Field Match</CardTitle>
                        <CardDescription>Your compatibility with different career fields</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{quizAnalysis.primaryField}</span>
                            <Badge className="bg-green-100 text-green-800">Primary Match</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{quizAnalysis.secondaryField}</span>
                            <Badge variant="outline">Secondary Match</Badge>
                          </div>
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Your Key Strengths:</h4>
                            <div className="flex flex-wrap gap-2">
                              {quizAnalysis.strengths.map((strength, index) => (
                                <Badge key={index} variant="secondary">{strength}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-gray-600">
                              <strong>Personality Type:</strong> {quizAnalysis.personality}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* Recommended Courses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Recommended Courses for You</h2>
                  <Link href="/courses">
                    <Button variant="outline">View All Courses</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedCourses.map((course) => (
                    <motion.div key={course.id} whileHover={{ scale: 1.02 }}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <Badge variant="secondary">
                              ⭐ {course.rating || 4.5}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-lg mb-2">{course.name}</h3>
                          <p className="text-gray-600 text-sm mb-3">{course.description?.slice(0, 100)}...</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Duration:</span>
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Fees:</span>
                              <span>₹{course.fees?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Provider:</span>
                              <span>{course.provider}</span>
                            </div>
                          </div>
                          <Link href={`/courses/${course.id}`}>
                            <Button className="w-full mt-4" size="sm">
                              Learn More
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Suggested Colleges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{quizAnalysis?.primaryField} Colleges for You</h2>
                  <Link href="/colleges">
                    <Button variant="outline">View All Colleges</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestedColleges.map((college) => (
                    <motion.div key={college.id} whileHover={{ scale: 1.02 }}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <Building2 className="h-8 w-8 text-green-600" />
                            <div className="text-right">
                              <Badge variant={college.isGovernment ? "default" : "secondary"}>
                                {college.isGovernment ? 'Government' : 'Private'}
                              </Badge>
                              <div className="text-sm text-gray-500 mt-1">
                                ⭐ {college.rating || 4.2}
                              </div>
                            </div>
                          </div>
                          <h3 className="font-bold text-lg mb-2">{college.name}</h3>
                          <div className="flex items-center text-gray-600 text-sm mb-3">
                            <MapPin className="h-4 w-4 mr-1" />
                            {college.location?.city}, {college.location?.state}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Courses: </span>
                              <span>{college.coursesOffered?.length || 0} programs</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Facilities: </span>
                              <span>{college.facilities?.length || 0} facilities</span>
                            </div>
                          </div>
                          <Link href={`/colleges/${college.id}`}>
                            <Button className="w-full mt-4" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Career Paths */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mb-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Career Paths in {quizAnalysis?.primaryField}</h2>
                  <Link href="/recommendations">
                    <Button variant="outline">Explore All Careers</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {careerPaths.map((career) => (
                    <motion.div key={career.id} whileHover={{ scale: 1.02 }}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <Target className="h-8 w-8 text-purple-600" />
                            <Badge variant="outline">
                              ₹{career.averageSalary?.min?.toLocaleString()} - ₹{career.averageSalary?.max?.toLocaleString()}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-lg mb-2">{career.title}</h3>
                          <p className="text-gray-600 text-sm mb-4">{career.description?.slice(0, 120)}...</p>
                          
                          <div className="mb-4">
                            <h4 className="font-medium text-sm mb-2">Required Skills:</h4>
                            <div className="flex flex-wrap gap-1">
                              {career.requiredSkills?.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {career.jobRoles && career.jobRoles.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-sm mb-2">Job Roles:</h4>
                              <div className="space-y-1">
                                {career.jobRoles.slice(0, 2).map((role, index) => (
                                  <div key={index} className="text-sm text-gray-600">
                                    • {role.title}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <Link href={`/careers/${career.id}`}>
                            <Button className="w-full mt-4" size="sm">
                              Learn More
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {/* Timeline Tracker Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                  Your Educational Timeline
                </h2>
                <p className="text-gray-600 mt-1">
                  Track your progress and upcoming deadlines
                </p>
              </div>
              <Link href="/timeline">
                <Button className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white">
                  <Calendar className="h-4 w-4" />
                  <span>Timeline</span>
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Timeline Component */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <Timeline 
                    events={timelineEvents.filter(event => !event.isCompleted && event.date >= new Date()).slice(0, 5)} // Show only upcoming uncompleted events
                    onMarkComplete={async (eventId) => {
                      try {
                        // Update in Firestore if it's a real event (not sample)
                        if (!eventId.startsWith('sample-')) {
                          const eventRef = doc(db, 'timeline', eventId);
                          await updateDoc(eventRef, {
                            isCompleted: true,
                            completedAt: new Date()
                          });
                        }
                        
                        // Update local state
                        setTimelineEvents(prev => 
                          prev.map(event => 
                            event.id === eventId 
                              ? { ...event, isCompleted: true }
                              : event
                          )
                        );

                        // Update dashboard stats
                        setDashboardStats(prev => ({
                          ...prev,
                          completedEvents: prev.completedEvents + 1,
                          upcomingDeadlines: Math.max(0, prev.upcomingDeadlines - 1)
                        }));
                      } catch (error) {
                        console.error('Error marking event as complete:', error);
                      }
                    }}
                  />
                  {timelineEvents.length === 0 && (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <Calendar className="h-12 w-12 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Timeline Events Yet</h3>
                      <p className="text-gray-500 mb-4">
                        Create your first timeline event to start tracking your educational journey
                      </p>
                      <Link href="/timeline">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Event
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">Quick Actions</h3>
                        <p className="text-sm text-slate-600">Start your educational journey</p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="bg-gray-900 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-all duration-200 flex items-center gap-2"
                      size="sm"
                    >
                      <Link href="/timeline">
                        <Calendar className="h-4 w-4 mr-1" />
                        View Timeline
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/quiz" className="group">
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Brain className="h-6 w-6" />
                          </div>
                          <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                            {hasCompletedQuiz ? 'Retake' : 'Start'}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Aptitude Test</h4>
                          <p className="text-xs text-white/90 leading-relaxed">
                            {hasCompletedQuiz ? 'Update your career profile' : 'Discover your strengths & career path'}
                          </p>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                      </div>
                    </Link>

                    <Link href="/courses" className="group">
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                            Browse
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Courses</h4>
                          <p className="text-xs text-white/90 leading-relaxed">
                            Find programs that match your interests & goals
                          </p>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                      </div>
                    </Link>

                    <Link href="/colleges" className="group">
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                            Search
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Colleges</h4>
                          <p className="text-xs text-white/90 leading-relaxed">
                            Compare institutions, fees & admission criteria
                          </p>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                      </div>
                    </Link>

                    <Link href="/scholarships" className="group">
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Trophy className="h-6 w-6" />
                          </div>
                          <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                            Apply
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Scholarships</h4>
                          <p className="text-xs text-white/90 leading-relaxed">
                            Find & apply for financial aid opportunities
                          </p>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                      </div>
                    </Link>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-500" />
                    Progress Overview
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Profile Completion</span>
                        <span>{profileCompletion}%</span>
                      </div>
                      <Progress value={profileCompletion} className="h-2" />
                    </div>
                    {hasCompletedQuiz && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Career Planning</span>
                          <span>75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Application Progress</span>
                        <span>{Math.min(100, dashboardStats.totalApplications * 20)}%</span>
                      </div>
                      <Progress value={Math.min(100, dashboardStats.totalApplications * 20)} className="h-2" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>

          {/* AI-Powered Recommendations */}
          <AIRecommendations 
            quizAnalysis={quizAnalysis}
            recommendedCourses={recommendedCourses}
            suggestedColleges={suggestedColleges}
            careerPaths={careerPaths}
            hasCompletedQuiz={hasCompletedQuiz}
          />

          {/* About Us and Contact Us Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 pb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/about">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex items-center space-x-2 hover:bg-blue-50 hover:text-blue-600 border-blue-200 min-w-[200px]"
                >
                  <Info className="h-5 w-5" />
                  <span>About Us</span>
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex items-center space-x-2 hover:bg-green-50 hover:text-green-600 border-green-200 min-w-[200px]"
                >
                  <Phone className="h-5 w-5" />
                  <span>Contact Us</span>
                </Button>
              </Link>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                Need help with your educational journey? We're here to support you!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}