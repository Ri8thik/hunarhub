import { useNavigate } from 'react-router-dom';
import { Bell, Search, Palette } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

export function TopNav() {
  const navigate = useNavigate();
  const { userRole, currentUserName, switchRole } = useApp();

  return (
    <header className="bg-white border-b border-stone-200 px-4 lg:px-8 py-3 flex items-center gap-4 shrink-0">
      {/* Mobile Logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
          <Palette className="text-white" size={16} />
        </div>
        <span className="text-base font-extrabold gradient-text">HunarHub</span>
      </div>

      {/* Search Bar */}
      <div className="hidden sm:flex flex-1 max-w-lg">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search artists, skills, crafts..."
            onClick={() => navigate('/explore')}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 sm:hidden" />

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Role Switcher */}
        <div className="hidden md:flex bg-stone-100 rounded-xl p-0.5">
          <button
            onClick={() => switchRole('customer')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              userRole === 'customer' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500'
            )}
          >
            🛒 Customer
          </button>
          <button
            onClick={() => switchRole('artist')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              userRole === 'artist' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500'
            )}
          >
            🎨 Artist
          </button>
        </div>

        {/* Search Mobile */}
        <button onClick={() => navigate('/explore')} className="sm:hidden w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
          <Search size={18} className="text-stone-600" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
        >
          <Bell size={18} className="text-stone-600" />
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">3</span>
        </button>

        {/* Avatar */}
        <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-xs">
          {currentUserName.split(' ').map(n => n[0]).join('')}
        </button>
      </div>
    </header>
  );
}
