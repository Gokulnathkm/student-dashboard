import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function ClassDetail() {
  const { id } = useParams();
  const [klass, setKlass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [classRes, trendRes] = await Promise.all([
          api.get(`/classes/${id}`),
          api.get(`/marks/analytics/class/${id}/trends`).catch(() => ({ data: [] }))
        ]);
        if (!mounted) return;
        setKlass(classRes.data || null);
        setTrends((trendRes.data || []).map(t => ({
          name: t._id?.examName || 'Exam',
          avg: Math.round(t.avgPercent || 0),
          min: Math.round(t.minPercent || 0),
          max: Math.round(t.maxPercent || 0)
        })));
      } catch (e) {
        console.error(e);
        setKlass(null);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: 300 }}>
      <div className="spinner" />
    </div>
  );
  if (!klass) return (
    <div className="empty-state">
      <h3>Class not found</h3>
      <Link to="/classes" className="btn btn-secondary btn-sm">← Back</Link>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>{klass.name}</h1>
          <p>Section {klass.section} • {klass.year || ''} • {klass.studentCount ?? (klass.students || []).length} students</p>
        </div>
        <div className="page-actions">
          <Link to="/classes" className="btn btn-secondary btn-sm">← Back</Link>
        </div>
      </div>

      <div className="grid-2 mb-6">
        {/* Subjects */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Subjects</h3>
          {(!klass.subjects || klass.subjects.length === 0) ? (
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No subjects defined</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {klass.subjects.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-secondary)', border: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name || s.code}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.code || ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trend Chart */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Performance Trend</h3>
          {trends.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No exam data yet for this class.</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} />
                  <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2} name="Average %" />
                  <Line type="monotone" dataKey="max" stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" name="Max %" />
                  <Line type="monotone" dataKey="min" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" name="Min %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Students in this class</h3>
          <Link to="/students/new" className="btn btn-ghost btn-sm">+ Add Student</Link>
        </div>
        {(!klass.students || klass.students.length === 0) ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <p>No students in this class yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {klass.students.map(s => (
              <div key={s._id || s.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-secondary)', border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(99,102,241,0.1)', color: 'var(--brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13
                  }}>
                    {(s.name || 'S')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name || s.registerNumber}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.registerNumber}</div>
                  </div>
                </div>
                <Link to={`/students/${s._id || s.id}`} className="btn btn-ghost btn-sm">Profile →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
