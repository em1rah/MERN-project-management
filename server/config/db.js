const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trainee-db';
  // Cache the connection across hot reloads / serverless invocations
  if (!global.__MONGOOSE_CONN__) {
    global.__MONGOOSE_CONN__ = { conn: null, promise: null };
  }

  if (global.__MONGOOSE_CONN__.conn) return global.__MONGOOSE_CONN__.conn;

  if (!global.__MONGOOSE_CONN__.promise) {
    global.__MONGOOSE_CONN__.promise = mongoose
      .connect(uri)
      .then((m) => m.connection);
  }

  try {
    global.__MONGOOSE_CONN__.conn = await global.__MONGOOSE_CONN__.promise;
    console.log('MongoDB connected');
    return global.__MONGOOSE_CONN__.conn;
  } catch (err) {
    global.__MONGOOSE_CONN__.promise = null;
    console.error(err.message);
    throw err;
  }
};
