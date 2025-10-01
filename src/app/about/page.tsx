'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Users, 
  Heart, 
  Award,
  BookOpen,
  TrendingUp,
  Shield,
  Globe,
  Lightbulb,
  Star,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const features = [
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: 'Personalized Guidance',
      description: 'AI-powered recommendations tailored to your interests, skills, and career goals.'
    },
    {
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      title: 'Comprehensive Resources',
      description: 'Access to courses, colleges, scholarships, and career information in one place.'
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: 'Expert Support',
      description: 'Guidance from education counselors and industry professionals.'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: 'Progress Tracking',
      description: 'Monitor your academic and career journey with detailed analytics.'
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: 'Trusted Information',
      description: 'Verified and up-to-date information from reliable sources.'
    },
    {
      icon: <Globe className="h-8 w-8 text-indigo-600" />,
      title: 'Accessible Anywhere',
      description: 'Access your career guidance platform from any device, anywhere.'
    }
  ];

  

  const team = [
    {
      name: 'Megharaj Dandgavhal',
      role: 'Fullstack Developer',
      experience: '2+ years',
      specialization: 'React, Node.js, TypeScript, Next.js, Firebase',
      image: '/dev.jpg'
    },
  ];

  const timeline = [
    {
      year: '2025',
      title: 'Beta Launch',
      description: 'Initial platform launch with college search, courses, and scholarship features. '
    },
    {
      year: 'Future',
      title: 'Enhanced Features',
      description: 'Planning to add more personalized recommendations and career guidance tools.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Heart className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About EduPath Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to empower every student with personalized career guidance, 
            comprehensive educational resources, and the tools they need to build a successful future.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Target className="h-6 w-6 mr-3 text-blue-600" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To democratize access to quality career guidance and educational resources, 
                ensuring every student can make informed decisions about their future, 
                regardless of their background or location.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Lightbulb className="h-6 w-6 mr-3 text-purple-600" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To become India's leading platform for career guidance and educational planning, 
                where every student has access to personalized, AI-powered recommendations 
                and expert mentorship.
              </p>
            </CardContent>
          </Card>
        </motion.div>

       

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose EduPath Pro?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="flex-1 md:w-1/2">
                    <Card className={`ml-12 md:ml-0 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {item.year}
                          </Badge>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-16 flex flex-col items-center justify-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Developer Team</h2>
          <div className="flex justify-center">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <Card className="mx-auto w-full max-w-sm bg-gradient-to-br from-blue-50 via-purple-50 to-white border-0 shadow-xl rounded-2xl text-center hover:scale-105 transition-transform duration-300">
                  <CardHeader>
                    <div className="w-29 h-29 rounded-2xl mx-auto mb-4 overflow-hidden border-4 border-gray-400 shadow-lg">
                      <Image 
                        src={member.image} 
                        alt={member.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800 mb-1">{member.name}</CardTitle>
                    <CardDescription className="text-lg text-blue-600 font-semibold mb-2">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                        {member.experience}
                      </Badge>
                      <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">Verified</span>
                    </div>
                    <p className="text-base text-gray-700 mb-2">{member.specialization}</p>
                    <div className="flex flex-col items-center gap-1 mt-4">
                      <span className="text-sm text-gray-500">Location: <span className="font-medium text-gray-700">Pune, India</span></span>
                      <span className="text-sm text-gray-500">Email: <a href="mailto:megharajdandgavhal2004@gmail.com" className="text-blue-600 hover:underline">megharajdandgavhal2004@gmail.com</a></span>
                      <div className="flex gap-3 mt-2 items-center">
                        <a href="https://www.linkedin.com/in/megharaj-dandgavhal-832683259" target="_blank" rel="noopener" title="LinkedIn" className="hover:scale-110 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="text-blue-700" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
                        </a>
                        <a href="https://instagram.com/megharajdandgavhal" target="_blank" rel="noopener" title="Instagram" className="hover:scale-110 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="text-pink-500" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.974-1.246-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.975 2.242-1.246 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.012-4.947.072-1.276.06-2.687.334-3.678 1.325-.991.991-1.265 2.402-1.325 3.678-.06 1.28-.072 1.688-.072 4.947s.012 3.667.072 4.947c.06 1.276.334 2.687 1.325 3.678.991.991 2.402 1.265 3.678 1.325 1.28.06 1.688.072 4.947.072s3.667-.012 4.947-.072c1.276-.06 2.687-.334 3.678-1.325.991-.991 1.265-2.402 1.325-3.678.06-1.28.072-1.688.072-4.947s-.012-3.667-.072-4.947c-.06-1.276-.334-2.687-1.325-3.678-.991-.991-2.402-1.265-3.678-1.325-1.28-.06-1.688-.072-4.947-.072zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                        </a>
                        <a href="https://github.com/meghraj2004" target="_blank" rel="noopener" title="GitHub" className="hover:scale-110 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="text-gray-800" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Have questions about your career path? Need help with college selection? 
              Our team is here to support you every step of the way.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Mail className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="font-semibold mb-1">Email Us</h3>
              <p className="text-gray-300">support@edupathpro.com</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="h-8 w-8 text-green-400 mb-3" />
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p className="text-gray-300">+91-94216-12345</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-8 w-8 text-red-400 mb-3" />
              <h3 className="font-semibold mb-1">Visit Us</h3>
              <p className="text-gray-300">Pune, India</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}