import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminGetAnalytics, type PlatformAnalytics } from '@/services/adminApiService';

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { if (!sessionStorage.getItem('adminToken')) navigate('/admin'); }, []);

  useEffect(() => {
    adminGetAnalytics().then(setAnalytics).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="admin-loading"><Loader2 size={22} className="animate-spin" style={{ color: '#d97706' }} /> Loading analytics...</div></AdminLayout>;
  if (error) return <AdminLayout><div style={{ color: '#dc2626', padding: 20 }}>{error}</div></AdminLayout>;
  if (!analytics) return null;

  const kpis = [
    { label: 'Total Users',         value: analytics.totalUsers,       icon: '👥', color: '#3b82f6', delta: `+${analytics.newUsersThisMonth} this month` },
    { label: 'Total Artists',        value: analytics.totalArtists,      icon: '🎨', color: '#d97706', delta: `${Math.round((analytics.totalArtists / Math.max(analytics.totalUsers,1)) * 100)}% of users` },
    { label: 'Total Orders',         value: analytics.totalOrders,       icon: '📦', color: '#8b5cf6', delta: `${analytics.ordersThisMonth} this month` },
    { label: 'Completed Orders',     value: analytics.completedOrders,   icon: '✅', color: '#22c55e', delta: `${Math.round((analytics.completedOrders / Math.max(analytics.totalOrders,1))*100)}% completion rate` },
    { label: 'Total Revenue',        value: `₹${(analytics.totalRevenue||0).toLocaleString('en-IN')}`, icon: '💰', color: '#10b981', delta: `₹${(analytics.revenueThisMonth||0).toLocaleString('en-IN')} this month` },
    { label: 'Platform Fees',        value: `₹${(analytics.platformFeeCollected||0).toLocaleString('en-IN')}`, icon: '🏛', color: '#f59e0b', delta: '5% commission' },
    { label: 'Avg Order Value',      value: `₹${Math.round(analytics.avgOrderValue||0).toLocaleString('en-IN')}`, icon: '📊', color: '#ec4899', delta: 'Per transaction' },
    { label: 'Avg Artist Rating',    value: `${(analytics.avgArtistRating||0).toFixed(1)} / 5.0`, icon: '⭐', color: '#f59e0b', delta: 'Platform average' },
  ];

  const ratios = [
    { label: 'Order Completion Rate', value: analytics.totalOrders ? `${Math.round((analytics.completedOrders/analytics.totalOrders)*100)}%` : '0%', color: '#22c55e', bg: '#d1fae5' },
    { label: 'Artist/User Ratio',     value: analytics.totalUsers ? `${Math.round((analytics.totalArtists/analytics.totalUsers)*100)}%` : '0%', color: '#d97706', bg: '#fef3c7' },
    { label: 'Active Orders',         value: analytics.pendingOrders, color: '#8b5cf6', bg: '#ede9fe' },
    { label: 'New Users (Month)',      value: analytics.newUsersThisMonth, color: '#3b82f6', bg: '#dbeafe' },
  ];

  return (
    <AdminLayout>
      {/* KPI Grid */}
      <div className="admin-section-title">📊 Key Performance Indicators</div>
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {kpis.map(k => (
          <div key={k.label} className="admin-stat-card">
            <div style={{ fontSize: '1.3rem' }}>{k.icon}</div>
            <div className="admin-stat-value" style={{ fontSize: '1.6rem' }}>{k.value}</div>
            <div className="admin-stat-label">{k.label}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Ratios */}
      <div className="admin-section-title" style={{ marginTop: 8 }}>📈 Platform Health Ratios</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {ratios.map(r => (
          <div key={r.label} style={{ background: r.bg, borderRadius: 14, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: r.color }}>{r.value}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: r.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{r.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly snapshot */}
      <div className="admin-section-title">📅 This Month Snapshot</div>
      <div className="admin-card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
          {[
            { icon: <Users size={20} color="#3b82f6" />, label: 'New Users',   val: analytics.newUsersThisMonth, bg: '#dbeafe' },
            { icon: <Package size={20} color="#8b5cf6" />, label: 'Orders',    val: analytics.ordersThisMonth,   bg: '#ede9fe' },
            { icon: <DollarSign size={20} color="#22c55e" />, label: 'Revenue', val: `₹${(analytics.revenueThisMonth||0).toLocaleString('en-IN')}`, bg: '#d1fae5' },
            { icon: <TrendingUp size={20} color="#d97706" />, label: 'Avg Rating', val: `${(analytics.avgArtistRating||0).toFixed(1)}⭐`, bg: '#fef3c7' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>{item.val}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

