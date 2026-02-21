import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MessageSquare, Star, CreditCard, Loader2, Bell } from 'lucide-react';
import { getNotifications } from '@/services/firestoreService';
import { useApp } from '@/context/AppContext';

interface NotificationItem {
  id: string;
  type: 'order' | 'message' | 'review' | 'payment';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

const typeConfig = {
  order:   { icon: ShoppingBag, bg: '#dbeafe', color: '#1d4ed8', darkBg: 'rgba(30,64,175,0.2)', darkColor: '#93c5fd', emoji: '📦' },
  message: { icon: MessageSquare, bg: '#d1fae5', color: '#065f46', darkBg: 'rgba(20,83,45,0.2)', darkColor: '#6ee7b7', emoji: '💬' },
  review:  { icon: Star, bg: '#fef3c7', color: '#b45309', darkBg: 'rgba(120,53,15,0.2)', darkColor: '#fcd34d', emoji: '⭐' },
  payment: { icon: CreditCard, bg: '#f3e8ff', color: '#6b21a8', darkBg: 'rgba(91,33,182,0.2)', darkColor: '#c4b5fd', emoji: '💳' },
};

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes pulse-dot {
    0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.6; transform:scale(1.3)}
  }

  .np-page { padding: 1rem; background: #f8fafc; min-height: 100%; }
  @media(min-width:1024px) { .np-page { padding: 2rem; } }
  .dark .np-page { background: #030712; }

  .np-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
  }
  .np-back {
    background: none; border: none; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    color: #94a3b8; font-size: 0.875rem; font-weight: 600;
    padding: 0; transition: color 0.2s;
  }
  .np-back:hover { color: #d97706; }

  .np-title {
    flex: 1; font-size: 1.2rem; font-weight: 900; color: #1e293b;
    display: flex; align-items: center; gap: 8px;
  }
  .dark .np-title { color: #f1f5f9; }

  .np-mark-all {
    font-size: 0.78rem; font-weight: 700; color: #d97706;
    background: none; border: none; cursor: pointer;
    padding: 6px 12px; border-radius: 8px;
    background: #fffbeb; border: 1px solid #fde68a;
    transition: all 0.2s;
  }
  .dark .np-mark-all { background: #1c0a00; border-color: #78350f; color: #fbbf24; }
  .np-mark-all:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(217,119,6,0.2); }

  /* ── Notification card ── */
  .np-notif {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer; transition: background 0.2s;
    animation: fadeInUp 0.35s ease both;
    position: relative;
  }
  .dark .np-notif { border-color: #1e293b; }
  .np-notif:last-child { border-bottom: none; }
  .np-notif:hover { background: #fffbeb; }
  .dark .np-notif:hover { background: rgba(217,119,6,0.04); }
  .np-notif.unread { background: #fffdf5; }
  .dark .np-notif.unread { background: rgba(217,119,6,0.03); }

  /* Unread left stripe */
  .np-notif.unread::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #d97706, #ea580c);
    border-radius: 0 3px 3px 0;
  }

  .np-icon-wrap {
    width: 42px; height: 42px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 1.1rem;
    transition: transform 0.2s;
  }
  .np-notif:hover .np-icon-wrap { transform: scale(1.08); }

  .np-content { flex: 1; min-width: 0; }

  .np-notif-title-row {
    display: flex; align-items: center; gap: 6px; margin-bottom: 3px;
  }
  .np-notif-title {
    font-size: 0.875rem; color: #1e293b; flex: 1;
  }
  .dark .np-notif-title { color: #f1f5f9; }
  .np-notif-title.bold { font-weight: 800; }
  .np-notif-title.normal { font-weight: 500; }

  .np-unread-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: linear-gradient(135deg, #d97706, #ea580c);
    flex-shrink: 0;
    animation: pulse-dot 2s ease-in-out infinite;
  }

  .np-body { font-size: 0.8rem; color: #64748b; line-height: 1.55; }
  .dark .np-body { color: #94a3b8; }

  .np-time { font-size: 0.7rem; color: #94a3b8; margin-top: 5px; }

  /* ── Container ── */
  .np-container {
    background: #fff; border-radius: 20px;
    border: 1.5px solid #f1f5f9;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    animation: fadeInUp 0.4s ease both;
  }
  .dark .np-container { background: #0f172a; border-color: #1e293b; }

  /* ── Empty ── */
  .np-empty {
    text-align: center; padding: 4rem 1rem;
    background: #fff; border-radius: 20px;
    border: 1.5px solid #f1f5f9;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    animation: fadeInUp 0.4s ease;
  }
  .dark .np-empty { background: #0f172a; border-color: #1e293b; }
  .np-empty-icon { font-size: 3rem; display: block; margin-bottom: 14px; animation: float 3s ease-in-out infinite; }

  /* ── Loading ── */
  .np-loading { display:flex; align-items:center; justify-content:center; padding:4rem; gap:12px; }
`

export function NotificationsPage() {
  const navigate = useNavigate();
  const { currentUserId } = useApp();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      try {
        const data = await getNotifications(currentUserId);
        const mapped: NotificationItem[] = data.map((d) => {
          const raw = d as unknown as Record<string, unknown>;
          return {
            id: (raw.id as string) || '',
            type: (raw.type as NotificationItem['type']) || 'order',
            title: (raw.title as string) || '',
            body: (raw.body as string) || (raw.message as string) || '',
            timestamp: (raw.timestamp as string) || (raw.createdAt as string) || '',
            read: (raw.read as boolean) || false,
          };
        });
        setNotifications(mapped);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [currentUserId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <style>{styles}</style>
      <div className="np-page">
        <div className="np-header">
          <button className="np-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="np-title">
            <Bell size={18} color="#d97706" />
            Notifications
            {unreadCount > 0 && (
              <span style={{
                background: 'linear-gradient(135deg,#d97706,#ea580c)',
                color: '#fff', borderRadius: 99, padding: '2px 8px',
                fontSize: '0.68rem', fontWeight: 800
              }}>{unreadCount}</span>
            )}
          </h1>
          {notifications.length > 0 && (
            <button className="np-mark-all">Mark all read</button>
          )}
        </div>

        {loading ? (
          <div className="np-loading">
            <Loader2 size={28} className="animate-spin" style={{ color: '#d97706' }} />
            <span style={{ color: '#94a3b8' }}>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="np-empty">
            <span className="np-empty-icon">🔔</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: 6 }} className="dark:text-gray-100">
              No notifications yet
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Order updates, messages, and reviews will appear here.
            </p>
          </div>
        ) : (
          <div className="np-container">
            {notifications.map((notif, i) => {
              const typeKey = notif.type in typeConfig ? notif.type : 'order';
              const cfg = typeConfig[typeKey];
              return (
                <div
                  key={notif.id}
                  className={`np-notif ${!notif.read ? 'unread' : ''}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="np-icon-wrap" style={{ background: cfg.bg }}>
                    <span>{cfg.emoji}</span>
                  </div>
                  <div className="np-content">
                    <div className="np-notif-title-row">
                      <span className={`np-notif-title ${!notif.read ? 'bold' : 'normal'}`}>
                        {notif.title}
                      </span>
                      {!notif.read && <div className="np-unread-dot" />}
                    </div>
                    <p className="np-body">{notif.body}</p>
                    <p className="np-time">{notif.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}