import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [q, setQ] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchStudents = async () => {
    try {
      const params = {};
      if (classFilter) params.classId = classFilter;
      if (q) params.q = q;
      const res = await api.get('/students', { params });
      setStudents(res.data || []);
    } catch (e) {
      console.error(e);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data || [])).catch(() => {});
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [classFilter]);

  const filtered = students.filter(s =>
    (s.name || '').toLowerCase().includes(q.toLowerCase()) ||
    (s.registerNumber || '').includes(q)
  );

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/students/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchStudents();
    } catch (err) {
      alert(err?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents(prev => prev.filter(x => x._id !== id));
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Browse and manage student records</p>
        </div>
        <div className="page-actions">
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            {uploading ? 'Uploading…' : '📄 CSV Upload'}
            <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ display: 'none' }} />
          </label>
          <Link to="/students/new" className="btn btn-primary btn-sm">+ Add Student</Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name or register number…"
          className="input"
          style={{ maxWidth: 360 }}
        />
        <select
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
          className="input select"
          style={{ maxWidth: 200 }}
        >
          <option value="">All classes</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.name}{c.section ? ` — ${c.section}` : ''}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: 200 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3>No students found</h3>
          <p>Add your first student or upload a CSV file.</p>
          <Link to="/students/new" className="btn btn-primary btn-sm">+ Add Student</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Reg. No</th>
                <th>Class</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td><span className="badge badge-brand">{s.registerNumber || '—'}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.className || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <Link to={`/students/${s._id}`} className="btn btn-ghost btn-sm">View</Link>
                      <button onClick={() => handleDelete(s._id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
