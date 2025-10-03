'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  adminOnly = false 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      setIsRedirecting(true);
      router.push('/');
      return;
    }

    // If admin access is required but user is not admin
    if (adminOnly && user && !isAdmin) {
      setIsRedirecting(true);
      router.push('/dashboard');
      return;
    }

    // If user is authenticated and trying to access auth pages
    if (!requireAuth && user && (
      window.location.pathname.includes('/auth/login') || 
      window.location.pathname.includes('/auth/register')
    )) {
      setIsRedirecting(true);
      router.replace('/dashboard');
      return;
    }
  }, [user, loading, requireAuth, adminOnly, isAdmin, router]);

  // Show loading spinner while checking authentication or redirecting
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">
              {isRedirecting ? 'Redirecting...' : 'Loading...'}
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // If requiring auth and user is not authenticated, don't render anything
  // (component will redirect above)
  if (requireAuth && !user) {
    return null;
  }

  // If requiring admin access and user is not admin, don't render anything
  if (adminOnly && user && !isAdmin) {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
}