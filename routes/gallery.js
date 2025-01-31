const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect, authorize } = require('../middleware/auth');
const fileUpload = require('express-fileupload');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Use fileUpload middleware
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Get all galleries
router.get('/', async (req, res) => {
  try {
    const galleries = await Gallery.find()
      .sort({ created_at: -1 });
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single gallery
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create gallery
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, thumbnail, photos, created_by } = req.body;
    
    const gallery = new Gallery({
      title,
      description,
      thumbnail,
      photos,
      created_by
    });

    const savedGallery = await gallery.save();
    res.status(201).json(savedGallery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload image
router.post('/upload', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Files:', req.files);
    
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.image;
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size too large. Maximum size is 10MB' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed' });
    }

    console.log('Uploading file:', {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
      tempFilePath: file.tempFilePath
    });

    const result = await uploadToCloudinary(file.tempFilePath);
    
    console.log('Upload successful:', result.secure_url);
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Delete gallery
router.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    res.status(500).json({ message: 'Error deleting gallery' });
  }
});

// Delete a photo from a gallery
router.delete('/:galleryId/photos/:photoId', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { galleryId, photoId } = req.params;

    // Find the gallery
    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Remove the photo from the gallery's photos array
    gallery.photos = gallery.photos.filter(photo => photo.id !== photoId);
    await gallery.save();

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
