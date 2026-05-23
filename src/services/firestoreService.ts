import {
  getArtists as apiGetArtists,
  getFeaturedArtists as apiGetFeaturedArtists,
  getArtistById as apiGetArtistById,
  createArtistProfile as apiCreateArtistProfile,
  getCategories as apiGetCategories,
  getOrders as apiGetOrders,
  getOrderById as apiGetOrderById,
  createOrder as apiCreateOrder,
  updateOrderStatus as apiUpdateOrderStatus,
  createReview as apiCreateReview,
  getArtistReviews as apiGetArtistReviews,
  getArtistEarnings as apiGetArtistEarnings,
  getEarningsLedger,
  getNotifications as apiGetNotifications,
  markNotificationRead as apiMarkNotificationRead,
  markAllNotificationsRead as apiMarkAllNotificationsRead,
  getCurrentUser,
} from './apiDataService';
import type { UserRole, OrderStatus, Artist, Category, Order, Review } from '@/types';
export interface UserProfileData {
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  location: string;
  joinedDate: string;
}
export interface CreateOrderData {
  customerId: string;
  customerName: string;
  customerPhone: string;
  artistId: string;
  artistName: string;
  title: string;
  description: string;
  referenceImages: string[];
  budget: number;
  deadline: string;
  category: string;
}
export interface CreateReviewData {
  orderId?: string;
  customerId: string;
  customerName: string;
  artistId: string;
  rating: number;
  comment: string;
}
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
export type NotificationType = 'order' | 'review' | 'status_update' | 'message' | 'system';
export interface NotificationData {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  relatedId?: string;
  relatedType?: 'order' | 'review' | 'chat';
  forAdmin: boolean;
  createdAt?: unknown;
}
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
const createUnsubscribe = () => () => {};
const poll = <T>(callback: (value: T) => void, fetcher: () => Promise<T>, interval = 5000) => {
  let active = true;
  const run = async () => {
    try {
      const value = await fetcher();
      if (active) callback(value);
    } catch (error) {
      console.error('[API Adapter] Poll error:', error);
      if (active) callback([] as T);
    }
  };
  void run();
  const timer = setInterval(run, interval);
  return () => {
    active = false;
    clearInterval(timer);
  };
};
export async function createUserProfile(uid: string, data: UserProfileData): Promise<void> {
  console.log('[API Adapter] createUserProfile', uid, data.email);
}
export async function getUserProfile(uid: string): Promise<(UserProfileData & { uid: string }) | null> {
  const user = await getCurrentUser();
  if (user && typeof user === 'object') return { uid, ...(user as UserProfileData) };
  return null;
}
export async function updateUserProfile(uid: string, data: Partial<UserProfileData>): Promise<void> {
  console.log('[API Adapter] updateUserProfile', uid, data);
}
export async function getArtists(): Promise<Artist[]> { return apiGetArtists(); }
export async function getFeaturedArtists(): Promise<Artist[]> { return apiGetFeaturedArtists(); }
export async function getArtistById(artistId: string): Promise<Artist | null> { return apiGetArtistById(artistId); }
export async function getCategories(): Promise<Category[]> { return apiGetCategories(); }
export function subscribeToArtists(callback: (artists: Artist[]) => void) { return poll(callback, getArtists); }
export function subscribeToCategories(callback: (categories: Category[]) => void) { return poll(callback, getCategories); }
export async function addArtist(artistData: Record<string, unknown>): Promise<void> {
  await apiCreateArtistProfile(artistData as Record<string, any>);
}
export async function createOrder(data: CreateOrderData): Promise<string> {
  const result = await apiCreateOrder({
    customerId: data.customerId,
    customerName: data.customerName,
    artistId: data.artistId,
    artistName: data.artistName,
    title: data.title,
    description: data.description,
    referenceImages: data.referenceImages,
    budget: data.budget,
    deadline: data.deadline,
    category: data.category,
  });
  return typeof result === 'string' ? result : ((result as { id?: string }).id || `order-${Date.now()}`);
}
export async function getOrders(userId: string, role: UserRole): Promise<Order[]> {
  void userId;
  return apiGetOrders(role);
}
export async function getOrderById(orderId: string): Promise<Order | null> { return apiGetOrderById(orderId); }
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> { await apiUpdateOrderStatus(orderId, status); }
export function subscribeToOrders(userId: string, role: UserRole, callback: (orders: Order[]) => void) { void userId; return poll(callback, () => apiGetOrders(role)); }
export async function createReview(data: CreateReviewData): Promise<void> {
  await apiCreateReview({ orderId: data.orderId, artistId: data.artistId, rating: data.rating, comment: data.comment });
}
export async function getArtistReviews(artistId: string): Promise<Review[]> { return apiGetArtistReviews(artistId); }
export async function updateArtistRating(artistId: string, allReviews: { rating: number }[]): Promise<{ newRating: number; newCount: number }> {
  const newCount = allReviews.length;
  const newRating = newCount > 0 ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / newCount) * 10) / 10 : 0;
  console.log('[API Adapter] updateArtistRating', artistId, newRating, newCount);
  return { newRating, newCount };
}
export async function getChatThreads(_userId: string): Promise<ChatThread[]> { return []; }
export async function getChatMessages(_threadId: string): Promise<ChatMessage[]> { return []; }
export async function sendMessage(_threadId: string, _senderId: string, _receiverId: string, _content: string, _type: 'text' | 'image' = 'text'): Promise<void> { console.log('[API Adapter] sendMessage is not implemented yet'); }
export function subscribeToMessages(_threadId: string, callback: (messages: ChatMessage[]) => void) { callback([]); return createUnsubscribe(); }
export async function createNotification(data: Omit<NotificationData, 'id' | 'read' | 'createdAt'>): Promise<void> { console.log('[API Adapter] createNotification', data.userId, data.title); }
const normalizeNotificationType = (type: string): NotificationType => {
  const normalized = String(type || '').toLowerCase();
  if (normalized.includes('order')) return 'order';
  if (normalized.includes('review')) return 'review';
  if (normalized.includes('message')) return 'message';
  if (normalized.includes('payment')) return 'system';
  return 'system';
};

const mapNotification = (n: any): NotificationData => ({
  id: n.id,
  userId: n.userId || '',
  type: normalizeNotificationType(n.type),
  title: n.title || '',
  body: n.body || '',
  read: Boolean(n.read),
  relatedId: n.relatedOrderId || n.relatedId,
  relatedType: n.relatedOrderId ? 'order' : n.relatedArtistId ? 'chat' : undefined,
  forAdmin: Boolean(n.forAdmin),
  createdAt: n.createdAt || undefined,
});

export async function getNotifications(userId: string): Promise<NotificationData[]> {
  void userId;
  const notifications = await apiGetNotifications();
  return Array.isArray(notifications) ? notifications.map(mapNotification) : [];
}
export function subscribeToNotifications(userId: string, callback: (notifications: NotificationData[]) => void) { void userId; return poll(callback, async () => (await getNotifications(userId))); }
export function subscribeToAdminNotifications(callback: (notifications: NotificationData[]) => void) { return poll(callback, async () => (await getNotifications(''))); }
export async function markNotificationRead(notifId: string): Promise<void> { await apiMarkNotificationRead(notifId); }
export async function markAllNotificationsRead(userId: string): Promise<void> { void userId; await apiMarkAllNotificationsRead(); }
export async function getArtistEarnings(artistId: string): Promise<EarningsData | null> {
  const summary = await apiGetArtistEarnings(artistId);
  if (!summary) return null;

  const data = summary as any;
  return {
    artistId,
    artistName: data.artistName || '',
    totalEarnings: Number(data.totalEarnings || 0),
    thisMonth: Number(data.thisMonth || 0),
    pendingPayout: Number(data.pendingPayout || 0),
    completedOrders: Number(data.completedOrders || 0),
    platformFee: Number(data.platformFee || 0),
  };
}
export async function getAllEarnings(): Promise<EarningsData[]> { return (await getEarningsLedger()) as EarningsData[]; }
export async function getArtistTransactions(artistId: string): Promise<TransactionData[]> {
  const ledger = await getEarningsLedger();
  const items = Array.isArray(ledger) ? ledger : [];

  return items
    .filter((entry: any) => !artistId || !entry?.artistId || entry.artistId === artistId)
    .map((entry: any) => {
      const rawStatus = String(entry?.status || '').toUpperCase();
      const isDebit = rawStatus === 'PAID_OUT';
      const mappedStatus: TransactionData['status'] = rawStatus === 'PENDING'
        ? 'pending'
        : rawStatus === 'PAID_OUT'
          ? 'completed'
          : 'completed';

      return {
        artistId: entry?.artistId || artistId,
        title: entry?.orderTitle ? `Order: ${entry.orderTitle}` : 'Artist Earnings',
        amount: Number(entry?.amount || 0),
        type: isDebit ? 'debit' : 'credit',
        date: entry?.createdAt || '',
        status: mappedStatus,
        description: entry?.orderId ? `Order ID: ${entry.orderId}` : `Earning status: ${rawStatus || 'AVAILABLE'}`,
      };
    });
}
export async function getAllTransactions(): Promise<TransactionData[]> { return []; }
export async function checkIsArtist(userId: string): Promise<boolean> { return !!(await apiGetArtistById(userId)); }
export async function addReview(reviewData: { artistId: string; customerId: string; customerName: string; rating: number; comment: string; createdAt: string; orderId?: string }): Promise<void> {
  // Note: customerId and customerName are derived from the authenticated user on the backend, so we don't need to send them
  await apiCreateReview({
    artistId: reviewData.artistId,
    orderId: reviewData.orderId,  // Optional - can be undefined for standalone reviews
    rating: reviewData.rating,
    comment: reviewData.comment
  });
}
