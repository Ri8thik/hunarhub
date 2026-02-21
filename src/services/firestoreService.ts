// ============================================================
// 🗄️ FIRESTORE SERVICE — ALL DATA FROM FIREBASE ONLY
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
import { type UserRole, type OrderStatus, type Artist, type Category, type Order, type Review } from '@/types';

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

export async function createUserProfile(uid: string, data: UserProfileData): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('[Firestore] Firebase not configured');
    return;
  }
  try {
    await setDoc(doc(db, 'users', uid), {
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

export async function getUserProfile(uid: string): Promise<(UserProfileData & { uid: string }) | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() } as UserProfileData & { uid: string };
    }
    return null;
  } catch (error) {
    console.error('[Firestore] Error getting user profile:', error);
    return null;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfileData>): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Firestore] Error updating user profile:', error);
    throw error;
  }
}

// ============================================================
// ARTISTS — FROM FIREBASE ONLY
// ============================================================

export async function getArtists(): Promise<Artist[]> {
  if (!isFirebaseConfigured()) {
    console.warn('[Firestore] Firebase not configured — returning empty array');
    return [];
  }
  try {
    const snapshot = await getDocs(collection(db, 'artists'));
    const artists = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as unknown as Artist[];
    console.log('[Firestore] Fetched artists from DB:', artists.length);
    return artists;
  } catch (error) {
    console.error('[Firestore] Error fetching artists:', error);
    return [];
  }
}

export async function getFeaturedArtists(): Promise<Artist[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const q = query(collection(db, 'artists'), where('featured', '==', true), limit(6));
    const snapshot = await getDocs(q);
    const artists = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as unknown as Artist[];
    return artists;
  } catch (error) {
    console.error('[Firestore] Error fetching featured artists:', error);
    return [];
  }
}

export async function addArtist(artistData: Record<string, unknown>): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('[Firestore] Firebase not configured');
    return;
  }
  try {
    const artistId = artistData.id as string || `artist-${Date.now()}`;
    await setDoc(doc(db, 'artists', artistId), {
      ...artistData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('[Firestore] Artist profile created:', artistId);
  } catch (error) {
    console.error('[Firestore] Error creating artist profile:', error);
    throw error;
  }
}

export async function getArtistById(artistId: string): Promise<Artist | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const docSnap = await getDoc(doc(db, 'artists', artistId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as Artist;
    }
    return null;
  } catch (error) {
    console.error('[Firestore] Error fetching artist:', error);
    return null;
  }
}

// ============================================================
// CATEGORIES — FROM FIREBASE ONLY
// ============================================================

export async function getCategories(): Promise<Category[]> {
  if (!isFirebaseConfigured()) {
    console.warn('[Firestore] Firebase not configured — returning empty array');
    return [];
  }
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    const categories = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as unknown as Category[];
    console.log('[Firestore] Fetched categories from DB:', categories.length);
    return categories;
  } catch (error) {
    console.error('[Firestore] Error fetching categories:', error);
    return [];
  }
}

// ============================================================
// ORDERS — FROM FIREBASE ONLY
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

export async function createOrder(data: CreateOrderData): Promise<string> {
  if (!isFirebaseConfigured()) {
    console.log('[Firestore] Firebase not configured');
    return `o${Date.now()}`;
  }
  try {
    const orderData = {
      ...data,
      status: 'requested' as OrderStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    console.log('[Firestore] Order created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Error creating order:', error);
    throw error;
  }
}

export async function getOrders(userId: string, role: UserRole): Promise<Order[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const field = role === 'customer' ? 'customerId' : 'artistId';
    const q = query(collection(db, 'orders'), where(field, '==', userId));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as unknown as Order[];
    console.log('[Firestore] Fetched orders from DB:', orders.length);
    return orders;
  } catch (error) {
    console.error('[Firestore] Error fetching orders:', error);
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const docSnap = await getDoc(doc(db, 'orders', orderId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as Order;
    }
    return null;
  } catch (error) {
    console.error('[Firestore] Error fetching order:', error);
    return null;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Firestore] Error updating order status:', error);
    throw error;
  }
}

export function subscribeToOrders(
  userId: string,
  role: UserRole,
  callback: (orders: DocumentData[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    callback([]);
    return () => {};
  }
  const field = role === 'customer' ? 'customerId' : 'artistId';
  const q = query(collection(db, 'orders'), where(field, '==', userId));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

// ============================================================
// REVIEWS — FROM FIREBASE ONLY
// ============================================================

export interface CreateReviewData {
  orderId: string;
  customerId: string;
  customerName: string;
  artistId: string;
  rating: number;
  comment: string;
}

export async function createReview(data: CreateReviewData): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await addDoc(collection(db, 'reviews'), {
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

export async function getArtistReviews(artistId: string): Promise<Review[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const q = query(collection(db, 'reviews'), where('artistId', '==', artistId));
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as unknown as Review[];
    console.log('[Firestore] Fetched reviews for artist:', artistId, reviews.length);
    return reviews;
  } catch (error) {
    console.error('[Firestore] Error fetching reviews:', error);
    return [];
  }
}

/**
 * Recalculates and persists the average rating + review count for an artist.
 * Call this every time a new review is submitted.
 */
export async function updateArtistRating(
  artistId: string,
  allReviews: { rating: number }[]
): Promise<{ newRating: number; newCount: number }> {
  const newCount = allReviews.length;
  const newRating =
    newCount > 0
      ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / newCount) * 10) / 10
      : 0;

  if (isFirebaseConfigured()) {
    try {
      await updateDoc(doc(db, 'artists', artistId), {
        rating: newRating,
        reviewCount: newCount,
        updatedAt: serverTimestamp(),
      });
      console.log(`[Firestore] ✅ Artist ${artistId} rating updated → ${newRating} (${newCount} reviews)`);
    } catch (error) {
      console.error('[Firestore] Error updating artist rating:', error);
      throw error;
    }
  }
  return { newRating, newCount };
}

// ============================================================
// CHAT / MESSAGES — FROM FIREBASE ONLY
// ============================================================

export interface ChatThread {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  orderId?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image';
  read: boolean;
  createdAt: string;
}

export async function getChatThreads(userId: string): Promise<ChatThread[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const q = query(collection(db, 'chatThreads'), where('participants', 'array-contains', userId));
    const snapshot = await getDocs(q);
    const threads = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as unknown as ChatThread[];
    return threads;
  } catch (error) {
    console.error('[Firestore] Error fetching chat threads:', error);
    return [];
  }
}

export async function getChatMessages(threadId: string): Promise<ChatMessage[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const q = query(collection(db, 'messages'), where('threadId', '==', threadId), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as unknown as ChatMessage[];
    return messages;
  } catch (error) {
    console.error('[Firestore] Error fetching messages:', error);
    return [];
  }
}

export async function sendMessage(
  threadId: string,
  senderId: string,
  receiverId: string,
  content: string,
  type: 'text' | 'image' = 'text'
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    await addDoc(collection(db, 'messages'), {
      threadId, senderId, receiverId, content, type, read: false,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'chatThreads', threadId), {
      lastMessage: content,
      lastMessageTime: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Firestore] Error sending message:', error);
    throw error;
  }
}

export function subscribeToMessages(
  threadId: string,
  callback: (messages: DocumentData[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, 'messages'), where('threadId', '==', threadId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
}

// ============================================================
// NOTIFICATIONS — FROM FIREBASE ONLY
// ============================================================

export async function getNotifications(userId: string) {
  if (!isFirebaseConfigured()) return [];
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('[Firestore] Error fetching notifications:', error);
    return [];
  }
}

// ============================================================
// EARNINGS & TRANSACTIONS — FROM FIREBASE ONLY
// ============================================================

export interface EarningsData {
  artistId: string;
  artistName: string;
  totalEarnings: number;
  thisMonth: number;
  pendingPayout: number;
  completedOrders: number;
  platformFee: number;
}

export interface TransactionData {
  artistId: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  status: 'completed' | 'pending' | 'processing';
  description: string;
}

export async function getArtistEarnings(artistId: string): Promise<EarningsData | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const docSnap = await getDoc(doc(db, 'earnings', artistId));
    if (docSnap.exists()) {
      return { artistId: docSnap.id, ...docSnap.data() } as EarningsData;
    }
    return null;
  } catch (error) {
    console.error('[Firestore] Error fetching artist earnings:', error);
    return null;
  }
}

export async function getAllEarnings(): Promise<EarningsData[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const snapshot = await getDocs(collection(db, 'earnings'));
    return snapshot.docs.map(d => ({ artistId: d.id, ...d.data() })) as EarningsData[];
  } catch (error) {
    console.error('[Firestore] Error fetching all earnings:', error);
    return [];
  }
}

export async function getArtistTransactions(artistId: string): Promise<TransactionData[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const q = query(collection(db, 'transactions'), where('artistId', '==', artistId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as unknown as TransactionData[];
  } catch (error) {
    console.error('[Firestore] Error fetching transactions:', error);
    return [];
  }
}

export async function getAllTransactions(): Promise<TransactionData[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const snapshot = await getDocs(collection(db, 'transactions'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as unknown as TransactionData[];
  } catch (error) {
    console.error('[Firestore] Error fetching all transactions:', error);
    return [];
  }
}

// ============================================================
// CHECK IF USER IS AN ARTIST — DIRECTLY FROM FIRESTORE
// ============================================================

export async function checkIsArtist(userId: string): Promise<boolean> {
  if (!isFirebaseConfigured()) {
    console.log('[Firestore] Firebase not configured — returning false for isArtist');
    return false;
  }
  try {
    // Method 1: Check if document with userId exists in artists collection
    const docSnap = await getDoc(doc(db, 'artists', userId));
    if (docSnap.exists()) {
      console.log('[Firestore] ✅ Artist profile found for user:', userId);
      return true;
    }

    // Method 2: Query artists collection where userId field matches
    const q = query(collection(db, 'artists'), where('userId', '==', userId), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log('[Firestore] ✅ Artist profile found (by userId field) for user:', userId);
      return true;
    }

    console.log('[Firestore] ❌ No artist profile found for user:', userId);
    return false;
  } catch (error) {
    console.error('[Firestore] Error checking artist status:', error);
    return false;
  }
}

// ============================================================
// ADD REVIEW — SIMPLE FORMAT (used by ArtistProfilePage)
// ============================================================

export async function addReview(reviewData: {
  artistId: string
  customerId: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.log('[Firestore] Demo mode — review not saved')
    return
  }
  try {
    // Check if user is authenticated
    const { getAuth } = await import('firebase/auth')
    const auth = getAuth()
    if (!auth.currentUser) {
      throw new Error('You must be logged in to submit a review. Please logout and login again.')
    }

    await addDoc(collection(db, 'reviews'), {
      artistId: reviewData.artistId,
      customerId: reviewData.customerId,
      customerName: reviewData.customerName,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: reviewData.createdAt,
      customerAvatar: '',
      createdAt: new Date().toISOString(),
    })
    console.log('[Firestore] ✅ Review added for artist:', reviewData.artistId)
  } catch (error) {
    console.error('[Firestore] Error adding review:', error)
    throw error
  }
}

// ============================================================
// API FETCH HELPER
// ============================================================

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('session-expired'));
    throw new Error('Session expired');
  }
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}