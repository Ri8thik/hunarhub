import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminBroadcastNotification } from '@/services/adminApiService';

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ target: 'ALL', type: 'GENERAL', title: '', body: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const toResultMessage = (res: unknown): string => {
    if (typeof res === 'string') return res;
    if (res && typeof res === 'object' && 'message' in res) {
      const maybeMessage = (res as { message?: unknown }).message;
      if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;
    }
    return 'Notification sent successfully';
  };

  useEffect(() => { if (!sessionStorage.getItem('adminToken')) navigate('/admin'); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) { setError('Title and body are required'); return; }
    setSending(true); setResult(''); setError('');
    try {
      const res = await adminBroadcastNotification(form.target, form.type, form.title, form.body);
      setResult(toResultMessage(res));
      setForm(f => ({ ...f, title: '', body: '' }));
    } catch (e: any) { setError(e.message); }
    finally { setSending(false); }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: 640 }}>
        <div className="admin-card">
          <div className="admin-section-title">📢 Send Platform Notification</div>
          <form onSubmit={handleSend}>
            <div className="admin-field">
              <label>Target Audience</label>
              <select value={form.target} onChange={e => setForm(f => ({...f, target: e.target.value}))}>
                <option value="ALL">All Users</option>
                <option value="ALL_ARTISTS">All Artists</option>
                <option value="ALL_CUSTOMERS">All Customers</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Notification Type</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                <option value="GENERAL">General Announcement</option>
                <option value="PROMO">Promotional Offer</option>
                <option value="SYSTEM">System Alert</option>
                <option value="MAINTENANCE">Maintenance Notice</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Notification title..." maxLength={80} />
            </div>
            <div className="admin-field">
              <label>Message</label>
              <textarea rows={4} value={form.body} onChange={e => setForm(f => ({...f, body: e.target.value}))} placeholder="Write your message here..." />
            </div>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.82rem', fontWeight: 600 }}>⚠ {error}</div>}
            {result && <div style={{ background: '#d1fae5', color: '#065f46', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.82rem', fontWeight: 600 }}>✅ {result}</div>}

            <button type="submit" className="admin-btn primary" disabled={sending}>
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>

        {/* Preview card */}
        <div className="admin-card">
          <div className="admin-section-title">👁️ Preview</div>
          <div style={{ background: '#f8fafc', borderRadius: 14, padding: '16px', border: '1.5px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#d97706,#ea580c)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                🔔
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{form.title || 'Notification Title'}</div>
                <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>{form.body || 'Your message will appear here...'}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 8 }}>
                  To: {form.target === 'ALL' ? 'All Users' : form.target === 'ALL_ARTISTS' ? 'All Artists' : 'All Customers'} • {form.type}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
