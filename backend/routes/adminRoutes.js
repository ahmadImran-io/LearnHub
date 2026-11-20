const router = require('express').Router();
const a = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', a.getUsers);
router.put('/users/:id/role', a.updateUserRole);
router.delete('/users/:id', a.deleteUser);
router.get('/analytics', a.getAnalytics);

module.exports = router;
