export type UserRole = 'artist' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  location: string;
  joinedDate: string;
}

export interface Artist extends User {
  role: 'artist';
  skills: string[];
  bio: string;
  portfolio: PortfolioItem[];
  priceRange: { min: number; max: number };
  availability: 'available' | 'busy' | 'unavailable';
  rating: number;
  reviewCount: number;
  completedOrders: number;
  responseTime: string;
  featured: boolean;
  verified: boolean;
  earnings: number;
}

export interface Customer extends User {
  role: 'customer';
}

export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

export type OrderStatus = 'requested' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'rejected';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  artistId: string;
  artistName: string;
  title: string;
  description: string;
  referenceImages: string[];
  budget: number;
  deadline: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  category: string;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  artistId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
  read: boolean;
}

export interface ChatThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  orderId?: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'message' | 'review' | 'payment';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}
