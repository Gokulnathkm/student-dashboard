import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  const validateEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  const emailValid = validateEmail(email);
  const nameValid = name.trim().length >= 2;

  const passwordScore = (v) => {
    let score = 0;
    if (!v) return 0;
    if (v.length >= 8) score++;
    if (/[a-z]/.test(v)) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    return Math.min(score, 4);
  };
  const pScore = passwordScore(password);
  const passwordValid = pScore >= 2;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const strengthLabel = pScore >= 3 ? 'Strong' : pScore === 2 ? 'Moderate' : 'Weak';
  const strengthColor = pScore >= 3 ? 'var(--success)' : pScore === 2 ? 'var(--warning)' : 'var(--danger)';

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!nameValid) throw new Error('Please enter your full name');
      if (!emailValid) throw new Error('Please enter a valid email');
      if (!passwordValid) throw new Error('Password is too weak');
      if (!passwordsMatch) throw new Error('Passwords do not match');
      await api.post('/auth/register', { name, email, password, role });
      nav('/login');
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ direction: 'rtl' }}>
        <div className="auth-hero" style={{ direction: 'ltr' }}>
          <h1>Join StudentDash</h1>
          <p>
            Create an account to start tracking students, importing marks and
            unlocking analytics.
          </p>
          <div className="auth-hero-badge">
            <span className="auth-hero-dot" />
            Secure & private
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={submit}
          className="auth-form-card"
          style={{ direction: 'ltr' }}
        >
          <h2>Create an account</h2>
          <p className="auth-subtitle">Start managing students and classes</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="input-group">
            <label className="input-label">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Asha Kumari"
              className={`input ${name && !nameValid ? 'input-error' : ''}`}
            />
          </div>

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
            {email && !emailValid && <div className="input-error-msg">Enter a valid email address.</div>}
          </div>

          <div className="input-group">
            <label className="input-label">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input select">
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? 'text' : 'password'}
                required
                placeholder="Choose a strong password"
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
            {password && (
              <>
                <div className="password-strength">
                  <div
                    className="password-strength-bar"
                    style={{ width: `${(pScore / 4) * 100}%`, background: strengthColor }}
                  />
                </div>
                <div style={{ fontSize: 12, color: strengthColor }}>{strengthLabel}</div>
              </>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Confirm password</label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={show ? 'text' : 'password'}
              required
              placeholder="Repeat password"
              className={`input ${confirmPassword && !passwordsMatch ? 'input-error' : ''}`}
            />
            {confirmPassword && !passwordsMatch && <div className="input-error-msg">Passwords do not match.</div>}
            {confirmPassword && passwordsMatch && <div className="input-success-msg">Passwords match ✓</div>}
          </div>

          <button
            type="submit"
            disabled={loading || !nameValid || !emailValid || !passwordValid || !passwordsMatch}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
