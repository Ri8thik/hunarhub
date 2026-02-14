import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { MobileNav } from '@/components/MobileNav';
import { LoginPage } from '@/pages/LoginPage';
import { HomePage } from '@/pages/HomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import { ArtistProfilePage } from '@/pages/ArtistProfilePage';
import { RequestPage } from '@/pages/RequestPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { ChatListPage, ChatDetailPage } from '@/pages/ChatPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { EarningsPage } from '@/pages/EarningsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ArtistSetupPage } from '@/pages/ArtistSetupPage';
import { Palette, Loader2 } from 'lucide-react';

function SplashScreen() {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-amber-700 via-amber-800 to-orange-900 flex flex-col items-center justify-center">
      <div className="animate-bounce-in flex flex-col items-center">
        <div className="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl mb-6">
          <Palette className="text-white" size={48} />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">HunarHub</h1>
        <p className="text-amber-200/80 mt-2 text-sm tracking-widest uppercase">Custom Art Marketplace</p>
        <div className="mt-10 flex gap-2.5">
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-pulse-soft" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-pulse-soft" style={{ animationDelay: '300ms' }} />
          <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-pulse-soft" style={{ animationDelay: '600ms' }} />
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen w-full bg-stone-50 flex flex-col items-center justify-center">
      <Loader2 size={32} className="animate-spin text-amber-600 mb-4" />
      <p className="text-sm text-stone-500">Restoring session...</p>
    </div>
  );
}

function AppRoutes() {
  const { isLoggedIn, isLoading } = useApp();

  // Show loading while checking session
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Routes>
            <Route path="/" element={<HomePage />} />
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
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {/* Mobile Bottom Nav */}
        <MobileNav />
      </div>
    </div>
  );
}

export function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <BrowserRouter basename={import.meta.env.DEV ? '/' : '/hunarhub'}>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
