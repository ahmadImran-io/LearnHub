const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Attaches req.user when a valid token is present, but never rejects the request
module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch {
    /* ignore invalid tokens on public routes */
  }
  next();
};
