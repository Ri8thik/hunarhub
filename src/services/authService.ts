import {
  loginWithEmail as apiLoginWithEmail,
  registerWithEmail as apiRegisterWithEmail,
  logout as apiLogout,
  getUserToken as apiGetUserToken,
} from './apiAuthService';

export type AuthResult = {
  success: boolean;
  error?: string;
  user?: unknown;
};

export const onAuthChange = (_callback: (user: { uid: string; displayName?: string | null; email?: string | null } | null) => void) => {
  // Legacy Firebase listener removed.
  return () => {};
};

export const initRecaptcha = (_containerId: string): void => {
  // Phone auth is not used in the current API flow.
};

export const cleanupRecaptcha = (): void => {
  // No-op.
};

export const registerWithEmail = async (
  email: string,
  password: string,
  name?: string,
): Promise<AuthResult> => {
  return apiRegisterWithEmail(email, password, name || 'User');
};

export const loginWithEmail = async (
  email: string,
  password: string,
  _role?: string
): Promise<AuthResult> => {
  return apiLoginWithEmail(email, password);
};

export const loginWithGoogle = async (_role?: string): Promise<AuthResult> => {
  // Google auth is not configured in the backend yet.
  return { success: false, error: 'Google login is coming soon. Please use email login.' };
};

export const sendPhoneOTP = async (): Promise<AuthResult> => {
  return { success: false, error: 'Phone login is not configured yet.' };
};

export const verifyPhoneOTP = async (): Promise<AuthResult> => {
  return { success: false, error: 'Phone login is not configured yet.' };
};

export const resetPassword = async (email: string): Promise<AuthResult> => {
  void email;
  return { success: false, error: 'Password reset is not configured yet.' };
};

export const logout = async (): Promise<void> => {
  await apiLogout();
};

export const getUserToken = (): string | null => {
  return apiGetUserToken();
};
