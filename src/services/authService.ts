import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type ConfirmationResult,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { saveTokens, saveUserData, clearSession, getUserRole } from './sessionManager';

// Helper to save session data in one call
function saveSession(
  userData: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
    loginMethod: 'email' | 'phone' | 'google';
  },
  token: string,
  expiry: number
): void {
  const role = getUserRole() || 'customer';
  saveTokens(token, token, expiry - Date.now());
  saveUserData({
    ...userData,
    role,
    loginTimestamp: Date.now(),
  });
}

// ============ TYPES ============

interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

// ============ INTERNAL STATE ============

let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

// ============ AUTH STATE LISTENER ============

export const onAuthChange = (callback: (user: User | null) => void): Unsubscribe => {
  if (!isFirebaseConfigured()) {
    // In demo mode, no auth state changes
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// ============ RECAPTCHA MANAGEMENT ============

export const initRecaptcha = (containerId: string): void => {
  if (!isFirebaseConfigured()) return;

  try {
    cleanupRecaptcha();

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('reCAPTCHA container not found:', containerId);
      return;
    }

    container.innerHTML = '';

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'normal',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      },
    });

    recaptchaVerifier.render().then((widgetId) => {
      console.log('reCAPTCHA rendered, widget:', widgetId);
    }).catch((err) => {
      console.error('reCAPTCHA render error:', err);
    });
  } catch (error) {
    console.error('reCAPTCHA init error:', error);
  }
};

export const cleanupRecaptcha = (): void => {
  try {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';
  } catch (e) {
    console.warn('reCAPTCHA cleanup:', e);
    recaptchaVerifier = null;
  }
};

// ============ PHONE NUMBER FORMATTING ============

const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);

  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = '+' + cleaned;
  }

  if (!cleaned.startsWith('+')) {
    cleaned = '+91' + cleaned;
  }

  return cleaned;
};

// ============ EMAIL AUTH ============

export const registerWithEmail = async (
  email: string,
  password: string,
  name?: string,
  _role?: string
): Promise<AuthResult> => {
  if (!isFirebaseConfigured()) {
    // Demo mode
    saveSession({
      uid: 'demo-' + Date.now(),
      email,
      displayName: name || 'Demo User',
      photoURL: null,
      phoneNumber: null,
      loginMethod: 'email',
    }, 'demo-token-' + Date.now(), Date.now() + 3600000);
    return { success: true };
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    if (name) {
      await updateProfile(result.user, { displayName: name });
    }

    const token = await result.user.getIdToken();
    saveSession({
      uid: result.user.uid,
      email: result.user.email,
      displayName: name || result.user.displayName,
      photoURL: result.user.photoURL,
      phoneNumber: result.user.phoneNumber,
      loginMethod: 'email',
    }, token, Date.now() + 3600000);

    return { success: true, user: result.user };
  } catch (error: unknown) {
    const err = error as { code?: string };
    return { success: false, error: getErrorMessage(err.code || 'unknown') };
  }
};

export const loginWithEmail = async (
  email: string,
  password: string,
  _role?: string
): Promise<AuthResult> => {
  if (!isFirebaseConfigured()) {
    // Demo mode
    saveSession({
      uid: 'demo-' + Date.now(),
      email,
      displayName: 'Demo User',
      photoURL: null,
      phoneNumber: null,
      loginMethod: 'email',
    }, 'demo-token-' + Date.now(), Date.now() + 3600000);
    return { success: true };
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();

    saveSession({
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      phoneNumber: result.user.phoneNumber,
      loginMethod: 'email',
    }, token, Date.now() + 3600000);

    return { success: true, user: result.user };
  } catch (error: unknown) {
    const err = error as { code?: string };
    return { success: false, error: getErrorMessage(err.code || 'unknown') };
  }
};

// ============ GOOGLE AUTH ============

export const loginWithGoogle = async (_role?: string): Promise<AuthResult> => {
  if (!isFirebaseConfigured()) {
    // Demo mode
    saveSession({
      uid: 'demo-google-' + Date.now(),
      email: 'demo@gmail.com',
      displayName: 'Google User',
      photoURL: null,
      phoneNumber: null,
      loginMethod: 'google',
    }, 'demo-token-' + Date.now(), Date.now() + 3600000);
    return { success: true };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();

    saveSession({
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      phoneNumber: result.user.phoneNumber,
      loginMethod: 'google',
    }, token, Date.now() + 3600000);

    return { success: true, user: result.user };
  } catch (error: unknown) {
    const err = error as { code?: string };
    return { success: false, error: getErrorMessage(err.code || 'unknown') };
  }
};

// ============ PHONE AUTH ============

export const sendPhoneOTP = async (
  phoneNumber: string,
  _containerId?: string
): Promise<AuthResult> => {
  if (!isFirebaseConfigured()) {
    // Demo mode — fake OTP sent
    confirmationResult = null;
    return { success: true };
  }

  try {
    if (!recaptchaVerifier) {
      return { success: false, error: 'Please solve the reCAPTCHA checkbox first, then click Send OTP.' };
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    return { success: true };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // Reset reCAPTCHA on error
    cleanupRecaptcha();
    return { success: false, error: getPhoneErrorMessage(err.code || 'unknown', err.message) };
  }
};

export const verifyPhoneOTP = async (
  otp: string,
  _role?: string
): Promise<AuthResult> => {
  if (!isFirebaseConfigured()) {
    // Demo mode — accept 123456
    if (otp === '123456') {
      saveSession({
        uid: 'demo-phone-' + Date.now(),
        email: null,
        displayName: 'Phone User',
        photoURL: null,
        phoneNumber: '+91 98765 43210',
        loginMethod: 'phone',
      }, 'demo-token-' + Date.now(), Date.now() + 3600000);
      return { success: true };
    }
    return { success: false, error: 'Invalid OTP. In demo mode, use 123456.' };
  }

  try {
    if (!confirmationResult) {
      return { success: false, error: 'No OTP was sent. Please request OTP again.' };
    }

    const result = await confirmationResult.confirm(otp);
    const token = await result.user.getIdToken();

    saveSession({
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      phoneNumber: result.user.phoneNumber,
      loginMethod: 'phone',
    }, token, Date.now() + 3600000);

    confirmationResult = null;
    return { success: true, user: result.user };
  } catch (error: unknown) {
    const err = error as { code?: string };
    return { success: false, error: getErrorMessage(err.code || 'unknown') };
  }
};

// ============ PASSWORD RESET ============

export const resetPassword = async (email: string): Promise<AuthResult> => {
  if (!isFirebaseConfigured()) {
    return { success: true };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: unknown) {
    const err = error as { code?: string };
    return { success: false, error: getErrorMessage(err.code || 'unknown') };
  }
};

// ============ LOGOUT ============

export const logout = async (): Promise<void> => {
  cleanupRecaptcha();
  confirmationResult = null;
  clearSession();

  if (isFirebaseConfigured()) {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
};

// ============ GET TOKEN ============

export const getUserToken = async (): Promise<string | null> => {
  if (!isFirebaseConfigured()) return null;
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken(true);
  } catch {
    return null;
  }
};

// ============ ERROR MESSAGES ============

const getPhoneErrorMessage = (code: string, message?: string): string => {
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again later or use email login.';
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed. Please refresh and try again.';
    case 'auth/missing-phone-number':
      return 'Please enter your phone number.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      if (message?.includes('reCAPTCHA')) {
        return 'Please solve the reCAPTCHA first, then click Send OTP.';
      }
      return message || 'Failed to send OTP. Please try again.';
  }
};

const getErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please login instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please register first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes.';
    case 'auth/popup-closed-by-user':
      return 'Login popup was closed. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup blocked by browser. Please allow popups and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.';
    case 'auth/invalid-verification-code':
      return 'Invalid OTP. Please check and try again.';
    case 'auth/code-expired':
      return 'OTP has expired. Please request a new one.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    default:
      return 'Something went wrong. Please try again.';
  }
};
