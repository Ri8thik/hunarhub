import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, BadgeCheck, Share2, Heart, MessageSquare, ShoppingBag } from 'lucide-react';
import { artists, reviews, getPortfolioColor } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { StarRating } from '@/components/StarRating';
import { cn } from '@/utils/cn';

type Tab = 'portfolio' | 'reviews' | 'about';

export function ArtistProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');
  const [liked, setLiked] = useState(false);

  const artist = artists.find(a => a.id === id);
  if (!artist) {
    return <div className="flex items-center justify-center h-64"><p className="text-stone-500">Artist not found</p></div>;
  }

  const artistReviews = reviews.filter(r => r.artistId === id);

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 animate-fade-in">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4 transition-colors">
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Artist Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden sticky top-4">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-br from-amber-300 via-orange-300 to-rose-300 relative">
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => setLiked(!liked)} className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart size={16} className={cn(liked ? 'fill-red-500 text-red-500' : 'text-stone-600')} />
                </button>
                <button className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Share2 size={16} className="text-stone-600" />
                </button>
              </div>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <Avatar name={artist.name} size="xl" className="ring-4 ring-white" />
                  {artist.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center ring-2 ring-white">
                      <BadgeCheck size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-14 px-5 pb-5 text-center">
              <h1 className="text-xl font-bold text-stone-800">{artist.name}</h1>
              <div className="flex items-center justify-center gap-1 mt-1">
                <MapPin size={13} className="text-stone-400" />
                <span className="text-sm text-stone-500">{artist.location}</span>
              </div>

              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="text-center">
                  <div className="flex items-center gap-0.5 justify-center">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="font-bold text-stone-800">{artist.rating}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">{artist.reviewCount} reviews</span>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <div className="text-center">
                  <div className="flex items-center gap-0.5 justify-center">
                    <ShoppingBag size={14} className="text-stone-500" />
                    <span className="font-bold text-stone-800">{artist.completedOrders}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">Orders</span>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <div className="text-center">
                  <div className="flex items-center gap-0.5 justify-center">
                    <Clock size={14} className="text-stone-500" />
                    <span className="font-bold text-stone-800 text-sm">{artist.responseTime}</span>
                  </div>
                  <span className="text-[10px] text-stone-400">Response</span>
                </div>
              </div>

              <span className={cn(
                'inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-medium',
                artist.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              )}>
                {artist.availability === 'available' ? '🟢 Available' : '🟡 Busy'}
              </span>

              <div className="flex gap-1.5 mt-3 flex-wrap justify-center">
                {artist.skills.map(skill => (
                  <span key={skill} className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500">From</span>
                    <p className="text-lg font-bold text-amber-700">₹{artist.priceRange.min.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500">Up to</span>
                    <p className="text-lg font-bold text-stone-700">₹{artist.priceRange.max.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => navigate('/chat')}
                  className="flex-1 py-3 border-2 border-amber-600 text-amber-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-50 transition-colors">
                  <MessageSquare size={16} /> Chat
                </button>
                <button onClick={() => navigate(`/request/${artist.id}`)}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
                  🎨 Request Art
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex bg-white rounded-xl p-1 mb-4 border border-stone-200 shadow-sm">
            {(['portfolio', 'reviews', 'about'] as Tab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all',
                  activeTab === tab ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'
                )}>
                {tab === 'portfolio' ? `📁 Portfolio (${artist.portfolio.length})` :
                 tab === 'reviews' ? `⭐ Reviews (${artistReviews.length})` : '📋 About'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'portfolio' && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {artist.portfolio.map((item, idx) => (
                  <div key={item.id}
                    className={cn(
                      'aspect-square rounded-2xl bg-gradient-to-br flex items-end p-3 relative overflow-hidden cursor-pointer hover-lift',
                      getPortfolioColor(idx)
                    )}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="relative z-10">
                      <h4 className="text-white text-sm font-semibold">{item.title}</h4>
                      <span className="text-white/70 text-xs">{item.category}</span>
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-3xl opacity-60">
                        {item.category === 'Portrait' ? '🎨' : item.category === 'Sketch' ? '✏️' : item.category === 'Painting' ? '🖼️' :
                         item.category === 'Digital Art' ? '💻' : item.category === 'Calligraphy' ? '🖋️' : item.category === 'Sculpture' ? '🗿' :
                         item.category === 'Home Decor' ? '🏠' : '🧶'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-3">
                {artistReviews.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
                    <span className="text-4xl">⭐</span>
                    <p className="text-stone-400 mt-3">No reviews yet</p>
                  </div>
                ) : artistReviews.map(review => (
                  <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar name={review.customerName} size="sm" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-stone-800">{review.customerName}</h4>
                        <span className="text-xs text-stone-400">{review.date}</span>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size={14} showValue={false} />
                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
                  <h3 className="font-semibold text-stone-800 mb-2">About</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{artist.bio}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
                  <h3 className="font-semibold text-stone-800 mb-3">Details</h3>
                  <div className="space-y-3">
                    {[
                      ['Member since', artist.joinedDate],
                      ['Response time', artist.responseTime],
                      ['Orders completed', String(artist.completedOrders)],
                      ['Phone', artist.phone],
                      ['Email', artist.email],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">{label}</span>
                        <span className="text-sm text-stone-700 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
