const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary with hardcoded values
cloudinary.config({
  cloud_name: 'dpomxgqom',
  api_key: '536535896991842',
  api_secret: '6yPrf7oRU5b5kGWaf4uj-n-12zY'
});

const uploadToCloudinary = async (file) => {
  try {
    // Convert buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'genx_gallery'
    });
    
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary
};
