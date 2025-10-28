const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // Get authorization header
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Get token from bearer string
    const token = bearer.split('Bearer ')[1].trim();

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
}

module.exports = auth;

