import { useNavigate } from 'react-router-dom';
import { Bell, Palette, Moon, Sun } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const styles = `
  .topnav {
    background: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    padding: 0 1rem;
    height: 60px;
    display: flex; align-items: center; gap: 12px;
    flex-shrink: 0;
    transition: background 0.3s, border-color 0.3s;
    position: relative;
    z-index: 10;
  }
  .dark .topnav {
    background: #0a0f1e;
    border-color: #1e293b;
  }
  @media (min-width: 1024px) {
    .topnav { padding: 0 2rem; }
  }

  /* Mobile logo */
  .tn-logo {
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; text-decoration: none;
  }
  @media (min-width: 1024px) { .tn-logo { display: none; } }

  .tn-logo-icon {
    width: 32px; height: 32px;
    border-radius: 9px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 10px rgba(217,119,6,0.3);
  }
  .tn-logo-text {
    font-size: 1rem; font-weight: 900;
    background: linear-gradient(135deg, #b45309, #ea580c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tn-spacer { flex: 1; }

  /* Role switcher pill */
  .tn-role-switcher {
    display: none;
    background: #f1f5f9;
    border-radius: 12px;
    padding: 3px;
    gap: 2px;
  }
  .dark .tn-role-switcher { background: #1e293b; }
  @media (min-width: 768px) { .tn-role-switcher { display: flex; } }

  .tn-role-btn {
    padding: 6px 14px;
    border-radius: 9px;
    font-size: 0.75rem; font-weight: 700;
    border: none; cursor: pointer;
    transition: all 0.2s;
    color: #64748b;
    background: transparent;
  }
  .dark .tn-role-btn { color: #94a3b8; }
  .tn-role-btn.active {
    background: #fff;
    color: #92400e;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }
  .dark .tn-role-btn.active {
    background: #1e293b;
    color: #fbbf24;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  /* Icon buttons */
  .tn-icon-btn {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    flex-shrink: 0;
  }
  .dark .tn-icon-btn {
    background: #1e293b;
    border-color: #334155;
  }
  .tn-icon-btn:hover {
    background: #e2e8f0;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.08);
  }
  .dark .tn-icon-btn:hover {
    background: #334155;
    box-shadow: 0 3px 8px rgba(0,0,0,0.3);
  }

  /* Notification dot */
  .tn-notif-dot {
    position: absolute;
    top: -4px; right: -4px;
    width: 18px; height: 18px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.6rem; font-weight: 800; color: #fff;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(239,68,68,0.4);
  }
  .dark .tn-notif-dot { border-color: #0a0f1e; }

  /* Avatar */
  .tn-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d97706, #ea580c);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 800; color: #fff;
    cursor: pointer;
    border: 2px solid rgba(217,119,6,0.3);
    box-shadow: 0 3px 10px rgba(217,119,6,0.25);
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .tn-avatar:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 14px rgba(217,119,6,0.4);
  }
`

export function TopNav() {
  const navigate = useNavigate();
  const { userRole, currentUserName, switchRole, darkMode, toggleDarkMode, isArtist, artistChecked, unreadCount } = useApp();

  return (
    <>
      <style>{styles}</style>
      <header className="topnav">
        {/* Mobile Logo */}
        <div className="tn-logo" onClick={() => navigate('/')}>
          <div className="tn-logo-icon">
            <Palette size={16} color="#fff" />
          </div>
          <span className="tn-logo-text">HunarHub</span>
        </div>

        <div className="tn-spacer" />

        {/* Role Switcher — only if has artist profile */}
        {artistChecked && isArtist && (
          <div className="tn-role-switcher">
            <button
              className={`tn-role-btn ${userRole === 'customer' ? 'active' : ''}`}
              onClick={() => switchRole('customer')}
            >
              🛒 Customer
            </button>
            <button
              className={`tn-role-btn ${userRole === 'artist' ? 'active' : ''}`}
              onClick={() => switchRole('artist')}
            >
              🎨 Artist
            </button>
          </div>
        )}

        {/* Dark Mode */}
        <button className="tn-icon-btn" onClick={toggleDarkMode} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
          {darkMode
            ? <Sun size={16} color="#fbbf24" />
            : <Moon size={16} color="#64748b" />
          }
        </button>

        {/* Notifications */}
        <button className="tn-icon-btn" onClick={() => navigate('/notifications')}>
          <Bell size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
          {unreadCount > 0 && (
            <span className="tn-notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {/* Avatar */}
        <button className="tn-avatar" onClick={() => navigate('/profile')}>
          {currentUserName.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </button>
      </header>
    </>
  );
}