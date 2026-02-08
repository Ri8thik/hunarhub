// ============================================================
// 🔐 SESSION MANAGER
// ============================================================
// Handles:
// - Session storage for login state
// - JWT token storage & retrieval
// - Token expiration checking
// - Auto refresh token logic
// - Session cleanup on logout
// ============================================================

import { auth } from '@/config/firebase';
import { type UserRole } from '@/types';

// ---- Storage Keys ----
const KEYS = {
  ACCESS_TOKEN: 'hunarhub_access_token',
  REFRESH_TOKEN: 'hunarhub_refresh_token',
  TOKEN_EXPIRY: 'hunarhub_token_expiry',
  USER_DATA: 'hunarhub_user_data',
  USER_ROLE: 'hunarhub_user_role',
  SESSION_ID: 'hunarhub_session_id',
  LAST_ACTIVITY: 'hunarhub_last_activity',
} as const;

// ---- Token Expiration Config ----
const TOKEN_CONFIG = {
  ACCESS_TOKEN_DURATION: 60 * 60 * 1000,        // 1 hour in ms
  REFRESH_THRESHOLD: 5 * 60 * 1000,             // Refresh 5 min before expiry
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000,         // 24 hours session timeout
  ACTIVITY_CHECK_INTERVAL: 60 * 1000,           // Check every 1 minute
} as const;

// ---- User Session Data ----
export interface SessionUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  role: UserRole;
  loginMethod: 'email' | 'phone' | 'google';
  loginTimestamp: number;
}

// ---- Generate Session ID ----
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// ============================================================
// SESSION STORAGE OPERATIONS
// ============================================================

/** Save tokens to session storage */
export function saveTokens(accessToken: string, refreshToken: string, expiryMs?: number): void {
  const expiry = Date.now() + (expiryMs || TOKEN_CONFIG.ACCESS_TOKEN_DURATION);
  
  sessionStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
  sessionStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  sessionStorage.setItem(KEYS.TOKEN_EXPIRY, String(expiry));
  sessionStorage.setItem(KEYS.LAST_ACTIVITY, String(Date.now()));
  
  // Also save to localStorage for persistence across tabs
  localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
}

/** Get access token from session storage */
export function getAccessToken(): string | null {
  return sessionStorage.getItem(KEYS.ACCESS_TOKEN);
}

/** Get refresh token */
export function getRefreshToken(): string | null {
  return sessionStorage.getItem(KEYS.REFRESH_TOKEN) || localStorage.getItem(KEYS.REFRESH_TOKEN);
}

/** Get token expiry timestamp */
export function getTokenExpiry(): number {
  const expiry = sessionStorage.getItem(KEYS.TOKEN_EXPIRY);
  return expiry ? Number(expiry) : 0;
}

/** Check if access token is expired */
export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  return Date.now() >= expiry;
}

/** Check if token needs refresh (within threshold) */
export function shouldRefreshToken(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  return (expiry - Date.now()) <= TOKEN_CONFIG.REFRESH_THRESHOLD;
}

/** Save user data to session storage */
export function saveUserData(userData: SessionUserData): void {
  sessionStorage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
  sessionStorage.setItem(KEYS.USER_ROLE, userData.role);
  
  // Generate session ID if not exists
  if (!sessionStorage.getItem(KEYS.SESSION_ID)) {
    sessionStorage.setItem(KEYS.SESSION_ID, generateSessionId());
  }
}

/** Get user data from session storage */
export function getUserData(): SessionUserData | null {
  const data = sessionStorage.getItem(KEYS.USER_DATA);
  if (!data) return null;
  try {
    return JSON.parse(data) as SessionUserData;
  } catch {
    return null;
  }
}

/** Get user role from session storage */
export function getUserRole(): UserRole | null {
  const role = sessionStorage.getItem(KEYS.USER_ROLE);
  return (role === 'artist' || role === 'customer') ? role : null;
}

/** Update user role in session */
export function updateUserRole(role: UserRole): void {
  sessionStorage.setItem(KEYS.USER_ROLE, role);
  const userData = getUserData();
  if (userData) {
    userData.role = role;
    sessionStorage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
  }
}

/** Get session ID */
export function getSessionId(): string | null {
  return sessionStorage.getItem(KEYS.SESSION_ID);
}

/** Update last activity timestamp */
export function updateLastActivity(): void {
  sessionStorage.setItem(KEYS.LAST_ACTIVITY, String(Date.now()));
}

/** Check if session has timed out due to inactivity */
export function isSessionTimedOut(): boolean {
  const lastActivity = sessionStorage.getItem(KEYS.LAST_ACTIVITY);
  if (!lastActivity) return true;
  return (Date.now() - Number(lastActivity)) > TOKEN_CONFIG.SESSION_TIMEOUT;
}

/** Check if user is logged in (has valid session) */
export function isSessionValid(): boolean {
  const token = getAccessToken();
  const userData = getUserData();
  
  if (!token || !userData) return false;
  if (isSessionTimedOut()) return false;
  
  return true;
}

// ============================================================
// TOKEN REFRESH LOGIC
// ============================================================

let refreshTimer: ReturnType<typeof setInterval> | null = null;

/** Refresh the Firebase ID token */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('[SessionManager] No authenticated user for token refresh');
      clearSession();
      return null;
    }

    // Force refresh the Firebase ID token
    const newToken = await user.getIdToken(true);
    const tokenResult = await user.getIdTokenResult();
    
    // Calculate expiry from token
    const expiryMs = new Date(tokenResult.expirationTime).getTime() - Date.now();
    
    // Save new tokens
    saveTokens(newToken, user.refreshToken, expiryMs);
    
    console.log('[SessionManager] Token refreshed successfully. Expires in:', Math.round(expiryMs / 60000), 'minutes');
    
    return newToken;
  } catch (error) {
    console.error('[SessionManager] Token refresh failed:', error);
    clearSession();
    return null;
  }
}

/** Start automatic token refresh timer */
export function startTokenRefreshTimer(): void {
  // Clear existing timer
  stopTokenRefreshTimer();
  
  // Check every minute if token needs refresh
  refreshTimer = setInterval(async () => {
    updateLastActivity(); // Track activity
    
    if (shouldRefreshToken()) {
      console.log('[SessionManager] Token expiring soon, refreshing...');
      const newToken = await refreshAccessToken();
      
      if (!newToken) {
        console.error('[SessionManager] Auto-refresh failed. Session expired.');
        stopTokenRefreshTimer();
        // Dispatch event for UI to handle
        window.dispatchEvent(new CustomEvent('session-expired'));
      }
    }
    
    // Check session timeout
    if (isSessionTimedOut()) {
      console.log('[SessionManager] Session timed out due to inactivity');
      clearSession();
      stopTokenRefreshTimer();
      window.dispatchEvent(new CustomEvent('session-expired'));
    }
  }, TOKEN_CONFIG.ACTIVITY_CHECK_INTERVAL);
  
  console.log('[SessionManager] Token refresh timer started');
}

/** Stop the automatic token refresh timer */
export function stopTokenRefreshTimer(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    console.log('[SessionManager] Token refresh timer stopped');
  }
}

// ============================================================
// SESSION LIFECYCLE
// ============================================================

/** Initialize a new session after login */
export async function initSession(
  role: UserRole,
  loginMethod: 'email' | 'phone' | 'google'
): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('[SessionManager] No user to initialize session');
      return false;
    }

    // Get Firebase ID token (acts as our JWT)
    const tokenResult = await user.getIdTokenResult();
    const expiryMs = new Date(tokenResult.expirationTime).getTime() - Date.now();
    
    // Save tokens
    saveTokens(tokenResult.token, user.refreshToken, expiryMs);
    
    // Save user data
    const userData: SessionUserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      role,
      loginMethod,
      loginTimestamp: Date.now(),
    };
    saveUserData(userData);
    
    // Start auto-refresh timer
    startTokenRefreshTimer();
    
    console.log('[SessionManager] Session initialized for:', user.email || user.phoneNumber);
    console.log('[SessionManager] Token expires in:', Math.round(expiryMs / 60000), 'minutes');
    
    return true;
  } catch (error) {
    console.error('[SessionManager] Session initialization failed:', error);
    return false;
  }
}

/** Restore session on app load (page refresh) */
export async function restoreSession(): Promise<boolean> {
  // Check if we have session data
  if (!isSessionValid()) {
    console.log('[SessionManager] No valid session found');
    clearSession();
    return false;
  }
  
  // If token is expired but we have refresh token, try refresh
  if (isTokenExpired()) {
    console.log('[SessionManager] Token expired, attempting refresh...');
    const newToken = await refreshAccessToken();
    if (!newToken) {
      console.log('[SessionManager] Could not restore session');
      clearSession();
      return false;
    }
  }
  
  // Start refresh timer
  startTokenRefreshTimer();
  
  console.log('[SessionManager] Session restored successfully');
  return true;
}

/** Clear all session data (logout) */
export function clearSession(): void {
  stopTokenRefreshTimer();
  
  // Clear session storage
  Object.values(KEYS).forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  // Clear localStorage refresh token
  localStorage.removeItem(KEYS.REFRESH_TOKEN);
  
  console.log('[SessionManager] Session cleared');
}

/** Get authorization header for API calls */
export function getAuthHeader(): Record<string, string> {
  const token = getAccessToken();
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`,
    'X-Session-Id': getSessionId() || '',
  };
}

// ============================================================
// DEBUG HELPERS
// ============================================================

/** Get session debug info */
export function getSessionDebugInfo(): Record<string, unknown> {
  const expiry = getTokenExpiry();
  const userData = getUserData();
  return {
    hasAccessToken: !!getAccessToken(),
    hasRefreshToken: !!getRefreshToken(),
    tokenExpiry: expiry ? new Date(expiry).toISOString() : 'none',
    timeToExpiry: expiry ? `${Math.round((expiry - Date.now()) / 60000)} minutes` : 'expired',
    isExpired: isTokenExpired(),
    shouldRefresh: shouldRefreshToken(),
    isSessionTimedOut: isSessionTimedOut(),
    sessionId: getSessionId(),
    userRole: getUserRole(),
    userEmail: userData?.email || 'none',
    loginMethod: userData?.loginMethod || 'none',
    loginTime: userData?.loginTimestamp ? new Date(userData.loginTimestamp).toISOString() : 'none',
  };
}
