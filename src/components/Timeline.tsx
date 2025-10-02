'use client';

import React from 'react';
import { TimelineEvent } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, CheckCircle, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { motion } from 'framer-motion';

interface TimelineProps {
  events: TimelineEvent[];
  onMarkComplete?: (eventId: string) => void;
  onToggleComplete?: (event: TimelineEvent) => void;
  onEdit?: (event: TimelineEvent) => void;
  onDelete?: (eventId: string) => void;
}

export default function Timeline({ events, onMarkComplete, onToggleComplete, onEdit, onDelete }: TimelineProps) {
  const sortedEvents = events.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const getEventStatus = (event: TimelineEvent) => {
    const now = new Date();
    const eventDate = event.date;
    const threeDaysFromNow = addDays(now, 3);
    
    if (event.isCompleted) return 'completed';
    if (isBefore(eventDate, now)) return 'overdue';
    if (isBefore(eventDate, threeDaysFromNow)) return 'urgent';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'urgent': return <Clock className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      default: return 'border-l-green-500';
    }
  };

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => {
        const status = getEventStatus(event);
        const statusColor = getStatusColor(status);
        const statusIcon = getStatusIcon(status);
        const priorityColor = getPriorityColor(event.priority);

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border-l-4 ${priorityColor} hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(event.date, 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(event.date, 'h:mm a')}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <Badge className={statusColor}>
                      <span className="flex items-center space-x-1">
                        {statusIcon}
                        <span className="capitalize">{status}</span>
                      </span>
                    </Badge>
                    
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        event.priority === 'high' ? 'bg-red-100 text-red-800' :
                        event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {event.priority} priority
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    {event.relatedLinks && event.relatedLinks.length > 0 && (
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={event.relatedLinks[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    
                    {onToggleComplete && (
                      <Button 
                        variant={event.isCompleted ? "outline" : "default"}
                        size="sm"
                        onClick={() => onToggleComplete(event)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {event.isCompleted ? 'Completed' : 'Mark Complete'}
                      </Button>
                    )}
                    
                    {!event.isCompleted && onMarkComplete && !onToggleComplete && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onMarkComplete(event.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                    
                    {onEdit && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEdit(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {onDelete && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDelete(event.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {sortedEvents.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
          <p className="text-gray-500">Your timeline is clear! Check back later for updates.</p>
        </Card>
      )}
    </div>
  );
}