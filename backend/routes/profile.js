const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { createMemoryUpload } = require('../middleware/uploads');
const profileController = require('../controllers/profileController');

const upload = createMemoryUpload();

router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, upload.single('profilePicture'), profileController.updateProfile);
router.delete('/', authMiddleware, profileController.deleteAccount);

module.exports = router;
