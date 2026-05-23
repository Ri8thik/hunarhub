import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, MapPin, Star, Clock, BadgeCheck, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useApp } from '@/context/AppContext';


export function ExplorePage() {
  const navigate = useNavigate();
  const { artists, categories, artistsLoading, currentUserId, currentUserEmail } = useApp();
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || '';
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high' | 'reviews'>('rating');
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 50000]);

  const filtered = useMemo(() => {
    let results = [...artists].filter(a => a.id !== currentUserId && a.email !== currentUserEmail);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.skills.some(s => s.toLowerCase().includes(q)) ||
        a.location.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) results = results.filter(a => a.skills.includes(selectedCategory));
    results = results.filter(a => a.priceRange.min >= budgetRange[0] && a.priceRange.min <= budgetRange[1]);
    switch (sortBy) {
      case 'rating': results.sort((a, b) => b.rating - a.rating); break;
      case 'price_low': results.sort((a, b) => a.priceRange.min - b.priceRange.min); break;
      case 'price_high': results.sort((a, b) => b.priceRange.min - a.priceRange.min); break;
      case 'reviews': results.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }
    return results;
  }, [search, selectedCategory, sortBy, budgetRange, artists]);

  return (
    <>
      <div className="p-4 lg:p-8 common-page-bg">
        {/* Search + Filter */}
        <div className="ep-search-wrap">
          <div className="ep-search-input-wrap">
            <span className="ep-search-icon"><Search size={16} color="#94a3b8" /></span>
            <input
              className="ep-search-input"
              type="text"
              placeholder="Search artists, skills, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="ep-clear-btn" onClick={() => setSearch('')}>
                <X size={12} color="#64748b" />
              </button>
            )}
          </div>
          <button
            className={`ep-filter-btn ${showFilters ? 'on' : 'off'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

        {/* Category Pills */}
        <div className="ep-pills-wrap">
          <button className={`ep-pill ${!selectedCategory ? 'active' : 'inactive'}`} onClick={() => setSelectedCategory('')}>
            All Artists
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`ep-pill ${selectedCategory === cat.name ? 'active' : 'inactive'}`}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="ep-filter-panel">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d97706', marginBottom: 10 }}>
                  Sort By
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { key: 'rating', label: '⭐ Rating' },
                    { key: 'price_low', label: '💰 Low Price' },
                    { key: 'price_high', label: '💎 High Price' },
                    { key: 'reviews', label: '📝 Reviews' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      className={`ep-sort-chip ${sortBy === opt.key ? 'active' : 'inactive'}`}
                      onClick={() => setSortBy(opt.key as typeof sortBy)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d97706', marginBottom: 10 }}>
                  Budget: ₹0 – ₹{budgetRange[1].toLocaleString('en-IN')}
                </div>
                <input
                  type="range" min={0} max={50000} step={500}
                  value={budgetRange[1]}
                  onChange={e => setBudgetRange([0, Number(e.target.value)])}
                  style={{ width: '100%', accentColor: '#d97706' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Count */}
        <div className="ep-count-text">
          🎨 {filtered.length} artists found
        </div>

        {/* Results */}
        {artistsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: 12 }}>
            <Loader2 size={28} className="animate-spin" style={{ color: '#d97706' }} />
            <span style={{ color: '#94a3b8' }}>Loading artists from database...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, display: 'block' }}>🔍</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: 6 }} className="dark:text-gray-100">No artists found</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filtered.map((artist, i) => (
              <button
                key={artist.id}
                className="ep-artist-card"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => navigate(`/artist/${artist.id}`)}
              >
                {/* Header: Avatar + Name/Location/Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0 }}>
                  <Avatar name={artist.name} size="lg" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} className="hp-card-name">
                        {artist.name}
                      </span>
                      {artist.verified && <BadgeCheck size={15} color="#d97706" />}
                      <span className={`ep-avail-badge ${artist.availability === 'available' ? 'on' : 'off'}`}>
                        {artist.availability === 'available' ? '● Available' : '● Busy'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} color="#94a3b8" />
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artist.location}</span>
                    </div>
                  </div>
                </div>

                {/* Bio — always 2 lines of space */}
                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, flex: 1, margin: '8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} className="dark:text-gray-400">
                  {artist.bio || '\u00A0'}
                </p>

                {/* Stats row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={12} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800 }} className="hp-card-rating">{artist.rating}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({artist.reviewCount})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} color="#94a3b8" />
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{artist.responseTime}</span>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '0.85rem', fontWeight: 800, color: '#d97706' }} className="dark:text-amber-400">
                    ₹{artist.priceRange.min}+
                  </span>
                </div>

                {/* Skills — single row, no wrap */}
                <div style={{ display: 'flex', gap: 5, overflow: 'hidden', flexShrink: 0 }}>
                  {artist.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="ep-skill-chip" style={{ whiteSpace: 'nowrap' }}>{skill}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}