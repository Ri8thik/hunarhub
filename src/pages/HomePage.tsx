import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, Star, BadgeCheck, Sparkles, TrendingUp, ShoppingBag, Clock, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes pulse-ring {
    0%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.7);opacity:0}
  }
  @keyframes shimmer {
    0%{background-position:-200% center} 100%{background-position:200% center}
  }

  /* ── Hero ── */
  .hp-hero {
    border-radius: 24px; overflow: hidden; margin-bottom: 28px;
    position: relative;
    background: linear-gradient(135deg, #7c2d12 0%, #9a3412 25%, #c2410c 65%, #d97706 100%);
    padding: 28px 28px 36px;
  }
  .hp-hero-pattern {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      radial-gradient(circle at 15% 50%, rgba(255,255,255,0.07) 0%, transparent 50%),
      radial-gradient(circle at 85% 15%, rgba(255,255,255,0.05) 0%, transparent 45%),
      repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(255,255,255,0.018) 28px, rgba(255,255,255,0.018) 29px);
  }
  .hp-hero-orb1 {
    position: absolute; width: 200px; height: 200px;
    border-radius: 50%; top: -80px; right: -60px;
    background: radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%);
  }
  .hp-hero-orb2 {
    position: absolute; width: 140px; height: 140px;
    border-radius: 50%; bottom: -50px; left: -40px;
    background: radial-gradient(circle, rgba(234,88,12,0.2) 0%, transparent 70%);
  }
  .hp-hero-content { position: relative; z-index: 1; }

  .hp-hero-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 99px; padding: 4px 12px;
    font-size: 0.75rem; font-weight: 600; color: #fef3c7;
    margin-bottom: 12px;
    animation: fadeInUp 0.4s ease both;
  }
  .hp-hero-title {
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    font-weight: 900; color: #fff; line-height: 1.15;
    text-shadow: 0 2px 12px rgba(0,0,0,0.15);
    animation: fadeInUp 0.4s 0.05s ease both;
  }
  .hp-hero-sub {
    font-size: 0.9rem; color: rgba(255,255,255,0.75);
    margin-top: 8px; max-width: 400px; line-height: 1.6;
    animation: fadeInUp 0.4s 0.1s ease both;
  }
  .hp-hero-btn {
    margin-top: 20px;
    display: inline-flex; align-items: center; gap: 8px;
    background: #fff; color: #92400e;
    padding: 12px 22px;
    border-radius: 14px; border: none; cursor: pointer;
    font-size: 0.9rem; font-weight: 800;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    transition: all 0.25s ease;
    animation: fadeInUp 0.4s 0.15s ease both;
  }
  .hp-hero-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.2); }

  /* ── Section header ── */
  .hp-section-hd {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }
  .hp-section-title {
    font-size: 1rem; font-weight: 800; color: #1e293b;
    display: flex; align-items: center; gap: 8px;
  }
  .dark .hp-section-title { color: #f1f5f9; }
  .hp-see-all {
    display: flex; align-items: center; gap: 2px;
    font-size: 0.8rem; font-weight: 700;
    color: #d97706; background: none; border: none; cursor: pointer;
    transition: color 0.2s;
  }
  .hp-see-all:hover { color: #b45309; }
  .dark .hp-see-all { color: #fbbf24; }
  .dark .hp-see-all:hover { color: #f59e0b; }

  /* ── Category grid ── */
  .hp-cat-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  }
  @media (min-width: 768px) {
    .hp-cat-grid { grid-template-columns: repeat(8, 1fr); }
  }

  .hp-cat-btn {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 12px 6px;
    background: #fff; border-radius: 16px;
    border: 1.5px solid #f1f5f9;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    animation: fadeInUp 0.4s ease both;
  }
  .dark .hp-cat-btn {
    background: #0f172a; border-color: #1e293b;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  .hp-cat-btn:hover {
    transform: translateY(-3px);
    border-color: #fde68a;
    box-shadow: 0 6px 18px rgba(217,119,6,0.18);
  }
  .dark .hp-cat-btn:hover { border-color: #78350f; box-shadow: 0 6px 18px rgba(217,119,6,0.2); }

  .hp-cat-emoji { font-size: 1.5rem; line-height: 1; }
  @media (min-width: 1024px) { .hp-cat-emoji { font-size: 1.75rem; } }
  .hp-cat-name {
    font-size: 0.65rem; font-weight: 600; text-align: center;
    color: #475569; line-height: 1.2;
  }
  .dark .hp-cat-name { color: #94a3b8; }
  .hp-cat-count {
    font-size: 0.58rem; color: #94a3b8;
  }

  /* ── Artist Card (featured) ── */
  .hp-artist-card {
    background: #fff; border-radius: 20px;
    border: 1.5px solid #f1f5f9;
    overflow: hidden; cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    text-align: left;
    animation: fadeInUp 0.4s ease both;
    display: block; width: 100%;
  }
  .dark .hp-artist-card {
    background: #0f172a; border-color: #1e293b;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  }
  .hp-artist-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 14px 32px rgba(217,119,6,0.18);
    border-color: #fde68a;
  }
  .dark .hp-artist-card:hover {
    box-shadow: 0 14px 32px rgba(217,119,6,0.2);
    border-color: #78350f;
  }

  .hp-card-banner {
    height: 90px;
    background: linear-gradient(135deg, #fde68a 0%, #fb923c 60%, #c2410c 100%);
    position: relative;
    overflow: hidden;
  }
  .hp-card-banner::after {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.04) 20px, rgba(255,255,255,0.04) 21px);
  }
  .hp-card-avatar-wrap {
    position: absolute; bottom: -20px; left: 14px;
  }
  .hp-card-verified {
    position: absolute; top: 10px; right: 10px;
    background: rgba(255,255,255,0.9);
    border-radius: 99px; padding: 3px 8px;
    display: flex; align-items: center; gap: 4px;
    font-size: 0.62rem; font-weight: 800; color: #b45309;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }

  .hp-card-body { padding: 26px 14px 14px; }
  .hp-card-name {
    font-size: 0.95rem; font-weight: 800; color: #1e293b;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dark .hp-card-name { color: #f1f5f9; }
  .hp-card-loc {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.72rem; color: #94a3b8; margin-top: 3px;
  }
  .hp-card-stats {
    display: flex; align-items: center; gap: 10px; margin-top: 8px;
  }
  .hp-card-rating {
    display: flex; align-items: center; gap: 3px;
    font-size: 0.8rem; font-weight: 700; color: #1e293b;
  }
  .dark .hp-card-rating { color: #f1f5f9; }
  .hp-card-price {
    font-size: 0.8rem; font-weight: 800; color: #d97706;
    margin-left: auto;
  }
  .dark .hp-card-price { color: #fbbf24; }
  .hp-skills-wrap { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
  .hp-skill-tag {
    padding: 3px 10px;
    background: #fffbeb; border: 1px solid #fde68a;
    border-radius: 99px; font-size: 0.68rem; font-weight: 600; color: #92400e;
  }
  .dark .hp-skill-tag {
    background: #1c0a00; border-color: #78350f; color: #fcd34d;
  }

  /* ── Top Rated horizontal scroll ── */
  .hp-rated-scroll {
    display: flex; gap: 12px; overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;
  }
  .hp-rated-scroll::-webkit-scrollbar { display: none; }

  .hp-rated-card {
    background: #fff; border-radius: 16px;
    border: 1.5px solid #f1f5f9;
    padding: 14px; min-width: 200px;
    cursor: pointer; flex-shrink: 0;
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    display: flex; flex-direction: column; gap: 8px;
    text-align: left;
  }
  .dark .hp-rated-card {
    background: #0f172a; border-color: #1e293b;
  }
  .hp-rated-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(217,119,6,0.18);
    border-color: #fde68a;
  }
  .dark .hp-rated-card:hover { border-color: #78350f; }

  /* ── How it works ── */
  .hp-step-card {
    border-radius: 18px; padding: 18px;
    border: 1.5px solid;
    animation: fadeInUp 0.4s ease both;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    position: relative; overflow: hidden;
  }
  .hp-step-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
  .hp-step-num {
    position: absolute; top: -10px; right: 10px;
    font-size: 4rem; font-weight: 900; line-height: 1;
    opacity: 0.07; color: #000;
    pointer-events: none;
  }
  .hp-step-emoji { font-size: 1.75rem; margin-bottom: 8px; display: block; }
  .hp-step-title { font-size: 0.9rem; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
  .dark .hp-step-title { color: #f1f5f9; }
  .hp-step-desc { font-size: 0.8rem; color: #64748b; line-height: 1.5; }
  .dark .hp-step-desc { color: #94a3b8; }

  /* ── Artist Dashboard ── */
  .hp-dash-hero {
    border-radius: 22px; overflow: hidden; margin-bottom: 24px;
    background: linear-gradient(135deg, #7c2d12 0%, #9a3412 25%, #c2410c 65%, #d97706 100%);
    padding: 24px; position: relative;
  }
  .hp-dash-stat {
    background: #fff; border-radius: 16px;
    padding: 14px; border: 1.5px solid #f1f5f9;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    animation: fadeInUp 0.4s ease both;
    transition: all 0.2s;
  }
  .dark .hp-dash-stat { background: #0f172a; border-color: #1e293b; }
  .hp-dash-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }

  .hp-dash-stat-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 10px;
  }
  .hp-dash-stat-val { font-size: 1.6rem; font-weight: 900; color: #1e293b; }
  .dark .hp-dash-stat-val { color: #f1f5f9; }
  .hp-dash-stat-lbl { font-size: 0.72rem; font-weight: 600; color: #94a3b8; margin-top: 2px; }

  .hp-action-card {
    background: #fff; border-radius: 16px;
    padding: 16px; border: 1.5px solid #f1f5f9;
    cursor: pointer; text-align: left;
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    animation: fadeInUp 0.4s ease both;
  }
  .dark .hp-action-card { background: #0f172a; border-color: #1e293b; }
  .hp-action-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(217,119,6,0.15);
    border-color: #fde68a;
  }
  .dark .hp-action-card:hover { border-color: #78350f; }

  .hp-order-row {
    background: #fff; border-radius: 14px;
    padding: 14px 16px; border: 1.5px solid #f1f5f9;
    cursor: pointer; text-align: left;
    transition: all 0.2s;
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    display: block; width: 100%;
    animation: fadeInUp 0.4s ease both;
  }
  .dark .hp-order-row { background: #0f172a; border-color: #1e293b; }
  .hp-order-row:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    border-color: #e2e8f0;
  }
  .dark .hp-order-row:hover { border-color: #334155; }

  .hp-status-pill {
    padding: 3px 10px; border-radius: 99px;
    font-size: 0.68rem; font-weight: 800;
    flex-shrink: 0;
  }
`

export function HomePage() {
  const { userRole, currentUserName, artists, categories, artistsLoading, categoriesLoading, currentUserId, currentUserEmail } = useApp();
  const firstName = currentUserName.split(' ')[0];
  if (userRole === 'artist') return <ArtistDashboard />;
  const featuredArtists = artists.filter(a => a.verified && a.id !== currentUserId && a.uid !== currentUserId && a.email !== currentUserEmail).slice(0, 6);
  const topRated = [...artists].filter(a => a.id !== currentUserId && a.uid !== currentUserId && a.email !== currentUserEmail).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>
      <div className="p-4 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">

        {/* Hero */}
        <div className="hp-hero">
          <div className="hp-hero-pattern" />
          <div className="hp-hero-orb1" />
          <div className="hp-hero-orb2" />
          <div className="hp-hero-content">
            <div className="hp-hero-tag">
              <span>🙏</span> Namaste, {firstName}!
            </div>
            <h1 className="hp-hero-title">Find your perfect<br />creative artist</h1>
            <p className="hp-hero-sub">
              Connect with talented artists & craftspeople for custom art, portraits, home decor, and more.
            </p>
            <button className="hp-hero-btn" onClick={() => navigate('/explore')}>
              <Search size={16} />
              Explore Artists
            </button>
          </div>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: 28 }}>
          <div className="hp-section-hd">
            <div className="hp-section-title">
              <span>🗂</span> Browse Categories
            </div>
            <button className="hp-see-all" onClick={() => navigate('/explore')}>
              See All <ChevronRight size={15} />
            </button>
          </div>
          {categoriesLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: 10 }}>
              <Loader2 size={22} className="animate-spin" style={{ color: '#d97706' }} />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Loading categories...</span>
            </div>
          ) : (
            <div className="hp-cat-grid">
              {categories.map((cat, i) => (
                <button
                  key={cat.id}
                  className="hp-cat-btn"
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/explore?category=${cat.name}`)}
                >
                  <span className="hp-cat-emoji">{cat.icon}</span>
                  <span className="hp-cat-name">{cat.name}</span>
                  <span className="hp-cat-count">{cat.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Featured Artists */}
        <div style={{ marginBottom: 28 }}>
          <div className="hp-section-hd">
            <div className="hp-section-title">
              <Sparkles size={17} color="#d97706" /> Featured Artists
            </div>
            <button className="hp-see-all" onClick={() => navigate('/explore')}>
              View All <ChevronRight size={15} />
            </button>
          </div>
          {artistsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: 10 }}>
              <Loader2 size={22} className="animate-spin" style={{ color: '#d97706' }} />
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Loading artists...</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {featuredArtists.map((artist, i) => (
                <button
                  key={artist.id}
                  className="hp-artist-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => navigate(`/artist/${artist.id}`)}
                >
                  <div className="hp-card-banner">
                    <div className="hp-card-avatar-wrap">
                      <Avatar name={artist.name} size="lg" className="ring-3 ring-white dark:ring-gray-900" />
                    </div>
                    {artist.verified && (
                      <div className="hp-card-verified">
                        <BadgeCheck size={10} color="#b45309" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="hp-card-body">
                    <div className="hp-card-name">{artist.name}</div>
                    <div className="hp-card-loc">
                      <MapPin size={11} />{artist.location}
                    </div>
                    <div className="hp-card-stats">
                      <div className="hp-card-rating">
                        <Star size={13} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                        {artist.rating}
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>({artist.reviewCount})</span>
                      </div>
                      <span className="hp-card-price">₹{artist.priceRange.min}+</span>
                    </div>
                    <div className="hp-skills-wrap">
                      {artist.skills.slice(0, 2).map(s => (
                        <span key={s} className="hp-skill-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Top Rated */}
        {topRated.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div className="hp-section-hd">
              <div className="hp-section-title">
                <TrendingUp size={17} color="#d97706" /> Top Rated
              </div>
              <button className="hp-see-all" onClick={() => navigate('/explore')}>
                View All <ChevronRight size={15} />
              </button>
            </div>
            <div className="hp-rated-scroll">
              {topRated.map((artist, i) => (
                <button
                  key={artist.id}
                  className="hp-rated-card"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => navigate(`/artist/${artist.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={artist.name} size="md" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="dark:text-gray-100">
                        {artist.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <Star size={11} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }} className="dark:text-gray-100">{artist.rating}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d97706' }} className="dark:text-amber-400">
                      ₹{artist.priceRange.min}+
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} color="#94a3b8" />
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{artist.location}</span>
                  </div>
                  {artist.skills.slice(0, 2).map(s => (
                    <span key={s} className="hp-skill-tag" style={{ display: 'inline-block', marginRight: 4 }}>{s}</span>
                  ))}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div>
          <div className="hp-section-hd">
            <div className="hp-section-title">✨ How It Works</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { step: '1', title: 'Find Artist', desc: 'Browse verified artists by category & location', emoji: '🔍', bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#bfdbfe', darkBg: 'rgba(30,58,138,0.15)', darkBorder: '#1e3a5f' },
              { step: '2', title: 'Submit Request', desc: 'Describe your custom art vision in detail', emoji: '📝', bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '#fde68a', darkBg: 'rgba(120,53,15,0.2)', darkBorder: '#78350f' },
              { step: '3', title: 'Track Progress', desc: 'Chat with your artist & monitor status', emoji: '💬', bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '#bbf7d0', darkBg: 'rgba(20,83,45,0.2)', darkBorder: '#166534' },
              { step: '4', title: 'Receive Art', desc: 'Get your custom masterpiece delivered!', emoji: '🎨', bg: 'linear-gradient(135deg,#fdf4ff,#fae8ff)', border: '#e9d5ff', darkBg: 'rgba(88,28,135,0.2)', darkBorder: '#581c87' },
            ].map((item, i) => (
              <div key={item.step} className={cn('hp-step-card', 'dark')} style={{
                background: item.bg, borderColor: item.border,
                animationDelay: `${i * 0.08}s`
              }}>
                <div className="hp-step-num">{item.step}</div>
                <span className="hp-step-emoji">{item.emoji}</span>
                <div className="hp-step-title">Step {item.step}: {item.title}</div>
                <div className="hp-step-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
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

  const statusStyle = (status: string) => {
    switch (status) {
      case 'requested': return { background: '#dbeafe', color: '#1d4ed8' };
      case 'in_progress': return { background: '#fef3c7', color: '#b45309' };
      case 'completed': return { background: '#d1fae5', color: '#065f46' };
      case 'delivered': return { background: '#f3e8ff', color: '#6b21a8' };
      default: return { background: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="p-4 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">

        {/* Hero */}
        <div className="hp-dash-hero">
          <div className="hp-hero-pattern" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Welcome back 🎨</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>{firstName}'s Studio</div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                marginTop: 8, padding: '4px 12px',
                background: artist?.availability === 'available' ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.2)',
                border: `1px solid ${artist?.availability === 'available' ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.3)'}`,
                borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
                color: artist?.availability === 'available' ? '#bbf7d0' : '#fef3c7'
              }}>
                {artist?.availability === 'available' ? '🟢 Available for Orders' : '🟡 Busy'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>Total Earnings</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                ₹{(artist?.earnings || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Pending', value: pendingRequests, emoji: '⏳', color: '#3b82f6', bg: '#dbeafe', darkBg: 'rgba(30,64,175,0.15)' },
            { label: 'Active', value: activeOrders, emoji: '⚡', color: '#d97706', bg: '#fef3c7', darkBg: 'rgba(120,53,15,0.15)' },
            { label: 'Delivered', value: deliveredCount, emoji: '📬', color: '#7c3aed', bg: '#ede9fe', darkBg: 'rgba(91,33,182,0.15)' },
            { label: 'Completed', value: completedCount, emoji: '✅', color: '#16a34a', bg: '#dcfce7', darkBg: 'rgba(20,83,45,0.15)' },
          ].map((stat, i) => (
            <div key={stat.label} className="hp-dash-stat" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="hp-dash-stat-icon" style={{ background: stat.bg }}>
                <span style={{ fontSize: '1.1rem' }}>{stat.emoji}</span>
              </div>
              <div className="hp-dash-stat-val">{stat.value}</div>
              <div className="hp-dash-stat-lbl">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions + Orders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {[
              { label: 'View Orders', desc: 'Manage requests', emoji: '📋', path: '/orders' },
              { label: 'Earnings', desc: `₹${((artist?.earnings || 0) / 1000).toFixed(1)}k total`, emoji: '💰', path: '/earnings' },
              { label: 'Profile', desc: 'Edit portfolio', emoji: '👤', path: '/profile' },
            ].map((action, i) => (
              <button key={action.label} onClick={() => navigate(action.path)}
                className="hp-action-card" style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{ fontSize: '1.75rem', marginBottom: 8 }}>{action.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#1e293b', marginBottom: 2 }} className="dark:text-gray-100">{action.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{action.desc}</div>
              </button>
            ))}
          </div>

          <div>
            <div className="hp-section-hd" style={{ marginBottom: 12 }}>
              <div className="hp-section-title">📋 Recent Orders</div>
              <button className="hp-see-all" onClick={() => navigate('/orders')}>View All <ChevronRight size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 18, border: '1.5px solid #f1f5f9' }} className="dark:bg-gray-900 dark:border-gray-800">
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 10 }}>📋</span>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No orders yet</p>
                </div>
              ) : myOrders.slice(0, 5).map((order, i) => {
                const s = statusStyle(order.status);
                return (
                  <button key={order.id} className="hp-order-row" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate(`/order/${order.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="dark:text-gray-100">
                        {order.title}
                      </span>
                      <span className="hp-status-pill" style={{ ...s, marginLeft: 10 }}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {order.customerName} · ₹{order.budget.toLocaleString('en-IN')} · {order.category}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}