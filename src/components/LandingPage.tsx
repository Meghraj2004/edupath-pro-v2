'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { 
  GraduationCap, 
  BookOpen, 
  Building2, 
  Trophy, 
  Users, 
  Target,
  ArrowRight,
  Star,
  CheckCircle,
  Brain,
  Map,
  Bell,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { initializeDatabase } from '@/lib/database-init';

const features = [
  {
    icon: Brain,
    title: 'Smart Aptitude Quiz',
    description: 'Take our comprehensive assessment to discover your strengths, interests, and ideal career paths.',
    color: 'from-blue-500 to-cyan-500',
    href: '/quiz'
  },
  {
    icon: Map,
    title: 'Course-to-Career Mapping',
    description: 'Visualize clear pathways from your chosen course to various career opportunities.',
    color: 'from-purple-500 to-pink-500',
    href: '/courses'
  },
  {
    icon: Building2,
    title: 'College Directory',
    description: 'Find nearby government colleges with detailed information about courses, fees, and facilities.',
    color: 'from-green-500 to-emerald-500',
    href: '/colleges'
  },
  {
    icon: Trophy,
    title: 'Scholarship Resources',
    description: 'Access government scholarships and free educational resources tailored to your profile.',
    color: 'from-orange-500 to-red-500',
    href: '/scholarships'
  },
  {
    icon: Bell,
    title: 'Timeline Tracker',
    description: 'Never miss important dates with personalized notifications for admissions and scholarships.',
    color: 'from-indigo-500 to-blue-500',
    href: '/timeline'
  },
  {
    icon: Sparkles,
    title: 'AI Recommendations',
    description: 'Get personalized suggestions for courses, colleges, and career paths based on your profile.',
    color: 'from-pink-500 to-rose-500',
    href: '/recommendations'
  }
];

const stats = [
  { number: '10,000+', label: 'Students Guided' },
  { number: '500+', label: 'Colleges Listed' },
  { number: '100+', label: 'Career Paths' },
  { number: '50+', label: 'Scholarships' }
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Engineering Student',
    content: 'EduPath Pro helped me find the perfect engineering college near my home. The quiz results were surprisingly accurate!',
    rating: 5
  },
  {
    name: 'Rahul Patel',
    role: 'Commerce Graduate',
    content: 'The scholarship information saved me thousands of rupees. Highly recommend for all students.',
    rating: 5
  },
  {
    name: 'Sneha Reddy',
    role: 'Medical Aspirant',
    content: 'The career mapping feature showed me paths I never knew existed. Now I\'m confident about my future.',
    rating: 5
  }
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Initialize database when component mounts
    initializeDatabase();
  }, []);

  // Handle feature card click with authentication
  const handleFeatureClick = (href: string) => {
    console.log('Feature card clicked:', href, 'User logged in:', !!user);
    
    if (user) {
      // User is logged in, go directly to feature page
      console.log('Navigating to:', href);
      router.push(href);
    } else {
      // User is not logged in, redirect to login page
      console.log('User not logged in, redirecting to login');
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Star className="h-4 w-4 mr-1" />
                Your Personalized Career Navigator
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Discover Your Perfect
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}Career Path
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Get personalized guidance for your education and career journey. Take our aptitude quiz, 
                explore courses, find nearby colleges, and access scholarships - all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register">
                      <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button variant="outline" size="lg">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* About & Contact Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Learn More About Us
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover our mission to help students find their perfect career path, or get in touch with our team for personalized guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                  <BookOpen className="mr-2 h-5 w-5" />
                  About Us
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">
                  <Users className="mr-2 h-5 w-5" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Career Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources you need to make informed decisions about your future.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card 
                    className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg cursor-pointer hover:scale-[1.02] group active:scale-[0.98]"
                    onClick={() => handleFeatureClick(feature.href)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleFeatureClick(feature.href);
                      }
                    }}
                  >
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </CardDescription>
                      
                      {/* Add click indicator */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-300">
                          {user ? 'Click to explore' : 'Login to access'}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
     


      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Shape Your Future?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of students who have already discovered their perfect career path with EduPath Pro.
            </p>
            
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/quiz">
                  <Button variant="outline" size="lg">
                    Take Free Quiz
                  </Button>
                </Link>
              </div>
            )}
            
            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Free to use
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No hidden fees
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Personalized guidance
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">EduPath Pro</span>
              </div>
              <p className="text-gray-400">
                Your personalized career and education navigator for a brighter future.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-5 text-gray-400">
                <li className="mb-2"><a href="/quiz">Aptitude Quiz</a></li>
                <li className="mb-2"><a href="/career-mapping">Career Mapping</a></li>
                <li className="mb-2"><a href="/college-directory">College Directory</a></li>
                <li className="mb-2"><a href="/scholarships">Scholarships</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li className='mb-2'><a href="/resources">Education Resources</a></li>
                <li className='mb-2'><a href="/timeline">Timeline</a></li>  
                <li className='mb-2'><a href="/ai-recommendations">AI Recommendations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li className='mb-2'><a href="/about">About Us</a></li>
                <li className='mb-2'><a href="/contact">Contact Us</a></li>

              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EduPath Pro. All rights reserved. Built with ❤️ for students across India.</p>
            <p>Developed by EduPath Team</p>
          </div>
        </div>
      </footer>
    </div>
  );
}