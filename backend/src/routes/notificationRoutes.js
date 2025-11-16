const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { mongoIdValidation, validate } = require('../utils/validators');

// All notification routes are protected
router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', mongoIdValidation, validate, markAsRead);
router.delete('/:id', mongoIdValidation, validate, deleteNotification);

module.exports = router;