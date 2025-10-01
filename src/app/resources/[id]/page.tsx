'use client';

import React, { useState, useEffect, use } from 'react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  ExternalLink,
  FileText,
  Video,
  Globe,
  GraduationCap,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Tag,
  BookOpen,
  Loader2,
  Star,
  Eye,
  Share2,
  Download,
  Play,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Resource } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'ebook':
      return <FileText className="h-8 w-8" />;
    case 'video':
      return <Video className="h-8 w-8" />;
    case 'course':
      return <GraduationCap className="h-8 w-8" />;
    case 'website':
      return <Globe className="h-8 w-8" />;
    default:
      return <BookOpen className="h-8 w-8" />;
  }
};

const getResourceTypeColor = (type: string) => {
  switch (type) {
    case 'ebook':
      return 'from-blue-400 to-blue-600';
    case 'video':
      return 'from-red-400 to-red-600';
    case 'course':
      return 'from-green-400 to-green-600';
    case 'website':
      return 'from-purple-400 to-purple-600';
    default:
      return 'from-gray-400 to-gray-600';
  }
};

const getResourceBgColor = (type: string) => {
  switch (type) {
    case 'ebook':
      return 'from-blue-50 to-indigo-50 border-blue-200';
    case 'video':
      return 'from-red-50 to-pink-50 border-red-200';
    case 'course':
      return 'from-green-50 to-emerald-50 border-green-200';
    case 'website':
      return 'from-purple-50 to-violet-50 border-purple-200';
    default:
      return 'from-gray-50 to-slate-50 border-gray-200';
  }
};

interface ResourceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  useEffect(() => {
    fetchResource();
    if (user) {
      checkBookmarkStatus();
    }
  }, [resolvedParams.id, user]);

  const fetchResource = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const resourceDoc = await getDoc(doc(db, 'resources', resolvedParams.id));
      
      if (resourceDoc.exists()) {
        const data = resourceDoc.data();
        const resourceData = {
          id: resourceDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        } as Resource;
        setResource(resourceData);
      } else {
        setError('Resource not found');
      }
    } catch (error) {
      console.error('Error fetching resource:', error);
      setError('Failed to load resource');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!user) return;

    try {
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('itemId', '==', resolvedParams.id),
        where('itemType', '==', 'resource')
      );
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      setIsBookmarked(!bookmarksSnapshot.empty);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user || !resource) return;

    try {
      setBookmarking(true);

      if (isBookmarked) {
        // Remove bookmark
        const bookmarksQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('itemId', '==', resource.id),
          where('itemType', '==', 'resource')
        );
        const bookmarksSnapshot = await getDocs(bookmarksQuery);
        
        for (const bookmarkDoc of bookmarksSnapshot.docs) {
          await deleteDoc(doc(db, 'bookmarks', bookmarkDoc.id));
        }

        setIsBookmarked(false);
      } else {
        // Add bookmark
        await addDoc(collection(db, 'bookmarks'), {
          userId: user.uid,
          itemId: resource.id,
          itemType: 'resource',
          itemData: {
            title: resource.title,
            description: resource.description,
            type: resource.type,
            category: resource.category,
            url: resource.url,
            isVerified: resource.isVerified
          },
          createdAt: new Date()
        });

        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    } finally {
      setBookmarking(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg">Loading resource details...</span>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !resource) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {error || 'Resource Not Found'}
              </h1>
              <Button onClick={() => router.push('/resources')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resources
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-6 hover:bg-white/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className={`bg-gradient-to-r ${getResourceBgColor(resource.type)} border-2`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-4 bg-gradient-to-br ${getResourceTypeColor(resource.type)} rounded-xl shadow-lg`}>
                          <div className="text-white">
                            {getResourceIcon(resource.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                            {resource.title}
                          </CardTitle>
                          <div className="flex items-center flex-wrap gap-2 mb-4">
                            <Badge variant="secondary" className="text-sm">
                              {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="text-sm">
                              {resource.category}
                            </Badge>
                            {resource.isVerified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Added: {(() => {
                                  if (!resource.createdAt) return 'Date not available';
                                  try {
                                    // Handle Firestore Timestamp
                                    if (typeof (resource.createdAt as any).toDate === 'function') {
                                      return new Date((resource.createdAt as any).toDate()).toLocaleDateString();
                                    }
                                    // Handle regular Date
                                    return new Date(resource.createdAt).toLocaleDateString();
                                  } catch (error) {
                                    return 'Date not available';
                                  }
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>About This Resource</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {resource.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Subjects */}
              {resource.subjects && resource.subjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-blue-800">
                        <Tag className="h-5 w-5" />
                        <span>Subjects Covered</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {resource.subjects.map((subject, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-white text-blue-700 border-blue-200 hover:bg-blue-100"
                          >
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Resource Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Resource Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${resource.type === 'ebook' ? 'bg-blue-100 text-blue-600' : 
                            resource.type === 'video' ? 'bg-red-100 text-red-600' :
                            resource.type === 'course' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'}`}>
                            {resource.type === 'ebook' && <FileText className="h-4 w-4" />}
                            {resource.type === 'video' && <Video className="h-4 w-4" />}
                            {resource.type === 'course' && <GraduationCap className="h-4 w-4" />}
                            {resource.type === 'website' && <Globe className="h-4 w-4" />}
                          </div>
                          <span className="font-medium text-gray-900">
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <Badge variant="outline">{resource.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Access Resource */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className={`border-2 bg-gradient-to-br ${getResourceBgColor(resource.type)}`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${getResourceTypeColor(resource.type)} rounded-full flex items-center justify-center mb-3 shadow-lg`}>
                      <div className="text-white">
                        {resource.type === 'video' ? <Play className="h-8 w-8" /> : getResourceIcon(resource.type)}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-gray-900">Ready to Learn?</CardTitle>
                    <p className="text-sm text-gray-600">Access this educational resource now</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      asChild
                      className={`w-full bg-gradient-to-r ${getResourceTypeColor(resource.type)} hover:opacity-90 text-white shadow-lg`}
                      size="lg"
                    >
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Access Resource
                      </a>
                    </Button>

                    <div className="space-y-2">
                      <Button 
                        variant={isBookmarked ? "default" : "outline"}
                        size="sm" 
                        className="w-full"
                        onClick={toggleBookmark}
                        disabled={bookmarking}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4 mr-2" />
                        ) : (
                          <Bookmark className="h-4 w-4 mr-2" />
                        )}
                        {bookmarking ? 'Saving...' : isBookmarked ? 'Saved' : 'Save to Bookmarks'}
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Resource Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resource Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">Verification</span>
                      </div>
                      <span className={`text-sm font-medium ${resource.isVerified ? 'text-green-600' : 'text-gray-500'}`}>
                        {resource.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Subjects</span>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {resource.subjects.length} topics
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Type</span>
                      </div>
                      <span className="text-sm font-medium text-purple-600">
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/resources">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Resources
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/bookmarks">
                        <Star className="h-4 w-4 mr-2" />
                        Save to Bookmarks
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}