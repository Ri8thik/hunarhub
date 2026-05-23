import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, X, Star } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminGetArtists, adminApproveArtist, adminFeatureArtist, type AdminArtist, type PageResponse } from '@/services/adminApiService';

export default function AdminArtistsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState<PageResponse<AdminArtist> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'approve' | 'feature' | null>(null);
  const [selected, setSelected] = useState<AdminArtist | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { if (!sessionStorage.getItem('adminToken')) navigate('/admin'); }, []);

  const load = async (p = 0) => {
    setLoading(true);
    try { setPage(await adminGetArtists(p, 20)); setCurrentPage(p); }
    catch (e: any) { showToast('Error: ' + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const openApprove = (a: AdminArtist) => { setSelected(a); setForm({ approved: true, reason: '' }); setModal('approve'); };
  const openFeature = (a: AdminArtist) => { setSelected(a); setForm({ featured: !a.featured, rank: a.featuredRank || 1 }); setModal('feature'); };
  const closeModal = () => { setModal(null); setSelected(null); setForm({}); };

  const handleApprove = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApproveArtist(selected.id, form.approved, form.reason);
      showToast(form.approved ? 'Artist approved ✅' : 'Artist rejected');
      closeModal(); load();
    } catch (e: any) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleFeature = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminFeatureArtist(selected.id, form.featured, form.rank);
      showToast(form.featured ? 'Artist featured ⭐' : 'Featured status removed');
      closeModal(); load();
    } catch (e: any) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const approvalBadge = (s: string) => {
    const cls = s === 'APPROVED' ? 'green' : s === 'PENDING' ? 'yellow' : 'red';
    return <span className={`admin-badge ${cls}`}>{s}</span>;
  };

  const filtered = (page?.content || []).filter(a =>
    !search || a.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 12, zIndex: 9999, fontWeight: 600, fontSize: '0.84rem' }}>
          {toast}
        </div>
      )}

      <div className="admin-toolbar">
        <input className="admin-search" placeholder="🔍 Search artists..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="admin-loading"><Loader2 size={22} className="animate-spin" style={{ color: '#d97706' }} /> Loading artists...</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Artist</th>
                  <th>Categories</th>
                  <th>Rating</th>
                  <th>Starting Price</th>
                  <th>Orders</th>
                  <th>Approval</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No artists found</td></tr>
                ) : filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{a.displayName || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{a.email}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(a.categories || []).slice(0, 2).map(c => (
                          <span key={c} className="admin-badge gray">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                        <span style={{ fontWeight: 700 }}>{(a.ratingAvg || 0).toFixed(1)}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({a.ratingCount || 0})</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#d97706' }}>
                      {a.startingPrice ? `₹${a.startingPrice.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ fontWeight: 700 }}>{a.orderCount || 0}</td>
                    <td>{approvalBadge(a.approvalStatus || 'APPROVED')}</td>
                    <td>
                      {a.featured ? <span className="admin-badge yellow">⭐ Featured #{a.featuredRank}</span> : <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="admin-btn success" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => openApprove(a)}>
                          Approve/Reject
                        </button>
                        <button className="admin-btn ghost" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => openFeature(a)}>
                          <Star size={12} /> Feature
                        </button>
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
            {page?.totalElements || 0} total artists
          </div>
        </>
      )}

      {/* Approve Modal */}
      {modal === 'approve' && selected && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">🎨 Approve / Reject Artist</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <p style={{ color: '#64748b', marginBottom: 16 }}>
              Artist: <strong>{selected.displayName}</strong>
            </p>
            <div className="admin-field">
              <label>Decision</label>
              <select value={form.approved ? 'true' : 'false'} onChange={e => setForm((f: any) => ({...f, approved: e.target.value === 'true'}))}>
                <option value="true">✅ Approve</option>
                <option value="false">❌ Reject</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Reason {!form.approved && '(required for rejection)'}</label>
              <textarea rows={3} value={form.reason || ''} onChange={e => setForm((f: any) => ({...f, reason: e.target.value}))} placeholder="Reason..." />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="admin-btn ghost" onClick={closeModal}>Cancel</button>
              <button className={`admin-btn ${form.approved ? 'success' : 'danger'}`} onClick={handleApprove} disabled={saving} style={form.approved ? {} : {background: '#dc2626', color: '#fff'}}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : form.approved ? <Check size={14} /> : <X size={14} />}
                {form.approved ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Modal */}
      {modal === 'feature' && selected && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">⭐ Feature Settings: {selected.displayName}</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <div className="admin-field">
              <label>Featured Status</label>
              <select value={form.featured ? 'true' : 'false'} onChange={e => setForm((f: any) => ({...f, featured: e.target.value === 'true'}))}>
                <option value="true">⭐ Featured</option>
                <option value="false">Not Featured</option>
              </select>
            </div>
            {form.featured && (
              <div className="admin-field"><label>Priority Rank (1 = highest)</label><input type="number" min={1} value={form.rank || 1} onChange={e => setForm((f: any) => ({...f, rank: parseInt(e.target.value)}))} /></div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="admin-btn ghost" onClick={closeModal}>Cancel</button>
              <button className="admin-btn primary" onClick={handleFeature} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

