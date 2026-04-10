import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  const validateEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  const emailValid = validateEmail(email);
  const passwordValid = password.length >= 6;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!emailValid) throw new Error('Please enter a valid email');
      if (!passwordValid) throw new Error('Password must be at least 6 characters');
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (onLogin) onLogin(user);
      nav('/');
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-hero">
          <h1>StudentDash</h1>
          <p>
            Visualize student progress, compare classes and discover learning
            insights with modern analytics.
          </p>
          <div className="auth-hero-badge">
            <span className="auth-hero-dot" />
            Live analytics
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={submit}
          className="auth-form-card"
        >
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to continue to Student Dashboard</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              placeholder="you@school.edu"
              className={`input ${email && !emailValid ? 'input-error' : ''}`}
            />
            {email && !emailValid && (
              <div className="input-error-msg">Please enter a valid email address.</div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className={`input ${password && !passwordValid ? 'input-error' : ''}`}
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="password-toggle"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {password && !passwordValid && (
              <div className="input-error-msg">Password must be at least 6 characters.</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !emailValid || !passwordValid}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
