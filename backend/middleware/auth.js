const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-secret-change-me';
}

function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const m = String(header).match(/^Bearer\s+(.+)$/i);
    if (!m) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing Bearer token' });
    }
    const token = m[1];
    const payload = jwt.verify(token, getJwtSecret());
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
}

module.exports = {
  authRequired,
  getJwtSecret,
};

