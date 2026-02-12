const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const {
      fullName,
      school,
      coursesInterested,
      coursesOther,
      interestedInCertification,
      trainingAttended,
      mobileNumber,
      gradeTeach,
      yearsExperience,
      email,
      password
    } = req.body;

    // Basic server-side validations
    const name = (fullName || '').trim();
    if (!name) return res.status(400).json({ msg: 'Full name is required.' });
    if (name.length > 100) return res.status(400).json({ msg: 'Full name must be 100 characters or fewer.' });
    if (!/^[A-Za-z\s]+$/.test(name)) return res.status(400).json({ msg: 'Full name may only contain letters and spaces.' });

    const schoolName = (school || '').trim();
    if (!schoolName) return res.status(400).json({ msg: 'School / Institution is required.' });
    if (schoolName.length > 100) return res.status(400).json({ msg: 'School / Institution must be 100 characters or fewer.' });

    const emailNorm = (email || '').trim().toLowerCase();
    if (!emailNorm || !/^\S+@\S+\.\S+$/.test(emailNorm)) return res.status(400).json({ msg: 'A valid email address is required.' });

    if (!password) return res.status(400).json({ msg: 'Password is required.' });
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) return res.status(400).json({ msg: 'Password must be between 8 and 128 characters.' });
    // Require password complexity: lower, upper, digit, special
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password)) {
      return res.status(400).json({ msg: 'Password must include upper and lower case letters, a number, and a symbol.' });
    }

    if (coursesInterested && (!Array.isArray(coursesInterested) || coursesInterested.length > 10)) {
      return res.status(400).json({ msg: 'Invalid coursesInterested value.' });
    }
    if (coursesOther && (!Array.isArray(coursesOther) || coursesOther.length > 10)) {
      return res.status(400).json({ msg: 'Invalid coursesOther value.' });
    }

    const normalizeList = (arr) =>
      (Array.isArray(arr) ? arr : [])
        .map((s) => String(s ?? '').trim().replace(/\s+/g, ' '))
        .filter(Boolean);

    const normalizedInterested = normalizeList(coursesInterested);
    const normalizedOther = normalizeList(coursesOther);

    const existingByEmail = await User.findOne({ email: emailNorm });
    if (existingByEmail) return res.status(400).json({ msg: 'This email is already registered.' });

    const existingByFullName = await User.findOne({ fullName: name });
    if (existingByFullName) return res.status(400).json({ msg: 'This full name is already registered.' });

    const user = new User({
      fullName: name,
      school: schoolName,
      coursesInterested: normalizedInterested,
      coursesOther: normalizedOther,
      interestedInCertification,
      trainingAttended: trainingAttended === true,
      mobileNumber: mobileNumber ? String(mobileNumber).trim() : '',
      gradeTeach: gradeTeach ? String(gradeTeach).trim() : '',
      yearsExperience: Number.isFinite(Number(yearsExperience)) ? Number(yearsExperience) : undefined,
      email: emailNorm,
      password
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    if (err.code === 11000) {
      let field = 'email';
      if (err.message.includes('fullName')) field = 'full name';
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
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
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
