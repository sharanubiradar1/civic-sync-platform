import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import {
  FaChartBar,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import { getRelativeTime, getStatusColor, getCategoryIcon } from '../utils/helpers';
import '../styles/Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch overall statistics
      const statsResponse = await issueAPI.getStats();
      setStats(statsResponse.data.data);

      // Fetch user's issues
      const issuesResponse = await issueAPI.getIssues({
        limit: 10,
        sortBy: '-createdAt'
      });
      setMyIssues(issuesResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Prepare chart data
  const statusChartData = {
    labels: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    datasets: [
      {
        label: 'Issues by Status',
        data: [
          stats?.overview?.pending || 0,
          stats?.overview?.inProgress || 0,
          stats?.overview?.resolved || 0,
          stats?.overview?.rejected || 0
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const categoryChartData = {
    labels: stats?.byCategory?.slice(0, 5).map((cat) => cat._id) || [],
    datasets: [
      {
        label: 'Issues by Category',
        data: stats?.byCategory?.slice(0, 5).map((cat) => cat.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}!</h1>
            <p>Here's what's happening in your community</p>
          </div>
          <Link to="/report" className="btn btn-primary">
            Report New Issue
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
              <FaClipboardList />
            </div>
            <div className="stat-details">
              <h3>{stats?.overview?.totalIssues || 0}</h3>
              <p>Total Issues</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
              <FaClock />
            </div>
            <div className="stat-details">
              <h3>{stats?.overview?.pending || 0}</h3>
              <p>Pending</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
              <FaCheckCircle />
            </div>
            <div className="stat-details">
              <h3>{stats?.overview?.resolved || 0}</h3>
              <p>Resolved</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#6366f1' }}>
              <FaExclamationTriangle />
            </div>
            <div className="stat-details">
              <h3>{stats?.overview?.inProgress || 0}</h3>
              <p>In Progress</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-card">
              <h2>
                <FaChartBar /> Issues by Status
              </h2>
              <div className="chart-container">
                <Pie data={statusChartData} options={chartOptions} />
              </div>
            </div>

            <div className="chart-card">
              <h2>
                <FaChartBar /> Top 5 Categories
              </h2>
              <div className="chart-container">
                <Bar data={categoryChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* My Issues Section */}
          <div className="my-issues-section">
            <div className="section-header">
              <h2>My Recent Reports</h2>
              <Link to="/issues?my=true" className="view-all-link">
                View All →
              </Link>
            </div>

            {myIssues.length === 0 ? (
              <div className="no-issues">
                <p>You haven't reported any issues yet</p>
                <Link to="/report" className="btn btn-primary">
                  Report Your First Issue
                </Link>
              </div>
            ) : (
              <div className="issues-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Upvotes</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myIssues.map((issue) => (
                      <tr key={issue._id}>
                        <td>
                          <strong>{issue.title}</strong>
                        </td>
                        <td>
                          <span className="category-badge">
                            {getCategoryIcon(issue.category)} {issue.category}
                          </span>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(issue.status) }}
                          >
                            {issue.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{issue.upvoteCount}</td>
                        <td>{getRelativeTime(issue.createdAt)}</td>
                        <td>
                          <Link
                            to={`/issues/${issue._id}`}
                            className="btn btn-sm btn-primary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <Link to="/report" className="action-card">
                <span className="action-icon">📝</span>
                <h3>Report Issue</h3>
                <p>Report a new civic issue</p>
              </Link>

              <Link to="/issues" className="action-card">
                <span className="action-icon">🔍</span>
                <h3>Browse Issues</h3>
                <p>Explore community issues</p>
              </Link>

              <Link to="/map" className="action-card">
                <span className="action-icon">🗺️</span>
                <h3>View Map</h3>
                <p>See issues on map</p>
              </Link>

              <Link to="/profile" className="action-card">
                <span className="action-icon">👤</span>
                <h3>My Profile</h3>
                <p>Manage your account</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;