import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { MobileNav } from '@/components/MobileNav';
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
import { Palette, Loader2 } from 'lucide-react';
import AdminLoginPage from '@/pages/AdminLoginPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'

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
  const isAdminRoute = pathname.includes('/admin')
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
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
        <MobileNav />
      </div>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.DEV ? '/' : '/hunarhub'}>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  )
}