import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingBag, MessageSquare, User, Wallet, Palette, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

const customerLinks = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Search, label: 'Explore Artists' },
  { path: '/orders', icon: ShoppingBag, label: 'My Orders' },
  { path: '/chat', icon: MessageSquare, label: 'Messages' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const artistLinks = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/chat', icon: MessageSquare, label: 'Messages' },
  { path: '/earnings', icon: Wallet, label: 'Earnings' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, currentUserName, logout } = useApp();
  const links = userRole === 'artist' ? artistLinks : customerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-stone-200 h-screen shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200/50">
          <Palette className="text-white" size={22} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold gradient-text">HunarHub</h1>
          <p className="text-[10px] text-stone-400 -mt-0.5">Custom Art Marketplace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
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

      {/* User Info */}
      <div className="border-t border-stone-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
            {currentUserName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-800 truncate">{currentUserName}</p>
            <p className="text-xs text-stone-400 capitalize">{userRole}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
