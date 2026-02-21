import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { type OrderStatus } from '@/types';

function formatBudget(budget: unknown): string {
  const num = Number(budget);
  return isNaN(num) ? '—' : num.toLocaleString('en-IN');
}
function formatDeadline(value: unknown): string {
  if (!value) return '—';
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    return new Date((value as { seconds: number }).seconds * 1000)
      .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  if (value instanceof Date) return value.toLocaleDateString('en-IN');
  if (typeof value === 'string') return value;
  return String(value);
}

type FilterTab = 'all' | OrderStatus;

const tabs: { key: FilterTab; label: string; emoji: string }[] = [
  { key: 'all', label: 'All Orders', emoji: '📦' },
  { key: 'requested', label: 'Pending', emoji: '⏳' },
  { key: 'accepted', label: 'Accepted', emoji: '✅' },
  { key: 'in_progress', label: 'In Progress', emoji: '⚡' },
  { key: 'delivered', label: 'Delivered', emoji: '📬' },
  { key: 'completed', label: 'Completed', emoji: '🎉' },
];

const statusColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  requested: { bg: '#dbeafe', text: '#1d4ed8', darkBg: 'rgba(30,64,175,0.2)', darkText: '#93c5fd' },
  accepted: { bg: '#d1fae5', text: '#065f46', darkBg: 'rgba(20,83,45,0.2)', darkText: '#6ee7b7' },
  in_progress: { bg: '#fef3c7', text: '#b45309', darkBg: 'rgba(120,53,15,0.2)', darkText: '#fcd34d' },
  delivered: { bg: '#f3e8ff', text: '#6b21a8', darkBg: 'rgba(91,33,182,0.2)', darkText: '#c4b5fd' },
  completed: { bg: '#d1fae5', text: '#065f46', darkBg: 'rgba(20,83,45,0.2)', darkText: '#6ee7b7' },
};

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .op-page { padding: 1rem; background: #f8fafc; min-height: 100%; }
  @media (min-width: 1024px) { .op-page { padding: 2rem; } }
  .dark .op-page { background: #030712; }

  .op-header { margin-bottom: 20px; }
  .op-title {
    font-size: 1.25rem; font-weight: 900; color: #1e293b;
    display: flex; align-items: center; gap: 8px;
  }
  .dark .op-title { color: #f1f5f9; }

  /* ── Tabs ── */
  .op-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 16px; scrollbar-width: none; }
  .op-tabs::-webkit-scrollbar { display: none; }

  .op-tab {
    display: flex; align-items: center; gap: 5px;
    padding: 7px 16px; border-radius: 99px;
    font-size: 0.78rem; font-weight: 700;
    white-space: nowrap; flex-shrink: 0;
    cursor: pointer; border: 1.5px solid; transition: all 0.2s;
  }
  .op-tab.active {
    background: linear-gradient(135deg, #d97706, #ea580c);
    color: #fff; border-color: transparent;
    box-shadow: 0 3px 10px rgba(217,119,6,0.3);
  }
  .op-tab.inactive {
    background: #fff; color: #475569; border-color: #e2e8f0;
  }
  .dark .op-tab.inactive { background: #0f172a; color: #94a3b8; border-color: #1e293b; }
  .op-tab.inactive:hover { border-color: #fde68a; color: #d97706; }

  /* ── Order Card ── */
  .op-card {
    background: #fff; border-radius: 18px;
    border: 1.5px solid #f1f5f9;
    padding: 16px; cursor: pointer;
    text-align: left; display: block; width: 100%;
    transition: all 0.25s ease;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    animation: fadeInUp 0.4s ease both;
    position: relative; overflow: hidden;
  }
  .dark .op-card { background: #0f172a; border-color: #1e293b; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
  .op-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(0,0,0,0.1);
    border-color: #fde68a;
  }
  .dark .op-card:hover { box-shadow: 0 10px 24px rgba(0,0,0,0.3); border-color: #78350f; }

  /* Left accent stripe */
  .op-card::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: 18px 0 0 18px;
  }
  .op-card[data-status="requested"]::before { background: linear-gradient(to bottom, #3b82f6, #1d4ed8); }
  .op-card[data-status="accepted"]::before { background: linear-gradient(to bottom, #22c55e, #16a34a); }
  .op-card[data-status="in_progress"]::before { background: linear-gradient(to bottom, #f59e0b, #d97706); }
  .op-card[data-status="delivered"]::before { background: linear-gradient(to bottom, #a855f7, #7c3aed); }
  .op-card[data-status="completed"]::before { background: linear-gradient(to bottom, #22c55e, #16a34a); }

  .op-card-inner { padding-left: 12px; }

  .op-card-title {
    font-size: 0.95rem; font-weight: 800; color: #1e293b;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    flex: 1;
  }
  .dark .op-card-title { color: #f1f5f9; }

  .op-meta { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; }
  .op-desc {
    font-size: 0.78rem; color: #64748b; line-height: 1.5;
    margin-top: 8px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .dark .op-desc { color: #94a3b8; }

  .op-footer {
    display: flex; align-items: center; gap: 8px;
    margin-top: 12px; padding-top: 10px;
    border-top: 1px solid #f1f5f9;
    flex-wrap: wrap;
  }
  .dark .op-footer { border-color: #1e293b; }

  .op-budget {
    font-size: 0.875rem; font-weight: 900; color: #d97706;
  }
  .dark .op-budget { color: #fbbf24; }

  .op-dot { color: #cbd5e1; font-size: 0.8rem; }

  .op-info { font-size: 0.75rem; color: #94a3b8; }

  /* ── Empty ── */
  .op-empty {
    text-align: center; padding: 4rem 1rem;
    background: #fff; border-radius: 20px;
    border: 1.5px solid #f1f5f9;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  }
  .dark .op-empty { background: #0f172a; border-color: #1e293b; }

  .op-explore-btn {
    margin-top: 16px; padding: 12px 24px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    color: #fff; border: none; border-radius: 14px;
    font-size: 0.875rem; font-weight: 800; cursor: pointer;
    box-shadow: 0 4px 14px rgba(217,119,6,0.35);
    transition: all 0.2s;
  }
  .op-explore-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(217,119,6,0.45); }
`

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders, userRole, currentUserId } = useApp();
  const [filter, setFilter] = useState<FilterTab>('all');

  const myOrders = orders.filter(o =>
    userRole === 'customer' ? o.customerId === currentUserId : o.artistId === currentUserId
  );
  const filtered = filter === 'all' ? myOrders : myOrders.filter(o => o.status === filter);

  // Count per tab
  const counts = tabs.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? myOrders.length : myOrders.filter(o => o.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <style>{styles}</style>
      <div className="op-page">
        <div className="op-header">
          <h1 className="op-title">
            {userRole === 'customer' ? '📦 My Orders' : '📋 Order Requests'}
          </h1>
        </div>

        {/* Filter Tabs */}
        <div className="op-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`op-tab ${filter === tab.key ? 'active' : 'inactive'}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.emoji} {tab.label}
              {counts[tab.key] > 0 && (
                <span style={{
                  background: filter === tab.key ? 'rgba(255,255,255,0.25)' : '#fef3c7',
                  color: filter === tab.key ? '#fff' : '#b45309',
                  borderRadius: 99, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 800
                }}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="op-empty">
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 14 }}>📋</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: 6 }} className="dark:text-gray-100">
              No orders yet
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              {userRole === 'customer' ? 'Browse artists and submit your first request!' : 'Orders from customers will appear here.'}
            </p>
            {userRole === 'customer' && (
              <button className="op-explore-btn" onClick={() => navigate('/explore')}>
                Explore Artists
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {filtered.map((order, i) => {
              const s = statusColors[order.status] || { bg: '#f1f5f9', text: '#475569', darkBg: '#1e293b', darkText: '#94a3b8' };
              return (
                <button
                  key={order.id}
                  className="op-card"
                  data-status={order.status}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <div className="op-card-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <Avatar name={userRole === 'customer' ? order.artistName : order.customerName} size="md" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <span className="op-card-title">{order.title}</span>
                          <span style={{
                            padding: '3px 10px', borderRadius: 99,
                            fontSize: '0.67rem', fontWeight: 800, flexShrink: 0,
                            background: s.bg, color: s.text
                          }}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="op-meta">
                          {userRole === 'customer' ? `🎨 ${order.artistName}` : `👤 ${order.customerName}`}
                        </p>
                      </div>
                    </div>

                    <p className="op-desc">{order.description}</p>

                    <div className="op-footer">
                      <span className="op-budget">₹{formatBudget(order.budget)}</span>
                      <span className="op-dot">·</span>
                      <span className="op-info">{order.category}</span>
                      <span className="op-dot">·</span>
                      <span className="op-info">Due: {formatDeadline(order.deadline)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}