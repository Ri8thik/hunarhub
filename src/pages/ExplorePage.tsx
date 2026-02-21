import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, MapPin, Star, Clock, BadgeCheck, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useApp } from '@/context/AppContext';

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Search bar ── */
  .ep-search-wrap {
    display: flex; gap: 10px; margin-bottom: 14px;
  }
  .ep-search-input-wrap {
    flex: 1; position: relative;
  }
  .ep-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    pointer-events: none;
  }
  .ep-search-input {
    width: 100%; padding: 12px 40px 12px 42px;
    background: #fff; border: 1.5px solid #e2e8f0;
    border-radius: 14px; font-size: 0.875rem;
    color: #1e293b;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    box-sizing: border-box;
  }
  .dark .ep-search-input { background: #0f172a; border-color: #1e293b; color: #f1f5f9; }
  .ep-search-input::placeholder { color: #94a3b8; }
  .ep-search-input:focus {
    outline: none; border-color: #d97706;
    box-shadow: 0 0 0 3px rgba(217,119,6,0.12);
  }
  .ep-clear-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: #f1f5f9; border: none; border-radius: 50%;
    width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s;
  }
  .dark .ep-clear-btn { background: #334155; }
  .ep-clear-btn:hover { background: #e2e8f0; }

  .ep-filter-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 18px; border-radius: 14px;
    font-size: 0.875rem; font-weight: 700;
    cursor: pointer; border: 1.5px solid;
    transition: all 0.2s; flex-shrink: 0;
  }
  .ep-filter-btn.off {
    background: #fff; color: #475569; border-color: #e2e8f0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .dark .ep-filter-btn.off { background: #0f172a; color: #94a3b8; border-color: #1e293b; }
  .ep-filter-btn.on {
    background: linear-gradient(135deg, #d97706, #ea580c);
    color: #fff; border-color: transparent;
    box-shadow: 0 4px 14px rgba(217,119,6,0.35);
  }
  .ep-filter-btn:hover { transform: translateY(-1px); }

  /* ── Category pills ── */
  .ep-pills-wrap {
    display: flex; gap: 8px; overflow-x: auto;
    padding-bottom: 8px; margin-bottom: 8px;
    scrollbar-width: none;
  }
  .ep-pills-wrap::-webkit-scrollbar { display: none; }

  .ep-pill {
    padding: 7px 16px; border-radius: 99px;
    font-size: 0.78rem; font-weight: 700;
    white-space: nowrap; flex-shrink: 0;
    cursor: pointer; border: 1.5px solid;
    transition: all 0.2s;
  }
  .ep-pill.active {
    background: linear-gradient(135deg, #d97706, #ea580c);
    color: #fff; border-color: transparent;
    box-shadow: 0 3px 10px rgba(217,119,6,0.3);
  }
  .ep-pill.inactive {
    background: #fff; color: #475569; border-color: #e2e8f0;
  }
  .dark .ep-pill.inactive { background: #0f172a; color: #94a3b8; border-color: #1e293b; }
  .ep-pill.inactive:hover { border-color: #fde68a; color: #d97706; }
  .dark .ep-pill.inactive:hover { border-color: #78350f; color: #fbbf24; }

  /* ── Filter panel ── */
  .ep-filter-panel {
    background: #fff; border: 1.5px solid #e2e8f0;
    border-radius: 18px; padding: 18px; margin-bottom: 14px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    animation: slideDown 0.25s ease;
  }
  .dark .ep-filter-panel { background: #0f172a; border-color: #1e293b; }

  .ep-sort-chip {
    padding: 7px 14px; border-radius: 10px;
    font-size: 0.78rem; font-weight: 700;
    cursor: pointer; border: 1.5px solid; transition: all 0.2s;
  }
  .ep-sort-chip.active {
    background: #fffbeb; color: #92400e; border-color: #fde68a;
    box-shadow: 0 2px 6px rgba(217,119,6,0.15);
  }
  .dark .ep-sort-chip.active { background: #1c0a00; color: #fcd34d; border-color: #78350f; }
  .ep-sort-chip.inactive {
    background: #f8fafc; color: #64748b; border-color: #e2e8f0;
  }
  .dark .ep-sort-chip.inactive { background: #1e293b; color: #94a3b8; border-color: #334155; }
  .ep-sort-chip.inactive:hover { border-color: #fde68a; }
  .dark .ep-sort-chip.inactive:hover { border-color: #78350f; }

  /* ── Artist card ── */
  .ep-artist-card {
    background: #fff; border-radius: 18px;
    border: 1.5px solid #f1f5f9;
    padding: 16px; cursor: pointer; text-align: left;
    transition: all 0.28s ease;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    animation: fadeInUp 0.4s ease both;
    display: flex; flex-direction: column;
    width: 100%; height: 220px;
    box-sizing: border-box;
  }
  .dark .ep-artist-card {
    background: #0f172a; border-color: #1e293b;
    box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  }
  .ep-artist-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(217,119,6,0.16);
    border-color: #fde68a;
  }
  .dark .ep-artist-card:hover {
    box-shadow: 0 12px 28px rgba(217,119,6,0.18);
    border-color: #78350f;
  }

  .ep-avail-badge {
    padding: 3px 10px; border-radius: 99px;
    font-size: 0.68rem; font-weight: 800;
    flex-shrink: 0;
  }
  .ep-avail-badge.on { background: #d1fae5; color: #065f46; }
  .dark .ep-avail-badge.on { background: rgba(20,83,45,0.2); color: #6ee7b7; }
  .ep-avail-badge.off { background: #fef3c7; color: #92400e; }
  .dark .ep-avail-badge.off { background: rgba(120,53,15,0.2); color: #fcd34d; }

  .ep-skill-chip {
    padding: 3px 9px; border-radius: 99px;
    font-size: 0.67rem; font-weight: 600;
    background: #f1f5f9; color: #475569; border: none;
  }
  .dark .ep-skill-chip { background: #1e293b; color: #94a3b8; }

  .ep-count-text {
    font-size: 0.8rem; color: #94a3b8; margin-bottom: 12px;
    padding: 6px 12px; background: #f8fafc; border-radius: 8px;
    display: inline-block; border: 1px solid #f1f5f9;
  }
  .dark .ep-count-text { background: #0f172a; border-color: #1e293b; }
`

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
      <style>{styles}</style>
      <div className="p-4 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">

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
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} className="dark:text-gray-100">
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
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }} className="dark:text-gray-100">{artist.rating}</span>
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