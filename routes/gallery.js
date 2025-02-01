const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

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
router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file);
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update gallery photos
router.put('/:id/photos', protect, upload.array('photos'), async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const newPhotos = req.files.map(file => ({
      url: file.path,
      filename: file.filename
    }));

    gallery.photos = [...gallery.photos, ...newPhotos];
    await gallery.save();

    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove photo from gallery
router.delete('/:id/photos/:photoId', protect, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const photoIndex = gallery.photos.findIndex(
      photo => photo._id.toString() === req.params.photoId
    );

    if (photoIndex === -1) {
      return res.status(404).json({ message: 'Photo not found in gallery' });
    }

    // Get the photo to delete
    const photoToDelete = gallery.photos[photoIndex];

    // Remove the photo from cloudinary
    if (photoToDelete.public_id) {
      await cloudinary.uploader.destroy(photoToDelete.public_id);
    }

    // Remove the photo from the gallery
    gallery.photos.splice(photoIndex, 1);
    await gallery.save();

    res.json(gallery);
  } catch (error) {
    console.error('Error removing photo:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update gallery thumbnail
router.put('/:id/thumbnail', protect, upload.single('thumbnail'), async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Remove old thumbnail if exists
    if (gallery.thumbnail) {
      try {
        await fs.unlink(gallery.thumbnail);
      } catch (error) {
        console.error('Error deleting old thumbnail:', error);
      }
    }

    gallery.thumbnail = req.file.path;
    await gallery.save();

    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete gallery with confirmation
router.delete('/:id', protect, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Delete all photos
    for (const photo of gallery.photos) {
      try {
        await fs.unlink(photo.url);
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }

    // Delete thumbnail
    if (gallery.thumbnail) {
      try {
        await fs.unlink(gallery.thumbnail);
      } catch (error) {
        console.error('Error deleting thumbnail:', error);
      }
    }

    await gallery.remove();
    res.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
