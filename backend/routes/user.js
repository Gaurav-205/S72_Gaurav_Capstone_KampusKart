const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get(
  '/admin/users',
  authMiddleware,
  requireAdmin('Admin access required'),
  userController.getAdminUsers
);
router.put(
  '/admin/users/:userId',
  authMiddleware,
  requireAdmin('Admin access required'),
  userController.updateAdminUser
);
router.delete(
  '/admin/users/:userId',
  authMiddleware,
  requireAdmin('Admin access required'),
  userController.deleteAdminUser
);

module.exports = router;
