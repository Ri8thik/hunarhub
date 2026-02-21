import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, Wallet, Palette, LogOut, ArrowRightLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const customerLinks = [
  { path: '/', icon: Home, label: 'Home', emoji: '🏠' },
  { path: '/explore', icon: Search, label: 'Explore Artists', emoji: '🔍' },
  { path: '/orders', icon: ShoppingBag, label: 'My Orders', emoji: '📦' },
  { path: '/profile', icon: User, label: 'Profile', emoji: '👤' },
];

const artistLinks = [
  { path: '/', icon: Home, label: 'Dashboard', emoji: '📊' },
  { path: '/my-artist-profile', icon: Palette, label: 'My Artist Profile', emoji: '🎨' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders', emoji: '📦' },
  { path: '/earnings', icon: Wallet, label: 'Earnings', emoji: '💰' },
  { path: '/profile', icon: User, label: 'Settings', emoji: '⚙️' },
];

const styles = `
  .sidebar-root {
    display: none;
    flex-direction: column;
    width: 256px;
    background: #ffffff;
    border-right: 1px solid #f1f5f9;
    height: 100vh;
    flex-shrink: 0;
    transition: background 0.3s, border-color 0.3s;
    position: relative;
    overflow: hidden;
  }
  .dark .sidebar-root {
    background: #0a0f1e;
    border-color: #1e293b;
  }
  @media (min-width: 1024px) {
    .sidebar-root { display: flex; }
  }

  /* subtle top-right glow */
  .sidebar-root::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── Logo ── */
  .sb-logo {
    display: flex; align-items: center; gap: 12px;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
  }
  .dark .sb-logo { border-color: #1e293b; }
  .sb-logo:hover { background: #fffbeb; }
  .dark .sb-logo:hover { background: rgba(217,119,6,0.05); }

  .sb-logo-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #d97706, #ea580c);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(217,119,6,0.35);
    flex-shrink: 0;
  }
  .sb-logo-title {
    font-size: 1.1rem; font-weight: 900;
    background: linear-gradient(135deg, #b45309, #ea580c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
  }
  .sb-logo-sub {
    font-size: 0.65rem; font-weight: 500;
    color: #94a3b8; margin-top: 1px;
  }

  /* ── Mode badge ── */
  .sb-mode {
    margin: 12px;
    border-radius: 12px;
    padding: 10px 14px;
    display: flex; align-items: center; gap: 8px;
    font-size: 0.75rem; font-weight: 700;
  }
  .sb-mode.artist {
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    border: 1px solid #fde68a;
    color: #92400e;
  }
  .dark .sb-mode.artist {
    background: linear-gradient(135deg, #1c0a00, #251000);
    border-color: #78350f; color: #fcd34d;
  }
  .sb-mode.customer {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1px solid #bfdbfe;
    color: #1e40af;
  }
  .dark .sb-mode.customer {
    background: linear-gradient(135deg, #0c1a2e, #0f2240);
    border-color: #1e3a5f; color: #93c5fd;
  }
  .sb-mode-dot {
    width: 8px; height: 8px; border-radius: 50%;
    margin-left: auto; flex-shrink: 0;
  }
  .sb-mode.artist .sb-mode-dot { background: #d97706; }
  .sb-mode.customer .sb-mode-dot { background: #3b82f6; }

  /* ── Nav ── */
  .sb-nav { flex: 1; padding: 6px 10px; overflow-y: auto; }

  .sb-nav-item {
    width: 100%; display: flex; align-items: center; gap: 12px;
    padding: 11px 14px;
    border-radius: 12px;
    font-size: 0.875rem; font-weight: 500;
    margin-bottom: 2px;
    border: none; cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    position: relative;
    overflow: hidden;
  }
  .sb-nav-item.active {
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    color: #92400e;
    font-weight: 700;
    border: 1px solid #fde68a;
    box-shadow: 0 2px 8px rgba(217,119,6,0.15);
  }
  .dark .sb-nav-item.active {
    background: linear-gradient(135deg, #1c0a00, #251000);
    color: #fbbf24;
    border-color: #78350f;
    box-shadow: 0 2px 10px rgba(217,119,6,0.2);
  }
  .sb-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px;
    background: linear-gradient(to bottom, #d97706, #ea580c);
    border-radius: 0 4px 4px 0;
  }
  .sb-nav-item:not(.active) {
    color: #64748b;
    background: transparent;
    border: 1px solid transparent;
  }
  .dark .sb-nav-item:not(.active) { color: #94a3b8; }
  .sb-nav-item:not(.active):hover {
    background: #f8fafc;
    color: #334155;
    border-color: #f1f5f9;
  }
  .dark .sb-nav-item:not(.active):hover {
    background: #1e293b;
    color: #e2e8f0;
    border-color: #334155;
  }

  .sb-nav-emoji {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; flex-shrink: 0;
  }
  .sb-nav-item.active .sb-nav-emoji {
    background: rgba(217,119,6,0.15);
  }
  .dark .sb-nav-item.active .sb-nav-emoji {
    background: rgba(217,119,6,0.2);
  }
  .sb-nav-item:not(.active) .sb-nav-emoji {
    background: #f1f5f9;
  }
  .dark .sb-nav-item:not(.active) .sb-nav-emoji {
    background: #1e293b;
  }

  /* ── Switcher & Become Artist ── */
  .sb-switcher {
    margin: 0 10px 6px;
    padding: 11px 14px;
    border-radius: 12px;
    display: flex; align-items: center; gap: 10px;
    font-size: 0.82rem; font-weight: 700;
    cursor: pointer; border: none;
    transition: all 0.2s;
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    color: #6d28d9;
    border: 1px solid #ddd6fe;
  }
  .dark .sb-switcher {
    background: linear-gradient(135deg, #150e2d, #1c1240);
    color: #a78bfa;
    border-color: #2e1f6b;
  }
  .sb-switcher:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(109,40,217,0.15); }

  .sb-become {
    margin: 0 10px 6px;
    padding: 11px 14px;
    border-radius: 12px;
    display: flex; align-items: center; gap: 10px;
    font-size: 0.82rem; font-weight: 700;
    cursor: pointer; border: none;
    transition: all 0.2s;
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    color: #92400e;
    border: 1px solid #fde68a;
    width: calc(100% - 20px);
  }
  .dark .sb-become {
    background: linear-gradient(135deg, #1c0a00, #251000);
    color: #fcd34d;
    border-color: #78350f;
  }
  .sb-become:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(217,119,6,0.2); }

  /* ── User footer ── */
  .sb-footer {
    border-top: 1px solid #f1f5f9;
    padding: 14px;
  }
  .dark .sb-footer { border-color: #1e293b; }

  .sb-user-row {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 10px;
  }
  .sb-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d97706, #ea580c);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; font-weight: 800; color: #fff;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(217,119,6,0.3);
  }
  .sb-user-name {
    font-size: 0.875rem; font-weight: 700;
    color: #1e293b; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }
  .dark .sb-user-name { color: #f1f5f9; }
  .sb-user-role {
    font-size: 0.7rem; color: #94a3b8;
    text-transform: capitalize; margin-top: 1px;
  }

  .sb-logout {
    width: 100%; display: flex; align-items: center; gap: 8px;
    padding: 9px 12px; border-radius: 10px;
    font-size: 0.82rem; font-weight: 600;
    color: #ef4444; cursor: pointer;
    border: 1px solid transparent;
    background: transparent;
    transition: all 0.2s;
  }
  .dark .sb-logout { color: #f87171; }
  .sb-logout:hover {
    background: #fff1f2;
    border-color: #fecdd3;
  }
  .dark .sb-logout:hover {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.2);
  }
`

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, isArtist, artistChecked, currentUserName, logout, switchRole } = useApp();

  const showArtistMode = artistChecked && isArtist && userRole === 'artist';
  const links = showArtistMode ? artistLinks : customerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{styles}</style>
      <aside className="sidebar-root">
        {/* Logo */}
        <div className="sb-logo" onClick={() => navigate('/')}>
          <div className="sb-logo-icon">
            <Palette size={20} color="#fff" />
          </div>
          <div>
            <div className="sb-logo-title">HunarHub</div>
            <div className="sb-logo-sub">Custom Art Marketplace</div>
          </div>
        </div>

        {/* Mode Badge */}
        <div className={`sb-mode ${showArtistMode ? 'artist' : 'customer'}`}>
          <span>{showArtistMode ? '🎨' : '🛒'}</span>
          <span>{showArtistMode ? 'Artist Mode' : 'Customer Mode'}</span>
          <div className="sb-mode-dot" />
        </div>

        {/* Nav Links */}
        <nav className="sb-nav">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <button
                key={link.path + link.label}
                onClick={() => navigate(link.path)}
                className={`sb-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="sb-nav-emoji">{link.emoji}</div>
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Role Switcher */}
        {artistChecked && isArtist && (
          <button
            className="sb-switcher"
            style={{ width: 'calc(100% - 20px)', marginLeft: 10 }}
            onClick={() => switchRole(userRole === 'customer' ? 'artist' : 'customer')}
          >
            <ArrowRightLeft size={16} />
            <span>Switch to {userRole === 'customer' ? 'Artist' : 'Customer'}</span>
          </button>
        )}

        {/* Become Artist */}
        {artistChecked && !isArtist && (
          <button className="sb-become" onClick={() => navigate('/become-artist')}>
            <span>✨</span>
            <span>Become an Artist</span>
          </button>
        )}

        {/* User Footer */}
        <div className="sb-footer">
          <div className="sb-user-row">
            <div className="sb-avatar">
              {currentUserName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sb-user-name">{currentUserName}</div>
              <div className="sb-user-role">{userRole}</div>
            </div>
          </div>
          <button className="sb-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}