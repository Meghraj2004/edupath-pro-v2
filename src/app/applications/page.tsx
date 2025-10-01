'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Building2, Trophy, Calendar, ExternalLink, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';

interface Application {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'course' | 'college' | 'scholarship';
  itemData: any;
  status: 'applied' | 'accepted' | 'rejected' | 'pending';
  appliedAt: Date;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      // Use simple query to avoid complex index requirements
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(applicationsQuery);
      const userApplications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        appliedAt: doc.data().appliedAt?.toDate() || new Date()
      })) as Application[];

      // Sort in application code instead of Firestore
      userApplications.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());

      setApplications(userApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeApplication = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to remove this application? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingIds(prev => new Set(prev).add(applicationId));
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'applications', applicationId));
      
      // Update local state
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      
      alert('Application removed successfully!');
    } catch (error) {
      console.error('Error removing application:', error);
      alert('Failed to remove application. Please try again.');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Applied</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-5 w-5" />;
      case 'college':
        return <Building2 className="h-5 w-5" />;
      case 'scholarship':
        return <Trophy className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading applications...</div>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
            <p className="text-gray-600">Track all your course, college, and scholarship applications</p>
          </div>

          {applications.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h2>
                <p className="text-gray-600 mb-6">
                  Start applying for courses, colleges, or scholarships to track them here.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/courses">
                    <Button>Browse Courses</Button>
                  </Link>
                  <Link href="/colleges">
                    <Button variant="outline">Find Colleges</Button>
                  </Link>
                  <Link href="/scholarships">
                    <Button variant="outline">Apply for Scholarships</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((application) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(application.itemType)}
                        <CardTitle className="text-lg">{application.itemData?.name || 'Unknown'}</CardTitle>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {application.itemData?.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Applied on {application.appliedAt.toLocaleDateString()}
                      </div>

                      {application.itemType === 'course' && application.itemData?.fees && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Fees:</span>
                          <span className="font-medium">₹{application.itemData.fees.toLocaleString()}</span>
                        </div>
                      )}

                      {application.itemType === 'college' && application.itemData?.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span>Location: {application.itemData.location.city}, {application.itemData.location.state}</span>
                        </div>
                      )}

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <Link href={`/${application.itemType}s/${application.itemId}`}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </Link>
                          
                          {application.status === 'applied' && (
                            <div className="flex items-center text-sm text-blue-600">
                              <Clock className="h-4 w-4 mr-1" />
                              In Review
                            </div>
                          )}
                          
                          {application.status === 'accepted' && (
                            <div className="flex items-center text-sm text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Accepted
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeApplication(application.id)}
                            disabled={deletingIds.has(application.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {deletingIds.has(application.id) ? 'Removing...' : 'Remove'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}