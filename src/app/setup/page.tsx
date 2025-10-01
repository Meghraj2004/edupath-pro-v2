'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';
import { initializeFirebaseData } from '@/lib/initializeData';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleInitializeData = async () => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Initializing Firebase data...' });

    try {
      await initializeFirebaseData();
      setStatus({ 
        type: 'success', 
        message: 'Firebase data initialized successfully! Sample colleges, scholarships, and quiz questions have been added.' 
      });
    } catch (error: any) {
      console.error('Error initializing data:', error);
      setStatus({ 
        type: 'error', 
        message: `Failed to initialize data: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdminUser = async () => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Creating admin user...' });

    try {
      // Create admin user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        'megharaj@admin.com', 
        'megharaj@123'
      );

      const user = userCredential.user;

      // Add to users collection
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: 'Megharaj Admin',
        role: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Add to admins collection for security rules
      await setDoc(doc(db, 'admins', user.uid), {
        uid: user.uid,
        username: 'megharaj',
        email: user.email,
        role: 'super-admin',
        createdAt: serverTimestamp(),
        permissions: ['read', 'write', 'delete', 'manage-users'],
        active: true
      });

      // Mark setup as complete for admin creation
      await setDoc(doc(db, 'setup', 'initialized'), {
        completed: true,
        completedAt: serverTimestamp(),
        adminEmail: 'megharaj@admin.com'
      });

      setStatus({ 
        type: 'success', 
        message: 'Admin user created successfully! Email: megharaj@admin.com, Password: megharaj@123' 
      });
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      if (error.code === 'auth/email-already-in-use') {
        setStatus({ 
          type: 'error', 
          message: 'Admin user already exists. You can log in with: megharaj@admin.com / megharaj@123' 
        });
      } else {
        setStatus({ 
          type: 'error', 
          message: `Failed to create admin user: ${error.message}` 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFullSetup = async () => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Setting up complete system...' });

    try {
      // Step 1: Initialize data
      await initializeFirebaseData();
      
      // Step 2: Create admin user
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          'megharaj@admin.com', 
          'megharaj@123'
        );

        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: 'Megharaj Admin',
          role: 'admin',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        await setDoc(doc(db, 'admins', user.uid), {
          uid: user.uid,
          username: 'megharaj',
          email: user.email,
          role: 'super-admin',
          createdAt: serverTimestamp(),
          permissions: ['read', 'write', 'delete', 'manage-users'],
          active: true
        });
      } catch (adminError: any) {
        if (adminError.code !== 'auth/email-already-in-use') {
          throw adminError;
        }
      }

      // Mark setup as complete
      await setDoc(doc(db, 'setup', 'initialized'), {
        completed: true,
        completedAt: serverTimestamp(),
        adminEmail: 'megharaj@admin.com'
      });

      setStatus({ 
        type: 'success', 
        message: 'Complete setup finished! Data initialized and admin user ready. Login: megharaj@admin.com / megharaj@123' 
      });
    } catch (error: any) {
      console.error('Error in full setup:', error);
      setStatus({ 
        type: 'error', 
        message: `Setup failed: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EduPath Pro Setup</h1>
          <p className="text-xl text-gray-600">Initialize your application with sample data and admin user</p>
        </div>

        {status && (
          <Alert className={`mb-6 ${
            status.type === 'success' ? 'border-green-200 bg-green-50' :
            status.type === 'error' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            {status.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
             status.type === 'error' ? <AlertTriangle className="h-4 w-4" /> :
             <Loader2 className="h-4 w-4 animate-spin" />}
            <AlertDescription className="ml-2">
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Initialize Sample Data
              </CardTitle>
              <CardDescription>
                Add sample colleges, scholarships, quiz questions, and resources to the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleInitializeData} 
                disabled={loading}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Initialize Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Create Admin User
              </CardTitle>
              <CardDescription>
                Create the admin user account for managing the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateAdminUser} 
                disabled={loading}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center text-blue-800">
              Complete Setup (Recommended)
            </CardTitle>
            <CardDescription className="text-center">
              Run both initialization steps in one go - perfect for first-time setup
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleFullSetup} 
              disabled={loading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Complete Setup
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>After setup, you can access the admin panel with:</p>
          <p className="font-mono bg-gray-100 p-2 rounded mt-2">
            Email: megharaj@admin.com<br />
            Password: megharaj@123
          </p>
        </div>
      </div>
    </div>
  );
}