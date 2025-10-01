'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Building2, Trophy, Heart, ExternalLink, Trash2, Star, FileText, Clock, MapPin, Calendar, CheckCircle2, BookmarkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';

interface Bookmark {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'course' | 'college' | 'scholarship' | 'resource';
  itemData: any;
  createdAt: Date;
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      // Use simple query to avoid complex index requirements
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(bookmarksQuery);
      const userBookmarks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Bookmark[];

      // Sort in application code instead of Firestore
      userBookmarks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setBookmarks(userBookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    try {
      await deleteDoc(doc(db, 'bookmarks', bookmarkId));
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'college':
        return <Building2 className="h-5 w-5 text-green-600" />;
      case 'scholarship':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'resource':
        return <FileText className="h-5 w-5 text-purple-600" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'border-blue-200 bg-gradient-to-br from-blue-50 via-blue-25 to-indigo-50';
      case 'college':
        return 'border-green-200 bg-gradient-to-br from-emerald-50 via-green-25 to-teal-50';
      case 'scholarship':
        return 'border-yellow-200 bg-gradient-to-br from-yellow-50 via-amber-25 to-orange-50';
      case 'resource':
        return 'border-purple-200 bg-gradient-to-br from-purple-50 via-violet-25 to-indigo-50';
      default:
        return 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading bookmarks...</div>
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
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text">
              <h1 className="text-4xl font-bold text-transparent mb-3 flex items-center">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 p-2 rounded-full mr-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                My Bookmarks
              </h1>
            </div>
            <p className="text-gray-600 text-lg">Your saved courses, colleges, scholarships, and resources</p>
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-200 rounded-full mr-2"></div>
                <span>{bookmarks.filter(b => b.itemType === 'course').length} Courses</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-200 rounded-full mr-2"></div>
                <span>{bookmarks.filter(b => b.itemType === 'college').length} Colleges</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-200 rounded-full mr-2"></div>
                <span>{bookmarks.filter(b => b.itemType === 'scholarship').length} Scholarships</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-200 rounded-full mr-2"></div>
                <span>{bookmarks.filter(b => b.itemType === 'resource').length} Resources</span>
              </div>
            </div>
          </motion.div>

          {bookmarks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center p-12 bg-gradient-to-br from-gray-50 to-white border-0 shadow-lg">
                <CardContent>
                  <div className="bg-gradient-to-r from-pink-500 to-red-500 p-4 rounded-full w-fit mx-auto mb-6">
                    <Heart className="h-16 w-16 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">No Bookmarks Yet</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                    Start bookmarking courses, colleges, scholarships, and resources to save them for later. 
                    Build your personalized collection of educational opportunities!
                  </p>
                <div className="flex justify-center space-x-4 flex-wrap gap-2">
                  <Link href="/courses">
                    <Button>Browse Courses</Button>
                  </Link>
                  <Link href="/colleges">
                    <Button variant="outline">Find Colleges</Button>
                  </Link>
                  <Link href="/scholarships">
                    <Button variant="outline">View Scholarships</Button>
                  </Link>
                  <Link href="/resources">
                    <Button variant="outline">Find Resources</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-md ${getTypeColor(bookmark.itemType)} overflow-hidden h-full`}>
                  <div className="relative">
                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm p-4 border-b border-white/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-white/70 shadow-sm group-hover:scale-110 transition-transform">
                            {getTypeIcon(bookmark.itemType)}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold line-clamp-1 text-gray-800">
                              {bookmark.itemData?.name || bookmark.itemData?.title || 'Unknown Item'}
                            </CardTitle>
                            <p className="text-xs text-gray-500 capitalize mt-1">
                              {bookmark.itemType}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBookmark(bookmark.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50/80 rounded-full p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Description */}
                        <div>
                          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                            {bookmark.itemData?.description || 
                             bookmark.itemData?.shortDescription || 
                             bookmark.itemData?.summary ||
                             (bookmark.itemType === 'course' ? 'A comprehensive course designed to enhance your skills and advance your career prospects.' :
                              bookmark.itemType === 'college' ? 'An excellent educational institution offering quality programs and facilities for students.' :
                              bookmark.itemType === 'scholarship' ? 'A valuable scholarship opportunity to support your educational journey and reduce financial burden.' :
                              bookmark.itemType === 'resource' ? 'A useful educational resource to help you learn and grow in your chosen field.' :
                              'Explore this opportunity to advance your educational and career goals.')}
                          </p>
                        </div>
                        
                        {/* Detailed Information Cards */}
                        {bookmark.itemType === 'course' && (
                          <div className="bg-white/60 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Course Details</span>
                              {bookmark.itemData?.rating && (
                                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-xs font-medium">{bookmark.itemData.rating}/5</span>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {bookmark.itemData?.duration && (
                                <div className="bg-blue-50 px-2 py-1 rounded flex items-center">
                                  <Clock className="h-3 w-3 mr-1 text-blue-600" />
                                  <span>{bookmark.itemData.duration}</span>
                                </div>
                              )}
                              {bookmark.itemData?.fees && (
                                <div className="bg-green-50 px-2 py-1 rounded flex items-center">
                                  <span className="text-green-600 font-medium">₹{bookmark.itemData.fees.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                            {bookmark.itemData?.provider && (
                              <div className="text-xs text-gray-600">
                                Provider: <span className="font-medium">{bookmark.itemData.provider}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {bookmark.itemType === 'college' && (
                          <div className="bg-white/60 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">College Info</span>
                              {bookmark.itemData?.rating && (
                                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-xs font-medium">{bookmark.itemData.rating}/5</span>
                                </div>
                              )}
                            </div>
                            {bookmark.itemData?.location && (
                              <div className="flex items-center text-xs text-gray-600">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{bookmark.itemData.location.city}, {bookmark.itemData.location.state}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                bookmark.itemData?.isGovernment 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {bookmark.itemData?.isGovernment ? '🏛️ Government' : '🏢 Private'}
                              </span>
                              {bookmark.itemData?.coursesOffered && (
                                <span className="text-xs text-gray-500">
                                  {bookmark.itemData.coursesOffered.length} courses
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {bookmark.itemType === 'scholarship' && (
                          <div className="bg-white/60 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Scholarship Details</span>
                              <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                                <Trophy className="h-3 w-3 text-green-600 mr-1" />
                                <span className="text-xs font-medium text-green-700">Active</span>
                              </div>
                            </div>
                            {bookmark.itemData?.amount && (
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg">
                                <div className="text-lg font-bold text-green-700">
                                  ₹{bookmark.itemData.amount.toLocaleString()}
                                </div>
                                <div className="text-xs text-green-600">Scholarship Amount</div>
                              </div>
                            )}
                            {bookmark.itemData?.deadline && (
                              <div className="flex items-center text-xs">
                                <Calendar className="h-3 w-3 mr-1 text-red-500" />
                                <span className="text-red-600 font-medium">
                                  Deadline: {new Date(bookmark.itemData.deadline).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {bookmark.itemType === 'resource' && (
                          <div className="bg-white/60 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Resource Info</span>
                              {bookmark.itemData?.isVerified && (
                                <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                                  <CheckCircle2 className="h-3 w-3 text-green-600 mr-1" />
                                  <span className="text-xs font-medium text-green-700">Verified</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {bookmark.itemData?.type && (
                                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                                  {bookmark.itemData.type}
                                </span>
                              )}
                              {bookmark.itemData?.category && (
                                <span className="bg-gray-50 text-gray-700 px-2 py-1 rounded-full text-xs">
                                  {bookmark.itemData.category}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-between items-center pt-3 border-t border-white/30">
                          <div className="text-xs text-gray-500 flex items-center">
                            <BookmarkIcon className="h-3 w-3 mr-1" />
                            <span>Saved {bookmark.createdAt.toLocaleDateString()}</span>
                          </div>
                          <Link href={`/${bookmark.itemType}s/${bookmark.itemId}`}>
                            <Button variant="outline" size="sm" className="bg-white/80 hover:bg-white border-white/40 text-gray-700 hover:text-gray-900 shadow-sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}