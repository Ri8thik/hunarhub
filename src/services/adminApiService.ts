/**
 * Admin API Service — all calls to /api/v1/admin/**
 */

import { API_BASE_URL } from '@/config/api';

const ADMIN_API_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

// ── Types ─────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  roles: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  createdAt: string;
  updatedAt?: string;
  suspendReason?: string;
  suspendedUntil?: string;
  orderCount: number;
  hasArtistProfile: boolean;
}

export interface AdminArtist {
  id: string;
  displayName: string;
  email: string;
  photoUrl?: string;
  bio?: string;
  skills: string[];
  categories: string[];
  startingPrice?: number;
  availability?: string;
  ratingAvg?: number;
  ratingCount?: number;
  active: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalReason?: string;
  featured: boolean;
  featuredRank?: number;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  createdAt: string;
  portfolioCount: number;
  orderCount: number;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerId: string;
  artistName: string;
  artistEmail: string;
  artistId: string;
  status: string;
  title: string;
  description: string;
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  agreedPrice?: number;
  platformFee?: number;
  artistNet?: number;
  deadline?: string;
  createdAt: string;
  updatedAt?: string;
  referenceImageUrls: string[];
}

export interface AdminReview {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewerId: string;
  artistName: string;
  artistId: string;
  rating: number;
  comment?: string;
  orderId?: string;
  createdAt: string;
}

export interface AdminPayout {
  id: string;
  artistName: string;
  artistEmail: string;
  artistId: string;
  amount: number;
  currency: string;
  status: string;
  transactionReference?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PlatformAnalytics {
  totalUsers: number;
  totalArtists: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  platformFeeCollected: number;
  pendingPayouts: number;
  avgOrderValue: number;
  avgArtistRating: number;
  newUsersThisMonth: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
}

export interface AuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── Token helper ──────────────────────────────────────────────────────────

const getAdminToken = (): string | null => {
  return sessionStorage.getItem('adminToken');
};

const adminFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = getAdminToken();
  const res = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }
  return json?.data ?? json;
};

// ── Users ─────────────────────────────────────────────────────────────────

export const adminGetUsers = (page = 0, size = 20): Promise<PageResponse<AdminUser>> =>
  adminFetch(`/api/v1/admin/users?page=${page}&size=${size}`);

export const adminGetUser = (id: string): Promise<AdminUser> =>
  adminFetch(`/api/v1/admin/users/${id}`);

export const adminCreateUser = (data: {
  displayName: string; email: string; password: string;
  roles?: string[]; locationCity?: string; locationState?: string; locationCountry?: string;
}): Promise<AdminUser> =>
  adminFetch('/api/v1/admin/users', { method: 'POST', body: JSON.stringify(data) });

export const adminUpdateUser = (id: string, data: Partial<AdminUser>): Promise<AdminUser> =>
  adminFetch(`/api/v1/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const adminDeleteUser = (id: string): Promise<string> =>
  adminFetch(`/api/v1/admin/users/${id}`, { method: 'DELETE' });

export const adminUpdateUserStatus = (id: string, status: string, suspendDays?: number, reason?: string): Promise<AdminUser> =>
  adminFetch(`/api/v1/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, suspendDays, reason }),
  });

// ── Artists ───────────────────────────────────────────────────────────────

export const adminGetArtists = (page = 0, size = 20): Promise<PageResponse<AdminArtist>> =>
  adminFetch(`/api/v1/admin/artists?page=${page}&size=${size}`);

export const adminGetArtist = (id: string): Promise<AdminArtist> =>
  adminFetch(`/api/v1/admin/artists/${id}`);

export const adminApproveArtist = (id: string, approved: boolean, reason?: string): Promise<AdminArtist> =>
  adminFetch(`/api/v1/admin/artists/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ approved, reason }),
  });

export const adminFeatureArtist = (id: string, featured: boolean, rank?: number): Promise<AdminArtist> =>
  adminFetch(`/api/v1/admin/artists/${id}/feature`, {
    method: 'PATCH',
    body: JSON.stringify({ featured, rank }),
  });

export const adminDeletePortfolioItem = (artistId: string, itemId: string): Promise<string> =>
  adminFetch(`/api/v1/admin/artists/${artistId}/portfolio/${itemId}`, { method: 'DELETE' });

// ── Orders ────────────────────────────────────────────────────────────────

export const adminGetOrders = (page = 0, size = 20): Promise<PageResponse<AdminOrder>> =>
  adminFetch(`/api/v1/admin/orders?page=${page}&size=${size}`);

export const adminGetOrder = (id: string): Promise<AdminOrder> =>
  adminFetch(`/api/v1/admin/orders/${id}`);

export const adminOverrideOrderStatus = (id: string, status: string, reason?: string): Promise<AdminOrder> =>
  adminFetch(`/api/v1/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });

export const adminDeleteOrder = (id: string): Promise<string> =>
  adminFetch(`/api/v1/admin/orders/${id}`, { method: 'DELETE' });

// ── Reviews ───────────────────────────────────────────────────────────────

export const adminGetReviews = (page = 0, size = 20): Promise<PageResponse<AdminReview>> =>
  adminFetch(`/api/v1/admin/reviews?page=${page}&size=${size}`);

export const adminDeleteReview = (id: string, reason?: string): Promise<string> =>
  adminFetch(`/api/v1/admin/reviews/${id}?reason=${encodeURIComponent(reason || '')}`, { method: 'DELETE' });

// ── Payouts ───────────────────────────────────────────────────────────────

export const adminGetPayouts = (page = 0, size = 20): Promise<PageResponse<AdminPayout>> =>
  adminFetch(`/api/v1/admin/payouts?page=${page}&size=${size}`);

export const adminApprovePayout = (id: string, transactionReference?: string): Promise<AdminPayout> =>
  adminFetch(`/api/v1/admin/payouts/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ transactionReference }),
  });

export const adminRejectPayout = (id: string, reason?: string): Promise<AdminPayout> =>
  adminFetch(`/api/v1/admin/payouts/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });

// ── Notifications ─────────────────────────────────────────────────────────

export const adminBroadcastNotification = (
  target: string, type: string, title: string, body: string
): Promise<string> =>
  adminFetch('/api/v1/admin/notifications/broadcast', {
    method: 'POST',
    body: JSON.stringify({ target, type, title, body }),
  });

// ── Analytics ─────────────────────────────────────────────────────────────

export const adminGetAnalytics = (): Promise<PlatformAnalytics> =>
  adminFetch('/api/v1/admin/analytics/summary');

// ── Audit Log ─────────────────────────────────────────────────────────────

export const adminGetAuditLog = (page = 0, size = 50): Promise<PageResponse<AuditLog>> =>
  adminFetch(`/api/v1/admin/audit-log?page=${page}&size=${size}`);

