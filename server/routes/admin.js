const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ensureAdmin = require('../middleware/ensureAdmin');
const User = require('../models/User');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const bcrypt = require('bcryptjs');

// Apply auth + admin check to all admin routes
router.use(auth, ensureAdmin);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  const v = String(value ?? '').trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(v)) return true;
  if (['false', '0', 'no', 'n'].includes(v)) return false;
  return null;
}

function splitList(value) {
  if (value == null) return [];
  const raw = String(value).trim();
  if (!raw) return [];
  // Prefer semicolon or pipe; allow commas when quoted.
  return raw
    .split(/[;|,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isLikelyEmail(email) {
  const e = String(email ?? '').trim();
  return /^\S+@\S+\.\S+$/.test(e);
}

function parseCsvDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  // Accept M/D/YYYY or M/D/YYYY HH:mm (24h)
  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (match) {
    const [, m, d, y, hh, mm] = match;
    const date = new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      hh ? Number(hh) : 0,
      mm ? Number(mm) : 0,
      0,
      0
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

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

// Import/Upsert trainees from CSV (admin only)
// CSV required columns: fullName, school, interestedInCertification, email
// Optional columns: coursesInterested, coursesOther, password, createdAt, trainingAttended, mobileNumber, gradeTeach, yearsExperience
router.post('/users/import-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'CSV file is required (multipart field name: file)' });
    }

    const text = req.file.buffer.toString('utf8');

    let headerRows;
    try {
      headerRows = parse(text, {
        bom: true,
        to_line: 1,
        skip_empty_lines: true,
        relax_quotes: true,
      });
    } catch (e) {
      return res.status(400).json({ msg: `Invalid CSV header: ${e.message}` });
    }

    const headers = (headerRows?.[0] || []).map((h) => String(h ?? '').trim()).filter(Boolean);
    if (headers.length === 0) {
      return res.status(400).json({ msg: 'CSV header row is missing or empty' });
    }

    const requiredHeaders = ['fullName', 'school', 'interestedInCertification', 'email'];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length) {
      return res.status(400).json({
        msg: `Missing required columns: ${missingHeaders.join(', ')}`,
        requiredColumns: requiredHeaders,
      });
    }

    const hasCol = (col) => headers.includes(col);

    let records;
    try {
      records = parse(text, {
        bom: true,
        from_line: 2,
        columns: headers,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
      });
    } catch (e) {
      return res.status(400).json({ msg: `Invalid CSV rows: ${e.message}` });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ msg: 'CSV has no data rows' });
    }

    // De-dupe by email; last row wins (keeps imports idempotent).
    const byEmail = new Map();
    records.forEach((row, idx) => {
      const email = String(row.email ?? '').trim().toLowerCase();
      byEmail.set(email, { row, rowNumber: idx + 2 });
    });

    const errors = [];
    const ops = [];
    const opMeta = [];

    for (const [email, { row, rowNumber }] of byEmail.entries()) {
      if (!email || !isLikelyEmail(email)) {
        errors.push({ rowNumber, email: row.email, error: 'Invalid email' });
        continue;
      }

      const fullName = String(row.fullName ?? '').trim();
      const school = String(row.school ?? '').trim();
      const interested = parseBoolean(row.interestedInCertification);
      const emailOriginal = String(row.email ?? '').trim().toLowerCase();

      if (!fullName) {
        errors.push({ rowNumber, email, error: 'fullName is required' });
        continue;
      }
      if (!school) {
        errors.push({ rowNumber, email, error: 'school is required' });
        continue;
      }
      if (!emailOriginal || !isLikelyEmail(emailOriginal)) {
        errors.push({ rowNumber, email, error: 'email is required and must be valid' });
        continue;
      }
      if (interested === null) {
        errors.push({
          rowNumber,
          email,
          error: 'interestedInCertification must be true/false (or yes/no, 1/0)',
        });
        continue;
      }

      const coursesInterested = hasCol('coursesInterested') ? splitList(row.coursesInterested) : undefined;
      const coursesOther = hasCol('coursesOther') ? splitList(row.coursesOther) : undefined;
      const trainingAttendedRaw = hasCol('trainingAttended') ? String(row.trainingAttended ?? '').trim() : '';
      const trainingAttended = trainingAttendedRaw ? parseBoolean(trainingAttendedRaw) : undefined;
      const mobileNumber = hasCol('mobileNumber') ? String(row.mobileNumber ?? '').trim() : undefined;
      const gradeTeach = hasCol('gradeTeach') ? String(row.gradeTeach ?? '').trim() : undefined;
      const yearsExperienceRaw = hasCol('yearsExperience') ? String(row.yearsExperience ?? '').trim() : '';
      const yearsExperienceMatch = yearsExperienceRaw.match(/-?\d+(\.\d+)?/);
      const yearsExperience = yearsExperienceMatch ? Number(yearsExperienceMatch[0]) : undefined;
      if (yearsExperienceRaw && !Number.isFinite(yearsExperience)) {
        errors.push({ rowNumber, email, error: 'yearsExperience must be a number' });
        continue;
      }
      if (trainingAttendedRaw && trainingAttended === null && hasCol('trainingAttended')) {
        errors.push({ rowNumber, email, error: 'trainingAttended must be true/false (or yes/no, 1/0)' });
        continue;
      }

      const createdAt =
        hasCol('createdAt') && row.createdAt
          ? parseCsvDate(row.createdAt)
          : undefined;
      const createdAtValid = !createdAt || !Number.isNaN(createdAt.getTime());
      if (!createdAtValid) {
        errors.push({ rowNumber, email, error: 'createdAt is not a valid date' });
        continue;
      }

      const passwordPlain = hasCol('password') ? String(row.password ?? '').trim() : '';
      const passwordToUse = passwordPlain || 'password123!';
      const passwordHash = await bcrypt.hash(passwordToUse, 10);

      const set = {
        fullName,
        school,
        interestedInCertification: interested,
        roleType: 'user',
      };
      if (hasCol('coursesInterested')) set.coursesInterested = coursesInterested;
      if (hasCol('coursesOther')) set.coursesOther = coursesOther;
      if (hasCol('trainingAttended')) set.trainingAttended = trainingAttended;
      if (hasCol('mobileNumber')) set.mobileNumber = mobileNumber;
      if (hasCol('gradeTeach')) set.gradeTeach = gradeTeach;
      if (hasCol('yearsExperience')) set.yearsExperience = yearsExperience;

      const setOnInsert = {
        email: emailOriginal,
        password: passwordHash,
        createdAt: createdAt || new Date(),
      };

      // Only change password for existing users if explicitly provided in CSV.
      if (hasCol('password') && passwordPlain) {
        set.password = passwordHash;
      }

      ops.push({
        updateOne: {
          filter: { email: emailOriginal },
          update: {
            $set: set,
            $setOnInsert: setOnInsert,
          },
          upsert: true,
        },
      });
      opMeta.push({ email, rowNumber });
    }

    if (ops.length === 0) {
      return res.status(400).json({
        msg: 'No valid rows to import',
        errors,
      });
    }

    let result = null;
    let bulkErr = null;
    try {
      result = await User.bulkWrite(ops, { ordered: false });
    } catch (e) {
      bulkErr = e;
    }

    if (bulkErr) {
      const writeErrors = Array.isArray(bulkErr.writeErrors) ? bulkErr.writeErrors : [];
      // Map driver writeErrors back to CSV rows (by operation index)
      for (const we of writeErrors) {
        const meta = opMeta[we.index];
        errors.push({
          rowNumber: meta?.rowNumber,
          email: meta?.email,
          error: we.errmsg || we.message || 'Write error',
          code: we.code,
        });
      }

      // If it wasn't a per-row write error (e.g. connection error), return debug info
      if (writeErrors.length === 0) {
        console.error(bulkErr);
        return res.status(500).json({
          msg: 'Server error importing CSV',
          error: bulkErr.message,
        });
      }
    }

    res.json({
      processedRows: records.length,
      uniqueEmails: byEmail.size,
      upsertedCount: result?.upsertedCount || 0,
      matchedCount: result?.matchedCount || 0,
      modifiedCount: result?.modifiedCount || 0,
      errorCount: errors.length,
      errors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error importing CSV', error: err.message });
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
