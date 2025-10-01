'use client';

import React from 'react';
import Link from 'next/link';
import { College } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Globe, Users, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

interface CollegeCardProps {
  college: College;
  index?: number;
}

export default function CollegeCard({ college, index = 0 }: CollegeCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: index * 0.1, duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
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

          {/* Sample Fee (first course) */}
          {college.fees && Object.keys(college.fees).length > 0 && (
            <div className="flex items-center text-sm">
              <IndianRupee className="h-4 w-4 mr-1 text-green-600" />
              <span className="text-gray-700">Fee starts from </span>
              <span className="font-semibold text-green-600">
                ₹{Math.min(...Object.values(college.fees)).toLocaleString()}
              </span>
            </div>
          )}

          {/* Contact Info */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex space-x-2">
              {college.contact?.phone && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={`tel:${college.contact.phone}`}>
                    <Phone className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {college.contact?.email && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={`mailto:${college.contact.email}`}>
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {college.website && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={college.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            
            <Button size="sm" asChild>
              <Link href={`/colleges/${college.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}