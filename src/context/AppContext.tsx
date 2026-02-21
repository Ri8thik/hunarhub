// ============================================================
// 🏗️ APP CONTEXT — State Management with Firebase + Firestore
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { type UserRole, type Order, type OrderStatus, type Artist, type Category } from '@/types';
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
import { isFirebaseConfigured, db } from '@/config/firebase';
import {
  getArtists,
  getCategories,
  getOrders,
  subscribeToArtists,
  subscribeToCategories,
  subscribeToOrders,
  createOrder as firestoreCreateOrder,
  updateOrderStatus as firestoreUpdateOrderStatus,
  checkIsArtist,
  type CreateOrderData,
} from '@/services/firestoreService';

import { doc, getDoc, setDoc } from 'firebase/firestore'

interface AppState {
  isLoggedIn: boolean;
  isLoading: boolean;
  userRole: UserRole;
  isArtist: boolean;
  artistChecked: boolean;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  sessionData: SessionUserData | null;
  artists: Artist[];
  categories: Category[];
  orders: Order[];
  artistsLoading: boolean;
  categoriesLoading: boolean;
  ordersLoading: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  login: (role: UserRole, userId?: string, userName?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  becomeArtist: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addOrder: (order: Order) => void;
  refreshOrders: () => Promise<void>;
  refreshArtists: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

async function ensureUserInFirestore(uid: string, email: string, name?: string) {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      const displayName = name || email.split('@')[0] || 'User'
      await setDoc(userRef, {
        email: email,
        name: displayName,
        role: 'customer',
        phone: '',
        location: '',
        createdAt: new Date().toISOString()
      })
      console.log('New user created in Firestore:', email)
    } else {
      console.log('User already exists in Firestore:', email)
    }
  } catch (err) {
    console.error('Error ensuring user in Firestore:', err)
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [isArtist, setIsArtist] = useState(false);
  const [artistChecked, setArtistChecked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [sessionData, setSessionData] = useState<SessionUserData | null>(null);
  
  // Data from Firestore
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ---- Dark Mode ----
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hunarhub_dark_mode') === 'true';
    } catch { return false; }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try { localStorage.setItem('hunarhub_dark_mode', String(darkMode)); } catch {}
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);

  // ---- Fetch Artists from Firestore ----
  const fetchArtists = useCallback(async () => {
    setArtistsLoading(true);
    try {
      const data = await getArtists();
      setArtists(data);
      // Update category counts based on fresh artist list
      setCategories(prev =>
        prev.map(cat => ({
          ...cat,
          count: data.filter(a => Array.isArray(a.skills) && a.skills.includes(cat.name)).length,
        }))
      );
    } catch (error) {
      console.error('[AppContext] Error fetching artists:', error);
    } finally {
      setArtistsLoading(false);
    }
  }, []);

  // ---- Fetch Categories from Firestore ----
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const data = await getCategories();
      // Store raw categories first; counts will be filled in by fetchArtists
      setCategories(data);
    } catch (error) {
      console.error('[AppContext] Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // ---- Fetch Orders from Firestore ----
  const fetchOrders = useCallback(async (userId: string, role: UserRole) => {
    setOrdersLoading(true);
    try {
      const data = await getOrders(userId, role);
      setOrders(data);
    } catch (error) {
      console.error('[AppContext] Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // ---- Check if user has artist profile in Firestore DB ----
  const checkArtistStatusFromDB = useCallback(async (userId: string) => {
    console.log('[AppContext] 🔍 Checking artist status from Firestore for:', userId);
    setArtistChecked(false);
    try {
      const result = await checkIsArtist(userId);
      console.log('[AppContext] Artist status from DB:', result);
      setIsArtist(result);
      
      // Save to sessionStorage for quick access on page refresh
      sessionStorage.setItem('hunarhub_is_artist', String(result));
      
      // If user was previously in artist mode and is still an artist, keep artist mode
      const savedRole = getUserRole();
      if (result && savedRole === 'artist') {
        setUserRole('artist');
      }
    } catch (error) {
      console.error('[AppContext] Error checking artist status:', error);
      setIsArtist(false);
    } finally {
      setArtistChecked(true);
    }
  }, []);

  // ---- Real-time listeners for artists & categories ----
  // These fire immediately and update automatically whenever Firestore changes
  useEffect(() => {
    setArtistsLoading(true);
    setCategoriesLoading(true);

    // Subscribe to artists - updates ratings, review counts, etc. in real-time
    const unsubArtists = subscribeToArtists((data) => {
      setArtists(data);
      // Recompute category counts live from fresh artist data
      setCategories(prev =>
        prev.map(cat => ({
          ...cat,
          count: data.filter(a => Array.isArray(a.skills) && a.skills.includes(cat.name)).length,
        }))
      );
      setArtistsLoading(false);
    });

    // Subscribe to categories
    const unsubCategories = subscribeToCategories((data) => {
      // Merge with current artist state for correct counts
      setArtists(currentArtists => {
        setCategories(
          data.map(cat => ({
            ...cat,
            count: currentArtists.filter(a => Array.isArray(a.skills) && a.skills.includes(cat.name)).length,
          }))
        );
        return currentArtists;
      });
      setCategoriesLoading(false);
    });

    // Cleanup listeners when component unmounts
    return () => {
      unsubArtists();
      unsubCategories();
    };
  }, []);

  // ---- Restore Session on Mount ----
  useEffect(() => {
    async function checkSession() {
      try {
        if (isSessionValid()) {
          const userData = getUserData();
          const role = getUserRole();
          
          if (userData && role) {
            setIsLoggedIn(true);
            setUserRole(role);
            setCurrentUserId(userData.uid);
            setCurrentUserName(userData.displayName || 'User');
            setCurrentUserEmail(userData.email || '');
            setSessionData(userData);
            
            await restoreSession();
            // Ensure user exists in Firestore DB
            await ensureUserInFirestore(userData.uid, userData.email || '', userData.displayName || 'User');
            fetchOrders(userData.uid, role);
            // Check artist status from Firestore DB
            await checkArtistStatusFromDB(userData.uid);
          }
        }
      } catch (error) {
        console.error('[AppContext] Session restore error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkSession();
  }, [fetchOrders, checkArtistStatusFromDB]);

  // ---- Listen for Firebase Auth State Changes ----
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const unsubscribe = onAuthChange((user) => {
      if (user) {
        const role = getUserRole() || 'customer';
        setIsLoggedIn(true);
        setCurrentUserId(user.uid);
        setCurrentUserName(user.displayName || 'User');
        setCurrentUserEmail(user.email || '');
        setUserRole(role);
        
        // Ensure user exists in Firestore DB
        ensureUserInFirestore(user.uid, user.email || '', user.displayName || 'User');
        
        fetchOrders(user.uid, role);
        
        // Check artist status from Firestore DB on auth change
        checkArtistStatusFromDB(user.uid);
      } else if (!isSessionValid()) {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [fetchOrders, checkArtistStatusFromDB]);

  // ---- Real-time orders listener — activates once we know who the user is ----
  useEffect(() => {
    if (!currentUserId || !isLoggedIn) return;

    setOrdersLoading(true);
    const unsubOrders = subscribeToOrders(currentUserId, userRole, (data) => {
      setOrders(data as unknown as Order[]);
      setOrdersLoading(false);
    });

    return () => unsubOrders();
  }, [currentUserId, userRole, isLoggedIn]);


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

  // ---- Login (everyone starts as customer) ----
  const login = useCallback((role: UserRole, userId?: string, userName?: string) => {
    setIsLoggedIn(true);
    setUserRole('customer'); // Always start as customer
    
    const userData = getUserData();
    
    if (userData) {
      setCurrentUserId(userData.uid);
      setCurrentUserName(userData.displayName || 'User');
      setCurrentUserEmail(userData.email || '');
      setSessionData(userData);
      
      // Ensure user exists in Firestore DB
      ensureUserInFirestore(userData.uid, userData.email || '', userData.displayName || 'User');
      
      fetchOrders(userData.uid, 'customer');
      
      // Check artist status from Firestore DB
      checkArtistStatusFromDB(userData.uid);
    } else {
      const id = userId || 'guest';
      const name = userName || 'User';
      setCurrentUserId(id);
      setCurrentUserName(name);
      fetchOrders(id, role);
    }
  }, [fetchOrders, checkArtistStatusFromDB]);

  // ---- Logout ----
  const logout = useCallback(async () => {
    await authLogout();
    setIsLoggedIn(false);
    setSessionData(null);
    setCurrentUserId('');
    setCurrentUserName('');
    setCurrentUserEmail('');
    setUserRole('customer');
    setIsArtist(false);
    setArtistChecked(false);
    setOrders([]);
    sessionStorage.removeItem('hunarhub_is_artist');
  }, []);

  // ---- Switch Role (only if user is an artist from DB) ----
  const switchRole = useCallback((role: UserRole) => {
    // Only allow switching to artist if isArtist is true (confirmed from DB)
    if (role === 'artist' && !isArtist) {
      console.warn('[AppContext] Cannot switch to artist — no artist profile in DB');
      return;
    }
    
    setUserRole(role);
    updateUserRole(role);
    
    const userData = getUserData();
    if (userData) {
      fetchOrders(userData.uid, role);
    }
  }, [isArtist, fetchOrders]);

  // ---- Become an Artist (after creating profile in ArtistSetupPage) ----
  const becomeArtist = useCallback(() => {
    setIsArtist(true);
    setArtistChecked(true);
    setUserRole('artist');
    updateUserRole('artist');
    sessionStorage.setItem('hunarhub_is_artist', 'true');
    // No need to manually refresh artists — the real-time listener picks up the new artist doc automatically
  }, []);

  // ---- Order Management ----
  const updateOrderStatusFn = useCallback(async (orderId: string, status: OrderStatus) => {
    // 1. Optimistically update the order in local state
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString().split('T')[0] } : o
    ));

    // 2. If completing, also optimistically increment completedOrders in local artists state
    if (status === 'completed') {
      const order = orders.find(o => o.id === orderId);
      if (order?.artistId) {
        setArtists(prev => prev.map(a =>
          a.id === order.artistId
            ? { ...a, completedOrders: (a.completedOrders || 0) + 1 }
            : a
        ));
      }
    }

    try {
      // 3. Persist to Firestore (also updates artist doc atomically)
      await firestoreUpdateOrderStatus(orderId, status);
    } catch (error) {
      console.error('[AppContext] Error updating order status in Firestore:', error);
    }
  }, [orders]);

  const addOrder = useCallback(async (order: Order) => {
    setOrders(prev => [order, ...prev]);
    try {
      const orderData: CreateOrderData = {
        customerId: order.customerId,
        customerName: order.customerName,
        artistId: order.artistId,
        artistName: order.artistName,
        title: order.title,
        description: order.description,
        referenceImages: order.referenceImages,
        budget: order.budget,
        deadline: order.deadline,
        category: order.category,
      };
      await firestoreCreateOrder(orderData);
    } catch (error) {
      console.error('[AppContext] Error creating order in Firestore:', error);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    const userId = currentUserId;
    const role = userRole;
    if (userId) {
      await fetchOrders(userId, role);
    }
  }, [currentUserId, userRole, fetchOrders]);

  const refreshArtists = useCallback(async () => {
    // Artists are kept in sync via real-time onSnapshot listener — no manual refresh needed
  }, []);

  return (
    <AppContext.Provider value={{
      isLoggedIn, isLoading, userRole, isArtist, artistChecked,
      currentUserId, currentUserName, currentUserEmail,
      sessionData, artists, categories, orders,
      artistsLoading, categoriesLoading, ordersLoading,
      darkMode, toggleDarkMode,
      login, logout, switchRole, becomeArtist,
      updateOrderStatus: updateOrderStatusFn, addOrder,
      refreshOrders, refreshArtists,
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