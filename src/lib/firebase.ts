import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCfX_rQM_PoVKqztOXbNDTeYtZiquhIwv4",
  authDomain: "carrivo-cc965.firebaseapp.com",
  projectId: "carrivo-cc965",
  storageBucket: "carrivo-cc965.firebasestorage.app",
  messagingSenderId: "132111362909",
  appId: "1:132111362909:web:7ac4a31d2a2a76864556b4",
  measurementId: "G-3CNEQVJM6C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics not available:', error);
  }
}
export { analytics };

// Test connection function
export const testFirebaseConnection = async () => {
  try {
    // Simple test to check if Firestore is accessible
    const { connectFirestoreEmulator } = await import('firebase/firestore');
    console.log('Firebase connection test: OK');
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};

export default app;
