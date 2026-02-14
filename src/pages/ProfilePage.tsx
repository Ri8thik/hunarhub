import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { User, Settings, LogOut, ChevronRight, Shield, Bell, HelpCircle, Moon, Globe, Palette, Star, MapPin } from 'lucide-react';
import { seedDatabase } from '@/services/seedService';
import { getSessionDebugInfo } from '@/services/sessionManager';

export default function ProfilePage() {
  const { currentUserName, currentUserEmail, currentUserId, userRole, switchRole, isArtist, artistChecked, logout, artists } = useApp();
  const navigate = useNavigate();
  const [seedingStatus, setSeedingStatus] = useState('');
  const [seedingProgress, setSeedingProgress] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  const sessionInfo = getSessionDebugInfo();

  const myArtistProfile = artists.find(a => a.id === currentUserId);

  const handleSeedDatabase = async () => {
    setSeedingStatus('');
    setSeedingProgress('Starting...');
    try {
      const result = await seedDatabase(
        (step) => setSeedingProgress(step),
        currentUserId || undefined
      );
      if (result.success) {
        setSeedingStatus('✅ Database seeded successfully! Refresh the page.');
      } else {
        setSeedingStatus('⚠️ Completed with errors: ' + result.errors.join(', '));
      }
      setSeedingProgress('');
    } catch (error) {
      setSeedingStatus('❌ Error seeding database. Check console.');
      setSeedingProgress('');
      console.error(error);
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', action: () => {} },
        { icon: Shield, label: 'Privacy & Security', action: () => {} },
        { icon: Bell, label: 'Notifications', action: () => navigate('/notifications') },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Globe, label: 'Language', value: 'English', action: () => {} },
        { icon: Moon, label: 'Dark Mode', value: 'Off', action: () => {} },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', action: () => {} },
        { icon: Settings, label: 'App Settings', action: () => {} },
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">

        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl lg:text-3xl font-bold">
              {currentUserName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{currentUserName || 'User'}</h1>
              <p className="text-gray-500">{currentUserEmail || 'user@example.com'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  userRole === 'artist' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {userRole === 'artist' ? '🎨 Artist Mode' : '👤 Customer Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View My Artist Profile - ONLY shows if user has artist profile */}
        {artistChecked && isArtist && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 shadow-sm text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Palette size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">My Artist Profile</h3>
                {myArtistProfile && (
                  <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
                    {myArtistProfile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {myArtistProfile.location}
                      </span>
                    )}
                    {myArtistProfile.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={12} className="fill-yellow-300 text-yellow-300" />
                        {myArtistProfile.rating}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-white/70 text-sm mt-1">View and manage your portfolio & reviews</p>
              </div>
              <button
                onClick={() => navigate('/my-artist-profile')}
                className="px-4 py-2 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors text-sm"
              >
                View Profile →
              </button>
            </div>
          </div>
        )}

        {/* Role Switcher - ONLY shows if user has artist profile */}
        {artistChecked && isArtist && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Switch Mode</h3>
                <p className="text-sm text-gray-500">
                  Currently in {userRole === 'artist' ? 'Artist' : 'Customer'} mode
                </p>
              </div>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => switchRole('customer')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    userRole === 'customer' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  👤 Customer
                </button>
                <button
                  onClick={() => switchRole('artist')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    userRole === 'artist' ? 'bg-purple-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎨 Artist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Become an Artist - ONLY shows if NO artist profile */}
        {artistChecked && !isArtist && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
                <Palette size={28} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Become an Artist 🎨</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Create your artist profile, showcase your portfolio, and start receiving custom art requests from customers.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/become-artist')}
              className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              Create Artist Profile →
            </button>
          </div>
        )}

        {/* Checking artist status */}
        {!artistChecked && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Checking artist profile...</span>
            </div>
          </div>
        )}

        {/* Settings */}
        {settingsGroups.map(group => (
          <div key={group.title} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{group.title}</h3>
            </div>
            {group.items.map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <item.icon size={20} className="text-gray-400" />
                <span className="flex-1 text-left text-gray-700 font-medium">{item.label}</span>
                {'value' in item && <span className="text-sm text-gray-400">{item.value}</span>}
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
        ))}

        {/* Seed Database */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">🌱 Database</h3>
          <p className="text-sm text-gray-500 mb-4">Populate Firestore with sample artists, categories, and earnings data.</p>
          <button
            onClick={handleSeedDatabase}
            className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
          >
            🌱 Seed Database with Sample Data
          </button>
          {seedingProgress && (
            <p className="mt-3 text-sm text-center text-amber-600 animate-pulse">{seedingProgress}</p>
          )}
          {seedingStatus && (
            <p className="mt-3 text-sm text-center text-gray-600">{seedingStatus}</p>
          )}
        </div>

        {/* Session Debug */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="w-full flex items-center justify-between px-6 py-4"
          >
            <span className="font-semibold text-gray-700">🔧 Session Debug</span>
            <ChevronRight size={16} className={`text-gray-400 transition-transform ${showDebug ? 'rotate-90' : ''}`} />
          </button>
          {showDebug && (
            <div className="px-6 pb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">User ID:</span>
                <span className="text-gray-700 font-mono text-xs">{currentUserId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role:</span>
                <span className="text-gray-700">{userRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Is Artist:</span>
                <span className={isArtist ? 'text-green-600' : 'text-red-500'}>{isArtist ? '✅ Yes' : '❌ No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Artist Checked:</span>
                <span className={artistChecked ? 'text-green-600' : 'text-yellow-500'}>{artistChecked ? '✅ Done' : '⏳ Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Has Token:</span>
                <span className="text-gray-700">{sessionInfo?.hasAccessToken ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Token Expired:</span>
                <span className="text-gray-700">{sessionInfo?.isExpired ? '❌ Yes' : '✅ No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Login Method:</span>
                <span className="text-gray-700">{String(sessionInfo?.loginMethod || 'N/A')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time to Expiry:</span>
                <span className="text-gray-700">{String(sessionInfo?.timeToExpiry || 'N/A')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white rounded-2xl shadow-sm text-red-500 font-semibold hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>

        <div className="text-center text-xs text-gray-400 pb-4">
          HunarHub v1.0.0 • Made with ❤️ in India
        </div>
      </div>
    </div>
  );
}
