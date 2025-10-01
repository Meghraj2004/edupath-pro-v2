'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Timeline from '@/components/Timeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BookOpen,
  GraduationCap,
  Trophy,
  TrendingUp,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isAfter, isBefore, addDays, addMonths } from 'date-fns';
import { TimelineEvent } from '@/types';

const eventTypes = ['Academic', 'Application', 'Exam', 'Achievement', 'Personal'];
const priorities = ['Low', 'Medium', 'High'];

export default function TimelinePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: '',
    priority: 'Medium',
    isCompleted: false
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const eventsQuery = query(
        collection(db, 'timeline'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(eventsQuery);
      const eventsData: TimelineEvent[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        eventsData.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          createdAt: data.createdAt?.toDate() || new Date()
        } as TimelineEvent);
      });
      
      // Sort in memory instead of using Firestore orderBy to avoid index requirement
      eventsData.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const eventData = {
        ...formData,
        date: new Date(formData.date),
        userId: user.uid,
        createdAt: new Date()
      };

      if (editingEvent) {
        await updateDoc(doc(db, 'timeline', editingEvent.id), eventData);
      } else {
        await addDoc(collection(db, 'timeline'), eventData);
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'timeline', eventId));
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const toggleComplete = async (event: TimelineEvent) => {
    try {
      await updateDoc(doc(db, 'timeline', event.id), {
        isCompleted: !event.isCompleted
      });
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      type: '',
      priority: 'Medium',
      isCompleted: false
    });
    setIsAddingEvent(false);
    setEditingEvent(null);
  };

  const startEdit = (event: TimelineEvent) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: format(event.date, 'yyyy-MM-dd'),
      type: event.type,
      priority: event.priority,
      isCompleted: event.isCompleted
    });
    setEditingEvent(event);
    setIsAddingEvent(true);
  };

  const getFilteredEvents = () => {
    let filtered = [...events];

    if (filter !== 'all') {
      switch (filter) {
        case 'upcoming':
          filtered = filtered.filter(event => !event.isCompleted && isAfter(event.date, new Date()));
          break;
        case 'overdue':
          filtered = filtered.filter(event => !event.isCompleted && isBefore(event.date, new Date()));
          break;
        case 'completed':
          filtered = filtered.filter(event => event.isCompleted);
          break;
        case 'this-month':
          const now = new Date();
          const nextMonth = addMonths(now, 1);
          filtered = filtered.filter(event => 
            isAfter(event.date, now) && isBefore(event.date, nextMonth)
          );
          break;
      }
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return a.date.getTime() - b.date.getTime();
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return a.date.getTime() - b.date.getTime();
      }
    });

    return filtered;
  };

  const getEventStats = () => {
    const total = events.length;
    const completed = events.filter(e => e.isCompleted).length;
    const upcoming = events.filter(e => !e.isCompleted && isAfter(e.date, new Date())).length;
    const overdue = events.filter(e => !e.isCompleted && isBefore(e.date, new Date())).length;

    return { total, completed, upcoming, overdue };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Academic': return <BookOpen className="h-4 w-4" />;
      case 'Application': return <Target className="h-4 w-4" />;
      case 'Exam': return <GraduationCap className="h-4 w-4" />;
      case 'Achievement': return <Trophy className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const stats = getEventStats();
  const filteredEvents = getFilteredEvents();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Timeline</h2>
              <p className="text-gray-600">Please wait while we fetch your timeline events...</p>
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
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Timeline Tracker</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plan, track, and achieve your academic and career milestones
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
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                <p className="text-gray-600">Total Events</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{stats.completed}</h3>
                <p className="text-gray-600">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{stats.upcoming}</h3>
                <p className="text-gray-600">Upcoming</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{stats.overdue}</h3>
                <p className="text-gray-600">Overdue</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div>
                      <Label>Filter Events</Label>
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Events</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="this-month">This Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="priority">Priority</SelectItem>
                          <SelectItem value="type">Type</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
                    <DialogTrigger asChild>
                      <Button onClick={() => resetForm()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <form onSubmit={handleSubmit}>
                        <DialogHeader>
                          <DialogTitle>
                            {editingEvent ? 'Edit Event' : 'Add New Event'}
                          </DialogTitle>
                          <DialogDescription>
                            {editingEvent ? 'Update your timeline event' : 'Create a new milestone or deadline to track'}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              placeholder="Event title"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              placeholder="Event description"
                              rows={3}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="date">Date *</Label>
                              <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="type">Type *</Label>
                              <Select 
                                value={formData.type} 
                                onValueChange={(value) => setFormData({...formData, type: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {eventTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select 
                              value={formData.priority} 
                              onValueChange={(value) => setFormData({...formData, priority: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {priorities.map(priority => (
                                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={resetForm}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingEvent ? 'Update Event' : 'Add Event'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Tabs defaultValue="timeline" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline">
                {filteredEvents.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600 mb-4">
                      {filter === 'all' 
                        ? "Start building your timeline by adding your first event."
                        : "Try adjusting your filter to see more events."
                      }
                    </p>
                    <Button onClick={() => setIsAddingEvent(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Event
                    </Button>
                  </Card>
                ) : (
                  <Timeline 
                    events={filteredEvents}
                    onToggleComplete={toggleComplete}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="list">
                {filteredEvents.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600 mb-4">
                      {filter === 'all' 
                        ? "Start building your timeline by adding your first event."
                        : "Try adjusting your filter to see more events."
                      }
                    </p>
                    <Button onClick={() => setIsAddingEvent(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Event
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <Card className={`transition-all duration-200 hover:shadow-md ${
                          event.isCompleted ? 'bg-green-50 border-green-200' : 
                          isBefore(event.date, new Date()) ? 'bg-red-50 border-red-200' : 
                          'bg-white'
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleComplete(event)}
                                  className={event.isCompleted ? 'text-green-600' : 'text-gray-400'}
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </Button>
                                
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    {getTypeIcon(event.type)}
                                    <h3 className={`font-semibold ${
                                      event.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                                    }`}>
                                      {event.title}
                                    </h3>
                                    <Badge className={getPriorityColor(event.priority)}>
                                      {event.priority}
                                    </Badge>
                                    <Badge variant="outline">
                                      {event.type}
                                    </Badge>
                                  </div>
                                  
                                  {event.description && (
                                    <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                                  )}
                                  
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {format(event.date, 'MMM dd, yyyy')}
                                    {!event.isCompleted && isBefore(event.date, new Date()) && (
                                      <Badge variant="destructive" className="ml-2">
                                        Overdue
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEdit(event)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(event.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}