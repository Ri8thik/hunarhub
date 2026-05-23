import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Trash2, X, Star } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminGetReviews, adminDeleteReview, type AdminReview, type PageResponse } from '@/services/adminApiService';

export default function AdminReviewsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState<PageResponse<AdminReview> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminReview | null>(null);
  const [reason, setReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { if (!sessionStorage.getItem('adminToken')) navigate('/admin'); }, []);

  const load = async (p = 0) => {
    setLoading(true);
    try { setPage(await adminGetReviews(p, 20)); setCurrentPage(p); }
    catch (e: any) { showToast('Error: ' + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const openDelete = (r: AdminReview) => { setSelected(r); setReason(''); setShowModal(true); };
  const closeModal = () => { setSelected(null); setShowModal(false); setReason(''); };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminDeleteReview(selected.id, reason);
      showToast('Review deleted & artist rating recalculated');
      closeModal(); load();
    } catch (e: any) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const renderStars = (n: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={12} style={{ fill: i < n ? '#f59e0b' : 'transparent', color: i < n ? '#f59e0b' : '#d1d5db' }} />
  ));

  const filtered = (page?.content || []).filter(r =>
    !search || r.reviewerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.artistName?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 12, zIndex: 9999, fontWeight: 600, fontSize: '0.84rem' }}>
          {toast}
        </div>
      )}

      <div className="admin-toolbar">
        <input className="admin-search" placeholder="🔍 Search reviews..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="admin-loading"><Loader2 size={22} className="animate-spin" style={{ color: '#d97706' }} /> Loading reviews...</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Artist</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No reviews found</td></tr>
                ) : filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.reviewerName || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{r.reviewerEmail}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.artistName || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>{renderStars(r.rating)}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b' }}>{r.rating}/5</div>
                    </td>
                    <td>
                      <div style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#475569', fontSize: '0.84rem' }}>
                        {r.comment || <em style={{ color: '#94a3b8' }}>No comment</em>}
                      </div>
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                      {r.orderId ? `#${r.orderId.substring(0, 8)}` : '—'}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <button className="admin-btn danger" style={{ padding: '6px 10px' }} onClick={() => openDelete(r)}><Trash2 size={14} /></button>
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
            {page?.totalElements || 0} total reviews
          </div>
        </>
      )}

      {showModal && selected && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">🗑️ Delete Review</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <p style={{ color: '#64748b', marginBottom: 16 }}>
              Delete review by <strong>{selected.reviewerName}</strong> on <strong>{selected.artistName}</strong>?
              Artist's rating will be recalculated automatically.
            </p>
            <div className="admin-field">
              <label>Reason</label>
              <select value={reason} onChange={e => setReason(e.target.value)}>
                <option value="">Select reason...</option>
                <option value="Spam">Spam</option>
                <option value="Inappropriate content">Inappropriate content</option>
                <option value="Fake review">Fake review</option>
                <option value="Violation of policy">Violation of policy</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="admin-btn ghost" onClick={closeModal}>Cancel</button>
              <button className="admin-btn danger" onClick={handleDelete} disabled={saving} style={{ background: '#dc2626', color: '#fff' }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

