const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (file) => {
  try {
    console.log('Uploading to Cloudinary:', file);
    const result = await cloudinary.uploader.upload(file, {
      folder: 'genx',
      resource_type: 'auto'
    });
    console.log('Cloudinary upload result:', result);
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary
};
