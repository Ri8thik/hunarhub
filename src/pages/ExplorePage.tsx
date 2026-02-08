import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, MapPin, Star, Clock, BadgeCheck } from 'lucide-react';
import { artists, categories } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/utils/cn';

export function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || '';
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high' | 'reviews'>('rating');
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 50000]);

  const filtered = useMemo(() => {
    let results = [...artists];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.skills.some(s => s.toLowerCase().includes(q)) ||
        a.location.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      results = results.filter(a => a.skills.includes(selectedCategory));
    }
    results = results.filter(a =>
      a.priceRange.min >= budgetRange[0] && a.priceRange.min <= budgetRange[1]
    );
    switch (sortBy) {
      case 'rating': results.sort((a, b) => b.rating - a.rating); break;
      case 'price_low': results.sort((a, b) => a.priceRange.min - b.priceRange.min); break;
      case 'price_high': results.sort((a, b) => b.priceRange.min - a.priceRange.min); break;
      case 'reviews': results.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }
    return results;
  }, [search, selectedCategory, sortBy, budgetRange]);

  return (
    <div className="h-full flex flex-col bg-stone-50">
      {/* Sticky Header */}
      <div className="bg-white px-5 pt-3 pb-3 shadow-sm shrink-0 z-40">
        <h1 className="text-lg font-bold text-stone-800 mb-2">Explore Artists</h1>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-3 text-stone-400" />
            <input type="text" placeholder="Search artists, skills..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 pl-9 bg-stone-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-3">
                <X size={14} className="text-stone-400" />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={cn('w-10 h-10 rounded-xl flex items-center justify-center', showFilters ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600')}>
            <SlidersHorizontal size={17} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto mt-2 -mx-5 px-5 scrollbar-hide">
          <button onClick={() => setSelectedCategory('')}
            className={cn('px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0', !selectedCategory ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600')}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
              className={cn('px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0', selectedCategory === cat.name ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600')}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border-b border-stone-100 px-5 py-3 space-y-3 animate-slide-up shrink-0">
          <div>
            <label className="text-[11px] font-semibold text-stone-600 mb-1.5 block">Sort By</label>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: 'rating', label: '⭐ Rating' },
                { key: 'price_low', label: '💰 Low Price' },
                { key: 'price_high', label: '💎 High Price' },
                { key: 'reviews', label: '📝 Reviews' },
              ].map(opt => (
                <button key={opt.key} onClick={() => setSortBy(opt.key as typeof sortBy)}
                  className={cn('px-2.5 py-1.5 rounded-lg text-[11px] font-medium', sortBy === opt.key ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' : 'bg-stone-100 text-stone-600')}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-stone-600 mb-1 block">
              Budget: ₹{budgetRange[0].toLocaleString('en-IN')} - ₹{budgetRange[1].toLocaleString('en-IN')}
            </label>
            <input type="range" min={0} max={50000} step={500} value={budgetRange[1]}
              onChange={e => setBudgetRange([0, Number(e.target.value)])}
              className="w-full accent-amber-600 h-1.5" />
          </div>
        </div>
      )}

      {/* Scrollable Results */}
      <div className="flex-1 native-scroll px-5 pt-3 pb-4">
        <p className="text-[11px] text-stone-400 mb-2">{filtered.length} artists found</p>
        <div className="space-y-2.5">
          {filtered.map(artist => (
            <button key={artist.id} onClick={() => navigate(`/artist/${artist.id}`)}
              className="w-full bg-white rounded-2xl p-3.5 shadow-sm active:scale-[0.98] transition-transform text-left">
              <div className="flex items-start gap-3">
                <Avatar name={artist.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-stone-800 text-sm truncate">{artist.name}</h3>
                    {artist.verified && <BadgeCheck size={13} className="text-amber-600 fill-amber-100 shrink-0" />}
                    <span className={cn(
                      'ml-auto px-2 py-0.5 rounded-full text-[9px] font-medium shrink-0',
                      artist.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {artist.availability === 'available' ? '🟢' : '🟡'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-stone-400" />
                    <span className="text-[10px] text-stone-400">{artist.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <div className="flex items-center gap-0.5">
                      <Star size={11} className="text-amber-500 fill-amber-500" />
                      <span className="text-[11px] font-semibold text-stone-700">{artist.rating}</span>
                      <span className="text-[9px] text-stone-400">({artist.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Clock size={10} className="text-stone-400" />
                      <span className="text-[10px] text-stone-400">{artist.responseTime}</span>
                    </div>
                    <span className="text-[10px] font-medium text-amber-700">₹{artist.priceRange.min}+</span>
                  </div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {artist.skills.map(skill => (
                      <span key={skill} className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded-full text-[9px] font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">🔍</span>
            <h3 className="text-base font-semibold text-stone-700 mt-3">No artists found</h3>
            <p className="text-xs text-stone-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
