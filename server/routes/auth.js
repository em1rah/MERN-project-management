const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
