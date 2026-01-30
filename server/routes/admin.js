const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ensureAdmin = require('../middleware/ensureAdmin');
const User = require('../models/User');

// Apply auth + admin check to all admin routes
router.use(auth, ensureAdmin);

// Stats for dashboard
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ roleType: 'user' });
    const certYes = await User.countDocuments({ roleType: 'user', interestedInCertification: true });
    const certNo = await User.countDocuments({ roleType: 'user', interestedInCertification: false });
    // counts per course (simple aggregation)
    const coursesAgg = await User.aggregate([
      { $match: { roleType: 'user' } },
      { $unwind: '$coursesInterested' },
      { $group: { _id: '$coursesInterested', count: { $sum: 1 } } }
    ]);
    res.json({ totalUsers, cert: { yes: certYes, no: certNo }, courses: coursesAgg });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ roleType: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
