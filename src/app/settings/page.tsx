'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Key, 
  Download, 
  Trash2, 
  Camera, 
  Save,
  AlertTriangle,
  CheckCircle,
  Mail,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { updatePassword, updateEmail, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/lib/firebase';
import { User as UserType } from '@/types';

// Inline Switch component
const Switch = ({ checked, onCheckedChange, disabled = false }: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void; 
  disabled?: boolean; 
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? "bg-blue-600" : "bg-gray-200"
    }`}
    onClick={() => onCheckedChange(!checked)}
  >
    <span
      className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

// Inline Separator component
const Separator = ({ className = "" }: { className?: string }) => (
  <div className={`shrink-0 bg-gray-200 h-[1px] w-full ${className}`} />
);

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    quiz_reminders: boolean;
    scholarship_alerts: boolean;
    course_updates: boolean;
    college_news: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'friends';
    show_email: boolean;
    show_quiz_results: boolean;
    data_sharing: boolean;
    analytics: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    email_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  };
}

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    quiz_reminders: true,
    scholarship_alerts: true,
    course_updates: false,
    college_news: false,
  },
  privacy: {
    profile_visibility: 'public',
    show_email: false,
    show_quiz_results: true,
    data_sharing: false,
    analytics: true,
  },
  preferences: {
    theme: 'system',
    language: 'en',
    timezone: 'Asia/Kolkata',
    email_frequency: 'weekly',
  },
};

export default function SettingsPage() {
  const { user, updateUserProfile, firebaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    age: '',
    gender: '',
    location: '',
    class: '',
    bio: '',
  });
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newEmail: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      // Load user profile data
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        age: user.age?.toString() || '',
        gender: user.gender || '',
        location: user.location || '',
        class: user.class || '',
        bio: user.bio || '',
      });

      // Load user settings from Firebase
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const settingsDoc = await getDoc(doc(db, 'user-settings', user.uid));
      if (settingsDoc.exists()) {
        const userData = settingsDoc.data();
        setSettings({ ...defaultSettings, ...userData });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);
    setSaveStatus('saving');

    try {
      // Save settings to Firebase
      await setDoc(doc(db, 'user-settings', user.uid), settings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    setSaveStatus('saving');

    try {
      const updatedProfile: Partial<UserType> = {
        displayName: profileData.displayName,
        age: profileData.age ? parseInt(profileData.age) : undefined,
        gender: profileData.gender as 'male' | 'female' | 'other' | undefined,
        location: profileData.location,
        class: profileData.class as '10' | '12' | undefined,
        bio: profileData.bio,
      };

      await updateUserProfile(updatedProfile);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user || !file) return;

    setLoading(true);
    setSaveStatus('saving');

    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateUserProfile({ photoURL: downloadURL });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!firebaseUser || !security.currentPassword || !security.newPassword) return;

    if (security.newPassword !== security.confirmPassword) {
      setSaveStatus('error');
      return;
    }

    setLoading(true);
    setSaveStatus('saving');

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(firebaseUser.email!, security.currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, security.newPassword);
      
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '', newEmail: '' });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const exportUserData = async () => {
    if (!user) return;

    try {
      const userData = {
        profile: user,
        settings: settings,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `edupath-data-${user.uid}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const deleteAccount = async () => {
    if (!firebaseUser || deleteConfirmation !== 'DELETE') return;

    setLoading(true);

    try {
      // Delete user document from Firestore
      await updateDoc(doc(db, 'users', user!.uid), {
        deleted: true,
        deletedAt: new Date(),
      });

      // Delete Firebase auth user
      await deleteUser(firebaseUser);
    } catch (error) {
      console.error('Error deleting account:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-gray-600">Manage your account preferences and privacy settings</p>
              </div>
            </div>

            {/* Save Status */}
            {saveStatus !== 'idle' && (
              <Alert className={`mt-4 ${saveStatus === 'saved' ? 'border-green-500' : saveStatus === 'error' ? 'border-red-500' : 'border-blue-500'}`}>
                <div className="flex items-center">
                  {saveStatus === 'saving' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2" />}
                  {saveStatus === 'saved' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                  {saveStatus === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />}
                  <AlertDescription>
                    {saveStatus === 'saving' && 'Saving changes...'}
                    {saveStatus === 'saved' && 'Changes saved successfully!'}
                    {saveStatus === 'error' && 'Failed to save changes. Please try again.'}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </motion.div>

          {/* Settings Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information and profile picture</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                        <AvatarFallback className="text-2xl">
                          {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <h3 className="font-medium">Profile Picture</h3>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setAvatarFile(file);
                                handleAvatarUpload(file);
                              }
                            }}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <Label htmlFor="avatar-upload" className="cursor-pointer">
                            <Button variant="outline" className="flex items-center space-x-2">
                              <Camera className="h-4 w-4" />
                              <span>Change Picture</span>
                            </Button>
                          </Label>
                        </div>
                        <p className="text-sm text-gray-500">JPG, PNG, or GIF (max 5MB)</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Profile Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        <Input
                          id="displayName"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-sm text-gray-500">Email cannot be changed here. Use Security tab.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={profileData.age}
                          onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                          placeholder="Enter your age"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={profileData.gender}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="City, State"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="class">Class</Label>
                        <Select
                          value={profileData.class}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, class: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">Class 10</SelectItem>
                            <SelectItem value="12">Class 12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={saveProfile} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose what notifications you want to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={settings.notifications.email}
                          onCheckedChange={(checked: boolean) => 
                            setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, email: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Push Notifications</h4>
                          <p className="text-sm text-gray-500">Receive browser push notifications</p>
                        </div>
                        <Switch
                          checked={settings.notifications.push}
                          onCheckedChange={(checked: boolean) => 
                            setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, push: checked }
                            }))
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Quiz Reminders</h4>
                          <p className="text-sm text-gray-500">Get reminded to take career assessment quizzes</p>
                        </div>
                        <Switch
                          checked={settings.notifications.quiz_reminders}
                          onCheckedChange={(checked: boolean) => 
                            setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, quiz_reminders: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Scholarship Alerts</h4>
                          <p className="text-sm text-gray-500">Be notified about new scholarship opportunities</p>
                        </div>
                        <Switch
                          checked={settings.notifications.scholarship_alerts}
                          onCheckedChange={(checked: boolean) => 
                            setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, scholarship_alerts: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Course Updates</h4>
                          <p className="text-sm text-gray-500">Get updates about new courses and programs</p>
                        </div>
                        <Switch
                          checked={settings.notifications.course_updates}
                          onCheckedChange={(checked: boolean) => 
                            setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, course_updates: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">College News</h4>
                          <p className="text-sm text-gray-500">Receive news and updates from colleges</p>
                        </div>
                        <Switch
                          checked={settings.notifications.college_news}
                          onCheckedChange={(checked: boolean) => 
                            setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, college_news: checked }
                            }))
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Email Frequency</Label>
                      <Select
                        value={settings.preferences.email_frequency}
                        onValueChange={(value: 'immediate' | 'daily' | 'weekly' | 'never') => 
                          setSettings(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, email_frequency: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="daily">Daily Digest</SelectItem>
                          <SelectItem value="weekly">Weekly Summary</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={saveSettings} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Settings */}
              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control who can see your information and how it's used</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Profile Visibility</Label>
                        <Select
                          value={settings.privacy.profile_visibility}
                          onValueChange={(value: 'public' | 'private' | 'friends') => 
                            setSettings(prev => ({
                              ...prev,
                              privacy: { ...prev.privacy, profile_visibility: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public - Anyone can see</SelectItem>
                            <SelectItem value="friends">Friends Only</SelectItem>
                            <SelectItem value="private">Private - Only me</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Show Email Address</h4>
                          <p className="text-sm text-gray-500">Allow others to see your email address</p>
                        </div>
                        <Switch
                          checked={settings.privacy.show_email}
                          onCheckedChange={(checked: boolean) => 
                            setSettings(prev => ({
                              ...prev,
                              privacy: { ...prev.privacy, show_email: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Show Quiz Results</h4>
                          <p className="text-sm text-gray-500">Allow others to see your career quiz results</p>
                        </div>
                        <Switch
                          checked={settings.privacy.show_quiz_results}
                          onCheckedChange={(checked: boolean) => 
                            setSettings(prev => ({
                              ...prev,
                              privacy: { ...prev.privacy, show_quiz_results: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Data Sharing</h4>
                          <p className="text-sm text-gray-500">Share anonymized data to improve our services</p>
                        </div>
                        <Switch
                          checked={settings.privacy.data_sharing}
                          onCheckedChange={(checked: boolean) => 
                            setSettings(prev => ({
                              ...prev,
                              privacy: { ...prev.privacy, data_sharing: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Analytics</h4>
                          <p className="text-sm text-gray-500">Help us improve by sharing usage analytics</p>
                        </div>
                        <Switch
                          checked={settings.privacy.analytics}
                          onCheckedChange={(checked: boolean) => 
                            setSettings(prev => ({
                              ...prev,
                              privacy: { ...prev.privacy, analytics: checked }
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={saveSettings} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Privacy Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Password & Security</CardTitle>
                    <CardDescription>Keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Change Password</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={security.currentPassword}
                            onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={security.newPassword}
                            onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={security.confirmPassword}
                            onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <Button 
                        onClick={changePassword} 
                        disabled={!security.currentPassword || !security.newPassword || !security.confirmPassword || loading}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-medium">Security Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">Email Authentication</p>
                              <p className="text-sm text-gray-500">Your account is secured with email authentication</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">Two-Factor Authentication</p>
                              <p className="text-sm text-gray-500">Add extra security to your account</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Enable
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Globe className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">Login Sessions</p>
                              <p className="text-sm text-gray-500">Manage your active login sessions</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View All
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Account Management */}
              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>Manage your account data and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Data & Privacy</h3>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">Export Your Data</h4>
                          <p className="text-sm text-gray-500">Download a copy of your account data</p>
                        </div>
                        <Button variant="outline" onClick={exportUserData}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select
                          value={settings.preferences.language}
                          onValueChange={(value) => 
                            setSettings(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, language: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                            <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                            <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                            <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                            <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Theme</Label>
                        <Select
                          value={settings.preferences.theme}
                          onValueChange={(value: 'light' | 'dark' | 'system') => 
                            setSettings(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, theme: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select
                          value={settings.preferences.timezone}
                          onValueChange={(value) => 
                            setSettings(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, timezone: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    {/* Danger Zone */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-red-600">Danger Zone</h3>
                      
                      <div className="border border-red-200 rounded-lg p-4 space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-600">Delete Account</h4>
                          <p className="text-sm text-gray-500">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Account</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete your account? This will permanently remove all your data including:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  <li>Profile information</li>
                                  <li>Quiz results and recommendations</li>
                                  <li>Saved colleges and courses</li>
                                  <li>Application history</li>
                                </ul>
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="deleteConfirmation">
                                  Type "DELETE" to confirm account deletion:
                                </Label>
                                <Input
                                  id="deleteConfirmation"
                                  value={deleteConfirmation}
                                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                                  placeholder="DELETE"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDeleteConfirmation('')}>
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={deleteAccount}
                                disabled={deleteConfirmation !== 'DELETE' || loading}
                              >
                                {loading ? 'Deleting...' : 'Delete Account'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={saveSettings} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Account Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}