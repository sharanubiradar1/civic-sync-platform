import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  FaMapMarkerAlt,
  FaThumbsUp,
  FaClock,
  FaUser,
  FaEdit,
  FaTrash,
  FaArrowLeft
} from 'react-icons/fa';
import {
  formatDate,
  getRelativeTime,
  getStatusColor,
  getPriorityColor,
  getCategoryIcon,
  formatStatus
} from '../utils/helpers';
import '../styles/IssueDetail.css';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const fetchIssue = useCallback(async () => {
    try {
      setLoading(true);
      const response = await issueAPI.getIssue(id);
      setIssue(response.data.data);
    } catch (error) {
      console.error('Error fetching issue:', error);
      toast.error('Failed to load issue details');
      navigate('/issues');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchIssue();
  }, [fetchIssue]);

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to upvote');
      navigate('/login');
      return;
    }

    try {
      const response = await issueAPI.upvoteIssue(id);
      setIssue({
        ...issue,
        upvotes: response.data.data.userUpvoted
          ? [...issue.upvotes, user._id]
          : issue.upvotes.filter((uid) => uid !== user._id),
        upvoteCount: response.data.data.upvotes
      });
      toast.success(
        response.data.data.userUpvoted ? 'Upvoted!' : 'Upvote removed'
      );
    } catch (error) {
      console.error('Error upvoting:', error);
      toast.error('Failed to upvote issue');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Please login to comment');
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await issueAPI.addComment(id, comment);
      setIssue({ ...issue, comments: response.data.data });
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await issueAPI.deleteIssue(id);
        toast.success('Issue deleted successfully');
        navigate('/issues');
      } catch (error) {
        console.error('Error deleting issue:', error);
        toast.error('Failed to delete issue');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading issue details...</p>
      </div>
    );
  }

  if (!issue) {
    return <div>Issue not found</div>;
  }

  const isOwner = user && issue.reportedBy._id === user._id;
  const hasUpvoted = user && issue.upvotes.includes(user._id);

  return (
    <div className="issue-detail-page">
      <div className="container">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Issues
        </button>

        {/* Issue Header */}
        <div className="issue-detail-header">
          <div className="header-left">
            <h1>{issue.title}</h1>
            <div className="issue-meta-info">
              <span className="meta-item">
                <FaClock /> {getRelativeTime(issue.createdAt)}
              </span>
              <span className="meta-item">
                <FaUser /> {issue.reportedBy.name}
              </span>
              <span className="meta-item">
                <FaMapMarkerAlt /> {issue.location.address}
              </span>
            </div>
          </div>

          <div className="header-right">
            <div className="issue-badges-large">
              <span
                className="badge badge-status"
                style={{ backgroundColor: getStatusColor(issue.status) }}
              >
                {formatStatus(issue.status)}
              </span>
              <span
                className="badge badge-priority"
                style={{ backgroundColor: getPriorityColor(issue.priority) }}
              >
                {issue.priority.toUpperCase()}
              </span>
              <span className="badge badge-category">
                {getCategoryIcon(issue.category)} {issue.category}
              </span>
            </div>

            {isOwner && (
              <div className="action-buttons">
                <button className="btn btn-secondary btn-sm">
                  <FaEdit /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="issue-detail-content">
          {/* Images Section */}
          {issue.images && issue.images.length > 0 && (
            <div className="issue-images-section">
              <div className="main-image">
                <img
                  src={issue.images[selectedImage].url}
                  alt={issue.title}
                />
              </div>
              {issue.images.length > 1 && (
                <div className="image-thumbnails">
                  {issue.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`${issue.title} ${index + 1}`}
                      className={selectedImage === index ? 'active' : ''}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="issue-description-section">
            <h2>Description</h2>
            <p>{issue.description}</p>
          </div>

          {/* Location */}
          <div className="issue-location-section">
            <h2>Location</h2>
            <div className="location-info">
              <FaMapMarkerAlt />
              <div>
                <p className="location-address">{issue.location.address}</p>
                {issue.location.city && (
                  <p className="location-city">
                    {issue.location.city}, {issue.location.state}{' '}
                    {issue.location.zipCode}
                  </p>
                )}
              </div>
            </div>
            <Link to={`/map?issue=${issue._id}`} className="btn btn-secondary">
              View on Map
            </Link>
          </div>

          {/* Upvote Section */}
          <div className="upvote-section">
            <button
              className={`upvote-btn ${hasUpvoted ? 'upvoted' : ''}`}
              onClick={handleUpvote}
            >
              <FaThumbsUp />
              <span>{issue.upvoteCount}</span>
            </button>
            <p>
              {hasUpvoted ? 'You upvoted this issue' : 'Upvote if you agree this needs attention'}
            </p>
          </div>

          {/* Status History */}
          {issue.statusHistory && issue.statusHistory.length > 0 && (
            <div className="status-history-section">
              <h2>Status History</h2>
              <div className="timeline">
                {issue.statusHistory.map((history, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <p className="timeline-status">
                        Status changed to:{' '}
                        <strong>{formatStatus(history.status)}</strong>
                      </p>
                      <p className="timeline-date">
                        {formatDate(history.changedAt)}
                      </p>
                      {history.note && (
                        <p className="timeline-note">{history.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="comments-section">
            <h2>Comments ({issue.comments?.length || 0})</h2>

            {isAuthenticated && (
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="3"
                ></textarea>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingComment}
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            )}

            {!isAuthenticated && (
              <div className="login-prompt">
                <p>
                  <Link to="/login">Login</Link> to add comments
                </p>
              </div>
            )}

            <div className="comments-list">
              {issue.comments && issue.comments.length > 0 ? (
                issue.comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <div className="comment-avatar">
                      {comment.user.avatar ? (
                        <img src={comment.user.avatar} alt={comment.user.name} />
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.user.name}</span>
                        <span className="comment-date">
                          {getRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;