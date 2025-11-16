const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { uploadToLocalStorage, deleteFromLocalStorage } = require('../config/cloudinary');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const fs = require('fs').promises;

/**
 * @desc    Get all issues with filters and pagination
 * @route   GET /api/issues
 * @access  Public
 */
exports.getIssues = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      search,
      page = 1,
      limit = 10,
      sortBy = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email avatar')
      .populate('assignedTo', 'name email')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const count = await Issue.countDocuments(query);

    res.status(200).json({
      success: true,
      count: issues.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single issue by ID
 * @route   GET /api/issues/:id
 * @access  Public
 */
exports.getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email avatar phone')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name avatar')
      .populate('statusHistory.changedBy', 'name');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new issue
 * @route   POST /api/issues
 * @access  Private
 */
exports.createIssue = async (req, res, next) => {
  try {
    const { title, description, category, priority, location } = req.body;

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          // Upload to local storage
          const result = await uploadToLocalStorage(file.path, 'issues');
          images.push({
            url: result.url,
            publicId: result.publicId
          });
          
          // Delete temporary file
          await fs.unlink(file.path);
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          // Clean up any uploaded files on error
          for (const img of images) {
            await deleteFromLocalStorage(img.publicId);
          }
          // Delete temp file
          await fs.unlink(file.path).catch(() => {});
          throw new Error('Failed to process image uploads');
        }
      }
    }

    // Create issue
    const issue = await Issue.create({
      title,
      description,
      category,
      priority,
      location,
      images,
      reportedBy: req.user.id
    });

    // Populate user data
    await issue.populate('reportedBy', 'name email');

    // Send confirmation email
    try {
      const emailContent = emailTemplates.issueCreated(issue, req.user);
      await sendEmail({
        email: req.user.email,
        ...emailContent
      });
    } catch (emailError) {
      console.error('Issue creation email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update issue
 * @route   PUT /api/issues/:id
 * @access  Private
 */
exports.updateIssue = async (req, res, next) => {
  try {
    let issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check authorization
    if (
      issue.reportedBy.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'municipal_staff'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this issue'
      });
    }

    // Track status changes
    if (req.body.status && req.body.status !== issue.status) {
      issue.statusHistory.push({
        status: req.body.status,
        changedBy: req.user.id,
        note: req.body.statusNote
      });

      if (req.body.status === 'resolved') {
        issue.resolvedAt = Date.now();
      }

      // Send status update email
      try {
        const reporter = await User.findById(issue.reportedBy);
        const emailContent = emailTemplates.issueStatusUpdate(issue, reporter, req.body.status);
        await sendEmail({
          email: reporter.email,
          ...emailContent
        });
      } catch (emailError) {
        console.error('Status update email failed:', emailError);
      }
    }

    // Update issue
    issue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('reportedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete issue
 * @route   DELETE /api/issues/:id
 * @access  Private (Admin/Owner)
 */
exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check authorization
    if (
      issue.reportedBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this issue'
      });
    }

    // Delete images from local storage
    if (issue.images && issue.images.length > 0) {
      for (const image of issue.images) {
        try {
          await deleteFromLocalStorage(image.publicId);
        } catch (deleteError) {
          console.error('Error deleting image:', deleteError);
          // Continue even if image deletion fails
        }
      }
    }

    await issue.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upvote/Downvote issue
 * @route   POST /api/issues/:id/upvote
 * @access  Private
 */
exports.upvoteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const userId = req.user.id;
    const upvoteIndex = issue.upvotes.indexOf(userId);

    if (upvoteIndex > -1) {
      // Remove upvote
      issue.upvotes.splice(upvoteIndex, 1);
    } else {
      // Add upvote
      issue.upvotes.push(userId);
    }

    await issue.save();

    res.status(200).json({
      success: true,
      data: {
        upvotes: issue.upvoteCount,
        userUpvoted: upvoteIndex === -1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add comment to issue
 * @route   POST /api/issues/:id/comments
 * @access  Private
 */
exports.addComment = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text
    };

    issue.comments.push(comment);
    await issue.save();

    await issue.populate('comments.user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: issue.comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get issues near location
 * @route   GET /api/issues/nearby/:longitude/:latitude
 * @access  Public
 */
exports.getNearbyIssues = async (req, res, next) => {
  try {
    const { longitude, latitude } = req.params;
    const { maxDistance = 5000, limit = 20 } = req.query; // 5km default

    const issues = await Issue.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
      .limit(parseInt(limit))
      .populate('reportedBy', 'name avatar');

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get issue statistics
 * @route   GET /api/issues/stats
 * @access  Public
 */
exports.getIssueStats = async (req, res, next) => {
  try {
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: null,
          totalIssues: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {},
        byCategory: categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};