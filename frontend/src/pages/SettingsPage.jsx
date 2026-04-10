import React, { useState } from 'react';
import api from '../api/api';

export default function SettingsPage({ user, setUser }) {
  // Profile
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    try {
      const res = await api.put('/auth/profile', { name, email });
      const updatedUser = res.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileMsg(err?.response?.data?.error || 'Update failed');
    } finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassMsg('');
    if (newPassword.length < 6) { setPassError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPassError('Passwords do not match'); return; }
    setPassLoading(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPassMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err?.response?.data?.error || 'Password change failed');
    } finally { setPassLoading(false); }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile */}
      <div className="card mb-6">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          Profile
        </h3>
        {profileMsg && (
          <div className={`alert ${profileMsg.includes('failed') ? 'alert-error' : 'alert-success'}`}>{profileMsg}</div>
        )}
        <form onSubmit={handleProfileUpdate}>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input" />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="input" />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Role</label>
            <input value={user?.role || 'admin'} disabled className="input" style={{ background: 'var(--surface-secondary)', color: 'var(--text-muted)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={profileLoading} className="btn btn-primary btn-sm">
              {profileLoading ? 'Saving…' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Change Password
        </h3>
        {passError && <div className="alert alert-error">{passError}</div>}
        {passMsg && <div className="alert alert-success">{passMsg}</div>}
        <form onSubmit={handlePasswordChange}>
          <div className="input-group">
            <label className="input-label">Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input" required />
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input" required />
            </div>
            <div className="input-group">
              <label className="input-label">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input" required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={passLoading} className="btn btn-primary btn-sm">
              {passLoading ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
