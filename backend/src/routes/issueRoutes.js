const express = require('express');
const router = express.Router();
const {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  upvoteIssue,
  addComment,
  getNearbyIssues,
  getIssueStats
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createIssueValidation,
  updateIssueValidation,
  commentValidation,
  mongoIdValidation,
  validate
} = require('../utils/validators');

// Public routes
router.get('/', getIssues);
router.get('/stats', getIssueStats);
router.get('/nearby/:longitude/:latitude', getNearbyIssues);
router.get('/:id', mongoIdValidation, validate, getIssue);

// Protected routes
router.post(
  '/',
  protect,
  upload.array('images', 5),
  createIssueValidation,
  validate,
  createIssue
);

router.put(
  '/:id',
  protect,
  updateIssueValidation,
  validate,
  updateIssue
);

router.delete(
  '/:id',
  protect,
  mongoIdValidation,
  validate,
  deleteIssue
);

router.post(
  '/:id/upvote',
  protect,
  mongoIdValidation,
  validate,
  upvoteIssue
);

router.post(
  '/:id/comments',
  protect,
  commentValidation,
  validate,
  addComment
);

module.exports = router;