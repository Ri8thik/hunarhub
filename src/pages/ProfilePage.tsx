import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Settings, HelpCircle, Shield, LogOut, Bell, Palette, Star, ShoppingBag, MapPin, BadgeCheck, Edit3, Moon, Globe, Smartphone } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { artists } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { StarRating } from '@/components/StarRating';
import { cn } from '@/utils/cn';

export function ProfilePage() {
  const navigate = useNavigate();
  const { userRole, currentUserName, currentUserId, logout, switchRole } = useApp();
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const artist = userRole === 'artist' ? artists.find(a => a.id === currentUserId) : null;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="h-full native-scroll bg-stone-50">
      <div className="bg-gradient-to-br from-amber-700 via-amber-600 to-orange-600 px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <button className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Settings size={20} className="text-white" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Avatar name={currentUserName} size="xl" className="ring-4 ring-white/30" />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-white">{currentUserName}</h2>
              {artist?.verified && <BadgeCheck size={18} className="text-amber-200" />}
            </div>
            {artist ? (
              <>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-amber-200" />
                  <span className="text-amber-200 text-sm">{artist.location}</span>
                </div>
                <div className="mt-1"><StarRating rating={artist.rating} size={13} reviewCount={artist.reviewCount} /></div>
              </>
            ) : (
              <p className="text-amber-200 text-sm mt-0.5">Customer Account</p>
            )}
            <button className="mt-2 flex items-center gap-1.5 text-xs text-white bg-white/20 rounded-full px-3 py-1.5">
              <Edit3 size={12} /> Edit Profile
            </button>
          </div>
        </div>

        {artist && (
          <div className="grid grid-cols-3 gap-2.5 mt-5">
            {[
              { value: artist.completedOrders, label: 'Orders' },
              { value: `₹${(artist.earnings / 1000).toFixed(0)}k`, label: 'Earned' },
              { value: artist.rating, label: 'Rating' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center">
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-amber-200">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 mt-5 space-y-3 pb-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => setShowRoleSwitch(!showRoleSwitch)} className="w-full flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Palette size={20} className="text-purple-600" /></div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-stone-800">Switch Role</h3>
              <p className="text-[11px] text-stone-400">Currently: {userRole === 'customer' ? '🛒 Customer' : '🎨 Artist'}</p>
            </div>
            <ChevronRight size={18} className="text-stone-400" />
          </button>
          {showRoleSwitch && (
            <div className="px-4 pb-3 flex gap-2 animate-fade-in-up">
              <button onClick={() => { switchRole('customer'); setShowRoleSwitch(false); }}
                className={cn('flex-1 py-3 rounded-xl text-sm font-semibold', userRole === 'customer' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600')}>
                🛒 Customer
              </button>
              <button onClick={() => { switchRole('artist'); setShowRoleSwitch(false); }}
                className={cn('flex-1 py-3 rounded-xl text-sm font-semibold', userRole === 'artist' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600')}>
                🎨 Artist
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {[
            { icon: ShoppingBag, color: 'bg-amber-100 text-amber-600', label: 'My Orders', path: '/orders' },
            { icon: Star, color: 'bg-yellow-100 text-yellow-600', label: 'Reviews', path: '/orders' },
            { icon: Bell, color: 'bg-blue-100 text-blue-600', label: 'Notifications', path: '/notifications' },
          ].map((item, i) => (
            <button key={i} onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 p-4 border-b border-stone-50 last:border-0">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.color)}>
                <item.icon size={20} />
              </div>
              <span className="flex-1 text-sm font-medium text-stone-700 text-left">{item.label}</span>
              <ChevronRight size={18} className="text-stone-400" />
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {[
            { icon: Globe, color: 'bg-cyan-100 text-cyan-600', label: 'Language', sub: 'English', path: '' },
            { icon: Moon, color: 'bg-indigo-100 text-indigo-600', label: 'Dark Mode', sub: 'Off', path: '' },
            { icon: Shield, color: 'bg-green-100 text-green-600', label: 'Privacy', sub: undefined, path: '' },
            { icon: HelpCircle, color: 'bg-orange-100 text-orange-600', label: 'Help Center', sub: undefined, path: '' },
            { icon: Smartphone, color: 'bg-pink-100 text-pink-600', label: 'Install on Phone', sub: 'Get APK / PWA', path: '/setup' },
          ].map((item, i) => (
            <button key={i} onClick={() => item.path ? navigate(item.path) : undefined}
              className="w-full flex items-center gap-3 p-4 border-b border-stone-50 last:border-0">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.color)}>
                <item.icon size={20} />
              </div>
              <div className="flex-1 text-left">
                <span className="text-sm font-medium text-stone-700">{item.label}</span>
                {item.sub && <p className="text-[11px] text-stone-400">{item.sub}</p>}
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </button>
          ))}
        </div>

        <button onClick={handleLogout} className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><LogOut size={20} className="text-red-600" /></div>
          <span className="text-sm font-semibold text-red-600">Logout</span>
        </button>

        <p className="text-center text-xs text-stone-400 py-4">HunarHub v1.0 • Made with ❤️ in India</p>
      </div>
    </div>
  );
}
