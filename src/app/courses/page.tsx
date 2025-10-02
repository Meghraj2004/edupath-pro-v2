'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock,
  Users,
  Award,
  Star,
  ExternalLink,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Code,
  Palette,
  Calculator,
  Stethoscope,
  Loader2,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Course, CareerPath } from '@/types';

const categories = ['All', 'Technology', 'Design', 'Business', 'Science', 'Arts', 'Engineering'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const durations = ['All', '1-3 months', '3-6 months', '6-12 months', '1+ years'];

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [careers, setCareers] = useState<CareerPath[]>([]);
  const [filteredCareers, setFilteredCareers] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [bookmarkedCourses, setBookmarkedCourses] = useState<Set<string>>(new Set());
  const [bookmarkedCareers, setBookmarkedCareers] = useState<Set<string>>(new Set());

  const fetchCourseBookmarks = async () => {
    if (!user) return;
    try {
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('itemType', '==', 'course')
      );
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      const bookmarkedItemIds = new Set(bookmarksSnapshot.docs.map(doc => doc.data().itemId));
      setBookmarkedCourses(bookmarkedItemIds);
    } catch (error) {
      console.error('Error fetching course bookmarks:', error);
    }
  };

  const fetchCareerBookmarks = async () => {
    if (!user) return;
    try {
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('itemType', '==', 'career')
      );
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      const bookmarkedItemIds = new Set(bookmarksSnapshot.docs.map(doc => doc.data().itemId));
      setBookmarkedCareers(bookmarkedItemIds);
    } catch (error) {
      console.error('Error fetching career bookmarks:', error);
    }
  };

  const toggleCourseBookmark = async (course: Course, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;

    const isBookmarked = bookmarkedCourses.has(course.id);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const bookmarksQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('itemId', '==', course.id),
          where('itemType', '==', 'course')
        );
        const bookmarksSnapshot = await getDocs(bookmarksQuery);
        
        if (!bookmarksSnapshot.empty) {
          await deleteDoc(bookmarksSnapshot.docs[0].ref);
          setBookmarkedCourses(prev => {
            const newSet = new Set(prev);
            newSet.delete(course.id);
            return newSet;
          });
        }
      } else {
        // Add bookmark
        await addDoc(collection(db, 'bookmarks'), {
          userId: user.uid,
          itemId: course.id,
          itemType: 'course',
          itemData: {
            title: course.name,
            provider: course.provider,
            category: course.category,
            fees: course.fees
          },
          createdAt: new Date()
        });
        
        setBookmarkedCourses(prev => new Set([...prev, course.id]));
      }
    } catch (error) {
      console.error('Error toggling course bookmark:', error);
    }
  };

  const toggleCareerBookmark = async (career: CareerPath, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;

    const isBookmarked = bookmarkedCareers.has(career.id);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const bookmarksQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('itemId', '==', career.id),
          where('itemType', '==', 'career')
        );
        const bookmarksSnapshot = await getDocs(bookmarksQuery);
        
        if (!bookmarksSnapshot.empty) {
          await deleteDoc(bookmarksSnapshot.docs[0].ref);
          setBookmarkedCareers(prev => {
            const newSet = new Set(prev);
            newSet.delete(career.id);
            return newSet;
          });
        }
      } else {
        // Add bookmark
        await addDoc(collection(db, 'bookmarks'), {
          userId: user.uid,
          itemId: career.id,
          itemType: 'career',
          itemData: {
            title: career.title,
            description: career.description,
            averageSalary: career.averageSalary,
            growthProspects: career.growthProspects
          },
          createdAt: new Date()
        });
        
        setBookmarkedCareers(prev => new Set([...prev, career.id]));
      }
    } catch (error) {
      console.error('Error toggling career bookmark:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCareers();
    fetchCourseBookmarks();
    fetchCareerBookmarks();
  }, [user]);

  useEffect(() => {
    filterCourses();
    filterCareers();
  }, [courses, careers, searchTerm, selectedCategory, selectedLevel, selectedDuration, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesQuery = query(collection(db, 'courses'));
      const snapshot = await getDocs(coursesQuery);
      
      const coursesData: Course[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        coursesData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Course);
      });
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setSampleCourses();
    } finally {
      setLoading(false);
    }
  };

  const fetchCareers = async () => {
    try {
      const careersQuery = query(collection(db, 'careers'));
      const snapshot = await getDocs(careersQuery);
      
      const careersData: CareerPath[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        careersData.push({
          id: doc.id,
          ...data,
        } as CareerPath);
      });
      
      setCareers(careersData);
    } catch (error) {
      console.error('Error fetching careers:', error);
      setSampleCareers();
    }
  };

  const setSampleCourses = () => {
    const sampleCourses: Course[] = [
      {
        id: 'course-1',
        name: 'Full Stack Web Development',
        shortName: 'FSWD',
        description: 'Complete web development course covering frontend and backend technologies',
        duration: '6 months',
        eligibility: '12th pass or equivalent',
        stream: ['science', 'commerce'],
        subjects: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'React'],
        skills: ['Programming', 'Problem Solving', 'Web Design'],
        level: 'Intermediate',
        category: 'Technology',
        provider: 'TechEd Institute',
        rating: 4.8,
        studentsEnrolled: 15420,
        fees: 25000,
        mode: 'Online',
        courseLink: 'https://www.udemy.com/course/full-stack-web-development/',
        certification: true,
        careerProspects: ['Full Stack Developer', 'Frontend Developer', 'Backend Developer'],
        careerPaths: [],
        syllabus: [],
        prerequisites: ['Basic computer knowledge'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'course-2',
        name: 'Digital Marketing Mastery',
        shortName: 'DMM',
        description: 'Comprehensive digital marketing course covering all major platforms and strategies',
        duration: '4 months',
        eligibility: 'Graduate in any field',
        stream: ['commerce', 'arts'],
        subjects: ['SEO', 'Social Media Marketing', 'Google Ads', 'Content Marketing'],
        skills: ['Marketing', 'Analytics', 'Content Creation'],
        level: 'Beginner',
        category: 'Business',
        provider: 'Marketing Pro Academy',
        rating: 4.6,
        studentsEnrolled: 8750,
        fees: 18000,
        mode: 'Hybrid',
        courseLink: 'https://www.coursera.org/specializations/digital-marketing',
        certification: true,
        careerProspects: ['Digital Marketing Specialist', 'SEO Expert', 'Social Media Manager'],
        careerPaths: [],
        syllabus: [],
        prerequisites: ['Basic internet knowledge'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setCourses(sampleCourses);
  };

  const setSampleCareers = () => {
    const sampleCareers: CareerPath[] = [
      {
        id: 'career-1',
        title: 'Software Engineer',
        description: 'Design, develop, and maintain software applications and systems',
        courseId: 'course-1',
        jobRoles: [
          {
            title: 'Frontend Developer',
            description: 'Build user interfaces and user experiences',
            salaryRange: { min: 300000, max: 800000 },
            companies: ['Google', 'Microsoft', 'Amazon', 'Netflix'],
            requirements: ['React/Angular', 'JavaScript', 'CSS', 'HTML']
          }
        ],
        higherEducation: ['M.Tech in Computer Science', 'MS in Software Engineering'],
        governmentExams: ['ISRO', 'DRDO', 'BARC'],
        averageSalary: { min: 400000, max: 1200000 },
        growthProspects: 'Excellent growth with opportunities to become Tech Lead, Architect, or CTO',
        requiredSkills: ['Programming', 'Problem Solving', 'System Design', 'Teamwork']
      },
      {
        id: 'career-2',
        title: 'Digital Marketing Specialist',
        description: 'Plan and execute digital marketing campaigns across various platforms',
        courseId: 'course-2',
        jobRoles: [
          {
            title: 'SEO Specialist',
            description: 'Optimize websites for search engines',
            salaryRange: { min: 250000, max: 600000 },
            companies: ['HubSpot', 'Moz', 'SEMrush', 'Ahrefs'],
            requirements: ['SEO Tools', 'Analytics', 'Content Strategy']
          }
        ],
        higherEducation: ['MBA in Marketing', 'Masters in Digital Marketing'],
        governmentExams: ['UPSC', 'State Marketing Boards'],
        averageSalary: { min: 300000, max: 800000 },
        growthProspects: 'Good growth opportunities to Marketing Manager, CMO roles',
        requiredSkills: ['Marketing Strategy', 'Analytics', 'Communication', 'Creativity']
      }
    ];
    setCareers(sampleCareers);
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    if (selectedLevel !== 'All') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredCourses(filtered);
  };

  const filterCareers = () => {
    let filtered = [...careers];

    if (searchTerm) {
      filtered = filtered.filter(career => 
        career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        career.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        career.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    filtered.sort((a, b) => {
      return (b.averageSalary.max || 0) - (a.averageSalary.max || 0);
    });

    setFilteredCareers(filtered);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technology': return <Code className="h-5 w-5" />;
      case 'Design': return <Palette className="h-5 w-5" />;
      case 'Business': return <Briefcase className="h-5 w-5" />;
      case 'Science': return <Calculator className="h-5 w-5" />;
      case 'Arts': return <BookOpen className="h-5 w-5" />;
      case 'Engineering': return <GraduationCap className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSelectedDuration('All');
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== 'All' ? selectedCategory : '',
    selectedLevel !== 'All' ? selectedLevel : '',
    selectedDuration !== 'All' ? selectedDuration : ''
  ].filter(Boolean).length;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Courses</h2>
              <p className="text-gray-600">Please wait while we fetch the latest courses...</p>
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
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses & Careers</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover courses and career paths that align with your goals
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{courses.length}</h3>
                <p className="text-gray-600">Total Courses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Briefcase className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{careers.length}</h3>
                <p className="text-gray-600">Career Paths</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {Math.round(courses.reduce((sum, course) => sum + (course.studentsEnrolled || 0), 0) / 1000)}K+
                </h3>
                <p className="text-gray-600">Students Enrolled</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {(courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1)}
                </h3>
                <p className="text-gray-600">Average Rating</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Search & Filter
                  </CardTitle>
                  {activeFiltersCount > 0 && (
                    <Badge variant="destructive">
                      {activeFiltersCount} filters active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by name, description, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Level</Label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map(duration => (
                          <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Clear Filters
                    </Button>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-gray-600">
                      Showing {activeTab === 'courses' ? filteredCourses.length : filteredCareers.length} results
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs for Courses and Careers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="courses" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Courses ({filteredCourses.length})
                </TabsTrigger>
                <TabsTrigger value="careers" className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Careers ({filteredCareers.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses">
                {filteredCourses.length === 0 ? (
                  <Card className="p-12 text-center">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or filters to find more courses.
                    </p>
                    {activeFiltersCount > 0 && (
                      <Button onClick={clearFilters}>
                        Clear all filters
                      </Button>
                    )}
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5 }}
                      >
                        <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-2 mb-2">
                                {getCategoryIcon(course.category || 'default')}
                                <Badge variant="outline" className="text-xs">
                                  {course.category || 'General'}
                                </Badge>
                              </div>
                              <Badge className={getLevelColor(course.level || 'Beginner')}>
                                {course.level || 'Beginner'}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {course.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {course.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{course.provider}</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{course.rating}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                {course.duration}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Users className="h-4 w-4 mr-1" />
                                {course.studentsEnrolled?.toLocaleString()} students
                              </div>
                            </div>

                            {course.skills && course.skills.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-700 mb-2 block">Skills you'll learn:</span>
                                <div className="flex flex-wrap gap-1">
                                  {course.skills.slice(0, 3).map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {course.skills.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{course.skills.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="pt-4 border-t">
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-green-600">
                                  ₹{course.fees?.toLocaleString()}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {course.certification && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Award className="h-3 w-3 mr-1" />
                                      Certified
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {course.mode}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button className="flex-1" asChild>
                                  <Link href={`/courses/${course.id}`}>
                                    Enroll Now
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                  </Link>
                                </Button>
                                {user && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => toggleCourseBookmark(course, e)}
                                    className="px-3"
                                  >
                                    <Heart 
                                      className={`h-4 w-4 ${
                                        bookmarkedCourses.has(course.id) 
                                          ? 'fill-red-500 text-red-500' 
                                          : 'text-gray-500'
                                      }`}
                                    />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="careers">
                {filteredCareers.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No career paths found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria to find more career paths.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCareers.map((career, index) => (
                      <motion.div
                        key={career.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5 }}
                      >
                        <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-2 mb-2">
                                <Briefcase className="h-5 w-5 text-purple-600" />
                                <Badge variant="outline" className="text-xs">
                                  Career Path
                                </Badge>
                              </div>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                {career.jobRoles?.length || 0} roles
                              </Badge>
                            </div>
                            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {career.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {career.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Salary Range</span>
                              <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium text-green-600">
                                  ₹{(career.averageSalary.min / 100000).toFixed(1)}L - ₹{(career.averageSalary.max / 100000).toFixed(1)}L
                                </span>
                              </div>
                            </div>

                            {career.jobRoles && career.jobRoles.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-700 mb-2 block">Top Job Roles:</span>
                                <div className="flex flex-wrap gap-1">
                                  {career.jobRoles.slice(0, 2).map((role, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {role.title}
                                    </Badge>
                                  ))}
                                  {career.jobRoles.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{career.jobRoles.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {career.requiredSkills && career.requiredSkills.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-700 mb-2 block">Skills needed:</span>
                                <div className="flex flex-wrap gap-1">
                                  {career.requiredSkills.slice(0, 3).map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {career.requiredSkills.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{career.requiredSkills.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            <div>
                              <span className="text-sm font-medium text-gray-700 mb-1 block">Growth Prospects:</span>
                              <p className="text-xs text-gray-600 line-clamp-2">{career.growthProspects}</p>
                            </div>

                            <div className="pt-4 border-t">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  {career.higherEducation && career.higherEducation.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      <GraduationCap className="h-3 w-3 mr-1" />
                                      Higher Ed
                                    </Badge>
                                  )}
                                  {career.governmentExams && career.governmentExams.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      Gov Exams
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button className="flex-1" asChild>
                                  <Link href={`/careers/${career.id}`}>
                                    Explore Career
                                    <TrendingUp className="h-4 w-4 ml-2" />
                                  </Link>
                                </Button>
                                {user && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => toggleCareerBookmark(career, e)}
                                    className="px-3"
                                  >
                                    <Heart 
                                      className={`h-4 w-4 ${
                                        bookmarkedCareers.has(career.id) 
                                          ? 'fill-red-500 text-red-500' 
                                          : 'text-gray-500'
                                      }`}
                                    />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}