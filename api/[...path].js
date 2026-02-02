// Vercel Serverless Function (Node.js)
// Proxies all `/api/*` requests to the Express app in `server/`.

const app = require('../server/app');

module.exports = (req, res) => app(req, res);

