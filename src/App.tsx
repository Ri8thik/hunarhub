import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { SplashScreen } from '@/components/SplashScreen';
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
import { SetupGuidePage } from '@/pages/SetupGuidePage';

function AppRoutes() {
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-full">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup" element={<SetupGuidePage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden flex flex-col">
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
          <Route path="/setup" element={<SetupGuidePage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <AppProvider>
        <div className="app-shell no-select">
          <AppRoutes />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
