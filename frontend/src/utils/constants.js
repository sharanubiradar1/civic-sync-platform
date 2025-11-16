export const ISSUE_CATEGORIES = [
  'Road & Transportation',
  'Water & Sanitation',
  'Electricity',
  'Garbage & Waste',
  'Street Lights',
  'Parks & Recreation',
  'Public Safety',
  'Building & Infrastructure',
  'Pollution',
  'Other'
];

export const ISSUE_STATUS = [
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'resolved', label: 'Resolved', color: '#10b981' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444' }
];

export const ISSUE_PRIORITY = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'critical', label: 'Critical', color: '#ef4444' }
];

export const USER_ROLES = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'municipal_staff', label: 'Municipal Staff' },
  { value: 'admin', label: 'Administrator' }
];

export const MAP_CONFIG = {
  center: [
    parseFloat(process.env.REACT_APP_MAP_CENTER_LAT) || 28.6139,
    parseFloat(process.env.REACT_APP_MAP_CENTER_LNG) || 77.2090
  ],
  zoom: parseInt(process.env.REACT_APP_MAP_ZOOM) || 12,
  maxZoom: 18,
  minZoom: 3
};

export const PAGINATION = {
  defaultLimit: 10,
  limitOptions: [5, 10, 20, 50]
};

export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 5,
  acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
};

export const NOTIFICATION_TYPES = {
  issue_created: { icon: '📝', color: '#3b82f6' },
  issue_updated: { icon: '🔄', color: '#f59e0b' },
  issue_resolved: { icon: '✅', color: '#10b981' },
  issue_rejected: { icon: '❌', color: '#ef4444' },
  issue_assigned: { icon: '👤', color: '#8b5cf6' },
  comment_added: { icon: '💬', color: '#06b6d4' },
  upvote_milestone: { icon: '🎉', color: '#ec4899' }
};