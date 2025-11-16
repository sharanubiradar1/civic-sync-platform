import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { issueAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  FaFilter,
  FaSearch,
  FaMapMarkerAlt,
  FaThumbsUp,
  FaComment,
  FaClock
} from 'react-icons/fa';
import {
  getRelativeTime,
  getStatusColor,
  getPriorityColor,
  getCategoryIcon,
  truncate
} from '../utils/helpers';
import { ISSUE_CATEGORIES, ISSUE_STATUS, ISSUE_PRIORITY } from '../utils/constants';
import '../styles/IssuesList.css';

const IssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    priority: '',
    sortBy: '-createdAt'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await issueAPI.getIssues(params);
      setIssues(response.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages
      }));
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      priority: '',
      sortBy: '-createdAt'
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo(0, 0);
  };

  return (
    <div className="issues-list-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Browse Issues</h1>
            <p>Explore and track civic issues in your community</p>
          </div>
          <Link to="/report" className="btn btn-primary">
            Report New Issue
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search issues..."
              value={filters.search}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>

          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="sort-select"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-upvoteCount">Most Upvoted</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {ISSUE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                {ISSUE_STATUS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Priority</label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
              >
                <option value="">All Priorities</option>
                {ISSUE_PRIORITY.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-secondary" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        )}

        {/* Issues Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="no-results">
            <p>No issues found matching your criteria</p>
            <button className="btn btn-primary" onClick={resetFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="issues-grid">
              {issues.map((issue) => (
                <Link
                  to={`/issues/${issue._id}`}
                  key={issue._id}
                  className="issue-card"
                >
                  {/* Issue Image */}
                  {issue.images && issue.images.length > 0 && (
                    <div className="issue-image">
                      <img src={issue.images[0].url} alt={issue.title} />
                      <div className="issue-overlay">
                        <span className="issue-category">
                          {getCategoryIcon(issue.category)} {issue.category}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Issue Content */}
                  <div className="issue-content">
                    <div className="issue-header">
                      <h3 className="issue-title">{issue.title}</h3>
                      <div className="issue-badges">
                        <span
                          className="badge badge-status"
                          style={{ backgroundColor: getStatusColor(issue.status) }}
                        >
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span
                          className="badge badge-priority"
                          style={{ backgroundColor: getPriorityColor(issue.priority) }}
                        >
                          {issue.priority}
                        </span>
                      </div>
                    </div>

                    <p className="issue-description">
                      {truncate(issue.description, 120)}
                    </p>

                    <div className="issue-location">
                      <FaMapMarkerAlt />
                      <span>{issue.location.address}</span>
                    </div>

                    <div className="issue-footer">
                      <div className="issue-meta">
                        <span className="meta-item">
                          <FaThumbsUp /> {issue.upvoteCount}
                        </span>
                        <span className="meta-item">
                          <FaComment /> {issue.comments?.length || 0}
                        </span>
                        <span className="meta-item">
                          <FaClock /> {getRelativeTime(issue.createdAt)}
                        </span>
                      </div>
                      <div className="issue-reporter">
                        {issue.reportedBy?.avatar && (
                          <img
                            src={issue.reportedBy.avatar}
                            alt={issue.reportedBy.name}
                            className="reporter-avatar"
                          />
                        )}
                        <span>{issue.reportedBy?.name}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>

                <div className="pagination-numbers">
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      className={`pagination-number ${
                        pagination.page === index + 1 ? 'active' : ''
                      }`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IssuesList;