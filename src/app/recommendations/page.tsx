'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Star, 
  MapPin,
  Users,
  Clock,
  Award,
  ExternalLink,
  Lightbulb,
  Sparkles,
  Rocket,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Trophy,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { College, Course, Scholarship, QuizResult, User } from '@/types';

interface Recommendation {
  id: string;
  type: 'college' | 'course' | 'scholarship' | 'career';
  title: string;
  description: string;
  score: number;
  reasons: string[];
  data: any;
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [recommendations, setRecommendations] = useState<{
    colleges: Recommendation[];
    courses: Recommendation[];
    scholarships: Recommendation[];
    careers: Recommendation[];
  }>({
    colleges: [],
    courses: [],
    scholarships: [],
    careers: []
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user profile
      let userData: User | null = null;
      const usersQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
      const usersSnapshot = await getDocs(usersQuery);
      if (!usersSnapshot.empty) {
        userData = usersSnapshot.docs[0].data() as User;
        setUserProfile(userData);
      }

      // Fetch quiz results (simplified query to avoid index requirement)
      const quizQuery = query(
        collection(db, 'quiz-results'),
        where('userId', '==', user.uid)
      );
      const quizSnapshot = await getDocs(quizQuery);
      console.log('Quiz results found:', quizSnapshot.size); // Debug log
      const quizData: QuizResult[] = [];
      quizSnapshot.forEach((doc) => {
        const data = doc.data();
        quizData.push({
          id: doc.id,
          ...data,
          completedAt: data.completedAt.toDate()
        } as QuizResult);
      });
      
      // Sort by completedAt descending to get the latest results first
      const sortedQuizData = quizData.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
      setQuizResults(sortedQuizData);

      // Generate recommendations
      await generateRecommendations(userData, quizData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (profile: User | null, quizResults: QuizResult[]) => {
    try {
      // Fetch all data
      const [collegesSnapshot, coursesSnapshot, scholarshipsSnapshot] = await Promise.all([
        getDocs(collection(db, 'colleges')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'scholarships'))
      ]);

      const colleges: College[] = [];
      collegesSnapshot.forEach((doc) => {
        colleges.push({ id: doc.id, ...doc.data() } as College);
      });

      const courses: Course[] = [];
      coursesSnapshot.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() } as Course);
      });

      const scholarships: Scholarship[] = [];
      scholarshipsSnapshot.forEach((doc) => {
        const data = doc.data();
        scholarships.push({
          id: doc.id,
          ...data,
          applicationDeadline: data.applicationDeadline.toDate()
        } as Scholarship);
      });

      // Generate recommendations based on quiz results and profile
      const latestQuiz = quizResults[0];
      // Use fallback interests based on academic interests or default values
      const interests = Array.isArray(profile?.academicInterests) ? profile.academicInterests : ['technology', 'science', 'business'];
      const skills: string[] = ['problem-solving', 'communication', 'analytical thinking'];
      const careerGoals: string[] = [];

      // College recommendations
      const collegeRecs = colleges
        .map(college => ({
          id: college.id,
          type: 'college' as const,
          title: college.name,
          description: `Located in ${college.location.district}, ${college.location.state}. ${college.isGovernment ? 'Government' : 'Private'} institution offering ${college.coursesOffered.length} courses.`,
          score: calculateCollegeScore(college, interests, profile),
          reasons: getCollegeReasons(college, interests, profile),
          data: college
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      // Course recommendations
      const courseRecs = courses
        .map(course => ({
          id: course.id,
          type: 'course' as const,
          title: course.name,
          description: course.description,
          score: calculateCourseScore(course, interests, skills),
          reasons: getCourseReasons(course, interests, skills),
          data: course
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      // Scholarship recommendations
      const scholarshipRecs = scholarships
        .filter(scholarship => new Date() < scholarship.applicationDeadline)
        .map(scholarship => ({
          id: scholarship.id,
          type: 'scholarship' as const,
          title: scholarship.name,
          description: scholarship.description,
          score: calculateScholarshipScore(scholarship, profile),
          reasons: getScholarshipReasons(scholarship, profile),
          data: scholarship
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      // Career recommendations
      const careerRecs = generateCareerRecommendations(interests, skills, careerGoals);

      setRecommendations({
        colleges: collegeRecs,
        courses: courseRecs,
        scholarships: scholarshipRecs,
        careers: careerRecs
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };

  const calculateCollegeScore = (college: College, interests: string[], profile: User | null) => {
    let score = 0;

    // Base score (since College doesn't have rating, use a default base score)
    score += 50;

    // Interest match using coursesOffered
    const matchingCourses = college.coursesOffered?.filter(course => 
      interests && interests.length > 0 && interests.some(interest => 
        course.name.toLowerCase().includes(interest.toLowerCase()) ||
        (course.stream && Array.isArray(course.stream) && course.stream.some(stream => stream.toLowerCase().includes(interest.toLowerCase())))
      )
    ) || [];
    score += matchingCourses.length * 15;

    // Location preference (using location.state and location.district)
    if (profile?.location && (
      college.location.state.toLowerCase().includes(profile.location.toLowerCase()) ||
      college.location.district.toLowerCase().includes(profile.location.toLowerCase())
    )) {
      score += 10;
    }

    // Government college preference
    if (college.isGovernment) {
      score += 15;
    }

    // Facilities bonus
    if (college.facilities && college.facilities.length > 5) {
      score += 10;
    }

    return Math.min(score, 100);
  };

  const getCollegeReasons = (college: College, interests: string[], profile: User | null): string[] => {
    const reasons: string[] = [];

    if (college.isGovernment) {
      reasons.push('Government institution with affordable fees');
    }

    const matchingCourses = college.coursesOffered?.filter(course => 
      interests && interests.length > 0 && interests.some(interest => 
        course.name.toLowerCase().includes(interest.toLowerCase()) ||
        (course.stream && Array.isArray(course.stream) && course.stream.some(stream => stream.toLowerCase().includes(interest.toLowerCase())))
      )
    ) || [];
    
    if (matchingCourses.length > 0) {
      reasons.push(`Offers courses in your areas of interest: ${matchingCourses.slice(0, 2).map(c => c.name).join(', ')}`);
    }

    if (college.facilities && college.facilities.length > 5) {
      reasons.push(`Excellent facilities: ${college.facilities.slice(0, 3).join(', ')}`);
    }

    if (profile?.location && (
      college.location.state.toLowerCase().includes(profile.location.toLowerCase()) ||
      college.location.district.toLowerCase().includes(profile.location.toLowerCase())
    )) {
      reasons.push('Located in your preferred area');
    }

    return reasons;
  };

  const calculateCourseScore = (course: Course, interests: string[], skills: string[]) => {
    let score = 0;

    // Interest match
    if (interests && interests.length > 0 && interests.some(interest => 
      course.name.toLowerCase().includes(interest.toLowerCase()) ||
      course.description.toLowerCase().includes(interest.toLowerCase())
    )) {
      score += 30;
    }

    // Skills alignment
    const skillsMatch = course.skills?.filter(skill => 
      skills && skills.length > 0 && skills.some(userSkill => skill.toLowerCase().includes(userSkill.toLowerCase()))
    ) || [];
    score += skillsMatch.length * 10;

    // Duration preference (parse duration string and check if it's short)
    const durationMonths = parseInt(course.duration.split(' ')[0]) || 12;
    if (durationMonths <= 6) {
      score += 10;
    }

    // Career prospects
    if (course.careerProspects && course.careerProspects.length > 0) {
      score += 15;
    }

    return Math.min(score, 100);
  };

  const getCourseReasons = (course: Course, interests: string[], skills: string[]): string[] => {
    const reasons: string[] = [];

    if (interests && interests.length > 0 && interests.some(interest => 
      course.name.toLowerCase().includes(interest.toLowerCase()) ||
      course.description.toLowerCase().includes(interest.toLowerCase())
    )) {
      reasons.push('Matches your interests');
    }

    const skillsMatch = course.skills?.filter(skill => 
      skills && skills.length > 0 && skills.some(userSkill => skill.toLowerCase().includes(userSkill.toLowerCase()))
    ) || [];
    if (skillsMatch.length > 0) {
      reasons.push(`Builds on your skills: ${skillsMatch.slice(0, 2).join(', ')}`);
    }

    const durationMonths = parseInt(course.duration.split(' ')[0]) || 12;
    if (durationMonths <= 6) {
      reasons.push('Short duration, quick results');
    }

    if (course.careerProspects && course.careerProspects.length > 0) {
      reasons.push(`Great career prospects: ${course.careerProspects.slice(0, 2).join(', ')}`);
    }

    return reasons;
  };

  const calculateScholarshipScore = (scholarship: Scholarship, profile: User | null) => {
    let score = 0;

    // Amount-based score
    score += Math.min(scholarship.amount / 10000, 30);

    // Eligibility match
    if (profile?.class && scholarship.eligibility.class.includes(profile.class)) {
      score += 25;
    }

    // Active scholarship bonus
    if (scholarship.isActive) {
      score += 15;
    }

    // Deadline urgency (bonus for soon-to-expire)
    const daysToDeadline = Math.ceil((scholarship.applicationDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysToDeadline <= 30) {
      score += 10;
    }

    return Math.min(score, 100);
  };

  const getScholarshipReasons = (scholarship: Scholarship, profile: User | null): string[] => {
    const reasons: string[] = [];

    if (scholarship.amount >= 50000) {
      reasons.push(`High amount: ₹${scholarship.amount.toLocaleString()}`);
    }

    if (profile?.class && scholarship.eligibility.class.includes(profile.class)) {
      reasons.push('Suitable for your academic level');
    }

    if (scholarship.isActive) {
      reasons.push('Currently accepting applications');
    }

    const daysToDeadline = Math.ceil((scholarship.applicationDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysToDeadline <= 30) {
      reasons.push(`Application deadline soon: ${daysToDeadline} days left`);
    }

    return reasons;
  };

  const generateCareerRecommendations = (interests: string[], skills: string[], careerGoals: string[]): Recommendation[] => {
    const careerDatabase = [
      {
        title: 'Software Engineer',
        description: 'Design and develop software applications and systems',
        requiredSkills: ['Programming', 'Problem Solving', 'Logical Thinking'],
        interests: ['Technology', 'Computing', 'Innovation'],
        growthRate: 'Very High',
        averageSalary: '₹8-25 LPA'
      },
      {
        title: 'Data Scientist',
        description: 'Analyze complex data to help organizations make decisions',
        requiredSkills: ['Mathematics', 'Statistics', 'Programming', 'Analytical Thinking'],
        interests: ['Mathematics', 'Technology', 'Research'],
        growthRate: 'Very High',
        averageSalary: '₹10-30 LPA'
      },
      {
        title: 'Digital Marketing Specialist',
        description: 'Promote products and services through digital channels',
        requiredSkills: ['Creativity', 'Communication', 'Analytical Thinking'],
        interests: ['Marketing', 'Technology', 'Communication'],
        growthRate: 'High',
        averageSalary: '₹4-15 LPA'
      },
      {
        title: 'Doctor',
        description: 'Diagnose and treat patients, promote health and wellness',
        requiredSkills: ['Medical Knowledge', 'Communication', 'Problem Solving'],
        interests: ['Biology', 'Healthcare', 'Helping Others'],
        growthRate: 'Stable',
        averageSalary: '₹6-50 LPA'
      },
      {
        title: 'Financial Analyst',
        description: 'Analyze financial data and investment opportunities',
        requiredSkills: ['Mathematics', 'Analytical Thinking', 'Communication'],
        interests: ['Finance', 'Mathematics', 'Business'],
        growthRate: 'High',
        averageSalary: '₹5-20 LPA'
      },
      {
        title: 'Teacher',
        description: 'Educate and inspire students in various subjects',
        requiredSkills: ['Communication', 'Patience', 'Subject Knowledge'],
        interests: ['Education', 'Helping Others', 'Knowledge Sharing'],
        growthRate: 'Stable',
        averageSalary: '₹3-12 LPA'
      }
    ];

    return careerDatabase
      .map((career, index) => {
        let score = 0;

        // Interest match
        const interestMatch = career.interests.filter(careerInterest =>
          interests.some(userInterest => 
            careerInterest.toLowerCase().includes(userInterest.toLowerCase()) ||
            userInterest.toLowerCase().includes(careerInterest.toLowerCase())
          )
        );
        score += interestMatch.length * 20;

        // Skills match
        const skillsMatch = career.requiredSkills.filter(requiredSkill =>
          skills && skills.length > 0 && skills.some(userSkill => 
            requiredSkill.toLowerCase().includes(userSkill.toLowerCase()) ||
            userSkill.toLowerCase().includes(requiredSkill.toLowerCase())
          )
        );
        score += skillsMatch.length * 15;

        // Career goals match
        if (careerGoals && careerGoals.length > 0 && careerGoals.some(goal => 
          career.title.toLowerCase().includes(goal.toLowerCase()) ||
          career.description.toLowerCase().includes(goal.toLowerCase())
        )) {
          score += 25;
        }

        // Growth rate bonus
        if (career.growthRate === 'Very High') {
          score += 15;
        } else if (career.growthRate === 'High') {
          score += 10;
        }

        const reasons: string[] = [];
        if (interestMatch.length > 0) {
          reasons.push(`Matches your interests: ${interestMatch.join(', ')}`);
        }
        if (skillsMatch.length > 0) {
          reasons.push(`Uses your skills: ${skillsMatch.join(', ')}`);
        }
        reasons.push(`Growth rate: ${career.growthRate}`);
        reasons.push(`Average salary: ${career.averageSalary}`);

        return {
          id: `career-${index}`,
          type: 'career' as const,
          title: career.title,
          description: career.description,
          score: Math.min(score, 100),
          reasons,
          data: career
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Recommendations</h2>
              <p className="text-gray-600">Analyzing your profile and preferences...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Recommendations</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Personalized suggestions based on your interests, skills, and career goals
            </p>
          </motion.div>

          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  Your Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {(userProfile?.academicInterests || ['Technology', 'Science', 'Business']).slice(0, 5).map((interest: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-purple-700 border-purple-200">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(['Problem Solving', 'Communication', 'Analytical Thinking', 'Creativity', 'Leadership']).slice(0, 5).map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-blue-700 border-blue-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Career Goals</h4>
                    <div className="flex flex-wrap gap-2">
                      {(['Software Development', 'Data Analysis', 'Project Management']).slice(0, 3).map((goal: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-green-700 border-green-200">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommendations Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Tabs defaultValue="colleges" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="colleges" className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Colleges
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Courses
                </TabsTrigger>
                <TabsTrigger value="scholarships" className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Scholarships
                </TabsTrigger>
                <TabsTrigger value="careers" className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Careers
                </TabsTrigger>
              </TabsList>

              {/* Colleges Tab */}
              <TabsContent value="colleges">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.colleges.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {rec.title}
                            </CardTitle>
                            <div className="flex items-center space-x-1 text-sm text-green-600 font-semibold">
                              <Star className="h-4 w-4" />
                              <span>{rec.score}%</span>
                            </div>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {rec.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Match Score</span>
                              <span className="text-sm text-gray-600">{rec.score}%</span>
                            </div>
                            <Progress value={rec.score} className="h-2" />
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900">Why recommended:</h4>
                            <ul className="space-y-1">
                              {rec.reasons.slice(0, 3).map((reason, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <ChevronRight className="h-3 w-3 mr-1 mt-0.5 text-green-600 flex-shrink-0" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-1" />
                              {rec.data.city}, {rec.data.state}
                            </div>
                            <Badge variant="outline">
                              Rating: {rec.data.rating || 'N/A'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.courses.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {rec.title}
                            </CardTitle>
                            <div className="flex items-center space-x-1 text-sm text-green-600 font-semibold">
                              <Star className="h-4 w-4" />
                              <span>{rec.score}%</span>
                            </div>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {rec.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Match Score</span>
                              <span className="text-sm text-gray-600">{rec.score}%</span>
                            </div>
                            <Progress value={rec.score} className="h-2" />
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900">Why recommended:</h4>
                            <ul className="space-y-1">
                              {rec.reasons.slice(0, 3).map((reason, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <ChevronRight className="h-3 w-3 mr-1 mt-0.5 text-green-600 flex-shrink-0" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              {rec.data.duration} months
                            </div>
                            <Badge variant="outline">
                              {rec.data.level}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Scholarships Tab */}
              <TabsContent value="scholarships">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.scholarships.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {rec.title}
                            </CardTitle>
                            <div className="flex items-center space-x-1 text-sm text-green-600 font-semibold">
                              <Star className="h-4 w-4" />
                              <span>{rec.score}%</span>
                            </div>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {rec.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Match Score</span>
                              <span className="text-sm text-gray-600">{rec.score}%</span>
                            </div>
                            <Progress value={rec.score} className="h-2" />
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900">Why recommended:</h4>
                            <ul className="space-y-1">
                              {rec.reasons.slice(0, 3).map((reason, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <ChevronRight className="h-3 w-3 mr-1 mt-0.5 text-green-600 flex-shrink-0" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center text-sm text-green-600 font-semibold">
                              ₹{rec.data.amount.toLocaleString()}
                            </div>
                            <Button asChild size="sm">
                              <a href={rec.data.applicationLink} target="_blank" rel="noopener noreferrer">
                                Apply <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Careers Tab */}
              <TabsContent value="careers">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.careers.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {rec.title}
                            </CardTitle>
                            <div className="flex items-center space-x-1 text-sm text-green-600 font-semibold">
                              <Star className="h-4 w-4" />
                              <span>{rec.score}%</span>
                            </div>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {rec.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Match Score</span>
                              <span className="text-sm text-gray-600">{rec.score}%</span>
                            </div>
                            <Progress value={rec.score} className="h-2" />
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900">Why recommended:</h4>
                            <ul className="space-y-1">
                              {rec.reasons.slice(0, 3).map((reason, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <ChevronRight className="h-3 w-3 mr-1 mt-0.5 text-green-600 flex-shrink-0" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <Badge variant="outline" className="text-xs">
                              Growth: {rec.data.growthRate}
                            </Badge>
                            <div className="text-sm font-semibold text-green-600">
                              {rec.data.averageSalary}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}