import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkedAlt, FaBell, FaChartLine, FaMobileAlt } from 'react-icons/fa';
import '../styles/Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Make Your City <span className="highlight">Better</span>
          </h1>
          <p className="hero-subtitle">
            Report civic issues, track progress, and collaborate with your community to build a smarter city
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <>
                <Link to="/report" className="btn btn-primary btn-lg">
                  Report an Issue
                </Link>
                <Link to="/issues" className="btn btn-secondary btn-lg">
                  Browse Issues
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started
                </Link>
                <Link to="/map" className="btn btn-secondary btn-lg">
                  Explore Map
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-illustration">
            <span className="city-icon">🏙️</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose CivicSync?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaMapMarkedAlt />
              </div>
              <h3>Location-Based Reporting</h3>
              <p>Report issues with precise location mapping and view problems in your neighborhood</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaBell />
              </div>
              <h3>Real-Time Updates</h3>
              <p>Get instant notifications about the status of your reported issues</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3>Analytics Dashboard</h3>
              <p>Track city-wide trends and see how your community is improving</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaMobileAlt />
              </div>
              <h3>Mobile Friendly</h3>
              <p>Report issues on the go with our fully responsive platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Report Issue</h3>
              <p>Take a photo and describe the civic issue you've encountered</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Track Progress</h3>
              <p>Monitor the status as authorities review and work on your report</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Resolved</h3>
              <p>Receive notifications when the issue is resolved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3 className="stat-number">5,000+</h3>
              <p className="stat-label">Issues Reported</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">3,500+</h3>
              <p className="stat-label">Issues Resolved</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">10,000+</h3>
              <p className="stat-label">Active Users</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-number">50+</h3>
              <p className="stat-label">Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of citizens working together to build better cities</p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-lg">
              Sign Up Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;