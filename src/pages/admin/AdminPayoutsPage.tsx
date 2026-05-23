import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, X } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminGetPayouts, adminApprovePayout, adminRejectPayout, type AdminPayout, type PageResponse } from '@/services/adminApiService';

const statusBadge = (s: string) => {
  const cls = s === 'PAID' ? 'green' : s === 'FAILED' ? 'red' : s === 'PROCESSING' ? 'blue' : 'yellow';
  return <span className={`admin-badge ${cls}`}>{s}</span>;
};

export default function AdminPayoutsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState<PageResponse<AdminPayout> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null);
  const [selected, setSelected] = useState<AdminPayout | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { if (!sessionStorage.getItem('adminToken')) navigate('/admin'); }, []);

  const load = async (p = 0) => {
    setLoading(true);
    try { setPage(await adminGetPayouts(p, 20)); setCurrentPage(p); }
    catch (e: any) { showToast('Error: ' + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const openApprove = (p: AdminPayout) => { setSelected(p); setForm({ transactionReference: '' }); setModal('approve'); };
  const openReject = (p: AdminPayout) => { setSelected(p); setForm({ reason: '' }); setModal('reject'); };
  const closeModal = () => { setModal(null); setSelected(null); setForm({}); };

  const handleApprove = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApprovePayout(selected.id, form.transactionReference);
      showToast('Payout approved ✅ Artist notified');
      closeModal(); load();
    } catch (e: any) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleReject = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminRejectPayout(selected.id, form.reason);
      showToast('Payout rejected. Artist notified.');
      closeModal(); load();
    } catch (e: any) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const pendingCount = (page?.content || []).filter(p => p.status === 'CREATED' || p.status === 'PROCESSING').length;

  return (
    <AdminLayout>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 12, zIndex: 9999, fontWeight: 600, fontSize: '0.84rem' }}>
          {toast}
        </div>
      )}

      {pendingCount > 0 && (
        <div style={{ background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: 12, padding: '12px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.84rem', fontWeight: 700, color: '#92400e' }}>
          ⏳ {pendingCount} payout request{pendingCount > 1 ? 's' : ''} pending your action
        </div>
      )}

      {loading ? (
        <div className="admin-loading"><Loader2 size={22} className="animate-spin" style={{ color: '#d97706' }} /> Loading payouts...</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Artist</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th>Transaction Ref</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(page?.content || []).length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No payout requests</td></tr>
                ) : (page?.content || []).map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.artistName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.artistEmail}</div>
                    </td>
                    <td style={{ fontWeight: 900, fontSize: '1rem', color: '#1e293b' }}>₹{(p.amount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: '#64748b' }}>{p.currency || 'INR'}</td>
                    <td>{statusBadge(p.status)}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {p.transactionReference || '—'}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      {(p.status === 'CREATED' || p.status === 'PROCESSING') && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="admin-btn success" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => openApprove(p)}>
                            <Check size={13} /> Approve
                          </button>
                          <button className="admin-btn danger" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => openReject(p)}>
                            <X size={13} /> Reject
                          </button>
                        </div>
                      )}
                      {p.status !== 'CREATED' && p.status !== 'PROCESSING' && (
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {page && page.totalPages > 1 && (
            <div className="admin-pagination">
              <button className="admin-page-btn" onClick={() => load(currentPage - 1)} disabled={currentPage === 0}>‹ Prev</button>
              {Array.from({ length: Math.min(page.totalPages, 7) }, (_, i) => (
                <button key={i} className={`admin-page-btn ${i === currentPage ? 'active' : ''}`} onClick={() => load(i)}>{i + 1}</button>
              ))}
              <button className="admin-page-btn" onClick={() => load(currentPage + 1)} disabled={currentPage >= page.totalPages - 1}>Next ›</button>
            </div>
          )}
        </>
      )}

      {/* Approve Modal */}
      {modal === 'approve' && selected && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">💸 Approve Payout</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <div style={{ background: '#d1fae5', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#065f46' }}>₹{(selected.amount || 0).toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.78rem', color: '#047857' }}>to {selected.artistName} ({selected.artistEmail})</div>
            </div>
            <div className="admin-field">
              <label>Transaction Reference (optional)</label>
              <input value={form.transactionReference || ''} onChange={e => setForm((f: any) => ({...f, transactionReference: e.target.value}))} placeholder="Bank/UPI transaction ID..." />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="admin-btn ghost" onClick={closeModal}>Cancel</button>
              <button className="admin-btn success" onClick={handleApprove} disabled={saving} style={{ background: '#16a34a', color: '#fff' }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Confirm & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {modal === 'reject' && selected && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">❌ Reject Payout</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <p style={{ color: '#64748b', marginBottom: 16 }}>
              Reject ₹{(selected.amount || 0).toLocaleString('en-IN')} payout for <strong>{selected.artistName}</strong>?
              The artist will be notified with your reason.
            </p>
            <div className="admin-field">
              <label>Reason (required)</label>
              <select value={form.reason || ''} onChange={e => setForm((f: any) => ({...f, reason: e.target.value}))}>
                <option value="">Select reason...</option>
                <option value="Invalid bank details">Invalid bank details</option>
                <option value="Insufficient earnings">Insufficient earnings</option>
                <option value="Fraud review required">Fraud review required</option>
                <option value="Duplicate request">Duplicate request</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="admin-btn ghost" onClick={closeModal}>Cancel</button>
              <button className="admin-btn danger" onClick={handleReject} disabled={saving || !form.reason} style={{ background: '#dc2626', color: '#fff' }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Reject Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

