import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPageNew';
import CreateStudent from './pages/CreateStudent';
import StudentProfile from './pages/StudentProfile';
import CreateClass from './pages/CreateClass';
import ClassesList from './pages/ClassesList';
import ClassDetail from './pages/ClassDetail';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Sidebar';

import { verifyToken } from './api/api';

function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(s => !s)}
              aria-label="Toggle sidebar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="app-topbar-right">
            <ThemeToggle />
          </div>
        </header>
        <div className="app-content fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark(d => !d)}
      className="btn-ghost btn-icon"
      title="Toggle theme"
    >
      {dark ? '🌙' : '☀️'}
    </button>
  );
}

export default function App() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await verifyToken();
      if (!mounted) return;
      if (!u) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setChecking(false);
        const path = window.location.pathname;
        if (path === '/' || path === '/dashboard') {
          nav('/login', { replace: true });
        }
      } else {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
        setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [nav]);

  if (checking) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Verifying session…</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth pages — no sidebar */}
      <Route path="/login" element={<LoginPage onLogin={setUser} />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected pages — with sidebar layout */}
      <Route path="/" element={
        <PrivateRoute user={user}>
          <AppLayout><Dashboard /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/students" element={
        <PrivateRoute user={user}>
          <AppLayout><StudentsPage /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/students/new" element={
        <PrivateRoute user={user}>
          <AppLayout><CreateStudent /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/students/:id" element={
        <PrivateRoute user={user}>
          <AppLayout><StudentProfile /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/classes" element={
        <PrivateRoute user={user}>
          <AppLayout><ClassesList /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/classes/new" element={
        <PrivateRoute user={user}>
          <AppLayout><CreateClass /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/classes/:id" element={
        <PrivateRoute user={user}>
          <AppLayout><ClassDetail /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute user={user}>
          <AppLayout><SettingsPage user={user} setUser={setUser} /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}
