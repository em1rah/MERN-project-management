module.exports = function ensureAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ msg: 'No user information' });
  if (req.user.roleType !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  next();
}
