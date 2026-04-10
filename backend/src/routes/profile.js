// src/routes/profile.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Update profile (name, email)
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) return res.status(400).json({ error: 'Email already in use' });
      updates.email = email;
    }
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-passwordHash -__v');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both current and new password required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
