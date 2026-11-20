const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Verifies the JWT in the Authorization header and attaches req.user
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) throw new AppError('Not authorized, no token provided', 401);

    let decoded;
    try {
      decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    } catch {
      throw new AppError('Not authorized, token is invalid or expired', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('The user for this token no longer exists', 401);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Restricts a route to one or more roles
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(`Access denied: role '${req.user.role}' cannot perform this action`, 403));
  }
  next();
};

module.exports = { protect, authorize };
