const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendAuth = (res, user, status = 200) => {
  res.status(status).json({
    token: signToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// POST /api/register
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw new AppError('Name, email and password are required', 400);
  if (String(password).length < 6) throw new AppError('Password must be at least 6 characters', 400);

  // Self-registration is limited to student/instructor. Admins are created via the seed script.
  const safeRole = role === 'instructor' ? 'instructor' : 'student';
  const user = await User.create({ name, email, password, role: safeRole });
  sendAuth(res, user, 201);
};

// POST /api/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required', 400);

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new AppError('Invalid email or password', 401);
  sendAuth(res, user);
};

// GET /api/me
exports.getMe = async (req, res) => {
  const { _id, name, email, role, createdAt } = req.user;
  res.json({ _id, name, email, role, createdAt });
};
