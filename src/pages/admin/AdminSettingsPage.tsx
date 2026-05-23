import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  useEffect(() => { if (!sessionStorage.getItem('adminToken')) navigate('/admin'); }, []);

  return (
    <AdminLayout>
      <div style={{ maxWidth: 600 }}>
        <div className="admin-card">
          <div className="admin-section-title">⚙️ Platform Settings</div>
          <div className="admin-field">
            <label>Platform Name</label>
            <input defaultValue="HunarHub" />
          </div>
          <div className="admin-field">
            <label>Support Email</label>
            <input type="email" defaultValue="support@hunarhub.com" />
          </div>
          <div className="admin-field">
            <label>Platform Fee Rate (%)</label>
            <input type="number" defaultValue={5} min={0} max={30} />
          </div>
          <div className="admin-field">
            <label>Minimum Order Amount (₹)</label>
            <input type="number" defaultValue={100} min={0} />
          </div>
          <div className="admin-field">
            <label>Maximum Order Amount (₹)</label>
            <input type="number" defaultValue={500000} min={0} />
          </div>
          <div style={{ background: '#fef3c7', borderRadius: 12, padding: '14px 18px', fontSize: '0.84rem', color: '#92400e', fontWeight: 600, marginTop: 16 }}>
            ⚠ Settings persistence requires backend implementation. These fields are preview-only.
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-section-title">🔐 Admin Session</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>Current Admin</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{sessionStorage.getItem('adminName') || 'Admin'}</div>
              </div>
              <span className="admin-badge green">Active</span>
            </div>
            <button
              className="admin-btn danger"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => {
                sessionStorage.removeItem('adminToken');
                sessionStorage.removeItem('adminUser');
                sessionStorage.removeItem('adminName');
                navigate('/admin');
              }}
            >
              🔴 Logout from Admin Panel
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

