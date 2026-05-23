import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || 'Login failed');
        setLoading(false);
        return;
      }

      const data = json?.data ?? json;
      const roles: string[] = data?.roles || data?.user?.roles || [];
      const hasAdmin = roles.some((r: string) => r === 'ADMIN' || r === 'ROLE_ADMIN');

      if (!hasAdmin) {
        setError('Access denied. Admin credentials required.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('adminToken', data.accessToken || data.token || '');
      sessionStorage.setItem('adminUser', JSON.stringify(data.user || data));
      sessionStorage.setItem('adminName', data.user?.displayName || data.displayName || 'Admin');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0c0a09 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg, #d97706, #ea580c)',
            borderRadius: 16,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(217,119,6,0.4)',
            marginBottom: 14,
          }}>
            <Shield size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            HunarHub Admin
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
            Platform Administration Portal
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="admin-field">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@hunarhub.com"
              required
            />
          </div>

          <div className="admin-field" style={{ position: 'relative' }}>
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              style={{
                position: 'absolute', right: 12, bottom: 10,
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2', color: '#dc2626', borderRadius: 10,
              padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600,
              marginBottom: 16,
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-btn primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '0.9rem', borderRadius: 12 }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
            {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem', color: '#94a3b8' }}>
          ⚠ Only authorized administrators can access this portal
        </p>
        <p style={{ textAlign: 'center', marginTop: 6, fontSize: '0.75rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#d97706', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
          >
            ← Back to main site
          </button>
        </p>
      </div>
    </div>
  );
}
