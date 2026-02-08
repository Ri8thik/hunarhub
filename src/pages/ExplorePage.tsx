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
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Search & Filters Header */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search artists, skills, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <X size={16} className="text-stone-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all',
            showFilters ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300'
          )}
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={cn(
            'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all',
            !selectedCategory ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300'
          )}
        >All Artists</button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all',
              selectedCategory === cat.name ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300'
            )}
          >{cat.icon} {cat.name}</button>
        ))}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-4 animate-slide-down shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-2 block">Sort By</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'rating', label: '⭐ Rating' },
                  { key: 'price_low', label: '💰 Low Price' },
                  { key: 'price_high', label: '💎 High Price' },
                  { key: 'reviews', label: '📝 Most Reviews' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key as typeof sortBy)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                      sortBy === opt.key ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    )}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-2 block">
                Budget Range: ₹0 - ₹{budgetRange[1].toLocaleString('en-IN')}
              </label>
              <input
                type="range" min={0} max={50000} step={500} value={budgetRange[1]}
                onChange={e => setBudgetRange([0, Number(e.target.value)])}
                className="w-full accent-amber-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-stone-400 mb-4">{filtered.length} artists found</p>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(artist => (
          <button
            key={artist.id}
            onClick={() => navigate(`/artist/${artist.id}`)}
            className="bg-white rounded-2xl p-5 shadow-sm hover-lift border border-stone-100 text-left"
          >
            <div className="flex items-start gap-4">
              <Avatar name={artist.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-stone-800 truncate">{artist.name}</h3>
                  {artist.verified && <BadgeCheck size={15} className="text-amber-600 fill-amber-100 shrink-0" />}
                  <span className={cn(
                    'ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0',
                    artist.availability === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {artist.availability === 'available' ? '🟢 Available' : '🟡 Busy'}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-stone-400" />
                  <span className="text-xs text-stone-400">{artist.location}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1.5 line-clamp-2">{artist.bio}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-0.5">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-stone-700">{artist.rating}</span>
                    <span className="text-[11px] text-stone-400">({artist.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Clock size={12} className="text-stone-400" />
                    <span className="text-xs text-stone-400">{artist.responseTime}</span>
                  </div>
                  <span className="text-xs font-semibold text-amber-700">₹{artist.priceRange.min}+</span>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {artist.skills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-[10px] font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl">🔍</span>
          <h3 className="text-lg font-semibold text-stone-700 mt-4">No artists found</h3>
          <p className="text-sm text-stone-400 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
