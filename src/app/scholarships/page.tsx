'use client';

import React, { useState, useEffect } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Search, 
  Filter, 
  ExternalLink,
  Calendar,
  IndianRupee,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Loader2,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { Scholarship } from '@/types';
import Link from 'next/link';

const categories = ['General', 'SC', 'ST', 'OBC', 'EWS', 'Minority'];
const classes = ['10', '12', 'Graduation', 'Post-Graduation'];
const providers = ['Central Government', 'State Government', 'NGO', 'Private'];

export default function ScholarshipsPage() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('itemType', '==', 'scholarship')
      );
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      const bookmarkedItemIds = new Set(bookmarksSnapshot.docs.map(doc => doc.data().itemId));
      setBookmarkedItems(bookmarkedItemIds);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (scholarship: Scholarship, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;

    const isBookmarked = bookmarkedItems.has(scholarship.id);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const bookmarksQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('itemId', '==', scholarship.id),
          where('itemType', '==', 'scholarship')
        );
        const bookmarksSnapshot = await getDocs(bookmarksQuery);
        
        if (!bookmarksSnapshot.empty) {
          await deleteDoc(bookmarksSnapshot.docs[0].ref);
          setBookmarkedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(scholarship.id);
            return newSet;
          });
        }
      } else {
        // Add bookmark
        await addDoc(collection(db, 'bookmarks'), {
          userId: user.uid,
          itemId: scholarship.id,
          itemType: 'scholarship',
          itemData: {
            title: scholarship.name,
            provider: scholarship.provider,
            deadline: scholarship.applicationDeadline,
            amount: scholarship.amount
          },
          createdAt: new Date()
        });
        
        setBookmarkedItems(prev => new Set([...prev, scholarship.id]));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchBookmarks();
  }, [user]);

  useEffect(() => {
    filterScholarships();
  }, [scholarships, searchTerm, selectedCategory, selectedClass, selectedProvider, showExpired]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch scholarships
      const scholarshipsQuery = query(
        collection(db, 'scholarships'),
        orderBy('applicationDeadline', 'desc')
      );
      const scholarshipsSnapshot = await getDocs(scholarshipsQuery);
      const scholarshipsData: Scholarship[] = [];
      scholarshipsSnapshot.forEach((doc) => {
        const data = doc.data();
        scholarshipsData.push({
          id: doc.id,
          ...data,
          applicationDeadline: data.applicationDeadline?.toDate ? data.applicationDeadline.toDate() : new Date(data.applicationDeadline)
        } as Scholarship);
      });
      
      setScholarships(scholarshipsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterScholarships = () => {
    let filtered = [...scholarships];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(scholarship => 
        (scholarship.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (scholarship.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (scholarship.provider || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(scholarship => 
        scholarship.eligibility?.category && 
        Array.isArray(scholarship.eligibility.category) &&
        scholarship.eligibility.category.includes(selectedCategory)
      );
    }

    // Class filter
    if (selectedClass) {
      filtered = filtered.filter(scholarship => 
        scholarship.eligibility?.class && 
        Array.isArray(scholarship.eligibility.class) &&
        scholarship.eligibility.class.includes(selectedClass)
      );
    }

    // Provider filter
    if (selectedProvider) {
      filtered = filtered.filter(scholarship => 
        (scholarship.provider || '').toLowerCase().includes(selectedProvider.toLowerCase())
      );
    }

    // Active/Expired filter
    if (!showExpired) {
      filtered = filtered.filter(scholarship => 
        scholarship.applicationDeadline && 
        isAfter(scholarship.applicationDeadline, new Date())
      );
    }

    setFilteredScholarships(filtered);
  };

  const getDeadlineStatus = (deadline: Date) => {
    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);
    
    if (isBefore(deadline, now)) return 'expired';
    if (isBefore(deadline, threeDaysFromNow)) return 'urgent';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      case 'urgent': return <Clock className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedClass('');
    setSelectedProvider('');
    setShowExpired(false);
  };

  const activeFiltersCount = [searchTerm, selectedCategory, selectedClass, selectedProvider].filter(Boolean).length + (showExpired ? 1 : 0);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Scholarships</h2>
              <p className="text-gray-600">Please wait while we fetch the latest scholarship information...</p>
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
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Scholarships</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover government scholarships to support your academic journey and achieve your educational goals
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
                <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{scholarships.length}</h3>
                <p className="text-gray-600">Total Scholarships</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {scholarships.filter(s => isAfter(s.applicationDeadline, new Date())).length}
                </h3>
                <p className="text-gray-600">Active Applications</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <IndianRupee className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">
                  ₹{(scholarships.reduce((acc, s) => acc + s.amount, 0) / scholarships.length).toFixed(0)}K
                </h3>
                <p className="text-gray-600">Average Amount</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{scholarships.filter(s => s.provider === 'Central Government').length}</h3>
                <p className="text-gray-600">Central Govt</p>
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
                    Search & Filter Scholarships
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
                    <Label htmlFor="search">Search Scholarships</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by name, description, or provider..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Class/Level</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Provider</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map(provider => (
                          <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant={showExpired ? 'default' : 'outline'}
                      onClick={() => setShowExpired(!showExpired)}
                      className="w-full"
                    >
                      {showExpired ? 'Hide' : 'Show'} Expired
                    </Button>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-gray-600">
                      Showing {filteredScholarships.length} of {scholarships.length} scholarships
                    </span>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Scholarships Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-12"
          >
            {filteredScholarships.length === 0 ? (
              <Card className="p-12 text-center">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No scholarships found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters to find more scholarships.
                </p>
                {activeFiltersCount > 0 && (
                  <Button onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScholarships.map((scholarship, index) => {
                  const status = getDeadlineStatus(scholarship.applicationDeadline);
                  const statusColor = getStatusColor(status);
                  const statusIcon = getStatusIcon(status);

                  return (
                    <motion.div
                      key={scholarship.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-yellow-500">
                        <Link href={`/scholarships/${scholarship.id}`} className="block">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                                {scholarship.name}
                              </CardTitle>
                            <Badge className={statusColor}>
                              <span className="flex items-center space-x-1">
                                {statusIcon}
                                <span className="capitalize">{status}</span>
                              </span>
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {scholarship.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Amount */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Amount</span>
                            <div className="flex items-center text-green-600 font-semibold">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {scholarship.amount.toLocaleString()}
                            </div>
                          </div>

                          {/* Provider */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Provider</span>
                            <Badge variant="outline" className="text-xs">
                              {scholarship.provider}
                            </Badge>
                          </div>

                          {/* Deadline */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Deadline</span>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(scholarship.applicationDeadline, 'MMM dd, yyyy')}
                            </div>
                          </div>

                          {/* Eligibility */}
                          <div>
                            <span className="text-sm font-medium text-gray-700 mb-2 block">Eligibility</span>
                            <div className="flex flex-wrap gap-1">
                              {scholarship.eligibility.category.slice(0, 3).map((category, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                              {scholarship.eligibility.class.slice(0, 2).map((cls, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  Class {cls}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                        </Link>

                        {/* Actions */}
                        <div className="px-6 pb-6">
                          <div className="pt-2 border-t space-y-2">
                            <div className="flex gap-2">
                              <Button asChild className="flex-1">
                                <a 
                                  href={scholarship.applicationLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center"
                                >
                                  Apply Now
                                  <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                              </Button>
                              {user && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => toggleBookmark(scholarship, e)}
                                  className="px-3"
                                >
                                  <Heart 
                                    className={`h-4 w-4 ${
                                      bookmarkedItems.has(scholarship.id) 
                                        ? 'fill-red-500 text-red-500' 
                                        : 'text-gray-500'
                                    }`}
                                  />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>


        </div>
      </div>
    </ProtectedRoute>
  );
}