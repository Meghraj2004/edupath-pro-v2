'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  BookOpen, 
  Clock, 
  Users,
  Award,
  Star,
  GraduationCap,
  Code,
  Share2,
  Heart,
  CheckCircle,
  IndianRupee,
  Calendar,
  Globe,
  Briefcase,
  TrendingUp,
  Loader2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from '@/types';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchCourse();
    if (user) {
      checkBookmarkStatus();
      checkApplicationStatus();
    }
  }, [courseId, user]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      
      if (courseDoc.exists()) {
        const courseData = {
          id: courseDoc.id,
          ...courseDoc.data(),
          createdAt: courseDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: courseDoc.data().updatedAt?.toDate() || new Date()
        } as Course;
        setCourse(courseData);
      } else {
        // Fallback to sample data if course not found in Firebase
        const sampleCourse: Course = {
          id: courseId,
          name: 'Full Stack Web Development',
          shortName: 'FSWD',
          description: 'Master modern web development with this comprehensive course covering frontend and backend technologies. Learn HTML, CSS, JavaScript, React, Node.js, and database management.',
          duration: '6 months',
          eligibility: '12th pass or equivalent',
          stream: ['science', 'commerce'],
          subjects: ['HTML5 & CSS3', 'JavaScript ES6+', 'React.js', 'Node.js', 'MongoDB', 'Express.js'],
          skills: ['Frontend Development', 'Backend Development', 'Database Management', 'API Development', 'Version Control', 'Problem Solving'],
          level: 'Intermediate',
          category: 'Technology',
          provider: 'TechEd Institute',
          rating: 4.8,
          studentsEnrolled: 15420,
          fees: 25000,
          mode: 'Online',
          courseLink: 'https://www.udemy.com/course/full-stack-web-development/',
          certification: true,
          careerProspects: ['Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Web Application Developer'],
          careerPaths: [],
          syllabus: [
            {
              module: 'Module 1: Frontend Fundamentals',
              topics: ['HTML5 Semantic Elements', 'CSS3 Flexbox & Grid', 'Responsive Design', 'JavaScript Basics'],
              duration: '4 weeks'
            },
            {
              module: 'Module 2: Advanced Frontend',
              topics: ['React.js Components', 'State Management', 'Hooks & Context', 'React Router'],
              duration: '6 weeks'
            },
            {
              module: 'Module 3: Backend Development',
              topics: ['Node.js Fundamentals', 'Express.js Framework', 'RESTful APIs', 'Authentication'],
              duration: '6 weeks'
            },
            {
              module: 'Module 4: Database & Deployment',
              topics: ['MongoDB Integration', 'Cloud Deployment', 'Testing', 'Performance Optimization'],
              duration: '4 weeks'
            }
          ],
          prerequisites: ['Basic computer knowledge', 'Logical thinking', 'English proficiency'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCourse(sampleCourse);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!user || !courseId) return;

    try {
      const bookmarkQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('itemId', '==', courseId),
        where('itemType', '==', 'course')
      );
      const bookmarkSnapshot = await getDocs(bookmarkQuery);
      setIsBookmarked(!bookmarkSnapshot.empty);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user || !courseId) return;

    try {
      const applicationQuery = query(
        collection(db, 'applications'),
        where('userId', '==', user.uid),
        where('itemId', '==', courseId),
        where('itemType', '==', 'course')
      );
      const applicationSnapshot = await getDocs(applicationQuery);
      setHasApplied(!applicationSnapshot.empty);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user || !course) return;
    setBookmarking(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const bookmarkQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('itemId', '==', course.id),
          where('itemType', '==', 'course')
        );
        const bookmarkSnapshot = await getDocs(bookmarkQuery);
        if (!bookmarkSnapshot.empty) {
          await deleteDoc(bookmarkSnapshot.docs[0].ref);
          setIsBookmarked(false);
        }
      } else {
        // Add bookmark
        await addDoc(collection(db, 'bookmarks'), {
          userId: user.uid,
          itemId: course.id,
          itemType: 'course',
          itemData: course,
          createdAt: new Date()
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarking(false);
    }
  };

  const enrollInCourse = async () => {
    if (!user || !course) return;
    setApplying(true);

    try {
      // Check if application already exists
      const existingApplicationQuery = query(
        collection(db, 'applications'),
        where('userId', '==', user.uid),
        where('itemId', '==', course.id),
        where('itemType', '==', 'course')
      );
      const existingApplicationSnapshot = await getDocs(existingApplicationQuery);
      
      if (!existingApplicationSnapshot.empty) {
        // Application already exists, just update the status
        setHasApplied(true);
        return;
      }

      // Add application record
      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        itemId: course.id,
        itemType: 'course',
        itemData: course,
        status: 'applied',
        appliedAt: new Date()
      });

      // Create timeline event
      await addDoc(collection(db, 'timeline'), {
        userId: user.uid,
        title: `Enrolled in ${course.name}`,
        description: `Started ${course.name} course`,
        date: new Date(),
        type: 'admission',
        priority: 'medium',
        isCompleted: false,
        relatedLinks: [`/courses/${course.id}`]
      });

      setHasApplied(true);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setApplying(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technology': return <Code className="h-6 w-6" />;
      case 'Design': return <BookOpen className="h-6 w-6" />;
      case 'Business': return <Briefcase className="h-6 w-6" />;
      default: return <BookOpen className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Course</h2>
              <p className="text-gray-600">Please wait while we fetch the course details...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !course) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Course not found'}
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
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
          {/* Back Button */}
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>

          {/* Course Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
          >
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      {getCategoryIcon(course.category || 'default')}
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {course.category}
                      </Badge>
                      <Badge className={`ml-2 ${
                        course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {course.name}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-700">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{course.duration}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Students</p>
                      <p className="font-semibold">{course.studentsEnrolled?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="font-semibold">{course.rating}/5</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Globe className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Mode</p>
                      <p className="font-semibold">{course.mode}</p>
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Provided by</p>
                      <p className="font-semibold text-blue-900">{course.provider}</p>
                    </div>
                    {course.certification && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Award className="h-4 w-4 mr-1" />
                        Certification Included
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enrollment Card */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-green-600">
                    ₹{course.fees?.toLocaleString()}
                  </CardTitle>
                  <CardDescription>
                    {course.courseLink ? 'Enroll directly with course provider' : 'Course fee information'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasApplied ? (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-600">Enrolled Successfully</p>
                      <p className="text-sm text-gray-600">You have enrolled in this course</p>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      size="lg"
                      onClick={enrollInCourse}
                      disabled={applying}
                    >
                      {applying ? 'Enrolling...' : 'Enroll Now'}
                      {!applying && <GraduationCap className="h-4 w-4 ml-2" />}
                    </Button>
                  )}

                  {course.courseLink && (
                    <Button 
                      variant="outline"
                      className="w-full"
                      size="sm"
                      asChild
                    >
                      <a href={course.courseLink} target="_blank" rel="noopener noreferrer">
                        Visit Course Provider
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Detailed course information</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Career guidance included</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Progress tracking</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      variant={isBookmarked ? "default" : "outline"} 
                      size="sm" 
                      className="flex-1"
                      onClick={toggleBookmark}
                      disabled={bookmarking}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isBookmarked ? 'fill-current' : ''}`} />
                      {isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Course Details Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="career">Career</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">What you'll learn:</h4>
                      <p className="text-gray-700">{course.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Prerequisites:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {course.prerequisites?.map((prereq, index) => (
                          <li key={index} className="text-gray-700">{prereq}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Eligibility:</h4>
                      <p className="text-gray-700">{course.eligibility}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Suitable for streams:</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.stream?.map((stream, index) => (
                          <Badge key={index} variant="outline">{stream}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="syllabus" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Syllabus</CardTitle>
                    <CardDescription>Detailed breakdown of what you'll learn</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.syllabus && Array.isArray(course.syllabus) && course.syllabus.length > 0 ? (
                        course.syllabus.map((module, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-lg">{module.module}</h4>
                              <Badge variant="outline">{module.duration}</Badge>
                            </div>
                            <ul className="space-y-1">
                              {module.topics && Array.isArray(module.topics) ? module.topics.map((topic, topicIndex) => (
                                <li key={topicIndex} className="flex items-center text-gray-700">
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                  {topic}
                                </li>
                              )) : (
                                <li className="text-gray-500 italic">No topics available</li>
                              )}
                            </ul>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Syllabus Available</h3>
                          <p className="text-gray-500">Detailed syllabus information is not available for this course.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills You'll Gain</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.skills?.map((skill, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="font-medium">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="career" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Career Prospects</CardTitle>
                    <CardDescription>Potential career paths after completing this course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.careerProspects?.map((career, index) => (
                        <div key={index} className="flex items-center p-4 border rounded-lg">
                          <div className="bg-purple-100 p-3 rounded-full mr-4">
                            <Briefcase className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{career}</h4>
                            <p className="text-sm text-gray-600">High demand career path</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Career Support</h4>
                      <p className="text-blue-800">Get career guidance, resume building, and interview preparation support throughout your learning journey.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}