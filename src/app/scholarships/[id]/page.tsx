'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Calendar, 
  Users, 
  GraduationCap, 
  MapPin, 
  Clock, 
  FileText, 
  ExternalLink,
  ArrowLeft,
  Heart,
  Send,
  DollarSign,
  CheckCircle2,
  Info
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';

interface Scholarship {
  id: string;
  name: string;
  description: string;
  provider: string;
  amount: number;
  applicationDeadline: Date;
  applicationLink: string;
  eligibility: {
    class: string[];
    category: string[];
    gender?: string[];
    income: number;
  };
  documents: string[];
  applicationProcess?: string;
  benefits?: string[];
  contactInfo?: {
    email: string;
    phone: string;
    website: string;
  };
  isActive: boolean;
  createdAt: Date;
}

export default function ScholarshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchScholarship();
      checkBookmarkStatus();
      checkApplicationStatus();
    }
  }, [params.id, user]);

  const fetchScholarship = async () => {
    try {
      const scholarshipDoc = await getDoc(doc(db, 'scholarships', params.id as string));
      if (scholarshipDoc.exists()) {
        const data = scholarshipDoc.data();
        setScholarship({
          id: scholarshipDoc.id,
          ...data,
          applicationDeadline: data.applicationDeadline?.toDate ? data.applicationDeadline.toDate() : new Date(data.applicationDeadline),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
        } as Scholarship);
      }
    } catch (error) {
      console.error('Error fetching scholarship:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!user) return;

    try {
      const bookmarkQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('itemId', '==', params.id),
        where('itemType', '==', 'scholarship')
      );
      const bookmarkSnapshot = await getDocs(bookmarkQuery);
      setIsBookmarked(!bookmarkSnapshot.empty);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user) return;

    try {
      const applicationQuery = query(
        collection(db, 'applications'),
        where('userId', '==', user.uid),
        where('itemId', '==', params.id),
        where('itemType', '==', 'scholarship')
      );
      const applicationSnapshot = await getDocs(applicationQuery);
      setHasApplied(!applicationSnapshot.empty);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user || !scholarship) return;
    setBookmarking(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const bookmarkQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('itemId', '==', scholarship.id),
          where('itemType', '==', 'scholarship')
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
          itemId: scholarship.id,
          itemType: 'scholarship',
          itemData: scholarship,
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

  const applyForScholarship = async () => {
    if (!user || !scholarship) return;
    setApplying(true);

    try {
      // Check if application already exists
      const existingApplicationQuery = query(
        collection(db, 'applications'),
        where('userId', '==', user.uid),
        where('itemId', '==', scholarship.id),
        where('itemType', '==', 'scholarship')
      );
      const existingApplicationSnapshot = await getDocs(existingApplicationQuery);
      
      if (!existingApplicationSnapshot.empty) {
        // Application already exists, redirect to provider website
        if (scholarship.applicationLink) {
          window.open(scholarship.applicationLink, '_blank');
        }
        setHasApplied(true);
        return;
      }

      // Add application record
      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        itemId: scholarship.id,
        itemType: 'scholarship',
        itemData: scholarship,
        status: 'applied',
        appliedAt: new Date()
      });

      // Create timeline event
      await addDoc(collection(db, 'timeline'), {
        userId: user.uid,
        title: `Applied for ${scholarship.name}`,
        description: `Submitted application for ${scholarship.name} scholarship`,
        date: new Date(),
        type: 'scholarship',
        priority: 'high',
        isCompleted: false,
        relatedLinks: [`/scholarships/${scholarship.id}`]
      });

      setHasApplied(true);
      
      // Redirect to scholarship provider's application page
      if (scholarship.applicationLink) {
        window.open(scholarship.applicationLink, '_blank');
      }
    } catch (error) {
      console.error('Error applying for scholarship:', error);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading scholarship details...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!scholarship) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Scholarship Not Found</h1>
              <Button onClick={() => router.push('/scholarships')}>
                Back to Scholarships
              </Button>
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
        
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl shadow-lg">
                        <Trophy className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">{scholarship.name}</CardTitle>
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {scholarship.provider}
                          </Badge>
                          <Badge variant={scholarship.isActive ? "default" : "outline"} className="bg-green-100 text-green-800">
                            {scholarship.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold">₹{scholarship.amount?.toLocaleString() || 'Amount TBA'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Deadline: {
                              scholarship.applicationDeadline 
                                ? (() => {
                                    try {
                                      const date = scholarship.applicationDeadline instanceof Date 
                                        ? scholarship.applicationDeadline 
                                        : new Date(scholarship.applicationDeadline);
                                      return isNaN(date.getTime()) ? 'TBA' : date.toLocaleDateString();
                                    } catch {
                                      return 'TBA';
                                    }
                                  })() 
                                : 'TBA'
                            }</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant={isBookmarked ? "default" : "outline"}
                        size="sm"
                        onClick={toggleBookmark}
                        disabled={bookmarking}
                        className="shadow-sm"
                      >
                        <Heart className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current text-red-500' : ''}`} />
                        {isBookmarked ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-700 leading-relaxed text-lg">{scholarship.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Details */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center space-x-2 text-gray-800">
                    <Info className="h-5 w-5 text-blue-600" />
                    <span>Scholarship Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-800">Scholarship Amount</h4>
                      </div>
                      <p className="text-2xl font-bold text-green-600">₹{scholarship.amount?.toLocaleString() || 'Amount TBA'}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-5 w-5 text-orange-600" />
                        <h4 className="font-semibold text-orange-800">Application Deadline</h4>
                      </div>
                      <p className="text-lg font-semibold text-orange-600">
                        {scholarship.applicationDeadline 
                          ? (() => {
                              try {
                                const date = scholarship.applicationDeadline instanceof Date 
                                  ? scholarship.applicationDeadline 
                                  : new Date(scholarship.applicationDeadline);
                                return isNaN(date.getTime()) 
                                  ? 'Deadline TBA' 
                                  : date.toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    });
                              } catch {
                                return 'Deadline TBA';
                              }
                            })()
                          : 'Deadline TBA'}
                      </p>
                    </div>
                  </div>

                  {/* Eligibility */}
                  {(scholarship.eligibility?.class || scholarship.eligibility?.category || scholarship.eligibility?.gender || scholarship.eligibility?.income) && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Eligibility Criteria</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scholarship.eligibility?.class && scholarship.eligibility.class.length > 0 && (
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-sm text-gray-600">Class</p>
                            <p className="font-medium text-blue-700">{scholarship.eligibility.class.join(', ')}</p>
                          </div>
                        )}
                        {scholarship.eligibility?.category && scholarship.eligibility.category.length > 0 && (
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-sm text-gray-600">Category</p>
                            <p className="font-medium text-blue-700">{scholarship.eligibility.category.join(', ')}</p>
                          </div>
                        )}
                        {scholarship.eligibility?.gender && scholarship.eligibility.gender.length > 0 && (
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="font-medium text-blue-700">{scholarship.eligibility.gender.join(', ')}</p>
                          </div>
                        )}
                        {scholarship.eligibility?.income && (
                          <div className="bg-white p-3 rounded-md shadow-sm">
                            <p className="text-sm text-gray-600">Family Income</p>
                            <p className="font-medium text-blue-700">{scholarship.eligibility.income}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Required Documents */}
                  {scholarship.documents && scholarship.documents.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Required Documents</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {scholarship.documents.map((doc, index) => (
                          <div key={index} className="bg-white p-3 rounded-md shadow-sm flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-gray-700">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {scholarship.benefits && scholarship.benefits.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Benefits</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {scholarship.benefits.map((benefit, index) => (
                          <div key={index} className="bg-white p-3 rounded-md shadow-sm flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Application Process */}
                  {scholarship.applicationProcess && (
                    <div>
                      <h3 className="font-semibold mb-3">Application Process</h3>
                      <p className="text-gray-700">{scholarship.applicationProcess}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Actions */}
              <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Ready to Apply?</CardTitle>
                  <p className="text-sm text-gray-600">Take the next step towards your education goals</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasApplied ? (
                    <div className="text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-green-600 mb-2">Application Submitted</h3>
                      <p className="text-sm text-gray-600 mb-4">You have already applied for this scholarship</p>
                      {scholarship.applicationLink && (
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="lg"
                          onClick={() => window.open(scholarship.applicationLink, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Provider
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700" 
                        size="lg"
                        onClick={applyForScholarship}
                        disabled={applying}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {applying ? 'Processing...' : 'Apply Now'}
                      </Button>
                      {scholarship.applicationLink && (
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="lg"
                          onClick={() => window.open(scholarship.applicationLink, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Provider Website
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">Amount</p>
                        <p className="text-lg font-bold text-green-800">₹{scholarship.amount?.toLocaleString() || 'TBA'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <Clock className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-700">Deadline</p>
                        <p className="text-sm font-bold text-red-800">
                          {scholarship.applicationDeadline ? new Date(scholarship.applicationDeadline).toLocaleDateString() : 'TBA'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-700">Provider</p>
                        <p className="text-sm font-bold text-blue-800">{scholarship.provider}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              {scholarship.contactInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scholarship.contactInfo.email && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Email:</span>
                        <a 
                          href={`mailto:${scholarship.contactInfo.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {scholarship.contactInfo.email}
                        </a>
                      </div>
                    )}
                    {scholarship.contactInfo.phone && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Phone:</span>
                        <a 
                          href={`tel:${scholarship.contactInfo.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {scholarship.contactInfo.phone}
                        </a>
                      </div>
                    )}
                    {scholarship.contactInfo.website && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Website:</span>
                        <a 
                          href={scholarship.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          Visit <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}