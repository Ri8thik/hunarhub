// ============================================================
// 🔐 AUTHENTICATION SERVICE
// ============================================================
// Handles:
// - Email/Password login & registration
// - Phone OTP login
// - Google Sign-In
// - Logout
// - Password reset
// - Session initialization
// ============================================================

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  type User,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/config/firebase';
import { initSession, clearSession } from '@/services/sessionManager';
import { createUserProfile, getUserProfile } from '@/services/firestoreService';
import { type UserRole } from '@/types';

// ---- Auth Result Type ----
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: string;
}

// ---- Store phone verification result ----
let phoneConfirmationResult: ConfirmationResult | null = null;

// ============================================================
// EMAIL / PASSWORD AUTH
// ============================================================

/** Register with email and password */
export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<AuthResult> {
  // If Firebase is not configured, use mock
  if (!isFirebaseConfigured()) {
    return mockAuth(email, name, role, 'email');
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    await updateProfile(result.user, { displayName: name });
    
    // Create user profile in Firestore
    await createUserProfile(result.user.uid, {
      name,
      email,
      role,
      phone: '',
      avatar: '',
      location: '',
      joinedDate: new Date().toISOString().split('T')[0],
    });
    
    // Initialize session
    await initSession(role, 'email');
    
    return { success: true, user: result.user };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return {
      success: false,
      error: getAuthErrorMessage(firebaseError.code || ''),
      errorCode: firebaseError.code,
    };
  }
}

/** Sign in with email and password */
export async function loginWithEmail(
  email: string,
  password: string,
  role: UserRole
): Promise<AuthResult> {
  if (!isFirebaseConfigured()) {
    return mockAuth(email, '', role, 'email');
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user profile exists and get role
    const profile = await getUserProfile(result.user.uid);
    const userRole = profile?.role || role;
    
    // Initialize session
    await initSession(userRole, 'email');
    
    return { success: true, user: result.user };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return {
      success: false,
      error: getAuthErrorMessage(firebaseError.code || ''),
      errorCode: firebaseError.code,
    };
  }
}

// ============================================================
// PHONE OTP AUTH
// ============================================================

/** Send OTP to phone number */
export async function sendPhoneOTP(
  phoneNumber: string,
  recaptchaContainerId: string
): Promise<AuthResult> {
  if (!isFirebaseConfigured()) {
    // Mock OTP send
    phoneConfirmationResult = null;
    return { success: true };
  }

  try {
    // Create RecaptchaVerifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
    });
    
    // Format phone number for India
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '')}`;
    
    // Send OTP
    phoneConfirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    
    return { success: true };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return {
      success: false,
      error: getAuthErrorMessage(firebaseError.code || ''),
      errorCode: firebaseError.code,
    };
  }
}

/** Verify OTP code */
export async function verifyPhoneOTP(
  otp: string,
  role: UserRole
): Promise<AuthResult> {
  if (!isFirebaseConfigured()) {
    // Mock OTP verification
    if (otp === '123456') {
      return mockAuth('', 'Phone User', role, 'phone');
    }
    return { success: false, error: 'Invalid OTP. Use 123456 for testing.' };
  }

  try {
    if (!phoneConfirmationResult) {
      return { success: false, error: 'Please request OTP first' };
    }
    
    const result = await phoneConfirmationResult.confirm(otp);
    
    // Check/create user profile
    const profile = await getUserProfile(result.user.uid);
    if (!profile) {
      await createUserProfile(result.user.uid, {
        name: result.user.displayName || 'User',
        email: result.user.email || '',
        role,
        phone: result.user.phoneNumber || '',
        avatar: '',
        location: '',
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }
    
    // Initialize session
    await initSession(profile?.role || role, 'phone');
    
    return { success: true, user: result.user };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return {
      success: false,
      error: getAuthErrorMessage(firebaseError.code || ''),
      errorCode: firebaseError.code,
    };
  }
}

// ============================================================
// GOOGLE SIGN-IN
// ============================================================

/** Sign in with Google */
export async function loginWithGoogle(role: UserRole): Promise<AuthResult> {
  if (!isFirebaseConfigured()) {
    return mockAuth('google@gmail.com', 'Google User', role, 'google');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check/create user profile
    const profile = await getUserProfile(result.user.uid);
    if (!profile) {
      await createUserProfile(result.user.uid, {
        name: result.user.displayName || 'User',
        email: result.user.email || '',
        role,
        phone: result.user.phoneNumber || '',
        avatar: result.user.photoURL || '',
        location: '',
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }
    
    // Initialize session
    await initSession(profile?.role || role, 'google');
    
    return { success: true, user: result.user };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return {
      success: false,
      error: getAuthErrorMessage(firebaseError.code || ''),
      errorCode: firebaseError.code,
    };
  }
}

// ============================================================
// LOGOUT & PASSWORD RESET
// ============================================================

/** Sign out */
export async function logout(): Promise<void> {
  try {
    if (isFirebaseConfigured()) {
      await signOut(auth);
    }
    clearSession();
  } catch (error) {
    console.error('[AuthService] Logout error:', error);
    clearSession(); // Clear session anyway
  }
}

/** Send password reset email */
export async function resetPassword(email: string): Promise<AuthResult> {
  if (!isFirebaseConfigured()) {
    return { success: true };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return {
      success: false,
      error: getAuthErrorMessage(firebaseError.code || ''),
      errorCode: firebaseError.code,
    };
  }
}

// ============================================================
// AUTH STATE LISTENER
// ============================================================

/** Listen for auth state changes */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/** Get current authenticated user */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// ============================================================
// MOCK AUTH (when Firebase is not configured)
// ============================================================

function mockAuth(
  email: string,
  name: string,
  role: UserRole,
  method: 'email' | 'phone' | 'google'
): AuthResult {
  console.log(`[AuthService] Mock ${method} auth for:`, email || name);
  
  // Save mock session data
  const mockUserData = {
    uid: `mock_${Date.now()}`,
    email: email || null,
    displayName: name || (role === 'artist' ? 'Priya Sharma' : 'Amit Kumar'),
    phoneNumber: null,
    photoURL: null,
    role,
    loginMethod: method,
    loginTimestamp: Date.now(),
  };
  
  sessionStorage.setItem('hunarhub_access_token', `mock_token_${Date.now()}`);
  sessionStorage.setItem('hunarhub_refresh_token', `mock_refresh_${Date.now()}`);
  sessionStorage.setItem('hunarhub_token_expiry', String(Date.now() + 3600000));
  sessionStorage.setItem('hunarhub_user_data', JSON.stringify(mockUserData));
  sessionStorage.setItem('hunarhub_user_role', role);
  sessionStorage.setItem('hunarhub_session_id', `mock_sess_${Date.now()}`);
  sessionStorage.setItem('hunarhub_last_activity', String(Date.now()));
  
  return { success: true };
}

// ============================================================
// ERROR MESSAGE MAPPING
// ============================================================

function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email. Please register first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists. Please login.',
    'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/invalid-verification-code': 'Invalid OTP. Please check and try again.',
    'auth/code-expired': 'OTP has expired. Please request a new one.',
    'auth/invalid-phone-number': 'Invalid phone number. Please use format: +91XXXXXXXXXX',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Contact support.',
    'auth/account-exists-with-different-credential': 'Account exists with a different sign-in method.',
  };
  return messages[code] || 'Something went wrong. Please try again.';
}
