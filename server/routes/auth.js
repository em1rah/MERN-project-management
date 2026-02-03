const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendResetCodeEmail } = require('../utils/sendResetEmail');

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { fullName, school, role, roleOther, coursesInterested, coursesOther, interestedInCertification, email, password } = req.body;

    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) return res.status(400).json({ msg: 'This email is already registered.' });

    const existingByFullName = await User.findOne({ fullName: (fullName || '').trim() });
    if (existingByFullName) return res.status(400).json({ msg: 'This full name is already registered.' });

    const user = new User({ fullName: (fullName || '').trim(), school, role, roleOther, coursesInterested, coursesOther, interestedInCertification, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    if (err.code === 11000) {
      const field = err.message.includes('fullName') ? 'full name' : 'email';
      return res.status(400).json({ msg: `This ${field} is already registered.` });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Forgot password: send 6-digit code to email
const CODE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
function generateResetCode() {
  return crypto.randomInt(100000, 999999).toString();
}

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ msg: 'Email is required.' });
    }
    const normalizedEmail = email.trim();
    const user = await User.findOne({ email: normalizedEmail });
    const code = generateResetCode();
    if (user) {
      user.resetPasswordCode = code;
      user.resetPasswordExpires = new Date(Date.now() + CODE_EXPIRY_MS);
      await user.save();
      const result = await sendResetCodeEmail(user.email, code);
      if (!result.sent && result.error) {
        console.error('Reset email failed:', result.error);
        return res.status(500).json({ msg: 'Failed to send reset email. Try again later.' });
      }
    }
    // Always return success to avoid leaking whether email exists
    res.json({ msg: 'If an account exists for this email, you will receive a reset code shortly.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reset password: verify code and set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ msg: 'Email, code, and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters.' });
    }
    const normalizedEmail = email.trim();
    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordCode: String(code).trim(),
    });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset code.' });
    }
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      user.resetPasswordCode = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(400).json({ msg: 'Reset code has expired. Request a new one.' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ msg: 'Password has been reset. You can sign in with your new password.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get current user
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Logout
router.post('/logout', auth, (req, res) => {
  res.json({ msg: 'Logged out successfully' });
});

module.exports = router;
