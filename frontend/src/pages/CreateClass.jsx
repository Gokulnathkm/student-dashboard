import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function CreateClass() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [section, setSection] = useState('');
  const [subjects, setSubjects] = useState([{ code: '', name: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const updateSubject = (idx, val) => {
    setSubjects(s => s.map((it, i) => i === idx ? val : it));
  };
  const addSubject = () => setSubjects(s => [...s, { code: '', name: '' }]);
  const removeSubject = (idx) => setSubjects(s => s.filter((_, i) => i !== idx));

  const validate = () => {
    if (!name.trim()) return 'Class name is required';
    if (!section.trim()) return 'Section is required';
    const hasInvalid = subjects.some(s => !s.code.trim() || !s.name.trim());
    if (hasInvalid) return 'All subjects must have code and name';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    try {
      await api.post('/classes', { name, year: Number(year), section, subjects });
      setSuccess('Class created successfully!');
      setTimeout(() => nav('/classes'), 800);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Server error');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <h1>Create Class</h1>
          <p>Define class metadata and subjects</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <form onSubmit={submit}>
          <div className="input-group">
            <label className="input-label">Class Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="22MDC-A" className="input" required />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Year</label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)} className="input" />
            </div>
            <div className="input-group">
              <label className="input-label">Section *</label>
              <input value={section} onChange={e => setSection(e.target.value)} placeholder="A" className="input" required />
            </div>
          </div>

          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" style={{ margin: 0 }}>Subjects</label>
            <button type="button" onClick={addSubject} className="btn btn-ghost btn-sm">+ Add Subject</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {subjects.map((s, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8,
                padding: 12, borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-secondary)', border: '1px solid var(--border)'
              }}>
                <input
                  placeholder="22MDC31"
                  value={s.code}
                  onChange={e => updateSubject(i, { ...s, code: e.target.value })}
                  className="input"
                />
                <input
                  placeholder="Subject name (e.g. DBMS)"
                  value={s.name}
                  onChange={e => updateSubject(i, { ...s, name: e.target.value })}
                  className="input"
                />
                {subjects.length > 1 && (
                  <button type="button" onClick={() => removeSubject(i)} className="btn btn-danger btn-sm btn-icon">✕</button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={() => {
              setName(''); setSection(''); setSubjects([{ code: '', name: '' }]);
            }} className="btn btn-secondary">Reset</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating…' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
