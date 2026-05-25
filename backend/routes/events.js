const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { createMemoryUpload } = require('../middleware/uploads');
const { createRateLimiter } = require('../middleware/rateLimit');
const eventsController = require('../controllers/eventsController');

const upload = createMemoryUpload();
const writeLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many requests, please try again later' },
});

router.get('/', eventsController.listEvents);
router.post(
  '/',
  authMiddleware,
  requireAdmin('Not authorized to add events.'),
  writeLimiter,
  upload.single('image'),
  eventsController.createEvent
);
router.put(
  '/:id',
  authMiddleware,
  requireAdmin('Only admin can edit events.'),
  writeLimiter,
  upload.single('image'),
  eventsController.updateEvent
);
router.delete(
  '/:id',
  authMiddleware,
  requireAdmin('Only admin can delete events.'),
  eventsController.deleteEvent
);
router.post('/:id/register', authMiddleware, writeLimiter, eventsController.registerForEvent);

router.delete('/:id/register', authMiddleware, writeLimiter, eventsController.withdrawRegistration);

router.get('/user/registrations', authMiddleware, eventsController.getUserRegistrations);

router.get(
  '/:id/participants',
  authMiddleware,
  requireAdmin('Only admin can view participants.'),
  eventsController.getEventParticipants
);

module.exports = router;
