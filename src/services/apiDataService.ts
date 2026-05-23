/**
 * API Data Service - Replaces Firestore with Backend REST API
 */

import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { getAccessToken, refreshAccessToken, clearSession } from './sessionManager';
import type { Artist, Order, Review, Category } from '@/types';

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
};

const unwrap = <T>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
};

/**
 * Transform backend ArtistProfileDto to frontend Artist type
 */
const mapDtoToArtist = (dto: any): Artist => {
  const location = [dto.locationCity, dto.locationState, dto.locationCountry]
    .filter(Boolean)
    .join(', ');
  const availabilityFromPricingNotes = typeof dto.pricingNotes === 'string' && dto.pricingNotes.toLowerCase().startsWith('availability:')
    ? dto.pricingNotes.split(':').slice(1).join(':').trim().toLowerCase()
    : null;
  const normalizedAvailability = dto.availability || availabilityFromPricingNotes || 'available';

  return {
    id: dto.id,
    name: (dto.displayName || 'Artist').trim() || 'Artist',
    email: dto.email || '',
    phone: '',
    avatar: dto.photoUrl || '',
    location: location || 'India',
    role: 'artist' as const,
    skills: Array.isArray(dto.skills) ? dto.skills : [],
    bio: dto.bio || '',
    portfolio: Array.isArray(dto.portfolio)
      ? dto.portfolio.map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.imageUrl,
          category: item.category,
        }))
      : [],
    priceRange: {
      min: (dto.startingPrice && Number(dto.startingPrice) > 0) ? Number(dto.startingPrice) : 500,
      max: (dto.startingPrice && Number(dto.startingPrice) > 0) ? Number(dto.startingPrice) * 5 : 2500,
    },
    availability: normalizedAvailability === 'busy' || normalizedAvailability === 'unavailable' ? 'busy' : 'available',
    rating: dto.ratingAvg || 0,
    reviewCount: dto.ratingCount || 0,
    completedOrders: 0,
    responseTime: '< 2 hours',
    featured: false,
    verified: false,
    earnings: 0,
    joinedDate: dto.createdAt ? new Date(dto.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
};

/**
 * Extract artists from paginated or direct response
 */
const extractArtistsFromResponse = (data: any): Artist[] => {
  if (!data) return [];

  // If response is a Page object with content array (paginated response)
  if (data.content && Array.isArray(data.content)) {
    return data.content.map(mapDtoToArtist);
  }

  // If response is a direct array
  if (Array.isArray(data)) {
    return data.map(mapDtoToArtist);
  }

  return [];
};

let refreshInFlight: Promise<string | null> | null = null;

const getRefreshedToken = async (): Promise<string | null> => {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
};

/**
 * Helper function to make authenticated API requests
 */
const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retryOnAuthFailure = true,
): Promise<T> => {
  const token = getAccessToken();
  const headers = new Headers(options.headers || undefined);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (retryOnAuthFailure) {
      const refreshedToken = await getRefreshedToken();
      if (refreshedToken) {
        return apiFetch<T>(endpoint, options, false);
      }
    }

    clearSession();
    window.dispatchEvent(new CustomEvent('session-expired'));
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};

// ============================================================
// USERS
// ============================================================

export async function getCurrentUser() {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.USERS.GET_CURRENT, { method: 'GET' });
    return unwrap(data);
  } catch (error) {
    console.error('[API] Error fetching current user:', error);
    return null;
  }
}

export async function getUserById(userId: string) {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.USERS.GET_BY_ID(userId), { method: 'GET' });
    return unwrap(data);
  } catch (error) {
    console.error('[API] Error fetching user:', error);
    return null;
  }
}

export async function updateUserProfile(userData: Record<string, any>) {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.USERS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return unwrap(data);
  } catch (error) {
    console.error('[API] Error updating user profile:', error);
    throw error;
  }
}

// ============================================================
// ARTISTS
// ============================================================

export async function getArtists(): Promise<Artist[]> {
  try {
    const data = await apiFetch<ApiResponse<Artist[]> | Artist[]>(API_ENDPOINTS.ARTISTS.GET_ALL, { method: 'GET' });
    const artists = unwrap(data) || [];
    console.log('[API] Fetched artists:', Array.isArray(artists) ? artists.length : 0);
    return extractArtistsFromResponse(artists);
  } catch (error) {
    console.error('[API] Error fetching artists:', error);
    return [];
  }
}

export async function getFeaturedArtists(): Promise<Artist[]> {
  try {
    const data = await apiFetch<ApiResponse<Artist[]> | Artist[]>(API_ENDPOINTS.ARTISTS.GET_FEATURED, { method: 'GET' });
    const artists = unwrap(data) || [];
    return extractArtistsFromResponse(artists);
  } catch (error) {
    console.error('[API] Error fetching featured artists:', error);
    return [];
  }
}

export async function getArtistById(artistId: string): Promise<Artist | null> {
  try {
    const data = await apiFetch<ApiResponse<Artist> | Artist>(API_ENDPOINTS.ARTISTS.GET_BY_ID(artistId), { method: 'GET' });
    const dto = unwrap(data);
    return dto ? mapDtoToArtist(dto) : null;
  } catch (error) {
    console.error('[API] Error fetching artist:', error);
    return null;
  }
}

export async function searchArtists(query: string, category?: string): Promise<Artist[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);

    const endpoint = `${API_ENDPOINTS.ARTISTS.SEARCH}?${params.toString()}`;
    const data = await apiFetch<ApiResponse<Artist[]> | Artist[]>(endpoint, { method: 'GET' });
    const artists = unwrap(data) || [];
    return extractArtistsFromResponse(artists);
  } catch (error) {
    console.error('[API] Error searching artists:', error);
    return [];
  }
}

export async function createArtistProfile(profileData: Record<string, any>) {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.ARTISTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
    return unwrap(data);
  } catch (error) {
    console.error('[API] Error creating artist profile:', error);
    throw error;
  }
}

export async function updateArtistProfile(profileData: Record<string, any>) {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.ARTISTS.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return unwrap(data);
  } catch (error) {
    console.error('[API] Error updating artist profile:', error);
    throw error;
  }
}

export async function getArtistPortfolio(artistId: string) {
  try {
    const data = await apiFetch<ApiResponse<unknown[]> | unknown[]>(API_ENDPOINTS.ARTISTS.GET_PORTFOLIO(artistId), {
      method: 'GET',
    });
    const items = unwrap(data) || [];
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error('[API] Error fetching artist portfolio:', error);
    return [];
  }
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories(): Promise<Category[]> {
  try {
    const artists = await getArtists();
    const iconByCategory: Record<string, string> = {
      Painting: '🎨',
      Portrait: '🖼️',
      Sculpture: '🗿',
      Digital: '💻',
      Handicraft: '🧶',
      Decor: '🏠',
      Illustration: '✏️',
      Photography: '📷',
    };

    const categoryMap = new Map<string, Category & { count: number }>();
    artists.forEach((artist) => {
      const categories = Array.isArray((artist as { categories?: string[] }).categories)
        ? ((artist as { categories?: string[] }).categories as string[])
        : Array.isArray(artist.skills)
          ? artist.skills
          : [];

      categories.forEach((name) => {
        const key = String(name).trim();
        if (!key) return;
        const existing = categoryMap.get(key);
        if (existing) {
          existing.count += 1;
          return;
        }
        categoryMap.set(key, {
          id: key.toLowerCase().replace(/\s+/g, '-'),
          name: key,
          icon: iconByCategory[key] || '🖌️',
          count: 1,
        } as Category & { count: number });
      });
    });

    return Array.from(categoryMap.values()) as Category[];
  } catch (error) {
    console.error('[API] Error fetching categories:', error);
    return [];
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

const mapBackendStatusToFrontend = (status: string): Order['status'] => {
  const normalized = String(status || '').toUpperCase();
  switch (normalized) {
    case 'PENDING':
      return 'requested';
    case 'ACCEPTED':
      return 'accepted';
    case 'IN_PROGRESS':
      return 'in_progress';
    case 'DELIVERED':
      return 'delivered';
    case 'COMPLETED':
      return 'completed';
    case 'REJECTED':
      return 'rejected';
    default:
      return 'requested';
  }
};

const mapDtoToOrder = (dto: any): Order => {
  const budgetMin = Number(dto?.budgetMin ?? 0);
  const budgetMax = Number(dto?.budgetMax ?? 0);
  const budget = Number(dto?.agreedPrice ?? (budgetMin > 0 ? budgetMin : budgetMax));

  return {
    id: dto?.id || '',
    customerId: dto?.customerId || '',
    customerName: dto?.customerName || 'Customer',
    customerPhone: '',
    artistId: dto?.artistId || '',
    artistName: dto?.artistName || 'Artist',
    title: dto?.title || '',
    description: dto?.description || '',
    referenceImages: Array.isArray(dto?.referenceImageUrls) ? dto.referenceImageUrls : [],
    budget: Number.isFinite(budget) ? budget : 0,
    deadline: dto?.deadline || '',
    status: mapBackendStatusToFrontend(dto?.status),
    createdAt: dto?.createdAt || '',
    updatedAt: dto?.updatedAt || '',
    category: dto?.category || 'General',
  };
};

const normalizeDeadlineForApi = (deadline: string): string => {
  if (!deadline) return deadline;

  // HTML date inputs usually send YYYY-MM-DD; backend expects LocalDateTime.
  if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    return `${deadline}T00:00:00`;
  }

  return deadline;
};

export async function createOrder(orderData: CreateOrderData): Promise<string> {
  try {
    const budgetValue = Number(orderData.budget) || 0;
    const requestBody = {
      artistId: orderData.artistId,
      title: orderData.title,
      description: orderData.description,
      category: orderData.category,
      referenceImageUrls: Array.isArray(orderData.referenceImages) ? orderData.referenceImages : [],
      budgetMin: budgetValue,
      budgetMax: budgetValue,
      budgetCurrency: 'INR',
      deadline: normalizeDeadlineForApi(orderData.deadline),
    };

    const data = await apiFetch<ApiResponse<{ id?: string }> | { id?: string }>(API_ENDPOINTS.ORDERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    const payload = unwrap(data);
    return payload.id || (payload as unknown as string);
  } catch (error) {
    console.error('[API] Error creating order:', error);
    throw error;
  }
}

export async function getOrders(role: 'customer' | 'artist'): Promise<Order[]> {
  try {
    const endpoint = role === 'customer'
      ? API_ENDPOINTS.ORDERS.GET_BY_CUSTOMER
      : API_ENDPOINTS.ORDERS.GET_BY_ARTIST;

    const data = await apiFetch<ApiResponse<unknown> | unknown>(endpoint, { method: 'GET' });
    const payload = unwrap(data) as any;
    const rawOrders = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.content)
        ? payload.content
        : [];
    return rawOrders.map(mapDtoToOrder);
  } catch (error) {
    console.error('[API] Error fetching orders:', error);
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId), {
      method: 'GET',
    });
    const payload = unwrap(data);
    return payload ? mapDtoToOrder(payload) : null;
  } catch (error) {
    console.error('[API] Error fetching order:', error);
    return null;
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const backendStatus = String(status || '').toUpperCase();
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), {
      method: 'PATCH',
      body: JSON.stringify({ status: backendStatus }),
    });
    return unwrap(data);
  } catch (error) {
    console.error('[API] Error updating order status:', error);
    throw error;
  }
}

// ============================================================
// REVIEWS
// ============================================================

export interface CreateReviewData {
  orderId?: string;  // Optional - review can be standalone
  artistId: string;  // Required - who is being reviewed
  rating: number;
  comment: string;
}

export async function createReview(reviewData: CreateReviewData) {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.REVIEWS.CREATE, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
    return unwrap(data);
  } catch (error) {
    console.error('[API] Error creating review:', error);
    throw error;
  }
}

export async function getArtistReviews(artistId: string): Promise<Review[]> {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.REVIEWS.GET_BY_ARTIST(artistId), {
      method: 'GET',
    });

    const payload = unwrap(data) as any;
    const rawReviews = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.content)
        ? payload.content
        : [];

    return rawReviews.map((item: any) => ({
      id: item.id,
      orderId: item.orderId || '',
      customerId: item.customerId || '',
      customerName: item.customerName || 'Customer',
      customerAvatar: item.customerPhotoUrl || '',
      artistId: item.artistId || artistId,
      rating: Number(item.rating || 0),
      comment: item.comment || '',
      // Keep "date" for shared Review type; consumers can still use createdAt if needed.
      date: item.createdAt || item.date || '',
    }));
  } catch (error) {
    console.error('[API] Error fetching reviews:', error);
    return [];
  }
}

// ============================================================
// EARNINGS
// ============================================================

export async function getArtistEarnings(artistId: string) {
  try {
    void artistId;
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.EARNINGS.GET_SUMMARY, {
      method: 'GET',
    });
    const summary = unwrap(data) as any;
    const allTimeTotal = Number(summary?.allTimeTotal ?? 0);
    const thisMonthTotal = Number(summary?.thisMonthTotal ?? 0);
    const pendingPayout = Number(summary?.pendingPayout ?? 0);
    const totalOrders = Number(summary?.totalOrders ?? 0);

    return {
      artistId,
      artistName: summary?.artistName || '',
      totalEarnings: allTimeTotal,
      thisMonth: thisMonthTotal,
      pendingPayout,
      completedOrders: totalOrders,
      platformFee: Number(summary?.platformFee ?? (allTimeTotal * 0.05)),
    };
  } catch (error) {
    console.error('[API] Error fetching earnings:', error);
    return null;
  }
}

export async function getEarningsLedger() {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.EARNINGS.GET_LEDGER, {
      method: 'GET',
    });
    const ledger = unwrap(data) as any;
    if (Array.isArray(ledger)) return ledger;
    if (Array.isArray(ledger?.content)) return ledger.content;
    if (Array.isArray(ledger?.data?.content)) return ledger.data.content;
    return [];
  } catch (error) {
    console.error('[API] Error fetching earnings ledger:', error);
    return [];
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export interface NotificationData {
  id?: string;
  title: string;
  body: string;
  read: boolean;
  type: string;
  createdAt?: string;
}

export async function getNotifications(): Promise<NotificationData[]> {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, {
      method: 'GET',
    });
    const payload = unwrap(data) as any;
    const rawNotifications = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.content)
        ? payload.content
        : [];

    return rawNotifications.map((n: any) => ({
      id: n.id,
      title: n.title || '',
      body: n.body || '',
      read: Boolean(n.read),
      type: String(n.type || '').toLowerCase(),
      createdAt: n.createdAt || '',
    }));
  } catch (error) {
    console.error('[API] Error fetching notifications:', error);
    return [];
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const data = await apiFetch<ApiResponse<{ unreadCount?: number; count?: number } | number> | { unreadCount?: number; count?: number } | number>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT, {
      method: 'GET',
    });
    const payload = unwrap(data);
    return typeof payload === 'number' ? payload : payload.unreadCount || payload.count || 0;
  } catch (error) {
    console.error('[API] Error fetching unread count:', error);
    return 0;
  }
}

export async function markNotificationRead(notifId: string) {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notifId), {
      method: 'PATCH',
    });
    return unwrap(data);
  } catch (error) {
    console.error('[API] Error marking notification read:', error);
    throw error;
  }
}

export async function markAllNotificationsRead() {
  try {
    const data = await apiFetch<ApiResponse<unknown> | unknown>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {
      method: 'PATCH',
    });
    return unwrap(data);
  } catch (error) {
    console.error('[API] Error marking all notifications read:', error);
    throw error;
  }
}
