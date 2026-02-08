// ============================================================
// 🏗️ APP CONTEXT — State Management with Firebase + Session
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { type UserRole, type Order, type OrderStatus } from '@/types';
import { orders as initialOrders } from '@/data/mockData';
import {
  getUserData,
  getUserRole,
  updateUserRole,
  isSessionValid,
  clearSession,
  restoreSession,
  type SessionUserData,
} from '@/services/sessionManager';
import { logout as authLogout, onAuthChange } from '@/services/authService';
import { isFirebaseConfigured } from '@/config/firebase';

interface AppState {
  isLoggedIn: boolean;
  isLoading: boolean;
  userRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  sessionData: SessionUserData | null;
  orders: Order[];
  login: (role: UserRole, userId?: string, userName?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addOrder: (order: Order) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [currentUserId, setCurrentUserId] = useState('c1');
  const [currentUserName, setCurrentUserName] = useState('Amit Kumar');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [sessionData, setSessionData] = useState<SessionUserData | null>(null);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // ---- Restore Session on Mount ----
  useEffect(() => {
    async function checkSession() {
      try {
        // Check session storage first
        if (isSessionValid()) {
          const userData = getUserData();
          const role = getUserRole();
          
          if (userData && role) {
            setIsLoggedIn(true);
            setUserRole(role);
            setCurrentUserId(userData.uid);
            setCurrentUserName(userData.displayName || (role === 'artist' ? 'Priya Sharma' : 'Amit Kumar'));
            setCurrentUserEmail(userData.email || '');
            setSessionData(userData);
            
            // Restore token refresh timer
            await restoreSession();
          }
        }
      } catch (error) {
        console.error('[AppContext] Session restore error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkSession();
  }, []);

  // ---- Listen for Firebase Auth State Changes ----
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const unsubscribe = onAuthChange((user) => {
      if (user) {
        // User is signed in via Firebase
        const role = getUserRole() || 'customer';
        setIsLoggedIn(true);
        setCurrentUserId(user.uid);
        setCurrentUserName(user.displayName || 'User');
        setCurrentUserEmail(user.email || '');
        setUserRole(role);
      } else if (!isSessionValid()) {
        // User is signed out and no valid session
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // ---- Listen for Session Expiry Events ----
  useEffect(() => {
    function handleSessionExpired() {
      console.warn('[AppContext] Session expired event received');
      setIsLoggedIn(false);
      setSessionData(null);
      clearSession();
    }

    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  // ---- Login ----
  const login = useCallback((role: UserRole, userId?: string, userName?: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    
    // Get data from session if available
    const userData = getUserData();
    
    if (userData) {
      setCurrentUserId(userData.uid);
      setCurrentUserName(userData.displayName || (role === 'artist' ? 'Priya Sharma' : 'Amit Kumar'));
      setCurrentUserEmail(userData.email || '');
      setSessionData(userData);
    } else {
      // Fallback for mock mode
      const id = userId || (role === 'artist' ? 'a1' : 'c1');
      const name = userName || (role === 'artist' ? 'Priya Sharma' : 'Amit Kumar');
      setCurrentUserId(id);
      setCurrentUserName(name);
    }
  }, []);

  // ---- Logout ----
  const logout = useCallback(async () => {
    await authLogout();
    setIsLoggedIn(false);
    setSessionData(null);
    setCurrentUserId('');
    setCurrentUserName('');
    setCurrentUserEmail('');
  }, []);

  // ---- Switch Role ----
  const switchRole = useCallback((role: UserRole) => {
    setUserRole(role);
    updateUserRole(role);
    
    // Update user identity based on role (for mock mode)
    if (!isFirebaseConfigured()) {
      if (role === 'artist') {
        setCurrentUserId('a1');
        setCurrentUserName('Priya Sharma');
      } else {
        setCurrentUserId('c1');
        setCurrentUserName('Amit Kumar');
      }
    }
  }, []);

  // ---- Order Management ----
  const updateOrderStatusFn = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString().split('T')[0] } : o
    ));
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{
      isLoggedIn, isLoading, userRole, currentUserId, currentUserName, currentUserEmail,
      sessionData, orders, login, logout, switchRole,
      updateOrderStatus: updateOrderStatusFn, addOrder,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
