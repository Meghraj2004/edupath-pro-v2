'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminRoute from '@/components/AdminRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Settings,
  Building2,
  GraduationCap,
  Trophy,
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Shield,
  Database,
  BarChart3,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { College, Scholarship, Course, CareerPath, User, Resource } from '@/types';

// Admin login component
function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (credentials.username !== 'megharaj@admin.com' || credentials.password !== 'megharaj@123') {
      setError('Invalid credentials');
      return;
    }

    setLoading(true);
    try {
      // Try to sign in with Firebase Auth
      await signIn('megharaj@admin.com', 'megharaj@123');

      // Set a timeout to reset loading state if auth state doesn't change quickly
      setTimeout(() => {
        setLoading(false);
      }, 5000);

    } catch (error: any) {
      console.error('Admin login error:', error);
      setLoading(false);

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Admin account not found. Please run the setup first to create the admin user.');
        setTimeout(() => {
          router.push('/setup');
        }, 3000);
      } else if (error.code === 'auth/invalid-credential') {
        setError('Admin account not found. Please run the setup first to create the admin user.');
        setTimeout(() => {
          router.push('/setup');
        }, 3000);
      } else {
        setError(`Login failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>Access the EduPath Pro admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant={error === 'Admin access granted' ? 'default' : 'destructive'} className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter admin username"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter admin password"
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Demo Credentials:</p>
              <p>Username: <code>megharaj@admin.com</code></p>
              <p>Password: <code>megharaj@123</code></p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// College management component
function CollegeManagement() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newCollege, setNewCollege] = useState<Partial<College> & {
    coursesText?: string;
    facilitiesText?: string;
    mediumText?: string;
  }>({
    name: '',
    location: { district: '', state: '', pincode: '' },
    coursesOffered: [],
    cutoffs: {},
    medium: [],
    facilities: [],
    fees: {},
    website: '',
    contact: { phone: '', email: '' },
    isGovernment: true,
    coursesText: '',
    facilitiesText: '',
    mediumText: 'English'
  });

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'colleges'));
      const collegesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as College));
      setColleges(collegesData);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const addCollege = async () => {
    try {
      // Parse courses from text with detailed information
      const coursesOffered: Course[] = [];
      const cutoffs: { [key: string]: { general: number; obc: number; sc: number; st: number } } = {};
      const fees: { [key: string]: number } = {};

      if (newCollege.coursesText) {
        newCollege.coursesText.split('\n').filter(line => line.trim()).forEach((line, index) => {
          const parts = line.split(',').map(part => part.trim());
          const courseId = `course-${index + 1}`;

          // Course basic info
          const course: Course = {
            id: courseId,
            name: parts[0] || `Course ${index + 1}`,
            shortName: parts[0]?.substring(0, 10) || `C${index + 1}`,
            duration: parts[1] || '4 years',
            eligibility: parts[2] || '12th pass',
            stream: [],
            description: parts[3] || 'No description',
            subjects: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          coursesOffered.push(course);

          // Parse fees (4th part)
          const courseFees = parts[3] ? parseInt(parts[3]) : (newCollege.isGovernment ? 50000 : 200000);
          fees[courseId] = courseFees;

          // Parse cutoffs (5th part: General-OBC-SC-ST)
          if (parts[4]) {
            const cutoffParts = parts[4].split('-').map(c => parseInt(c.trim()));
            cutoffs[courseId] = {
              general: cutoffParts[0] || 85,
              obc: cutoffParts[1] || 82,
              sc: cutoffParts[2] || 75,
              st: cutoffParts[3] || 70
            };
          } else {
            // Default cutoffs
            cutoffs[courseId] = {
              general: 85,
              obc: 82,
              sc: 75,
              st: 70
            };
          }
        });
      }

      // Parse facilities from text
      const facilities = newCollege.facilitiesText
        ? newCollege.facilitiesText.split(',').map(f => f.trim()).filter(f => f)
        : [];

      // Parse medium from text
      const medium = newCollege.mediumText
        ? newCollege.mediumText.split(',').map(m => m.trim()).filter(m => m)
        : ['English'];

      const collegeData = {
        name: newCollege.name,
        location: newCollege.location,
        coursesOffered,
        cutoffs,
        medium,
        facilities,
        fees,
        website: newCollege.website,
        contact: newCollege.contact,
        isGovernment: newCollege.isGovernment,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'colleges'), collegeData);
      await fetchColleges();

      // Reset form
      setNewCollege({
        name: '',
        location: { district: '', state: '', pincode: '' },
        coursesOffered: [],
        cutoffs: {},
        medium: [],
        facilities: [],
        fees: {},
        website: '',
        contact: { phone: '', email: '' },
        isGovernment: true,
        coursesText: '',
        facilitiesText: '',
        mediumText: 'English'
      });
    } catch (error) {
      console.error('Error adding college:', error);
    }
  };

  const deleteCollege = async (id: string) => {
    if (confirm('Are you sure you want to delete this college?')) {
      try {
        await deleteDoc(doc(db, 'colleges', id));
        await fetchColleges();
      } catch (error) {
        console.error('Error deleting college:', error);
      }
    }
  };

  const startEditing = (college: College) => {
    setEditing(college.id);
    setNewCollege({
      ...college,
      coursesText: college.coursesOffered?.map(course =>
        `${course.name}, ${course.duration}, ${course.eligibility || 'Not specified'}, ${course.description || 'No description'}`
      ).join('\n') || '',
      facilitiesText: college.facilities?.join(', ') || '',
      mediumText: college.medium?.join(', ') || 'English'
    });
  };

  const updateCollege = async () => {
    if (!editing) return;

    try {
      // Parse the updated data similar to addCollege
      const coursesOffered: Course[] = [];
      const cutoffs: { [key: string]: { general: number; obc: number; sc: number; st: number } } = {};
      const fees: { [key: string]: number } = {};

      if (newCollege.coursesText) {
        newCollege.coursesText.split('\n').filter(line => line.trim()).forEach((line, index) => {
          const parts = line.split(',').map(part => part.trim());
          const courseId = `course-${index + 1}`;

          coursesOffered.push({
            id: courseId,
            name: parts[0] || '',
            shortName: parts[0]?.substring(0, 10) || `C${index + 1}`,
            duration: parts[1] || '',
            eligibility: parts[2] || 'Not specified',
            stream: [],
            description: parts[3] || 'No description available',
            subjects: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          // Set default cutoffs and fees
          cutoffs[courseId] = { general: 80, obc: 75, sc: 70, st: 65 };
          fees[courseId] = 50000;
        });
      }

      const collegeData = {
        name: newCollege.name || '',
        location: newCollege.location || { district: '', state: '', pincode: '' },
        coursesOffered,
        cutoffs,
        medium: newCollege.mediumText?.split(',').map(m => m.trim()).filter(m => m) || ['English'],
        facilities: newCollege.facilitiesText?.split(',').map(f => f.trim()).filter(f => f) || [],
        fees,
        website: newCollege.website || '',
        contact: newCollege.contact || { phone: '', email: '' },
        isGovernment: newCollege.isGovernment || false,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'colleges', editing), collegeData);
      await fetchColleges();
      setEditing(null);
      setNewCollege({
        name: '',
        location: { district: '', state: '', pincode: '' },
        coursesOffered: [],
        cutoffs: {},
        medium: [],
        facilities: [],
        fees: {},
        website: '',
        contact: { phone: '', email: '' },
        isGovernment: true,
        coursesText: '',
        facilitiesText: '',
        mediumText: 'English'
      });
    } catch (error) {
      console.error('Error updating college:', error);
    }
  };

  const cancelEditing = () => {
    setEditing(null);
    setNewCollege({
      name: '',
      location: { district: '', state: '', pincode: '' },
      coursesOffered: [],
      cutoffs: {},
      medium: [],
      facilities: [],
      fees: {},
      website: '',
      contact: { phone: '', email: '' },
      isGovernment: true,
      coursesText: '',
      facilitiesText: '',
      mediumText: 'English'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">College Management</h2>
        <Badge variant="secondary">{colleges.length} colleges</Badge>
      </div>

      {/* Add New College */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add New College
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>College Name</Label>
              <Input
                value={newCollege.name || ''}
                onChange={(e) => setNewCollege(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter college name"
              />
            </div>
            <div>
              <Label>District</Label>
              <Input
                value={newCollege.location?.district || ''}
                onChange={(e) => setNewCollege(prev => ({
                  ...prev,
                  location: { ...prev.location!, district: e.target.value }
                }))}
                placeholder="Enter district"
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                value={newCollege.location?.state || ''}
                onChange={(e) => setNewCollege(prev => ({
                  ...prev,
                  location: { ...prev.location!, state: e.target.value }
                }))}
                placeholder="Enter state"
              />
            </div>
            <div>
              <Label>Pincode</Label>
              <Input
                value={newCollege.location?.pincode || ''}
                onChange={(e) => setNewCollege(prev => ({
                  ...prev,
                  location: { ...prev.location!, pincode: e.target.value }
                }))}
                placeholder="Enter pincode"
              />
            </div>
            <div>
              <Label>Website</Label>
              <Input
                value={newCollege.website || ''}
                onChange={(e) => setNewCollege(prev => ({ ...prev, website: e.target.value }))}
                placeholder="Enter website URL"
              />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input
                value={newCollege.contact?.phone || ''}
                onChange={(e) => setNewCollege(prev => ({
                  ...prev,
                  contact: { ...prev.contact, phone: e.target.value, email: prev.contact?.email || '' }
                }))}
                placeholder="Enter contact phone"
              />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input
                value={newCollege.contact?.email || ''}
                onChange={(e) => setNewCollege(prev => ({
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value, phone: prev.contact?.phone || '' }
                }))}
                placeholder="Enter contact email"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isGovernment"
                checked={newCollege.isGovernment}
                onChange={(e) => setNewCollege(prev => ({ ...prev, isGovernment: e.target.checked }))}
              />
              <Label htmlFor="isGovernment">Government College</Label>
            </div>
          </div>

          {/* Courses Section */}
          <div className="space-y-2">
            <Label>Courses Offered (one per line)</Label>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Enter courses like:&#10;Computer Science Engineering, 4 years, B.Tech, 200000, 100-90-120-110&#10;Electrical Engineering, 4 years, B.Tech, 200000, 150-130-160-120"
              value={newCollege.coursesText || ''}
              onChange={(e) => setNewCollege(prev => ({ ...prev, coursesText: e.target.value }))}
            />
            <p className="text-sm text-gray-500">Format: Course Name, Duration, Degree, Annual Fees, Cutoffs(General-OBC-SC-ST)</p>
          </div>

          {/* Facilities Section */}
          <div className="space-y-2">
            <Label>Facilities (comma separated)</Label>
            <Input
              value={newCollege.facilitiesText || ''}
              onChange={(e) => setNewCollege(prev => ({ ...prev, facilitiesText: e.target.value }))}
              placeholder="Library, Hostel, Labs, Sports Complex, Cafeteria"
            />
          </div>

          {/* Medium Section */}
          <div className="space-y-2">
            <Label>Medium of Instruction (comma separated)</Label>
            <Input
              value={newCollege.mediumText || ''}
              onChange={(e) => setNewCollege(prev => ({ ...prev, mediumText: e.target.value }))}
              placeholder="English, Hindi"
            />
          </div>

          <Button
            onClick={addCollege}
            disabled={!newCollege.name || !newCollege.location?.district || !newCollege.coursesText?.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add College
          </Button>
        </CardContent>
      </Card>

      {/* Colleges List */}
      <div className="grid grid-cols-1 gap-4">
        {colleges.map(college => (
          <Card key={college.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{college.name}</h3>
                  <p className="text-gray-600">
                    {college.location?.district && college.location?.state
                      ? `${college.location.district}, ${college.location.state}`
                      : 'Location not specified'
                    }
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    {college.isGovernment && (
                      <Badge variant="secondary">Government</Badge>
                    )}
                    <Badge variant="outline">{college.coursesOffered?.length || 0} courses</Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => startEditing(college)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit College</DialogTitle>
                        <DialogDescription>
                          Update the college information below.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-name">College Name</Label>
                            <Input
                              id="edit-name"
                              value={newCollege.name || ''}
                              onChange={(e) => setNewCollege(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter college name"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-website">Website</Label>
                            <Input
                              id="edit-website"
                              value={newCollege.website || ''}
                              onChange={(e) => setNewCollege(prev => ({ ...prev, website: e.target.value }))}
                              placeholder="https://college-website.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edit-district">District</Label>
                            <Input
                              id="edit-district"
                              value={newCollege.location?.district || ''}
                              onChange={(e) => setNewCollege(prev => ({
                                ...prev,
                                location: {
                                  district: e.target.value,
                                  state: prev.location?.state || '',
                                  pincode: prev.location?.pincode || '',
                                  coordinates: prev.location?.coordinates
                                }
                              }))}
                              placeholder="Enter district"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-state">State</Label>
                            <Input
                              id="edit-state"
                              value={newCollege.location?.state || ''}
                              onChange={(e) => setNewCollege(prev => ({
                                ...prev,
                                location: {
                                  district: prev.location?.district || '',
                                  state: e.target.value,
                                  pincode: prev.location?.pincode || '',
                                  coordinates: prev.location?.coordinates
                                }
                              }))}
                              placeholder="Enter state"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-pincode">Pincode</Label>
                            <Input
                              id="edit-pincode"
                              value={newCollege.location?.pincode || ''}
                              onChange={(e) => setNewCollege(prev => ({
                                ...prev,
                                location: {
                                  district: prev.location?.district || '',
                                  state: prev.location?.state || '',
                                  pincode: e.target.value,
                                  coordinates: prev.location?.coordinates
                                }
                              }))}
                              placeholder="Enter pincode"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input
                              id="edit-phone"
                              value={newCollege.contact?.phone || ''}
                              onChange={(e) => setNewCollege(prev => ({
                                ...prev,
                                contact: {
                                  phone: e.target.value,
                                  email: prev.contact?.email || ''
                                }
                              }))}
                              placeholder="Enter phone number"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                              id="edit-email"
                              value={newCollege.contact?.email || ''}
                              onChange={(e) => setNewCollege(prev => ({
                                ...prev,
                                contact: {
                                  phone: prev.contact?.phone || '',
                                  email: e.target.value
                                }
                              }))}
                              placeholder="Enter email"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-courses">Courses Offered (one per line: Name, Duration, Eligibility, Description)</Label>
                          <Textarea
                            id="edit-courses"
                            value={newCollege.coursesText || ''}
                            onChange={(e) => setNewCollege(prev => ({ ...prev, coursesText: e.target.value }))}
                            placeholder="B.Tech Computer Science, 4 years, JEE Main, Bachelor's degree in Computer Science"
                            rows={6}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-facilities">Facilities (comma-separated)</Label>
                            <Textarea
                              id="edit-facilities"
                              value={newCollege.facilitiesText || ''}
                              onChange={(e) => setNewCollege(prev => ({ ...prev, facilitiesText: e.target.value }))}
                              placeholder="Library, Hostel, Sports Complex, Labs"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-medium">Medium of Instruction (comma-separated)</Label>
                            <Input
                              id="edit-medium"
                              value={newCollege.mediumText || ''}
                              onChange={(e) => setNewCollege(prev => ({ ...prev, mediumText: e.target.value }))}
                              placeholder="English, Hindi"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>College Type</Label>
                          <Select
                            value={newCollege.isGovernment ? 'government' : 'private'}
                            onValueChange={(value) => setNewCollege(prev => ({ ...prev, isGovernment: value === 'government' }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="government">Government</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="edit-cutoffs">Cutoffs (Simple format: Category-Rank-Percentile, one per line)</Label>
                          <Textarea
                            id="edit-cutoffs"
                            value={newCollege.cutoffs ?
                              (typeof newCollege.cutoffs === 'object' ?
                                Object.entries(newCollege.cutoffs).map(([category, data]: [string, any]) =>
                                  `${category}-${data.rank || 0}-${data.percentile || 0}`
                                ).join('\n') :
                                ''
                              ) : ''
                            }
                            onChange={(e) => {
                              const lines = e.target.value.split('\n').filter(line => line.trim());
                              const cutoffsObj: any = {};
                              lines.forEach(line => {
                                const parts = line.split('-');
                                if (parts.length >= 3) {
                                  const category = parts[0].trim();
                                  const rank = parseInt(parts[1]) || 0;
                                  const percentile = parseFloat(parts[2]) || 0;
                                  cutoffsObj[category] = { rank, percentile };
                                }
                              });
                              setNewCollege(prev => ({ ...prev, cutoffs: Object.keys(cutoffsObj).length > 0 ? cutoffsObj : '' }));
                            }}
                            placeholder="general-1000-95&#10;obc-1500-90&#10;sc-2000-85&#10;st-2500-80"
                            rows={4}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter cutoffs as: Category-Rank-Percentile (e.g., general-1000-95), one per line
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-latitude">Latitude (Optional)</Label>
                            <Input
                              id="edit-latitude"
                              type="number"
                              step="any"
                              value={newCollege.location?.coordinates?.lat || ''}
                              onChange={(e) => setNewCollege(prev => ({
                                ...prev,
                                location: {
                                  district: prev.location?.district || '',
                                  state: prev.location?.state || '',
                                  pincode: prev.location?.pincode || '',
                                  coordinates: {
                                    lat: parseFloat(e.target.value) || 0,
                                    lng: prev.location?.coordinates?.lng || 0
                                  }
                                }
                              }))}
                              placeholder="Enter latitude"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-longitude">Longitude (Optional)</Label>
                            <Input
                              id="edit-longitude"
                              type="number"
                              step="any"
                              value={newCollege.location?.coordinates?.lng || ''}
                              onChange={(e) => setNewCollege(prev => ({
                                ...prev,
                                location: {
                                  district: prev.location?.district || '',
                                  state: prev.location?.state || '',
                                  pincode: prev.location?.pincode || '',
                                  coordinates: {
                                    lat: prev.location?.coordinates?.lat || 0,
                                    lng: parseFloat(e.target.value) || 0
                                  }
                                }
                              }))}
                              placeholder="Enter longitude"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" onClick={cancelEditing}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={updateCollege}>
                            <Save className="h-4 w-4 mr-2" />
                            Update College
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="destructive" size="sm" onClick={() => deleteCollege(college.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Scholarship management component
function ScholarshipManagement() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newScholarship, setNewScholarship] = useState<Partial<Scholarship>>({
    name: '',
    description: '',
    eligibility: { class: [], income: 0, category: [] },
    amount: 0,
    applicationDeadline: new Date(),
    applicationLink: '',
    documents: [],
    provider: '',
    isActive: true
  });

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'scholarships'));
      const scholarshipsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scholarship));
      setScholarships(scholarshipsData);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    }
  };

  const addScholarship = async () => {
    try {
      await addDoc(collection(db, 'scholarships'), {
        ...newScholarship,
        createdAt: new Date()
      });
      await fetchScholarships();
      setNewScholarship({
        name: '',
        description: '',
        eligibility: { class: [], income: 0, category: [] },
        amount: 0,
        applicationDeadline: new Date(),
        applicationLink: '',
        documents: [],
        provider: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error adding scholarship:', error);
    }
  };

  const deleteScholarship = async (id: string) => {
    if (confirm('Are you sure you want to delete this scholarship?')) {
      try {
        await deleteDoc(doc(db, 'scholarships', id));
        await fetchScholarships();
      } catch (error) {
        console.error('Error deleting scholarship:', error);
      }
    }
  };

  const startEditingScholarship = (scholarship: Scholarship) => {
    setEditing(scholarship.id);

    // Handle applicationDeadline safely
    let applicationDeadline: Date | undefined = undefined;
    if (scholarship.applicationDeadline) {
      try {
        const date = scholarship.applicationDeadline instanceof Date
          ? scholarship.applicationDeadline
          : new Date(scholarship.applicationDeadline);
        applicationDeadline = isNaN(date.getTime()) ? undefined : date;
      } catch {
        applicationDeadline = undefined;
      }
    }

    setNewScholarship({
      ...scholarship,
      applicationDeadline
    });
  };

  const updateScholarship = async () => {
    if (!editing) return;

    try {
      const scholarshipData = {
        ...newScholarship,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'scholarships', editing), scholarshipData);
      await fetchScholarships();
      setEditing(null);
      setNewScholarship({
        name: '',
        description: '',
        eligibility: { class: [], income: 0, category: [] },
        amount: 0,
        applicationDeadline: new Date(),
        applicationLink: '',
        documents: [],
        provider: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error updating scholarship:', error);
    }
  };

  const cancelEditingScholarship = () => {
    setEditing(null);
    setNewScholarship({
      name: '',
      description: '',
      eligibility: { class: [], income: 0, category: [] },
      amount: 0,
      applicationDeadline: new Date(),
      applicationLink: '',
      documents: [],
      provider: '',
      isActive: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scholarship Management</h2>
        <Badge variant="secondary">{scholarships.length} scholarships</Badge>
      </div>

      {/* Add New Scholarship */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add New Scholarship
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Scholarship Name</Label>
              <Input
                value={newScholarship.name}
                onChange={(e) => setNewScholarship(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter scholarship name"
              />
            </div>
            <div>
              <Label>Provider</Label>
              <Input
                value={newScholarship.provider}
                onChange={(e) => setNewScholarship(prev => ({ ...prev, provider: e.target.value }))}
                placeholder="Enter provider name"
              />
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={newScholarship.amount}
                onChange={(e) => setNewScholarship(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Application Deadline</Label>
              <Input
                type="date"
                value={
                  newScholarship.applicationDeadline
                    ? (() => {
                      try {
                        const date = new Date(newScholarship.applicationDeadline);
                        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
                      } catch {
                        return '';
                      }
                    })()
                    : ''
                }
                onChange={(e) => {
                  const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                  setNewScholarship(prev => ({ ...prev, applicationDeadline: dateValue }));
                }}
              />
            </div>
            <div>
              <Label>Application Link</Label>
              <Input
                value={newScholarship.applicationLink}
                onChange={(e) => setNewScholarship(prev => ({ ...prev, applicationLink: e.target.value }))}
                placeholder="Enter application URL"
              />
            </div>
            <div>
              <Label>Maximum Income Limit (₹)</Label>
              <Input
                type="number"
                value={newScholarship.eligibility?.income || ''}
                onChange={(e) => setNewScholarship(prev => ({
                  ...prev,
                  eligibility: {
                    ...prev.eligibility,
                    income: parseInt(e.target.value) || 0,
                    class: prev.eligibility?.class || [],
                    category: prev.eligibility?.category || [],
                    gender: prev.eligibility?.gender || []
                  }
                }))}
                placeholder="Enter maximum income limit"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Eligible Classes</Label>
              <Input
                value={newScholarship.eligibility?.class?.join(', ') || ''}
                onChange={(e) => setNewScholarship(prev => ({
                  ...prev,
                  eligibility: {
                    ...prev.eligibility,
                    class: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                    income: prev.eligibility?.income || 0,
                    category: prev.eligibility?.category || [],
                    gender: prev.eligibility?.gender || []
                  }
                }))}
                placeholder="e.g., 10, 12, Graduation, Post-Graduation"
              />
            </div>
            <div>
              <Label>Eligible Categories</Label>
              <Input
                value={newScholarship.eligibility?.category?.join(', ') || ''}
                onChange={(e) => setNewScholarship(prev => ({
                  ...prev,
                  eligibility: {
                    ...prev.eligibility,
                    category: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                    income: prev.eligibility?.income || 0,
                    class: prev.eligibility?.class || [],
                    gender: prev.eligibility?.gender || []
                  }
                }))}
                placeholder="e.g., General, SC, ST, OBC, EWS"
              />
            </div>
          </div>

          <div>
            <Label>Required Documents</Label>
            <Input
              value={newScholarship.documents?.join(', ') || ''}
              onChange={(e) => setNewScholarship(prev => ({
                ...prev,
                documents: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              }))}
              placeholder="e.g., Aadhaar Card, Income Certificate, Academic Records"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={newScholarship.description}
              onChange={(e) => setNewScholarship(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter scholarship description"
              rows={4}
            />
          </div>
          <Button onClick={addScholarship} disabled={!newScholarship.name || !newScholarship.description}>
            <Plus className="h-4 w-4 mr-2" />
            Add Scholarship
          </Button>
        </CardContent>
      </Card>

      {/* Scholarships List */}
      <div className="grid grid-cols-1 gap-4">
        {scholarships.map(scholarship => (
          <Card key={scholarship.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{scholarship.name || 'Unnamed Scholarship'}</h3>
                  <p className="text-gray-600">{scholarship.provider || 'Unknown Provider'}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge variant="secondary">₹{(scholarship.amount || 0).toLocaleString()}</Badge>
                    <Badge variant={scholarship.isActive ? 'default' : 'outline'}>
                      {scholarship.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => startEditingScholarship(scholarship)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Scholarship</DialogTitle>
                        <DialogDescription>
                          Update the scholarship information below.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-scholarship-name">Scholarship Name</Label>
                            <Input
                              id="edit-scholarship-name"
                              value={newScholarship.name || ''}
                              onChange={(e) => setNewScholarship(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter scholarship name"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-provider">Provider</Label>
                            <Input
                              id="edit-provider"
                              value={newScholarship.provider || ''}
                              onChange={(e) => setNewScholarship(prev => ({ ...prev, provider: e.target.value }))}
                              placeholder="Enter provider name"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={newScholarship.description || ''}
                            onChange={(e) => setNewScholarship(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter scholarship description"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-amount">Amount (₹)</Label>
                            <Input
                              id="edit-amount"
                              type="number"
                              value={newScholarship.amount || 0}
                              onChange={(e) => setNewScholarship(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                              placeholder="Enter amount"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-deadline">Application Deadline</Label>
                            <Input
                              id="edit-deadline"
                              type="date"
                              value={
                                newScholarship.applicationDeadline
                                  ? (() => {
                                    try {
                                      const date = newScholarship.applicationDeadline instanceof Date
                                        ? newScholarship.applicationDeadline
                                        : new Date(newScholarship.applicationDeadline);
                                      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
                                    } catch {
                                      return '';
                                    }
                                  })()
                                  : ''
                              }
                              onChange={(e) => {
                                const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                                setNewScholarship(prev => ({ ...prev, applicationDeadline: dateValue }));
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-application-link">Application Link</Label>
                          <Input
                            id="edit-application-link"
                            value={newScholarship.applicationLink || ''}
                            onChange={(e) => setNewScholarship(prev => ({ ...prev, applicationLink: e.target.value }))}
                            placeholder="https://application-link.com"
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-documents">Required Documents (comma-separated)</Label>
                          <Textarea
                            id="edit-documents"
                            value={(newScholarship.documents && Array.isArray(newScholarship.documents)) ? newScholarship.documents.join(', ') : ''}
                            onChange={(e) => setNewScholarship(prev => ({
                              ...prev,
                              documents: e.target.value.split(',').map(d => d.trim()).filter(d => d)
                            }))}
                            placeholder="10th Marksheet, 12th Marksheet, Income Certificate"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-4 border rounded-lg p-4">
                          <h3 className="font-medium text-sm">Eligibility Criteria</h3>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-eligible-classes">Eligible Classes (comma-separated)</Label>
                              <Input
                                id="edit-eligible-classes"
                                value={(newScholarship.eligibility?.class && Array.isArray(newScholarship.eligibility.class)) ? newScholarship.eligibility.class.join(', ') : ''}
                                onChange={(e) => setNewScholarship(prev => ({
                                  ...prev,
                                  eligibility: {
                                    class: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                                    income: prev.eligibility?.income || 0,
                                    category: prev.eligibility?.category || [],
                                    gender: prev.eligibility?.gender
                                  }
                                }))}
                                placeholder="10th, 12th, Graduation"
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-income-limit">Family Income Limit (₹)</Label>
                              <Input
                                id="edit-income-limit"
                                type="number"
                                value={newScholarship.eligibility?.income || 0}
                                onChange={(e) => setNewScholarship(prev => ({
                                  ...prev,
                                  eligibility: {
                                    class: prev.eligibility?.class || [],
                                    income: parseInt(e.target.value) || 0,
                                    category: prev.eligibility?.category || [],
                                    gender: prev.eligibility?.gender
                                  }
                                }))}
                                placeholder="200000"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-categories">Eligible Categories (comma-separated)</Label>
                              <Input
                                id="edit-categories"
                                value={(newScholarship.eligibility?.category && Array.isArray(newScholarship.eligibility.category)) ? newScholarship.eligibility.category.join(', ') : ''}
                                onChange={(e) => setNewScholarship(prev => ({
                                  ...prev,
                                  eligibility: {
                                    class: prev.eligibility?.class || [],
                                    income: prev.eligibility?.income || 0,
                                    category: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                                    gender: prev.eligibility?.gender
                                  }
                                }))}
                                placeholder="General, OBC, SC, ST"
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-gender">Gender Restriction (comma-separated, optional)</Label>
                              <Input
                                id="edit-gender"
                                value={(newScholarship.eligibility?.gender && Array.isArray(newScholarship.eligibility.gender)) ? newScholarship.eligibility.gender.join(', ') : ''}
                                onChange={(e) => setNewScholarship(prev => ({
                                  ...prev,
                                  eligibility: {
                                    class: prev.eligibility?.class || [],
                                    income: prev.eligibility?.income || 0,
                                    category: prev.eligibility?.category || [],
                                    gender: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(s => s) : undefined
                                  }
                                }))}
                                placeholder="Male, Female (leave empty for all)"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Status</Label>
                          <Select
                            value={newScholarship.isActive ? 'active' : 'inactive'}
                            onValueChange={(value) => setNewScholarship(prev => ({ ...prev, isActive: value === 'active' }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" onClick={cancelEditingScholarship}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={updateScholarship}>
                            <Save className="h-4 w-4 mr-2" />
                            Update Scholarship
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="destructive" size="sm" onClick={() => deleteScholarship(scholarship.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Course management component with form helper type
type CourseFormData = Omit<Partial<Course>, 'subjects' | 'skills' | 'careerProspects' | 'prerequisites'> & {
  subjects?: string[] | string;
  skills?: string[] | string;
  careerProspects?: string[] | string;
  prerequisites?: string[] | string;
};

function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState<CourseFormData>({
    name: '',
    shortName: '',
    duration: '',
    eligibility: '',
    stream: [],
    description: '',
    careerPaths: [],
    subjects: [],
    skills: [],
    careerProspects: [],
    prerequisites: [],
    syllabus: [],
    fees: 0,
    rating: 0,
    studentsEnrolled: 0,
    provider: '',
    level: '',
    category: '',
    mode: '',
    courseLink: '',
    certification: false,
    isActive: true
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const addCourse = async () => {
    try {
      // Parse subjects and skills from strings if they're not arrays
      const subjects = typeof newCourse.subjects === 'string'
        ? newCourse.subjects.split(',').map(s => s.trim()).filter(s => s)
        : newCourse.subjects || [];

      const skills = typeof newCourse.skills === 'string'
        ? newCourse.skills.split(',').map(s => s.trim()).filter(s => s)
        : newCourse.skills || [];

      const careerProspects = typeof newCourse.careerProspects === 'string'
        ? newCourse.careerProspects.split(',').map(s => s.trim()).filter(s => s)
        : newCourse.careerProspects || [];

      const prerequisites = typeof newCourse.prerequisites === 'string'
        ? newCourse.prerequisites.split(',').map(s => s.trim()).filter(s => s)
        : newCourse.prerequisites || [];

      const stream = Array.isArray(newCourse.stream) ? newCourse.stream : [];

      // Parse syllabus if it's a string (JSON)
      let syllabus = newCourse.syllabus;
      if (typeof syllabus === 'string') {
        try {
          syllabus = JSON.parse(syllabus);
        } catch {
          syllabus = [];
        }
      }

      await addDoc(collection(db, 'courses'), {
        ...newCourse,
        subjects,
        skills,
        careerProspects,
        prerequisites,
        syllabus,
        stream,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await fetchCourses();
      setNewCourse({
        name: '',
        shortName: '',
        duration: '',
        eligibility: '',
        stream: [],
        description: '',
        careerPaths: [],
        subjects: [],
        skills: [],
        careerProspects: [],
        prerequisites: [],
        syllabus: [],
        fees: 0,
        rating: 0,
        studentsEnrolled: 0,
        provider: '',
        level: '',
        category: '',
        mode: '',
        courseLink: '',
        certification: false,
        isActive: true
      });
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const deleteCourse = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteDoc(doc(db, 'courses', id));
        await fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const startEditingCourse = (course: Course) => {
    setEditing(course.id);
    setNewCourse({
      ...course
    });
  };

  const updateCourse = async () => {
    if (!editing) return;

    try {
      const courseData = {
        ...newCourse,
        updateAt: new Date()
      };

      await updateDoc(doc(db, 'courses', editing), courseData);
      await fetchCourses();
      setEditing(null);
      setNewCourse({
        name: '',
        shortName: '',
        duration: '',
        eligibility: '',
        stream: [],
        description: '',
        careerPaths: [],
        subjects: [],
        skills: [],
        careerProspects: [],
        prerequisites: [],
        syllabus: [],
        fees: 0,
        rating: 0,
        studentsEnrolled: 0,
        provider: '',
        level: 'Beginner',
        category: 'Technology',
        courseLink: ''
      });
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const cancelEditingCourse = () => {
    setEditing(null);
    setNewCourse({
      name: '',
      shortName: '',
      duration: '',
      eligibility: '',
      stream: [],
      description: '',
      careerPaths: [],
      subjects: [],
      skills: [],
      careerProspects: [],
      prerequisites: [],
      syllabus: [],
      fees: 0,
      rating: 0,
      studentsEnrolled: 0,
      provider: '',
      level: 'Beginner',
      category: 'Technology',
      courseLink: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Management</h2>
        <Badge variant="secondary">{courses.length} courses</Badge>
      </div>

      {/* Add New Course */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add New Course
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Course Name</Label>
              <Input
                value={newCourse.name}
                onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter course name"
              />
            </div>
            <div>
              <Label>Short Name</Label>
              <Input
                value={newCourse.shortName}
                onChange={(e) => setNewCourse(prev => ({ ...prev, shortName: e.target.value }))}
                placeholder="e.g., B.Tech, MBA, etc."
              />
            </div>
            <div>
              <Label>Duration</Label>
              <Input
                value={newCourse.duration}
                onChange={(e) => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 4 years, 2 years"
              />
            </div>
            <div>
              <Label>Eligibility</Label>
              <Input
                value={newCourse.eligibility}
                onChange={(e) => setNewCourse(prev => ({ ...prev, eligibility: e.target.value }))}
                placeholder="e.g., 12th with PCM"
              />
            </div>
            <div>
              <Label>Provider/University</Label>
              <Input
                value={newCourse.provider}
                onChange={(e) => setNewCourse(prev => ({ ...prev, provider: e.target.value }))}
                placeholder="Enter provider name"
              />
            </div>
            <div>
              <Label>Fees (Annual)</Label>
              <Input
                type="number"
                value={newCourse.fees}
                onChange={(e) => setNewCourse(prev => ({ ...prev, fees: parseInt(e.target.value) || 0 }))}
                placeholder="Enter annual fees"
              />
            </div>
            <div>
              <Label>Rating (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={newCourse.rating}
                onChange={(e) => setNewCourse(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                placeholder="Course rating"
              />
            </div>
            <div>
              <Label>Students Enrolled</Label>
              <Input
                type="number"
                value={newCourse.studentsEnrolled}
                onChange={(e) => setNewCourse(prev => ({ ...prev, studentsEnrolled: parseInt(e.target.value) || 0 }))}
                placeholder="Number of students enrolled"
              />
            </div>
            <div>
              <Label>Level</Label>
              <Select value={newCourse.level} onValueChange={(value) => setNewCourse(prev => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={newCourse.category} onValueChange={(value) => setNewCourse(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mode</Label>
              <Select value={newCourse.mode} onValueChange={(value) => setNewCourse(prev => ({ ...prev, mode: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course Link (External URL)</Label>
              <Input
                type="url"
                value={newCourse.courseLink}
                onChange={(e) => setNewCourse(prev => ({ ...prev, courseLink: e.target.value }))}
                placeholder="https://example.com/course-page"
              />
              <p className="text-xs text-gray-500 mt-1">
                External course provider's enrollment page
              </p>
            </div>
          </div>

          <div>
            <Label>Course Description</Label>
            <Textarea
              value={newCourse.description}
              onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter course description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Subjects (comma separated)</Label>
              <Textarea
                value={Array.isArray(newCourse.subjects) ? newCourse.subjects.join(', ') : (newCourse.subjects || '')}
                onChange={(e) => setNewCourse(prev => ({ ...prev, subjects: e.target.value }))}
                placeholder="Mathematics, Physics, Chemistry"
                rows={2}
              />
            </div>
            <div>
              <Label>Skills Gained (comma separated)</Label>
              <Textarea
                value={Array.isArray(newCourse.skills) ? newCourse.skills.join(', ') : (newCourse.skills || '')}
                onChange={(e) => setNewCourse(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="Programming, Problem Solving, Analysis"
                rows={2}
              />
            </div>
          </div>

          <div>
            <Label>Career Prospects (comma separated)</Label>
            <Textarea
              value={Array.isArray(newCourse.careerProspects) ? newCourse.careerProspects.join(', ') : (newCourse.careerProspects || '')}
              onChange={(e) => setNewCourse(prev => ({ ...prev, careerProspects: e.target.value }))}
              placeholder="Software Engineer, Data Scientist, Product Manager"
              rows={2}
            />
          </div>

          <div>
            <Label>Prerequisites (comma separated)</Label>
            <Textarea
              value={Array.isArray(newCourse.prerequisites) ? newCourse.prerequisites.join(', ') : (newCourse.prerequisites || '')}
              onChange={(e) => setNewCourse(prev => ({ ...prev, prerequisites: e.target.value }))}
              placeholder="Basic computer knowledge, 12th grade mathematics"
              rows={2}
            />
          </div>

          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-medium text-sm">Syllabus Modules</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Module Names (comma-separated)</Label>
                <Textarea
                  value={Array.isArray(newCourse.syllabus) ? newCourse.syllabus.map(module => module.module).join(', ') : ''}
                  onChange={(e) => {
                    const moduleNames = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                    const existingModules = Array.isArray(newCourse.syllabus) ? newCourse.syllabus : [];
                    const updatedModules = moduleNames.map((moduleName, index) => ({
                      module: moduleName,
                      topics: existingModules[index]?.topics || [],
                      duration: existingModules[index]?.duration || ''
                    }));
                    setNewCourse(prev => ({ ...prev, syllabus: updatedModules }));
                  }}
                  placeholder="Introduction, Fundamentals, Advanced Topics, Project Work"
                  rows={2}
                />
              </div>

              <div>
                <Label>Module Topics (semicolon-separated for each module)</Label>
                <Textarea
                  value={Array.isArray(newCourse.syllabus) ? newCourse.syllabus.map(module => module.topics?.join(', ') || '').join('; ') : ''}
                  onChange={(e) => {
                    const topicsByModule = e.target.value.split(';').map(s => s.trim());
                    const updatedModules = Array.isArray(newCourse.syllabus) ? newCourse.syllabus.map((module, index) => ({
                      ...module,
                      topics: topicsByModule[index] ? topicsByModule[index].split(',').map(t => t.trim()).filter(t => t) : module.topics
                    })) : [];
                    setNewCourse(prev => ({ ...prev, syllabus: updatedModules }));
                  }}
                  placeholder="Basics, Overview; Core Concepts, Theory; Advanced Methods, Techniques; Final Project, Presentation"
                  rows={3}
                />
              </div>

              <div>
                <Label>Module Durations (comma-separated, matching order above)</Label>
                <Input
                  value={Array.isArray(newCourse.syllabus) ? newCourse.syllabus.map(module => module.duration || '').join(', ') : ''}
                  onChange={(e) => {
                    const durations = e.target.value.split(',').map(s => s.trim());
                    const updatedModules = Array.isArray(newCourse.syllabus) ? newCourse.syllabus.map((module, index) => ({
                      ...module,
                      duration: durations[index] || module.duration
                    })) : [];
                    setNewCourse(prev => ({ ...prev, syllabus: updatedModules }));
                  }}
                  placeholder="2 weeks, 3 weeks, 4 weeks, 1 week"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="certification"
                checked={newCourse.certification || false}
                onChange={(e) => setNewCourse(prev => ({ ...prev, certification: e.target.checked }))}
              />
              <Label htmlFor="certification">Certification Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={newCourse.isActive || false}
                onChange={(e) => setNewCourse(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <Label htmlFor="isActive">Active Course</Label>
            </div>
          </div>

          <Button
            onClick={addCourse}
            disabled={!newCourse.name || !newCourse.description}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </CardContent>
      </Card>

      {/* Courses List */}
      <div className="grid grid-cols-1 gap-4">
        {courses.map(course => (
          <Card key={course.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{course.name}</h3>
                  <p className="text-gray-600">{course.shortName} • {course.duration}</p>
                  <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    {course.fees && (
                      <Badge variant="secondary">₹{course.fees.toLocaleString()}/year</Badge>
                    )}
                    <Badge variant={course.isActive ? 'default' : 'outline'}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {course.subjects && course.subjects.length > 0 && (
                      <Badge variant="outline">{course.subjects.length} subjects</Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => startEditingCourse(course)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Course</DialogTitle>
                        <DialogDescription>
                          Update the course information below.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-course-name">Course Name</Label>
                            <Input
                              id="edit-course-name"
                              value={newCourse.name || ''}
                              onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter course name"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-short-name">Short Name</Label>
                            <Input
                              id="edit-short-name"
                              value={newCourse.shortName || ''}
                              onChange={(e) => setNewCourse(prev => ({ ...prev, shortName: e.target.value }))}
                              placeholder="B.Tech"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edit-duration">Duration</Label>
                            <Input
                              id="edit-duration"
                              value={newCourse.duration || ''}
                              onChange={(e) => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                              placeholder="4 years"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-fees">Fees (₹/year)</Label>
                            <Input
                              id="edit-fees"
                              type="number"
                              value={newCourse.fees || 0}
                              onChange={(e) => setNewCourse(prev => ({ ...prev, fees: parseInt(e.target.value) || 0 }))}
                              placeholder="50000"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-course-link">Course Link</Label>
                            <Input
                              id="edit-course-link"
                              value={newCourse.courseLink || ''}
                              onChange={(e) => setNewCourse(prev => ({ ...prev, courseLink: e.target.value }))}
                              placeholder="https://course-link.com"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-course-description">Description</Label>
                          <Textarea
                            id="edit-course-description"
                            value={newCourse.description || ''}
                            onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter course description"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-eligibility">Eligibility</Label>
                          <Input
                            id="edit-eligibility"
                            value={newCourse.eligibility || ''}
                            onChange={(e) => setNewCourse(prev => ({ ...prev, eligibility: e.target.value }))}
                            placeholder="12th Pass with PCM"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-subjects">Subjects (comma-separated)</Label>
                            <Textarea
                              id="edit-subjects"
                              value={(newCourse.subjects && Array.isArray(newCourse.subjects)) ? newCourse.subjects.join(', ') : ''}
                              onChange={(e) => setNewCourse(prev => ({
                                ...prev,
                                subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              }))}
                              placeholder="Mathematics, Physics, Chemistry"
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-skills">Skills (comma-separated)</Label>
                            <Textarea
                              id="edit-skills"
                              value={(newCourse.skills && Array.isArray(newCourse.skills)) ? newCourse.skills.join(', ') : ''}
                              onChange={(e) => setNewCourse(prev => ({
                                ...prev,
                                skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              }))}
                              placeholder="Problem Solving, Critical Thinking"
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-prerequisites">Prerequisites (comma-separated)</Label>
                            <Textarea
                              id="edit-prerequisites"
                              value={(newCourse.prerequisites && Array.isArray(newCourse.prerequisites)) ? newCourse.prerequisites.join(', ') : ''}
                              onChange={(e) => setNewCourse(prev => ({
                                ...prev,
                                prerequisites: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              }))}
                              placeholder="Basic Math, English"
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-career-prospects">Career Prospects (comma-separated)</Label>
                            <Textarea
                              id="edit-career-prospects"
                              value={(newCourse.careerProspects && Array.isArray(newCourse.careerProspects)) ? newCourse.careerProspects.join(', ') : ''}
                              onChange={(e) => setNewCourse(prev => ({
                                ...prev,
                                careerProspects: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              }))}
                              placeholder="Software Engineer, Data Analyst"
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edit-provider">Provider</Label>
                            <Input
                              id="edit-provider"
                              value={newCourse.provider || ''}
                              onChange={(e) => setNewCourse(prev => ({ ...prev, provider: e.target.value }))}
                              placeholder="Institution/Platform name"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-level">Level</Label>
                            <Select
                              value={newCourse.level || 'Beginner'}
                              onValueChange={(value) => setNewCourse(prev => ({ ...prev, level: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="edit-category">Category</Label>
                            <Input
                              id="edit-category"
                              value={newCourse.category || ''}
                              onChange={(e) => setNewCourse(prev => ({ ...prev, category: e.target.value }))}
                              placeholder="Technology, Business, Arts"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-mode">Mode</Label>
                            <Select
                              value={newCourse.mode || 'Online'}
                              onValueChange={(value) => setNewCourse(prev => ({ ...prev, mode: value }))}
                            >

                              <SelectContent>
                                <SelectItem value="Online">Online</SelectItem>
                                <SelectItem value="Offline">Offline</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="edit-rating">Rating (0-5)</Label>
                            <Input
                              id="edit-rating"
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={newCourse.rating || 0}
                              onChange={(e) => setNewCourse(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                              placeholder="4.5"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-image">Image URL (Optional)</Label>
                          <Input
                            id="edit-image"
                            value={newCourse.image || ''}
                            onChange={(e) => setNewCourse(prev => ({ ...prev, image: e.target.value }))}
                            placeholder="https://example.com/course-image.jpg"
                          />
                        </div>

                        <div className="space-y-4 border rounded-lg p-4">
                          <h3 className="font-medium text-sm">Syllabus Modules</h3>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor="edit-module-names">Module Names (comma-separated)</Label>
                              <Textarea
                                id="edit-module-names"
                                value={Array.isArray(newCourse.syllabus) ? newCourse.syllabus.map(module => module.module).join(', ') : ''}
                                onChange={(e) => {
                                  const moduleNames = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                  const existingModules = Array.isArray(newCourse.syllabus) ? newCourse.syllabus : [];
                                  const updatedModules = moduleNames.map((moduleName, index) => ({
                                    module: moduleName,
                                    topics: existingModules[index]?.topics || [],
                                    duration: existingModules[index]?.duration || ''
                                  }));
                                  setNewCourse(prev => ({ ...prev, syllabus: updatedModules }));
                                }}
                                placeholder="Introduction, Fundamentals, Advanced Topics, Project Work"
                                rows={2}
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-module-topics">Module Topics (semicolon-separated for each module)</Label>
                              <Textarea
                                id="edit-module-topics"
                                value={Array.isArray(newCourse.syllabus) ? newCourse.syllabus.map(module => module.topics?.join(', ') || '').join('; ') : ''}
                                onChange={(e) => {
                                  const topicsByModule = e.target.value.split(';').map(s => s.trim());
                                  const updatedModules = Array.isArray(newCourse.syllabus) ? newCourse.syllabus.map((module, index) => ({
                                    ...module,
                                    topics: topicsByModule[index] ? topicsByModule[index].split(',').map(t => t.trim()).filter(t => t) : module.topics
                                  })) : [];
                                  setNewCourse(prev => ({ ...prev, syllabus: updatedModules }));
                                }}
                                placeholder="Basics, Overview; Core Concepts, Theory; Advanced Methods, Techniques; Final Project, Presentation"
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-module-durations">Module Durations (comma-separated, matching order above)</Label>
                              <Input
                                id="edit-module-durations"
                                value={Array.isArray(newCourse.syllabus) ? newCourse.syllabus.map(module => module.duration || '').join(', ') : ''}
                                onChange={(e) => {
                                  const durations = e.target.value.split(',').map(s => s.trim());
                                  const updatedModules = Array.isArray(newCourse.syllabus) ? newCourse.syllabus.map((module, index) => ({
                                    ...module,
                                    duration: durations[index] || module.duration
                                  })) : [];
                                  setNewCourse(prev => ({ ...prev, syllabus: updatedModules }));
                                }}
                                placeholder="2 weeks, 3 weeks, 4 weeks, 1 week"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="edit-certification"
                              checked={newCourse.certification || false}
                              onChange={(e) => setNewCourse(prev => ({ ...prev, certification: e.target.checked }))}
                            />
                            <Label htmlFor="edit-certification">Certification Available</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="edit-active"
                              checked={newCourse.isActive || false}
                              onChange={(e) => setNewCourse(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                            <Label htmlFor="edit-active">Active Course</Label>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" onClick={cancelEditingCourse}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={updateCourse}>
                            <Save className="h-4 w-4 mr-2" />
                            Update Course
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="destructive" size="sm" onClick={() => deleteCourse(course.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {courses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-gray-500">Add courses to help students explore their options.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Career management component
// Career management component with form helper type
type CareerFormData = Omit<Partial<CareerPath>, 'requiredSkills' | 'higherEducation' | 'governmentExams' | 'industryTrends'> & {
  requiredSkills?: string[] | string;
  higherEducation?: string[] | string;
  governmentExams?: string[] | string;
  industryTrends?: string[] | string;
};

function CareerManagement() {
  const [careers, setCareers] = useState<CareerPath[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newCareer, setNewCareer] = useState<CareerFormData>({
    title: '',
    description: '',
    courseId: '',
    jobRoles: [],
    higherEducation: [],
    governmentExams: [],
    industryTrends: [],
    workLife: '',
    workLocation: '',
    workCulture: '',
    averageSalary: { min: 0, max: 0 },
    growthProspects: '',
    requiredSkills: []
  });

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'careers'));
      const careersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CareerPath));
      setCareers(careersData);
    } catch (error) {
      console.error('Error fetching careers:', error);
    }
  };

  const addCareer = async () => {
    try {
      // Parse arrays from strings if needed
      const requiredSkills = typeof newCareer.requiredSkills === 'string'
        ? newCareer.requiredSkills.split(',').map(s => s.trim()).filter(s => s)
        : newCareer.requiredSkills || [];

      const higherEducation = typeof newCareer.higherEducation === 'string'
        ? newCareer.higherEducation.split(',').map(s => s.trim()).filter(s => s)
        : newCareer.higherEducation || [];

      const governmentExams = typeof newCareer.governmentExams === 'string'
        ? newCareer.governmentExams.split(',').map(s => s.trim()).filter(s => s)
        : newCareer.governmentExams || [];

      const industryTrends = typeof newCareer.industryTrends === 'string'
        ? newCareer.industryTrends.split(',').map(s => s.trim()).filter(s => s)
        : newCareer.industryTrends || [];

      // Parse job roles if it's a string (JSON)
      let jobRoles = newCareer.jobRoles;
      if (typeof jobRoles === 'string') {
        try {
          jobRoles = JSON.parse(jobRoles);
        } catch {
          jobRoles = [];
        }
      }

      await addDoc(collection(db, 'careers'), {
        ...newCareer,
        requiredSkills,
        higherEducation,
        governmentExams,
        industryTrends,
        jobRoles,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await fetchCareers();
      setNewCareer({
        title: '',
        description: '',
        courseId: '',
        jobRoles: [],
        higherEducation: [],
        governmentExams: [],
        industryTrends: [],
        workLife: '',
        workLocation: '',
        workCulture: '',
        averageSalary: { min: 0, max: 0 },
        growthProspects: '',
        requiredSkills: []
      });
    } catch (error) {
      console.error('Error adding career:', error);
    }
  };

  const deleteCareer = async (id: string) => {
    if (confirm('Are you sure you want to delete this career path?')) {
      try {
        await deleteDoc(doc(db, 'careers', id));
        await fetchCareers();
      } catch (error) {
        console.error('Error deleting career:', error);
      }
    }
  };

  const startEditingCareer = (career: CareerPath) => {
    setEditing(career.id);
    setNewCareer({ ...career });
  };

  const updateCareer = async () => {
    if (!editing) return;

    try {
      const careerData = {
        ...newCareer,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'careers', editing), careerData);
      await fetchCareers();
      setEditing(null);
      setNewCareer({
        title: '',
        description: '',
        courseId: '',
        jobRoles: [],
        higherEducation: [],
        governmentExams: [],
        industryTrends: [],
        workLife: '',
        workLocation: '',
        workCulture: '',
        averageSalary: { min: 0, max: 0 },
        growthProspects: '',
        requiredSkills: []
      });
    } catch (error) {
      console.error('Error updating career:', error);
    }
  };

  const cancelEditingCareer = () => {
    setEditing(null);
    setNewCareer({
      title: '',
      description: '',
      courseId: '',
      jobRoles: [],
      higherEducation: [],
      governmentExams: [],
      industryTrends: [],
      workLife: '',
      workLocation: '',
      workCulture: '',
      averageSalary: { min: 0, max: 0 },
      growthProspects: '',
      requiredSkills: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Career Path Management</h2>
        <Badge variant="secondary">{careers.length} career paths</Badge>
      </div>

      {/* Add New Career */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add New Career Path
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Career Title</Label>
              <Input
                value={newCareer.title || ''}
                onChange={(e) => setNewCareer(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter career title"
              />
            </div>
            <div>
              <Label>Related Course ID</Label>
              <Input
                value={newCareer.courseId || ''}
                onChange={(e) => setNewCareer(prev => ({ ...prev, courseId: e.target.value }))}
                placeholder="Enter related course ID"
              />
            </div>
            <div>
              <Label>Min Salary (₹/annum)</Label>
              <Input
                type="number"
                value={newCareer.averageSalary?.min || 0}
                onChange={(e) => setNewCareer(prev => ({
                  ...prev,
                  averageSalary: { ...prev.averageSalary!, min: parseInt(e.target.value) || 0 }
                }))}
                placeholder="Minimum salary"
              />
            </div>
            <div>
              <Label>Max Salary (₹/annum)</Label>
              <Input
                type="number"
                value={newCareer.averageSalary?.max || 0}
                onChange={(e) => setNewCareer(prev => ({
                  ...prev,
                  averageSalary: { ...prev.averageSalary!, max: parseInt(e.target.value) || 0 }
                }))}
                placeholder="Maximum salary"
              />
            </div>
          </div>

          <div>
            <Label>Career Description</Label>
            <Textarea
              value={newCareer.description || ''}
              onChange={(e) => setNewCareer(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter career description"
              rows={3}
            />
          </div>

          <div>
            <Label>Growth Prospects</Label>
            <Textarea
              value={newCareer.growthProspects || ''}
              onChange={(e) => setNewCareer(prev => ({ ...prev, growthProspects: e.target.value }))}
              placeholder="Describe career growth prospects"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Required Skills (comma separated)</Label>
              <Textarea
                value={Array.isArray(newCareer.requiredSkills) ? newCareer.requiredSkills.join(', ') : (newCareer.requiredSkills || '')}
                onChange={(e) => setNewCareer(prev => ({ ...prev, requiredSkills: e.target.value }))}
                placeholder="Programming, Communication, Leadership"
                rows={2}
              />
            </div>
            <div>
              <Label>Higher Education Options (comma separated)</Label>
              <Textarea
                value={Array.isArray(newCareer.higherEducation) ? newCareer.higherEducation.join(', ') : (newCareer.higherEducation || '')}
                onChange={(e) => setNewCareer(prev => ({ ...prev, higherEducation: e.target.value }))}
                placeholder="M.Tech, MBA, MS"
                rows={2}
              />
            </div>
          </div>

          <div>
            <Label>Government Exams (comma separated)</Label>
            <Textarea
              value={Array.isArray(newCareer.governmentExams) ? newCareer.governmentExams.join(', ') : (newCareer.governmentExams || '')}
              onChange={(e) => setNewCareer(prev => ({ ...prev, governmentExams: e.target.value }))}
              placeholder="UPSC, SSC, Banking Exams"
              rows={2}
            />
          </div>

          <div>
            <Label>Industry Trends (comma separated)</Label>
            <Textarea
              value={Array.isArray(newCareer.industryTrends) ? newCareer.industryTrends.join(', ') : (newCareer.industryTrends || '')}
              onChange={(e) => setNewCareer(prev => ({ ...prev, industryTrends: e.target.value }))}
              placeholder="AI/ML Integration, Cloud Computing, Remote Work"
              rows={2}
            />
          </div>

          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-medium text-sm">Job Roles</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Job Titles (comma-separated)</Label>
                <Textarea
                  value={newCareer.jobRoles?.map(role => role.title).join(', ') || ''}
                  onChange={(e) => {
                    const titles = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                    const existingRoles = newCareer.jobRoles || [];
                    const updatedRoles = titles.map((title, index) => ({
                      title,
                      description: existingRoles[index]?.description || '',
                      salaryRange: existingRoles[index]?.salaryRange || { min: 0, max: 0 },
                      companies: existingRoles[index]?.companies || [],
                      requirements: existingRoles[index]?.requirements || []
                    }));
                    setNewCareer(prev => ({ ...prev, jobRoles: updatedRoles }));
                  }}
                  placeholder="Software Engineer, Data Analyst, Product Manager"
                  rows={2}
                />
              </div>

              <div>
                <Label>Job Descriptions (one per line, matching order above)</Label>
                <Textarea
                  value={newCareer.jobRoles?.map(role => role.description).join('\n') || ''}
                  onChange={(e) => {
                    const descriptions = e.target.value.split('\n');
                    const updatedRoles = (newCareer.jobRoles || []).map((role, index) => ({
                      ...role,
                      description: descriptions[index] || role.description
                    }));
                    setNewCareer(prev => ({ ...prev, jobRoles: updatedRoles }));
                  }}
                  placeholder="Develop and maintain software applications&#10;Analyze data to derive business insights&#10;Manage product development lifecycle"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Companies (semicolon-separated for each role)</Label>
                  <Textarea
                    value={newCareer.jobRoles?.map(role => role.companies.join(', ')).join('; ') || ''}
                    onChange={(e) => {
                      const companiesByRole = e.target.value.split(';').map(s => s.trim());
                      const updatedRoles = (newCareer.jobRoles || []).map((role, index) => ({
                        ...role,
                        companies: companiesByRole[index] ? companiesByRole[index].split(',').map(c => c.trim()).filter(c => c) : role.companies
                      }));
                      setNewCareer(prev => ({ ...prev, jobRoles: updatedRoles }));
                    }}
                    placeholder="Google, Microsoft; Amazon, Netflix; Apple, Meta"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Requirements (semicolon-separated for each role)</Label>
                  <Textarea
                    value={newCareer.jobRoles?.map(role => role.requirements.join(', ')).join('; ') || ''}
                    onChange={(e) => {
                      const requirementsByRole = e.target.value.split(';').map(s => s.trim());
                      const updatedRoles = (newCareer.jobRoles || []).map((role, index) => ({
                        ...role,
                        requirements: requirementsByRole[index] ? requirementsByRole[index].split(',').map(r => r.trim()).filter(r => r) : role.requirements
                      }));
                      setNewCareer(prev => ({ ...prev, jobRoles: updatedRoles }));
                    }}
                    placeholder="Programming, Problem Solving; SQL, Statistics; Leadership, Strategy"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Work-Life Balance</Label>
              <Input
                value={newCareer.workLife || ''}
                onChange={(e) => setNewCareer(prev => ({ ...prev, workLife: e.target.value }))}
                placeholder="Good work-life balance"
              />
            </div>
            <div>
              <Label>Work Location</Label>
              <Input
                value={newCareer.workLocation || ''}
                onChange={(e) => setNewCareer(prev => ({ ...prev, workLocation: e.target.value }))}
                placeholder="Major tech hubs"
              />
            </div>
            <div>
              <Label>Work Culture</Label>
              <Input
                value={newCareer.workCulture || ''}
                onChange={(e) => setNewCareer(prev => ({ ...prev, workCulture: e.target.value }))}
                placeholder="Collaborative environment"
              />
            </div>
          </div>

          <Button
            onClick={addCareer}
            disabled={!newCareer.title || !newCareer.description}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Career Path
          </Button>
        </CardContent>
      </Card>

      {/* Careers List */}
      <div className="grid grid-cols-1 gap-4">
        {careers.map(career => (
          <Card key={career.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{career.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{career.description}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    {career.averageSalary && (
                      <Badge variant="secondary">
                        ₹{career.averageSalary.min?.toLocaleString()} - ₹{career.averageSalary.max?.toLocaleString()}
                      </Badge>
                    )}
                    {career.requiredSkills && career.requiredSkills.length > 0 && (
                      <Badge variant="outline">{career.requiredSkills.length} skills required</Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => startEditingCareer(career)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Career Path</DialogTitle>
                        <DialogDescription>
                          Update the career path information below.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-career-title">Career Title</Label>
                            <Input
                              id="edit-career-title"
                              value={newCareer.title || ''}
                              onChange={(e) => setNewCareer(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter career title"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-course-id">Course ID</Label>
                            <Input
                              id="edit-course-id"
                              value={newCareer.courseId || ''}
                              onChange={(e) => setNewCareer(prev => ({ ...prev, courseId: e.target.value }))}
                              placeholder="Related course ID"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-career-description">Description</Label>
                          <Textarea
                            id="edit-career-description"
                            value={newCareer.description || ''}
                            onChange={(e) => setNewCareer(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter career description"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edit-work-life">Work-Life Balance</Label>
                            <Input
                              id="edit-work-life"
                              value={newCareer.workLife || ''}
                              onChange={(e) => setNewCareer(prev => ({ ...prev, workLife: e.target.value }))}
                              placeholder="Good work-life balance"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-work-location">Work Location</Label>
                            <Input
                              id="edit-work-location"
                              value={newCareer.workLocation || ''}
                              onChange={(e) => setNewCareer(prev => ({ ...prev, workLocation: e.target.value }))}
                              placeholder="Office/Remote/Hybrid"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-work-culture">Work Culture</Label>
                            <Input
                              id="edit-work-culture"
                              value={newCareer.workCulture || ''}
                              onChange={(e) => setNewCareer(prev => ({ ...prev, workCulture: e.target.value }))}
                              placeholder="Collaborative, Fast-paced"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-min-salary">Min Salary (₹)</Label>
                            <Input
                              id="edit-min-salary"
                              type="number"
                              value={newCareer.averageSalary?.min || 0}
                              onChange={(e) => setNewCareer(prev => ({
                                ...prev,
                                averageSalary: {
                                  min: parseInt(e.target.value) || 0,
                                  max: prev.averageSalary?.max || 0
                                }
                              }))}
                              placeholder="300000"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-max-salary">Max Salary (₹)</Label>
                            <Input
                              id="edit-max-salary"
                              type="number"
                              value={newCareer.averageSalary?.max || 0}
                              onChange={(e) => setNewCareer(prev => ({
                                ...prev,
                                averageSalary: {
                                  min: prev.averageSalary?.min || 0,
                                  max: parseInt(e.target.value) || 0
                                }
                              }))}
                              placeholder="1000000"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-required-skills">Required Skills (comma-separated)</Label>
                          <Textarea
                            id="edit-required-skills"
                            value={(newCareer.requiredSkills && Array.isArray(newCareer.requiredSkills)) ? newCareer.requiredSkills.join(', ') : ''}
                            onChange={(e) => setNewCareer(prev => ({
                              ...prev,
                              requiredSkills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            }))}
                            placeholder="Programming, Problem Solving, Communication"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-growth-prospects">Growth Prospects</Label>
                          <Textarea
                            id="edit-growth-prospects"
                            value={newCareer.growthProspects || ''}
                            onChange={(e) => setNewCareer(prev => ({ ...prev, growthProspects: e.target.value }))}
                            placeholder="Describe career growth opportunities"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-higher-education">Higher Education Options (comma-separated)</Label>
                            <Textarea
                              id="edit-higher-education"
                              value={(newCareer.higherEducation && Array.isArray(newCareer.higherEducation)) ? newCareer.higherEducation.join(', ') : ''}
                              onChange={(e) => setNewCareer(prev => ({
                                ...prev,
                                higherEducation: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              }))}
                              placeholder="M.Tech, MBA, PhD"
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-government-exams">Government Exams (comma-separated)</Label>
                            <Textarea
                              id="edit-government-exams"
                              value={(newCareer.governmentExams && Array.isArray(newCareer.governmentExams)) ? newCareer.governmentExams.join(', ') : ''}
                              onChange={(e) => setNewCareer(prev => ({
                                ...prev,
                                governmentExams: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              }))}
                              placeholder="GATE, UPSC, SSC"
                              rows={2}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-industry-trends">Industry Trends (comma-separated)</Label>
                          <Textarea
                            id="edit-industry-trends"
                            value={(newCareer.industryTrends && Array.isArray(newCareer.industryTrends)) ? newCareer.industryTrends.join(', ') : ''}
                            onChange={(e) => setNewCareer(prev => ({
                              ...prev,
                              industryTrends: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            }))}
                            placeholder="AI/ML, Cloud Computing, Remote Work"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-4 border rounded-lg p-4">
                          <h3 className="font-medium text-sm">Job Roles</h3>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <Label htmlFor="edit-job-titles">Job Titles (comma-separated)</Label>
                              <Textarea
                                id="edit-job-titles"
                                value={newCareer.jobRoles?.map(role => role.title).join(', ') || ''}
                                onChange={(e) => {
                                  const titles = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                  const existingRoles = newCareer.jobRoles || [];
                                  const updatedRoles = titles.map((title, index) => ({
                                    title,
                                    description: existingRoles[index]?.description || '',
                                    salaryRange: existingRoles[index]?.salaryRange || { min: 0, max: 0 },
                                    companies: existingRoles[index]?.companies || [],
                                    requirements: existingRoles[index]?.requirements || []
                                  }));
                                  setNewCareer(prev => ({ ...prev, jobRoles: updatedRoles }));
                                }}
                                placeholder="Software Engineer, Data Analyst, Product Manager"
                                rows={2}
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-job-descriptions">Job Descriptions (one per line, matching order above)</Label>
                              <Textarea
                                id="edit-job-descriptions"
                                value={newCareer.jobRoles?.map(role => role.description).join('\n') || ''}
                                onChange={(e) => {
                                  const descriptions = e.target.value.split('\n');
                                  const updatedRoles = (newCareer.jobRoles || []).map((role, index) => ({
                                    ...role,
                                    description: descriptions[index] || role.description
                                  }));
                                  setNewCareer(prev => ({ ...prev, jobRoles: updatedRoles }));
                                }}
                                placeholder="Develop and maintain software applications&#10;Analyze data to derive business insights&#10;Manage product development lifecycle"
                                rows={3}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-job-companies">Companies (semicolon-separated for each role)</Label>
                                <Textarea
                                  id="edit-job-companies"
                                  value={newCareer.jobRoles?.map(role => role.companies.join(', ')).join('; ') || ''}
                                  onChange={(e) => {
                                    const companiesByRole = e.target.value.split(';').map(s => s.trim());
                                    const updatedRoles = (newCareer.jobRoles || []).map((role, index) => ({
                                      ...role,
                                      companies: companiesByRole[index] ? companiesByRole[index].split(',').map(c => c.trim()).filter(c => c) : role.companies
                                    }));
                                    setNewCareer(prev => ({ ...prev, jobRoles: updatedRoles }));
                                  }}
                                  placeholder="Google, Microsoft; Amazon, Netflix; Apple, Meta"
                                  rows={2}
                                />
                              </div>

                              <div>
                                <Label htmlFor="edit-job-requirements">Requirements (semicolon-separated for each role)</Label>
                                <Textarea
                                  id="edit-job-requirements"
                                  value={newCareer.jobRoles?.map(role => role.requirements.join(', ')).join('; ') || ''}
                                  onChange={(e) => {
                                    const requirementsByRole = e.target.value.split(';').map(s => s.trim());
                                    const updatedRoles = (newCareer.jobRoles || []).map((role, index) => ({
                                      ...role,
                                      requirements: requirementsByRole[index] ? requirementsByRole[index].split(',').map(r => r.trim()).filter(r => r) : role.requirements
                                    }));
                                    setNewCareer(prev => ({ ...prev, jobRoles: updatedRoles }));
                                  }}
                                  placeholder="Programming, Problem Solving; SQL, Statistics; Leadership, Strategy"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" onClick={cancelEditingCareer}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={updateCareer}>
                            <Save className="h-4 w-4 mr-2" />
                            Update Career
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="destructive" size="sm" onClick={() => deleteCareer(career.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {careers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Career Paths Found</h3>
              <p className="text-gray-500">Add career paths to help students understand their options.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// User management component
function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          photoURL: data.photoURL || '',
          age: data.age,
          gender: data.gender,
          academicInterests: data.academicInterests || [],
          location: data.location || '',
          class: data.class,
          quizResults: data.quizResults,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          ...data
        } as User;
      });
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditingUser = (user: User) => {
    setEditing(user.uid);
    setEditUser({ ...user });
  };

  const updateUser = async () => {
    if (!editing) return;

    try {
      const userData = {
        ...editUser,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'users', editing), userData);
      await fetchUsers();
      setEditing(null);
      setEditUser({});
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const cancelEditingUser = () => {
    setEditing(null);
    setEditUser({});
  };

  const deleteUser = async (uid: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', uid));
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Badge variant="secondary">{users.length} users</Badge>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 gap-4">
        {users.map(user => (
          <Card key={user.uid}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.displayName || 'Unnamed User'}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      {user.class && (
                        <Badge variant="outline">Class {user.class}</Badge>
                      )}
                      {user.location && (
                        <Badge variant="outline">{user.location}</Badge>
                      )}
                      {user.academicInterests && user.academicInterests.length > 0 && (
                        <Badge variant="secondary">{user.academicInterests.length} interests</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => startEditingUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                          <DialogDescription>
                            Update user information below.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-display-name">Display Name</Label>
                              <Input
                                id="edit-display-name"
                                value={editUser.displayName || ''}
                                onChange={(e) => setEditUser(prev => ({ ...prev, displayName: e.target.value }))}
                                placeholder="Enter display name"
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-email">Email</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editUser.email || ''}
                                onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="Enter email"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="edit-age">Age</Label>
                              <Input
                                id="edit-age"
                                type="number"
                                value={editUser.age || ''}
                                onChange={(e) => setEditUser(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                                placeholder="Enter age"
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-class">Class</Label>
                              <Select
                                value={editUser.class || ''}
                                onValueChange={(value) => setEditUser(prev => ({ ...prev, class: value as '10' | '12' }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10">10th</SelectItem>
                                  <SelectItem value="12">12th</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="edit-gender">Gender</Label>
                              <Select
                                value={editUser.gender || ''}
                                onValueChange={(value) => setEditUser(prev => ({ ...prev, gender: value as 'male' | 'female' | 'other' }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="edit-location">Location</Label>
                            <Input
                              id="edit-location"
                              value={editUser.location || ''}
                              onChange={(e) => setEditUser(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="Enter location"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-interests">Academic Interests (comma-separated)</Label>
                            <Textarea
                              id="edit-interests"
                              value={(editUser.academicInterests && Array.isArray(editUser.academicInterests)) ? editUser.academicInterests.join(', ') : ''}
                              onChange={(e) => setEditUser(prev => ({
                                ...prev,
                                academicInterests: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                              }))}
                              placeholder="Science, Technology, Arts"
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-photo-url">Photo URL (Optional)</Label>
                            <Input
                              id="edit-photo-url"
                              value={editUser.photoURL || ''}
                              onChange={(e) => setEditUser(prev => ({ ...prev, photoURL: e.target.value }))}
                              placeholder="https://example.com/photo.jpg"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-quiz-results">Quiz Results (JSON format - Read Only)</Label>
                            <Textarea
                              id="edit-quiz-results"
                              value={editUser.quizResults ? JSON.stringify(editUser.quizResults, null, 2) : 'No quiz results'}
                              readOnly
                              rows={3}
                              className="bg-gray-50"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Quiz results are read-only and managed by the quiz system
                            </p>
                          </div>

                          <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={cancelEditingUser}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                            <Button onClick={updateUser}>
                              <Save className="h-4 w-4 mr-2" />
                              Update User
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="destructive" size="sm" onClick={() => deleteUser(user.uid)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-500">Users will appear here once they register.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Resource management component
// Resource management component with form helper type
type ResourceFormData = Omit<Partial<Resource>, 'subjects'> & {
  subjects?: string[] | string;
};

function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newResource, setNewResource] = useState<ResourceFormData>({
    title: '',
    description: '',
    type: 'website',
    url: '',
    category: '',
    subjects: [],
    isVerified: false
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const resourcesSnapshot = await getDocs(collection(db, 'resources'));
      const resourcesData = resourcesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Resource));
      setResources(resourcesData);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const addResource = async () => {
    try {
      if (!newResource.title || !newResource.url) {
        alert('Please fill in required fields (title and URL)');
        return;
      }

      const resourceData = {
        ...newResource,
        subjects: Array.isArray(newResource.subjects) ? newResource.subjects :
          typeof newResource.subjects === 'string' ?
            newResource.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
        createdAt: new Date(),
        isVerified: newResource.isVerified || false
      };

      await addDoc(collection(db, 'resources'), resourceData);

      setNewResource({
        title: '',
        description: '',
        type: 'website',
        url: '',
        category: '',
        subjects: [],
        isVerified: false
      });

      fetchResources();
      alert('Resource added successfully!');
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Error adding resource. Please try again.');
    }
  };

  const updateResource = async (id: string) => {
    try {
      const resource = resources.find(r => r.id === id);
      if (!resource) return;

      const updatedData = {
        ...resource,
        subjects: Array.isArray(resource.subjects) ? resource.subjects : []
      };

      await updateDoc(doc(db, 'resources', id), updatedData);
      setEditing(null);
      fetchResources();
      alert('Resource updated successfully!');
    } catch (error) {
      console.error('Error updating resource:', error);
      alert('Error updating resource. Please try again.');
    }
  };

  const deleteResource = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteDoc(doc(db, 'resources', id));
        fetchResources();
        alert('Resource deleted successfully!');
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Error deleting resource. Please try again.');
      }
    }
  };

  const handleResourceChange = (id: string, field: keyof Resource, value: any) => {
    setResources(prev => prev.map(resource =>
      resource.id === id ? { ...resource, [field]: value } : resource
    ));
  };

  const resourceTypes = ['ebook', 'video', 'course', 'website'];
  const categories = ['Academic', 'Skill Development', 'Career Guidance', 'Test Preparation', 'General Knowledge'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Resource Management</h3>
        <p className="text-sm text-gray-600">{resources.length} resources</p>
      </div>

      {/* Add New Resource Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Resource</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="resource-title">Title *</Label>
              <Input
                id="resource-title"
                value={newResource.title || ''}
                onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter resource title"
              />
            </div>

            <div>
              <Label htmlFor="resource-url">URL *</Label>
              <Input
                id="resource-url"
                value={newResource.url || ''}
                onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="resource-type">Type</Label>
              <Select
                value={newResource.type || 'website'}
                onValueChange={(value) => setNewResource(prev => ({ ...prev, type: value as Resource['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
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
              <Select
                value={newResource.category || undefined}
                onValueChange={(value) => setNewResource(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="resource-description">Description</Label>
            <Textarea
              id="resource-description"
              value={newResource.description || ''}
              onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter resource description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="resource-subjects">Subjects (comma-separated)</Label>
            <Input
              id="resource-subjects"
              value={Array.isArray(newResource.subjects) ? newResource.subjects.join(', ') : ''}
              onChange={(e) => setNewResource(prev => ({
                ...prev,
                subjects: e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
              }))}
              placeholder="Mathematics, Physics, Chemistry"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="resource-verified"
              checked={newResource.isVerified || false}
              onChange={(e) => setNewResource(prev => ({ ...prev, isVerified: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="resource-verified">Mark as verified</Label>
          </div>

          <Button onClick={addResource} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </CardContent>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardContent className="p-6">
              {editing === resource.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={resource.title}
                        onChange={(e) => handleResourceChange(resource.id, 'title', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>URL</Label>
                      <Input
                        value={resource.url}
                        onChange={(e) => handleResourceChange(resource.id, 'url', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Type</Label>
                      <Select
                        value={resource.type}
                        onValueChange={(value) => handleResourceChange(resource.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {resourceTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Category</Label>
                      <Select
                        value={resource.category || undefined}
                        onValueChange={(value) => handleResourceChange(resource.id, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={resource.description}
                      onChange={(e) => handleResourceChange(resource.id, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Subjects</Label>
                    <Input
                      value={resource.subjects.join(', ')}
                      onChange={(e) => handleResourceChange(resource.id, 'subjects',
                        e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={resource.isVerified}
                      onChange={(e) => handleResourceChange(resource.id, 'isVerified', e.target.checked)}
                      className="rounded"
                    />
                    <Label>Verified</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => updateResource(resource.id)} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={() => setEditing(null)} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold">{resource.title}</h4>
                      <Badge variant={resource.isVerified ? 'default' : 'secondary'}>
                        {resource.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <Badge variant="outline">
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-2">{resource.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Category: {resource.category}</span>
                      <span>URL: <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {resource.url.substring(0, 50)}...
                      </a></span>
                    </div>

                    {resource.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resource.subjects.map(subject => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => setEditing(resource.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteResource(resource.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Statistics hook
function useAdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalColleges: 0,
    totalCourses: 0,
    totalCareers: 0,
    totalScholarships: 0,
    activeScholarships: 0,
    quizCompletions: 0,
    lastUpdated: new Date()
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching admin stats...');

        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // Fetch colleges count
        const collegesSnapshot = await getDocs(collection(db, 'colleges'));
        const totalColleges = collegesSnapshot.size;

        // Fetch courses count
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const totalCourses = coursesSnapshot.size;

        // Fetch careers count
        const careersSnapshot = await getDocs(collection(db, 'careers'));
        const totalCareers = careersSnapshot.size;

        // Fetch total scholarships count (both active and inactive)
        const scholarshipsSnapshot = await getDocs(collection(db, 'scholarships'));
        const totalScholarships = scholarshipsSnapshot.size;

        // Count active scholarships (with future deadlines and isActive = true)
        const currentDate = new Date();
        const activeScholarships = scholarshipsSnapshot.docs.filter(doc => {
          const scholarship = doc.data();
          // Check if scholarship is marked as active
          if (!scholarship.isActive) return false;

          // Check if deadline is in the future
          if (scholarship.applicationDeadline) {
            try {
              const deadline = scholarship.applicationDeadline.toDate ?
                scholarship.applicationDeadline.toDate() :
                new Date(scholarship.applicationDeadline);
              return !isNaN(deadline.getTime()) && deadline > currentDate;
            } catch {
              return false;
            }
          }
          return true; // If no deadline, consider it active if isActive is true
        }).length;

        // Fetch quiz completions from multiple possible collections
        let quizCompletions = 0;
        try {
          // Try 'quizResults' collection first
          const quizResultsSnapshot = await getDocs(collection(db, 'quizResults'));
          quizCompletions = quizResultsSnapshot.size;

          // If no results in 'quizResults', try 'quiz_results'
          if (quizCompletions === 0) {
            const altQuizResultsSnapshot = await getDocs(collection(db, 'quiz_results'));
            quizCompletions = altQuizResultsSnapshot.size;
          }

          // If still no results, try counting from users' quiz data
          if (quizCompletions === 0) {
            const usersWithQuizResults = usersSnapshot.docs.filter(doc => {
              const userData = doc.data();
              return userData.quizResults && Object.keys(userData.quizResults).length > 0;
            });
            quizCompletions = usersWithQuizResults.reduce((total, userDoc) => {
              const userData = userDoc.data();
              return total + Object.keys(userData.quizResults || {}).length;
            }, 0);
          }
        } catch (error) {
          console.error('Error fetching quiz completions:', error);
          quizCompletions = 0;
        }

        setStats({
          totalUsers,
          totalColleges,
          totalCourses,
          totalCareers,
          totalScholarships,
          activeScholarships,
          quizCompletions,
          lastUpdated: new Date()
        });

        console.log('Stats updated:', {
          totalUsers,
          totalColleges,
          totalCourses,
          totalCareers,
          totalScholarships,
          activeScholarships,
          quizCompletions
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    // Initial fetch
    fetchStats();

    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return stats;
}

// Main admin panel
export default function AdminPanel() {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const stats = useAdminStats();

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user exists but is not admin, show access denied
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have admin privileges.</p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // If no user or not admin, show login
  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm sm:text-base text-gray-600">Manage colleges, scholarships, and platform content</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 self-start sm:self-center">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Administrator
              </Badge>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <div className="w-full overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 gap-1 h-auto p-1 min-w-max">
                <TabsTrigger value="overview" className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto whitespace-nowrap">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger value="colleges" className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto whitespace-nowrap">
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span>Colleges</span>
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto whitespace-nowrap">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span>Courses</span>
                </TabsTrigger>
                <TabsTrigger value="careers" className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto whitespace-nowrap">
                  <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span>Careers</span>
                </TabsTrigger>
                <TabsTrigger value="scholarships" className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto whitespace-nowrap">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Scholarships</span>
                  <span className="sm:hidden">Awards</span>
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto whitespace-nowrap">
                  <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span>Resources</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto whitespace-nowrap">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span>Users</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-2 sm:space-y-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Platform Statistics</h3>
                  <p className="text-xs text-gray-500">
                    Last updated: {stats.lastUpdated.toLocaleTimeString()} • Auto-refreshes every 30s
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="flex items-center self-start sm:self-center"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Refresh Now
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-xl sm:text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                      </div>
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Colleges</p>
                        <p className="text-xl sm:text-2xl font-bold">{stats.totalColleges.toLocaleString()}</p>
                      </div>
                      <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Courses</p>
                        <p className="text-xl sm:text-2xl font-bold">{stats.totalCourses.toLocaleString()}</p>
                      </div>
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Career Paths</p>
                        <p className="text-xl sm:text-2xl font-bold">{stats.totalCareers.toLocaleString()}</p>
                      </div>
                      <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Scholarships</p>
                        <p className="text-xl sm:text-2xl font-bold">{stats.totalScholarships.toLocaleString()}</p>
                        <p className="text-xs text-green-600 mt-1">{stats.activeScholarships} active</p>
                      </div>
                      <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Quiz Completions</p>
                        <p className="text-xl sm:text-2xl font-bold">{stats.quizCompletions.toLocaleString()}</p>
                      </div>
                      <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="colleges">
              <CollegeManagement />
            </TabsContent>

            <TabsContent value="courses">
              <CourseManagement />
            </TabsContent>

            <TabsContent value="careers">
              <CareerManagement />
            </TabsContent>

            <TabsContent value="scholarships">
              <ScholarshipManagement />
            </TabsContent>

            <TabsContent value="resources">
              <ResourceManagement />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
}