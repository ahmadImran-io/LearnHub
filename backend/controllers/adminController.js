const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  res.json(await User.find().sort('-createdAt'));
};

// PUT /api/admin/users/:id/role   body: { role }
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'instructor', 'student'].includes(role)) throw new AppError('Role must be admin, instructor or student', 400);
  if (String(req.params.id) === String(req.user._id)) throw new AppError('You cannot change your own role', 400);

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { returnDocument: 'after', runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  res.json(user);
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw new AppError('You cannot delete your own account', 400);
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  const courses = await Course.find({ instructor: user._id }).select('_id');
  const courseIds = courses.map((c) => c._id);
  await Enrollment.deleteMany({ $or: [{ student: user._id }, { course: { $in: courseIds } }] });
  await Course.deleteMany({ instructor: user._id });
  await user.deleteOne();
  res.json({ message: 'User deleted' });
};

// GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  const [users, courses, enrollments, byRole, topCourses, byCategory] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Enrollment.aggregate([
      { $group: { _id: '$course', enrollments: { $sum: 1 }, avgProgress: { $avg: '$progress' } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $project: { _id: 0, courseId: '$_id', title: '$course.title', enrollments: 1, avgProgress: { $round: ['$avgProgress', 0] } } },
    ]),
    Course.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);

  res.json({
    totals: { users, courses, enrollments },
    usersByRole: Object.fromEntries(byRole.map((r) => [r._id, r.count])),
    topCourses,
    coursesByCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
  });
};
