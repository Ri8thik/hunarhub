import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type UserRole, type Order, type OrderStatus } from '@/types';
import { orders as initialOrders } from '@/data/mockData';

interface AppState {
  isLoggedIn: boolean;
  userRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  orders: Order[];
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addOrder: (order: Order) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [currentUserId, setCurrentUserId] = useState('c1');
  const [currentUserName, setCurrentUserName] = useState('Amit Kumar');
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const login = useCallback((role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
    if (role === 'artist') {
      setCurrentUserId('a1');
      setCurrentUserName('Priya Sharma');
    } else {
      setCurrentUserId('c1');
      setCurrentUserName('Amit Kumar');
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUserRole(role);
    if (role === 'artist') {
      setCurrentUserId('a1');
      setCurrentUserName('Priya Sharma');
    } else {
      setCurrentUserId('c1');
      setCurrentUserName('Amit Kumar');
    }
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString().split('T')[0] } : o));
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{
      isLoggedIn, userRole, currentUserId, currentUserName,
      orders, login, logout, switchRole, updateOrderStatus, addOrder,
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
