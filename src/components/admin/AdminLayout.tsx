import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Palette, ShoppingBag, Star,
  DollarSign, CreditCard, Bell, Settings, BarChart2,
  LogOut, ChevronLeft, ChevronRight, Shield, FileText
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',     path: '/admin/dashboard',      icon: LayoutDashboard,  badge: null },
  { label: 'Users',         path: '/admin/users',          icon: Users,            badge: null },
  { label: 'Artists',       path: '/admin/artists',        icon: Palette,          badge: null },
  { label: 'Orders',        path: '/admin/orders',         icon: ShoppingBag,      badge: null },
  { label: 'Reviews',       path: '/admin/reviews',        icon: Star,             badge: null },
  { label: 'Earnings',      path: '/admin/earnings',       icon: DollarSign,       badge: null },
  { label: 'Payouts',       path: '/admin/payouts',        icon: CreditCard,       badge: null },
  { label: 'Notifications', path: '/admin/notifications',  icon: Bell,             badge: null },
  { label: 'Analytics',     path: '/admin/analytics',      icon: BarChart2,        badge: null },
  { label: 'Audit Log',     path: '/admin/audit-log',      icon: FileText,         badge: null },
  { label: 'Settings',      path: '/admin/settings',       icon: Settings,         badge: null },
];

interface Props { children: React.ReactNode }

export function AdminLayout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const adminName = sessionStorage.getItem('adminName') || 'Admin';

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminName');
    navigate('/admin');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <div className="admin-logo-icon"><Shield size={20} color="#fff" /></div>
          {!collapsed && <span className="admin-logo-text">HunarHub Admin</span>}
        </div>

        {/* Nav items */}
        <nav className="admin-sidebar-nav">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`admin-nav-item ${active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
                {item.badge && !collapsed && (
                  <span className="admin-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: collapse + logout */}
        <div className="admin-sidebar-bottom">
          <button className="admin-nav-item" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
          </button>
          <button className="admin-nav-item logout" onClick={handleLogout} title={collapsed ? 'Logout' : undefined}>
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">
            {NAV.find(n => n.path === location.pathname)?.label || 'Admin Panel'}
          </h1>
          <div className="admin-topbar-right">
            <div className="admin-avatar-chip">
              <div className="admin-avatar-dot" />
              <span>{adminName}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

