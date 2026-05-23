import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, Users, Palette, ShoppingBag, DollarSign, Star } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminGetAnalytics, type PlatformAnalytics } from '@/services/adminApiService';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionStorage.getItem('adminToken')) { navigate('/admin'); return; }
    adminGetAnalytics()
      .then(setAnalytics)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = analytics ? [
    { label: 'Total Users',     value: analytics.totalUsers,     icon: '👥', color: '#3b82f6', sub: `+${analytics.newUsersThisMonth} this month` },
    { label: 'Total Artists',   value: analytics.totalArtists,    icon: '🎨', color: '#d97706', sub: 'Active profiles' },
    { label: 'Total Orders',    value: analytics.totalOrders,     icon: '📦', color: '#8b5cf6', sub: `${analytics.ordersThisMonth} this month` },
    { label: 'Platform Revenue',value: `₹${(analytics.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: '#22c55e', sub: `₹${(analytics.revenueThisMonth || 0).toLocaleString('en-IN')} this month` },
    { label: 'Platform Fees',   value: `₹${(analytics.platformFeeCollected || 0).toLocaleString('en-IN')}`, icon: '🏛', color: '#f59e0b', sub: '5% commission' },
    { label: 'Avg Order Value', value: `₹${Math.round(analytics.avgOrderValue || 0).toLocaleString('en-IN')}`, icon: '📊', color: '#ec4899', sub: 'Per transaction' },
    { label: 'Avg Artist Rating', value: (analytics.avgArtistRating || 0).toFixed(1), icon: '⭐', color: '#f59e0b', sub: 'Platform average' },
    { label: 'Completed Orders',value: analytics.completedOrders, icon: '✅', color: '#10b981', sub: `${analytics.pendingOrders} still active` },
  ] : [];

  const quickLinks = [
    { label: 'Manage Users',   path: '/admin/users',    icon: Users,       color: '#3b82f6' },
    { label: 'Manage Artists', path: '/admin/artists',  icon: Palette,     color: '#d97706' },
    { label: 'View Orders',    path: '/admin/orders',   icon: ShoppingBag, color: '#8b5cf6' },
    { label: 'View Payouts',   path: '/admin/payouts',  icon: DollarSign,  color: '#22c55e' },
    { label: 'View Reviews',   path: '/admin/reviews',  icon: Star,        color: '#f59e0b' },
    { label: 'Analytics',      path: '/admin/analytics',icon: TrendingUp,  color: '#ec4899' },
  ];

  return (
    <AdminLayout>
      {loading ? (
        <div className="admin-loading">
          <Loader2 size={24} className="animate-spin" style={{ color: '#d97706' }} />
          Loading dashboard...
        </div>
      ) : error ? (
        <div style={{ color: '#dc2626', padding: 20, background: '#fee2e2', borderRadius: 12 }}>{error}</div>
      ) : (
        <>
          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #7c2d12, #9a3412, #c2410c)',
            borderRadius: 20, padding: '24px 28px', marginBottom: 24,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(255,255,255,0.06) 0%, transparent 50%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>
                Admin Dashboard
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
                Welcome back 👋
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="admin-stats-grid">
            {stats.map(s => (
              <div key={s.label} className="admin-stat-card">
                <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
                <div className="admin-stat-value">{s.value}</div>
                <div className="admin-stat-label">{s.label}</div>
                <div className="admin-stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="admin-section-title">⚡ Quick Access</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
            {quickLinks.map(q => {
              const Icon = q.icon;
              return (
                <button
                  key={q.path}
                  onClick={() => navigate(q.path)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: 16, border: '1.5px solid #f1f5f9', borderRadius: 14,
                    background: '#fff', cursor: 'pointer', transition: 'all 0.2s', gap: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#fde68a'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '#f1f5f9'; }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${q.color}1a` }}>
                    <Icon size={18} color={q.color} />
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{q.label}</span>
                </button>
              );
            })}
          </div>

          {/* Platform overview */}
          <div className="admin-section-title">📊 Platform Overview</div>
          <div className="admin-card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              {[
                { label: 'Order Completion Rate', value: analytics?.totalOrders ? `${Math.round((analytics.completedOrders / analytics.totalOrders) * 100)}%` : '0%', icon: '✅' },
                { label: 'Artist-to-User Ratio',  value: analytics?.totalUsers ? `${Math.round((analytics.totalArtists / analytics.totalUsers) * 100)}%` : '0%', icon: '🎨' },
                { label: 'Avg Rating',             value: `${(analytics?.avgArtistRating || 0).toFixed(1)} / 5.0`, icon: '⭐' },
                { label: 'Revenue This Month',     value: `₹${((analytics?.revenueThisMonth || 0) / 1000).toFixed(1)}K`, icon: '📈' },
              ].map(item => (
                <div key={item.label} style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1e293b' }}>{item.value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
