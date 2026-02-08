// ============================================================
// 🗄️ FIRESTORE SERVICE
// ============================================================
// Handles all Firestore database operations:
// - User profiles (artists & customers)
// - Orders (CRUD + status updates)
// - Reviews
// - Chat messages
// - Portfolio items
// ============================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/config/firebase';
import { getAuthHeader } from '@/services/sessionManager';
import { type UserRole, type OrderStatus } from '@/types';

// Import mock data as fallback
import {
  artists as mockArtists,
  orders as mockOrders,
  reviews as mockReviews,
  categories as mockCategories,
  chatThreads as mockChatThreads,
  chatMessages as mockChatMessages,
} from '@/data/mockData';

// ============================================================
// COLLECTION NAMES
// ============================================================
const COLLECTIONS = {
  USERS: 'users',
  ARTISTS: 'artists',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  MESSAGES: 'messages',
  CHAT_THREADS: 'chatThreads',
  PORTFOLIOS: 'portfolios',
  CATEGORIES: 'categories',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
} as const;

// ============================================================
// USER PROFILES
// ============================================================

export interface UserProfileData {
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  location: string;
  joinedDate: string;
}

/** Create a new user profile */
export async function createUserProfile(uid: string, data: UserProfileData): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('[Firestore] Mock: Create user profile', uid, data);
    return;
  }

  try {
    await setDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('[Firestore] User profile created:', uid);
  } catch (error) {
    console.error('[Firestore] Error creating user profile:', error);
    throw error;
  }
}

/** Get user profile by UID */
export async function getUserProfile(uid: string): Promise<(UserProfileData & { uid: string }) | null> {
  if (!isFirebaseConfigured()) {
    // Return mock artist/customer based on UID
    const artist = mockArtists.find(a => a.id === uid);
    if (artist) {
      return { uid, name: artist.name, email: artist.email, role: 'artist', phone: artist.phone, avatar: '', location: artist.location, joinedDate: artist.joinedDate };
    }
    return null;
  }

  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() } as UserProfileData & { uid: string };
    }
    return null;
  } catch (error) {
    console.error('[Firestore] Error getting user profile:', error);
    return null;
  }
}

/** Update user profile */
export async function updateUserProfile(uid: string, data: Partial<UserProfileData>): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('[Firestore] Mock: Update user profile', uid, data);
    return;
  }

  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Firestore] Error updating user profile:', error);
    throw error;
  }
}

// ============================================================
// ARTISTS
// ============================================================

/** Get all artists */
export async function getArtists(): Promise<typeof mockArtists> {
  if (!isFirebaseConfigured()) {
    return mockArtists;
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('role', '==', 'artist')
    );
    const snapshot = await getDocs(q);
    const artists = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return artists.length > 0 ? artists as unknown as typeof mockArtists : mockArtists;
  } catch (error) {
    console.error('[Firestore] Error fetching artists:', error);
    return mockArtists;
  }
}

/** Get featured artists */
export async function getFeaturedArtists(): Promise<typeof mockArtists> {
  if (!isFirebaseConfigured()) {
    return mockArtists.filter(a => a.featured);
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('role', '==', 'artist'),
      where('featured', '==', true),
      limit(6)
    );
    const snapshot = await getDocs(q);
    const artists = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return artists.length > 0 ? artists as unknown as typeof mockArtists : mockArtists.filter(a => a.featured);
  } catch (error) {
    console.error('[Firestore] Error fetching featured artists:', error);
    return mockArtists.filter(a => a.featured);
  }
}

/** Get artist by ID */
export async function getArtistById(artistId: string): Promise<(typeof mockArtists)[0] | null> {
  if (!isFirebaseConfigured()) {
    return mockArtists.find(a => a.id === artistId) || null;
  }

  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, artistId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as (typeof mockArtists)[0];
    }
    return mockArtists.find(a => a.id === artistId) || null;
  } catch (error) {
    console.error('[Firestore] Error fetching artist:', error);
    return mockArtists.find(a => a.id === artistId) || null;
  }
}

// ============================================================
// CATEGORIES
// ============================================================

/** Get all categories */
export async function getCategories(): Promise<typeof mockCategories> {
  if (!isFirebaseConfigured()) {
    return mockCategories;
  }

  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    const categories = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return categories.length > 0 ? categories as unknown as typeof mockCategories : mockCategories;
  } catch (error) {
    console.error('[Firestore] Error fetching categories:', error);
    return mockCategories;
  }
}

// ============================================================
// ORDERS
// ============================================================

export interface CreateOrderData {
  customerId: string;
  customerName: string;
  artistId: string;
  artistName: string;
  title: string;
  description: string;
  referenceImages: string[];
  budget: number;
  deadline: string;
  category: string;
}

/** Create a new order */
export async function createOrder(data: CreateOrderData): Promise<string> {
  if (!isFirebaseConfigured()) {
    const orderId = `o${Date.now()}`;
    console.log('[Firestore] Mock: Create order', orderId, data);
    return orderId;
  }

  try {
    const orderData = {
      ...data,
      status: 'requested' as OrderStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), orderData);
    console.log('[Firestore] Order created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Error creating order:', error);
    throw error;
  }
}

/** Get orders for a user (customer or artist) */
export async function getOrders(userId: string, role: UserRole): Promise<typeof mockOrders> {
  if (!isFirebaseConfigured()) {
    return role === 'customer'
      ? mockOrders.filter(o => o.customerId === userId)
      : mockOrders.filter(o => o.artistId === userId);
  }

  try {
    const field = role === 'customer' ? 'customerId' : 'artistId';
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (orders.length > 0) {
      return orders as unknown as typeof mockOrders;
    }
    
    // Fallback to mock data
    return role === 'customer'
      ? mockOrders.filter(o => o.customerId === userId)
      : mockOrders.filter(o => o.artistId === userId);
  } catch (error) {
    console.error('[Firestore] Error fetching orders:', error);
    return role === 'customer'
      ? mockOrders.filter(o => o.customerId === userId)
      : mockOrders.filter(o => o.artistId === userId);
  }
}

/** Update order status */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('[Firestore] Mock: Update order status', orderId, status);
    return;
  }

  try {
    await updateDoc(doc(db, COLLECTIONS.ORDERS), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Firestore] Error updating order status:', error);
    throw error;
  }
}

/** Listen to order updates in real-time */
export function subscribeToOrders(
  userId: string,
  role: UserRole,
  callback: (orders: DocumentData[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    // Return mock data immediately
    const orders = role === 'customer'
      ? mockOrders.filter(o => o.customerId === userId)
      : mockOrders.filter(o => o.artistId === userId);
    callback(orders);
    return () => {};
  }

  const field = role === 'customer' ? 'customerId' : 'artistId';
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where(field, '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

// ============================================================
// REVIEWS
// ============================================================

export interface CreateReviewData {
  orderId: string;
  customerId: string;
  customerName: string;
  artistId: string;
  rating: number;
  comment: string;
}

/** Create a review */
export async function createReview(data: CreateReviewData): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('[Firestore] Mock: Create review', data);
    return;
  }

  try {
    await addDoc(collection(db, COLLECTIONS.REVIEWS), {
      ...data,
      customerAvatar: '',
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Firestore] Error creating review:', error);
    throw error;
  }
}

/** Get reviews for an artist */
export async function getArtistReviews(artistId: string): Promise<typeof mockReviews> {
  if (!isFirebaseConfigured()) {
    return mockReviews.filter(r => r.artistId === artistId);
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.REVIEWS),
      where('artistId', '==', artistId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return reviews.length > 0 ? reviews as unknown as typeof mockReviews : mockReviews.filter(r => r.artistId === artistId);
  } catch (error) {
    console.error('[Firestore] Error fetching reviews:', error);
    return mockReviews.filter(r => r.artistId === artistId);
  }
}

// ============================================================
// CHAT / MESSAGES
// ============================================================

/** Get chat threads for a user */
export async function getChatThreads(userId: string): Promise<typeof mockChatThreads> {
  if (!isFirebaseConfigured()) {
    return mockChatThreads;
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.CHAT_THREADS),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );
    const snapshot = await getDocs(q);
    const threads = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return threads.length > 0 ? threads as unknown as typeof mockChatThreads : mockChatThreads;
  } catch (error) {
    console.error('[Firestore] Error fetching chat threads:', error);
    return mockChatThreads;
  }
}

/** Get messages for a chat thread */
export async function getChatMessages(threadId: string): Promise<(typeof mockChatMessages)[string]> {
  if (!isFirebaseConfigured()) {
    return mockChatMessages[threadId] || [];
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('threadId', '==', threadId),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return messages.length > 0 ? messages as unknown as (typeof mockChatMessages)[string] : (mockChatMessages[threadId] || []);
  } catch (error) {
    console.error('[Firestore] Error fetching messages:', error);
    return mockChatMessages[threadId] || [];
  }
}

/** Send a message */
export async function sendMessage(
  threadId: string,
  senderId: string,
  receiverId: string,
  content: string,
  type: 'text' | 'image' = 'text'
): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('[Firestore] Mock: Send message', { threadId, content });
    return;
  }

  try {
    await addDoc(collection(db, COLLECTIONS.MESSAGES), {
      threadId,
      senderId,
      receiverId,
      content,
      type,
      read: false,
      createdAt: serverTimestamp(),
    });

    // Update thread's last message
    await updateDoc(doc(db, COLLECTIONS.CHAT_THREADS, threadId), {
      lastMessage: content,
      lastMessageTime: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Firestore] Error sending message:', error);
    throw error;
  }
}

/** Listen to messages in real-time */
export function subscribeToMessages(
  threadId: string,
  callback: (messages: DocumentData[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    callback(mockChatMessages[threadId] || []);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTIONS.MESSAGES),
    where('threadId', '==', threadId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
}

// ============================================================
// API FETCH HELPER (for custom backend endpoints)
// ============================================================

/** Make an authenticated API call */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired - dispatch event
    window.dispatchEvent(new CustomEvent('session-expired'));
    throw new Error('Session expired');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============================================================
// FIRESTORE SCHEMA REFERENCE (for manual setup)
// ============================================================
/*
 * DATABASE SCHEMA:
 * 
 * users/{uid}
 *   - name: string
 *   - email: string
 *   - phone: string
 *   - role: 'artist' | 'customer'
 *   - avatar: string
 *   - location: string
 *   - joinedDate: string
 *   - (artist only):
 *     - skills: string[]
 *     - bio: string
 *     - priceRange: { min: number, max: number }
 *     - availability: 'available' | 'busy' | 'unavailable'
 *     - rating: number
 *     - reviewCount: number
 *     - completedOrders: number
 *     - responseTime: string
 *     - featured: boolean
 *     - verified: boolean
 *     - earnings: number
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 * 
 * orders/{orderId}
 *   - customerId: string
 *   - customerName: string
 *   - artistId: string
 *   - artistName: string
 *   - title: string
 *   - description: string
 *   - referenceImages: string[]
 *   - budget: number
 *   - deadline: string
 *   - status: OrderStatus
 *   - category: string
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 * 
 * reviews/{reviewId}
 *   - orderId: string
 *   - customerId: string
 *   - customerName: string
 *   - customerAvatar: string
 *   - artistId: string
 *   - rating: number
 *   - comment: string
 *   - date: string
 *   - createdAt: timestamp
 * 
 * chatThreads/{threadId}
 *   - participants: string[]   (array of UIDs)
 *   - participantNames: map
 *   - lastMessage: string
 *   - lastMessageTime: timestamp
 *   - orderId: string (optional)
 * 
 * messages/{messageId}
 *   - threadId: string
 *   - senderId: string
 *   - receiverId: string
 *   - content: string
 *   - type: 'text' | 'image'
 *   - read: boolean
 *   - createdAt: timestamp
 * 
 * payments/{paymentId}
 *   - orderId: string
 *   - payerId: string
 *   - receiverId: string
 *   - amount: number
 *   - platformFee: number
 *   - status: 'pending' | 'held' | 'released' | 'refunded'
 *   - method: 'upi' | 'card' | 'netbanking'
 *   - createdAt: timestamp
 */
