import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, Star, Clock, BadgeCheck, Sparkles, TrendingUp, ShoppingBag, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

export function HomePage() {
  const { userRole, currentUserName, artists, categories, artistsLoading, categoriesLoading, currentUserId, currentUserEmail } = useApp();
  const firstName = currentUserName.split(' ')[0];

  if (userRole === 'artist') return <ArtistDashboard />;

  // const featuredArtists = artists.filter(a => a.featured);
  const featuredArtists = artists.filter(a => a.id !== currentUserId && a.uid !== currentUserId && a.email !== currentUserEmail).slice(0, 6)
  // const topRated = [...artists].sort((a, b) => b.rating - a.rating);
  const topRated = [...artists].filter(a => a.id !== currentUserId && a.uid !== currentUserId && a.email !== currentUserEmail).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4)
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-6 lg:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/20 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-amber-200 text-sm lg:text-base">Namaste 🙏</p>
          <h1 className="text-2xl lg:text-4xl font-extrabold text-white mt-1">{firstName}, find your perfect artist</h1>
          <p className="text-amber-100/80 mt-2 text-sm lg:text-base max-w-xl">
            Connect with talented artists & craftsmen for custom art, portraits, home decor, and more.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="mt-4 lg:mt-6 flex items-center gap-2 bg-white text-amber-700 px-5 py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Search size={16} /> Explore Artists
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-bold text-stone-800">Browse Categories</h2>
          <button onClick={() => navigate('/explore')} className="text-amber-600 text-sm font-semibold flex items-center gap-0.5 hover:underline">
            See All <ChevronRight size={16} />
          </button>
        </div>
        {categoriesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-amber-600" />
            <span className="ml-2 text-sm text-stone-500">Loading categories...</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/explore?category=${cat.name}`)}
                className="flex flex-col items-center gap-2 p-3 lg:p-4 bg-white rounded-2xl shadow-sm hover-lift border border-stone-100"
              >
                <span className="text-2xl lg:text-3xl">{cat.icon}</span>
                <span className="text-[11px] lg:text-xs font-medium text-stone-600 text-center leading-tight">{cat.name}</span>
                <span className="text-[9px] text-stone-400">{cat.count} artists</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Featured Artists */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-amber-600" />
            <h2 className="text-lg lg:text-xl font-bold text-stone-800">Featured Artists</h2>
          </div>
          <button onClick={() => navigate('/explore')} className="text-amber-600 text-sm font-semibold flex items-center gap-0.5 hover:underline">
            View All <ChevronRight size={16} />
          </button>
        </div>
        {artistsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-amber-600" />
            <span className="ml-2 text-sm text-stone-500">Loading artists...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredArtists.map((artist) => (
              <button
                key={artist.id}
                onClick={() => navigate(`/artist/${artist.id}`)}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover-lift border border-stone-100 text-left"
              >
                <div className="h-28 lg:h-32 bg-gradient-to-br from-amber-200 to-orange-300 relative">
                  <div className="absolute -bottom-6 left-4">
                    <Avatar name={artist.name} size="lg" className="ring-4 ring-white" />
                  </div>
                  {artist.verified && (
                    <div className="absolute top-3 right-3">
                      <BadgeCheck size={18} className="text-amber-700 fill-amber-100" />
                    </div>
                  )}
                </div>
                <div className="pt-9 pb-4 px-4">
                  <h3 className="font-semibold text-stone-800">{artist.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-stone-400" />
                    <span className="text-xs text-stone-400">{artist.location}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-0.5">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold text-stone-700">{artist.rating}</span>
                      <span className="text-xs text-stone-400">({artist.reviewCount})</span>
                    </div>
                    <span className="text-sm text-amber-600 font-medium">₹{artist.priceRange.min}+</span>
                  </div>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {artist.skills.map(skill => (
                      <span key={skill} className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[11px] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Top Rated */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-bold text-stone-800 mb-4">Top Rated Artists</h2>
        {artistsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-amber-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topRated.slice(0, 6).map((artist) => (
              <button
                key={artist.id}
                onClick={() => navigate(`/artist/${artist.id}`)}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover-lift border border-stone-100 text-left"
              >
                <Avatar name={artist.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-stone-800 truncate">{artist.name}</h3>
                    {artist.verified && <BadgeCheck size={15} className="text-amber-600 fill-amber-100 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-stone-400" />
                    <span className="text-xs text-stone-400">{artist.location}</span>
                  </div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {artist.skills.map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-[10px] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-0.5">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-lg font-bold text-stone-800">{artist.rating}</span>
                  </div>
                  <span className="text-[11px] text-stone-400">{artist.reviewCount} reviews</span>
                  <div className="flex items-center gap-0.5 mt-0.5 justify-end">
                    <Clock size={11} className="text-stone-400" />
                    <span className="text-[11px] text-stone-400">{artist.responseTime}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="mb-8">
        <h2 className="text-lg lg:text-xl font-bold text-stone-800 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Browse Artists', desc: 'Find talent by skill, location & budget', emoji: '🔍', color: 'from-blue-50 to-blue-100 border-blue-200' },
            { step: '2', title: 'Submit Request', desc: 'Describe your custom art needs in detail', emoji: '📝', color: 'from-amber-50 to-amber-100 border-amber-200' },
            { step: '3', title: 'Track Progress', desc: 'Chat with artists & monitor order status', emoji: '💬', color: 'from-green-50 to-green-100 border-green-200' },
            { step: '4', title: 'Receive Art', desc: 'Get your custom masterpiece delivered!', emoji: '🎨', color: 'from-purple-50 to-purple-100 border-purple-200' },
          ].map((item) => (
            <div key={item.step} className={cn('bg-gradient-to-br rounded-2xl p-5 border', item.color)}>
              <span className="text-3xl">{item.emoji}</span>
              <h4 className="font-bold text-stone-800 mt-3">Step {item.step}: {item.title}</h4>
              <p className="text-sm text-stone-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtistDashboard() {
  const navigate = useNavigate();
  const { currentUserName, orders, currentUserId, artists } = useApp();
  const firstName = currentUserName.split(' ')[0];
  const myOrders = orders.filter(o => o.artistId === currentUserId);
  const pendingRequests = myOrders.filter(o => o.status === 'requested').length;
  const activeOrders = myOrders.filter(o => ['accepted', 'in_progress'].includes(o.status)).length;
  const completedCount = myOrders.filter(o => o.status === 'completed').length;
  const deliveredCount = myOrders.filter(o => o.status === 'delivered').length;
  const artist = artists.find(a => a.id === currentUserId);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-6 lg:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-amber-200 text-sm">Welcome back 🎨</p>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">{firstName}'s Studio</h1>
              <div className={cn(
                'inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium',
                artist?.availability === 'available' ? 'bg-green-500/20 text-green-200' : 'bg-amber-500/20 text-amber-200'
              )}>
                {artist?.availability === 'available' ? '🟢 Available for Orders' : '🟡 Busy'}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-amber-200 text-xs">Total Earnings</p>
              <p className="text-2xl lg:text-3xl font-bold text-white">₹{(artist?.earnings || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
        {[
          { label: 'Pending Requests', value: pendingRequests, icon: Clock, color: 'text-blue-600 bg-blue-100', trend: '+2 new' },
          { label: 'Active Orders', value: activeOrders, icon: ShoppingBag, color: 'text-amber-600 bg-amber-100', trend: 'In progress' },
          { label: 'Delivered', value: deliveredCount, icon: TrendingUp, color: 'text-purple-600 bg-purple-100', trend: 'Awaiting review' },
          { label: 'Completed', value: completedCount, icon: Star, color: 'text-green-600 bg-green-100', trend: `⭐ ${artist?.rating || 0}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.color)}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] text-stone-400 font-medium">{stat.trend}</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-stone-800">{stat.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-stone-800 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {[
              { label: 'View Orders', desc: 'Manage requests', emoji: '📋', path: '/orders' },
              { label: 'Messages', desc: 'Chat with customers', emoji: '💬', path: '/chat' },
              { label: 'Earnings', desc: `₹${((artist?.earnings || 0) / 1000).toFixed(0)}k total`, emoji: '💰', path: '/earnings' },
              { label: 'Profile', desc: 'Edit portfolio', emoji: '👤', path: '/profile' },
            ].map(action => (
              <button key={action.label} onClick={() => navigate(action.path)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 hover-lift text-left">
                <span className="text-2xl">{action.emoji}</span>
                <h3 className="font-semibold text-stone-800 text-sm mt-2">{action.label}</h3>
                <p className="text-[11px] text-stone-400 mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-stone-800 mb-3">Recent Orders</h2>
          <div className="space-y-3">
            {myOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
                <span className="text-4xl">📋</span>
                <p className="text-stone-400 mt-3">No orders yet</p>
              </div>
            ) : myOrders.map(order => (
              <button
                key={order.id}
                onClick={() => navigate(`/order/${order.id}`)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-stone-100 hover-lift text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-stone-800 truncate flex-1">{order.title}</h3>
                  <span className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-semibold ml-3 shrink-0',
                    order.status === 'requested' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'delivered' ? 'bg-purple-100 text-purple-700' :
                    'bg-stone-100 text-stone-600'
                  )}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-stone-500">{order.customerName} • ₹{order.budget.toLocaleString('en-IN')} • {order.category}</p>
                <p className="text-xs text-stone-400 mt-1">Deadline: {order.deadline}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
