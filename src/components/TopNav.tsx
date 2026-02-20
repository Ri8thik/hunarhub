import { useNavigate } from 'react-router-dom';
import { Bell, Search, Palette, Moon, Sun } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

export function TopNav() {
  const navigate = useNavigate();
  const { userRole, currentUserName, switchRole, darkMode, toggleDarkMode } = useApp();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-stone-200 dark:border-gray-700 px-4 lg:px-8 py-3 flex items-center gap-4 shrink-0 transition-colors">
      {/* Mobile Logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
          <Palette className="text-white" size={16} />
        </div>
        <span className="text-base font-extrabold gradient-text">HunarHub</span>
      </div>

      <div className="flex-1 sm:hidden" />

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Role Switcher */}
        <div className="hidden md:flex bg-stone-100 dark:bg-gray-800 rounded-xl p-0.5">
          <button
            onClick={() => switchRole('customer')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              userRole === 'customer'
                ? 'bg-white dark:bg-gray-700 text-amber-700 dark:text-amber-400 shadow-sm'
                : 'text-stone-500 dark:text-gray-400'
            )}
          >
            🛒 Customer
          </button>
          <button
            onClick={() => switchRole('artist')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              userRole === 'artist'
                ? 'bg-white dark:bg-gray-700 text-amber-700 dark:text-amber-400 shadow-sm'
                : 'text-stone-500 dark:text-gray-400'
            )}
          >
            🎨 Artist
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-gray-800 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-gray-700 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode
            ? <Sun size={18} className="text-amber-400" />
            : <Moon size={18} className="text-stone-600" />
          }
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 rounded-xl bg-stone-100 dark:bg-gray-800 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Bell size={18} className="text-stone-600 dark:text-gray-300" />
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