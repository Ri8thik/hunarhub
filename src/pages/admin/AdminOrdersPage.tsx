import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, X, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminGetOrders, adminOverrideOrderStatus, adminDeleteOrder, type AdminOrder, type PageResponse } from '@/services/adminApiService';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'blue', REQUESTED: 'blue', ACCEPTED: 'green',
  IN_PROGRESS: 'yellow', DELIVERED: 'purple', COMPLETED: 'green',
  REJECTED: 'red', CANCELLED: 'red',
};

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState<PageResponse<AdminOrder> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'status' | 'delete' | 'view' | null>(null);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { if (!sessionStorage.getItem('adminToken')) navigate('/admin'); }, []);

  const load = async (p = 0) => {
    setLoading(true);
    try { setPage(await adminGetOrders(p, 20)); setCurrentPage(p); }
    catch (e: any) { showToast('Error: ' + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const openStatus = (o: AdminOrder) => { setSelected(o); setForm({ status: o.status, reason: '' }); setModal('status'); };
  const openDelete = (o: AdminOrder) => { setSelected(o); setModal('delete'); };
  const openView = (o: AdminOrder) => { setSelected(o); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); setForm({}); };

  const handleStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminOverrideOrderStatus(selected.id, form.status, form.reason);
      showToast('Order status updated');
      closeModal(); load();
    } catch (e: any) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminDeleteOrder(selected.id);
      showToast('Order deleted');
      closeModal(); load();
    } catch (e: any) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const filtered = (page?.content || []).filter(o =>
    !search || o.title?.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    o.artistName?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 12, zIndex: 9999, fontWeight: 600, fontSize: '0.84rem' }}>
          {toast}
        </div>
      )}

      <div className="admin-toolbar">
        <input className="admin-search" placeholder="🔍 Search by title, customer, artist, ID..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="admin-loading"><Loader2 size={22} className="animate-spin" style={{ color: '#d97706' }} /> Loading orders...</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Artist</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Deadline</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No orders found</td></tr>
                ) : filtered.map(o => (
                  <tr key={o.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'monospace' }}>#{o.id.substring(0, 8)}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{o.customerEmail}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.artistName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{o.artistEmail}</div>
                    </td>
                    <td>
                      <span className={`admin-badge ${STATUS_COLORS[o.status] || 'gray'}`}>{o.status}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#d97706' }}>
                      {o.agreedPrice ? `₹${o.agreedPrice.toLocaleString('en-IN')}` : o.budgetMin ? `₹${o.budgetMin.toLocaleString('en-IN')}+` : '—'}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                      {o.deadline ? new Date(o.deadline).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="admin-btn ghost" style={{ padding: '5px 10px', fontSize: '0.72rem' }} onClick={() => openView(o)}>View</button>
                        <button className="admin-btn ghost" style={{ padding: '5px 10px', fontSize: '0.72rem' }} onClick={() => openStatus(o)}>Status</button>
                        <button className="admin-btn danger" style={{ padding: '5px 8px' }} onClick={() => openDelete(o)}><Trash2 size={13} /></button>
                      </div>
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
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', marginTop: 10 }}>
            {page?.totalElements || 0} total orders
          </div>
        </>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">📦 Order Detail</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['Title', selected.title], ['Status', selected.status],
                ['Customer', `${selected.customerName} (${selected.customerEmail})`],
                ['Artist', `${selected.artistName} (${selected.artistEmail})`],
                ['Budget', selected.budgetMin ? `₹${selected.budgetMin} – ₹${selected.budgetMax}` : '—'],
                ['Agreed Price', selected.agreedPrice ? `₹${selected.agreedPrice}` : '—'],
                ['Platform Fee', selected.platformFee ? `₹${selected.platformFee}` : '—'],
                ['Artist Net', selected.artistNet ? `₹${selected.artistNet}` : '—'],
                ['Deadline', selected.deadline ? new Date(selected.deadline).toLocaleDateString('en-IN') : '—'],
                ['Created', selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN') : '—'],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{v || '—'}</div>
                </div>
              ))}
            </div>
            {selected.description && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Description</div>
                <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6 }}>{selected.description}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Override Modal */}
      {modal === 'status' && selected && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">🔄 Override Order Status</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <p style={{ color: '#64748b', marginBottom: 16 }}>Current status: <strong>{selected.status}</strong></p>
            <div className="admin-field">
              <label>New Status</label>
              <select value={form.status} onChange={e => setForm((f: any) => ({...f, status: e.target.value}))}>
                {['PENDING','ACCEPTED','IN_PROGRESS','DELIVERED','COMPLETED','REJECTED'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label>Reason (required)</label>
              <textarea rows={3} value={form.reason || ''} onChange={e => setForm((f: any) => ({...f, reason: e.target.value}))} placeholder="Explain the reason for override..." />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="admin-btn ghost" onClick={closeModal}>Cancel</button>
              <button className="admin-btn primary" onClick={handleStatus} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Apply Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">🗑️ Delete Order</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <p style={{ color: '#64748b' }}>Delete order "<strong>{selected.title}</strong>"? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="admin-btn ghost" onClick={closeModal}>Cancel</button>
              <button className="admin-btn danger" onClick={handleDelete} disabled={saving} style={{ background: '#dc2626', color: '#fff' }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

