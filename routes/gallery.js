const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

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
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.image;
    const result = await uploadToCloudinary(file.tempFilePath);

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image' });
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
