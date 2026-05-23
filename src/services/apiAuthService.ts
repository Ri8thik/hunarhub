/**
 * Authentication Service - Uses Backend API instead of Firebase
 */

import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { saveTokens, saveUserData, clearSession, getUserRole, getRefreshToken, getAccessToken, type SessionUserData } from './sessionManager';

interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'artist' | 'admin';
    avatar?: string;
    phone?: string;
  };
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

const unwrap = <T>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
};

/**
 * Register a new user
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  name: string,
): Promise<AuthResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        displayName: name,
      } as RegisterRequest),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorData = payload as ApiResponse<never> & { message?: string };
      return {
        success: false,
        error: errorData.message || 'Registration failed',
      };
    }

    const data: AuthResponseData = unwrap(payload);

    // Save session tokens and user data
    const expiresIn = (data.expiresIn ?? 86400) * 1000; // backend returns seconds
    saveTokens(data.accessToken, data.refreshToken, expiresIn);
    const userData: SessionUserData = {
      uid: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName,
      photoURL: data.user.avatar || null,
      phoneNumber: data.user.phone || null,
      role: (data.user.role as SessionUserData['role']) || getUserRole() || 'customer',
      loginMethod: 'email',
      loginTimestamp: Date.now(),
    };
    saveUserData(userData);

    console.log('[API Auth] ✅ Registration successful:', data.user.email);
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[API Auth] Registration error:', err);
    return {
      success: false,
      error: err.message || 'Registration failed. Please try again.',
    };
  }
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      } as LoginRequest),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorData = payload as ApiResponse<never> & { message?: string };
      return {
        success: false,
        error: errorData.message || 'Invalid email or password',
      };
    }

    const data: AuthResponseData = unwrap(payload);

    // Save session tokens and user data
    const expiresIn = (data.expiresIn ?? 86400) * 1000;
    saveTokens(data.accessToken, data.refreshToken, expiresIn);
    const userData: SessionUserData = {
      uid: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName,
      photoURL: data.user.avatar || null,
      phoneNumber: data.user.phone || null,
      role: (data.user.role as SessionUserData['role']) || getUserRole() || 'customer',
      loginMethod: 'email',
      loginTimestamp: Date.now(),
    };
    saveUserData(userData);

    console.log('[API Auth] ✅ Login successful:', data.user.email);
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[API Auth] Login error:', err);
    return {
      success: false,
      error: err.message || 'Login failed. Please try again.',
    };
  }
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (): Promise<AuthResult> => {
  try {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      return { success: false, error: 'No refresh token available' };
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      clearSession();
      return { success: false, error: 'Token refresh failed' };
    }

    const data: AuthResponseData = unwrap(payload);

    // Update tokens
    const expiresIn = (data.expiresIn ?? 86400) * 1000;
    saveTokens(data.accessToken, data.refreshToken, expiresIn);

    console.log('[API Auth] ✅ Token refreshed');
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[API Auth] Token refresh error:', err);
    clearSession();
    return { success: false, error: 'Session expired' };
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  try {
    const accessToken = getUserToken();
    if (accessToken) {
      // Notify backend of logout (optional but good practice)
      try {
        await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }).catch(() => {
          // Silently ignore logout endpoint errors
        });
      } catch {
        // Ignore
      }
    }
  } finally {
    clearSession();
    console.log('[API Auth] ✅ Logout successful');
  }
};

/**
 * Get current user token
 */
export const getUserToken = (): string | null => {
  return getAccessToken();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

