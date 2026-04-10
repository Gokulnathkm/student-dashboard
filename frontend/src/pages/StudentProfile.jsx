import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add mark form
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [subjects, setSubjects] = useState([{ subject: '', score: '', maxMarks: '100' }]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [sRes, mRes] = await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/marks/student/${id}`).catch(() => ({ data: [] }))
        ]);
        if (!mounted) return;
        setStudent(sRes.data || null);
        setMarks(mRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleAddSubjectRow = () => {
    setSubjects([...subjects, { subject: '', score: '', maxMarks: '100' }]);
  };
  const handleRemoveSubjectRow = (i) => {
    setSubjects(subjects.filter((_, idx) => idx !== i));
  };
  const handleSubjectChange = (i, field, value) => {
    setSubjects(subjects.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const handleAddMark = async (e) => {
    e.preventDefault();
    const validSubjects = subjects.filter(s => s.subject && s.score);
    if (validSubjects.length === 0) return alert('Add at least one subject with score');
    setAdding(true);
    try {
      const payload = {
        studentId: id,
        classId: student?.classId || null,
        exam: { name: examName || 'Exam', date: examDate || new Date().toISOString() },
        subjects: validSubjects.map(s => ({
          subject: s.subject,
          score: Number(s.score),
          maxMarks: Number(s.maxMarks) || 100
        }))
      };
      await api.post('/marks', payload);
      const res = await api.get(`/marks/student/${id}`);
      setMarks(res.data || []);
      setExamName(''); setExamDate('');
      setSubjects([{ subject: '', score: '', maxMarks: '100' }]);
    } catch (err) {
      console.error(err);
      alert('Failed to add mark');
    } finally { setAdding(false); }
  };

  const handleDeleteMark = async (markId) => {
    if (!confirm('Delete this mark entry?')) return;
    try {
      await api.delete(`/marks/${markId}`);
      setMarks(prev => prev.filter(m => m._id !== markId));
    } catch (e) {
      alert('Failed to delete');
    }
  };

  // Flatten marks for chart
  const chartData = marks.flatMap(m =>
    (m.subjects || []).map(s => ({
      name: s.subject || s.name || 'Subject',
      score: s.score ?? s.marksObtained ?? 0
    }))
  );

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: 300 }}>
      <div className="spinner" />
    </div>
  );
  if (!student) return (
    <div className="empty-state">
      <h3>Student not found</h3>
      <Link to="/students" className="btn btn-secondary btn-sm">← Back</Link>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>{student.name}</h1>
          <p>Reg: {student.registerNumber || '—'}</p>
        </div>
        <div className="page-actions">
          <Link to="/students" className="btn btn-secondary btn-sm">← Back</Link>
        </div>
      </div>

      {/* Info & Chart */}
      <div className="grid-2 mb-6">
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Student Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Name</span>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{student.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Register No.</span>
              <span className="badge badge-brand">{student.registerNumber || '—'}</span>
            </div>
            {student.gender && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Gender</span>
                <span style={{ fontSize: 14 }}>{student.gender}</span>
              </div>
            )}
            {student.dob && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>DOB</span>
                <span style={{ fontSize: 14 }}>{new Date(student.dob).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Marks Overview</h3>
          {chartData.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No marks recorded yet</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Marks Table */}
      {marks.length > 0 && (
        <div className="card mb-6" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Mark Records</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Max</th>
                <th>%</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {marks.map(m =>
                (m.subjects || []).map((s, si) => (
                  <tr key={`${m._id}-${si}`}>
                    {si === 0 && (
                      <td rowSpan={m.subjects.length} style={{ fontWeight: 500 }}>
                        {m.exam?.name || 'Exam'}
                      </td>
                    )}
                    <td>{s.subject || s.name || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{s.score ?? s.marksObtained ?? 0}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.maxMarks || 100}</td>
                    <td>
                      <span className={`badge ${((s.score ?? s.marksObtained ?? 0) / (s.maxMarks || 100) * 100) >= 40 ? 'badge-success' : 'badge-danger'}`}>
                        {Math.round((s.score ?? s.marksObtained ?? 0) / (s.maxMarks || 100) * 100)}%
                      </span>
                    </td>
                    {si === 0 && (
                      <td rowSpan={m.subjects.length} style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDeleteMark(m._id)} className="btn btn-danger btn-sm">Delete</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Mark Form */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Add Mark</h3>
        <form onSubmit={handleAddMark}>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div className="input-group">
              <label className="input-label">Exam Name</label>
              <input value={examName} onChange={e => setExamName(e.target.value)} placeholder="Mid-term Exam" className="input" />
            </div>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="input" />
            </div>
          </div>

          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" style={{ margin: 0 }}>Subjects</label>
            <button type="button" onClick={handleAddSubjectRow} className="btn btn-ghost btn-sm">+ Add Subject</button>
          </div>

          {subjects.map((s, i) => (
            <div key={i} className="grid-3" style={{ marginBottom: 8, gridTemplateColumns: '2fr 1fr 1fr auto' }}>
              <input
                placeholder="Subject name"
                value={s.subject}
                onChange={e => handleSubjectChange(i, 'subject', e.target.value)}
                className="input"
              />
              <input
                placeholder="Score"
                type="number"
                value={s.score}
                onChange={e => handleSubjectChange(i, 'score', e.target.value)}
                className="input"
              />
              <input
                placeholder="Max"
                type="number"
                value={s.maxMarks}
                onChange={e => handleSubjectChange(i, 'maxMarks', e.target.value)}
                className="input"
              />
              {subjects.length > 1 && (
                <button type="button" onClick={() => handleRemoveSubjectRow(i)} className="btn btn-danger btn-sm btn-icon">✕</button>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="submit" disabled={adding} className="btn btn-primary btn-sm">
              {adding ? 'Adding…' : 'Add Mark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
