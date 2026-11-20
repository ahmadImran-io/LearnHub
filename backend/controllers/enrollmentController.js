const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');

// POST /api/enroll   body: { courseId }   (student)
exports.enroll = async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) throw new AppError('courseId is required', 400);

  const course = await Course.findById(courseId);
  if (!course) throw new AppError('Course not found', 404);

  const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (existing) throw new AppError('You are already enrolled in this course', 409);

  const enrollment = await Enrollment.create({ student: req.user._id, course: courseId });
  res.status(201).json(enrollment);
};

// GET /api/my-courses   (student)
exports.getMyCourses = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } })
    .sort('-createdAt');
  // drop enrollments whose course was deleted
  res.json(enrollments.filter((e) => e.course));
};

// PUT /api/my-courses/:courseId/progress   body: { lessonId, completed }  (student)
exports.updateProgress = async (req, res) => {
  const { lessonId, completed = true } = req.body;
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrollment) throw new AppError('You are not enrolled in this course', 404);

  const course = await Course.findById(req.params.courseId);
  if (!course || !course.lessons.id(lessonId)) throw new AppError('Lesson not found in this course', 404);

  const done = new Set(enrollment.completedLessons.map(String));
  if (completed) done.add(String(lessonId));
  else done.delete(String(lessonId));

  enrollment.completedLessons = [...done];
  enrollment.progress = Math.round((done.size / course.lessons.length) * 100);
  await enrollment.save();
  res.json(enrollment);
};
