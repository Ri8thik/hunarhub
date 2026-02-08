import { useNavigate } from 'react-router-dom';
import { Search, Bell, MapPin, ChevronRight, Star, Clock, BadgeCheck, Sparkles } from 'lucide-react';
import { artists, categories } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

export function HomePage() {
  const navigate = useNavigate();
  const { userRole, currentUserName } = useApp();
  const firstName = currentUserName.split(' ')[0];
  const featuredArtists = artists.filter(a => a.featured);
  const topRated = [...artists].sort((a, b) => b.rating - a.rating);

  if (userRole === 'artist') return <ArtistHome />;

  return (
    <div className="h-full native-scroll bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-700 via-amber-600 to-orange-600 px-5 pt-6 pb-8 rounded-b-[28px]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-amber-200 text-sm">Namaste 🙏</p>
            <h1 className="text-white text-2xl font-bold">{firstName}</h1>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="relative w-11 h-11 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Bell size={20} className="text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center border-2 border-amber-600">3</span>
          </button>
        </div>

        <button
          onClick={() => navigate('/explore')}
          className="w-full flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3.5"
        >
          <Search size={18} className="text-amber-200" />
          <span className="text-amber-100 text-sm">Search artists, skills, crafts...</span>
        </button>
      </div>

      {/* Categories */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-stone-800">Categories</h2>
          <button onClick={() => navigate('/explore')} className="text-amber-600 text-xs font-semibold flex items-center gap-0.5">
            See All <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/explore?category=${cat.name}`)}
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl shadow-sm active:scale-95 transition-transform"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[10px] font-medium text-stone-600 text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Artists */}
      <div className="mt-7 px-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-600" />
            <h2 className="text-lg font-bold text-stone-800">Featured Artists</h2>
          </div>
          <button onClick={() => navigate('/explore')} className="text-amber-600 text-xs font-semibold flex items-center gap-0.5">
            See All <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {featuredArtists.map((artist) => (
            <button
              key={artist.id}
              onClick={() => navigate(`/artist/${artist.id}`)}
              className="min-w-[175px] bg-white rounded-2xl shadow-sm overflow-hidden active:scale-[0.97] transition-transform text-left"
            >
              <div className="h-20 bg-gradient-to-br from-amber-200 to-orange-300 relative">
                <div className="absolute -bottom-5 left-3.5">
                  <Avatar name={artist.name} size="md" />
                </div>
                {artist.verified && (
                  <div className="absolute top-2 right-2">
                    <BadgeCheck size={16} className="text-amber-700 fill-amber-100" />
                  </div>
                )}
              </div>
              <div className="pt-7 pb-3 px-3.5">
                <h3 className="font-semibold text-stone-800 text-sm">{artist.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="text-stone-400" />
                  <span className="text-[10px] text-stone-400">{artist.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-0.5">
                    <Star size={11} className="text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-semibold text-stone-700">{artist.rating}</span>
                  </div>
                  <span className="text-[10px] text-stone-300">•</span>
                  <span className="text-[11px] text-amber-600 font-medium">₹{artist.priceRange.min}+</span>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {artist.skills.slice(0, 2).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[9px] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Top Rated */}
      <div className="mt-7 px-5">
        <h2 className="text-lg font-bold text-stone-800 mb-3">Top Rated</h2>
        <div className="space-y-3">
          {topRated.slice(0, 4).map((artist) => (
            <button
              key={artist.id}
              onClick={() => navigate(`/artist/${artist.id}`)}
              className="w-full flex items-center gap-3.5 bg-white rounded-2xl p-3.5 shadow-sm active:scale-[0.98] transition-transform text-left"
            >
              <Avatar name={artist.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-stone-800 text-sm truncate">{artist.name}</h3>
                  {artist.verified && <BadgeCheck size={14} className="text-amber-600 fill-amber-100 shrink-0" />}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-stone-400" />
                  <span className="text-[11px] text-stone-400">{artist.location}</span>
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {artist.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-[10px] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-0.5">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-base font-bold text-stone-800">{artist.rating}</span>
                </div>
                <span className="text-[10px] text-stone-400">{artist.reviewCount} reviews</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <Clock size={10} className="text-stone-400" />
                  <span className="text-[10px] text-stone-400">{artist.responseTime}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-7 px-5 pb-6">
        <h2 className="text-lg font-bold text-stone-800 mb-3">How It Works</h2>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
          {[
            { step: '1', title: 'Browse Artists', desc: 'Find talent by skill & budget', emoji: '🔍' },
            { step: '2', title: 'Submit Request', desc: 'Describe your custom art needs', emoji: '📝' },
            { step: '3', title: 'Track Progress', desc: 'Chat & monitor order status', emoji: '💬' },
            { step: '4', title: 'Receive Art', desc: 'Get your masterpiece delivered!', emoji: '🎨' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3.5 mb-4 last:mb-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 bg-amber-600 text-white shadow-sm">
                {item.emoji}
              </div>
              <div className="pt-0.5">
                <h4 className="font-semibold text-stone-800 text-sm">{item.title}</h4>
                <p className="text-xs text-stone-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtistHome() {
  const navigate = useNavigate();
  const { currentUserName, orders, currentUserId } = useApp();
  const firstName = currentUserName.split(' ')[0];
  const myOrders = orders.filter(o => o.artistId === currentUserId);
  const pendingRequests = myOrders.filter(o => o.status === 'requested').length;
  const activeOrders = myOrders.filter(o => ['accepted', 'in_progress'].includes(o.status)).length;
  const completedCount = myOrders.filter(o => o.status === 'completed').length;
  const artist = artists.find(a => a.id === currentUserId);

  return (
    <div className="h-full native-scroll bg-stone-50">
      <div className="bg-gradient-to-br from-amber-700 via-amber-600 to-orange-600 px-5 pt-6 pb-8 rounded-b-[28px]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-amber-200 text-sm">Welcome back 🎨</p>
            <h1 className="text-white text-2xl font-bold">{firstName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              artist?.availability === 'available' ? 'bg-green-500/20 text-green-200' : 'bg-amber-500/20 text-amber-200'
            )}>
              {artist?.availability === 'available' ? '🟢 Available' : '🟡 Busy'}
            </div>
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-11 h-11 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Bell size={20} className="text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">{pendingRequests}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pending', value: pendingRequests, color: 'text-yellow-200' },
            { label: 'Active', value: activeOrders, color: 'text-blue-200' },
            { label: 'Completed', value: completedCount, color: 'text-green-200' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className={cn('text-2xl font-bold text-white')}>{stat.value}</p>
              <p className="text-[11px] text-amber-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-6">
        <h2 className="text-lg font-bold text-stone-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/orders')} className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.97] transition-transform">
            <span className="text-2xl">📋</span>
            <h3 className="font-semibold text-stone-800 text-sm mt-2">View Orders</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">Manage all requests</p>
          </button>
          <button onClick={() => navigate('/chat')} className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.97] transition-transform">
            <span className="text-2xl">💬</span>
            <h3 className="font-semibold text-stone-800 text-sm mt-2">Messages</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">Chat with customers</p>
          </button>
          <button onClick={() => navigate('/earnings')} className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.97] transition-transform">
            <span className="text-2xl">💰</span>
            <h3 className="font-semibold text-stone-800 text-sm mt-2">Earnings</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">₹{(artist?.earnings || 0).toLocaleString('en-IN')}</p>
          </button>
          <button onClick={() => navigate('/profile')} className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.97] transition-transform">
            <span className="text-2xl">👤</span>
            <h3 className="font-semibold text-stone-800 text-sm mt-2">Profile</h3>
            <p className="text-[11px] text-stone-400 mt-0.5">Edit your portfolio</p>
          </button>
        </div>
      </div>

      <div className="px-5 mt-6 pb-6">
        <h2 className="text-lg font-bold text-stone-800 mb-3">Recent Requests</h2>
        <div className="space-y-3">
          {myOrders.slice(0, 3).map(order => (
            <button
              key={order.id}
              onClick={() => navigate(`/order/${order.id}`)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-stone-800 text-sm truncate flex-1">{order.title}</h3>
                <span className={cn(
                  'px-2.5 py-0.5 rounded-full text-[10px] font-semibold ml-2 shrink-0',
                  order.status === 'requested' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                  order.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-stone-100 text-stone-600'
                )}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-stone-500">{order.customerName} • ₹{order.budget.toLocaleString('en-IN')}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
