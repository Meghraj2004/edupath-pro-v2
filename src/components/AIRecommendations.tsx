'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Trophy, 
  Target,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  Users,
  Sparkles,
  Brain,
  TrendingUp,
  Award,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Course {
  id: string;
  name: string;
  shortName: string;
  description: string;
  duration: string;
  eligibility: string;
  stream: string[];
  fees: number;
  rating: number;
  provider: string;
}

interface College {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
    district: string;
  };
  coursesOffered: Course[];
  facilities: string[];
  rating: number;
  isGovernment: boolean;
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  averageSalary: {
    min: number;
    max: number;
  };
  requiredSkills: string[];
  jobRoles: {
    title: string;
    description: string;
    companies: string[];
  }[];
}

interface QuizResultAnalysis {
  primaryField: string;
  secondaryField: string;
  strengths: string[];
  personality: string;
  recommendedStreams: string[];
  scores: {
    analytical: number;
    creative: number;
    technical: number;
    social: number;
  };
}

interface AIRecommendationsProps {
  quizAnalysis: QuizResultAnalysis | null;
  recommendedCourses: Course[];
  suggestedColleges: College[];
  careerPaths: CareerPath[];
  hasCompletedQuiz: boolean;
}

export default function AIRecommendations({
  quizAnalysis,
  recommendedCourses,
  suggestedColleges,
  careerPaths,
  hasCompletedQuiz
}: AIRecommendationsProps) {
  // Helper function to get recommendation strength based on quiz scores
  const getRecommendationStrength = (item: any, field: string): number => {
    if (!quizAnalysis) return 70;
    
    const fieldLower = field.toLowerCase();
    let baseScore = 60;
    
    // Boost score based on primary field match
    if (quizAnalysis.primaryField.toLowerCase() === fieldLower) {
      baseScore += 25;
    } else if (quizAnalysis.secondaryField.toLowerCase() === fieldLower) {
      baseScore += 15;
    }
    
    // Add personality-based matching
    if (quizAnalysis.personality === 'Analytical') {
      if (fieldLower.includes('engineering') || fieldLower.includes('technology') || fieldLower.includes('science')) {
        baseScore += 10;
      }
    } else if (quizAnalysis.personality === 'Creative') {
      if (fieldLower.includes('arts') || fieldLower.includes('design') || fieldLower.includes('creative')) {
        baseScore += 10;
      }
    } else if (quizAnalysis.personality === 'Social') {
      if (fieldLower.includes('business') || fieldLower.includes('medical') || fieldLower.includes('management')) {
        baseScore += 10;
      }
    }
    
    // Add score bonuses based on quiz performance
    const relevantScores = Object.entries(quizAnalysis.scores).filter(([key]) => {
      if (fieldLower.includes('engineering') && (key === 'analytical' || key === 'technical')) return true;
      if (fieldLower.includes('arts') && key === 'creative') return true;
      if (fieldLower.includes('business') && key === 'social') return true;
      if (fieldLower.includes('medical') && (key === 'social' || key === 'analytical')) return true;
      return false;
    });
    
    if (relevantScores.length > 0) {
      const avgRelevantScore = relevantScores.reduce((sum, [, score]) => sum + score, 0) / relevantScores.length;
      baseScore += Math.round((avgRelevantScore - 50) * 0.3); // Scale the bonus
    }
    
    return Math.min(100, Math.max(40, baseScore)); // Ensure score is between 40-100
  };

  // Helper function to get field color
  const getFieldColor = (field: string): string => {
    const fieldLower = field.toLowerCase();
    if (fieldLower.includes('engineering') || fieldLower.includes('technology')) {
      return 'from-blue-500 to-indigo-600';
    } else if (fieldLower.includes('medical') || fieldLower.includes('health')) {
      return 'from-green-500 to-emerald-600';
    } else if (fieldLower.includes('business') || fieldLower.includes('commerce')) {
      return 'from-orange-500 to-red-600';
    } else if (fieldLower.includes('arts') || fieldLower.includes('creative')) {
      return 'from-purple-500 to-pink-600';
    }
    return 'from-gray-500 to-slate-600';
  };

  // Debug logging
  console.log('AIRecommendations - props:', {
    hasCompletedQuiz,
    quizAnalysis,
    recommendedCourses: recommendedCourses?.length || 0,
    suggestedColleges: suggestedColleges?.length || 0,
    careerPaths: careerPaths?.length || 0
  });

  if (!hasCompletedQuiz) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <div className="bg-blue-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Get AI-Powered Recommendations</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Take our comprehensive aptitude quiz to unlock personalized course, career, and college recommendations 
              tailored to your interests, skills, and personality type.
            </p>
            <Link href="/quiz">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Brain className="h-5 w-5 mr-2" />
                Take Quiz Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 mr-3 text-yellow-500" />
          AI-Powered Recommendations
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Based on your quiz results, here are personalized recommendations for courses, careers, and colleges 
          that match your {quizAnalysis?.personality.toLowerCase()} personality and {quizAnalysis?.primaryField.toLowerCase()} interests.
        </p>
      </div>

      {/* Quiz Analysis Summary */}
      {quizAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{quizAnalysis.primaryField}</div>
                  <div className="text-sm text-gray-600">Primary Field</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{quizAnalysis.personality}</div>
                  <div className="text-sm text-gray-600">Personality Type</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{Object.values(quizAnalysis.scores).reduce((a, b) => a + b, 0) / 4}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{quizAnalysis.strengths.length}</div>
                  <div className="text-sm text-gray-600">Key Strengths</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommended Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
            Recommended Courses
          </h3>
          <Link href="/courses">
            <Button variant="outline" size="sm">
              View All Courses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!recommendedCourses || recommendedCourses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h4 className="text-xl font-semibold text-gray-600 mb-2">No Courses Available</h4>
              <p className="text-gray-500 mb-4">
                We're currently loading course recommendations for you.
              </p>
              <Link href="/courses">
                <Button variant="outline">
                  Browse All Courses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            recommendedCourses.slice(0, 6).map((course, index) => {
            const matchScore = getRecommendationStrength(course, quizAnalysis?.primaryField || '');
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-2">{course.name}</CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {course.duration}
                          </Badge>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-xs">{course.rating || 4.5}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Match</div>
                        <div className="font-bold text-sm text-green-600">{matchScore}%</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4 line-clamp-3">
                      {course.description}
                    </CardDescription>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {course.provider}
                      </div>
                      {course.fees && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-semibold">₹{course.fees.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <Progress value={matchScore} className="mb-3" />
                    <Link href={`/courses/${course.id}`}>
                      <Button className="w-full" size="sm">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          }))}
        </div>
      </motion.div>

      {/* Career Paths */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-yellow-600" />
            Career Opportunities
          </h3>
          <Link href="/careers">
            <Button variant="outline" size="sm">
              Explore Careers
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>  
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {careerPaths.slice(0, 4).map((career, index) => {
            const matchScore = getRecommendationStrength(career, quizAnalysis?.primaryField || '');
            return (
              <motion.div
                key={career.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{career.title}</CardTitle>
                        <CardDescription className="mb-3">
                          {career.description}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {matchScore}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Salary Range</span>
                        <span className="font-semibold">
                          ₹{career.averageSalary.min.toLocaleString()} - ₹{career.averageSalary.max.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-2">Key Skills Required</span>
                        <div className="flex flex-wrap gap-1">
                          {career.requiredSkills.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {career.requiredSkills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{career.requiredSkills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Progress value={matchScore} className="mb-3" />
                    <Link href={`/careers/${career.id}`}>
                      <Button className="w-full" size="sm">
                        Explore Career
                        <TrendingUp className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

   

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="text-center mt-12"
      >
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <h4 className="text-2xl font-bold mb-4">Want More Detailed Recommendations?</h4>
            <p className="mb-6 opacity-90">
              Visit our dedicated recommendations page for comprehensive analysis, detailed comparisons, 
              and advanced filtering options.
            </p>
            <Link href="/recommendations">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                <Brain className="h-5 w-5 mr-2" />
                View Detailed Analysis
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}