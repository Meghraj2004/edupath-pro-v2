'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  GraduationCap,
  Target,
  Heart,
  Settings,
  Shield,
  Bell,
  Save,
  X,
  Plus,
  Edit,
  Camera,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User as UserType } from '@/types';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    location: user?.location || '',
    class: user?.class || '',
    category: user?.category || '',
    interests: user?.interests || [],
    careerGoals: user?.careerGoals || [],
    bio: user?.bio || ''
  });

  const [newInterest, setNewInterest] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    newsletter: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        location: user.location || '',
        class: user.class || '',
        category: user.category || '',
        interests: user.interests || [],
        careerGoals: user.careerGoals || [],
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((i: string) => i !== interest)
    }));
  };

  const handleAddGoal = () => {
    if (newGoal.trim() && !formData.careerGoals.includes(newGoal.trim())) {
      setFormData(prev => ({
        ...prev,
        careerGoals: [...prev.careerGoals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      careerGoals: prev.careerGoals.filter((g: string) => g !== goal)
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      // Prepare data with proper type casting
      const profileData: Partial<UserType> = {
        ...formData,
        class: formData.class === '10' || formData.class === '12' ? formData.class : undefined
      };
      await updateUserProfile(profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['General', 'SC', 'ST', 'OBC', 'EWS'];
  const classes = ['10', '12', 'Graduation', 'Post-Graduation'];
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-xl text-gray-600">
              Manage your account information and preferences
            </p>
          </motion.div>

          {/* Status Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Profile Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Personal Info
                </TabsTrigger>
                <TabsTrigger value="academic" className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Academic Profile
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="displayName">Full Name *</Label>
                        <Input
                          id="displayName"
                          value={formData.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location (State)</Label>
                        <Select 
                          value={formData.location} 
                          onValueChange={(value) => handleInputChange('location', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your state" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => handleInputChange('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Academic Profile Tab */}
              <TabsContent value="academic">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Academic Details</CardTitle>
                      <CardDescription>
                        Your current academic status and interests
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="class">Current Class/Level</Label>
                        <Select 
                          value={formData.class} 
                          onValueChange={(value) => handleInputChange('class', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current level" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map(cls => (
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-red-500" />
                        Interests
                      </CardTitle>
                      <CardDescription>
                        Add subjects and areas that interest you
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="Add an interest (e.g., Mathematics, Arts, Technology)"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                        />
                        <Button onClick={handleAddInterest} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interest: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-red-100"
                            onClick={() => handleRemoveInterest(interest)}
                          >
                            {interest}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2 text-blue-500" />
                        Career Goals
                      </CardTitle>
                      <CardDescription>
                        What careers are you interested in pursuing?
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          placeholder="Add a career goal (e.g., Software Engineer, Doctor, Teacher)"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                        />
                        <Button onClick={handleAddGoal} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {formData.careerGoals.map((goal: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-red-100"
                            onClick={() => handleRemoveGoal(goal)}
                          >
                            {goal}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bell className="h-5 w-5 mr-2" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>
                        Choose how you want to receive updates and notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Email Notifications</Label>
                            <p className="text-sm text-gray-500">Receive updates via email</p>
                          </div>
                          <Button
                            variant={notifications.email ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                          >
                            {notifications.email ? 'Enabled' : 'Disabled'}
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Push Notifications</Label>
                            <p className="text-sm text-gray-500">Browser notifications for important updates</p>
                          </div>
                          <Button
                            variant={notifications.push ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                          >
                            {notifications.push ? 'Enabled' : 'Disabled'}
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">SMS Notifications</Label>
                            <p className="text-sm text-gray-500">Text messages for urgent updates</p>
                          </div>
                          <Button
                            variant={notifications.sms ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNotifications(prev => ({ ...prev, sms: !prev.sms }))}
                          >
                            {notifications.sms ? 'Enabled' : 'Disabled'}
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Newsletter</Label>
                            <p className="text-sm text-gray-500">Weekly digest of new opportunities</p>
                          </div>
                          <Button
                            variant={notifications.newsletter ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNotifications(prev => ({ ...prev, newsletter: !prev.newsletter }))}
                          >
                            {notifications.newsletter ? 'Enabled' : 'Disabled'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Privacy Settings
                      </CardTitle>
                      <CardDescription>
                        Control your privacy and data sharing preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Profile Visibility</Label>
                            <p className="text-sm text-gray-500">Make your profile visible to other students</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Public
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Data Analytics</Label>
                            <p className="text-sm text-gray-500">Help improve our recommendations</p>
                          </div>
                          <Button variant="default" size="sm">
                            Enabled
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t">
              <Button 
                onClick={handleSaveProfile} 
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}