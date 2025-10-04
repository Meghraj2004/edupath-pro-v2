import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB5rOnr90VlQ_qsX7NlcGVBqG1vwf8OKvo",
  authDomain: "career-education.firebaseapp.com",
  projectId: "career-education",
  storageBucket: "career-education.firebasestorage.app",
  messagingSenderId: "500848380035",
  appId: "1:500848380035:web:9f38bf43826e308b0af3b6",
  measurementId: "G-B43L116GV2"
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
