'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc, deleteDoc, doc, where } from 'firebase/firestore';
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
import { 
  BookOpen, 
  Search, 
  Filter, 
  ExternalLink,
  FileText,
  Video,
  Globe,
  GraduationCap,
  Loader2,
  Eye,
  CheckCircle,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Resource } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const resourceTypes = ['ebook', 'video', 'course', 'website'];
const categories = ['Academic', 'Skill Development', 'Career Guidance', 'Test Preparation', 'General Knowledge'];

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'ebook':
      return <FileText className="h-5 w-5" />;
    case 'video':
      return <Video className="h-5 w-5" />;
    case 'course':
      return <GraduationCap className="h-5 w-5" />;
    case 'website':
      return <Globe className="h-5 w-5" />;
    default:
      return <BookOpen className="h-5 w-5" />;
  }
};

const getResourceTypeColor = (type: string) => {
  switch (type) {
    case 'ebook':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'video':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'course':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'website':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedResources, setBookmarkedResources] = useState<Set<string>>(new Set());
  const [bookmarkingIds, setBookmarkingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchResources();
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedType, selectedCategory]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const resourcesQuery = query(
        collection(db, 'resources'),
        orderBy('createdAt', 'desc')
      );
      const resourcesSnapshot = await getDocs(resourcesQuery);
      const resourcesData = resourcesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Resource));
      
      setResources(resourcesData);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('itemType', '==', 'resource')
      );
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      const bookmarkedIds = new Set(bookmarksSnapshot.docs.map(doc => doc.data().itemId));
      setBookmarkedResources(bookmarkedIds);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (resource: Resource) => {
    if (!user) return;

    const isBookmarked = bookmarkedResources.has(resource.id);
    
    try {
      setBookmarkingIds(prev => new Set(prev).add(resource.id));

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

        setBookmarkedResources(prev => {
          const newSet = new Set(prev);
          newSet.delete(resource.id);
          return newSet;
        });
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

        setBookmarkedResources(prev => new Set(prev).add(resource.id));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    } finally {
      setBookmarkingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(resource.id);
        return newSet;
      });
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Search by title or description
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.subjects.some(subject => 
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by type
    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    setFilteredResources(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-lg">Loading resources...</span>
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
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Educational Resources</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover curated educational materials, courses, and tools to enhance your learning journey
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
                <h3 className="text-2xl font-bold text-gray-900">{resources.length}</h3>
                <p className="text-gray-600">Total Resources</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{resources.filter(r => r.isVerified).length}</h3>
                <p className="text-gray-600">Verified</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Video className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{resources.filter(r => r.type === 'video').length}</h3>
                <p className="text-gray-600">Video Content</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{resources.filter(r => r.type === 'course').length}</h3>
                <p className="text-gray-600">Courses</p>
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
                    Search & Filter Resources
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, description, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="resource-type">Type</Label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger>
                            <SelectValue placeholder="All types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            {resourceTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="resource-category">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="w-full"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Resources Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {filteredResources.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or check back later for new resources.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card 
                      className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500"
                      onClick={() => router.push(`/resources/${resource.id}`)}
                    >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${getResourceTypeColor(resource.type)}`}>
                                {getResourceIcon(resource.type)}
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                                  {resource.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                  </Badge>
                                  {resource.isVerified && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <CardDescription className="line-clamp-3">
                            {resource.description}
                          </CardDescription>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Category</span>
                              <Badge variant="secondary" className="text-xs">
                                {resource.category}
                              </Badge>
                            </div>

                            {resource.subjects && resource.subjects.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-700 mb-2 block">Subjects</span>
                                <div className="flex flex-wrap gap-1">
                                  {resource.subjects.slice(0, 3).map((subject, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {subject}
                                    </Badge>
                                  ))}
                                  {resource.subjects.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{resource.subjects.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button asChild className="flex-1">
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Access Resource
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </a>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="px-3"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleBookmark(resource);
                              }}
                              disabled={bookmarkingIds.has(resource.id)}
                            >
                              {bookmarkedResources.has(resource.id) ? (
                                <BookmarkCheck className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="outline" size="sm" className="px-3">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}