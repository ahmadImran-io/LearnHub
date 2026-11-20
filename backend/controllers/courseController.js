const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const AppError = require('../utils/AppError');

const isOwnerOrAdmin = (course, user) =>
  user.role === 'admin' || String(course.instructor._id || course.instructor) === String(user._id);

// GET /api/courses?search=&category=
exports.getCourses = async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }
  const courses = await Course.find(filter)
    .select('-lessons.content -lessons.videoUrl')
    .populate('instructor', 'name email')
    .sort('-createdAt');
  res.json(courses);
};

// GET /api/courses/mine  (instructor: own courses)
exports.getMyCreatedCourses = async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).populate('instructor', 'name email').sort('-createdAt');
  res.json(courses);
};

// GET /api/courses/:id  (lesson content is only visible to the owner, admins and enrolled students)
exports.getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name email');
  if (!course) throw new AppError('Course not found', 404);

  let canSeeContent = false;
  if (req.user) {
    canSeeContent = isOwnerOrAdmin(course, req.user);
    if (!canSeeContent && req.user.role === 'student') {
      canSeeContent = !!(await Enrollment.exists({ student: req.user._id, course: course._id }));
    }
  }
  const data = course.toObject();
  if (!canSeeContent) data.lessons = data.lessons.map(({ _id, title }) => ({ _id, title }));
  data.canSeeContent = canSeeContent;
  res.json(data);
};

// POST /api/courses  (instructor, admin)
exports.createCourse = async (req, res) => {
  const { title, description, category, price } = req.body;
  const course = await Course.create({ title, description, category, price, instructor: req.user._id });
  await course.populate('instructor', 'name email');
  res.status(201).json(course);
};

// PUT /api/courses/:id  (owner, admin)
exports.updateCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  if (!isOwnerOrAdmin(course, req.user)) throw new AppError('You can only edit your own courses', 403);

  ['title', 'description', 'category', 'price'].forEach((f) => {
    if (req.body[f] !== undefined) course[f] = req.body[f];
  });
  await course.save();
  await course.populate('instructor', 'name email');
  res.json(course);
};

// DELETE /api/courses/:id  (owner, admin)
exports.deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  if (!isOwnerOrAdmin(course, req.user)) throw new AppError('You can only delete your own courses', 403);

  await Enrollment.deleteMany({ course: course._id });
  await course.deleteOne();
  res.json({ message: 'Course deleted' });
};

// POST /api/courses/:id/lessons  (owner, admin) - "upload" a lesson
exports.addLesson = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  if (!isOwnerOrAdmin(course, req.user)) throw new AppError('You can only add lessons to your own courses', 403);

  course.lessons.push({ title: req.body.title, content: req.body.content, videoUrl: req.body.videoUrl });
  await course.save();
  res.status(201).json(course.lessons[course.lessons.length - 1]);
};

// DELETE /api/courses/:id/lessons/:lessonId  (owner, admin)
exports.deleteLesson = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new AppError('Course not found', 404);
  if (!isOwnerOrAdmin(course, req.user)) throw new AppError('You can only edit your own courses', 403);

  const lesson = course.lessons.id(req.params.lessonId);
  if (!lesson) throw new AppError('Lesson not found', 404);
  lesson.deleteOne();
  await course.save();

  // keep students' progress consistent with the remaining lessons
  const enrollments = await Enrollment.find({ course: course._id });
  for (const e of enrollments) {
    e.completedLessons = e.completedLessons.filter((id) => String(id) !== String(req.params.lessonId));
    e.progress = course.lessons.length ? Math.round((e.completedLessons.length / course.lessons.length) * 100) : 0;
    await e.save();
  }
  res.json({ message: 'Lesson deleted' });
};
