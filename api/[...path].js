// Vercel Serverless Function - proxies all /api/* to Express app
const app = require('../server/app');
module.exports = (req, res) => app(req, res);
