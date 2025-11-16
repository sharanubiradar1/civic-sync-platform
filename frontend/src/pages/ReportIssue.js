import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaCamera, FaTimes } from 'react-icons/fa';
import { ISSUE_CATEGORIES, ISSUE_PRIORITY, FILE_UPLOAD } from '../utils/constants';
import { getCurrentLocation, formatFileSize } from '../utils/helpers';
import '../styles/ReportIssue.css';

const ReportIssue = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: {
        type: 'Point',
        coordinates: [77.2090, 28.6139] // Default: Delhi
      }
    }
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: { ...formData.location, [locationField]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate number of files
    if (images.length + files.length > FILE_UPLOAD.maxFiles) {
      toast.error(`Maximum ${FILE_UPLOAD.maxFiles} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const previews = [];

    files.forEach((file) => {
      if (!FILE_UPLOAD.acceptedFormats.includes(file.type)) {
        toast.error(`${file.name} is not a supported format`);
        return;
      }

      if (file.size > FILE_UPLOAD.maxSize) {
        toast.error(
          `${file.name} is too large. Maximum size is ${formatFileSize(FILE_UPLOAD.maxSize)}`
        );
        return;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    });

    setImages([...images, ...validFiles]);
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleGetCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      const location = await getCurrentLocation();

      setFormData({
        ...formData,
        location: {
          ...formData.location,
          coordinates: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          }
        }
      });

      toast.success('Location captured successfully');
    } catch (error) {
      console.error('Location error:', error);
      toast.error('Failed to get current location. Please enter manually.');
    } finally {
      setGettingLocation(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.location.address.trim()) {
      newErrors.address = 'Location address is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);
      submitData.append('location[address]', formData.location.address);
      submitData.append('location[city]', formData.location.city);
      submitData.append('location[state]', formData.location.state);
      submitData.append('location[zipCode]', formData.location.zipCode);
      submitData.append('location[coordinates][type]', 'Point');
      submitData.append(
        'location[coordinates][coordinates][0]',
        formData.location.coordinates.coordinates[0]
      );
      submitData.append(
        'location[coordinates][coordinates][1]',
        formData.location.coordinates.coordinates[1]
      );

      // Append images
      images.forEach((image) => {
        submitData.append('images', image);
      });

      const response = await issueAPI.createIssue(submitData);
      toast.success('Issue reported successfully!');
      navigate(`/issues/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error(error.response?.data?.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-issue-page">
      <div className="container">
        <div className="page-header">
          <h1>Report an Issue</h1>
          <p>Help improve your community by reporting civic issues</p>
        </div>

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Issue Details</h2>

            <div className="form-group">
              <label htmlFor="title">
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief title describing the issue"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about the issue"
                rows="5"
                className={errors.description ? 'error' : ''}
              ></textarea>
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
              <small>{formData.description.length}/1000 characters</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? 'error' : ''}
                >
                  <option value="">Select a category</option>
                  {ISSUE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="error-message">{errors.category}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  {ISSUE_PRIORITY.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>

            <div className="location-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleGetCurrentLocation}
                disabled={gettingLocation}
              >
                <FaMapMarkerAlt />
                {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="address">
                Address <span className="required">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                placeholder="Street address or landmark"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="location.zipCode"
                  value={formData.location.zipCode}
                  onChange={handleChange}
                  placeholder="ZIP"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>
              Images <small>(Optional, max {FILE_UPLOAD.maxFiles} images)</small>
            </h2>

            <div className="image-upload-area">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="images" className="upload-label">
                <FaCamera />
                <span>Click to upload images</span>
                <small>JPEG, PNG, GIF, WEBP (Max 5MB each)</small>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;