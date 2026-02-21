import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingBag, MessageSquare, User, Wallet, Palette, LogOut, ArrowRightLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

const customerLinks = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Search, label: 'Explore Artists' },
  { path: '/orders', icon: ShoppingBag, label: 'My Orders' },
  // { path: '/chat', icon: MessageSquare, label: 'Messages' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const artistLinks = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/my-artist-profile', icon: Palette, label: 'My Artist Profile' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders' },
  // { path: '/chat', icon: MessageSquare, label: 'Messages' },
  { path: '/earnings', icon: Wallet, label: 'Earnings' },
  { path: '/profile', icon: User, label: 'Settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, isArtist, artistChecked, currentUserName, logout, switchRole } = useApp();

  // Only show artist links if:
  // 1. artistChecked is true (DB check is done)
  // 2. isArtist is true (artist profile exists in DB)
  // 3. userRole is 'artist' (user has switched to artist mode)
  const showArtistMode = artistChecked && isArtist && userRole === 'artist';
  const links = showArtistMode ? artistLinks : customerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-stone-200 dark:border-gray-700 h-screen shrink-0 transition-colors">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-100 dark:border-gray-700 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200/50">
          <Palette className="text-white" size={22} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold gradient-text">HunarHub</h1>
          <p className="text-[10px] text-stone-400 -mt-0.5">Custom Art Marketplace</p>
        </div>
      </div>

      {/* Current Mode Badge */}
      <div className="px-4 pt-4 pb-2">
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold',
          showArtistMode
            ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800'
            : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
        )}>
          {showArtistMode ? '🎨' : '🛒'}
          <span>{showArtistMode ? 'Artist Mode' : 'Customer Mode'}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <button
              key={link.path + link.label}
              onClick={() => navigate(link.path)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-800'
                  : 'text-stone-500 dark:text-gray-400 hover:bg-stone-50 dark:hover:bg-gray-800 hover:text-stone-700 dark:hover:text-gray-200'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{link.label}</span>
              {link.path === '/chat' && (
                <span className="ml-auto w-5 h-5 bg-amber-600 rounded-full text-[10px] text-white font-bold flex items-center justify-center">3</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Switcher — ONLY if artist profile exists in DB */}
      {artistChecked && isArtist && (
        <div className="px-3 pb-2">
          <button
            onClick={() => switchRole(userRole === 'customer' ? 'artist' : 'customer')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all border border-purple-100 dark:border-purple-800"
          >
            <ArrowRightLeft size={18} />
            <span>Switch to {userRole === 'customer' ? 'Artist' : 'Customer'}</span>
          </button>
        </div>
      )}

      {/* Become Artist — ONLY if artist profile does NOT exist in DB */}
      {artistChecked && !isArtist && (
        <div className="px-3 pb-2">
          <button
            onClick={() => navigate('/become-artist')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all border border-amber-200 dark:border-amber-800"
          >
            <Palette size={18} />
            <span>Become an Artist 🎨</span>
          </button>
        </div>
      )}

      {/* User Info */}
      <div className="border-t border-stone-100 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
            {currentUserName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-800 dark:text-gray-100 truncate">{currentUserName}</p>
            <p className="text-xs text-stone-400 dark:text-gray-500 capitalize">{userRole}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}