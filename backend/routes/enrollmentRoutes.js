const router = require('express').Router();
const { enroll, getMyCourses, updateProgress } = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/enroll', protect, authorize('student'), enroll);
router.get('/my-courses', protect, authorize('student'), getMyCourses);
router.put('/my-courses/:courseId/progress', protect, authorize('student'), updateProgress);

module.exports = router;
