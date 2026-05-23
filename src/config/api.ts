/**
 * API Configuration - Manage base URLs for local and production environments
 */

// Backend exposes all routes under /api/v1
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, '');

  return 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getBaseUrl();

// API versioning (can be extended in future)
export const API_VERSION = 'v1';

// API Endpoints mapping
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  // Users
  USERS: {
    GET_CURRENT: '/users/me',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE_PROFILE: '/users/me',
    DELETE_ACCOUNT: '/users/me',
    GET_ANALYTICS: (id: string) => `/users/${id}/analytics`,
  },

  // Artists
  ARTISTS: {
    SEARCH: '/artists/search',
    GET_ALL: '/artists',
    GET_BY_ID: (id: string) => `/artists/${id}`,
    CREATE: '/artists',
    UPDATE: '/artists/me',
    DELETE: '/artists/me',
    GET_PORTFOLIO: (id: string) => `/artists/${id}/portfolio`,
    UPDATE_PORTFOLIO: '/artists/me/portfolio',
    GET_FEATURED: '/artists/featured',
  },

  // Orders
  ORDERS: {
    CREATE: '/orders',
    GET_ALL: '/orders',
    GET_BY_ID: (id: string) => `/orders/${id}`,
    GET_BY_CUSTOMER: '/orders/customer',
    GET_BY_ARTIST: '/orders/artist',
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    DELETE: (id: string) => `/orders/${id}`,
  },

  // Reviews
  REVIEWS: {
    CREATE: '/reviews',
    GET_BY_ARTIST: (artistId: string) => `/reviews/artist/${artistId}`,
    GET_BY_ORDER: (orderId: string) => `/reviews/order/${orderId}`,
    GET_BY_USER: (userId: string) => `/reviews/user/${userId}`,
  },

  // Earnings
  EARNINGS: {
    GET_SUMMARY: '/earnings/summary',
    GET_LEDGER: '/earnings/ledger',
    GET_BY_ORDER: (orderId: string) => `/earnings/order/${orderId}`,
  },

  // Payouts
  PAYOUTS: {
    GET_HISTORY: '/payouts',
    REQUEST: '/payouts/request',
    GET_BY_ID: (id: string) => `/payouts/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
};

console.log(`[API Config] Using API base URL: ${API_BASE_URL}`);

