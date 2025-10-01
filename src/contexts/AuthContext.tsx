'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, additionalData?: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
        } else {
          // Create user document if it doesn't exist
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }

        // Check if user is admin by looking in admins collection
        try {
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          setIsAdmin(adminDoc.exists());
        } catch (error) {
          console.log('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, additionalData?: Partial<User>) => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: additionalData?.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        age: additionalData?.age,
        gender: additionalData?.gender,
        academicInterests: additionalData?.academicInterests || [],
        location: additionalData?.location,
        class: additionalData?.class,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      
      if (additionalData?.displayName) {
        await updateProfile(firebaseUser, { displayName: additionalData.displayName });
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...data, updatedAt: new Date() };
      await updateDoc(doc(db, 'users', user.uid), updatedUser);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateUserProfile,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}