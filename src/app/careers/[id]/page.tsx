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
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Briefcase, 
  TrendingUp, 
  Users,
  IndianRupee,
  Star,
  GraduationCap,
  Building2,
  Globe,
  BookOpen,
  Target,
  Award,
  CheckCircle,
  ExternalLink,
  Calendar,
  Clock,
  BarChart3,
  Loader2,
  AlertTriangle,
  MapPin,
  Zap,
  Brain,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CareerPath } from '@/types';

export default function CareerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const careerId = params.id as string;
  
  const [career, setCareer] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  useEffect(() => {
    fetchCareer();
    if (user) {
      checkBookmarkStatus();
    }
  }, [careerId, user]);

  const fetchCareer = async () => {
    try {
      setLoading(true);
      const careerDoc = await getDoc(doc(db, 'careers', careerId));
      
      if (careerDoc.exists()) {
        const careerData = {
          id: careerDoc.id,
          ...careerDoc.data()
        } as CareerPath;
        setCareer(careerData);
      } else {
        // Fallback to sample data if career not found in Firebase
        const sampleCareer: CareerPath = {
          id: careerId,
          title: 'Software Engineer',
          description: 'Design, develop, test, and maintain software applications and systems. Software engineers work on everything from mobile apps to large-scale enterprise systems, using various programming languages and technologies.',
          courseId: 'course-1',
          jobRoles: [
            {
              title: 'Frontend Developer',
              description: 'Build user interfaces and user experiences for web applications',
              salaryRange: { min: 300000, max: 800000 },
              companies: ['Google', 'Microsoft', 'Amazon', 'Netflix', 'Meta'],
              requirements: ['React/Angular', 'JavaScript', 'CSS', 'HTML', 'TypeScript']
            },
            {
              title: 'Backend Developer',
              description: 'Develop server-side logic, databases, and APIs',
              salaryRange: { min: 400000, max: 1000000 },
              companies: ['Amazon', 'Microsoft', 'Google', 'Uber', 'Spotify'],
              requirements: ['Node.js/Python', 'Databases', 'API Design', 'Cloud Services']
            },
            {
              title: 'Full Stack Developer',
              description: 'Work on both frontend and backend development',
              salaryRange: { min: 500000, max: 1200000 },
              companies: ['Startup Companies', 'Mid-size Tech', 'Google', 'Amazon'],
              requirements: ['Frontend & Backend', 'Databases', 'DevOps', 'System Design']
            }
          ],
          higherEducation: [
            'M.Tech in Computer Science',
            'MS in Software Engineering',
            'MBA in Technology Management',
            'Ph.D in Computer Science'
          ],
          governmentExams: [
            'ISRO Scientist/Engineer',
            'DRDO Scientist B',
            'BARC Scientific Officer',
            'GATE for PSUs',
            'Civil Services (IAS) - Technical Posts'
          ],
          averageSalary: { min: 400000, max: 1200000 },
          growthProspects: 'Excellent growth with opportunities to become Tech Lead, Senior Engineer, Principal Engineer, Engineering Manager, or even CTO. The field offers both technical and managerial career paths with high demand globally.',
          requiredSkills: [
            'Programming Languages',
            'Problem Solving',
            'System Design',
            'Teamwork',
            'Communication',
            'Analytical Thinking',
            'Continuous Learning',
            'Version Control'
          ],
          industryTrends: [
            'AI/ML Integration',
            'Cloud Computing',
            'DevOps Practices',
            'Microservices Architecture',
            'Remote Work Culture'
          ],
          workLife: 'Generally good work-life balance in most companies',
          workLocation: 'Major tech hubs: Bangalore, Hyderabad, Pune, Mumbai, Delhi NCR',
          workCulture: 'Collaborative, innovative, fast-paced environment'
        };
        setCareer(sampleCareer);
      }
    } catch (error) {
      console.error('Error fetching career:', error);
      setError('Failed to load career details');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!user || !careerId) return;

    try {
      const bookmarkQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('itemId', '==', careerId),
        where('itemType', '==', 'career')
      );
      const bookmarkSnapshot = await getDocs(bookmarkQuery);
      setIsBookmarked(!bookmarkSnapshot.empty);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user || !career) return;
    setBookmarking(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const bookmarkQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('itemId', '==', career.id),
          where('itemType', '==', 'career')
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
          itemId: career.id,
          itemType: 'career',
          itemData: career,
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

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // You can add actual bookmark functionality here
  };

  const formatSalary = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Career</h2>
              <p className="text-gray-600">Please wait while we fetch the career details...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !career) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Career not found'}
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

          {/* Career Header */}
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
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">
                        Career Path
                      </Badge>
                      <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                        {career.jobRoles?.length || 0} Job Roles
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {career.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-700">
                    {career.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <IndianRupee className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Salary Range</p>
                      <p className="font-semibold">
                        {formatSalary(career.averageSalary.min)} - {formatSalary(career.averageSalary.max)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Growth Rate</p>
                      <p className="font-semibold">High Demand</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Target className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Job Roles</p>
                      <p className="font-semibold">{career.jobRoles?.length || 0} Options</p>
                    </div>
                  </div>

                  {/* Growth Prospects */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg mb-6">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Growth Prospects
                    </h4>
                    <p className="text-purple-800">{career.growthProspects}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Card */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-purple-600">
                    Explore This Career
                  </CardTitle>
                  <CardDescription>Start your journey today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Find Related Courses
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Connect with Professionals
                  </Button>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Career guidance included</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Industry mentor support</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Job placement assistance</span>
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
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Career Details Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Tabs defaultValue="roles" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="roles">Job Roles</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="environment">Work Life</TabsTrigger>
              </TabsList>

              <TabsContent value="roles" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {career.jobRoles?.map((role, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{role.title}</CardTitle>
                            <CardDescription className="mt-2">{role.description}</CardDescription>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {formatSalary(role.salaryRange.min)} - {formatSalary(role.salaryRange.max)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center">
                              <Zap className="h-4 w-4 mr-2 text-blue-600" />
                              Key Requirements
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {role.requirements.map((req, reqIndex) => (
                                <Badge key={reqIndex} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center">
                              <Building2 className="h-4 w-4 mr-2 text-purple-600" />
                              Top Companies
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {role.companies.slice(0, 4).map((company, compIndex) => (
                                <Badge key={compIndex} variant="secondary" className="text-xs">
                                  {company}
                                </Badge>
                              ))}
                              {role.companies.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{role.companies.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      Essential Skills
                    </CardTitle>
                    <CardDescription>Skills you need to develop for this career</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {career.requiredSkills?.map((skill, index) => (
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

              <TabsContent value="education" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2" />
                        Higher Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {career.higherEducation?.map((education, index) => (
                          <div key={index} className="flex items-center p-3 border rounded-lg">
                            <div className="bg-purple-100 p-2 rounded-full mr-3">
                              <BookOpen className="h-5 w-5 text-purple-600" />
                            </div>
                            <span>{education}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        Government Exams
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {career.governmentExams?.map((exam, index) => (
                          <div key={index} className="flex items-center p-3 border rounded-lg">
                            <div className="bg-green-100 p-2 rounded-full mr-3">
                              <Target className="h-5 w-5 text-green-600" />
                            </div>
                            <span>{exam}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Industry Trends
                    </CardTitle>
                    <CardDescription>Current trends shaping this career field</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {career.industryTrends?.map((trend, index) => (
                        <div key={index} className="flex items-center p-4 border rounded-lg">
                          <div className="bg-orange-100 p-3 rounded-full mr-4">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{trend}</h4>
                            <p className="text-sm text-gray-600">High growth area</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="environment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Work Environment
                    </CardTitle>
                    <CardDescription>What to expect in your work life</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-semibold">Work-Life Balance</h4>
                        <p className="text-sm text-gray-600 mt-2">{career.workLife}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-semibold">Locations</h4>
                        <p className="text-sm text-gray-600 mt-2">{career.workLocation}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <h4 className="font-semibold">Culture</h4>
                        <p className="text-sm text-gray-600 mt-2">{career.workCulture}</p>
                      </div>
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