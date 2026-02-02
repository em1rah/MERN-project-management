const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ensureAdmin = require('../middleware/ensureAdmin');
const User = require('../models/User');

// Apply auth + admin check to all admin routes
router.use(auth, ensureAdmin);

// Stats for dashboard (includes extended analytics)
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

    // Registrations over time (last 6 months by month)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const registrationsOverTime = await User.aggregate([
      { $match: { roleType: 'user', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top schools (top 10 by trainee count)
    const bySchool = await User.aggregate([
      { $match: { roleType: 'user' } },
      { $group: { _id: '$school', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Role distribution
    const byRole = await User.aggregate([
      { $match: { roleType: 'user' } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Courses per trainee (0, 1, 2, 3+)
    const coursesPerTrainee = await User.aggregate([
      { $match: { roleType: 'user' } },
      {
        $project: {
          bucket: {
            $switch: {
              branches: [
                { case: { $eq: [{ $size: { $ifNull: ['$coursesInterested', []] } }, 0] }, then: '0' },
                { case: { $eq: [{ $size: { $ifNull: ['$coursesInterested', []] } }, 1] }, then: '1' },
                { case: { $eq: [{ $size: { $ifNull: ['$coursesInterested', []] } }, 2] }, then: '2' },
              ],
              default: '3+',
            },
          },
        },
      },
      { $group: { _id: '$bucket', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers,
      cert: { yes: certYes, no: certNo },
      courses: coursesAgg,
      registrationsOverTime,
      bySchool,
      byRole,
      coursesPerTrainee,
    });
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

// List users enrolled in a specific course (by course name)
router.get('/courses/enrolled', async (req, res) => {
  try {
    const course = req.query.course;
    if (!course) {
      return res.status(400).json({ error: 'Course name is required' });
    }
    const users = await User.find({
      roleType: 'user',
      coursesInterested: course,
    })
      .select('fullName email')
      .sort({ fullName: 1 })
      .lean();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
