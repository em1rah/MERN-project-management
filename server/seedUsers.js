require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function seed() {
  await connectDB();
  try {
    // Ensure indexes (unique email)
    await User.init();

    const samples = [
      {
        fullName: 'Alice Santos',
        school: 'State University',
        coursesInterested: ['AWS Gen. AI','AWS Cloud Practitioner'],
        coursesOther: [],
        interestedInCertification: true,
        email: 'alice@example.com',
        password: 'Password123!'
      },
      {
        fullName: 'Ben Cruz',
        school: 'Tech Institute',
        coursesInterested: ['AWS Certified Solution Architect'],
        coursesOther: ['Kubernetes Basics'],
        interestedInCertification: false,
        email: 'ben@example.com',
        password: 'Password123!'
      },
      {
        fullName: 'Carla Reyes',
        school: 'Private College',
        coursesInterested: ['AWS Cloud Practitioner'],
        coursesOther: [],
        interestedInCertification: true,
        email: 'carla@example.com',
        password: 'Password123!'
      }
    ];

    for (const s of samples) {
      const exists = await User.findOne({ email: s.email });
      if (exists) {
        console.log('Skipping existing user:', s.email);
        continue;
      }
      const hashed = await bcrypt.hash(s.password, 10);
      const user = new User({ ...s, password: hashed, roleType: 'user' });
      await user.save();
      console.log('Created user:', s.email);
    }

    console.log('Sample users seeded.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
