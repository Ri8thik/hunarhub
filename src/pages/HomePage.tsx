import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, Star, BadgeCheck, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';
import { useMemo } from 'react';
import styles from './HomePage.module.css';

export function HomePage() {
  const { userRole, currentUserName, artists, categories, artistsLoading, categoriesLoading, currentUserId, currentUserEmail } = useApp();
  const firstName = currentUserName.split(' ')[0];
  if (userRole === 'artist') return <ArtistDashboard />;
  const featuredArtists = artists.filter(a => a.verified && a.id !== currentUserId && a.uid !== currentUserId && a.email !== currentUserEmail).slice(0, 6);
  const topRated = [...artists].filter(a => a.id !== currentUserId && a.uid !== currentUserId && a.email !== currentUserEmail).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  const navigate = useNavigate();

  const categoriesWithCount = useMemo(() => {
    const normalize = (str: string) => str?.toLowerCase().trim();

    return categories.map(cat => ({
      ...cat,
      count: artists.filter(a =>
          Array.isArray(a.skills) &&
          a.skills.some(skill => normalize(skill) === normalize(cat.name))
      ).length
    }));
  }, [categories, artists]);

  return (
    <>
      <div className="p-4 lg:p-8 common-page-bg">

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroPattern} />
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroContent}>
            <div className={styles.heroTag}>
              <span>🙏</span> Namaste, {firstName}!
            </div>
            <h1 className={styles.heroTitle}>Find your perfect<br />creative artist</h1>
            <p className={styles.heroSub}>
              Connect with talented artists & craftspeople for custom art, portraits, home decor, and more.
            </p>
            <button className={styles.heroBtn} onClick={() => navigate('/explore')}>
              <Search size={16} />
              Explore Artists
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="common-section-space">
          <div className={styles.sectionHd}>
            <div className={styles.sectionTitle}>
              <span>🗂</span> Browse Categories
            </div>
            <button className={styles.seeAll} onClick={() => navigate('/explore')}>
              See All <ChevronRight size={15} />
            </button>
          </div>
          {categoriesLoading ? (
            <div className="common-loading-row">
              <Loader2 size={22} className="animate-spin text-amber-600" />
              <span className="common-loading-text">Loading categories...</span>
            </div>
          ) : (
            <div className={styles.catGrid}>
              {categoriesWithCount.map((cat, i) => (
                <button
                  key={cat.id}
                  className={styles.catBtn}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/explore?category=${cat.name}`)}
                >
                  <span className={styles.catEmoji}>{cat.icon}</span>
                  <span className={styles.catName}>{cat.name}</span>
                  <span className={styles.catCount}>{cat.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Featured Artists */}
        <div className="common-section-space">
          <div className={styles.sectionHd}>
            <div className={styles.sectionTitle}>
              <Sparkles size={17} color="#d97706" /> Featured Artists
            </div>
            <button className={styles.seeAll} onClick={() => navigate('/explore')}>
              View All <ChevronRight size={15} />
            </button>
          </div>
          {artistsLoading ? (
            <div className="common-loading-row">
              <Loader2 size={22} className="animate-spin text-amber-600" />
              <span className="common-loading-text">Loading artists...</span>
            </div>
          ) : (
            <div className="common-grid-auto-220">
              {featuredArtists.map((artist, i) => (
                <button
                  key={artist.id}
                  className={styles.artistCard}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => navigate(`/artist/${artist.id}`)}
                >
                  <div className={styles.cardBanner}>
                    <div className={styles.cardAvatarWrap}>
                      <Avatar name={artist.name} size="lg" className="ring-3 ring-white dark:ring-gray-900" />
                    </div>
                    {artist.verified && (
                      <div className={styles.cardVerified}>
                        <BadgeCheck size={10} color="#b45309" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardName}>{artist.name}</div>
                    <div className={styles.cardLoc}>
                      <MapPin size={11} />{artist.location}
                    </div>
                    <div className={styles.cardStats}>
                      <div className={styles.cardRating}>
                        <Star size={13} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                        {artist.rating}
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>({artist.reviewCount})</span>
                      </div>
                      <span className={styles.cardPrice}>₹{artist.priceRange.min}+</span>
                    </div>
                    <div className={styles.skillsWrap}>
                      {artist.skills.slice(0, 2).map(s => (
                        <span key={s} className={styles.skillTag}>{s}</span>
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
          <div className="common-section-space">
            <div className={styles.sectionHd}>
              <div className={styles.sectionTitle}>
                <TrendingUp size={17} color="#d97706" /> Top Rated
              </div>
              <button className={styles.seeAll} onClick={() => navigate('/explore')}>
                View All <ChevronRight size={15} />
              </button>
            </div>
            <div className={styles.ratedScroll}>
              {topRated.map((artist, i) => (
                <button
                  key={artist.id}
                  className={styles.ratedCard}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => navigate(`/artist/${artist.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={artist.name} size="md" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={styles.cardName} style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                        {artist.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                        <Star size={11} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                        <span className={styles.cardRating} style={{ fontSize: '0.78rem' }}>{artist.rating}</span>
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
                    <span key={s} className={styles.skillTag} style={{ display: 'inline-block', marginRight: 4 }}>{s}</span>
                  ))}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div>
          <div className={styles.sectionHd}>
            <div className={styles.sectionTitle}>✨ How It Works</div>
          </div>
          <div className="common-grid-auto-180">
            {[
              { step: '1', title: 'Find Artist', desc: 'Browse verified artists by category & location', emoji: '🔍', colorClass: styles.stepBlue },
              { step: '2', title: 'Submit Request', desc: 'Describe your custom art vision in detail', emoji: '📝', colorClass: styles.stepAmber },
              { step: '3', title: 'Track Progress', desc: 'Chat with your artist & monitor status', emoji: '💬', colorClass: styles.stepGreen },
              { step: '4', title: 'Receive Art', desc: 'Get your custom masterpiece delivered!', emoji: '🎨', colorClass: styles.stepPurple },
            ].map((item, i) => (
              <div key={item.step} className={cn(styles.stepCard, item.colorClass)} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={styles.stepNum}>{item.step}</div>
                <span className={styles.stepEmoji}>{item.emoji}</span>
                <div className={styles.stepTitle}>Step {item.step}: {item.title}</div>
                <div className={styles.stepDesc}>{item.desc}</div>
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
    <div className="p-4 lg:p-8 common-page-bg">

      {/* Hero */}
      <div className={styles.dashHero}>
        <div className={styles.heroPattern} />
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
          <div key={stat.label} className={styles.dashStat} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className={styles.dashStatIcon} style={{ background: stat.bg }}>
              <span style={{ fontSize: '1.1rem' }}>{stat.emoji}</span>
            </div>
            <div className={styles.dashStatVal}>{stat.value}</div>
            <div className={styles.dashStatLbl}>{stat.label}</div>
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
              className={styles.actionCard} style={{ animationDelay: `${i * 0.07}s` }}>
              <div style={{ fontSize: '1.75rem', marginBottom: 8 }}>{action.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#1e293b', marginBottom: 2 }} className="dark:text-gray-100">{action.label}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{action.desc}</div>
            </button>
          ))}
        </div>

        <div>
          <div className={styles.sectionHd} style={{ marginBottom: 12 }}>
            <div className={styles.sectionTitle}>📋 Recent Orders</div>
            <button className={styles.seeAll} onClick={() => navigate('/orders')}>View All <ChevronRight size={14} /></button>
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
                <button key={order.id} className={styles.orderRow} style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate(`/order/${order.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="dark:text-gray-100">
                      {order.title}
                    </span>
                    <span className={styles.statusPill} style={{ ...s, marginLeft: 10 }}>
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
  );
}