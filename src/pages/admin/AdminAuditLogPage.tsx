import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminGetAuditLog, type AuditLog, type PageResponse } from '@/services/adminApiService';

const actionColor = (a: string): string => {
  if (a.startsWith('DELETE')) return 'red';
  if (a.startsWith('APPROVE') || a.startsWith('CREATE')) return 'green';
  if (a.startsWith('REJECT')) return 'yellow';
  if (a.startsWith('BROADCAST')) return 'blue';
  return 'gray';
};

export default function AdminAuditLogPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState<PageResponse<AuditLog> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { if (!sessionStorage.getItem('adminToken')) navigate('/admin'); }, []);

  const load = async (p = 0) => {
    setLoading(true);
    try { setPage(await adminGetAuditLog(p, 50)); setCurrentPage(p); }
    catch { /* silently ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = (page?.content || []).filter(l =>
    !search || l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.adminName?.toLowerCase().includes(search.toLowerCase()) ||
    l.targetType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="admin-toolbar">
        <input className="admin-search" placeholder="🔍 Search audit log..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="admin-btn ghost" onClick={() => load()}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="admin-loading"><Loader2 size={22} className="animate-spin" style={{ color: '#d97706' }} /> Loading audit log...</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No audit entries</td></tr>
                ) : filtered.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{l.adminName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{l.adminEmail}</div>
                    </td>
                    <td><span className={`admin-badge ${actionColor(l.action)}`}>{l.action}</span></td>
                    <td>
                      <span className="admin-badge gray">{l.targetType}</span>
                      {l.targetId && <div style={{ fontSize: '0.67rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>{l.targetId.substring(0, 12)}...</div>}
                    </td>
                    <td style={{ color: '#475569', fontSize: '0.82rem', maxWidth: 300 }}>{l.details || '—'}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {l.createdAt ? new Date(l.createdAt).toLocaleString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {page && page.totalPages > 1 && (
            <div className="admin-pagination">
              <button className="admin-page-btn" onClick={() => load(currentPage - 1)} disabled={currentPage === 0}>‹ Prev</button>
              {Array.from({ length: Math.min(page.totalPages, 5) }, (_, i) => (
                <button key={i} className={`admin-page-btn ${i === currentPage ? 'active' : ''}`} onClick={() => load(i)}>{i + 1}</button>
              ))}
              <button className="admin-page-btn" onClick={() => load(currentPage + 1)} disabled={currentPage >= page.totalPages - 1}>Next ›</button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

