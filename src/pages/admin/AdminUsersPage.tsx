import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Pencil, Trash2, X, UserX, Check } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser, adminUpdateUserStatus,
  type AdminUser, type PageResponse
} from '@/services/adminApiService';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState<PageResponse<AdminUser> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'status' | 'delete' | null>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { if (!sessionStorage.getItem('adminToken')) navigate('/admin'); }, []);

  const load = async (p = 0) => {
    setLoading(true);
    try { setPage(await adminGetUsers(p, 20)); setCurrentPage(p); }
    catch (e: any) { showToast('Error: ' + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => { setForm({ roles: ['CUSTOMER'] }); setSelected(null); setModal('create'); };
  const openEdit = (u: AdminUser) => { setSelected(u); setForm({ ...u }); setModal('edit'); };
  const openStatus = (u: AdminUser) => { setSelected(u); setForm({ status: u.status, suspendDays: 7, reason: '' }); setModal('status'); };
  const openDelete = (u: AdminUser) => { setSelected(u); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setForm({}); };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await adminCreateUser(form);
      showToast('User created successfully');
      closeModal(); load();
    } catch (e: any) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminUpdateUser(selected.id, form);
      showToast('User updated');
      closeModal(); load();
    } catch (e: any) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminUpdateUserStatus(selected.id, form.status, form.suspendDays, form.reason);
      showToast('Status updated');
      closeModal(); load();
    } catch (e: any) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminDeleteUser(selected.id);
      showToast('User deleted');
      closeModal(); load();
    } catch (e: any) { showToast('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const statusBadge = (s: string) => {
    const cls = s === 'ACTIVE' ? 'green' : s === 'SUSPENDED' ? 'yellow' : 'red';
    return <span className={`admin-badge ${cls}`}>{s}</span>;
  };

  const roleBadge = (roles: string[]) => {
    const r = roles.map(r => r === 'ADMIN' ? 'red' : r === 'ARTIST' ? 'purple' : 'blue').map((cls, i) => (
      <span key={i} className={`admin-badge ${cls}`} style={{ marginRight: 3 }}>{roles[i]}</span>
    ));
    return <>{r}</>;
  };

  const filtered = (page?.content || []).filter(u =>
    !search || u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 12, zIndex: 9999, fontWeight: 600, fontSize: '0.84rem' }}>
          {toast}
        </div>
      )}

      <div className="admin-toolbar">
        <input className="admin-search" placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="admin-btn primary" onClick={openCreate}><Plus size={16} /> Add User</button>
      </div>

      {loading ? (
        <div className="admin-loading"><Loader2 size={22} className="animate-spin" style={{ color: '#d97706' }} /> Loading users...</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Orders</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No users found</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#d97706,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>
                          {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{u.displayName || '—'}</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b' }}>{u.email}</td>
                    <td>{roleBadge(u.roles || [])}</td>
                    <td>{statusBadge(u.status || 'ACTIVE')}</td>
                    <td style={{ color: '#64748b' }}>{[u.locationCity, u.locationState].filter(Boolean).join(', ') || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{u.orderCount || 0}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="admin-btn ghost" style={{ padding: '6px 10px' }} onClick={() => openEdit(u)} title="Edit"><Pencil size={14} /></button>
                        <button className="admin-btn ghost" style={{ padding: '6px 10px' }} onClick={() => openStatus(u)} title="Status"><UserX size={14} /></button>
                        <button className="admin-btn danger" style={{ padding: '6px 10px' }} onClick={() => openDelete(u)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
            {page?.totalElements || 0} total users
          </div>
        </>
      )}

      {/* Create Modal */}
      {modal === 'create' && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">➕ Create User</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <div className="admin-field"><label>Display Name</label><input value={form.displayName || ''} onChange={e => setForm((f: any) => ({...f, displayName: e.target.value}))} placeholder="Full name" /></div>
            <div className="admin-field"><label>Email</label><input type="email" value={form.email || ''} onChange={e => setForm((f: any) => ({...f, email: e.target.value}))} placeholder="user@example.com" /></div>
            <div className="admin-field"><label>Password</label><input type="password" value={form.password || ''} onChange={e => setForm((f: any) => ({...f, password: e.target.value}))} placeholder="Password" /></div>
            <div className="admin-field">
              <label>Role</label>
              <select value={(form.roles || ['CUSTOMER'])[0]} onChange={e => setForm((f: any) => ({...f, roles: [e.target.value]}))}>
                <option value="CUSTOMER">Customer</option>
                <option value="ARTIST">Artist</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="admin-btn ghost" onClick={closeModal}>Cancel</button>
              <button className="admin-btn primary" onClick={handleCreate} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && selected && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">✏️ Edit User: {selected.displayName}</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <div className="admin-field"><label>Display Name</label><input value={form.displayName || ''} onChange={e => setForm((f: any) => ({...f, displayName: e.target.value}))} /></div>
            <div className="admin-field"><label>Email</label><input type="email" value={form.email || ''} onChange={e => setForm((f: any) => ({...f, email: e.target.value}))} /></div>
            <div className="admin-field"><label>Phone</label><input value={form.phone || ''} onChange={e => setForm((f: any) => ({...f, phone: e.target.value}))} /></div>
            <div className="admin-field"><label>City</label><input value={form.locationCity || ''} onChange={e => setForm((f: any) => ({...f, locationCity: e.target.value}))} /></div>
            <div className="admin-field"><label>State</label><input value={form.locationState || ''} onChange={e => setForm((f: any) => ({...f, locationState: e.target.value}))} /></div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="admin-btn ghost" onClick={closeModal}>Cancel</button>
              <button className="admin-btn primary" onClick={handleEdit} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {modal === 'status' && selected && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">🛑 Change Status: {selected.displayName}</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <div className="admin-field">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm((f: any) => ({...f, status: e.target.value}))}>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>
            {form.status === 'SUSPENDED' && (
              <div className="admin-field"><label>Suspend for (days)</label><input type="number" value={form.suspendDays || 7} onChange={e => setForm((f: any) => ({...f, suspendDays: parseInt(e.target.value)}))} min={1} /></div>
            )}
            <div className="admin-field"><label>Reason</label><textarea rows={3} value={form.reason || ''} onChange={e => setForm((f: any) => ({...f, reason: e.target.value}))} placeholder="Reason for status change..." /></div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="admin-btn ghost" onClick={closeModal}>Cancel</button>
              <button className="admin-btn primary" onClick={handleStatus} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Apply
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
              <span className="admin-modal-title">🗑️ Delete User</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#94a3b8" /></button>
            </div>
            <p style={{ color: '#64748b', marginBottom: 20 }}>
              Are you sure you want to delete <strong>{selected.displayName}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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

