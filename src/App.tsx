import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { LoginPage } from '@/pages/LoginPage';
import { HomePage } from '@/pages/HomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import ArtistProfilePage from '@/pages/ArtistProfilePage';
import { RequestPage } from '@/pages/RequestPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { ChatListPage, ChatDetailPage } from '@/pages/ChatPage';
import ProfilePage from '@/pages/ProfilePage';
import { EarningsPage } from '@/pages/EarningsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import ArtistSetupPage from '@/pages/ArtistSetupPage';
import MyArtistProfilePage from '@/pages/MyArtistProfilePage';
import { Loader2 } from 'lucide-react';

// Admin pages (new)
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminArtistsPage from '@/pages/admin/AdminArtistsPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminReviewsPage from '@/pages/admin/AdminReviewsPage';
import AdminPayoutsPage from '@/pages/admin/AdminPayoutsPage';
import AdminNotificationsPage from '@/pages/admin/AdminNotificationsPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminAuditLogPage from '@/pages/admin/AdminAuditLogPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">🎨</span>
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Loading HunarHub...</p>
      </div>
    </div>
  )
}

function AppLayout() {
  const { isLoggedIn, isLoading } = useApp()

  if (isLoading) return <LoadingScreen />

  // Admin routes are always standalone — never wrapped in user layout
  const pathname = window.location.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/artists" element={<AdminArtistsPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
        <Route path="/admin/payouts" element={<AdminPayoutsPage />} />
        <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<AdminLoginPage />} />
      </Routes>
    )
  }

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminLoginPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen common-page-bg flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 overflow-y-auto common-page-bg">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/artist/:id" element={<ArtistProfilePage />} />
            <Route path="/request/:artistId" element={<RequestPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route path="/chat" element={<ChatListPage />} />
            <Route path="/chat/:id" element={<ChatDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/earnings" element={<EarningsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/become-artist" element={<ArtistSetupPage />} />
            <Route path="/my-artist-profile" element={<MyArtistProfilePage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export function App() {
  const basePath = import.meta.env.VITE_BASE_PATH || '/'
  const normalizedBasePath = basePath === '/' ? '/' : basePath.replace(/\/$/, '')

  return (
    <BrowserRouter basename={import.meta.env.DEV ? '/' : normalizedBasePath}>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  )
}