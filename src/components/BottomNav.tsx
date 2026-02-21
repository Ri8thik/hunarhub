import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, Wallet } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const customerTabs = [
  { path: '/', icon: Home, label: 'Home', emoji: '🏠' },
  { path: '/explore', icon: Search, label: 'Explore', emoji: '🔍' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders', emoji: '📦' },
  { path: '/profile', icon: User, label: 'Profile', emoji: '👤' },
];

const artistTabs = [
  { path: '/', icon: Home, label: 'Home', emoji: '📊' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders', emoji: '📦' },
  { path: '/earnings', icon: Wallet, label: 'Earnings', emoji: '💰' },
  { path: '/profile', icon: User, label: 'Profile', emoji: '⚙️' },
];

const styles = `
  @keyframes bn-pop {
    0%   { transform: translateY(0) scale(1); }
    40%  { transform: translateY(-6px) scale(1.15); }
    70%  { transform: translateY(-2px) scale(1.05); }
    100% { transform: translateY(0) scale(1); }
  }

  .bottom-nav {
    background: #ffffff;
    border-top: 1px solid #f1f5f9;
    flex-shrink: 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    position: relative;
  }
  .dark .bottom-nav {
    background: #0a0f1e;
    border-color: #1e293b;
  }

  /* Top highlight line */
  .bottom-nav::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(217,119,6,0.3), transparent);
  }

  .bn-inner {
    display: flex; align-items: center; justify-content: space-around;
    padding: 6px 8px 4px;
  }

  .bn-tab {
    display: flex; flex-direction: column; align-items: center;
    padding: 6px 16px;
    border-radius: 16px;
    border: none; cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
    position: relative;
    min-width: 60px;
  }
  .bn-tab.active {
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
  }
  .dark .bn-tab.active {
    background: linear-gradient(135deg, #1c0a00, #251000);
  }

  .bn-icon-wrap {
    width: 32px; height: 32px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 2px;
    transition: all 0.2s;
  }
  .bn-tab.active .bn-icon-wrap {
    animation: bn-pop 0.35s ease;
  }

  .bn-label {
    font-size: 0.6rem; font-weight: 600;
    transition: color 0.2s;
    line-height: 1;
  }
  .bn-tab.active .bn-label {
    color: #b45309; font-weight: 800;
  }
  .dark .bn-tab.active .bn-label { color: #fbbf24; }
  .bn-tab:not(.active) .bn-label { color: #94a3b8; }

  /* Active indicator dot */
  .bn-dot {
    position: absolute;
    bottom: 2px;
    width: 4px; height: 4px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d97706, #ea580c);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .bn-tab.active .bn-dot { opacity: 1; }
`

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useApp();

  const tabs = userRole === 'artist' ? artistTabs : customerTabs;

  const hiddenPrefixes = ['/chat/', '/artist/', '/request/', '/order/'];
  if (hiddenPrefixes.some(p => location.pathname.startsWith(p))) return null;

  return (
    <>
      <style>{styles}</style>
      <nav className="bottom-nav">
        <div className="bn-inner">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`bn-tab ${isActive ? 'active' : ''}`}
              >
                <div className="bn-icon-wrap">
                  {isActive
                    ? <span style={{ fontSize: '1.1rem' }}>{tab.emoji}</span>
                    : <Icon size={20} color="#94a3b8" strokeWidth={1.8} />
                  }
                </div>
                <span className="bn-label">{tab.label}</span>
                <div className="bn-dot" />
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}