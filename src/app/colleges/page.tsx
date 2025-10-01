'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import CollegeCard from '@/components/CollegeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  GraduationCap,
  Users,
  IndianRupee,
  Star,
  Loader2,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { College } from '@/types';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const courseTypes = [
  'Engineering', 'Medical', 'Commerce', 'Arts', 'Science', 'Management', 'Law', 'Agriculture'
];

export default function CollegesPage() {
  const { user } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedColleges, setBookmarkedColleges] = useState<Set<string>>(new Set());

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('itemType', '==', 'college')
      );
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      const bookmarkedItemIds = new Set(bookmarksSnapshot.docs.map(doc => doc.data().itemId));
      setBookmarkedColleges(bookmarkedItemIds);
    } catch (error) {
      console.error('Error fetching college bookmarks:', error);
    }
  };

  const toggleCollegeBookmark = async (college: College, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;

    const isBookmarked = bookmarkedColleges.has(college.id);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const bookmarksQuery = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('itemId', '==', college.id),
          where('itemType', '==', 'college')
        );
        const bookmarksSnapshot = await getDocs(bookmarksQuery);
        
        if (!bookmarksSnapshot.empty) {
          await deleteDoc(bookmarksSnapshot.docs[0].ref);
          setBookmarkedColleges(prev => {
            const newSet = new Set(prev);
            newSet.delete(college.id);
            return newSet;
          });
        }
      } else {
        // Add bookmark
        await addDoc(collection(db, 'bookmarks'), {
          userId: user.uid,
          itemId: college.id,
          itemType: 'college',
          itemData: {
            title: college.name,
            location: college.location,
            isGovernment: college.isGovernment,
            fees: college.fees
          },
          createdAt: new Date()
        });
        
        setBookmarkedColleges(prev => new Set([...prev, college.id]));
      }
    } catch (error) {
      console.error('Error toggling college bookmark:', error);
    }
  };

  useEffect(() => {
    fetchColleges();
    fetchBookmarks();
  }, [user]);

  useEffect(() => {
    filterColleges();
  }, [colleges, searchTerm, selectedState, selectedCourseType, sortBy]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'colleges'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const collegesData: College[] = [];
      querySnapshot.forEach((doc) => {
        collegesData.push({ id: doc.id, ...doc.data() } as College);
      });
      
      setColleges(collegesData);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterColleges = () => {
    let filtered = [...colleges];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(college => 
        college.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location?.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location?.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // State filter
    if (selectedState) {
      filtered = filtered.filter(college => college.location?.state === selectedState);
    }

    // Course type filter
    if (selectedCourseType) {
      filtered = filtered.filter(college => 
        college.coursesOffered?.some(course => 
          course.name?.toLowerCase().includes(selectedCourseType.toLowerCase())
        )
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'location':
          return (a.location?.state || '').localeCompare(b.location?.state || '');
        case 'fees':
          const aFees = a.fees ? Math.min(...Object.values(a.fees)) : 0;
          const bFees = b.fees ? Math.min(...Object.values(b.fees)) : 0;
          return aFees - bFees;
        default:
          return 0;
      }
    });

    setFilteredColleges(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedState('');
    setSelectedCourseType('');
    setSortBy('name');
  };

  const activeFiltersCount = [searchTerm, selectedState, selectedCourseType].filter(Boolean).length;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Colleges</h2>
              <p className="text-gray-600">Please wait while we fetch the latest college information...</p>
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
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">College Directory</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover government colleges near you with detailed information about courses, fees, and facilities
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
                <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{colleges.length}</h3>
                <p className="text-gray-600">Total Colleges</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {colleges.reduce((acc, college) => acc + (college.coursesOffered?.length || 0), 0)}
                </h3>
                <p className="text-gray-600">Courses Available</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {new Set(colleges.map(c => c.location?.state).filter(state => state)).size}
                </h3>
                <p className="text-gray-600">States Covered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {colleges.filter(c => c.isGovernment).length}
                </h3>
                <p className="text-gray-600">Government Colleges</p>
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
                    Search & Filter Colleges
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Colleges</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by college name, city, or state..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="md:w-48">
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">College Name</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="fees">Fees (Low to High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t"
                  >
                    <div>
                      <Label>State</Label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStates.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Course Type</Label>
                      <Select value={selectedCourseType} onValueChange={setSelectedCourseType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course type" />
                        </SelectTrigger>
                        <SelectContent>
                          {courseTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}

                {activeFiltersCount > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Showing {filteredColleges.length} of {colleges.length} colleges
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {filteredColleges.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No colleges found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters to find more colleges.
                </p>
                {activeFiltersCount > 0 && (
                  <Button onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredColleges.map((college, index) => (
                  <motion.div
                    key={college.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                    className="h-full"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {college.name}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              {college.location?.district}, {college.location?.state}
                            </CardDescription>
                          </div>
                          {college.isGovernment && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Government
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Courses Offered */}
                        {college.coursesOffered && college.coursesOffered.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Courses Offered</h4>
                            <div className="flex flex-wrap gap-1">
                              {college.coursesOffered.slice(0, 3).map((course, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {course.shortName || course.name}
                                </Badge>
                              ))}
                              {college.coursesOffered.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{college.coursesOffered.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Facilities */}
                        {college.facilities && college.facilities.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Facilities</h4>
                            <div className="flex flex-wrap gap-1">
                              {college.facilities.slice(0, 4).map((facility, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Medium of Instruction */}
                        {college.medium && college.medium.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Medium</h4>
                            <div className="flex gap-1">
                              {college.medium.map((med, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {med}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sample Fee */}
                        {college.fees && Object.keys(college.fees).length > 0 && (
                          <div className="flex items-center text-sm">
                            <IndianRupee className="h-4 w-4 mr-1 text-green-600" />
                            <span className="text-gray-700">Fee starts from </span>
                            <span className="font-semibold text-green-600">
                              ₹{Math.min(...Object.values(college.fees)).toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-2 border-t">
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1" asChild>
                              <Link href={`/colleges/${college.id}`}>
                                View Details
                              </Link>
                            </Button>
                            {user && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => toggleCollegeBookmark(college, e)}
                                className="px-3"
                              >
                                <Heart 
                                  className={`h-4 w-4 ${
                                    bookmarkedColleges.has(college.id) 
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
          </motion.div>

          {/* Load More */}
          {filteredColleges.length > 0 && filteredColleges.length >= 12 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-center mt-12"
            >
              <Button size="lg" variant="outline">
                Load More Colleges
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}