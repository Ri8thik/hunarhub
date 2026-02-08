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
    return <div className="h-full flex items-center justify-center"><p className="text-stone-500">Artist not found</p></div>;
  }

  const artistReviews = reviews.filter(r => r.artistId === id);

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="flex-1 native-scroll">
        {/* Hero */}
        <div className="relative">
          <div className="h-36 bg-gradient-to-br from-amber-300 via-orange-300 to-rose-300" />
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex gap-2">
              <button onClick={() => setLiked(!liked)} className="w-9 h-9 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Heart size={18} className={cn('text-white', liked && 'fill-red-500 text-red-500')} />
              </button>
              <button className="w-9 h-9 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Share2 size={18} className="text-white" />
              </button>
            </div>
          </div>
          <div className="absolute -bottom-10 left-4">
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

        <div className="pt-14 px-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-stone-800">{artist.name}</h1>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={12} className="text-stone-400" />
                <span className="text-xs text-stone-500">{artist.location}</span>
              </div>
            </div>
            <span className={cn(
              'px-2.5 py-0.5 rounded-full text-[10px] font-medium',
              artist.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            )}>
              {artist.availability === 'available' ? '🟢 Available' : '🟡 Busy'}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-0.5">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span className="font-bold text-stone-800 text-sm">{artist.rating}</span>
              <span className="text-[10px] text-stone-400">({artist.reviewCount})</span>
            </div>
            <div className="w-px h-3.5 bg-stone-200" />
            <div className="flex items-center gap-0.5">
              <ShoppingBag size={12} className="text-stone-400" />
              <span className="text-xs text-stone-600">{artist.completedOrders}</span>
            </div>
            <div className="w-px h-3.5 bg-stone-200" />
            <div className="flex items-center gap-0.5">
              <Clock size={12} className="text-stone-400" />
              <span className="text-xs text-stone-600">{artist.responseTime}</span>
            </div>
          </div>

          <div className="flex gap-1.5 mt-3 flex-wrap">
            {artist.skills.map(skill => (
              <span key={skill} className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[11px] font-medium border border-amber-200">
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
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

          {/* Tabs */}
          <div className="flex mt-4 bg-stone-100 rounded-xl p-1">
            {(['portfolio', 'reviews', 'about'] as Tab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn('flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all', activeTab === tab ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500')}>
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-3">
            {activeTab === 'portfolio' && (
              <div className="grid grid-cols-2 gap-2.5">
                {artist.portfolio.map((item, idx) => (
                  <div key={item.id} className={cn('aspect-square rounded-2xl bg-gradient-to-br flex items-end p-2.5 relative overflow-hidden', getPortfolioColor(idx))}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="relative z-10">
                      <h4 className="text-white text-xs font-semibold">{item.title}</h4>
                      <span className="text-white/70 text-[9px]">{item.category}</span>
                    </div>
                    <div className="absolute top-2 right-2 z-10">
                      <span className="text-2xl opacity-60">
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
                  <div className="text-center py-6"><span className="text-3xl">⭐</span><p className="text-stone-400 mt-2 text-sm">No reviews yet</p></div>
                ) : artistReviews.map(review => (
                  <div key={review.id} className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar name={review.customerName} size="sm" />
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-stone-800">{review.customerName}</h4>
                        <span className="text-[10px] text-stone-400">{review.date}</span>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size={11} showValue={false} />
                    <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <h3 className="font-semibold text-stone-800 text-xs mb-1.5">About</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{artist.bio}</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm space-y-2">
                  {[
                    ['Member since', artist.joinedDate],
                    ['Response time', artist.responseTime],
                    ['Orders done', String(artist.completedOrders)],
                    ['Phone', artist.phone],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-xs text-stone-500">{label}</span>
                      <span className="text-xs text-stone-700 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-white border-t border-stone-200 p-3 flex gap-2.5 shrink-0">
        <button onClick={() => navigate('/chat')}
          className="w-12 h-11 border-2 border-amber-600 rounded-xl flex items-center justify-center text-amber-600">
          <MessageSquare size={20} />
        </button>
        <button onClick={() => navigate(`/request/${artist.id}`)}
          className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-amber-200 active:scale-[0.97] transition-transform">
          🎨 Request Custom Art
        </button>
      </div>
    </div>
  );
}
