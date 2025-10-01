'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users,
  IndianRupee,
  Star,
  GraduationCap,
  Building2,
  BookOpen,
  Trophy,
  Wifi,
  Car,
  Utensils,
  Home,
  Dumbbell,
  Library,
  Loader2,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { College } from '@/types';

export default function CollegeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const collegeId = params.id as string;
  
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCollegeDetails();
    if (user) {
      checkBookmarkStatus();
    }
  }, [collegeId, user]);

  const fetchCollegeDetails = async () => {
    if (!collegeId) return;
    
    setLoading(true);
    try {
      const collegeDoc = await getDoc(doc(db, 'colleges', collegeId));
      if (collegeDoc.exists()) {
        setCollege({ id: collegeDoc.id, ...collegeDoc.data() } as College);
      } else {
        setError('College not found');
      }
    } catch (error) {
      console.error('Error fetching college details:', error);
      setError('Failed to load college details');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!user || !collegeId) return;

    try {
      const bookmarkQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('itemId', '==', collegeId),
        where('itemType', '==', 'college')
      );
      const bookmarkSnapshot = await getDocs(bookmarkQuery);
      setIsBookmarked(!bookmarkSnapshot.empty);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user || !college) return;
    setBookmarking(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const bookmarkQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('itemId', '==', college.id),
          where('itemType', '==', 'college')
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
          itemId: college.id,
          itemType: 'college',
          itemData: college,
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

  const facilityIcons: { [key: string]: React.ReactNode } = {
    'WiFi': <Wifi className="h-4 w-4" />,
    'Parking': <Car className="h-4 w-4" />,
    'Canteen': <Utensils className="h-4 w-4" />,
    'Hostel': <Home className="h-4 w-4" />,
    'Gym': <Dumbbell className="h-4 w-4" />,
    'Library': <Library className="h-4 w-4" />,
    'Sports': <Trophy className="h-4 w-4" />,
    'default': <CheckCircle className="h-4 w-4" />
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading college details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !college) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">College Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested college could not be found.'}</p>
            <Button onClick={() => router.push('/colleges')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Colleges
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Button variant="ghost" onClick={() => router.push('/colleges')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Colleges
            </Button>
          </motion.div>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h1 className="text-3xl font-bold mr-4">{college.name}</h1>
                      {college.isGovernment && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          Government
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-blue-100 mb-4">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{college.location?.district}, {college.location?.state} - {college.location?.pincode}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {college.coursesOffered && (
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          <span>{college.coursesOffered.length} Courses</span>
                        </div>
                      )}
                      {college.facilities && (
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          <span>{college.facilities.length} Facilities</span>
                        </div>
                      )}
                      {college.medium && (
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span>{college.medium.join(', ')} Medium</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Contact Actions */}
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <Button
                      variant={isBookmarked ? "default" : "outline"}
                      size="sm"
                      onClick={toggleBookmark}
                      disabled={bookmarking}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                      {isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                    {college.contact?.phone && (
                      <Button variant="secondary" size="sm" asChild>
                        <a href={`tel:${college.contact.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                    )}
                    {college.website && (
                      <Button variant="secondary" size="sm" asChild>
                        <a href={college.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="facilities">Facilities</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* About */}
                  <Card>
                    <CardHeader>
                      <CardTitle>About the College</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {`${college.name} is a ${college.isGovernment ? 'government' : 'private'} educational institution located in ${college.location?.district}, ${college.location?.state}. The college offers various undergraduate and postgraduate programs across multiple disciplines.`}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <GraduationCap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gray-900">
                            {college.coursesOffered?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Courses</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gray-900">
                            {college.facilities?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Facilities</div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Medium of Instruction</h4>
                        <div className="flex flex-wrap gap-2">
                          {college.medium?.map((med, idx) => (
                            <Badge key={idx} variant="outline">
                              {med}
                            </Badge>
                          )) || <span className="text-gray-500">Not specified</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Admission Cutoffs */}
                {college.cutoffs && Object.keys(college.cutoffs).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Admission Cutoffs</CardTitle>
                      <CardDescription>Previous year cutoff marks for different categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {college.coursesOffered?.map((course) => {
                          const cutoff = college.cutoffs[course.id];
                          if (!cutoff) return null;
                          
                          return (
                            <div key={course.id} className="text-center p-4 border rounded-lg">
                              <div className="text-lg font-semibold text-gray-900 mb-2">
                                {cutoff.general} - {cutoff.obc} - {cutoff.sc} - {cutoff.st}
                              </div>
                              <div className="text-sm text-gray-600 uppercase font-medium">
                                {course.name.split(' ').map(word => word.slice(0, 2)).join('').toUpperCase()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Fees */}
                {college.fees && Object.keys(college.fees).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Fee Structure</CardTitle>
                      <CardDescription>Annual fees for different courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {college.coursesOffered?.map((course) => {
                          const fee = college.fees[course.id];
                          if (!fee) return null;
                          
                          return (
                            <div key={course.id} className="flex justify-between items-center p-4 border rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">{course.name}</div>
                                <div className="text-sm text-gray-600">{course.degree} • {course.duration}</div>
                              </div>
                              <div className="text-lg font-semibold text-green-600">
                                ₹{fee.toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses">
                <Card>
                  <CardHeader>
                    <CardTitle>Courses Offered</CardTitle>
                    <CardDescription>
                      Detailed information about all courses available at this college
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {college.coursesOffered && college.coursesOffered.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {college.coursesOffered.map((course, idx) => (
                          <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {typeof course === 'string' ? course : course.name || 'Course'}
                            </h3>
                            {typeof course === 'object' && course.shortName && (
                              <p className="text-sm text-gray-600 mb-2">({course.shortName})</p>
                            )}
                            {typeof course === 'object' && course.duration && (
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Duration: {course.duration}</span>
                              </div>
                            )}
                            {typeof course === 'object' && course.eligibility && (
                              <div className="text-sm text-gray-600">
                                <strong>Eligibility:</strong> {course.eligibility}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No course information available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Facilities Tab */}
              <TabsContent value="facilities">
                <Card>
                  <CardHeader>
                    <CardTitle>Campus Facilities</CardTitle>
                    <CardDescription>
                      Available facilities and amenities at the college
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {college.facilities && college.facilities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {college.facilities.map((facility, idx) => (
                          <div key={idx} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="text-blue-600 mr-3">
                              {facilityIcons[facility] || facilityIcons.default}
                            </div>
                            <span className="font-medium text-gray-900">{facility}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No facility information available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fees Tab */}
              <TabsContent value="fees">
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Structure</CardTitle>
                    <CardDescription>
                      Annual fee structure for different courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {college.fees && Object.keys(college.fees).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(college.fees).map(([course, fee]) => (
                          <div key={course} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-semibold text-gray-900">{course}</h3>
                              <p className="text-sm text-gray-600">Annual Fee</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                ₹{typeof fee === 'number' ? fee.toLocaleString() : fee}
                              </div>
                              <div className="text-sm text-gray-500">per year</div>
                            </div>
                          </div>
                        ))}
                        
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Fees are subject to change. Please contact the college for the most current fee structure.
                          </AlertDescription>
                        </Alert>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <IndianRupee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Fee information not available</p>
                        <p className="text-sm text-gray-400 mt-2">Please contact the college directly for fee details</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900">Address</h4>
                          <p className="text-gray-600">
                            {college.location?.district}, {college.location?.state}
                            {college.location?.pincode && ` - ${college.location.pincode}`}
                          </p>
                        </div>
                      </div>

                      {college.contact?.phone && (
                        <div className="flex items-start space-x-3">
                          <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">Phone</h4>
                            <a href={`tel:${college.contact.phone}`} className="text-blue-600 hover:underline">
                              {college.contact.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {college.contact?.email && (
                        <div className="flex items-start space-x-3">
                          <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">Email</h4>
                            <a href={`mailto:${college.contact.email}`} className="text-blue-600 hover:underline">
                              {college.contact.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {college.website && (
                        <div className="flex items-start space-x-3">
                          <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">Website</h4>
                            <a 
                              href={college.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              Visit Website
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {college.contact?.phone && (
                        <Button className="w-full" asChild>
                          <a href={`tel:${college.contact.phone}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            Call College
                          </a>
                        </Button>
                      )}
                      
                      {college.contact?.email && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={`mailto:${college.contact.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </a>
                        </Button>
                      )}
                      
                      {college.website && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={college.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-2" />
                            Visit Website
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}

                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-3">
                          Interested in this college? Get in touch for more information about admissions and courses.
                        </p>
                        <Button variant="secondary" className="w-full" onClick={() => router.push('/contact')}>
                          <Mail className="h-4 w-4 mr-2" />
                          Get Guidance
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}