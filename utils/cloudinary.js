const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

// Configure Cloudinary with hardcoded values
cloudinary.config({
  cloud_name: 'dpomxgqom',
  api_key: '536535896991842',
  api_secret: '6yPrf7oRU5b5kGWaf4uj-n-12zY'
});

const uploadToCloudinary = async (file) => {
  try {
    let result;
    
    if (typeof file === 'string') {
      // If file is a path string
      result = await cloudinary.uploader.upload(file, {
        resource_type: 'auto',
        folder: 'genx_gallery'
      });
    } else if (file.buffer) {
      // If file is a buffer (from memory)
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
      
      result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
        folder: 'genx_gallery'
      });
    } else if (file.path) {
      // If file is from disk
      result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto',
        folder: 'genx_gallery'
      });
    } else {
      throw new Error('Invalid file format');
    }
    
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  cloudinary // Export cloudinary instance for direct use
};
