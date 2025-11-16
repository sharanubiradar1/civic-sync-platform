import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { issueAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  FaMapMarkerAlt,
  FaFilter,
  FaThumbsUp,
  FaEye,
  FaLayerGroup
} from 'react-icons/fa';
import {
  getStatusColor,
  getPriorityColor,
  getCategoryIcon,
  getRelativeTime,
  truncate
} from '../utils/helpers';
import { MAP_CONFIG, ISSUE_CATEGORIES, ISSUE_STATUS } from '../utils/constants';
import 'leaflet/dist/leaflet.css';
import '../styles/MapView.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons based on status
const createCustomIcon = (status) => {
  const color = getStatusColor(status);
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Component to update map view
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const MapView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });
  const [mapCenter, setMapCenter] = useState(MAP_CONFIG.center);
  const [mapZoom, setMapZoom] = useState(MAP_CONFIG.zoom);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        limit: 500 // Get all issues for map
      };

      const response = await issueAPI.getIssues(params);
      setIssues(response.data.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSpecificIssue = useCallback(async (issueId) => {
    try {
      const response = await issueAPI.getIssue(issueId);
      const issue = response.data.data;
      
      if (issue.location?.coordinates?.coordinates) {
        const [lng, lat] = issue.location.coordinates.coordinates;
        setMapCenter([lat, lng]);
        setMapZoom(15);
        setSelectedIssue(issue);
      }
    } catch (error) {
      console.error('Error fetching specific issue:', error);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  useEffect(() => {
    // Check if specific issue is requested
    const issueId = searchParams.get('issue');
    if (issueId) {
      fetchSpecificIssue(issueId);
    }
  }, [searchParams, fetchSpecificIssue]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      status: '',
      search: ''
    });
  };

  const handleMarkerClick = (issue) => {
    setSelectedIssue(issue);
    const [lng, lat] = issue.location.coordinates.coordinates;
    setMapCenter([lat, lng]);
    setMapZoom(15);
  };

  return (
    <div className="map-view-page">
      {/* Map Controls Sidebar */}
      <div className={`map-sidebar ${showFilters ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>
            <FaLayerGroup /> Map Filters
          </h2>
          <button
            className="close-sidebar"
            onClick={() => setShowFilters(false)}
          >
            ×
          </button>
        </div>

        <div className="sidebar-content">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search issues..."
            />
          </div>

          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
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
            <label htmlFor="status">Status</label>
            <select
              id="status"
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

          <button className="btn btn-secondary btn-block" onClick={resetFilters}>
            Reset Filters
          </button>

          <div className="map-legend">
            <h3>Legend</h3>
            <div className="legend-items">
              {ISSUE_STATUS.map((status) => (
                <div key={status.value} className="legend-item">
                  <div
                    className="legend-marker"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span>{status.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="map-stats">
            <h3>Statistics</h3>
            <div className="stat-item">
              <span>Total Issues:</span>
              <strong>{issues.length}</strong>
            </div>
            <div className="stat-item">
              <span>On Map:</span>
              <strong>
                {issues.filter((i) => i.location?.coordinates?.coordinates).length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container">
        <button
          className="map-filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> {showFilters ? 'Hide' : 'Show'} Filters
        </button>

        {loading ? (
          <div className="map-loading">
            <div className="spinner"></div>
            <p>Loading map...</p>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <ChangeView center={mapCenter} zoom={mapZoom} />
            
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {issues
              .filter((issue) => issue.location?.coordinates?.coordinates)
              .map((issue) => {
                const [lng, lat] = issue.location.coordinates.coordinates;
                return (
                  <Marker
                    key={issue._id}
                    position={[lat, lng]}
                    icon={createCustomIcon(issue.status)}
                    eventHandlers={{
                      click: () => handleMarkerClick(issue)
                    }}
                  >
                    <Popup>
                      <div className="issue-popup">
                        <h3>{issue.title}</h3>
                        <div className="popup-badges">
                          <span
                            className="badge"
                            style={{ backgroundColor: getStatusColor(issue.status) }}
                          >
                            {issue.status.replace('_', ' ')}
                          </span>
                          <span
                            className="badge"
                            style={{ backgroundColor: getPriorityColor(issue.priority) }}
                          >
                            {issue.priority}
                          </span>
                        </div>
                        <p className="popup-category">
                          {getCategoryIcon(issue.category)} {issue.category}
                        </p>
                        <p className="popup-description">
                          {truncate(issue.description, 100)}
                        </p>
                        <div className="popup-meta">
                          <span>
                            <FaThumbsUp /> {issue.upvoteCount}
                          </span>
                          <span>{getRelativeTime(issue.createdAt)}</span>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/issues/${issue._id}`)}
                        >
                          <FaEye /> View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        )}
      </div>

      {/* Selected Issue Panel */}
      {selectedIssue && (
        <div className="selected-issue-panel">
          <button
            className="close-panel"
            onClick={() => setSelectedIssue(null)}
          >
            ×
          </button>
          
          {selectedIssue.images && selectedIssue.images.length > 0 && (
            <div className="panel-image">
              <img src={selectedIssue.images[0].url} alt={selectedIssue.title} />
            </div>
          )}
          
          <div className="panel-content">
            <h3>{selectedIssue.title}</h3>
            <div className="panel-badges">
              <span
                className="badge"
                style={{ backgroundColor: getStatusColor(selectedIssue.status) }}
              >
                {selectedIssue.status.replace('_', ' ')}
              </span>
              <span
                className="badge"
                style={{ backgroundColor: getPriorityColor(selectedIssue.priority) }}
              >
                {selectedIssue.priority}
              </span>
            </div>
            <p className="panel-category">
              {getCategoryIcon(selectedIssue.category)} {selectedIssue.category}
            </p>
            <p className="panel-location">
              <FaMapMarkerAlt /> {selectedIssue.location.address}
            </p>
            <p className="panel-description">{selectedIssue.description}</p>
            <div className="panel-meta">
              <span>
                <FaThumbsUp /> {selectedIssue.upvoteCount} upvotes
              </span>
              <span>{getRelativeTime(selectedIssue.createdAt)}</span>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={() => navigate(`/issues/${selectedIssue._id}`)}
            >
              View Full Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;