// ============================================================
// 🔥 FIREBASE CONFIGURATION
// ============================================================
// 
// SETUP STEPS (Do these in Firebase Console):
// 
// 1. Go to https://console.firebase.google.com
// 2. Click "Create a project" → Name it "HunarHub" → Continue
// 3. Disable Google Analytics (optional) → Create Project
// 4. Click the Web icon (</>) to add a web app
// 5. Register app name as "HunarHub Web" → Register
// 6. Copy the firebaseConfig object and paste below
// 7. Go to Authentication → Get Started → Enable:
//    - Email/Password
//    - Phone (add test phone numbers if needed)
//    - Google (configure OAuth consent screen)
// 8. Go to Firestore Database → Create Database → Start in Test Mode
// 9. Go to Project Settings → Service Accounts → Generate Key (for backend)
//
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔴 REPLACE THIS with your Firebase project config
// Get it from: Firebase Console → Project Settings → Your apps → Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Firestore Database
export const db = getFirestore(app);

// Check if Firebase is configured (not using placeholder values)
export function isFirebaseConfigured(): boolean {
  return !firebaseConfig.apiKey.includes('YOUR_');
}

export default app;
