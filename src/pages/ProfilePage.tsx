import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Settings, HelpCircle, Shield, LogOut, Bell, Palette, Star, ShoppingBag, MapPin, BadgeCheck, Edit3, Moon, Globe, Key, Database, ArrowRightLeft, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/Avatar';
import { StarRating } from '@/components/StarRating';
import { cn } from '@/utils/cn';
import { getSessionDebugInfo } from '@/services/sessionManager';
import { isFirebaseConfigured } from '@/config/firebase';
import { seedDatabase, isSeedingComplete } from '@/services/seedService';

export function ProfilePage() {
  const navigate = useNavigate();
  const { userRole, isArtist, artistChecked, currentUserName, currentUserId, logout, switchRole, currentUserEmail, sessionData, artists } = useApp();
  const [showSessionDebug, setShowSessionDebug] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState('');
  const artist = (isArtist && userRole === 'artist') ? artists.find(a => a.id === currentUserId) : null;
  const firebaseReady = isFirebaseConfigured();
  const debugInfo = showSessionDebug ? getSessionDebugInfo() : null;

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedStatus('Starting...');
    try {
      await isSeedingComplete();
      const result = await seedDatabase((step) => setSeedStatus(step), currentUserId || undefined);
      if (result.success) {
        setSeedStatus('✅ All data seeded! Refresh the page.');
      } else {
        setSeedStatus(`⚠️ Completed with errors: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Seed error:', error);
      setSeedStatus(`❌ Seeding failed: ${error}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 rounded-2xl lg:rounded-3xl p-6 lg:p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={currentUserName} size="xl" className="ring-4 ring-white/30" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl lg:text-2xl font-bold text-white">{currentUserName}</h2>
              {artist?.verified && <BadgeCheck size={20} className="text-amber-200" />}
            </div>
            {currentUserEmail && (
              <p className="text-amber-200/70 text-sm mt-0.5">{currentUserEmail}</p>
            )}
            {artist ? (
              <>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={14} className="text-amber-200" />
                  <span className="text-amber-200">{artist.location}</span>
                </div>
                <div className="mt-2"><StarRating rating={artist.rating} size={16} reviewCount={artist.reviewCount} /></div>
              </>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-amber-200">
                  🛒 Customer Account
                </span>
                {artistChecked && isArtist && (
                  <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Also an Artist ✓
                  </span>
                )}
              </div>
            )}
            <button className="mt-3 flex items-center gap-1.5 text-sm text-white bg-white/20 rounded-xl px-4 py-2 hover:bg-white/30 transition-colors">
              <Edit3 size={14} /> Edit Profile
            </button>
          </div>

          {artist && (
            <div className="hidden lg:grid grid-cols-3 gap-4">
              {[
                { value: artist.completedOrders, label: 'Orders' },
                { value: `₹${(artist.earnings / 1000).toFixed(0)}k`, label: 'Earned' },
                { value: artist.rating, label: 'Rating' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center min-w-[80px]">
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-amber-200">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {artist && (
          <div className="grid grid-cols-3 gap-3 mt-5 lg:hidden">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">

          {/* ===== BECOME AN ARTIST — only if DB check done AND no artist profile ===== */}
          {artistChecked && !isArtist && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles size={24} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800 mb-1">Are you an Artist?</h3>
                  <p className="text-sm text-stone-500 mb-3">
                    Create your artist profile to showcase your skills, receive custom orders, and earn money doing what you love!
                  </p>
                  <button
                    onClick={() => navigate('/become-artist')}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-200/60 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Palette size={18} /> Become an Artist 🎨
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== CHECKING ARTIST STATUS — show loading while DB check in progress ===== */}
          {!artistChecked && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-amber-600" />
              <span className="text-sm text-stone-500">Checking artist profile...</span>
            </div>
          )}

          {/* ===== SWITCH ROLE — only if DB confirmed artist profile exists ===== */}
          {artistChecked && isArtist && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ArrowRightLeft size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-stone-800">Switch Mode</h3>
                    <p className="text-xs text-stone-400">
                      Currently: {userRole === 'customer' ? '🛒 Customer' : '🎨 Artist'}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold">
                    ✓ Artist Verified
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => switchRole('customer')}
                    className={cn(
                      'flex-1 py-3 rounded-xl text-sm font-semibold transition-all',
                      userRole === 'customer'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    )}
                  >
                    🛒 Customer
                  </button>
                  <button
                    onClick={() => switchRole('artist')}
                    className={cn(
                      'flex-1 py-3 rounded-xl text-sm font-semibold transition-all',
                      userRole === 'artist'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    )}
                  >
                    🎨 Artist
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            {[
              { icon: ShoppingBag, color: 'bg-amber-100 text-amber-600', label: 'My Orders', path: '/orders' },
              { icon: Star, color: 'bg-yellow-100 text-yellow-600', label: 'Reviews', path: '/orders' },
              { icon: Bell, color: 'bg-blue-100 text-blue-600', label: 'Notifications', path: '/notifications' },
            ].map((item, i) => (
              <button key={i} onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-4 border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.color)}>
                  <item.icon size={20} />
                </div>
                <span className="flex-1 text-sm font-medium text-stone-700 text-left">{item.label}</span>
                <ChevronRight size={18} className="text-stone-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            {[
              { icon: Globe, color: 'bg-cyan-100 text-cyan-600', label: 'Language', sub: 'English' },
              { icon: Moon, color: 'bg-indigo-100 text-indigo-600', label: 'Dark Mode', sub: 'Off' },
              { icon: Settings, color: 'bg-stone-100 text-stone-600', label: 'Account Settings', sub: undefined },
              { icon: Shield, color: 'bg-green-100 text-green-600', label: 'Privacy & Security', sub: undefined },
              { icon: HelpCircle, color: 'bg-orange-100 text-orange-600', label: 'Help Center', sub: undefined },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center gap-3 p-4 border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.color)}>
                  <item.icon size={20} />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium text-stone-700">{item.label}</span>
                  {item.sub && <p className="text-xs text-stone-400">{item.sub}</p>}
                </div>
                <ChevronRight size={18} className="text-stone-400" />
              </button>
            ))}
          </div>

          {/* Seed Database Button */}
          {/* {firebaseReady && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Database size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-stone-800">Seed Database</h3>
                  <p className="text-xs text-stone-400">Add sample artists, categories & reviews to Firestore</p>
                </div>
              </div>
              <button
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {seeding ? '⏳ Seeding...' : '🌱 Seed Database with Sample Data'}
              </button>
              {seedStatus && (
                <p className="text-xs text-stone-600 mt-2 text-center">{seedStatus}</p>
              )}
            </div>
          )} */}

          {/* Logout */}
          <button onClick={handleLogout} className="w-full bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex items-center gap-3 hover:bg-red-50 transition-colors">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><LogOut size={20} className="text-red-600" /></div>
            <span className="text-sm font-semibold text-red-600">Logout</span>
          </button>
        </div>
      </div>

      {/* Session Debug */}
      {/* <div className="space-y-4 mt-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <button onClick={() => setShowSessionDebug(!showSessionDebug)}
            className="w-full flex items-center gap-3 p-4 hover:bg-stone-50 transition-colors">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center"><Key size={20} className="text-violet-600" /></div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-stone-800">Session & Token Info</h3>
              <p className="text-xs text-stone-400">
                {firebaseReady ? '🟢 Firebase Connected' : '🟡 Demo Mode'} • {sessionData?.loginMethod || 'N/A'}
              </p>
            </div>
            <ChevronRight size={18} className={cn('text-stone-400 transition-transform', showSessionDebug && 'rotate-90')} />
          </button>
          {showSessionDebug && debugInfo && (
            <div className="px-4 pb-4 space-y-2 animate-slide-down">
              <div className="bg-stone-900 rounded-xl p-4 font-mono text-xs space-y-1">
                <p className="text-stone-400 mb-2">// Session Debug Info</p>
                {Object.entries(debugInfo).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="text-cyan-400 min-w-[140px]">{key}:</span>
                    <span className={cn(
                      value === true ? 'text-green-400' :
                      value === false ? 'text-red-400' :
                      String(value).includes('expired') ? 'text-red-400' :
                      'text-amber-300'
                    )}>{String(value)}</span>
                  </div>
                ))}
                <div className="flex mt-2 pt-2 border-t border-stone-700">
                  <span className="text-cyan-400 min-w-[140px]">artistChecked:</span>
                  <span className={artistChecked ? 'text-green-400' : 'text-yellow-400'}>{String(artistChecked)}</span>
                </div>
                <div className="flex">
                  <span className="text-cyan-400 min-w-[140px]">isArtist:</span>
                  <span className={isArtist ? 'text-green-400' : 'text-red-400'}>{String(isArtist)}</span>
                </div>
                <div className="flex">
                  <span className="text-cyan-400 min-w-[140px]">currentRole:</span>
                  <span className="text-amber-300">{userRole}</span>
                </div>
              </div>
              {currentUserEmail && (
                <p className="text-xs text-stone-500">📧 Logged in as: {currentUserEmail}</p>
              )}
            </div>
          )}
        </div>
      </div> */}

      <p className="text-center text-xs text-stone-400 py-6">HunarHub v1.0 • Made with ❤️ in India</p>
    </div>
  );
}
