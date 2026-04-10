import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../api/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/marks/analytics/overview');
        setData(res.data);
      } catch (e) {
        console.error('Analytics fetch failed:', e);
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Prepare chart data
  const examTrend = (data?.examTrend || []).map((t, i) => ({
    name: t.exam || `Exam ${i + 1}`,
    avg: Math.round(t.avgPct || 0)
  }));

  const classComparison = (data?.classComparison || []).map(c => ({
    name: c.name + (c.section ? ` ${c.section}` : ''),
    avg: Math.round(c.avgPct || 0)
  }));

  const stats = [
    {
      label: 'Total Students', value: data?.totalStudents ?? 0,
      color: '#6366f1', bg: 'rgba(99,102,241,0.08)',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    {
      label: 'Total Classes', value: data?.totalClasses ?? 0,
      color: '#06b6d4', bg: 'rgba(6,182,212,0.08)',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
    },
    {
      label: 'Avg. Score', value: data?.avgPercentage ? `${data.avgPercentage}%` : '—',
      color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    },
    {
      label: 'Pass Rate', value: data?.passRate ? `${data.passRate}%` : '—',
      color: '#10b981', bg: 'rgba(16,185,129,0.08)',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Quick summary of student performance and class trends.</p>
        </div>
        <div className="page-actions">
          <Link to="/students" className="btn btn-primary btn-sm">Students</Link>
          <Link to="/classes" className="btn btn-secondary btn-sm">Classes</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div className="stat-card-value">{loading ? '—' : s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2 mb-6">
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Score Trend</h3>
          <div className="chart-wrap">
            {examTrend.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={examTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
                  />
                  <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <p>No exam data yet. Add marks to see trends.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Class Comparison</h3>
          <div className="chart-wrap">
            {classComparison.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={classComparison} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--text-muted)" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} />
                  <Bar dataKey="avg" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <p>No class data yet. Create classes and add marks.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid-3">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <h4 style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>Top Performers</h4>
          </div>
          {(data?.topPerformers || []).length === 0 ? (
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.topPerformers.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{s.name || 'Student'}</span>
                  <span className="badge badge-success">{Math.round(s.avgPct)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h4 style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>Exams Recorded</h4>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            {loading ? '—' : data?.totalMarks ?? 0}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            mark entries across all students
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h4 style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>Attention Needed</h4>
          </div>
          {(data?.attentionNeeded || []).length === 0 ? (
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>All students performing well</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.attentionNeeded.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{s.name || 'Student'}</span>
                  <span className="badge badge-danger">{Math.round(s.avgPct)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
