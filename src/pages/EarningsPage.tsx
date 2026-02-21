import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Loader2, Database } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getArtistEarnings, getArtistTransactions } from '@/services/firestoreService';
import type { EarningsData, TransactionData } from '@/services/firestoreService';

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes shimmer {
    0%{background-position:-200% center} 100%{background-position:200% center}
  }

  .ep-page { padding: 1rem; background: #f8fafc; min-height: 100%; }
  @media(min-width:1024px) { .ep-page { padding: 2rem; } }
  .dark .ep-page { background: #030712; }

  .ep-back-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    color: #94a3b8; font-size: 0.875rem; font-weight: 600;
    margin-bottom: 16px; transition: color 0.2s; padding: 0;
  }
  .ep-back-btn:hover { color: #d97706; }

  /* ── Hero earnings card ── */
  .ep-hero-card {
    border-radius: 22px; overflow: hidden; margin-bottom: 20px;
    background: linear-gradient(135deg, #7c2d12 0%, #9a3412 25%, #c2410c 60%, #d97706 100%);
    padding: 24px; position: relative;
    animation: fadeInUp 0.4s ease both;
    box-shadow: 0 8px 28px rgba(217,119,6,0.3);
  }
  .ep-hero-pattern {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      radial-gradient(circle at 10% 50%, rgba(255,255,255,0.07) 0%, transparent 50%),
      radial-gradient(circle at 90% 20%, rgba(255,255,255,0.05) 0%, transparent 40%),
      repeating-linear-gradient(45deg, transparent, transparent 25px, rgba(255,255,255,0.02) 25px, rgba(255,255,255,0.02) 26px);
  }
  .ep-hero-label {
    font-size: 0.78rem; color: rgba(255,255,255,0.7); font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: 4px;
  }
  .ep-hero-amount {
    font-size: 2.4rem; font-weight: 900; color: #fff;
    text-shadow: 0 2px 12px rgba(0,0,0,0.2);
    animation: countUp 0.5s 0.1s ease both;
  }
  .ep-hero-sub {
    font-size: 0.8rem; color: rgba(255,255,255,0.65); margin-top: 4px;
  }
  .ep-hero-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 99px; padding: 4px 12px;
    font-size: 0.75rem; font-weight: 700; color: #fff;
    margin-top: 12px;
  }

  /* ── Stat cards ── */
  .ep-stats-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;
  }
  .ep-stat-card {
    background: #fff; border-radius: 16px;
    border: 1.5px solid #f1f5f9;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    animation: fadeInUp 0.4s ease both;
    transition: all 0.2s;
  }
  .dark .ep-stat-card { background: #0f172a; border-color: #1e293b; }
  .ep-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }

  .ep-stat-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 10px; font-size: 1rem;
  }
  .ep-stat-val {
    font-size: 1.4rem; font-weight: 900; color: #1e293b;
    animation: countUp 0.5s ease both;
  }
  .dark .ep-stat-val { color: #f1f5f9; }
  .ep-stat-lbl { font-size: 0.72rem; font-weight: 600; color: #94a3b8; margin-top: 2px; }

  /* ── Fee banner ── */
  .ep-fee-banner {
    background: linear-gradient(135deg, #fff7ed, #fffbeb);
    border: 1.5px solid #fde68a;
    border-radius: 14px; padding: 14px 16px;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
    animation: fadeInUp 0.4s 0.1s ease both;
  }
  .dark .ep-fee-banner { background: linear-gradient(135deg, #1c0a00, #251000); border-color: #78350f; }

  /* ── Quick actions ── */
  .ep-action-btn {
    background: #fff; border-radius: 14px;
    border: 1.5px solid #f1f5f9;
    padding: 14px; display: flex; align-items: center; gap: 12px;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    animation: fadeInUp 0.4s ease both;
  }
  .dark .ep-action-btn { background: #0f172a; border-color: #1e293b; }
  .ep-action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    border-color: #fde68a;
  }
  .dark .ep-action-btn:hover { border-color: #78350f; }

  .ep-action-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* ── Transactions ── */
  .ep-txn-container {
    background: #fff; border-radius: 18px;
    border: 1.5px solid #f1f5f9;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    animation: fadeInUp 0.4s 0.15s ease both;
  }
  .dark .ep-txn-container { background: #0f172a; border-color: #1e293b; }

  .ep-txn-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px;
    border-bottom: 1px solid #f8fafc;
    transition: background 0.2s;
  }
  .dark .ep-txn-row { border-color: #1e293b; }
  .ep-txn-row:last-child { border-bottom: none; }
  .ep-txn-row:hover { background: #fffbeb; }
  .dark .ep-txn-row:hover { background: rgba(217,119,6,0.04); }

  .ep-txn-icon {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ep-txn-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }
  .dark .ep-txn-title { color: #f1f5f9; }
  .ep-txn-date { font-size: 0.72rem; color: #94a3b8; margin-top: 1px; }

  .ep-txn-amount { font-size: 0.95rem; font-weight: 900; }
  .ep-txn-amount.credit { color: #16a34a; }
  .dark .ep-txn-amount.credit { color: #4ade80; }
  .ep-txn-amount.debit { color: #dc2626; }
  .dark .ep-txn-amount.debit { color: #f87171; }

  .ep-txn-status {
    font-size: 0.65rem; font-weight: 700; margin-top: 2px;
    text-align: right;
  }

  .ep-section-title {
    font-size: 0.8rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.1em; color: #d97706; margin-bottom: 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .ep-section-title::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(to right, #fde68a, transparent);
  }
  .dark .ep-section-title::after { background: linear-gradient(to right, #78350f, transparent); }

  .ep-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; min-height:400px; gap:12px; }
  .ep-loading-icon { width:56px;height:56px; background:linear-gradient(135deg,#d97706,#ea580c); border-radius:16px; display:flex;align-items:center;justify-content:center; font-size:1.5rem; animation:float 2s ease-in-out infinite; box-shadow:0 8px 24px rgba(217,119,6,0.3); }
`

export function EarningsPage() {
  const navigate = useNavigate();
  const { currentUserId } = useApp();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEarnings() {
      setLoading(true);
      try {
        if (currentUserId) {
          const myEarnings = await getArtistEarnings(currentUserId);
          const myTransactions = await getArtistTransactions(currentUserId);
          if (myEarnings) {
            setEarnings(myEarnings);
            setTransactions(myTransactions);
            setLoading(false);
            return;
          }
        }
        setEarnings({ artistId: currentUserId || '', artistName: '', totalEarnings: 0, thisMonth: 0, pendingPayout: 0, completedOrders: 0, platformFee: 0 });
        setTransactions([]);
      } catch (error) {
        console.error('Error fetching earnings:', error);
        setEarnings(null); setTransactions([]);
      } finally { setLoading(false); }
    }
    fetchEarnings();
  }, [currentUserId]);

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="ep-loading">
          <div className="ep-loading-icon">💰</div>
          <Loader2 size={20} className="animate-spin" style={{ color: '#d97706' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading earnings data...</p>
        </div>
      </>
    );
  }

  if (!earnings) {
    return (
      <>
        <style>{styles}</style>
        <div className="ep-loading">
          <Database size={48} style={{ color: '#cbd5e1' }} />
          <h2 style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }} className="dark:text-gray-100">No Earnings Data Found</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', maxWidth: 320 }}>
            Go to Profile and click "Seed Database" to populate sample data.
          </p>
          <button onClick={() => navigate('/profile')} style={{
            padding: '12px 24px', background: 'linear-gradient(135deg,#d97706,#ea580c)',
            color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(217,119,6,0.35)'
          }}>
            Go to Profile → Seed Database
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ep-page">
        <button className="ep-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Hero */}
        <div className="ep-hero-card">
          <div className="ep-hero-pattern" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="ep-hero-label">Total Earnings</div>
            <div className="ep-hero-amount">₹{earnings.totalEarnings.toLocaleString('en-IN')}</div>
            <div className="ep-hero-sub">{earnings.completedOrders} completed orders</div>
            <div className="ep-hero-badge">
              <TrendingUp size={12} /> Artist Earnings Dashboard
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="ep-stats-grid">
          {[
            { label: 'This Month', value: `₹${(earnings.thisMonth || 0).toLocaleString('en-IN')}`, emoji: '📅', bg: '#dbeafe', delay: '0s' },
            { label: 'Pending Payout', value: `₹${earnings.pendingPayout.toLocaleString('en-IN')}`, emoji: '⏳', bg: '#fef3c7', delay: '0.06s' },
            { label: 'Completed Orders', value: earnings.completedOrders, emoji: '✅', bg: '#d1fae5', delay: '0.12s' },
            { label: 'Platform Fee', value: `₹${earnings.platformFee.toLocaleString('en-IN')}`, emoji: '🏛', bg: '#f3e8ff', delay: '0.18s' },
          ].map(stat => (
            <div key={stat.label} className="ep-stat-card" style={{ animationDelay: stat.delay }}>
              <div className="ep-stat-icon" style={{ background: stat.bg }}>
                <span>{stat.emoji}</span>
              </div>
              <div className="ep-stat-val">{stat.value}</div>
              <div className="ep-stat-lbl">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Fee Banner */}
        <div className="ep-fee-banner">
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }} className="dark:text-gray-100">
              Platform Fee (5%)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
              Total commission paid to HunarHub
            </div>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#b45309' }} className="dark:text-amber-400">
            ₹{earnings.platformFee.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="ep-section-title" style={{ marginBottom: 12 }}>
          <span>⚡</span> Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
          {[
            { icon: <Wallet size={18} color="#16a34a" />, bg: '#d1fae5', label: 'Withdraw', desc: 'To bank account' },
            { icon: <CreditCard size={18} color="#1d4ed8" />, bg: '#dbeafe', label: 'UPI Setup', desc: 'Link your UPI ID' },
          ].map((action, i) => (
            <button key={action.label} className="ep-action-btn" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="ep-action-icon" style={{ background: action.bg }}>{action.icon}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e293b' }} className="dark:text-gray-100">{action.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 1 }}>{action.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div className="ep-section-title">
          <span>📋</span> Transaction History
        </div>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 18, border: '1.5px solid #f1f5f9' }} className="dark:bg-gray-900 dark:border-gray-800">
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 10 }}>💳</span>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No transactions found.</p>
          </div>
        ) : (
          <div className="ep-txn-container">
            {transactions.map((txn, i) => (
              <div key={i} className="ep-txn-row">
                <div className="ep-txn-icon" style={{ background: txn.type === 'credit' ? '#d1fae5' : '#fee2e2' }}>
                  {txn.type === 'credit'
                    ? <ArrowDownRight size={18} color="#16a34a" />
                    : <ArrowUpRight size={18} color="#dc2626" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ep-txn-title">{txn.title}</div>
                  <div className="ep-txn-date">{txn.date}</div>
                  {txn.description && (
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: 1 }}>{txn.description}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className={`ep-txn-amount ${txn.type === 'credit' ? 'credit' : 'debit'}`}>
                    {txn.type === 'credit' ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                  </div>
                  {txn.status && (
                    <div className="ep-txn-status" style={{
                      color: txn.status === 'completed' ? '#16a34a' : txn.status === 'pending' ? '#d97706' : '#3b82f6'
                    }}>
                      {txn.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}