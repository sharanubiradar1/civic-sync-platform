const fs = require('fs').promises;
const path = require('path');

/**
 * Upload image to local storage
 * @param {string} filePath - Path to the file
 * @param {string} folder - Subfolder name
 * @returns {Promise<Object>} Upload result
 */
const uploadToLocalStorage = async (filePath, folder = 'issues') => {
  try {
    // Create folder if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // Get file details
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName);
    const fileNameWithoutExt = path.basename(fileName, fileExt);
    
    // Create unique filename
    const uniqueFileName = `${fileNameWithoutExt}-${Date.now()}${fileExt}`;
    const destinationPath = path.join(uploadDir, uniqueFileName);

    // Copy file to uploads directory
    await fs.copyFile(filePath, destinationPath);

    // Generate URL for accessing the image
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const imageUrl = `${baseUrl}/uploads/${folder}/${uniqueFileName}`;

    return {
      url: imageUrl,
      publicId: `${folder}/${uniqueFileName}`,
      format: fileExt.replace('.', ''),
      path: destinationPath
    };
  } catch (error) {
    console.error('Local storage upload error:', error);
    throw new Error('Failed to upload image to local storage');
  }
};

/**
 * Delete image from local storage
 * @param {string} publicId - File path relative to uploads directory
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromLocalStorage = async (publicId) => {
  try {
    const filePath = path.join(__dirname, '../../uploads', publicId);
    
    // Check if file exists
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      return { result: 'ok', deleted: publicId };
    } catch (error) {
      // File doesn't exist, return success anyway
      return { result: 'not found', deleted: publicId };
    }
  } catch (error) {
    console.error('Local storage delete error:', error);
    throw new Error('Failed to delete image from local storage');
  }
};

/**
 * Get file size
 * @param {string} filePath - Path to file
 * @returns {Promise<number>} File size in bytes
 */
const getFileSize = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
};

module.exports = {
  uploadToLocalStorage,
  deleteFromLocalStorage,
  getFileSize
};