import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function CreateStudent() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [classId, setClassId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/classes');
        if (mounted) setClasses(res.data || []);
      } catch (e) {
        console.warn('Failed to load classes', e);
      } finally {
        if (mounted) setClassesLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name || !registerNumber) { setError('Name and register number are required'); return; }
    if (!classId) { setError('Please select a class'); return; }
    setLoading(true);
    try {
      const payload = { name, registerNumber, classId };
      if (rollNumber) payload.rollNumber = Number(rollNumber);
      if (gender) payload.gender = gender;
      if (dob) payload.dob = dob;
      await api.post('/students', payload);
      nav('/students');
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <h1>Add Student</h1>
          <p>Create a new student record</p>
        </div>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Asha Kumari" required />
            </div>
            <div className="input-group">
              <label className="input-label">Register Number *</label>
              <input value={registerNumber} onChange={e => setRegisterNumber(e.target.value)} className="input" placeholder="22MDC001" required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Class *</label>
            <select value={classId} onChange={e => setClassId(e.target.value)} className="input select" required>
              <option value="">Select a class</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}{c.section ? ` — ${c.section}` : ''}</option>
              ))}
            </select>
            {classesLoading && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Loading classes…</div>}
            {!classesLoading && classes.length === 0 && (
              <div className="alert alert-warning" style={{ marginTop: 8 }}>
                No classes available. Create a class first.
              </div>
            )}
          </div>

          <div className="grid-3">
            <div className="input-group">
              <label className="input-label">Roll Number</label>
              <input type="number" value={rollNumber} onChange={e => setRollNumber(e.target.value)} className="input" placeholder="1" />
            </div>
            <div className="input-group">
              <label className="input-label">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="input select">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Date of Birth</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="input" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => nav('/students')} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading || classes.length === 0} className="btn btn-primary">
              {loading ? 'Saving…' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
