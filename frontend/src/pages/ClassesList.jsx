import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';

export default function ClassesList() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/classes')
      .then(r => setList(r.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = list.filter(c =>
    (c.name || '').toLowerCase().includes(q.toLowerCase()) ||
    (c.section || '').toLowerCase().includes(q.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm('Delete this class? Students will not be deleted.')) return;
    try {
      await api.delete(`/classes/${id}`);
      setList(prev => prev.filter(c => c._id !== id));
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Classes</h1>
          <p>Manage class groups and subjects</p>
        </div>
        <div className="page-actions">
          <Link to="/classes/new" className="btn btn-primary btn-sm">+ Create Class</Link>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search classes…"
          className="input"
          style={{ maxWidth: 360 }}
        />
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: 200 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <h3>No classes yet</h3>
          <p>Create your first class to get started.</p>
          <Link to="/classes/new" className="btn btn-primary btn-sm">+ Create Class</Link>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(c => (
            <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>
                    {c.name}
                    {c.section && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>— {c.section}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    {(c.subjects || []).map(s => s.name || s.code).join(', ') || 'No subjects'}
                  </div>
                </div>
                <span className="badge badge-brand">{c.year}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.studentCount ?? (c.students || []).length} students</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link to={`/classes/${c._id}`} className="btn btn-ghost btn-sm">View</Link>
                  <button onClick={() => handleDelete(c._id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
