import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, MessageSquare, ShoppingBag, User, Wallet, Palette } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

const customerTabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Search, label: 'Explore' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/chat', icon: MessageSquare, label: 'Chat' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const artistTabs = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/chat', icon: MessageSquare, label: 'Chat' },
  { path: '/earnings', icon: Wallet, label: 'Earnings' },
  { path: '/my-artist-profile', icon: Palette, label: 'My Profile' },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, isArtist, artistChecked } = useApp();

  // Only show artist tabs if:
  // 1. DB check is done (artistChecked)
  // 2. Artist profile exists in DB (isArtist)
  // 3. User has switched to artist mode (userRole === 'artist')
  const showArtistTabs = artistChecked && isArtist && userRole === 'artist';
  const tabs = showArtistTabs ? artistTabs : customerTabs;

  // Hide on certain pages
  const hiddenPrefixes = ['/chat/', '/artist/', '/request/', '/order/', '/become-artist'];
  if (hiddenPrefixes.some(p => location.pathname.startsWith(p))) return null;

  return (
    <nav className="lg:hidden bg-white border-t border-stone-200 shrink-0">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path + tab.label}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all min-w-[52px]',
                isActive ? 'text-amber-700' : 'text-stone-400'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={cn(
                'text-[10px] mt-0.5',
                isActive ? 'font-bold' : 'font-medium'
              )}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
